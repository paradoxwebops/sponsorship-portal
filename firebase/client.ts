// Import the functions you need from the SDKs you need
import { initializeApp, getApp , getApps } from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB-7F_JrCbfKfbLrKwh_Pw2oXMl7YD69t4",
    authDomain: "sponsorship-portal-60d0d.firebaseapp.com",
    projectId: "sponsorship-portal-60d0d",
    storageBucket: "sponsorship-portal-60d0d.firebasestorage.app",
    messagingSenderId: "193708754615",
    appId: "1:193708754615:web:8061c7237b87d174b46f32",
    measurementId: "G-L18SKQPTDN"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth();
export const db = getFirestore(app)