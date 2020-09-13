import firebase from 'firebase';
import '@firebase/firestore';
import '@firebase/storage';
import '@firebase/auth';

// Run Locally: 
// create a file named `firebase.js`
// and export firebase configuration for empty firebase project
const firebaseConfig = require('./firebase')

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

let storage = firebase.storage();

let auth = firebase.auth();

export { db, storage, auth };
