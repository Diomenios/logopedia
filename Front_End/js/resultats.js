//TODO IL faut retravailler le code car il y a des truc qui fonctionne pas correctement

let tabListePatients = [
{id:0, nom:"Pham", prenom:"Anh-Emile", age:24, activites:[12,14,10,9], activitesTentatives:[1,4,10,5]},
{id:1, nom:"Arys", prenom:"Louis", age:24, activites:[12,8,0,0]},
{id:2, nom:"Arys", prenom:"Martin", age:24, activites:[12,8,0,0]},
{id:3, nom:"Perdaens", prenom:"Martin", age:24, activites:[12,8,0,0]},
{id:4, nom:"Dujardin", prenom:"Martin", age:24, activites:[12,8,0,0]},
{id:5, nom:"Perdaens", prenom:"Céline", age:22, activites:[12,8,0,0]},
{id:6, nom:"Perdaens", prenom:"Olivier", age:22, activites:[12,8,0,0]}
];

//tirer tableau des patients par ordre alphabétique
function compareName(a,b){
  if(a.nom > b.nom) return 1;
  if(a.nom < b.nom) return -1;
  if(a.prenom > b.prenom) return 1;
  if(a.prenom < b.prenom) return -1;
  return 0;
  }
  tabListePatients.sort(compareName);

//Création de la liste de patient avec Vue js
var vuePatients = new Vue({
  el: '#divPatient',
  data: {
    message: '',
    patients: []
  },
    methods: {
          recheche: function () {            
            /*Fonction pour faire la recheche dans la liste*/
            if(this.message === ''){
              alert("Veuillez introduire quelque chose svp")
            }
            else{
              listePatient = '<ul id="ligneListe" onclick="goResultats()">';
              let patientExiste = false;
              for(patient of tabListePatients){
                if(patient.nom == this.message || patient.prenom == this.message){
                  listePatient += '<li>'+ patient.prenom +' '+ patient.nom+'</li>';
                  patientExiste = true;
                }
              }
              if (!patientExiste) {
                listePatient += '<li>'+ 'LE PATIENT N\'EXISTE PAS' +'</li>';
              }
              listePatient += '</ul>'
              document.getElementById("patients").innerHTML = listePatient;
            }
          },
         annuler: function (){
           //Fonction qui permet de vider l'input après la recherche
           inputRecherche = document.getElementById('inputRecherche');
           inputRecherche.value = '';
           this.message = '';
         }
      }
    })

  for( listePatient of tabListePatients){
    vuePatients.patients.push({ text:`${listePatient.prenom} ${listePatient .nom}`})
  }



/*


//Fonction qui permet de faire le switch entre la liste et les différentes forment de résiltats
function goResultats(){
  //TODO
  let tabListePatients = [ // J'ai mis le tableau la de manière temporaire car quand il ne se trouve pas dans la fonction rien ne s'affiche dans les graph
    {id:0, nom:"Pham", prenom:"Anh-Emile", age:24, activites:[12,14,10,9], activitesTentatives:[1,4,10,5]},
    {id:1, nom:"Arys", prenom:"Louis", age:24, activites:[12,8,4,0], activitesTentatives:[1,4,10,5]},
    {id:2, nom:"Arys", prenom:"Martin", age:24, activites:[12,18,0,9], activitesTentatives:[1,4,10,5]},
    {id:3, nom:"Perdaens", prenom:"Martin", age:24, activites:[12,13,3,0], activitesTentatives:[1,4,10,5]},
    {id:4, nom:"Dujardin", prenom:"Martin", age:24, activites:[12,9,7,0], activitesTentatives:[1,4,10,5]},
    {id:5, nom:"Perdaens", prenom:"Céline", age:22, activites:[12,1,14,0], activitesTentatives:[1,4,10,5]},
    {id:6, nom:"Perdaens", prenom:"Olivier", age:22, activites:[12,8,17,10], activitesTentatives:[1,4,10,5]}
    ];

    //TODO problème au niv de récupére l'id ???????????????????????????????????
    let compteurPatientResultats = 0;
    $("#ligneListe li").click(function () {
      patient = this.textContent;
      console.log(patient)
      console.log(tabListePatients[0].nom+'prout')
      console.log(patient.split(' ')[1].replace("\n","")+'prout')
      console.log(tabListePatients[0].nom === patient.split(' ')[1])
      for(indicepatient of tabListePatients){
        if(indicepatient.nom == patient.split(' ')[1]){
          compteurPatientResultats = indicepatient.id
        }
      }

  $(document).ready(function(){
    $('#ligneListe').click(function(){
        $('#resultatsGraph').show();
        $('#divPatient').hide();
    });

    $('#boutonRetour').click(function(){
      $('#resultatsGraph').hide();
      $('#divPatient').show();
  });
  });
  //-------------------------------------------------------
  //Partie résultats texte

  let resultats = '<p>';
      resultats += `<h3>Patient: <span id="infoPatient">${tabListePatients[compteurPatientResultats].prenom} ${tabListePatients[compteurPatientResultats].nom}</span></h3>
      <table id="tableResultats">
      <thead>
      <tr>
      <th> Activité 1 </th>
      <th> Activité 2 </th>
      <th> Activité 3 </th>
      <th> Activité 4 </th>
      </tr>
      </thead>
      <tbody>
      <tr>
      <td>${tabListePatients[compteurPatientResultats].activites[0]}</td>
      <td>${tabListePatients[compteurPatientResultats].activites[1]}</td>
      <td>${tabListePatients[compteurPatientResultats].activites[2]}</td>
      <td>${tabListePatients[compteurPatientResultats].activites[3]}</td>
      </tr>
      </tbody> 
      </table>`;
  //}

  resultats += '</p>'
  +'<h3>Nombre de tentatives par activités:</h3>'
  +'<canvas id="graphique1"></canvas>'
  +'<h3>Points par activités:</h3>'
  +'<canvas id="graphique2"></canvas>';

  document.getElementById("resultatTexteGraph").innerHTML = resultats;

  //-------------------------------------------------------
  //Partie résultats Graphiques
  //partie pour le graph en formage
  new Chart(document.getElementById("graphique1"), {
    type: 'pie',
    data: {
      labels: ["Activité 1", "Activité 2", "Activité 3", "Activité 4"],
      datasets: [{
        label: "Tentatives aux différents activités",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
        data: tabListePatients[compteurPatientResultats].activitesTentatives
      }]
    },
    options: {}
});// fin du graph en fromage ici

  //partie pour le graph en bar

new Chart(document.getElementById("graphique2"), {
  type: 'bar',
  data: {
    labels: ["Activité 1", "Activité 2", "Activité 3", "Activité 4"],
    datasets: [
      {
        label: "Point des différentes activités",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],
        data: tabListePatients[compteurPatientResultats].activites
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
    },
    legend: { display: false }
  }
  }); // fin du graph bat ici
});
}*/
