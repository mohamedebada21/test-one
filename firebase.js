import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// This will be provided by the environment you are using.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { 
        apiKey: "YOUR_API_KEY", 
        authDomain: "YOUR_AUTH_DOMAIN", 
        projectId: "YOUR_PROJECT_ID",
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
