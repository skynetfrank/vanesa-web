(function ($) {
  "use strict";
  // PRE LOADER
  $(window).load(function () {
    $('.preloader').fadeOut(1000); // set duration in brackets    
  });
  //Navigation Section
  $('.navbar-collapse a').on('click', function () {
    $(".navbar-collapse").collapse('hide');
  });
  // Owl Carousel
  $('.owl-carousel').owlCarousel({
    animateOut: 'fadeOut',
    items: 1,
    loop: true,
    autoplay: true,
  })
  // PARALLAX EFFECT
  $.stellar();
  // SMOOTHSCROLL
  $(function () {
    $('.navbar-default a, #home a, footer a').on('click', function (event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - 49
      }, 1000);
      event.preventDefault();
    });
  });
  // WOW ANIMATION
  new WOW({ mobile: false }).init();

})(jQuery);


//script franklin bolivar mayo 2021
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("hora");
const botonCrearCita = document.getElementById("cf-submit");
const formLogin = document.getElementById("appointment-form");
const usuarioActual = document.getElementById("usuario");

(async function inicio() {
  //solo se puede apartar citas a partir del dia actual (dias pasados son inhabilitados)
  const fechaDeHoy = new Date(); // Gets today's date
  let minDate = convertirFecha(fechaDeHoy);
  document.getElementById("fecha").setAttribute('min', minDate);
  document.getElementById("div-hora").style.display = "none";

})();

//funcion para cambiar formato de fecha de AAAA-MM-DD a DD-MM-AAAA
function formatearFecha(nfecha) {
  var info = nfecha.split('-').reverse().join('/');
  return info;
}

//funcion para convertir fecha a formato AAAA-MM-DD
function convertirFecha(cfecha) {
  let year = cfecha.getFullYear();                        // YYYY
  let month = ("0" + (cfecha.getMonth() + 1)).slice(-2);  // MM
  let day = ("0" + cfecha.getDate()).slice(-2);           // DD
  return (year + "-" + month + "-" + day);
}

function arrayRemove(arr, value) {
  return arr.filter(function (ele) {
    return ele != value;
  });
}


//inicio de sesion
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  let email = formLogin["email"].value;
  let pw = formLogin["password"].value;
  let nombre = formLogin["nombre"].value;
  let apellido = formLogin["apellido"].value;
  let cedula = formLogin["cedula"].value;
  const hora = formLogin["hora"].value;
  const fecha = formLogin["fecha"].value;
  const mensaje = formLogin["mensaje"].value;

  try {
    //Log-in con email y password
    if (!nombre && !apellido && !cedula && !hora && !fecha) {
      console.log("Log-in inicio de sesion con email y password")
      await auth.signInWithEmailAndPassword(email, pw);
    }

    // sign-up con datos adicionales
    if (nombre && apellido && cedula) {

      const prueba = document.getElementById("email").value;

      auth.createUserWithEmailAndPassword(email, pw)
        .then((result) => {
          console.log("el nuevo usuario uid es: ", result.user.uid);
          db
            .collection("users")
            .doc(result.user.uid)
            .set({
              nombre: nombre,
              apellido: apellido,
              cedula: cedula,
            });
          document.getElementById("email").value = ''
          console.log("Promesa resuelta hacia el cambio de auth");
          /* document.getElementById("nombre").value = '';
          document.getElementById("apellido").value = '';
          document.getElementById("cedula").value = '';
          document.getElementById("email").value = ''
          document.getElementById("password").value = ''; */
        })
        .catch((error) => console.log("error al registrar usuario nuevo=====>>>: ", error));



    }


    //Agendar una cita -firebase-
    if (fecha && hora) {

      db
        .collection("citas")
        .doc()
        .set({
          fecha: fecha,
          hora: hora,
          msg: mensaje,
          paciente: auth.currentUser.uid,
        });
      console.log("Se a Apartado una cita OK el dia: ", fecha, " a las: ", hora);
      document.getElementById("fecha").value = '';
      document.getElementById("hora").value = '';
      document.getElementById("div-hora").style.display = "none"

    }


  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Este Email ya ha sido registrado. Verifique!");
    }
    if (error.code === "auth/invalid-email") {
      alert("El email esta mal escrito o el campo esta vacio. Verifique!");
    }
    if (error.code === "auth/user-not-found") {
      alert("Este usuario no existe. Registrate en el link de abajo para iniciar sesion.");
    }
    if (error.code === "auth/wrong-password") {
      alert("Disculpe, introdujo una clave erronea. Verifique.");
    }

  }
})//fin de inicio de sesion 





