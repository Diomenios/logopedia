'use strict'

/**********************  Variables d'environnements  **************************/
let REFERENCE_IMAGES_SAVE;
let MOTS_NUMBER;
let MAX_IMAGES;
let DIFFICULTE;
let CLASSES;
let ACTIVITY_ID = 2;

let image = new Image();
let mots;
let listeObjBoutons;
let nextImage = new Image();
let nextMots=[];
let indiceImages = 0;
let score = 0;
let difficulties=[];
let longueurs=[];
let feedbackList=[];

let mvOptions;
let mvButtons;
let mvNextButton;
let mvResultats;
let mvImage;
let mvSauvegarde;

/***********************  VUE pour l'exercice  ********************************/

/*
*	Initialise les Vues necessaires apres que le body aie ete initialise
*/
function onload(){

	getAllLongueurs();
	getAllDifficultes();

	mvOptions = new Vue({
		el:"#divParametre",
		data:{
			longueurs: longueurs,
			selectLongueur:"",
			difficulties: difficulties,
			selectDifficulte:"",
			messageError:"",
			display:"none"
		},
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

	mvImage = new Vue({
		el:"#divImage",
		data:{
			source: image,
			visibilityJS: "hidden"
		},
		methods:{
			changeImage: function(nouvelleSource){
				this.source = nouvelleSource;
			}
		}
	});

	mvSauvegarde = new Vue({
			el:"#zoneSauvegarde",
			data:{
				nom: "",
				prenom: "",
				age:undefined,
				email: "",
				display: "none",
				formDisplay: "none",
				messageDisplay: "none",
				message:""
			},
			methods:{
				sauvegarde: function(){
					addOrConfirmUser(this.nom, this.prenom, this.email, this.age);
				}
			}
	});
}

/*
*	Initialise les Vues en rapport avec l'affichage des mots et le passage a l'image
* 	suivante.
*/
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

/*
*	Initialise une liste d'objets voue a contenir les mots de l'activite
*/
function loadVueObjects(){
	let objReturn=new Array();

	for(let i = 0 ; i < MOTS_NUMBER ; i++){
		objReturn.push({mot:"", value:"", type:"", tvalue:false, fvalue:false, disabled:false});
	}
	return objReturn;
}


/**************************  fonctions JS  ************************************/

/*
* Cache les parametres, et affiche la div contenant la premiere image ainsi que
* 	les mots
*/
function lancerActivités(){
	var divParametres = document.getElementById("divParametre");
	var divActivités = document.getElementById("divActivités");

	divParametres.style.display ="none";
	divActivités.style.display ="block";
}

/*
* Melange de maniere totalement aleatoire la liste passee en parametre.
*/
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1));
	  [array[i], array[j]] = [array[j], array[i]];
	}
}

/*
* Permet d'etre sur que le mot correcte se trouve bien dans la liste de mots qui
* 	sera prise pour l'image
*	Considere que si la propriete "distracteur" du mot est a 1, le mot est la proposition
*		correcte.
*/
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

