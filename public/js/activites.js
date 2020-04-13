"use strict"

const BUTTONS =[];
let mv;

function init(){

  mv = new Vue({
    el:"#activities-buttons",
    data:{
      buttons:BUTTONS,
      hidden:"visible"
    },
    methods:{
      afficherDescription : function (bouton){
        bouton.visibility = "visible";
      },
      cacherDescription : function (bouton){
        bouton.visibility = "hidden";
      }
    }
  });
}

function afficherDescription(){
  console.log("description affichée");
}

function cacherDescription(){
  console.log("description cachée");
}

function getActivites() {
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let returnArray = JSON.parse(this.responseText);

        for (let i = 0; i < returnArray.length; i++) {
          BUTTONS.push({visibility: 'hidden', object: returnArray[i]});
        }
        console.log(BUTTONS);
      }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/activites_list", true);
  xhttp.send();
}