async function configDia() {

  let fecha = formLogin["fecha"].value;

  //si no hay fecha seleccionada se toma la fecha de hoy por defecto
  if (!fecha) {
    fecha = convertirFecha(new Date());
  }

  //tabla de horas por defecto de 7 a 7 (24 horas)
  var horas = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', ''];

  await db.collection("citas")
    .where('fecha', '==', fecha)
    .onSnapshot((querySnapshot) => {
      //este consulta devuelve las horas apartadas por usuario en la fecha del where
      //si devuelve algun dato (querysnapshot) se ejecuta este bloque forEach sino lo ignora 
      querySnapshot.forEach((doc) => {
        //esta hora (doc.data().hora) se elimina del rango de horas ya que esta apartada por usuario
        console.log("La Hora: ", doc.data().hora, " se elimino del rango de Horas para el control")
        let position = horas.indexOf(doc.data().hora);
        horas.splice(position, 1)
      });
      //El array con el rango de horas ha sido -cleaned- solo quedan las horas no apartadas
      //para este dia especifico del where de la consulta     
      const tablaHoras = document.getElementById("datalist-horas");
      let options = '';
      for (let i = 0; i < horas.length; i++) {
        options += '<option value="' + horas[i] + '" />';
      }
      tablaHoras.innerHTML = options;
    });

}




//********************************************************* */
//
//VERIFICACION DE LAS HORAS DISPONIBLES
//
//********************************************************** */



inputFecha.addEventListener('change', async (e) => {
  document.getElementById("div-hora").style.display = "inline-block"
  await configDia();
  const fechaSeleccionada = new Date(e.target.value);
  if (fechaSeleccionada.getDay() == 6 || fechaSeleccionada.getDay() == 5) {
    alert("Disculpe!... El Horario de atencion es de Lunes a Viernes exclusivamente");
    inputFecha.value = '';
  }
})



//Eliminar 1 cita 
document.getElementById("myTable").addEventListener('click', (e) => {
  e.preventDefault();
  const id_cita = e.target.parentNode.parentNode.querySelector('td:nth-child(1)').innerHTML;
  db.collection("citas").doc(id_cita)
    .delete()
    .then()
    .catch(error => console.log("error al eliminar cita! verifique..."));
  configDia();
});








