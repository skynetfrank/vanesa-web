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
  await configDia();

  //solo se puede apartar citas a partir del dia actual (dias pasados son inhabilitados)
  const fechaDeHoy = new Date(); // Gets today's date
  let minDate = convertirFecha(fechaDeHoy);
  document.getElementById("fecha").setAttribute('min', minDate);

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

  const email = formLogin["email"].value;
  const pw = formLogin["password"].value;
  const nombre = formLogin["nombre"].value;
  const apellido = formLogin["apellido"].value;
  const cedula = formLogin["cedula"].value;
  const hora = formLogin["hora"].value;
  const fecha = formLogin["fecha"].value;
  const mensaje = formLogin["mensaje"].value;


  try {
    //Log-in con email y password
    if (!nombre && !apellido && !cedula && !hora && !fecha) {
      console.log("Es autenticacion")
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(() => {
          // Existing and future Auth states are now persisted in the current session only.
          // Closing the window would clear any existing state even if a user forgets to sign out.
          return firebase.auth().signInWithEmailAndPassword(email, pw);

        }).catch((error) => alert(error.message));
    }

    // sign-up con datos adicionales
    if (nombre && apellido && cedula) {
      console.log("Sig-Up Registro de nuevo usuario")
      const credencial = await auth.createUserWithEmailAndPassword(email, pw);
      db
        .collection("users")
        .doc(credencial.user.uid)
        .set({
          nombre: nombre,
          apellido: apellido,
          cedula: cedula,
        });
    }

    //Agendar una cita -firebase-
    if (fecha && hora) {
      db.collection("citas")
        .where('fecha', '==', fecha)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            console.log("cita apartada el:", " ====> ", doc.data().fecha, doc.data().hora);
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });

      db
        .collection("citas")
        .doc()
        .set({
          fecha: fecha,
          hora: hora,
          msg: mensaje,
          paciente: auth.currentUser.uid,
        });
      document.getElementById("fecha").value = '';
      document.getElementById("hora").value = '';


    }
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Este Email ya ha sido registrado... verifique!");
    }
  }
})//eo inicio de sesion 





async function configDia() {

  let fecha = formLogin["fecha"].value;

  //si no hay fecha seleccionada se toma la fecha de hoy por defecto
  if (!fecha) {
    fecha = convertirFecha(new Date());
  }

  //tabla de horas por defecto de 7 a 7 (24 horas)
  var horas = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', ''];

  await db.collection("citas")
    .where('fecha', '==', fecha)
    .onSnapshot((querySnapshot) => {

      querySnapshot.forEach((doc) => {
        console.log("querysnapshot ForEach:", doc.data().hora);
        let position = horas.indexOf(doc.data().hora);
        console.log("position:", position);
        horas.splice(position, 1)
        console.log("horas despues del slice dentro del foreach", horas);

      });
      console.log("Horas after snapshot: ", horas);
      const tablaHoras = document.getElementById("datalist-horas");
      let options = '';
      for (let i = 0; i < horas.length; i++) {
        options += '<option value="' + horas[i] + '" />';

      }
      tablaHoras.innerHTML = options;

    });


  /* await db.collection("citas")
    .where('fecha', '==', fecha)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let position = horas.indexOf(doc.data().hora);
        horas.splice(position, 1);
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
 */





  return "done";
}




//********************************************************* */
//
//VERIFICACION DE LAS HORAS DISPONIBLES
//
//********************************************************** */



inputFecha.addEventListener('change', async (e) => {
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
  db.collection("citas").doc(id_cita).delete().then(() => console.log(result)).catch(error => console.log("error al eliminar cita! verifique..."));
});








//con cada cambio en la autenticacion del usuario: login - logout
auth.onAuthStateChanged((user) => {

  if (user) {
    console.log("auth changed: hay user");
    //set up UI para usuarios autenticados sin novedad.
    usuarioActual.innerHTML = 'hola: ' + user.email;
    document.getElementById("link-logout").style.display = "inline-block";
    document.getElementById("div-email").style.display = "none";
    document.getElementById("div-password").style.display = "none";
    document.getElementById("div-nombre").style.display = "none";
    document.getElementById("div-apellido").style.display = "none";
    document.getElementById("div-cedula").style.display = "none";
    document.getElementById("div-fecha").style.display = "inline-block";
    document.getElementById("div-hora").style.display = "inline-block";
    document.getElementById("fecha").setAttribute('required', 'true');
    document.getElementById("hora").setAttribute('required', 'true');
    document.getElementById("div-mensaje").style.display = "inline-block";
    document.getElementById("mostrar-citas").style.display = "inline-block";
    document.getElementById("link-registrar").style.display = "none";

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
          table.innerHTML = ''
          querysnapshot.forEach((doc) => {

            let data = doc.data();
            let row = `<tr>     <td id="td-id-hidden">${doc.id}</td>
                            <td>${formatearFecha(data.fecha)}</td>
                            <td>${data.hora}</td>
                            <td><button class="btnEliminar">eliminar</button></td>
                      </tr>`;
            table.innerHTML += row
          })
        });
    }
    citasPendientes();

    //fin de set up UI para usuarios autenticados sin novedad. 

  } else {
    console.log("No hay usuario: establecer UX para login");
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
    console.log("Set UX para login porque no hay usuario DONE!")
  }
})


//set up UI cuando se va a crear una cuenta nueva
document.getElementById("link-registrar").addEventListener('click', () => {
  console.log("clicked en el link registrar");
  document.getElementById("div-email").style.display = "inline-block";
  document.getElementById("div-password").style.display = "inline-block";
  document.getElementById("email").setAttribute('value', '');
  document.getElementById("password").setAttribute('value', '');;
  document.getElementById("div-nombre").style.display = "inline-block";
  document.getElementById("div-apellido").style.display = "inline-block";
  document.getElementById("div-cedula").style.display = "inline-block";
  document.getElementById("nombre").setAttribute('value', '');
  document.getElementById("apellido").setAttribute('value', '');
  document.getElementById("cedula").setAttribute('value', '');



  document.getElementById("cf-submit").innerHTML = "registrar";
  document.getElementById("nombre").setAttribute('required', true);
  document.getElementById("apellido").setAttribute('required', true);
  document.getElementById("cedula").setAttribute('required', true);
  linkRegistrar.style.display = "none";
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