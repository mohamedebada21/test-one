import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// This will be provided by the environment you are using.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { 
        apiKey: "AIzaSyCfJZyqF0q5EbGCZZ4DG_OdDtr-cjpZ2GI",
  authDomain: "hayah-halal.firebaseapp.com",
  projectId: "hayah-halal",
  storageBucket: "hayah-halal.firebasestorage.app",
  messagingSenderId: "1009148279797",
  appId: "1:1009148279797:web:da77c7d28a9b625fc3febc"
        // ... other config properties
      };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// App ID for Firestore paths
const appId = typeof __app_id !== 'undefined' ? __app_id : 'e-commerce-mvp';

// IMPORTANT: Admin User ID
// Replace this with your actual Firebase User ID (UID) to gain admin access.
const ADMIN_UID = "REPLACE_WITH_YOUR_FIREBASE_USER_ID";


/**
 * Signs in the user, either with a custom token if provided, or anonymously.
 * @returns {Promise<User>} A promise that resolves with the user credential.
 */
const signIn = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        return await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        return await signInAnonymously(auth);
    }
};

// Export the services and config for use in other parts of the app
export { db, auth, onAuthStateChanged, signIn, appId, ADMIN_UID };
