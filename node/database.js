require('dotenv').config();
var express = require('express');
var fs = require('fs');
var request = require('request');
var mariadb = require('mariadb/callback');
var app = express();
var mime = require('mime-types');
var uuidv5 = require('uuidv5');

var database = express.Router();
const conn = mariadb.createConnection({host:process.env.HOST, user:process.env.USERNAME, password:process.env.PASSWORD, database:process.env.DATABASE});

const PATH = __dirname + '/public/';


/*conn.query("SELECT 1 as val", (err, rows) => {
    if(err) throw err;
     console.log(rows); //[ {val: 1}, meta: ... ]
     conn.query("INSERT INTO Classes(classe_nom) value (?)", ["rat"], (err, res) => {
       if(err){
         throw err;
       }
       console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
       conn.end();
     });
 });
/*pool.getConnection()
.then(conn =>{
  conn.query("Select * from Classes")
  .then((rows) => {
    res.set('Content-Type', 'application/json');
    res.send(rows);
    conn.end();
  })
});*/

database.get('/image_nom', function(req, res) {
  if (req.query.nom === undefined) {
    throw 'veuillez entrer le nom de l\'image';
  }
  else {
    getImageWithOriginalName(req.query.nom, res);
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
})

.get('/mime', (req, res) =>{
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
});

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

module.exports = database;
