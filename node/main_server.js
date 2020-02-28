var express = require('express');
require('dotenv').config();

const mariadb = require ('mariadb/callback');
const http = require('http');

const conn = mariadb.createConnection({host: process.env.host, user: process.env.user, password: process.env.password, database: process.env.database});

conn.query("SELECT * from test", (err, rows) => {
      console.log(rows); //[ {val: 1}, meta: ... ]
      console.log(rows[1].nom);
      conn.end();
  });


var app = express();

app.get('/', function(req, res) {
    res.sendFile('/public/acceuil.html', {root: __dirname });
})
.get('/activites', function(req, res) {
    res.sendFile('/public/activites.html', {root: __dirname });
})
.get('/acceuil', function(req, res) {
    res.sendFile('/public/acceuil.html', {root: __dirname });
})

.get('/activites/orthographe', function(req, res) {
    res.sendFile('/public/activite-orthographe.html', {root: __dirname });
})

// ... Tout le code de gestion des routes (app.get) se trouve au-dessus
.use('/static', express.static('public'))

.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

app.listen(3000);
