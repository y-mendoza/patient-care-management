# Patient Care Management

A healthcare management web application centered on the patient-doctor relationship. The application provides role-specific interfaces for patients, doctors, and administrators, with features for patient records, prescriptions, appointments, daily medication/meal tracking, and notifications.

## Tech Stack

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Messaging
- React Router
- Bootstrap

## Features

- Role-based login and dashboards for patients, doctors, and administrators
- Patient profile and patient-management views
- Prescription and appointment management
- Daily medicine and meal logs for patients
- Appointment calendar and appointment details
- Notifications
- Firestore-backed CRUD operations
- Firebase Authentication for account login

## My Role

**Team Lead / Lead Developer**

Responsible for leading the team's development work and contributing to the implementation of the application's core functionality, including its React interface, Firebase integration, authentication, and patient/doctor workflows.

## Design & Documentation

Selected project documentation is included to provide context for the system's design and requirements:

- [Sitemap](Documentation/Sitemap.pdf)
- [Requirements Analysis](Documentation/Requirements-Analysis.pdf)
- [Acceptance Criteria](Documentation/Acceptance-Criteria.pdf)
- [Entity-Relationship Diagram](Documentation/Entity-Relationship-Diagram.pdf)

The original project proposal and presentation materials are not included because they were primarily course-submission artifacts and contained contributor information that is not necessary for the portfolio repository.

## Getting Started

This repository preserves an academic project and its original implementation. The Firebase project originally used by the application has been retired, so there is no active deployment.

To run the frontend locally:

```bash
npm install
npm run dev
```

A replacement Firebase project must be configured in `src/firebase/firebaseConfig.js` for Firebase-backed functionality to work. The application uses Firebase Authentication, Cloud Firestore, and Firebase Cloud Messaging.

## Academic Context

Academic project developed for Mapúa University.

> The original project proposal described planned AI-assisted treatment monitoring. The current repository does not contain a separate AI service or integration, so AI functionality is not presented as an implemented feature here.
