import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

let app, auth, db;
export function initFirebase(){
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  return {app, auth, db};
}

export async function loginWithGoogle(){
  const provider = new GoogleAuthProvider();
  const { auth } = initFirebase();
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

export async function logout(){
  const { auth } = initFirebase();
  await signOut(auth);
}

export async function loadUserDoc(uid){
  const { db } = initFirebase();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if(!snap.exists()) return null;
  return snap.data();
}

export async function saveUserDoc(uid, data){
  const { db } = initFirebase();
  const ref = doc(db, 'users', uid);
  await setDoc(ref, data, { merge: true });
}

import { getFirestore, collection, addDoc } from 'firebase/firestore'
export async function createAssignment(payload){
  const { db } = initFirebase();
  const col = collection(db, 'assignments');
  const docRef = await addDoc(col, payload);
  return { id: docRef.id };
}
// attach to window for demo usage
if(typeof window !== 'undefined') window.createAssignment = createAssignment
