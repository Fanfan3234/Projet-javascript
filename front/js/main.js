// initialisation
$(".contenu").hide();
$("section[data-cible=tab-bord ]").show();

$(document).on("click", ".nav-link", function (e) {
  e.preventDefault();
  $(".contenu").hide();
  // recupérer la valeur de l'attribut data du lien
  let valeurSource = $(this).data("source");
  // chercher la div dont la'ttribut data a cette valeur et l'afficher
  $("section[data-cible='" + valeurSource + "']").show();
});
// gestion des evenements
$(document).on("click", "a[data-source=liste]", affichage);
$(document).on("click", ".supp", suppression);
$(document).on(
  "click",
  "section[data-cible=nouveau] button[type=submit]",
  ajout
);
$(document).on("click", ".maj", modif);
$(document).on("click", "section[data-cible=modif] button[type=submit]", maj);

// les fonctions

function ajout(e) {
  /* 
  formulaire dans le html (section "nouveau")
  recupérer les valeurs des inputs
  les mettre au type json
  requete ajax, 
  type POST
  url : "http://localhost:3000/videos"
  data :  json qui contient les données
  type json
  */

  e.preventDefault();
  let donnees = {
    id: Date.now(),
    miniature: $("#miniature").val(),
    nom: $("#nom").val(),
    lien: $("#lien").val(),
  };

  let request = $.ajax({
    type: "POST",
    url: "http://localhost:3000/videos",
    data: donnees,
    dataType: "json",
  });

  request.done(function (response) {
   
    $("#miniature").val("");
    $("#nom").val("");
    $("#lien").val("");

    let htmlNotif = `
      <button type="button" class="btn btn-primary d-none" id="liveToastBtn">Show live toast</button>

      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="liveToast">
        <div class="toast-header">
          <strong class="me-auto">Création de la vidéo réussie</strong>
          <small>${response.id}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <b>ID : </b> ${response.id} <br>
          <b>Categorie : </b>  <br>
          
          <b>Miniature : </b> <img src="${response.miniature}"width="10%"> <br>
          <b>Nom :</b> ${response.nom}<br>
          <b>Lien :</b> <a class="btn btn-primary" href="${response.lien}">lien vers la video</a><br>
          <div class="mt-2 pt-2 border-top">
            <button type="button" class="btn btn-primary btn-sm liste">Liste des vidéos</button>
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Fermer</button>
          </div>
        </div>
      </div>
    `;
    $(".notif").html(htmlNotif);
    const toastTrigger = document.getElementById("liveToastBtn");
    const toastLiveExample = document.getElementById("liveToast");
    if (toastTrigger) {
      toastTrigger.addEventListener("click", () => {
        const toast = new bootstrap.Toast(toastLiveExample, {
          autohide: false,
        });
        toast.show();
      });
    }
    $("#liveToastBtn").trigger("click");
    $(document).on("click", "button.liste", function (e) {
      $(".notif").html("");
      $("a[data-source=liste]").trigger("click");
    });
  });
  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });

  
}



function affichage(e) {
  e.preventDefault();
  let request = $.ajax({
    type: "GET",
    url: "http://localhost:3000/videos",
    dataType: "json",
  });

  request.done(function (response) {
    let html = "";
    if (response.length === 0) {
      html = `<h2 class="py-4 h1 ">Aucune vidéo n'a été trouvée.  </h2>`;
    } else {
      html += `
    <h2 class="py-4 h1 ">Liste des videos </h2>
    <table class="table table-striped ">
      <thead>
        <tr>
          
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>`;

      response.map(function (videos) {
        html += `
        <tr style='background-image: url("${videos.miniature}");'>
          
          
          <td><a  href="${videos.miniature}"><img src="${videos.miniature}" class="contenu col-12 col-md-4 offset-md-4 mt-4"></a></td>
          <td style='color: white;'>${videos.nom}</td>
          <td> <a class="btn btn-primary" href="${videos.lien}">lien vers la video</a></td>
          <td>
            <button type="button" data-id="${videos.id}" class="btn btn-info text-white maj"><i class="fa-solid fa-pen-to-square"></i> Modifier</button>
            <button type="button" data-id="${videos.id}" class="btn btn-danger supp"><i class="fa-solid fa-trash-can"></i> Supprimer</button>
          </td>
        </tr>`;
      });

      html += `</tbody>
            </table>
    `;
    }

    $("section[data-cible='liste']").html(html);
  });
  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
}



function suppression(e) {
  // 1- récupérer l'id à partir de l'attribut data-id
  // 2- faire une requete ajax :
  //   -- verbe HTTP : DELETE
  //   -- route : videos/--id
  //   -- id : id de la video (etape 2)

  let id = $(e.target).data("id");
  let request = $.ajax({
    type: "DELETE",
    url: "http://localhost:3000/videos/" + id,
  });

  request.done(function (response) {
    affichage(e);
  });
  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
}

function modif(e) {
  /* pre-remplir le form
  recuperer l'id de la video
  requete ajax 
  type : get
  route : GET    /videos/1
  recup des valeurs + mettre les infos dans les inputs
  */
  let id = $(e.target).data("id");
  let request = $.ajax({
    type: "GET",
    url: "http://localhost:3000/videos/" + id,
    dataType: "json",
  });

  request.done(function (response) {
    $(".contenu").hide();
    $("section[data-cible=modif]").show();

    $("#idModif").val(response.id);
    $("#categorieModif").val(response.categorie);
    $("#miniatureModif").val(response.miniature);
    $("#nomModif").val(response.nom);
    $("#lienModif").val(response.lien);
  });
  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
}

function maj(e) {
  e.preventDefault();
  let id = $("#idModif").val();
  let donnees = {
    id: id,
    miniature: $("#miniatureModif").val(),
    nom: $("#nomModif").val(),
    lien: $("#lienModif").val(),
  };

  let request = $.ajax({
    type: "PUT",
    url: "http://localhost:3000/videos/" + id,
    data: donnees,
    dataType: "json",
  });

  request.done(function (response) {
    let htmlNotif = `
      <button type="button" class="btn btn-primary d-none" id="liveToastBtn">Show live toast</button>

      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id="liveToast">
        <div class="toast-header">
          <strong class="me-auto">Mise à jour de la vidéo réussie</strong>
          <small>${response.id}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <h3>Nouvelles valeurs : </h3>
          <b>ID : </b> ${response.id} <br>
          <b>Miniature : </b> <img src="${response.miniature}"width="10%"> <br>
          <b>Nom :</b> ${response.nom}<br>
          <b>Lien :</b> <a class="btn btn-primary" href="${response.lien}">lien vers la video</a><br>
          <div class="mt-2 pt-2 border-top">
            <button type="button" class="btn btn-primary btn-sm liste">Liste des contacts</button>
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Fermer</button>
          </div>
        </div>
      </div>
    `;
    $(".notif").html(htmlNotif);
    const toastTrigger = document.getElementById("liveToastBtn");
    const toastLiveExample = document.getElementById("liveToast");
    if (toastTrigger) {
      toastTrigger.addEventListener("click", () => {
        const toast = new bootstrap.Toast(toastLiveExample, {
          autohide: false,
        });
        toast.show();
      });
    }
    $("#liveToastBtn").trigger("click");
    $(document).on("click", "button.liste", function (e) {
      $(".notif").html("");
      $("a[data-source=liste]").trigger("click");
    });
  });
  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
}




