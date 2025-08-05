import { config } from 'dotenv';
import process from 'node:process';
import { atob } from 'node:buffer';

config();

const env = process.env;

const adminFirebaseConfig = JSON.parse(atob(env.ADMIN_FIREBASE_CONFIG!)) as {
  type: 'service_account';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
};

const firebaseConfig = JSON.parse(atob(env.FIREBASE_CONFIG!)) as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export default {
  DATABASE_URL: env.DATABASE_URL,

  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,

  FIREBASE_ADMIN_TYPE: adminFirebaseConfig.type,
  FIREBASE_ADMIN_PROJECT_ID: adminFirebaseConfig.project_id,
  FIREBASE_ADMIN_PRIVATE_KEY_ID: adminFirebaseConfig.private_key_id,
  FIREBASE_ADMIN_PRIVATE_KEY: adminFirebaseConfig.private_key,
  FIREBASE_ADMIN_CLIENT_EMAIL: adminFirebaseConfig.client_email,
  FIREBASE_ADMIN_CLIENT_ID: adminFirebaseConfig.client_id,
  FIREBASE_ADMIN_AUTH_URI: adminFirebaseConfig.auth_uri,
  FIREBASE_ADMIN_TOKEN_URI: adminFirebaseConfig.token_uri,
  FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL:
    adminFirebaseConfig.auth_provider_x509_cert_url,
  FIREBASE_ADMIN_CLIENT_X509_CERT_URL: adminFirebaseConfig.client_x509_cert_url,
  FIREBASE_ADMIN_UNIVERSE_DOMAIN: adminFirebaseConfig.universe_domain,

  SOFTONE_APP_ID: env.SOFTONE_APP_ID,
  SOFTONE_USERNAME: env.SOFTONE_USERNAME,
  SOFTONE_PASSWORD: env.SOFTONE_PASSWORD,
  SOFTONE_BASE_URL: env.SOFTONE_BASE_URL,

  SOFTONE_DEV_KEY: env.SOFTONE_DEV_KEY,
  MODE: env.MODE! ?? 'DEV'
};
