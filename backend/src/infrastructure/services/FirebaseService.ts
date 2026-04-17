import * as admin from 'firebase-admin';

let initialized = false;

export function getFirestore(): admin.firestore.Firestore {
  if (!initialized) {
    if (!admin.apps.length) {
      const isEmulator = !!process.env['FIRESTORE_EMULATOR_HOST'];

      if (isEmulator) {
        // Local development — emulator doesn't need real credentials
        admin.initializeApp({
          projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'atom-challenge-fullstack',
        });
      } else {
        // Production — use service account from environment variable
        const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
        if (!serviceAccountJson) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
        }
        const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env['FIREBASE_PROJECT_ID'] ?? 'atom-challenge-fullstack',
        });
      }
    }
    initialized = true;
  }
  return admin.firestore();
}
