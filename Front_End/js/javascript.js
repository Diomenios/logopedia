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
function lancerActivités(){
	var divParametres = document.getElementById("divParametre");
	var divActivités = document.getElementById("divActivités");

	divParametres.style.display ="none";
	divActivités.style.display ="block";
}
var boutonsActivité = document.getElementsByClassName("boutonMots");
var feedBackActivites = "<h2>FeedBack de l'activité</h2><br>";
var indiceImages = 0;
var indiceMots = 0;
var compteurResultat = 0;
var motBaseDonnee = [["cha","chat","sat","ca"],["chie","chien","sien","cie"],["elephan","elephant","elefant","elephent"],["amster","hamster","hamstaire","hamstère"],["chevalle","cheval","ceval","heval"]]; // lier BD
var imageBaseDonnee = ["chat.jpg","chien.jpg","elephant.jpg","hamster.jpg","cheval.jpg"] //lie BD


function chargementImageMot(){// adapter avec la base de donnés
	var boutonSuivant = ''
	for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet d'activé le bouton
		boutonsActivité[p].disabled = false;
	}
	document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
	if((indiceImages < imageBaseDonnee.length) && (indiceMots < motBaseDonnee.length)){
		var image = '<img id= imagesActivite src=./img/'+imageBaseDonnee[indiceImages]+'>';
		document.getElementById("divImage").innerHTML = image;
		for(let m = 0; m < motBaseDonnee[indiceMots].length; m++){
			for(let n =0; n < 4; n++){
			boutonsActivité[n].style.backgroundColor = "white"
			boutonsActivité[n].style.border = "1px solid black"
			}
			document.getElementsByClassName("zoneTexte")[m].innerHTML = motBaseDonnee[indiceMots][m];

		}
	}else{
		var boutonRetour = '<div id= divResultat ><span>'+`Résultat: ${compteurResultat}/${imageBaseDonnee.length}`+'</span>'
		+'<br><span>'+feedBackActivites+'</span>'
		+'<br><a href="activite.html"><button>Home</button></a></div>'
		document.getElementById("boite").innerHTML = boutonRetour;
	}
}

function verifiacation() { // adapter au niv de la difficulté donc le nombre de distracteur voir si c'est possible
	var spanMots = document.getElementsByClassName("zoneTexte");
	
	for(let j=0; j < boutonsActivité.length; j++){
		boutonsActivité[j].onclick = function() {
			if((indiceImages < imageBaseDonnee.length) && (indiceMots < motBaseDonnee.length)){
				if((spanMots[j].innerHTML === motBaseDonnee[indiceMots][1])){ 
					// adapter pour faire tourner plusieur image et que le mot de comparaison change
					indiceImages ++;
					indiceMots ++;
					compteurResultat++;
					boutonsActivité[1].style.backgroundColor = "green";
					var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>';
					document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
					for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet de désactiver le bouton
						boutonsActivité[p].disabled = true;
					}
					feedBackActivites += `Image: ${indiceImages} tu as trouvé la bonne orthographe: ton choix '${spanMots[j].innerHTML}' <br>`;
				}
				else{
					indiceImages ++;
					indiceMots ++;
					boutonsActivité[j].style.border = "2px solid red"
					boutonsActivité[1].style.backgroundColor = "green"
					var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>'
					document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
					for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet de désactiver le bouton
						boutonsActivité[p].disabled = true;
					}
					feedBackActivites += `Image: ${indiceImages} tu n'as pas  trouvé la bonne orthographe: ton choix '${spanMots[j].innerHTML} '
					la réponse '${motBaseDonnee[indiceMots-1][1]}' <br>`;
					}
			}
		}
	}
 };
 //-----------------------------------------------