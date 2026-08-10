import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	where,
	orderBy,
	startAfter,
	limit,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
// Generate UUID without external library
const generateUUID = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Collection reference
const usersCollection = collection(db, "users");

/**
 * Generate a unique token for a user
 */
export const generateUserToken = () => {
	return `USR-${generateUUID()}`;
};

/**
 * Add a new user to Firestore
 * @param {Object} userData - User data object
 * @returns {Promise<string>} - Returns the document ID
 */
export const addUser = async (userData) => {
	try {
		const token = generateUserToken();
		const userDoc = {
			...userData,
			token,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
			status: "active",
		};

		const docRef = await addDoc(usersCollection, userDoc);
		console.log("User added with ID:", docRef.id);
		return { success: true, id: docRef.id, token };
	} catch (error) {
		console.error("Error adding user:", error);
		throw error;
	}
};

/**
 * Get all users from Firestore
 * @returns {Promise<Array>} - Returns array of users
 */
export const getAllUsers = async () => {
	try {
		const querySnapshot = await getDocs(usersCollection);
		const users = [];

		querySnapshot.forEach((doc) => {
			users.push({
				id: doc.id,
				...doc.data(),
			});
		});

		return users;
	} catch (error) {
		console.error("Error getting users:", error);
		throw error;
	}
};

/**
 * Get a single user by ID
 * @param {string} userId - User document ID
 * @returns {Promise<Object>} - Returns user data
 */
export const getUserById = async (userId) => {
	try {
		const docRef = doc(db, "users", userId);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			return {
				id: docSnap.id,
				...docSnap.data(),
			};
		} else {
			throw new Error("User not found");
		}
	} catch (error) {
		console.error("Error getting user:", error);
		throw error;
	}
};

/**
 * Get user by token
 * @param {string} token - User token
 * @returns {Promise<Object>} - Returns user data
 */
export const getUserByToken = async (token) => {
	try {
		const q = query(usersCollection, where("token", "==", token));
		const querySnapshot = await getDocs(q);

		if (!querySnapshot.empty) {
			const doc = querySnapshot.docs[0];
			return {
				id: doc.id,
				...doc.data(),
			};
		} else {
			throw new Error("User with token not found");
		}
	} catch (error) {
		console.error("Error getting user by token:", error);
		throw error;
	}
};

/**
 * Update user information
 * @param {string} userId - User document ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, updates) => {
	try {
		const docRef = doc(db, "users", userId);
		const updateData = {
			...updates,
			updatedAt: serverTimestamp(),
		};

		await updateDoc(docRef, updateData);
		console.log("User updated successfully");
		return { success: true };
	} catch (error) {
		console.error("Error updating user:", error);
		throw error;
	}
};

/**
 * Delete a user
 * @param {string} userId - User document ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
	try {
		const docRef = doc(db, "users", userId);
		await deleteDoc(docRef);
		console.log("User deleted successfully");
		return { success: true };
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
};

/**
 * Search users by field
 * @param {string} field - Field name to search
 * @param {any} value - Value to search for
 * @returns {Promise<Array>} - Returns array of matching users
 */
export const searchUsers = async (field, value) => {
	try {
		const q = query(usersCollection, where(field, "==", value));
		const querySnapshot = await getDocs(q);
		const users = [];

		querySnapshot.forEach((doc) => {
			users.push({
				id: doc.id,
				...doc.data(),
			});
		});

		return users;
	} catch (error) {
		console.error("Error searching users:", error);
		throw error;
	}
};

/**
 * Get users with pagination
 * @param {number} limit - Number of users per page
 * @param {any} lastVisible - Last document from previous page
 * @returns {Promise<Object>} - Returns users and last visible doc
 */
export const getUsersPaginated = async (limit = 10, lastVisible = null) => {
	try {
		let q;

		if (lastVisible) {
			q = query(
				usersCollection,
				orderBy("createdAt", "desc"),
				startAfter(lastVisible),
				limit(limit)
			);
		} else {
			q = query(usersCollection, orderBy("createdAt", "desc"), limit(limit));
		}

		const querySnapshot = await getDocs(q);
		const users = [];
		let lastDoc = null;

		querySnapshot.forEach((doc) => {
			users.push({
				id: doc.id,
				...doc.data(),
			});
			lastDoc = doc;
		});

		return { users, lastVisible: lastDoc };
	} catch (error) {
		console.error("Error getting paginated users:", error);
		throw error;
	}
};