'use strict';

let USERNAME;
let PASSWORD;

let mvWindowTitle;
let mvLoginPassword;

function onload(){

  mvWindowTitle  = new Vue({
		el:"#windowTitle",
		data:{
      title: "Administrateur Login"
		}
	});

  mvLoginPassword = new Vue({
    el:"#loginPassword",
    data:{
      login:"",
      password:"",
      errorMessage:""
    },
    methods:{
      checkLoginPassword: function(){
        validateConnection(this.login, this.password);
      }
    }
  });
}

function validateConnection(user, password){
	let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);

            if (returnValues[0].boolean) {
              PASSWORD = password;
              USERNAME = user;
            }
            else{
              mvLoginPassword.password="";
              mvLoginPassword.errorMessage="Le mot de passe et/ou l'administrateur rentré est incorrecte !"
            }
        }
  };

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/connection?type="+type, true);
  xhttp.send();
}