//con cada cambio en la autenticacion del usuario: login - logout
auth.onAuthStateChanged((user) => {


  if (user) {
    console.log("AUTH CHANGED: USUARIO LOGEADO OK SETTING UX");

    //set up UI para usuarios autenticados sin novedad.
    usuarioActual.innerHTML = 'hola: ' + user.email;
    document.getElementById("link-registrar").style.display = "none";
    document.getElementById("link-logout").style.display = "inline-block";
    document.getElementById("div-email").style.display = "none";
    document.getElementById("div-password").style.display = "none";
    document.getElementById("div-nombre").style.display = "none";
    document.getElementById("div-apellido").style.display = "none";
    document.getElementById("div-cedula").style.display = "none";
    document.getElementById("div-fecha").style.display = "inline-block";
    //document.getElementById("div-hora").style.display = "inline-block";
    document.getElementById("fecha").setAttribute('required', 'true');
    document.getElementById("hora").setAttribute('required', 'true');
    document.getElementById("div-mensaje").style.display = "inline-block";
    document.getElementById("cf-submit").innerHTML = "Apartar Cita";


    const citasPendientes = async () => {
      const fechaDeHoy = convertirFecha(new Date()); // Gets today's date
      const allcitas = await db.collection('citas')
        .where('paciente', '==', auth.currentUser.uid)
        .where('fecha', '>=', fechaDeHoy)
        .orderBy('fecha', "asc")
        .orderBy('hora', "asc")
        .onSnapshot(querysnapshot => {
          let table = document.getElementById('myTable')
          document.getElementById("mostrar-citas").style.display = "inline-block";
          table.innerHTML = ''
          querysnapshot.forEach((doc) => {

            let data = doc.data();
            let row = `<tr>     <td id="td-id-hidden">${doc.id}</td>
                            <td>${formatearFecha(data.fecha)}</td>
                            <td class="td-hora">${data.hora}</td>
                            <td><button class="btnEliminar" id="btn-tabla">eliminar</button></td>
                      </tr>`;
            table.innerHTML += row
          })
          if (table.innerHTML === '') {
            document.getElementById("mostrar-citas").style.display = "none";
          }

        });
    }
    citasPendientes();



    //fin de set up UI para usuarios autenticados sin novedad. 

  } else {
    console.log("AUTH CHANGED! : No hay usuario establecer UX para login");
    document.getElementById("fecha").value = '';
    document.getElementById("hora").value = '';
    document.getElementById("fecha").removeAttribute('required');
    document.getElementById("hora").removeAttribute('required');
    document.getElementById("div-fecha").style.display = "none";
    document.getElementById("div-hora").style.display = "none";
    document.getElementById("div-nombre").style.display = "none";
    document.getElementById("div-apellido").style.display = "none";
    document.getElementById("div-cedula").style.display = "none";
    document.getElementById("div-mensaje").style.display = "none";
    document.getElementById("cf-submit").innerHTML = "Iniciar Sesion";
    document.getElementById("mostrar-citas").style.display = "none";
    document.getElementById("link-registrar").style.display = "inline-block";

  }
})


//set up UI cuando se va a crear una cuenta nueva
document.getElementById("link-registrar").addEventListener('click', () => {
  console.log("clicked en el link registrar");
  document.getElementById("link-registrar").style.display = "none";
  document.getElementById("div-email").style.display = "inline-block";
  document.getElementById("div-password").style.display = "inline-block";
  document.getElementById("email").setAttribute('value', '');
  document.getElementById("password").setAttribute('value', '');;
  document.getElementById("div-nombre").style.display = "inline-block";
  document.getElementById("div-apellido").style.display = "inline-block";
  document.getElementById("div-cedula").style.display = "inline-block";
  document.getElementById("nombre").value = '';
  document.getElementById("apellido").value = '';
  document.getElementById("cedula").value = '';

  document.getElementById("cf-submit").innerHTML = "Registrarse";
  document.getElementById("nombre").setAttribute('required', true);
  document.getElementById("apellido").setAttribute('required', true);
  document.getElementById("cedula").setAttribute('required', true);

})

//ojo con este codigo hay que evitar que el usuario introduzca una fecha
//que no esta en el datalist a traves del link ...otra del input time
inputHora.addEventListener('change', (e) => {
  e.preventDefault();
  console.log("listener del input hora disparado:  validar hora aqui porsia")
  //validar entrada aqui

});

//cerrar sesion -listo-
document.getElementById("link-logout").addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("User Logged-out");
    }).catch((error) => alert(error));
  usuarioActual.innerHTML = ' ';
  document.getElementById("link-logout").style.display = "none";
  document.getElementById("div-email").style.display = "inline-block";
  document.getElementById("div-password").style.display = "inline-block"
  document.getElementById("email").value = '';
  document.getElementById("password").value = '';
})


inputHora.addEventListener('click', (e) => {

  console.log("Input-hora evento click disparado")
})

inputHora.addEventListener('focus', (e) => {

  console.log("Input-hora evento focus disparado")
})