'use strict'

const ACTIVITIES_LIST = ["Orthographe", "Vocabulaire","Drag et Drop"];


/**
 *
 * connection module
 */
function connexion(){
	let connect = '<div class="row">'
					+'<div class="col-sm-9 col-md-7 col-lg-5 mx-auto"><div class="card card-signin my-5"><div class="card-body">'
					+'<h5 class="card-title text-center">Sign In</h5><form class="form-signin"><div class="form-label-group">'
					+'<input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>'
					+'<label for="inputEmail">Adresse Email</label></div><div class="form-label-group">'
					+'<input type="password" id="inputPassword" class="form-control" placeholder="Password" required>'
					+'<label for="inputPassword">Mot de passe</label></div><div class="custom-control custom-checkbox mb-3">'
					+'<input type="checkbox" class="custom-control-input" id="customCheck1">'
					+'<label class="custom-control-label" for="customCheck1">Remember password</label></div>'
					+'<button class="btn btn-lg btn-primary btn-block text-uppercase" type="submit">Sign in</button>'
					+'<hr class="my-4"></form></div></div></div></div>'
	document.getElementById("boite").innerHTML = connect;
}

//var tabPhotoProfil = ["../img/photo_de profil_test.jpg","../img/photo_de profil_test2.jpg"];

  function NewSite() {
	var sectionNews = document.getElementById("news_site");

	let info_news = "";
	let xhttp = new XMLHttpRequest();

		xhttp.onreadystatechange = function() {
					 if (this.readyState == 4 && this.status == 200) {
							let returnValues = JSON.parse(this.responseText);
							for (let i = 0; i < Object.keys(returnValues).length ; i++) {

								info_news += "<tr><td class='td'>"+returnValues[i].version +"</td><td class='td'>"+returnValues[i].modification +"</td></tr></tbody></table>";

							}
							console.log(sectionNews.innerHTML );
							sectionNews.innerHTML = info_news;
					}

		};
		xhttp.open("GET", "https://"+ DOMAIN_IP +"/api/news", true);
		xhttp.send();

  }

/*Partie pour l'activité orthographe*/
