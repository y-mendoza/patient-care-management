import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getUserById(id) {
  const docRef = doc(db, "users", id);
  const userSnap = await getDoc(docRef);
  return userSnap.exists() ? { id, ...userSnap.data() } : null;
}

export async function saveUser(id, data) {
  const docRef = doc(db, "users", id);
  await setDoc(docRef, data, { merge: true });
}