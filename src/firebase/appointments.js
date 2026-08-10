import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  createDocument,
  getAllDocuments,
  getDocumentsByField,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "./firestoreService";

/**
 * @typedef {import("../types/firestoreType").Appointment} Appointment
 */

/**
 * Converts various date formats to Firestore Timestamp
 * @param {any} dateValue
 * @returns {Timestamp}
 */
const toFirestoreTimestamp = (dateValue) => {
  if (!dateValue) throw new Error("Missing required field: dateTime");

  if (dateValue instanceof Timestamp) return dateValue;

  const parsed =
    typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (!(parsed instanceof Date) || isNaN(parsed.getTime())) {
    throw new Error("Invalid dateTime format: must be Date or valid string");
  }

  return Timestamp.fromDate(parsed);
};

/**
 * Creates a new appointment
 * @param {Object} appointmentData
 * @param {string} appointmentData.patientID - Firestore patient document ID
 * @param {string} appointmentData.doctorID - Firestore doctor document ID
 * @param {string} appointmentData.type
 * @param {string} appointmentData.location
 * @param {string} appointmentData.reason
 * @param {string} [appointmentData.notes]
 * @param {Date|string|Timestamp} appointmentData.dateTime
 * @returns {Promise<string>} appointment document ID
 */
export const createAppointment = async (appointmentData) => {
  const validData = {
    patient: doc(db, "patients", appointmentData.patientID),
    doctor: doc(db, "doctors", appointmentData.doctorID),
    type: appointmentData.type,
    location: appointmentData.location,
    reason: appointmentData.reason,
    notes: appointmentData.notes || "",
    dateTime: toFirestoreTimestamp(appointmentData.dateTime),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return await createDocument("appointments", validData);
};

/**
 * Get all appointments
 * @returns {Promise<Appointment[]>}
 */
export const getAllAppointments = async () => {
  return await getAllDocuments("appointments");
};

/**
 * Get all appointments for a specific doctor
 * @param {string} doctorID
 * @returns {Promise<Appointment[]>}
 */
export const getAppointmentsByDoctor = async (doctorID) => {
  // We query by reference, not string
  const doctorRef = doc(db, "doctors", doctorID);
  return await getDocumentsByField("appointments", "doctor", doctorRef);
};

/**
 * Get all appointments for a specific patient
 * @param {string} patientID
 * @returns {Promise<Appointment[]>}
 */
export const getAppointmentsByPatient = async (patientID) => {
  const patientRef = doc(db, "patients", patientID);
  return await getDocumentsByField("appointments", "patient", patientRef);
};

/**
 * Get appointment by ID
 * @param {string} appointmentID
 * @returns {Promise<Appointment|null>}
 */
export const getAppointmentById = async (appointmentID) => {
  return await getDocumentById("appointments", appointmentID);
};

/**
 * Update an appointment by ID
 * @param {string} appointmentID
 * @param {Partial<Appointment>} updatedData
 */
export const updateAppointment = async (appointmentID, updatedData) => {
  const newData = { ...updatedData };

  if (updatedData.dateTime) {
    newData.dateTime = toFirestoreTimestamp(updatedData.dateTime);
  }

  if (updatedData.patientID)
    newData.patient = doc(db, "patients", updatedData.patientID);
  if (updatedData.doctorID)
    newData.doctor = doc(db, "doctors", updatedData.doctorID);

  newData.updatedAt = serverTimestamp();

  await updateDocument("appointments", appointmentID, newData);
};

/**
 * Delete an appointment by ID
 * @param {string} appointmentID
 */
export const deleteAppointment = async (appointmentID) => {
  await deleteDocument("appointments", appointmentID);
};
