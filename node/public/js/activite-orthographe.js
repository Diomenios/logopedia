'use strict'

let REFERENCE_IMAGES_SAVE;
let image = new Image();
let mots;
let nextImage = new Image();
let nextMots;
let boolean = false;
var feedBackActivites = "<h2>FeedBack de l'activité</h2><br>";
var indiceImages = 0;
var compteurResultat = 0;
let buttonsId = document.getElementsByClassName("boutonMots");
let imageId;

function lancerActivités(){
	var divParametres = document.getElementById("divParametre");
	var divActivités = document.getElementById("divActivités");

	divParametres.style.display ="none";
	divActivités.style.display ="block";
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
  }

function chargementImageMot(){// adapter avec la base de donnés
	try {
		getMotsByType(REFERENCE_IMAGES_SAVE[indiceImages].type_id);
		getImageWithGuid(REFERENCE_IMAGES_SAVE[indiceImages	].image_nom);
	} catch (error) {
		if(error == "TypeError: REFERENCE_IMAGES_SAVE[indiceImages] is undefined"){
			document.getElementById("divActivités").innerHTML = "FINI";
		}
		else{
			console.log(error);
		}
	}
	for (let i = 0; i < buttonsId.length; i++) {
		buttonsId[i].style.backgroundColor = "white"
		buttonsId[i].style.border = "1px solid black"
		buttonsId[i].disabled = false;
	}
}

function verification(button){
	console.log(button.value)
	if(indiceImages < REFERENCE_IMAGES_SAVE.length){
		if(button.value == "1"){
			// adapter pour faire tourner plusieur image et que le mot de comparaison change
			indiceImages ++;
			compteurResultat++;
			button.style.backgroundColor = "green";
			var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>';
			document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
			for( let p=0; p < buttonsId.length; p++){ // boucle qui permet de désactiver le bouton
				buttonsId[p].disabled = true;
				buttonsId[p].style.color = "black";
			}
			feedBackActivites += `Image: ${indiceImages} tu as trouvé la bonne orthographe: ton choix '${button.innerHTML}' <br>`;
		}
		else{

			let reponse;

			button.style.border = "2px solid red"
			for( let k=0; k < buttonsId.length; k++){
				if(buttonsId[k].value == "1"){
					buttonsId[k].style.backgroundColor = "green"
					reponse = buttonsId[k].innerHTML;
				}
			}
			indiceImages ++;
			var boutonSuivant = '<button id=suivant onclick=chargementImageMot()>Suivant</button>'
			document.getElementById("divBoutonSuivant").innerHTML = boutonSuivant;
			for( let p=0; p < buttonsId.length; p++){ // boucle qui permet de désactiver le bouton
				buttonsId[p].disabled = true;
				buttonsId[p].style.color = "black";
			}
			feedBackActivites += `Image: ${indiceImages} tu n'as pas  trouvé la bonne orthographe: ton choix '${button.innerHTML} '
			la réponse '${reponse}' <br>`;
		}
	}
}

/*function verification() { // adapter au niv de la difficulté donc le nombre de distracteur voir si c'est possible
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
}*/

 function loadingDatabase(classe) {

 	let xhttp = new XMLHttpRequest();
	console.log(buttonsId);
	console.log(boolean);
	//getButtonsID();
	generateImageHtml("divImage");

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            REFERENCE_IMAGES_SAVE = JSON.parse(this.responseText);
 						getMotsByType(REFERENCE_IMAGES_SAVE[0].type_id);
 						getImageWithGuid(REFERENCE_IMAGES_SAVE[0].image_nom);
        }
  };

 	xhttp.open("GET", "https://localhost/api/images?classe="+classe, true);
  xhttp.send();
 }

 function getMotsByType(type) {
 	let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             mots = JSON.parse(this.responseText);
						 fillButtons(mots);
 						console.log("mots de l'image : " + this.responseText);
        }
     };
 	xhttp.open("GET", "https://localhost/api/mots?type="+type, true);
   xhttp.send();
 }

 function getImageWithGuid(guid, nextId, next){
 	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
				 if (this.readyState == 4 && this.status == 200) {
					image.src = this.responseText;
					image.onload = function(){
						document.getElementById('imagesActivite').src = image.src;
						document.getElementById("divImage").style.visibility = 'visible';
						console.log("affiché");
						console.log(boolean);
					}
					console.log("chemin de l'image : " + this.responseText);
				}
	};
	/*if (next) {
		xhttp.onreadystatechange = function() {
					 if (this.readyState == 4 && this.status == 200) {
						image.src = this.responseText;
						getImageWithGuid(REFERENCE_IMAGES_SAVE[nextId].image_nom, NULL, false);
						console.log("chemin de l'image : " + this.responseText);
					}
		};
	}
	else {
		xhttp.onreadystatechange = function() {
					 if (this.readyState == 4 && this.status == 200) {
						nextImage.src = this.responseText;
						console.log("chemin de l'image : " + this.responseText);
					}
		};
	}
	*/
 	xhttp.open("GET", "https://localhost/api/image_path?guid="+guid, true);
  xhttp.send();
 }

 function generateImageHtml(divId){

	 let image = '<img id= imagesActivite src= "">';
	 let documentId = document.getElementById(divId);


	 documentId.innerHTML = image;
	 documentId.style.visibility = 'hidden';
 }

function fillButtons(nouveauxMots){
	console.log("length : "+ buttonsId.length);
	for (let i = 0; i < buttonsId.length; i++) {
		buttonsId[i].innerHTML = nouveauxMots[i].mot;
		buttonsId[i].value = nouveauxMots[i].distracteur;
		console.log("value :" +	 buttonsId[i].value);
	}
}
