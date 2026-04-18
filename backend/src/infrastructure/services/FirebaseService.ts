import * as admin from 'firebase-admin';

let initialized = false;

export function getFirestore(): admin.firestore.Firestore {
  if (!initialized) {
    if (!admin.apps.length) {
      const isEmulator = !!process.env['FIRESTORE_EMULATOR_HOST'];

      if (isEmulator) {
        admin.initializeApp({
          projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'atom-challenge-fullstack',
        });
      } else {
        const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
        if (!serviceAccountJson) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
        }

        const raw = JSON.parse(serviceAccountJson);

        // Railway can escape newlines in private_key — normalize them
        if (raw['private_key']) {
          raw['private_key'] = (raw['private_key'] as string).replace(/\\n/g, '\n');
        }

        admin.initializeApp({
          credential: admin.credential.cert(raw as admin.ServiceAccount),
          projectId: process.env['FIREBASE_PROJECT_ID'] ?? raw['project_id'],
        });

        // Use REST instead of gRPC — required on Railway (gRPC blocked)
        admin.firestore().settings({ preferRest: true });
      }
    }
    initialized = true;
  }
  return admin.firestore();
}
