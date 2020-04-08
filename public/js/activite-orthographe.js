'use strict'

let REFERENCE_IMAGES_SAVE;
let MOTS_NUMBER;
let MAX_IMAGES;
let DIFFICULTE;
let CLASSE;

let image = new Image();
let mots;
let listeObjBoutons;
let nextImage = new Image();
let nextMots;
let indiceImages = 0;
let score = 0;
let difficulties=[];
let classes=[];
let longueurs=[];
let feedbackList=[];

let mvOptions;
let mvButtons;
let mvNextButton;
let mvResultats;

/***********************  VUE pour l'exercice  ********************************/

function onload(){

	getAllLongueurs();
	getAllClasses();
	getAllDifficultes();

	mvOptions = new Vue({
		el:"#divParametre",
		data:{
			longueurs: longueurs,
			selectLongueur:"",
			classes: classes,
			selectClasse:"",
			difficulties: difficulties,
			selectDifficulte:"",
			messageError:"",
			display:"none"
		},
		methods:{
			checkImages: imagesDisponible
		}
	});

	mvResultats = new Vue({
		el:"#divResultats",
		data:{
			title:"",
			score:"",
			feedback:"",
			display:"none"
		}
	});
}


function loadVue(){

	listeObjBoutons = loadVueObjects();

	mvButtons = new Vue({
		el:"#boutonsMots",
		data:{
			listeMots:listeObjBoutons,
			size: MOTS_NUMBER,
			etendu: (MOTS_NUMBER>4),
			display:"flex"
		},
		methods:{
			testAnswer: verification,
			reInit: function(){
				for (let i = 0; i < this.listeMots.length; i++) {
					this.listeMots[i].tvalue = false;
					this.listeMots[i].fvalue = false;
					this.listeMots[i].disabled = false;
				}
			}
		}
	});

mvNextButton = new Vue({
		el:"#nextButton",
		data:{
			message : "Image suivante",
			display: "none"
		},
		methods:{
			next: chargementImageMot,
			active: function () {
				this.display="block";
			}
		}
	});
}

/*************************  VUE fonctions d'aide  *****************************/

function loadVueObjects(){
	let objReturn=new Array();

	for(let i = 0 ; i < MOTS_NUMBER ; i++){
		objReturn.push({mot:"", value:"", tvalue:false, fvalue:false, disabled:false});
	}
	return objReturn;
}


/**************************  fonctions JS  ************************************/

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

function validateShuffleMots(listMots){
	let itsTrue =  false;
	for (let i = 0; i < MOTS_NUMBER; i++) {
		if (listMots[i].distracteur == "1") {
			itsTrue = true;
		}
	}
	if (!itsTrue) {
		for (var i = MOTS_NUMBER; i < listMots.length; i++) {
			if (listMots[i].distracteur == "1") {
				listMots[Math.floor(Math.random() * (MOTS_NUMBER-1))] = listMots[i];
			}
		}
	}
}

function chargementImageMot(){// adapter avec la base de donnés
	try {
		mvNextButton.display="none";
		if (indiceImages >= MAX_IMAGES) {

			afficherLesResultats();

		}
		else {

			getMotsByType(REFERENCE_IMAGES_SAVE[indiceImages].type_id);
			getImageWithGuid(REFERENCE_IMAGES_SAVE[indiceImages	].image_nom);
			mvButtons.reInit();
		}
	} catch (error) {
		if(error == "TypeError: REFERENCE_IMAGES_SAVE[indiceImages] is undefined"){

			afficherLesResultats();

		}
		else{
			console.log(error);
		}
	}
}

function verification(item, listeItems, mot){
	if(indiceImages < REFERENCE_IMAGES_SAVE.length){

		let trueResultat;

		if(item.value == "1"){
			score++;
			for (let i = 0; i < listeItems.length; i++) {
				if (listeItems[i].value == 1) {
					listeItems[i].tvalue=true;
					trueResultat = listeItems[i].mot;
				}
				listeItems[i].disabled=true;
			}
		}
		else{
			item.fvalue = true;
			for (let i = 0; i < listeItems.length; i++) {
				if (listeItems[i].value == 1) {
					listeItems[i].tvalue=true;
					trueResultat = listeItems[i].mot;
				}
				listeItems[i].disabled=true;
			}
		}
		feedbackList.push({resultat: mot,trueResultat: trueResultat});
		indiceImages ++;
		mvNextButton.active();
	}
}

function generateImageHtml(divId){

	let image = '<img id= imagesActivite src= "">';
	let documentId = document.getElementById(divId);


	documentId.innerHTML = image;
	documentId.style.visibility = 'hidden';
}

function fillButtons(nouveauxMots){

 for (let i = 0; i < MOTS_NUMBER; i++) {
	 listeObjBoutons[i].mot = nouveauxMots[i].mot;
	 listeObjBoutons[i].value = nouveauxMots[i].distracteur;
 }
}

function testOptions(){
	if (mvOptions.selectLongueur === "" || mvOptions.selectClasse === "" || mvOptions.selectDifficulte === "") {

		mvOptions.messageError= "";

		if (mvOptions.selectLongueur === "") {
				mvOptions.messageError += "Veuillez sélectionner la longueur que vous désirez pour l'exercice \n";
		}
		if (mvOptions.selectClasse === "") {
				mvOptions.messageError += "Veuillez sélectionner la catégorie d'images sur laquelle sera l'exercice \n";
		}
		if (mvOptions.selectDifficulte === "") {
			mvOptions.messageError += "Veuillez sélectionner la difficulté de l'exercice";
		}
	}
	else {
		verificationDisponibiliteImage(mvOptions.selectClasse);
	}
}

