import * as firebase from 'firebase/app'
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';

// Run Locally: 
// create a file named `firebase.js`
// and export firebase configuration for empty firebase project
const firebaseConfig = {
    apiKey: "AIzaSyCWGFFEdb3A2W4eJM6p1Nwupwc67SHNjZQ",
    authDomain: 'digischool-d8e49.firebaseapp.com',
    databaseURL: 'https://digischool-d8e49.firebaseio.com',
    projectId: 'digischool-d8e49',
    storageBucket: 'digischool-d8e49.appspot.com',
    messagingSenderId: '901374788253',
    appId: '1:901374788253:web:553a26cc3793d2ba5d4a74',
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

console.log((firebase.firestore))

let db = firebase.firestore();

let storage = firebase.storage();

let auth = firebase.auth();

export { db, storage, auth };
