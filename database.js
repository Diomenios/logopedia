require('dotenv').config();

var express = require('express');
var fs = require('fs');
var request = require('request');
var mariadb = require('mariadb/callback');
var mime = require('mime-types');
var uuidv5 = require('uuidv5');
var crypto = require('crypto');
var rateLimit = require('express-rate-limit');


/*******************  Set-up des variables des modules  ***********************/

var app = express();
var database = express.Router();
var limiter = new rateLimit({
  windowMs: 60*1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
});



const conn = mariadb.createConnection({host:process.env.HOST, user:process.env.U_NAME, password:process.env.PASSWORD, database:process.env.DATABASE});

const PATH = __dirname + '/public/';

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

/***************************  Zone de routing  ********************************/
app.enable('trust proxy');
app.use(limiter);

/**
* Recupere une image a partir de son nom d'origine
* Utilise la fonction getImageWithOriginalName pour recuperer l'image
*
* @param {String} nom  Le nom d'origine de l'image
*/
database.get('/image_nom', function(req, res) {
  if (req.query.nom === undefined) {
    sendMessage('Veuillez entrer le nom de l\'image', res);
  }
  else {
    getImageWithOriginalName(req.query.nom, res);
  }
});

/**
* Recupere une image a partir de son nom dans le dossier "images"
* Utilise la fonction readAndSendImage pour renvoyer l'image
*
* @param {String} guid  Le nom, dans le dossier "images", de la photo qu'on
*                           desire recuperer
*/
database.get('/image', (req, res) => {
  if (req.query.guid === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire un GUID pour retrouver l\'image !');
  }
  else {
    var parsing = req.query.guid.split(".");
    readAndSendImage(req.query.guid, parsing[parsing.length-1], res);
  }
})

/**
* Recupere le chemin menant a une image
*
* @param {String} guid  Le nom, dans le dossier "images", de la photo qu'on
*                           desire recuperer
*/
database.get('/image_path', (req, res) => {
  if (req.query.guid === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire un GUID pour retrouver l\'image !');
  }
  else {
    res.set('Content-Type', 'text/plain');
    res.send('/static/images/'+req.query.guid);
  }
});

/**
* Recupere dans la base de donnee toutes les images liees a une classe particuliere,
*   a partir du nom de celle-ci
*
* @param {String} classe  Le nom de la classe pour laquelle on veut recuperer les images
*/
database.get('/images', (req, res) => {
  if (req.query.classe === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire une classe !');
  }
  conn.query("SELECT classe_id from Classes WHERE classe_nom = ?",[req.query.classe], (err, rows) => {
    if (rows.length == 0) {
      res.set('Content-Type', 'text/plain');
      res.send('classe inconnue');
    }
    else{
      conn.query("SELECT image_nom, image_id, Images.type_id, classe_id from Images INNER JOIN Types ON Images.type_id = Types.type_id WHERE classe_id = ?",
                    [rows[0].classe_id], (err, rows) => {
        if (err) {
          throw err;
        }
        res.set('Content-Type', 'application/json');
        res.send(rows);
      });
    }
  });
});

