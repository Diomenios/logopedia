'use strict'

let tabPatient =  [];
let tabResultats = [];
let tabActive = [];

getActivites();
getResultats();
getPatients();

let recherche;

function onload(){

  recherche = new Vue({
    el: '#divRecherche',
    data: {},
    methods:{
      rechercheListe : rechercheListes,
      resetListe : resetPages
    }
  });
}


function rechercheListes(){
  let check = true
  let inputRecherche = document.getElementById("recherche");

  let nouvelleListePatient = "";

  if(inputRecherche.value == ""){
    document.getElementById('recherche').style.border = "2px solid red";
    check = false
  }
  if(check){
    for(let patient of tabPatient){
      if((inputRecherche.value == patient.nom) ||
      (inputRecherche.value == patient.prenom) ||
      (inputRecherche.value == `${patient.prenom} ${patient.nom}`)){
        nouvelleListePatient += `<li onclick="afficherResulats(this);"> ${patient.prenom} ${patient.nom}</li>`;
      }
    }
    document.getElementById('listePatient').innerHTML = nouvelleListePatient;
}
}
function resetPages(){
  let nouvelleListe = "";
  for(let patient of tabPatient){
      nouvelleListe += `<li onclick="afficherResulats(this);"> ${ patient.prenom } ${ patient.nom }</li>`
  }
  document.getElementById('listePatient').innerHTML = nouvelleListe;
  document.getElementById("recherche").value = "";
}
/*----------------------------------------------*/

var listePatient = new Vue({
  el: '#divListePatient',
  data: {
    patients:tabPatient,
    display:"none"

  },
  methods:{
    afficherResulat : afficherResulats,
  }
})
function afficherResulats(element){
  let indexPatient = 0;
  let resultattexte = "";


  let divResulatsTexte = document.getElementById('divResulatsTexte');
  let divResulats = document.getElementById('divResulats');
  let divResultatGraph1 = document.getElementById('divResulatsGraph1');
  let divResultatGraph2 = document.getElementById('divResulatsGraph2');

  document.getElementById('divRecherche').style.display = "none";
  document.getElementById('divListePatient').style.display = "none";

  divResulats.style.display = "block";

  let patient = element.textContent;
  let patientModif = patient.replace(/\s/g,"")

  //recupérer l'id du patient
  for(let e of tabPatient){
    if( patientModif == `${e.prenom}${e.nom}`){
      indexPatient = e.numero_patient;
    }
  }
  //utilisé l'id du patient
  let tabDataX = [];
  let tabDataLineaireAct1 = [];
  let tabDataLineaireAct2 = [];

  for(let e of tabResultats){
    if( indexPatient == e.numero_patient){

      let nomActivite
      for(let f of tabActive){
        if(e.id_activites == f.activite_id){
          nomActivite = f.activite_nom;
        }
      }
        if(e.id_activites == 1){
          tabDataLineaireAct1.push(Math.ceil((e.resultat_image/e.nombre_image)*10));
        }else{
          tabDataLineaireAct2.push(Math.ceil((e.resultat_image/e.nombre_image)*10));
        }

        if(tabDataX.length < tabDataLineaireAct1.length || tabDataX.length < tabDataLineaireAct2.length){
          tabDataX.push(e.date_activite);
        }

      resultattexte += `Résultat: ${e.resultat_image}/${e.nombre_image} <br> Feedback: ${e.feedback} <br> Date: ${e.date_activite} <br> Activité: ${nomActivite}
      <br>-------------------<br>`;
    }
  }

  divResulatsTexte.innerHTML = `<h3> Résultats de  <span id="patient"> ${patient} </span> </h3>
  <input id="bResultatGraph1" type="button" value="Résultat Graph1" onclick="afficherResulatGraph1()">
  <input id="bResultatGraph2" type="button" value="Résultat Graph2" onclick="afficherResulatGraph2()"><br>
  ${resultattexte}

  <input id="bRetour" type="button" value="Retour Liste Patients" onclick="AfficherPatients()">`;

  divResultatGraph1.innerHTML = `<h3> Résultats de  <span id="patient"> ${patient} </span> </h3>
  <input id="bResultatTexte" type="button" value="Résultat Texte" onclick="afficherResulatTexte()">
  <input id="bResultatGraph2" type="button" value="Résultat Graph2" onclick="afficherResulatGraph2()"><br>

  <canvas id="myChart"></canvas><br>

  <input id="bRetour" type="button" value="Retour Liste Patients" onclick="AfficherPatients()">`;

  divResultatGraph2.innerHTML = `<h3> Résultats de  <span id="patient"> ${patient} </span> </h3>
  <input id="bResultatTexte" type="button" value="Résultat Texte" onclick="afficherResulatTexte()">
  <input id="bResultatGraph1" type="button" value="Résultat Graph1" onclick="afficherResulatGraph1()"><br>

  <canvas id="myChart2"></canvas><br>

  <input id="bRetour" type="button" value="Retour Liste Patients" onclick="AfficherPatients()">`;

  $('#divResulatsGraph1').hide();
  $('#divResulatsGraph2').hide();
  $('#divResulatsTexte').show();

  //partie pour le graph1 en bar
  var ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: tabDataX,
      datasets: [
        {
          label: "Activité orthographe",
          backgroundColor: "#3e95cd",
          data: tabDataLineaireAct1
        }, {
          label: "Activité Catégorie",
          backgroundColor: "#8e5ea2",
          data: tabDataLineaireAct2
        }
      ]
    },

    options: {
      scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
    }
  });

  //partie pour le graph2 linéaire
  var ctx2 = document.getElementById('myChart2').getContext('2d');
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: tabDataX,
      datasets: [{
          data: tabDataLineaireAct1,
          label: "activité orthographe",
          borderColor: "#3e95cd",
          fill: false
        }, {
          data: tabDataLineaireAct2,
          label: "activité catégorie",
          borderColor: "#8e5ea2",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Résultats au différentes Activités'
      },
      scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    }
    }
  });

  }//fin de la fonction résultats
  function afficherResulatTexte(){
    $('#divResulatsGraph1').hide();
    $('#divResulatsGraph2').hide();
    $('#divResulatsTexte').show();
  }

  function afficherResulatGraph1(){
    $('#divResulatsTexte').hide();
    $('#divResulatsGraph1').show();
    $('#divResulatsGraph2').hide();
  }

  function afficherResulatGraph2(){
    $('#divResulatsTexte').hide();
    $('#divResulatsGraph1').hide();
    $('#divResulatsGraph2').show();
  }
