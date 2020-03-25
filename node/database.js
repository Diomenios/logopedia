require('dotenv').config();
var express = require('express');
var fs = require('fs');
var request = require('request');
var mariadb = require('mariadb/callback');
var mime = require('mime-types');
var uuidv5 = require('uuidv5');

var app = express();
var database = express.Router();
const conn = mariadb.createConnection({host:process.env.HOST, user:process.env.USERNAME, password:process.env.PASSWORD, database:process.env.DATABASE});

const PATH = __dirname + '/public/';

/***************************  Zone de routing  ********************************/

database.get('/image_nom', function(req, res) {
  if (req.query.nom === undefined) {
    sendMessage('Veuillez entrer le nom de l\'image', res);
  }
  else {
    getImageWithOriginalName(req.query.nom, res);
  }
});

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

database.get('/image_path', (req, res) => {
  if (req.query.guid === undefined) {
    res.set('Content-Type', 'text/plain');
    res.send('Veuillez introduire un GUID pour retrouver l\'image !');
  }
  else {
    res.set('Content-Type', 'text/plain');
    res.send('/static/images/'+req.query.guid);
  }
})

.get('/images', (req, res) => {
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
})

.get('/classes', (req, res) => {
  conn.query("SELECT * FROM Classes", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
})

.get('/difficultes', (req, res) => {
  conn.query("SELECT * FROM Difficultes", (err, rows) => {
    if (err) {
      throw err;
    }
    res.set('Content-Type', 'application/json');
    res.send(rows);
  });
})

.get('/classe_images', (req, res) => {
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
})

.get('/select_difficulte', (req, res) => {
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
})

.get('/select_classe', (req, res) => {
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
})


.get('/mots', (req, res) => {
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
})

.get('/input', (req, res) =>{
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
        let name = uuidv5('url', req.query.url);

        if ( extension == 'jpeg') {
          extension = 'jpg';
        }

        name += '.' + extension;

        insertImage(name, req.query.type, req.query.nom, extension);

        fs.writeFile(__dirname+'/public/images/'+name, body, function(err){
          if (err) {
            throw err;
          }
          console.log("image save");
          res.set('Content-Type', 'text/plain');
          res.send('image sauvegardée sous le nom de : ' + name);
        });
    });
  }
});

/******************************  Zone des fonctions  **************************/

function insertImage(name, type, nom_origine, extension){
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
      console.log(row[0].image_nom);
      fs.readFile(__dirname+'/public/images/'+ row[0].image_nom, function(err, data){
        if (err) {
          throw err;
        }
        else{
          console.log('image/'+row[0].image_extension);
          res.set('Content-Type', 'image/'+row[0].image_extension);
          res.send(data);
        }
      });
    }
  });
}

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

function sendMessage(message, res){
  res.set('Content-Type', 'text/plain');
  res.send(message);
}

module.exports = database;

/**********************  Zone des codes de testing  *************************/

/*.get('/mime', (req, res) =>{
  if (req.query.url === undefined) {
    throw 'veuillez entrer l\'url de l\'image à télécharger';
  }
  else{
    var requestSettings = {
          url: req.query.url,
          method: 'GET',
          encoding: null
    };

    request(requestSettings, function(error, response, body) {
      res.set('Content-Type', 'text/plain');
      res.send('image sauvegardée sous le nom de : ' + mime.extension(response.headers['content-type']));
    });
  }
});*/

/*.get('/mots', (req, res) => {
  if (req.query.type === undefined) {
    sendMessage("veuillez introduire le type des mots que vous désirez récupérer", res);
  }
  else {
    conn.query("SELECT type_id from Types WHERE type_nom = ?",[req.query.type], (err, rows) => {
      if (rows.length == 0) {
        sendMessage('type inconnu', res);
      }
      else{
        conn.query("SELECT mot, distracteur FROM Mots WHERE type_id = ?", [rows[0].type_id], (err, rows) => {
          if (err) {
            throw err;
          }
          res.set('Content-Type', 'application/json');
          res.send(rows);
        });
      }
    });
  }
})*/