/*
* Charge l'image et les mots suivants
*	Cache le bouton de la Vue mvNextButton
* Verifie s'il reste des images disponibles
* S'il ne reste plus d'images disponibles ou que la longeur max du test est atteinte,
*		affiche les scores, ainsi que le feedback de l'activite
*/
function chargementImageMot(){
	try {

		mvNextButton.display="none";
		if (indiceImages >= MAX_IMAGES) {

			afficherLesResultats();
		}
		else {
			// chargement des nouveaux mots et de la nouvelle image.
			image.src = nextImage.src;
			mots = nextMots;
			fillButtons(mots);

			if (indiceImages+1 < MAX_IMAGES) {
				getNextImageWithGuid(REFERENCE_IMAGES_SAVE[indiceImages+1].nom);
				nextMots = composeMots(MOTS_NUMBER, CLASSES[REFERENCE_IMAGES_SAVE[indiceImages+1].categorie-1].classe_nom, REFERENCE_IMAGES_SAVE[indiceImages+1].type);
				shuffle(nextMots);
			}
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

/*
*	Verifie que le bouton clique est le bouton contenant le mot juste
* Si la valeur est fausse, affiche en vert le bouton correcte, et rougis le bouton clique
* Si la valeur est vraie, affiche le bouton clique en vert
* Incremente la variable indiceImages
*	Affiche le bouton contenu dans la Vue mvNextButton
*
* @param {Object} item	objet contenant les valeurs en rapport avec le mot choisi
* @param {Object[]} listeItems	la liste contenant tous les objets des mots
* @param {String} mot	 Le mot sur lequel l'utilisateur a cliqué
*/
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
		feedbackList.push({resultat: mot,trueResultat: trueResultat, type: item.type});
		indiceImages ++;
		mvNextButton.active();
	}
}

/*
* Genere le code HTML necessaire a l'affichage de l'image
* Insere le code genere dans la div dont l'id a ete passe en parametre
*
* @param {String} divId  id de la div dans laquelle l'image doit etre inseree
*/
function generateImageHtml(divId){

	let image = '<img id= imagesActivite src= "">';
	let documentId = document.getElementById(divId);


	documentId.innerHTML = image;
	documentId.style.visibility = 'hidden';
}

/*
* Ajoute les nouveaux mots aux boutons contenu dans la Vue mvButtons
*
* @param {Object} nouveauxMots les mots a inserer dans a la variabe globale listeObjBoutons
																	liee a la Vue mvButtons
*/
function fillButtons(nouveauxMots){

 for (let i = 0; i < MOTS_NUMBER; i++) {
	 listeObjBoutons[i].mot = nouveauxMots[i].mot;
	 listeObjBoutons[i].value = nouveauxMots[i].value;
	 listeObjBoutons[i].type = nouveauxMots[i].type;
 }
}

/*
* Verifie que les 2 options ont bien ete selectionnee
*	Si l'une des deux options n'ont pas ete selectionnee, affiche un message precisant
*		quels options ont ete laissees vides
* Lance la fonction verificationDisponibiliteImage si tout est correct
*/
function testOptions(){
	if (mvOptions.selectLongueur === "" || mvOptions.selectDifficulte === "") {

		mvOptions.messageError= "";

		if (mvOptions.selectLongueur === "") {
				mvOptions.messageError += "Veuillez sélectionner la longueur que vous désirez pour l'exercice \n";
		}
		if (mvOptions.selectDifficulte === "") {
			mvOptions.messageError += "Veuillez sélectionner la difficulté de l'exercice";
		}
	}
	else {
		verificationDisponibiliteImage(mvOptions.selectLongueur);
	}
}

/*
* Efface les div contenant l'image et les boutons de l'activite
*	Utilise les fonctions formatTitle, formatScore, et formatFeedback pour creer
*		le contenu du feedback de l'activite
*	Affiche le feedback de l'activite
*/
function afficherLesResultats(){
	document.getElementById("divImage").style.display = 'none';

	mvButtons.display="none";

	mvResultats.title=formatTitle(DIFFICULTE);
	mvResultats.score=formatScore(score, MAX_IMAGES);
	mvResultats.feedback=formatFeedback();
	mvResultats.display="block";
}

/*
* Genere le titre du feedback de l'activite
*
* @param {String} classe  la catégorie de mots utilise pour l'activite
*	@param {String} difficulte	la difficulte choisie pour l'activite
*/
function formatTitle(difficulte){
	return "Difficulté " + difficulte;
}

/*
* Genere le score de l'activite
*
* @param {Int} resultat	 le nombre de mots correctement trouve
* @param {Int} max  le nombre d'images faites proposee l'activite
*/
function formatScore(resultat, max){
	return "Résultat : " + resultat + "/" + max;
}

/*
* Genere le feedback concernant chacune des images proposee lors de l'activite
*	Utilise pour cela la variable globale feedbackList
*/
function formatFeedback(){
	let returnString="";

	for (let i = 0; i < feedbackList.length; i++) {
		let stringToAdd;
		if (feedbackList[i].resultat == feedbackList[i].trueResultat) {
			stringToAdd = "A la photo \"" + feedbackList[i].type + "\" vous avez correctement répondu \n";
			returnString += stringToAdd;
		}
		else{
			stringToAdd = "A la photo \"" + feedbackList[i].type + "\" vous avez répondu : " +feedbackList[i].resultat + "(erreur) \n";
			returnString += stringToAdd;
		}

		feedbackList[i]={trueResultat:feedbackList[i].trueResultat, resultat: feedbackList[i].resultat, feedback:stringToAdd};
	}

	return returnString;
}

function AfficherZoneSauvegarde(){
	mvSauvegarde.display="block";
	mvSauvegarde.formDisplay="block";
}

/*
* Genere une liste de mots aléatoires, contenant comme premier mot la valeur correcte.
*		Les autres sont tous des distracteurs
*
* @param {Int} nombreDeMots  Le nombre de mots que l'on desire avoir dans la liste
* @param {String} categorie	 La vraie categorie de l'image
* @param {String}	type			 Le type de l'image (chat, chien, ...)
*
* @return {Object} nouveauxMots  La liste des mots
*/
function composeMots(nombreDeMots, categorie, type){

	let nouveauxMots = [{mot: categorie, value: 1, type: type}];

	for(let i = 0 ; i < nombreDeMots-1 ; i++){
		let random = Math.round(Math.random()*(CLASSES.length-1));
		while (isInArray(nouveauxMots, CLASSES[random].classe_nom)) {
			random = Math.round(Math.random()*(CLASSES.length-1));
		}
		nouveauxMots.push({mot: CLASSES[random].classe_nom, value:0, type: type});
	}
	return nouveauxMots;
}

/*
* Verifie si une cle "mot" associe a une valeur precise se trouve bien dans une liste
*
* @param {Object} array  La liste que l'on desire verifiee
* @param {String} elem	 le nom de l'element pour lequel on desire faire la verification
*
* @return {Boolean} 		 retourne true si l'element a ete trouve, et false si l'element
*													 n'est pas dans la liste
*/
function isInArray(array, element){
	for (let i = 0 ; i < array.length ; i++){
		if (array[i].mot == element) {
			return true;
		}
	}
	return false;
}
/***********************  fonctions de GET database  **************************/

/*
* Verifie cote serveur le nombre d'images disponible pour la categorie d'images
*		passee en parametre
* Si le nombre d'image est different de 0, demarre l'activite
*
* @param {Int} classe Id de la categorie d'images a verifier
*/
function verificationDisponibiliteImage(nombreImages){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					if (returnValues.length == 0) {
						mvOptions.messageError = "Il n'y a pas d'images disponible"
					}
					else{
						MOTS_NUMBER = mvOptions.selectDifficulte;
						MAX_IMAGES = mvOptions.selectLongueur;
						DIFFICULTE = mvOptions.selectDifficulte;
						REFERENCE_IMAGES_SAVE = returnValues;

						lancerActivités();
						getImageWithGuid(REFERENCE_IMAGES_SAVE[0].nom);
						getNextImageWithGuid(REFERENCE_IMAGES_SAVE[1].nom);
						getAllOrdoredClasses();
						loadVue();
						getDifficulteNom(mvOptions.selectDifficulte);
					}
        }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/activites/categorie_random_images?nombre=" + nombreImages , true);
  xhttp.send();
}

