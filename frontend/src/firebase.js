// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnxpWLAfP_o58I7a3gEHyAgj6lbMtMdFQ",
  authDomain: "smartclassroom-fecc1.firebaseapp.com",
  projectId: "smartclassroom-fecc1",
  storageBucket: "smartclassroom-fecc1.firebasestorage.app",
  messagingSenderId: "296396836125",
  appId: "1:296396836125:web:8460c6e6086507db52e5f4",
  measurementId: "G-833F2XVB8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);