import { initFirebase } from '../firebase'
import { load, save } from './storage'
import { saveUserDoc, loadUserDoc } from '../firebase'

/**
 * Full Firestore sync helpers
 * - pullUserData(uid): loads user doc and merges history/topicStats
 * - pushUserData(uid): writes local history/topicStats to users/{uid}
 * - createAssignment(payload): writes to 'assignments' collection (requires proper security rules)
 * - listAssignments(classId): queries assignments for a class
 * - submitAssignment(studentUid, assignmentId, result): writes submission under assignments/{id}/submissions/{studentUid}
 * - pushAnalytics(uid, events): append events to users/{uid}/analytics or a global collection
 */

import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

export async function pullUserData(uid){
  try{
    const { db } = initFirebase();
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if(!snap.exists()) return null;
    const data = snap.data();
    if(data.history) save('history', data.history);
    if(data.topicStats) save('topicStats', data.topicStats);
    return data;
  }catch(e){ console.error(e); throw e; }
}

export async function pushUserData(uid){
  try{
    const { db } = initFirebase();
    const history = load('history', []);
    const topicStats = load('topicStats', {});
    const ref = doc(db, 'users', uid);
    await setDoc(ref, { history, topicStats, updatedAt: Date.now() }, { merge: true });
    return { ok:true };
  }catch(e){ console.error(e); return { ok:false, error: e.message } }
}

export async function createAssignment(payload){
  // payload: { classId, title, description, questions, due (timestamp), createdBy }
  try{
    const { db } = initFirebase();
    const col = collection(db, 'assignments');
    const res = await addDoc(col, { ...payload, createdAt: Date.now(), submissions: [] });
    return { ok:true, id: res.id };
  }catch(e){ console.error(e); return { ok:false, error: e.message } }
}

export async function listAssignments(classId){
  try{
    const { db } = initFirebase();
    const col = collection(db, 'assignments');
    const q = query(col, where('classId', '==', classId));
    const snap = await getDocs(q);
    const arr = [];
    snap.forEach(d=> arr.push({ id: d.id, ...d.data() }));
    return arr;
  }catch(e){ console.error(e); return []; }
}

export async function submitAssignment(assignmentId, studentUid, result){
  try{
    const { db } = initFirebase();
    const subRef = doc(db, `assignments/${assignmentId}/submissions/${studentUid}`);
    await setDoc(subRef, { ...result, submittedAt: Date.now() });
    // also append to main assignment doc (optional)
    const aRef = doc(db, `assignments/${assignmentId}`);
    await updateDoc(aRef, { submissions: arrayUnion({ studentUid, submittedAt: Date.now(), score: result.score || null }) });
    return { ok:true };
  }catch(e){ console.error(e); return { ok:false, error: e.message } }
}

export async function pushAnalytics(uid, events){
  try{
    const { db } = initFirebase();
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { analytics: arrayUnion(...events) });
    return { ok:true };
  }catch(e){ console.error(e); return { ok:false, error: e.message } }
}
