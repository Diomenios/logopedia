var express = require('express');
var database = require('./database');
const mariadb = require('mariadb');

const http = require('http');

var app = express();

app.use('/api', database);

app.get('/', function(req, res) {
    res.sendFile('/public/html/acceuil.html', {root: __dirname });
})

.get('/activites', function(req, res) {
    res.sendFile('/public/html/activites.html', {root: __dirname });
})

.get('/acceuil', function(req, res) {
    res.sendFile('/public/html/acceuil.html', {root: __dirname });
})

.get('/activites/activite-orthographe', function(req, res) {
    res.sendFile('/public/html/activite-orthographe.html', {root: __dirname });
})

.get('/activites/activite-categorie', function(req, res) {
    res.sendFile('/public/html/activite-categorie.html', {root: __dirname });
})

.get('/admin', function(req, res) {
    res.sendFile('/public/html/admin.html', {root: __dirname });
})

// ... Tout le code de gestion des routes (app.get) se trouve au-dessus
.use('/static', express.static('public'))

.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});

app.listen(3000);
