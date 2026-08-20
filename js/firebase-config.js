// Firebase Configuration - IAXO Feed
// Projeto: iaxofeed (Firebase)
var firebaseConfig = {
    apiKey: "AIzaSyAjmX5UwtUzI6weGUKA29rvA1X9dr5Bse4",
    authDomain: "iaxofeed.firebaseapp.com",
    projectId: "iaxofeed",
    storageBucket: "iaxofeed.firebasestorage.app",
    messagingSenderId: "1084121374573",
    appId: "1:1084121374573:web:73898af709cf8ef1a28464"
};

// Initialize Firebase
var firebaseApp = firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var storage = firebase.storage();
