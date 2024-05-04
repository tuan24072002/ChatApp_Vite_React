import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "chatapp-c80e0.firebaseapp.com",
    projectId: "chatapp-c80e0",
    storageBucket: "chatapp-c80e0.appspot.com",
    messagingSenderId: "856831552133",
    appId: "1:856831552133:web:d81fada6e124740735d7ec"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();