function formatTitle(classe, difficulte){
	return classe + ", difficulté " + difficulte;
}

function formatScore(resultat, max){
	return "Résultat : " + resultat + "/" + max;
}

function formatFeedback(){
	let returnString="";

	for (let i = 0; i < feedbackList.length; i++) {
		if (feedbackList[i].resultat == feedbackList[i].trueResultat) {
			returnString += "A la photo du " + feedbackList[i].trueResultat + " vous avez correctement répondu \n";
		}
		else{
			returnString += "A la photo du " + feedbackList[i].trueResultat + " vous avez répondu : " +feedbackList[i].resultat + "(erreur) \n";
		}
	}

	return returnString;
}

function afficherLesResultats(){
	document.getElementById("divImage").style.display = 'none';

	mvButtons.display="none";

	mvResultats.display="block";
	mvResultats.title=formatTitle(CLASSE, DIFFICULTE);
	mvResultats.score=formatScore(score, MAX_IMAGES);
	mvResultats.feedback=formatFeedback();
}

/***********************  fonctions de GET database  **************************/

function verificationDisponibiliteImage(classe){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					if (returnValues[0].result == 0) {
						mvOptions.messageError = "Il n'y a pas d'images disponible dans cette catégorie, veuillez en choisir une autre."
					}
					else{
						MOTS_NUMBER = mvOptions.selectDifficulte;
						MAX_IMAGES = mvOptions.selectLongueur;

						lancerActivités();
						loadingDatabase(mvOptions.selectClasse);
						loadVue();
						getClasseNom(mvOptions.selectClasse);
						getDifficulteNom(mvOptions.selectDifficulte);
					}
        }
  };

 	xhttp.open("GET", "https://localhost/api/somme_images?classe=" + classe, true);
  xhttp.send();
}

function getAllLongueurs(){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					for(let i = 0; i<returnValues.length ; i++){
						longueurs.push(returnValues[i]);
					}
					mvOptions.display = "flex";
        }
  };

 	xhttp.open("GET", "https://localhost/api/longueurs", true);
  xhttp.send();
}

function getAllClasses(){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					for(let i = 0; i<returnValues.length ; i++){
						classes.push(returnValues[i]);
					}
					mvOptions.display = "flex";
        }
  };

 	xhttp.open("GET", "https://localhost/api/classes", true);
  xhttp.send();
}

function getAllDifficultes(){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					for(let i = 0; i<returnValues.length ; i++){
						difficulties.push(returnValues[i]);
					}
        }
  };

 	xhttp.open("GET", "https://localhost/api/difficultes", true);
  xhttp.send();
}

function loadingDatabase(classeId) {

 	let xhttp = new XMLHttpRequest();
	generateImageHtml("divImage");

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            REFERENCE_IMAGES_SAVE = JSON.parse(this.responseText);
						if (REFERENCE_IMAGES_SAVE.length < MAX_IMAGES) {
							MAX_IMAGES = REFERENCE_IMAGES_SAVE.length;
						}
 						getMotsByType(REFERENCE_IMAGES_SAVE[0].type_id);
 						getImageWithGuid(REFERENCE_IMAGES_SAVE[0].image_nom);
        }
  };

 	xhttp.open("GET", "https://localhost/api/classe_images?classe_id="+classeId, true);
  xhttp.send();
 }

 function getMotsByType(type) {
 	let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             mots = JSON.parse(this.responseText);
						 shuffle(mots);
						 validateShuffleMots(mots);
						 fillButtons(mots);
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
					}
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

 function getClasseNom(classeId){

	 let xhttp = new XMLHttpRequest();

	 xhttp.onreadystatechange = function() {
	 			 if (this.readyState == 4 && this.status == 200) {
	 				let returnValues = JSON.parse(this.responseText);

					CLASSE = returnValues[0].classe_nom;
				}
	 };

	 xhttp.open("GET", "https://localhost/api/select_classe?classe_id=" + classeId, true);
	 xhttp.send();
 }

 function getDifficulteNom(nombreMots){

	 let xhttp = new XMLHttpRequest();

	 xhttp.onreadystatechange = function() {
	 			 if (this.readyState == 4 && this.status == 200) {
	 				let returnValues = JSON.parse(this.responseText);

					DIFFICULTE = returnValues[0].nom;
				}
	 	};

	 xhttp.open("GET", "https://localhost/api/select_difficulte?nombre_mots=" + nombreMots, true);
	 xhttp.send();
 }

function imagesDisponible(classe){
	if (classe == "") {
		return;
	}
	else{
		let xhttp = new XMLHttpRequest();

	 	xhttp.onreadystatechange = function() {
	    	if (this.readyState == 4 && this.status == 200) {
	       	let returnValues = JSON.parse(this.responseText);

					mvOptions.messageError = "Il y a " + returnValues[0].result +" images de disponible dans cette catégorie !";
	      }
	  };

	  xhttp.open("GET", "https://localhost/api/somme_images?classe=" + classe, true);
	  xhttp.send();
	}
}