/**
* Recupere dans la base de donnee la liste de toutes les classes d'images existantes
*/
database.get('/classes', (req, res) => {
  conn.query("SELECT * FROM Classes", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
});

/**
* Recupere dans la base de donnee la liste de toutes les classes d'images existantes
* Ordonne les classes par numero d'id
*/
database.get('/classes_order_id', (req, res) => {
  conn.query("SELECT * FROM Classes order by classe_id", (err, rows) => {
    if (err) {
      throw err;
    }
    sendJsons(rows, res);
  });
});

/**
* Recupere dans la base de donnee la liste de toutes les difficultes d'exercice existantes
*/
database.get('/difficultes', (req, res) => {
  conn.query("SELECT * FROM Difficultes", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
});

/**
* Recupere dans la base de donnee la liste de toutes les longueurs d'exercice existantes
*/
database.get('/longueurs', (req, res) => {
  conn.query("SELECT * FROM Longueurs", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
});

/**
* Recupere dans la base de donnee toutes les images liees a une classe particuliere,
*   a partir de l'id de celle-ci
*
* @param {Int} classe_id  L'id de la classe pour laquelle on veut recuperer les images
*/
database.get('/classe_images', (req, res) => {
  if (req.query.classe_id === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire l\'id d\'une classe !');
  }
  conn.query("SELECT image_nom, image_id, Images.type_id from Images INNER JOIN Types ON Images.type_id = Types.type_id WHERE classe_id = ?",
                [req.query.classe_id], (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
});

/**
* Recupere dans la base de donnee le nom d'une difficulte particuliere a l'aide du nombre de mots qu'elle implique
*
* @param {Int} nombre_mots  Le nombre de mots qu'implique la difficulte
*/
database.get('/select_difficulte', (req, res) => {
  if (req.query.nombre_mots === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire l\'id d\'une classe !');
  }
  else {
    conn.query("SELECT nom FROM Difficultes WHERE nombre_mots = ? ", [req.query.nombre_mots] , (err, rows) => {
      if (err) {
        throw err;
      }
      res.set('Content-Type', 'application/json');
      res.send(rows);
    });
  }
});

/**
* Recupere dans la base de donnee le nom d'une classe particuliere a l'aide de l'id de celle-ci
*
* @param {Int} classe_id  L'id de la classe dont on veut le nom
*/
database.get('/select_classe', (req, res) => {
  if (req.query.classe_id === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire l\'id d\'une classe !');
  }
  else {
    conn.query("SELECT classe_nom FROM Classes WHERE classe_id = ? ", [req.query.classe_id] , (err, rows) => {
      if (err) {
        throw err;
      }
      res.set('Content-Type', 'application/json');
      res.send(rows);
    });
  }
});

/**
* Recupere dans la base de donnee la liste des mots associes a un type particuliere
*
* @param {Int} type  L'id du type pour lequel on veut recuperer les mots
*/
database.get('/mots', (req, res) => {
  if (req.query.type === undefined) {
    sendMessage("veuillez introduire le type des mots que vous désirez récupérer", res);
  }
  else {
    conn.query("SELECT mot, distracteur FROM Mots WHERE type_id = ?", [req.query.type], (err, rows) => {
      if (err) {
        throw err;
      }
      res.set('Content-Type', 'application/json');
      res.send(rows);
    });
  }
});

/**
* Effectue la somme des images listees dans la database, liees a une classe particuliere
* Renvoie le resultat de la somme
*
* @param {Int} classe  L'id de la classe pour laquelle on souhaite sommer les images
*/
database.get('/somme_images', (req, res) => {
  if (req.query.classe === undefined) {
    sendMessage("veuillez introduire la classe des images à sommer", res);
  }
  else {
    conn.query("SELECT COUNT(*) AS result FROM Images INNER JOIN Types ON Images.type_id = Types.type_id WHERE classe_id = ?", [req.query.classe], (err, rows) => {
      if (err) {
        throw err;
      }
      res.set('Content-Type', 'application/json');
      res.send(rows);
    });
  }
});

/**
* Recupere les descriptions des diverses activites
*/
database.get('/activites_list', (req, res) => {
  conn.query("SELECT * FROM DescriptionActivites", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
});
/**
* Recupere les resultats
*/
database.get('/resultats', (req, res) => {
  conn.query("SELECT * FROM Resultats", (err, rows) => {
    if (err) {
      throw err;
    }
    sendJsons(rows, res);
  });
});
/**
* Recupere les patients 
*/
database.get('/patients', (req, res) => {
  conn.query("SELECT * FROM Patients", (err, rows) => {
    if (err) {
      throw err;
    }
    sendJsons(rows, res);
  });
});


/**
* Recupere un nombre defini d'images de classe (categorie) random
*
* @param {Int} nombre  Le nombre d'image que l'on desire recuperer
*/
database.get('/activites/categorie_random_images', (req, res) => {
  if (req.query.nombre === undefined) {
    sendError("vous n'avez pas préciser le nombre d'images désirée => /api/activite/categorie_random_images", res)
  }
  else {
    conn.query("SELECT image_nom AS nom,  classe_id AS categorie, type_nom AS type FROM Images INNER JOIN Types ON Images.type_id = Types.type_id", [req.query.classe], (err, rows) => {
      if (err) {
        throw err;
      }

      let number = parseInt(req.query.nombre);
      let imagesRandom = [];

      if (rows.length < number) {
        number = rows.length;
      }
      if (rows.length < 2*number) {
        shuffle(rows);
        for(let i = 0 ; i < number ; i++){
          imagesRandom.push(rows[i]);
        }
      }
      else{
        for(let i = 0 ; i < number ; i++){
          let rand = Math.round(Math.random()*(number-1));

          while (rows[rand] == "") {
            rand = Math.round(Math.random()*(number-1));
          }
          imagesRandom.push(rows[rand]);
          rows[rand] = "";
        }
      }

      sendJsons(imagesRandom, res);
    });
  }
});

/**
 * 
 * connexion a la DB 
 */
database.get('/first_root_user', (req, res) =>{
  if (req.query.validate === undefined || req.query.user === undefined || req.query.password === undefined) {
    sendMessage("Erreur, veuillez introduire l\'url sous la forme : /first_root_user?validate=<pass_key>&user=<username>&password=<mot_de_passe>", res);
  }
  else{
    if (req.query.validate != process.env.KEY_USER_PASSWORD) {
      sendMessage("Erreur, vous n\'avez pas l\'autorisation de faire cette requête !", res);
    }
    else{
      conn.query("SELECT COUNt(*) as count from Users WHERE root = 1", (err, rows) =>{
        if (err) {
          throw err;
        }
        if (rows[0].count != 0) {
          sendMessage("Un Utilisateur root a déjà été enregistré", res);
        }
        else{
          var salt = genRandomString(24); /** Gives us salt of length 24 */
          var passwordData = sha512(req.query.password, salt);
          conn.query("INSERT INTO Users (user_name, password, salt, root) VALUES (?, ?, ?, 1)", [req.query.user, passwordData.passwordHash, passwordData.salt], (err, rows) =>{
            if (err) {
              throw err;
            }
            sendJsons(rows, res);
          });
        }
      });
    }
  }
});

/**
 * 
 * ajout ou confirmation d'un utilisateur
 */
database.get('/addOrConfirmUser', (req, res) => {
  if (req.query.nom === undefined || req.query.prenom === undefined || req.query.email === undefined || req.query.age === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/addOrConfirmUser?nom=<patient_name>&prenom=<patient_prenom>&email=<patient_email>&age=<patient_age>", res);
  }
  else {
    conn.query("SELECT numero_patient from Patients WHERE nom=? AND prenom=? AND email=? AND age=?", [req.query.nom, req.query.prenom, req.query.email, req.query.age],(err, rows) =>{
      if (err) {
        throw err;
      }
      if (rows[0] === undefined) {
        conn.query("INSERT INTO Patients (nom, prenom, email, age) VALUES (?, ?, ?, ?)", [req.query.nom, req.query.prenom, req.query.email, req.query.age], (err, rows) =>{
          if (err) {
            throw err;
          }
          conn.query("SELECT numero_patient from Patients WHERE nom=? AND prenom=? AND email=? AND age=?", [req.query.nom, req.query.prenom, req.query.email, req.query.age],(err, rows) =>{
            if (err) {
              throw err;
            }
            sendJsons({status:1, numero_patient:rows[0].numero_patient}, res);
          });
        });
      }
      else {
        sendJsons({status:1, numero_patient:rows[0].numero_patient}, res);
      }
    });
  }
});

/**
 * 
 * ajout de resultat dans la Database
 */
database.get('/add_Resultats', (req, res) => {
  if (req.query.numero_patient === undefined || req.query.resultat_image === undefined || req.query.nombre_image === undefined|| req.query.feedback === undefined ||
        req.query.date_activite === undefined || req.query.id_activites === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/add_Resultats?numero_patient=<patient_number>&resultat_image=<resultat>&nombre_image=<number_of_sequence>&"+
                  "feedback=<image_feedback>&date_activite=<date>&id_activites=<activity_id>", res);
                  console.log("error");
  }
  else {
    conn.query("INSERT INTO Resultats (numero_patient, resultat_image, nombre_image, feedback, date_activite, id_activites) VALUES (?, ?, ?, ?, ?, ?)",
                  [req.query.numero_patient, req.query.resultat_image, req.query.nombre_image, req.query.feedback, req.query.date_activite, req.query.id_activites], (err, rows) =>{
      if (err) {
        throw err;
      }
      sendJsons({status:1, message:"la requête a bien été ajoutée"}, res);
    });
  }
});

/*----------------------------------------------------Debut de la PARTIE ADMINISTRATION----------------------------------------------------*/

/**
 * 
 * cette partie partie du code est dedie a l'API utilisable uniquement par l'administration du site, 
 * c'est dans cette partie que l'admin ferra des requêtes a la database.
 */


database.get('/admin/tables_name', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/tables_name?admin_user=<username>&admin_password=<user_password>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "SHOW tables",[], res);
  }
});

