import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getConfig } from "./config";

const config = getConfig();
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);