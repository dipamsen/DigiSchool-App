import firebase from 'firebase';
import '@firebase/firestore';
import '@firebase/storage';
import '@firebase/auth';

// Rename this file to config.js
/**
 * Create a new firebase project
 * Create a web app in the project
 * Create Cloud Firestore Bucket
 * Create Firebase Storage Bucket
 * Enable Authentication by Email and Password
 */

// You are good to go!

let firebaseConfig = {
  /**
   * Paste Your Firebase App Configuration Object Here
   * Get it from your Project Overview.
   */
  apiKey: ">>>>>>>",
  authDomain: '<<<<<<<<<<<',
  databaseURL: ':::::::::::::::::::::::::',
  projectId: '=======================',
  storageBucket: '@@@@@@@@@@@@@@@@@@@@@@@',
  messagingSenderId: '....................',
  appId: '0000000000000000000000000000'
}

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

let storage = firebase.storage();

let auth = firebase.auth();

export { db, storage, auth };