database.get('/admin/table_x', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.table === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/table_x?admin_user=<username>&admin_password=<user_password>&table=<table_name>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "SELECT * FROM "+req.query.table,[], res);
  }
});
/**
 * 
 * recuperer les donnes d'une colonne dans un tableau via l'API admin
 */
database.get('/admin/table_columns_x', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.table === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/table_column_x?admin_user=<username>&admin_password=<user_password>&table=<table_name>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "select COLUMN_NAME, IS_NULLABLE, EXTRA from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME=?",[req.query.table], res);
  }
});

/**
 * 
 * ajout d'une classe via l'API admin
 */
database.get('/admin/add_Classes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.classe_nom === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Classes?admin_user=<username>&admin_password=<user_password>&classe_nom=<class_name>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Classes (classe_nom) VALUES (?)",[req.query.classe_nom], res);
  }
});

/**
 * 
 * ajout d'une description d'activite via l'API admin
 */
database.get('/admin/add_DescriptionActivites', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.activite_url === undefined || req.query.activite_nom === undefined || req.query.description === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_DescriptionActivites?admin_user=<username>&admin_password=<user_password>&activite_url=<activity_url>" +
                    "&activite_nom=<activity_name&description=<activity_description>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO DescriptionActivites (activite_url, activite_nom, description) VALUES (?, ?, ?)",
                            [req.query.activite_url, req.query.activite_nom, req.query.description], res);
  }
});

