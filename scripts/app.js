var objFirebase;
var objDatabase;

var app = {
  lblMessage,
  mdlMessage,
  btnLogoff,

  frmLogin,
  txtEnterpriseID,
  txtPassword,
  pnlPasswordConfirm,
  txtPasswordConfirm,
  lnkForgotPassword,
  btnLogin,
  chkRegisterNewUser,
  btnRegisterNewUser,

  arrSkills: [],
  frmMySkills,
  lstMySkills,
  mdlUserSkill,
  lnkSalvarSkills,

  objModalUserSkill: null,
  lblSkillID,
  lblSkillName,
  lblSkillImage,
  txtSkillMyLevel,
  pgbSkillMyLevel,
  lblSkillLevelName,
  lblSkillLevelDescription,
  txtSkillNumberProjects,

  // Application Constructor
  initialize: function () {
    //document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    this.bindEvents();
    // Initialize Firebase
    objFirebase = firebase.initializeApp(CONFIG_FIREBASE);
    // Show user logged
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
    // Load the app    
    this.onLoaded();
  },

  bindEvents: function () {
    //App Controlls    
    lblMessage = document.getElementById('lblMessage');
    mdlMessage = document.getElementById('mdlMessage');
    btnLogoff = document.getElementById('btnLogoff');
    //Controlls Login
    frmLogin = document.getElementById('frmLogin');
    txtEnterpriseID = document.getElementById('txtEnterpriseID');
    txtPassword = document.getElementById('txtPassword');
    pnlPasswordConfirm = document.getElementById('pnlPasswordConfirm');
    txtPasswordConfirm = document.getElementById('txtPasswordConfirm');
    lnkForgotPassword = document.getElementById('lnkForgotPassword');
    btnLogin = document.getElementById('btnLogin');
    chkRegisterNewUser = document.getElementById('chkRegisterNewUser');
    btnRegisterNewUser = document.getElementById('btnRegisterNewUser');

    //Controlls Skill 
    frmMySkills = document.getElementById('frmMySkills');
    lstMySkills = document.getElementById('lstMySkills');
    mdlUserSkill = document.getElementById('mdlUserSkill');
    lnkSalvarSkills = document.getElementById('lnkSalvarSkills');

    //Controlls Skill Modal
    lblSkillID = document.getElementById('lblSkillID');
    lblSkillName = document.getElementById('lblSkillName');
    lblSkillImage = document.getElementById('lblSkillImage');
    txtSkillMyLevel = document.getElementById('txtSkillMyLevel');
    pgbSkillMyLevel = document.getElementById('pgbSkillMyLevel');
    lblSkillLevelName = document.getElementById('lblSkillLevelName');
    lblSkillLevelDescription = document.getElementById('lblSkillLevelDescription');
    txtSkillNumberProjects = document.getElementById('txtSkillNumberProjects');

    //Events
    txtEnterpriseID.addEventListener("keydown", function (event) {
      if (event.key === "Enter") txtPassword.focus();
    });
    txtPassword.addEventListener("keydown", function (event) {
      if (event.key === "Enter")
        if (chkRegisterNewUser.value == "checked")
          txtPasswordConfirm.focus();
        else
          btnLogin.focus();
    });
    txtPasswordConfirm.addEventListener("keydown", function (event) {
      if (event.key === "Enter") btnRegisterNewUser.focus();
    });
    lnkForgotPassword.addEventListener('click', this.fnForgotPassword, false);
    btnLogin.addEventListener('click', this.fnLogin, false);
    chkRegisterNewUser.addEventListener('click', this.onCheckedRegisterNewUser, false);
    btnRegisterNewUser.addEventListener('click', this.fnRegisterNewUser, false);
    btnLogoff.addEventListener('click', this.fnLogoff, false);
    txtSkillNumberProjects.addEventListener("keydown", function (event) {
      if (event.key === "Enter") lnkSalvarSkills.focus();
    });
    lnkSalvarSkills.addEventListener('click', this.fnSalvarSkills, false);

  },

  onDeviceReady: function () {

  },

  onCheckedRegisterNewUser: function () {
    if (chkRegisterNewUser.value == "") {
      chkRegisterNewUser.innerHTML = "Voltar";
      chkRegisterNewUser.value = "checked";
      pnlPasswordConfirm.style.display = "block";
      lnkForgotPassword.style.display = "none";
      btnLogin.style.display = "none";
      btnRegisterNewUser.style.display = "block";
    } else {
      chkRegisterNewUser.innerHTML = "Não possui cadastro?";
      chkRegisterNewUser.value = "";
      pnlPasswordConfirm.style.display = "none";
      lnkForgotPassword.style.display = "block";
      btnLogin.style.display = "block";
      btnRegisterNewUser.style.display = "none";
    }
  },

  fnClearForm: function () {
    chkRegisterNewUser.value = "checked";
    txtEnterpriseID.value = "";
    txtPassword.value = "";
    txtPasswordConfirm.value = "";
    this.onCheckedRegisterNewUser();

    //Reset form labels
    M.updateTextFields();

    //Remove valid state from class
    txtEnterpriseID.classList.remove("valid");
    txtPassword.classList.remove("valid");
    txtPasswordConfirm.classList.remove("valid");

  },

  onLoaded: function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').then(function () {

      });
    }

    lblMessage.innerHTML = "";
    this.onCheckedRegisterNewUser();
  },

  fnShowMessage: function (vMessage) {
    var objModal = M.Modal.init(mdlMessage, null);
    lblMessage.innerHTML = vMessage;
    objModal.open();
  },

  fnCheckEMail: function (vEMail) {
    var objRegExp = new RegExp(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/);

    if (objRegExp.test(vEMail)) {
      return true;
    } else {
      return false;
    }
  },

  fnCheckFormIsValid: function () {
    var strEMail = txtEnterpriseID.value.toLowerCase();
    var strPassword = txtPassword.value.toLowerCase();

    if (app.fnCheckEMail(strEMail)) {
      app.fnShowMessage("Enterprise ID não deve ser um e-mail.");
      return false;
    }
    if (strPassword.length < 8) {
      app.fnShowMessage("Senha deve conter 8 ou mais caracteres.");
      return false;
    }
    return true;
  },

  onAuthStateChanged: function (user) {
    // Check if the user is logged
    if (user) {
      frmLogin.style.display = "none";
      btnLogoff.style.display = "block";
      frmMySkills.style.display = "block";
      app.arrMySkills = [];
      app.fnClearForm();
      app.fnLoadSkills();
    } else {
      frmLogin.style.display = "block";
      btnLogoff.style.display = "none";
      frmMySkills.style.display = "none";
    }
  },

  fnLogin: function () {
    if (!app.fnCheckFormIsValid) {
      return;
    }

    var strEMail = txtEnterpriseID.value.toLowerCase() + "@accenture.com";
    var strPassword = txtPassword.value.toLowerCase();

    firebase.auth().signInWithEmailAndPassword(strEMail, strPassword)
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        app.fnShowMessage("Usuário ou senha inválido!");
      });
  },

  fnLogoff: function () {
    firebase.auth().signOut();
  },

  fnForgotPassword: function () {
    var strEMail = txtEnterpriseID.value.toLowerCase() + "@accenture.com";

    firebase.auth().sendPasswordResetEmail(strEMail).then(function () {
      app.fnShowMessage("Um link para resetar a senha foi enviado em seu e-mail!");
    }).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      app.fnShowMessage("Informe um Enterprise ID cadastrado no MySkills!");
    });
  },

  fnRegisterNewUser: function () {
    if (!app.fnCheckFormIsValid) {
      return;
    }

    var strEMail = txtEnterpriseID.value.toLowerCase();
    var strPassword = txtPassword.value.toLowerCase();
    var strPasswordConfirm = txtPasswordConfirm.value.toLowerCase();

    if (strPassword != strPasswordConfirm) {
      app.fnShowMessage("Confirmação da Senha não confere com a senha.");
      return;
    }
    strEMail += "@accenture.com";

    firebase.auth().createUserWithEmailAndPassword(strEMail, strPassword).catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode == 'auth/weak-password') {
        app.fnShowMessage("Senha informada não atende aos padrões de segurança!");
      } else if (errorCode == 'auth/email-already-in-use') {
        app.fnShowMessage("Usuário já possui cadastro no sistema, utilize a opção Esqueci minha senha!");
      } else {
        app.fnShowMessage("Erro ao registrar o usuário!");
      }
    });
  },

  fnLoadSkills: function () {

    for (var i = 0; i < SKILLS.length; i++) {
      objDatabase = firebase.database();
      objDatabase.ref("/userskills/" + firebase.auth().currentUser.uid + '/skills/' + SKILLS[i].id).once('value').then(
        function (vUserSkill) {
          vID = vUserSkill.key - 1;

          var objUserSkill = vUserSkill.val();
          var objSkill = {
            id: SKILLS[vID].id,
            name: SKILLS[vID].name,
            image: SKILLS[vID].image,
            color: SKILLS[vID].color,
            myLevel: 0,
            numberProjects: 0,
            updateDate: ''
          };

          if (objUserSkill != null) {
            objSkill.myLevel = objUserSkill.myLevel;
            objSkill.numberProjects = objUserSkill.numberProjects;
          }

          app.arrMySkills.push(objSkill);
          app.onRenderListSkills();
        });
    }
  },

  onRenderListSkills: function () {
    var strListSkills = '';
    app.arrMySkills.forEach(function (vSkill) {
      strListSkills += '<div class="col s6 m3" onclick="app.fnShowUserSkill(' + vSkill.id + ');">';
      strListSkills += '<div class="card" style="border-radius: 3%; background-color:' + vSkill.color + '">';
      strListSkills += '<div class="card-image center">';
      strListSkills += '<img src="images/' + vSkill.image + '" alt="" style="width: 50%; height: 50%; padding-top: 15%; display: inline;">';
      //strListSkills += '<span class="card-title black-text">'+ data.val().name +'</span>';
      strListSkills += '</div>';
      strListSkills += '<div class="card-content">';
      strListSkills += '<p style="font-family:Montserrat, sans-serif"><b>Nível:</b><br> ' + SKILL_LEVEL[vSkill.myLevel].Name + '</p>';
      strListSkills += '<p style="font-family:Montserrat, sans-serif"><b>Projetos:</b> ' + vSkill.numberProjects + '</p>';
      strListSkills += '</div>';
      strListSkills += '</div>';
      strListSkills += '</div>';
    });
    document.getElementById('lstMySkills').innerHTML = strListSkills;
  },

  intSelectSkillID: 0,
  checkSkillID: function (vSkill) {
    return (vSkill.id == app.intSelectSkillID);
  },

  fnSetMySkill: function (vSkillLevel) {
    txtSkillMyLevel.value = vSkillLevel;
    lblSkillLevelName.innerHTML = SKILL_LEVEL[vSkillLevel].Name;
    pgbSkillMyLevel.style.width = SKILL_LEVEL[vSkillLevel].Percent;
    lblSkillLevelDescription.innerHTML = SKILL_LEVEL[vSkillLevel].Description;
  },

  fnShowUserSkill: function (vSkillID) {
    app.intSelectSkillID = vSkillID;
    var objSkill = app.arrMySkills.find(app.checkSkillID);

    lblSkillID.innerHTML = objSkill.id;
    lblSkillName.innerHTML = objSkill.name;
    lblSkillImage.innerHTML = objSkill.image;
    app.fnSetMySkill(objSkill.myLevel);
    txtSkillNumberProjects.value = objSkill.numberProjects;

    app.objModalUserSkill = M.Modal.init(mdlUserSkill, null);
    app.objModalUserSkill.open();
  },

  fnSalvarSkills: function () {
    var objSkill = app.arrMySkills.find(app.checkSkillID);
    if (Number(txtSkillNumberProjects.value) < 0 || Number(txtSkillNumberProjects.value) > 100) {
      alert("Informe a quantidade de projetos entre 0 e 100.");
      return;
    }

    var objSkillDate = new Date();
    objSkill.myLevel = txtSkillMyLevel.value;
    objSkill.numberProjects = txtSkillNumberProjects.value;
    objSkill.updateDate = objSkillDate.getFullYear() + '/' + (objSkillDate.getMonth() + 1) + "/" + objSkillDate.getDate();

    objDatabase = firebase.database();
    var objRefUser = objDatabase.ref('/userskills/' + firebase.auth().currentUser.uid);
    objRefUser.once('value').then(function (vUserSkill) {
      if (vUserSkill.val() == null) {
        objRefUser.set({
          uid: firebase.auth().currentUser.uid,
          user: firebase.auth().currentUser.email
        });
      }

      var objRefUserSkill = objDatabase.ref('/userskills/' + firebase.auth().currentUser.uid + '/skills/' + objSkill.id);
      objRefUserSkill.set({
        id: objSkill.id,
        name: objSkill.name,
        myLevel: objSkill.myLevel,
        numberProjects: objSkill.numberProjects,
        updateDate: objSkill.updateDate
      });

      //TODO: atualizar somente o card alterado
      app.onRenderListSkills();
    });

    app.objModalUserSkill.close();
  }
};

window.onload = function () {
  app.initialize();
}