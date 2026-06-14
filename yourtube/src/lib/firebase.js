// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2o3OBtmQ1kG8zUxywlVCNEWBmLZzqI9Q",
  authDomain: "fir-497e6.firebaseapp.com",
  projectId: "fir-497e6",
  storageBucket: "fir-497e6.firebasestorage.app",
  messagingSenderId: "290994122644",
  appId: "1:290994122644:web:9d95f26c0ef27ca6d92981"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };