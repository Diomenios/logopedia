'use strict';

let USERNAME;
let PASSWORD;
let CURRENT_TABLE;

let mvWindowTitle;
let mvLoginPassword;
let mvTablesList;
let mvTableBody;
let mvUpdateRow;

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
      display:"block"
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
    },
    methods:{
      loadTable: function(tableName){
        getTableColumnsTitle(tableName);
        getTableBody(tableName);
        mvTableBody.displayUpdate= "flex";
        CURRENT_TABLE = tableName;
        mvTableBody.updateMessage="";
        mvTableBody.displayBody="flex";
        mvTableBody.displayRow="none";
        mvTableBody.row=[];
      }
    }
  });

  mvTableBody = new Vue({
    el:"#tableDescription",
    data: {
      columns:[],
      rows:[],
      row:[],
      updateMessage:"",
      displayBody: "flex",
      displayRow: "none",
      displayUpdate: "none"
    },
    methods:{
      updateDelete:function(row){
        this.displayBody="none";
        this.displayRow="flex";
        for(let elem in row){
          this.row.push({value: row[elem], columnName: this.columns[elem].name});
        }
      },
      updateRow:function () {
        this.displayBody="flex";
        this.displayRow="none";
        updateRow(this.row);
        this.row = [];
      },
      deleteRow:function (){
        this.displayBody="flex";
        this.displayRow="none";
        deleteRow(this.row);
        this.row =[];
      }
    }
  });

}

function updateDatabaseTable(){

  let inputToDatabase={};

  for (let i = 0 ; i < mvTableBody.columns.length ; i++) {
    //inputToDatabase.push({[mvTableBody.columns[i].name] : mvTableBody.columns[i].value});
    inputToDatabase[mvTableBody.columns[i].name] = mvTableBody.columns[i].value;
  }

  updateTable(inputToDatabase);
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

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/outils/validate_root_user?admin_password="+ password + "&admin_user="+user, true);
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

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/tables_name?admin_user=" + USERNAME + "&admin_password=" + PASSWORD, true);
  xhttp.send();
}

function getTableColumnsTitle(tableName){
  let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);

            if (returnValues.boolean) {

              mvTableBody.columns=[];
              for (let elem in Object.keys(returnValues.requestBody)) {
                mvTableBody.columns.push({name:returnValues.requestBody[elem].COLUMN_NAME, requested:returnValues.requestBody[elem].IS_NULLABLE, value:""});
              }
            }
            else{
              console.log(returnValues.message);
            }
        }
  };

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/table_columns_x?admin_user=" + USERNAME + "&admin_password=" + PASSWORD + "&table=" +tableName, true);
  xhttp.send();
}

function getTableBody(tableName){
  let xhttp = new XMLHttpRequest();

 	xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            if (returnValues.boolean) {
              mvTableBody.rows=[];
              for (let rowNum of Object.keys(returnValues.requestBody)) {
                let row=[];

                for(let elemKey of Object.keys(returnValues.requestBody[rowNum])){
                  row.push(returnValues.requestBody[rowNum][elemKey]);
                  row.push()
                }

                mvTableBody.rows.push(row);
              }
            }
            else{
              console.log(returnValues.message);
            }
        }
  };

 	xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/table_x?admin_user=" + USERNAME + "&admin_password=" + PASSWORD + "&table=" +tableName, true);
  xhttp.send();
}

function updateTable(datas){
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            mvTableBody.updateMessage=returnValues.requestBody;
        }
  };

  let request = ""
  for(let key of Object.keys(datas)){
    request += "&"+key+"="+datas[key];
  }

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/add_"+ CURRENT_TABLE +"?admin_user=" + USERNAME + "&admin_password=" + PASSWORD + request, true);
  xhttp.send();
}

function updateRow(datas){
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            console.log(returnValues);
        }
  };

  let request = ""
  for(let elem of datas){
    request += "&"+elem.columnName+"="+elem.value;
  }

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/update_"+ CURRENT_TABLE +"?admin_user=" + USERNAME + "&admin_password=" + PASSWORD + request, true);
  xhttp.send();
}

function deleteRow(datas){
  let xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
            let returnValues = JSON.parse(this.responseText);
            console.log(returnValues);
        }
  };

  let request = ""
  for(let elem of datas){
    request += "&"+elem.columnName+"="+elem.value;
  }

  xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/admin/delete_"+ CURRENT_TABLE +"?admin_user=" + USERNAME + "&admin_password=" + PASSWORD + request, true);
  xhttp.send();
}
