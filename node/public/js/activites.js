"use strict"

const BUTTONS =[{url: "activites/activite-orthographe", id:"bouton_activités", name: "Orthographe"},
              ];
let vm;

function init(){

  vm = new Vue({
    el:"#activities-buttons",
    data:{
      buttons:BUTTONS,
      hidden:"visible"
    }
  });
}