/**
 * 
 * ajout d'une difficulte via l'API admin
 */
database.get('/admin/add_Difficultes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined || req.query.nombre_mots === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Difficultes?user=<username>&password=<user_password>&nom=<difficulty_name>&nombre_mots=<number_of_words>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Difficultes (nom, nombre_mots) VALUES (?, ?)",[req.query.nom, req.query.nombre_mots], res);
  }
});
/**
 * 
 * ajout d'une longueur d'activite via l'API admin
 */
database.get('/admin/add_Longueurs', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined || req.query.nombre_images === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Longueurs?admin_user=<username>&admin_password=<user_password>&nom=<length_name>&nombre_images=<number_of_pictures>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Longueurs (nom, nombre_images) VALUES (?, ?)",[req.query.nom, req.query.nombre_images], res);
  }
});
/**
 * 
 * ajout d'un mot via l'API admin
 */
database.get('/admin/add_Mots', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.mot === undefined || req.query.distracteur === undefined || req.query.type_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Mots?admin_user=<username>&admin_password=<user_password>&mot=<word>&distracteur=<1(false)_or_0(true)>&type_id=<type_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Mots (mot, distracteur, type_id) VALUES (?, ?, ?)",[req.query.mot, req.query.distracteur, req.query.type_id], res);
  }
});
/**
 * 
 * ajout d'un type via l'API admin
 */
database.get('/admin/add_Types', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.type_nom === undefined || req.query.classe_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Types?admin_user=<username>&admin_password=<user_password>&type_nom=<type_name>&classe_id=<classe_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Types (type_nom, classe_id) VALUES (?, ?)",[req.query.type_nom, req.query.classe_id], res);
  }
});
/**
 * 
 * ajout d'un user (root ou non) via l'API admin
 */
database.get('/admin/add_Users', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.user_name === undefined || req.query.password === undefined || req.query.root === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Users?admin_user=<username>&admin_password=<user_password>&user_name=<new_user_name>&password=<new_user_password>" +
                      "&root=<1(root)_or_0(casual)>", res);
  }
  else {
    var password_salt = genRandomString(24); /** Gives us salt of length 24 */
    var passwordData = sha512(req.query.password, password_salt);
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Users (user_name, password, salt, root) VALUES (?, ?, ?, ?)"
                              ,[req.query.user_name, passwordData.passwordHash, password_salt, req.query.root], res);
  }
});
/**
 * 
 * mise a jour d'une classe via l'API admin
 */
database.get('/admin/update_Classes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.classe_nom === undefined || req.query.classe_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Classes?admin_user=<username>&admin_password=<user_password>&classe_nom=<class_name>" +
                    "&classe_id=<class_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Classes SET classe_nom=? WHERE classe_id=?",[req.query.classe_nom, req.query.classe_id], res);
  }
});

/**
 * 
 * mise a jour d'une description d'activite via l'API admin
 */
database.get('/admin/update_DescriptionActivites', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.activite_url === undefined || req.query.activite_nom === undefined ||
          req.query.description === undefined || req.query.activite_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_DescriptionActivites?admin_user=<username>&admin_password=<user_password>&activite_url=<activity_url>" +
                    "&activite_nom=<activity_name>&description=<activity_description>&activite_id=<activity_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE DescriptionActivites SET activite_url=?, activite_nom=?, description=?" +
                              "WHERE activite_id=?", [req.query.activite_url, req.query.activite_nom, req.query.description, req.query.activite_id], res);
  }
});

/**
 * 
 * mise a jour de la difficulte via l'API admin
 */
database.get('/admin/update_Difficultes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined || req.query.nombre_mots === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Difficultes?admin_user=<username>&admin_password=<user_password>&nom=<difficulty_name>&nombre_mots=<number_of_words>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Difficultes SET nombre_mots=? WHERE nom=?",[req.query.nombre_mots, req.query.nom], res);
  }
});
/**
 * 
 * mise a jour de la longueur des activites via l'API admin
 */
