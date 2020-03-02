'use strict'

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
var motCorrect = ["chat","chien","elephant","hamster","cheval"]; // lier BD
var motBaseDonnee = [["cha","chat","sat","cat"],["chie","chien","sien","cie"],["elephan","elephant","elefant","elephent"],["amster","hamster","hamstaire","hamstère"],["chevalle","cheval","ceval","heval"]]; // lier BD
var imageBaseDonnee = ["chat.jpg","chien.jpg","elephant.jpg","hamster.jpg","cheval.jpg"] //lie BD

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
  }

function chargementImageMot(){// adapter avec la base de donnés
	var boutonSuivant = ''
	for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet d'activé le bouton
		boutonsActivité[p].disabled = false;
	}
	document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
	if((indiceImages < imageBaseDonnee.length) && (indiceMots < motBaseDonnee.length)){
		shuffle(motBaseDonnee[indiceMots]);
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

function loadingDatabase(classe) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("boite").innerHTML = this.responseText;
            console.log("done");
       }
    };
  xhttp.open("GET", "https://localhost/api/images?classe="+classe, true);
  xhttp.send();
}

function verifiacation() { // adapter au niv de la difficulté donc le nombre de distracteur voir si c'est possible
	var spanMots = document.getElementsByClassName("zoneTexte");

	for(let j=0; j < boutonsActivité.length; j++){
		boutonsActivité[j].onclick = function() {
			if((indiceImages < imageBaseDonnee.length) && (indiceMots < motBaseDonnee.length)){
				if((spanMots[j].innerHTML == motCorrect[indiceMots])){
					// adapter pour faire tourner plusieur image et que le mot de comparaison change
					indiceImages ++;
					indiceMots ++;
					compteurResultat++;
					boutonsActivité[j].style.backgroundColor = "green";
					var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>';
					document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
					for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet de désactiver le bouton
						boutonsActivité[p].disabled = true;
						boutonsActivité[p].style.color = "black";
					}
					feedBackActivites += `Image: ${indiceImages} tu as trouvé la bonne orthographe: ton choix '${spanMots[j].innerHTML}' <br>`;
				}

				else{
					boutonsActivité[j].style.border = "2px solid red"
					for( let k=0; k < spanMots.length; k++){
						if(spanMots[k].innerHTML == motCorrect[indiceMots]){
							boutonsActivité[k].style.backgroundColor = "green"
						}
					}
					indiceImages ++;
					indiceMots ++;
					var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>'
					document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
					for( let p=0; p < boutonsActivité.length; p++){ // boucle qui permet de désactiver le bouton
						boutonsActivité[p].disabled = true;
						boutonsActivité[p].style.color = "black";
					}
					feedBackActivites += `Image: ${indiceImages} tu n'as pas  trouvé la bonne orthographe: ton choix '${spanMots[j].innerHTML} '
					la réponse '${motBaseDonnee[indiceMots-1][1]}' <br>`;
					}
			}
		}
	}
 };
