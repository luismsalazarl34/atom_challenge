import * as admin from 'firebase-admin';

let firestoreInstance: admin.firestore.Firestore | null = null;

export function getFirestore(): admin.firestore.Firestore {
  if (firestoreInstance) return firestoreInstance;

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
      if (raw['private_key']) {
        raw['private_key'] = (raw['private_key'] as string).replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(raw as admin.ServiceAccount),
        projectId: process.env['FIREBASE_PROJECT_ID'] ?? raw['project_id'],
      });
    }
  }

  firestoreInstance = admin.firestore();
  // Force REST over gRPC — required on Railway where HTTP/2 is blocked
  firestoreInstance.settings({ preferRest: true });

  return firestoreInstance;
}