database.get('/admin/update_Longueurs', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined || req.query.nombre_images === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Longueurs?admin_user=<username>&admin_password=<user_password>&nom=<length_name>&nombre_images=<number_of_pictures>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Longueurs SET nombre_images=? WHERE nom=?",[req.query.nombre_images, req.query.nom], res);
  }
});
/**
 * 
 * mise a jour d'un mot via l'API admin
 */
database.get('/admin/update_Mots', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.mot === undefined || req.query.distracteur === undefined || req.query.type_id === undefined ||
          req.query.mot_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Mots?admin_user=<username>&admin_password=<user_password>&mot=<word>&distracteur=<1(false)_or_0(true)>" +
                    "&type_id=<type_id>&mot_id=<mot_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Mots SET mot=?, distracteur=?, type_id=? WHERE mot_id=?",
                            [req.query.mot, req.query.distracteur, req.query.type_id, req.query.mot_id], res);
  }
});

/**
 * 
 * ajout d'un patient via l'API admin
 */
database.get('/admin/add_Patients', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined || req.query.prenom === undefined || req.query.email === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/add_Patients?admin_user=<username>&admin_password=<user_password>&nom=<patient_name>&prenom=<patient_prenom>" +
                  "&email=<patient_email>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "INSERT INTO Patients (nom, prenom, email) VALUES (?, ?, ?)",[req.query.nom, req.query.prenom, req.query.email], res);
  }
});

/**
 * 
 * mise a jour d'un type via l'API admin
 */
database.get('/admin/update_Types', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.type_nom === undefined || req.query.classe_id === undefined || req.query.type_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Types?admin_user=<username>&admin_password=<user_password>&type_nom=<type_name>&classe_id=<classe_id>" +
                    "&type_id=<type_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Types SET type_nom=?, classe_id=? WHERE type_id=?",[req.query.type_nom, req.query.classe_id, req.query.type_id], res);
  }
});

/**
 * 
 * mise a jour des donnees d'un utilisateur via l'API admin
 */
database.get('/admin/update_Users', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.user_name === undefined || req.query.password === undefined || req.query.root === undefined ||
          req.query.user_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Users?admin_user=<username>&admin_password=<user_password>&user_name=<new_user_name>&password=<new_user_password>" +
                      "&root=<1(root)_or_0(casual)>&user_id=<user_id>", res);
  }
  else {
    conn.query("SELECT user_id FROM Users WHERE user_name=?", [req.query.admin_user], (err, rows) =>{
      if (err) {
        throw err;
      }
      if (rows[0].user_id == req.query.user_id) {
        sendJsons({boolean: 0, message: "Permission refusée : vous essayez de modifier l'utilisateur avec les droits d'admin que vous utilisez pour le moment !"}, res);
      }
      else{
        var password_salt = genRandomString(24); /** Gives us salt of length 24 */
        var passwordData = sha512(req.query.password, password_salt);
        secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "UPDATE Users SET user_name=?, password=?, salt=?, root=? WHERE user_id=?"
                                  ,[req.query.user_name, passwordData.passwordHash, password_salt, req.query.root, req.query.user_id], res);
      }
    });
  }
});

/**
 * 
 * suppresion d'une classe via l'API admin
 */
database.get('/admin/delete_Classes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.classe_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_Classes?admin_user=<username>&admin_password=<user_password>&classe_id=<elem_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Classes WHERE classe_id=?",[req.query.classe_id], res);
  }
});


/**
 * 
 * suppresion de la description d'une activite l'API admin
 */
database.get('/admin/delete_DescriptionActivites', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.activite_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_DescriptionActivites?admin_user=<username>&admin_password=<user_password>&activite_id=<activity_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM DescriptionActivites WHERE activite_id=?", [req.query.activite_id], res);
  }
});

/**
 * 
 * suppresion d'une difficulte l'API admin
 */
database.get('/admin/delete_Difficultes', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_Difficultes?admin_user=<username>&admin_password=<user_password>&nom=<difficulty_name>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Difficultes WHERE nom=?",[req.query.nom], res);
  }
});

database.get('/admin/delete_Longueurs', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.nom === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_Longueurs?admin_user=<username>&admin_password=<user_password>&nom=<length_name>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Longueurs WHERE nom=?",[req.query.nom], res);
  }
});

/**
 * 
 * suppresion d'un mot via l'API admin
 */
database.get('/admin/delete_Mots', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.mot_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_Mots?admin_user=<username>&admin_password=<user_password>&mot_id=<mot_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Mots WHERE mot_id=?",[req.query.mot_id], res);
  }
});

