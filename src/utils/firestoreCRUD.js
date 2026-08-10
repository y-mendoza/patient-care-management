import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Utility: get current user safely
function getCurrentUser() {
  const auth = getAuth();
  return auth.currentUser;
}

// CREATE (auto-assign creator UID)
export async function createDocument(collectionName, data) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized: User not logged in");

  const sanitizedData = {
    ...data,
    createdBy: user.uid,
    createdAt: new Date(),
  };

  const ref = await addDoc(collection(db, collectionName), sanitizedData);
  return ref.id;
}

// READ ALL (admins only — filter logic optional)
export async function getAllDocuments(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// READ ONE (only if user is owner or recipient)
export async function getDocumentById(collectionName, id) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  const data = { id: snapshot.id, ...snapshot.data() };
  if (
    data.createdBy === user.uid ||
    (Array.isArray(data.recipientIds) && data.recipientIds.includes(user.uid))
  ) {
    return data;
  } else {
    throw new Error("Access denied");
  }
}

// READ BY FIELD (auto-scope by user if applicable)
export async function getDocumentsByField(collectionName, field, value) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const q = query(
    collection(db, collectionName),
    where(field, "==", value)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter(
      (doc) =>
        doc.createdBy === user.uid ||
        (Array.isArray(doc.recipientIds) && doc.recipientIds.includes(user.uid))
    );
  return results;
}

// UPDATE (only if user is owner)
export async function updateDocument(collectionName, id, data) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Document not found");

  const docData = snapshot.data();
  if (docData.createdBy !== user.uid) throw new Error("Access denied");

  // Never allow changing ownership
  const { createdBy, ...safeData } = data;
  await updateDoc(ref, { ...safeData, updatedAt: new Date() });
}

// DELETE (only if user is owner)
export async function deleteDocument(collectionName, id) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Document not found");

  const docData = snapshot.data();
  if (docData.createdBy !== user.uid) throw new Error("Access denied");

  await deleteDoc(ref);
}
/**
 * Fetch documents from a collection where a field equals a specific document reference.
 * @param {string} collectionName - Firestore collection name.
 * @param {string} field - The field containing the document reference.
 * @param {DocumentReference} ref - The referenced document.
 * @returns {Promise<Array>} Matching documents.
 */
export async function getDocumentsByReference(collectionName, field, ref) {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const q = query(collection(db, collectionName), where(field, "==", ref));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter(
      (doc) =>
        doc.createdBy === user.uid ||
        (Array.isArray(doc.recipientIds) && doc.recipientIds.includes(user.uid))
    );
}
