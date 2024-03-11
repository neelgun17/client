// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOh3nLoNyZ7IFFzIiOfuCZrFQSuEw4zBU",
  authDomain: "teamtracker-91394.firebaseapp.com",
  projectId: "teamtracker-91394",
  storageBucket: "teamtracker-91394.appspot.com",
  messagingSenderId: "774584215500",
  appId: "1:774584215500:web:f2619dfeb3f2b253789f69",
  measurementId: "G-81LJ73H69M"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);