/**
 * 
 * suppresion d'un type l'API admin
 */
database.get('/admin/delete_Types', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.type_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/delete_Types?admin_user=<username>&admin_password=<user_password>&type_id=<type_id>", res);
  }
  else {
    secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Types WHERE type_id=?",[req.query.type_id], res);
  }
});

/**
 * 
 * suppresion d'un utilisateur l'API admin
 */
database.get('/admin/delete_Users', (req, res) => {
  if (req.query.admin_user === undefined || req.query.admin_password === undefined || req.query.user_id === undefined) {
    sendMessage("Veuillez introduire la requête sous la forme : /api/admin/update_Users?admin_user=<username>&admin_password=<user_password>&user_id=<user_id>", res);
  }
  else {
    conn.query("SELECT user_id FROM Users WHERE user_name=?", [req.query.admin_user], (err, rows) =>{
      if (err) {
        throw err;
      }
      if (rows[0].user_id == req.query.user_id) {
        sendJsons({boolean: 0, message: "Permission refusée : vous essayez de modifier l'utilisateur avec les droits d'admin que vous utilisez pour le moment !"}, res);
      }
      else{
        secureDatabaseQuery(req.query.admin_user, req.query.admin_password, "DELETE FROM Users WHERE user_id=?", [req.query.user_id], res);
      }
    });
  }
});

/*----------------------------------------------------FIN de la PARTIE ADMINISTRATION----------------------------------------------------*/

/**
* Fait le tri dans les images se trouvant dans le dossier "public/images"
* Laisse intouche les images dont le nom se trouve a la fois dans la base de donnee
*   et dans le dossier d'Images
* Utilise la fonction formatImage pour inserer dans la base de donnees, les images ne
*   s'y trouvant pas
*/
database.get("/outils/synchro", (req, res) =>{
  fs.readdir(__dirname+'/public/images', function (err, files) {
    if (err){
      throw err;
    }

    for (let index in files) {
      conn.query("SELECT COUNt(*) as count from Images WHERE image_nom = ?", [files[index]], (err, rows) =>{
        if (err) {
          throw err;
        }
        if (rows[0].count == 0) {
          formatImage(files[index]);
        }
      });
    }

    res.set('Content-Type', 'text/plain');
    res.send(files);
  });
});

database.get("/outils/validate_root_user", (req, res) =>{
  if (req.query.admin_password === undefined || req.query.admin_user === undefined) {
    sendJsons({boolean:0, message: "Erreur, veuillez introduire l\'url sous la forme : /outils/show_password?sha=<sha_password>&user=<username>"}, res);
  }
  else{
    conn.query("SELECT salt, password, root FROM Users WHERE user_name=?", [req.query.admin_user], (err, rows) =>{
      if (err) {
        throw err;
      }
      if (rows[0] === undefined) {
        sendJsons({boolean: 0, message: "Votre utilisateur n'existe pas, veuillez recommencer"}, res);
      }
      else{
        let passwordData = sha512(req.query.admin_password, rows[0].salt);
        if (passwordData.passwordHash == rows[0].password && rows[0].root == 1) {
          sendJsons({boolean: 1}, res);
        }
        else {
          if (passwordData.passwordHash != rows[0].password) {
            sendJsons({boolean: 0, message: "Votre mot de passe ou votre utilisateur est incorrect"}, res);
          }
          else{
            sendJsons({boolean: 0, message: "Vous n'avez pas les permissions d'accéder à cette interface"}, res);
          }
        }
      }
    });
  }
});

/**
* Insere une image, a l'aide de son url, dans le dossier "public/images", ainsi que
*   dans la base de donnees
*
* @param {String} nom   OPTIONNEL : Le nom que l'on veut donner a l'image.  Attention ce
*                         ne sera pas le nom de l'image dans le dossier "public/images",
*                         mais ce sera le nom qu'elle aura si on veut l'importer autre part
* @param {String} type  Le nom du type auquel l'image appartient
* @param {String} url   L'url de l'image
*/
database.get('/input', (req, res) =>{
  if (req.query.url === undefined || req.query.type === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire une requête sous la forme : /input?type=param1 & url=url_image');
  }
  else{
    var requestSettings = {
          url: req.query.url,
          method: 'GET',
          encoding: null
    };

    request(requestSettings, function(error, response, body) {

        let extension = mime.extension(response.headers['content-type']);
        if ( extension == 'jpeg') {
          extension = 'jpg';
        }

        checkValidTypeUrl(req.query.url, req.query.nom, extension, req.query.type, res, body);
    });
  }
});

database.get('/req_number', (req, res) => {
  conn.query("SELECT COUNT(*) as count FROM Users WHERE root=1", [req.query.user], (err, rows) =>{
    if (err) {
      throw err;
    }
    sendMessage("nombre de paramètres = " + rows[0].count, res);
  });
});
/******************************  Zone des fonctions  **************************/

/**
* Insere une image dans la base de donnees
*
* @param {String} name         Le nom (GUID) de l'image dans le dossier "public/images"
* @param {Int}    type         L'id du type auquel l'image appartient
* @param {String} extension    L'extension de l'image
* @param {String} nom_origine  OPTIONNEL : Le nom d'origine de l'image
*/
function insertImageIntoDatabase(name, type, extension, nom_origine){
  if (nom_origine === undefined) {
    conn.query("INSERT INTO Images(image_nom, image_extension, type_id) value (?, ?, ?)",
                [name, extension, type], (err, res) => {
       if(err){
         throw err;
       }
       console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
     });
  }
  else {
  conn.query("INSERT INTO Images(image_nom, image_original_nom, image_extension,type_id) value (?, ?, ?, ?)",
                [name, nom_origine+'.'+extension, extension, type], (err, res) => {
       if(err){
         throw err;
       }
       console.log(res);
     });
  }
}

/**
* Renvoie une image a partir de son nom d'origine
*
* @param {String} nom  Le nom d'origine de l'image
* @param {Object} res  L'objet representant la reponse HTTP d'une app ExpressJS
*/
function getImageWithOriginalName(nom, res) {
  conn.query("SELECT image_nom, image_id, image_extension from Images WHERE image_original_nom = ?", [nom], (err, row) => {
    if(err){
      throw err;
    }
    if (row.length == 0) {
      res.set('Content-Type', 'text/plain');
      res.send('L\image avec le nom  : ' + nom + ' est introuvable !');
    }
    else if (row.length > 1) {
      res.set('Content-Type', 'text/plain');
      res.send('Plusieurs images ont été trouvée avec le nom  : ' + nom +
              ' utilisé l\'url /api/image_id?id=id_image pour la retrouver' + row);
    }
    else {
      fs.readFile(__dirname+'/public/images/'+ row[0].image_nom, function(err, data){
        if (err) {
          throw err;
        }
        else{
          res.set('Content-Type', 'image/'+row[0].image_extension);
          res.send(data);
        }
      });
    }
  });
}

/**
* Renvoie une image a partir de son nom (GUID) dans le dossier "public/images"
*
* @param {String} guid       Le nom d'origine de l'image dans le dossier "public/images"
* @param {String} extension  L'extension de l'image
* @param {Object} res        L'objet representant la reponse HTTP d'une app ExpressJS
*/
function readAndSendImage(guid, extension, res){
  fs.readFile(__dirname+'/public/images/'+ guid, function(err, data){
    if (err) {
      throw err;
    }
    else{
      res.set('Content-Type', 'image/'+ extension);
      res.send(data);
    }
  });
}

/**
* Renvoie un message en texte plein
*
* @param {String} message  Le message que l'on souhaite envoyer
* @param {Object} res      L'objet representant la reponse HTTP d'une app ExpressJS
*/
function sendMessage(message, res){
  res.set('Content-Type', 'text/plain');
  res.send(message);
}

function sendError(message, res){
  res.set('Content-Type', 'application/json');
  res.send({code:666, contenu: message});
}

function sendJsons(object, res){
  res.set('Content-Type', 'application/json');
  res.send(object);
}

/**
* Transforme une image ayant le format <nom_de_l'image>.<type_de_l'image>.<extension_de_l'image>
*   en un nouveau nom qui pourra etre inserer dans la base de donnees
* Verifie que l'extension de l'image est correcte
* Affiche un message dans la console si l'image n'a pas une extention correcte
* Utilise la fonction checkValidType pour verifier si le type de l'image existe
*
* @param {String} pictureName  Le nom original de l'image a formater
*/
function formatImage(pictureName){
  let splitName = pictureName.split(".");

  if (splitName[splitName.length-1] == 'jpg' || splitName[splitName.length-1] == 'png' || splitName[splitName.length-1] == 'jpeg') {

    let originalName = "";
    for (let i = 0; i < splitName.length-2; i++) {
      if (i==0) {
        originalName += splitName[i];
      }
      else {
        originalName += "." + splitName[i];
      }
    }
    checkValidType(originalName, splitName[splitName.length-1], splitName[splitName.length-2]);
  }
  else{
      console.log("format non conforme, l'opération a été abandonnée pour la photo : " + pictureName);
  }
}

