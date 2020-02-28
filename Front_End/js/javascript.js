'use strict'

function init(){}

function connexion(){
	let connect = '<div class="row">'
					+'<div class="col-sm-9 col-md-7 col-lg-5 mx-auto"><div class="card card-signin my-5"><div class="card-body">'
					+'<h5 class="card-title text-center">Sign In</h5><form class="form-signin"><div class="form-label-group">'
					+'<input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>'
					+'<label for="inputEmail">Email address</label></div><div class="form-label-group">'
					+'<input type="password" id="inputPassword" class="form-control" placeholder="Password" required>'
					+'<label for="inputPassword">Password</label></div><div class="custom-control custom-checkbox mb-3">'
					+'<input type="checkbox" class="custom-control-input" id="customCheck1">'
					+'<label class="custom-control-label" for="customCheck1">Remember password</label></div>'
					+'<button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign in</button>'
					+'<hr class="my-4"></form></div></div></div></div>'
	document.getElementById("boite").innerHTML = connect;
}
//var tabPhotoProfil = ["../img/photo_de profil_test.jpg","../img/photo_de profil_test2.jpg"];
function InformationLogopede() {
	var sectionLogo = document.getElementById("section_logopedie");
	var elmnt = document.getElementById("info_logopede");
	var nombreLogo = 5; // Modifier il faut remplacer 5 par un lien avec la BD
	var i;
	for( i = 0; i < nombreLogo; i++){
		var cln = elmnt.cloneNode(true);
		sectionLogo.appendChild(cln);
	}
  }

  function NewSite() {
	var sectionNews = document.getElementById("section_news");
	var elmnt = document.getElementById("news_site");
	var nombreLogo = 5; // Modifier il faut remplacer 5 par un lien avec la BD
	var i;
	for( i = 0; i < nombreLogo; i++){
		var cln = elmnt.cloneNode(true);
		sectionNews.appendChild(cln);
	}
  }

  function BoutonActivites() {
	var nomActivité = ["Vocabulaire","Drag et Drop"] // Modofier avec la BD
	var boite = document.getElementById("boite");
	var elmnt = document.getElementById("bouton_activités");
	var nombreBouton = 3-1; // Modifier il faut remplacer 5 par un lien avec la BD
	var i;
	for( i = 0; i < nombreBouton; i++){
		var cln = elmnt.cloneNode(true);
		cln.id = 'boutons'+ i;
		cln.innerHTML = nomActivité[i];
		cln.style.width = "50%";
		cln.style.height = "100px";
		if(i % 2 != 0){
			cln.style.marginLeft = "auto";
			cln.style.marginRight = "auto";
			cln.style.marginBottom = "5%";
			cln.style.display = "block";
			cln.style.backgroundColor = "red";
		}
		else{
			cln.style.marginLeft = "auto";
			cln.style.marginRight = "auto";
			cln.style.display = "block";
			cln.style.marginBottom = "5%";
			cln.style.backgroundColor = "green";
		}
		boite.appendChild(cln);
	}
}
/*Partie pour l'activité orthographe*/
function chargementImageMot(){// adapter avec la base de donnés
	var imageBaseDonnee = "chat.jpg" //lie BD
	var image = '<img id= imagesActivite src=./img/'+imageBaseDonnee+'>';
	var premierMot = ["cha","chat","sat","ca"]; // lier BD
	document.getElementById("divImage").innerHTML = image;
	for(let m = 0; m < premierMot.length; m++){
		document.getElementsByClassName("zoneTexte")[m].innerHTML = premierMot[m];
	}
}

function verifiacation() { // adapter au niv de la difficulté donc le nombre de distracteur voir si c'est possible
	var boutonsActivité = document.getElementsByClassName("boutonMots");
	var spanMots = document.getElementsByClassName("zoneTexte");
	
	for(let j=0; j < boutonsActivité.length; j++){
		boutonsActivité[j].onclick = function() {
			if(spanMots[j].innerHTML === "chat"){ // adapter pour faire tourner plusieur image et que le mot de comparaison change

				var image = '<img id="imagesActivite" src="./img/chien.jpg">'; //lie BD
				var premierMot = ["chien","chie","sien","cie"]; //lie BD
				document.getElementById("divImage").innerHTML = image;
				for(let m = 0; m < premierMot.length; m++){
					document.getElementsByClassName("zoneTexte")[m].innerHTML = premierMot[m];
				}
				document.getElementById("divImage").innerHTML = image;
			}
			else{
				alert("nop");
			}
		}
	} 
 };