/*
* Demande au serveur la liste de toutes les longueurs contenue dans la database
* Insere les longueurs dans la liste "longueurs" liee a la Vue mvOptions
*/
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

	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/longueurs", true);
  xhttp.send();
}

function getAllOrdoredClasses(){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
        	let returnValues = JSON.parse(this.responseText);

					CLASSES = returnValues;

					mots = composeMots(MOTS_NUMBER, CLASSES[REFERENCE_IMAGES_SAVE[0].categorie-1].classe_nom, REFERENCE_IMAGES_SAVE[0].type);
					shuffle(mots);
					fillButtons(mots);
					nextMots = composeMots(MOTS_NUMBER, CLASSES[REFERENCE_IMAGES_SAVE[1].categorie-1].classe_nom, REFERENCE_IMAGES_SAVE[1].type);
					shuffle(nextMots);
				}
	};

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/classes_order_id", true);
 	xhttp.send();
}

/*
* Demande au serveur la liste de toutes les difficultes contenue dans la database
* Insere les difficultes dans la liste "difficultes" liee a la Vue mvOptions
*/
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

  	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/difficultes", true);
  	xhttp.send();
}

/*
*	Download a partir du serveur l'image ayant le nom passe en parametre
*	Initialise l'image de la Vue "mvImage"
*
* @param {String} guid  le nom sous lequel l'image est stockee sur le site
*/
function getImageWithGuid(guid){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
			 if (this.readyState == 4 && this.status == 200) {
					image.src = this.responseText;
					image.onload = function(){
						mvImage.changeImage(image.src);
						mvImage.visibilityJS='visible';
					}
				}
	};
 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/image_path?guid="+guid, true);
  xhttp.send();
}

