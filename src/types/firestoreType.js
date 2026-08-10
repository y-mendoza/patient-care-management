/**
 * @typedef {Object} User
 * @property {string} id - Firestore document ID (matches Auth UID)
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} birthDate
 * @property {string} gender
 * @property {string} contactNumber
 * @property {"admin" | "doctor" | "patient"} role
 * @property {Timestamp} [updatedAt]
 */

/**
 * @typedef {Object} Patient
 * @property {string} id - Firestore document ID (same as user id)
 * @property {DocumentReference<User>} uid - Reference to corresponding user
 * @property {string} insuranceProvider
 * @property {boolean} seniorCitizenStatus
 * @property {boolean} pwdStatus
 * @property {string[]} chronicIllness
 * @property {string} allergies
 */

/**
 * @typedef {Object} Doctor
 * @property {string} id - Firestore document ID (same as user id)
 * @property {DocumentReference<User>} uid - Reference to corresponding user
 * @property {string} placeOfEmployment
 * @property {string} officeAddress
 * @property {string} officeRoomNo
 * @property {string} officeContactNo
 * @property {string} medicalField
 * @property {number} yearsExperience
 */

/**
 * @typedef {Object} Admin
 * @property {string} id
 * @property {DocumentReference<User>} uid - Reference to corresponding user
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {DocumentReference<Doctor>} doctor
 * @property {Timestamp} dateTime
 * @property {string} type
 * @property {string} location
 * @property {string} reason
 * @property {string} [notes]
 * @property {Timestamp} [updatedAt]
 */

/**
 * @typedef {Object} Prescription
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {DocumentReference<Doctor>} doctor
 * @property {Timestamp} dateIssued
 * @property {Array<{name: string, dosage: string, schedule: string}>} medInformation
 */

/**
 * @typedef {Object} DailyIntakeMonitor
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {DocumentReference<Doctor>} doctor
 * @property {Timestamp} dateTime
 * @property {string} medication
 * @property {string} dosage
 * @property {string} frequency
 * @property {"Pending" | "Taken" | "Missed"} status
 */

/**
 * @typedef {Object} DailyMealsChecklist
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {DocumentReference<Doctor>} doctor
 * @property {Timestamp} dateTime
 * @property {string} mealDescription
 * @property {"Pending" | "Completed" | "Missed"} status
 */

/**
 * @typedef {Object} RecommendedDiet
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {DocumentReference<Doctor>} doctor
 * @property {string} dietDescription
 * @property {string} [notes]
 */

/**
 * @typedef {Object} PersonalHealthCalendar
 * @property {string} id
 * @property {DocumentReference<Patient>} patient
 * @property {Timestamp} date
 * @property {string} event
 * @property {string} [description]
 */

export {};