/**
* Verifie si le type de l'image existe bien dans la base de donnee
* Affiche un message dans la console si le type de l'image n'existe pas
* Utilise la fonction insertImageIntoDatabase pour inserer l'image dans la base de donnees
* Utilise la fonction writeImage pour sauvegarder l'image dans le dossier "public/images"
*
* @param {String} pictureUrl        L'url de l'image a inserer
* @param {String} pictureName       Le nom d'origine de l'image a inserer
* @param {String} pictureExtension  L'extension de l'image a inserer
* @param {String} pictureType       Le type de l'image a inserer
* @param {Object} res               L'objet representant la reponse HTTP d'une app ExpressJS
* @param {Object} body              Le corps d'une requete HTTP (contenant les donnees de
*                                     l'image dans ce cas)
*/
function checkValidTypeUrl(pictureUrl, pictureName, pictureExtension, pictureType, res, body){
  conn.query("SELECT type_id from Types WHERE type_nom = ?", [pictureType], (err, rows) => {
    if (err) {
      throw err;
    }
    if (rows.length === 0) {
      console.log("L'image " + pictureName+pictureType+pictureExtension + " est dans une catégorie non définie dans la Database")
    }
    else{
      let newPictureName = uuidv5('url', pictureUrl) + "." + pictureType + "." + pictureExtension;
      insertImageIntoDatabase(newPictureName, rows[0].type_id, pictureExtension, pictureName);
      writeImage(newPictureName, body, res, sendMessage);
    }
  });
}

/**
* Verifie si le type de l'image existe bien dans la base de donnee
* Affiche un message dans la console si le type de l'image n'existe pas
* Utilise la fonction insertImageIntoDatabase pour inserer l'image dans la base de donnees
* Utilise la fonction renameImage pour renommer l'image avec un nom correct (guid)
*
* @param {String} pictureName       Le nom d'origine de l'image a inserer
* @param {String} pictureExtension  L'extension de l'image a inserer
* @param {String} pictureType       Le type de l'image a inserer
*/

function checkValidType(pictureName, pictureExtension, pictureType){
  conn.query("SELECT type_id from Types WHERE type_nom = ?", [pictureType], (err, rows) => {
    if (err) {
      throw err;
    }
    if (rows.length === 0) {
      console.log("L'image " + pictureName+pictureType+pictureExtension + " est dans une catégorie non définie dans la Database")
    }
    else{
      let newPictureName = uuidv5('X500', pictureName+pictureType+pictureExtension) + "." + pictureType + "." + pictureExtension;
      insertImageIntoDatabase(newPictureName, rows[0].type_id, pictureExtension, pictureName);
      renameImage(newPictureName, pictureName + "." + pictureType + "." + pictureExtension);
    }
  });
}

/**
* Renomme une image se trouvant dans le dossier "public/images"
*
* @param {String} newName  Le nouveau nom de l'image a renommer
* @param {String} oldName  L'ancien nom de l'image a renommer
*/
function renameImage(newName, oldName){
  fs.rename(__dirname+"/public/images/"+oldName, __dirname+"/public/images/"+newName, function(err){
    if (err) {
      throw err;
    }
  });
}

/**
* Sauvegarde une nouvelle image dans le dossier "public/images"
*
* @param {String}   pictureName  Le nom de l'image a sauvegardee
* @param {Object}   res          L'objet representant la reponse HTTP d'une app ExpressJS
* @param {Object}   body         Le corps d'une requete HTTP (contenant les donnees de
*                                  l'image dans ce cas)
* @param {Function} callback     La fonction a appeler une fois cette fonction finie :
*                                  dans ce cas-ci sendMessage
*/
function writeImage(pictureName, body, res, callback){
  fs.writeFile(__dirname+'/public/images/'+pictureName, body, function(err){
    if (err) {
      throw err;
    }
    if (callback != undefined && res != undefined) {
      callback('image sauvegardée sous le nom de : ' +pictureName, res);
    }
  });
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function secureDatabaseQuery(user, password, query, queryDatas, res){
  conn.query("SELECT salt, password, root FROM Users WHERE user_name=?", [user], (err, rows) =>{
    if (err) {
      throw err;
    }
    if (rows[0] === undefined) {
      sendJsons({boolean: 0, message: "Votre utilisateur n'existe pas, veuillez recommencer"}, res);
    }
    else{
      let passwordData = sha512(password, rows[0].salt);
      if (passwordData.passwordHash == rows[0].password && rows[0].root == 1) {
        conn.query(query, queryDatas, (err, rows) =>{
          if (err) {
            throw err;
          }
          sendJsons({boolean: 1, requestBody: rows}, res);
        });
      }
      else {
        sendJsons({boolean: 0, message: "Permission denied"}, res);
      }
    }
  });
}

module.exports = database;
