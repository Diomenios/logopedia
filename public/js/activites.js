
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
        bouton.display = "block";

      },
      cacherDescription : function (bouton){
        bouton.display = "none";
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
          BUTTONS.push({display: 'none', object: returnArray[i]});
        }
        console.log(BUTTONS);
      }
  };

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/activites_list", true);
  xhttp.send();
}
