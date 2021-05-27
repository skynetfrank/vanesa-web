
//template para configurar firebase

var firebaseConfig = {
  apiKey: "AIzaSyARhLtEx8NFvmeWBupP6Fi95pr0X3igojw",
  authDomain: "dental-project-def14.firebaseapp.com",
  projectId: "dental-project-def14",
  storageBucket: "dental-project-def14.appspot.com",
  messagingSenderId: "293629202563",
  appId: "1:293629202563:web:964c62559b87517dec8bb6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
//const funciones = firebase.functions();


