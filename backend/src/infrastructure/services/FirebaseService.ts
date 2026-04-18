import { Firestore } from '@google-cloud/firestore';

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  const isEmulator = !!process.env['FIRESTORE_EMULATOR_HOST'];

  if (isEmulator) {
    firestoreInstance = new Firestore({
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

    firestoreInstance = new Firestore({
      projectId: raw['project_id'] as string,
      credentials: {
        client_email: raw['client_email'] as string,
        private_key: raw['private_key'] as string,
      },
      preferRest: true,
    });
  }

  return firestoreInstance;
}
