import { getApp, getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

// All values come exclusively from environment variables.
// Never hardcode Firebase credentials — they are project-identifiers
// but must be rotated if accidentally committed to a public repo.
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
const app = hasFirebaseConfig ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  ...(process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID ? { client_id: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID } : {}),
});

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase Google Login gagal diinisialisasi. Periksa konfigurasi Firebase Web.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}

export default { signInWithGoogle };
