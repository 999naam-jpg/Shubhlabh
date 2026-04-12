import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAbwHfimHs-RLGugvSNc9o00YNRnpN9GYY",
  authDomain: "shuh-labh.firebaseapp.com",
  projectId: "shuh-labh",
  storageBucket: "shuh-labh.firebasestorage.app",
  messagingSenderId: "274479947020",
  appId: "1:274479947020:web:139a60906156b250f3bd29",
  measurementId: "G-84JT4N8GE3"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const storage = getStorage(app)
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber }
export const analytics = getAnalytics(app)
