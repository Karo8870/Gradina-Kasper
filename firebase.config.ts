import { getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDbWXkoJLhM9Tv2ixk9r58l3HZuxcYI4p8',
  authDomain: 'gradina-kasper-e9f47.firebaseapp.com',
  projectId: 'gradina-kasper-e9f47',
  storageBucket: 'gradina-kasper-e9f47.appspot.com',
  messagingSenderId: '1002851957730',
  appId: '1:1002851957730:web:f654fed19cbbcf164ed7bb'
};

export function initFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}