/*----------------------------------------------*/

var listePatient = new Vue({
  el: '#divResulats',
  data: {
    display:"none"

  },
})

function AfficherPatients(){
  document.getElementById('divResulats').style.display = "none";
  document.getElementById('divRecherche').style.display = "block";
  document.getElementById('divListePatient').style.display = "block";
  resetPages();
}


/*---------------------------*/
/**
*partie pour l'autocomplétion
*@param inp : champ html où est envoyé le résultat
*@param 'arr' : Array dans lequel se fait la recherche
*/
function autocomplete(inp, arr) {

  var currentFocus;
  inp.addEventListener("input", function(e) {

      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      if(inp.value.length >= 3){
      for (let i = 0; i < arr.length; i++) {

        if (arr[i].nom.substr(0, val.length).toUpperCase() == val.toUpperCase()) { //condition si on fait une recherche par le nom
          b = document.createElement("DIV");
          b.innerHTML = arr[i].prenom +' '+"<strong>" + arr[i].nom.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].nom.substr(val.length);
          b.innerHTML += "<input type='hidden' value='"+ arr[i].prenom +' '+ arr[i].nom +"'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }

        else if (arr[i].prenom.substr(0, val.length).toUpperCase() == val.toUpperCase()) { //condition si on fait une recherche par le prenom
          b = document.createElement("DIV");
          b.innerHTML =  arr[i].nom +' '+"<strong>" + arr[i].prenom.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].prenom.substr(val.length);
          b.innerHTML += "<input type='hidden' value='"+arr[i].prenom +' '+ arr[i].nom + "'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }

        else if ((arr[i].prenom+ ' '+arr[i].nom).substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          //condition si on fait une recherche par le prenom et le nom
          b = document.createElement("DIV");
          b.innerHTML =  arr[i].nom +' '+"<strong>" + arr[i].prenom.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].prenom.substr(val.length);
          b.innerHTML += "<input type='hidden' value='"+arr[i].prenom +' '+ arr[i].nom + "'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }

        else if ((arr[i].nom+ ' '+arr[i].prenom).substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          //condition si on fait une recherche par le prenom et le nom
          b = document.createElement("DIV");
          b.innerHTML =  arr[i].nom +' '+"<strong>" + arr[i].prenom.substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].prenom.substr(val.length);
          b.innerHTML += "<input type='hidden' value='"+arr[i].prenom +' '+ arr[i].nom + "'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }
      }

    }
  });

  //partie pour le clavier;
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) { // touche up
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) { //si ENTER est  préssé
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

autocomplete(document.getElementById("recherche"), tabPatient);

/**************************  Fonctions GET database  **************************/

function getActivites() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let returnArray = JSON.parse(this.responseText);

        for (let i = 0; i < returnArray.length; i++) {
          tabActive.push(returnArray[i]);
        }
      }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/activites_list", true);
  xhttp.send();
}

function getResultats() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let returnArray = JSON.parse(this.responseText);

        for (let i = 0; i < returnArray.length; i++) {
          tabResultats.push(returnArray[i]);
        }
      }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/resultats", true);
  xhttp.send();
}

function getPatients() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let returnArray = JSON.parse(this.responseText);

        for (let i = 0; i < returnArray.length; i++) {
          tabPatient.push(returnArray[i]);
        }
      }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/patients", true);
  xhttp.send();
}