/*
 *	Download a partir du serveur l'image ayant le nom passe en parametre
 *	Stocke l'image dans la variable "nextImage" pour fluidifier le changement d'image
 *
 * @param {String} guid  le nom sous lequel l'image est stockee sur le site
 */
function getNextImageWithGuid(guid){

	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
			 if (this.readyState == 4 && this.status == 200) {
					nextImage.src = this.responseText;
				}
	};

	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/image_path?guid="+guid, true);
  xhttp.send();
}

/*
* Demande au serveur le nom d'une difficulte, a partir du nombre de mots differents
*		de celle-ci
*
* @param {Int} nombreMots  le nombre de mots differents affiche par images
*/
function getDifficulteNom(nombreMots){

	 let xhttp = new XMLHttpRequest();

	 xhttp.onreadystatechange = function() {
	 			 if (this.readyState == 4 && this.status == 200) {
	 				let returnValues = JSON.parse(this.responseText);

					DIFFICULTE = returnValues[0].nom;
				}
	 	};

	 xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/select_difficulte?nombre_mots=" + nombreMots, true);
	 xhttp.send();
}

function addOrConfirmUser(nom, prenom, email, age){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					let returnValues = JSON.parse(this.responseText);

			 		if (returnValues.status == 1) {
					 	maxActivityNumber(returnValues.numero_patient);
 				 	}
			 }
	 };

	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/addOrConfirmUser?nom="+ nom +"&prenom="+ prenom +"&email="+ email +"&age="+ age, true);
	xhttp.send();
}

function formatDay(day){
	switch (day) {
		case 0:
			return "Lundi";
			break;
		case 1:
			return "Mardi";
		 	break;
		case 2:
			return "Mercredi";
		 	break;
		case 3:
			return "Jeudi";
		 	break;
		case 4:
			return "Vendredi";
			break;
		case 5:
			return "Samedi";
		 	break;
		case 6:
			return "Dimanche";
		 	break;
		default:

	}
}

function formatMonth(month){
	switch (month) {
		case 0:
			return "janvier";
			break;
		case 1:
			return "Février";
		 	break;
		case 2:
			return "Mars";
		 	break;
		case 3:
			return "Avril";
		 	break;
		case 4:
			return "Mai";
			break;
		case 5:
			return "Juin";
		 	break;
		case 6:
			return "Juillet";
		 	break;
		case 7:
			return "Août";
			break;
		case 8:
			return "Septembre";
		 	break;
		case 9:
			return "Octobre";
		 	break;
		case 10:
			return "Novembre";
		 	break;
		case 11:
			return "Décembre";
			break;
		default:

	}
}

function maxActivityNumber(patient){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				let returnValues = JSON.parse(this.responseText);

 				 	if (returnValues[0].max == null) {
					 	for (let elem of feedbackList) {
							let date = "";
							let now = new Date()
							date += formatDay(now.getDay()) + " " + formatMonth(now.getMonth()) + " " + now.getDate() + "-" + (now.getMonth()+1) + "-" + now.getFullYear();
							addResultat(patient, score, MAX_IMAGES, elem.feedback, date, ACTIVITY_ID, 1);
					 	}
 				 	}
					else{
					 	for (let elem of feedbackList) {
							let date = "";
							let now = new Date();
							date += formatDay(now.getDay()) + " " + formatMonth(now.getMonth()) + " " + now.getDate() + "-" + (now.getMonth()+1) + "-" + now.getFullYear();
							addResultat(patient, score, MAX_IMAGES, elem.feedback, date, ACTIVITY_ID, returnValues[0].max+1);
					 	}
					}
			 }
	 };

	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/max_resultats", true);
	xhttp.send();
}

function addResultat(numeroPatient, resultatImage, nombreImages, feedback, dateActivite, idActivites, activity_number){
	let xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				 let returnValues = JSON.parse(this.responseText);

				 if (returnValues.status == 1) {
					 mvSauvegarde.formDisplay = "none";
					 mvSauvegarde.messageDisplay = "block";
					 mvSauvegarde.message = "Le résultat a bien été sauvegardé !";
				 }
			 }
	 };
	 xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/add_Resultats?numero_patient="+ numeroPatient +"&resultat_image="+ resultatImage +"&nombre_image="+ nombreImages
								+"&feedback="+ feedback +"&date_activite="+ dateActivite +"&id_activites="+ idActivites +"&nombre_activite="+ activity_number, true);
	 xhttp.send();
}
