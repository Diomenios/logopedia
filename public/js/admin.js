'use strict';

let USERNAME;
let PASSWORD;

let mvWindowTitle;
let mvLoginPassword;
let mvTablesList;

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
      login:"louis",
      password:"diomenios",
      errorMessage:"",
      display:"flex"
    },
    methods:{
      checkLoginPassword: function(){
        validateConnection(this.login, this.password);
      }
    }
  });
}

function startAmdinistrationGUI() {
  mvTablesList = new Vue({
    el:"#tablesList",
    data:{
      tables: [],
      display: "flex"
    }
  });
}

function validateConnection(user, password){
	let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            if (returnValues.boolean) {
              PASSWORD = password;
              USERNAME = user;
              mvLoginPassword.display="none";
              getTablesNames();
              startAmdinistrationGUI();
            }
            else{
              mvLoginPassword.password="";
              mvLoginPassword.errorMessage=returnValues.message;
            }
        }
  };

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/outils/validate_root_user?password="+ password + "&user="+user, true);
  xhttp.send();
}

function getTablesNames(){
  let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            if (returnValues.boolean) {
              for (let i = 0; i < Object.keys(returnValues.requestBody).length ; i++) {
                mvTablesList.tables.push(returnValues.requestBody[i].Tables_in_logopedia);
              }
            }
            else{
              console.log(returnValues.message);
            }
        }
  };

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/tables_name?password="+ PASSWORD + "&user="+USERNAME, true);
  xhttp.send();
}
