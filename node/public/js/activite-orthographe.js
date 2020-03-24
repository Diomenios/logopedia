'use strict'

let REFERENCE_IMAGES_SAVE;
let MOTS_NUMBER = 5;
let image = new Image();
let mots;
let listeObjBoutons;
let nextImage = new Image();
let nextMots;
let indiceImages = 0;
let score = 0;
let difficulties=[];
let classes=[];

let mvOptions;
let mvButtons;
let mvNextButton;

/***********************  VUE pour l'exercice  ********************************/

function loadVue(){

	listeObjBoutons = loadVueObjects();

	mvButtons = new Vue({
		el:"#boutonsMots",
		data:{
			listeMots:listeObjBoutons,
			size: MOTS_NUMBER
		},
		methods:{
			test: verification,
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

function onload(){

	getAllClasses();
	getAllDifficultes();

	mvOptions = new Vue({
		el:"#divParametre",
		data:{
			classes: classes,
			difficulties: difficulties,
			display:"none"
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
		getMotsByType(REFERENCE_IMAGES_SAVE[indiceImages].type_id);
		getImageWithGuid(REFERENCE_IMAGES_SAVE[indiceImages	].image_nom);
	} catch (error) {
		if(error == "TypeError: REFERENCE_IMAGES_SAVE[indiceImages] is undefined"){
			let doc = document.getElementById("divActivités");
			doc.innerHTML = "Votre score : " + score + "/" + REFERENCE_IMAGES_SAVE.length;
			doc.style.margin = 'auto';
		}
		else{
			console.log(error);
		}
	}
	mvButtons.reInit();
}

function verification(item, listeItems){
	if(indiceImages < REFERENCE_IMAGES_SAVE.length){
		if(item.value == "1"){
			score++;
			for (let i = 0; i < listeItems.length; i++) {
				if (listeItems[i].value == 1) {
					listeItems[i].tvalue=true;
				}
				listeItems[i].disabled=true;
			}
		}
		else{

			for (let i = 0; i < listeItems.length; i++) {
				if (listeItems[i].value == 1) {
					listeItems[i].tvalue=true;
				}
				else {
					listeItems[i].fvalue = true;
				}
				listeItems[i].disabled=true;
			}
		}
		indiceImages ++;
		mvNextButton.active();
		console.log(mvNextButton.visible);
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
 console.log(listeObjBoutons[0].mot);
}


/***********************  fonctions de GET database  **************************/

function getAllClasses(){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
					 console.log("reçu")
        	let returnValues = JSON.parse(this.responseText);

					for(let i = 0; i<returnValues.length ; i++){
						classes.push(returnValues[i]);
					}
					console.log("fini");
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

function loadingDatabase(classe) {

 	let xhttp = new XMLHttpRequest();
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
