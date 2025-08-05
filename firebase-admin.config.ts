import admin from 'firebase-admin';
import envConfig from './env.config';

interface FirebaseAdminAppParams {
  projectId: string;
  clientEmail: string;
  storageBucket: string;
  privateKey: string;
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

export function createFirebaseAdminApp(params: FirebaseAdminAppParams) {
  const privateKey = formatPrivateKey(params.privateKey);

  if (admin.apps.length > 0) {
    return admin.app();
  }

  const cert = admin.credential.cert({
    projectId: params.projectId,
    clientEmail: params.clientEmail,
    privateKey
  });

  return admin.initializeApp({
    credential: cert,
    projectId: params.projectId,
    storageBucket: params.storageBucket
  });
}

export async function initAdmin() {
  const params: FirebaseAdminAppParams = {
    projectId: envConfig.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: envConfig.FIREBASE_ADMIN_CLIENT_EMAIL,
    storageBucket: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    privateKey: envConfig.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  };

  return createFirebaseAdminApp(params);
}
