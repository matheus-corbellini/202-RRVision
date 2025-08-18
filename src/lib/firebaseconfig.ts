import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyD4C8cE_DX6dWL89w_gwR2M3sjAtKK3GHU",
	authDomain: "rrvision-99414.firebaseapp.com",
	projectId: "rrvision-99414",
	storageBucket: "rrvision-99414.firebasestorage.app",
	messagingSenderId: "808020762931",
	appId: "1:808020762931:web:c8b68d4bad3352b037de46",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
