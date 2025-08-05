import api from '@/lib/api/api';
import envConfig from '../../../../env.config';
import { cachedValues } from '@/db/schema/cached-values';
import { db } from '@/db/db';
import { eq } from 'drizzle-orm';

const CLIENT_ID_REFRESH_INTERVAL = 24 * 60 * 60;

export async function getSoftOneClientID() {
  if (envConfig.MODE === 'DEV') {
    return envConfig.SOFTONE_DEV_KEY;
  }

  // @ts-ignore
  const clientID:
    | {
        client_id: string;
        timestamp: string;
      }
    | undefined = (
    await db
      .select({
        value: cachedValues.value
      })
      .from(cachedValues)
      .where(eq(cachedValues.key, 'softone_client_id'))
  )?.[0]?.value;

  if (!clientID) {
    const newClientID = await authenticateSoftOne();

    await db.insert(cachedValues).values({
      key: 'softone_client_id',
      value: {
        client_id: newClientID,
        timestamp: new Date().toISOString()
      }
    });

    return newClientID;
  }

  if (
    new Date(clientID.timestamp).getTime() + CLIENT_ID_REFRESH_INTERVAL <
    new Date().getTime()
  ) {
    const newClientID = await authenticateSoftOne();

    await db
      .update(cachedValues)
      .set({
        value: {
          client_id: newClientID,
          timestamp: new Date().toISOString()
        }
      })
      .where(eq(cachedValues.key, 'softone_client_id'));

    return newClientID;
  }

  return clientID;
}

async function loginSoftOne(): Promise<string> {
  const response = await api.post('/', {
    service: 'login',
    username: envConfig.SOFTONE_USERNAME,
    password: envConfig.SOFTONE_PASSWORD,
    appId: envConfig.SOFTONE_APP_ID
  });

  return response.data.clientID;
}

async function authenticateSoftOne(): Promise<string> {
  const loginClientID = await loginSoftOne();

  const response = await api.post('/', {
    service: 'authenticate',
    clientID: loginClientID,
    COMPANY: '9000',
    BRANCH: '1000',
    MODULE: '0',
    REFID: '91'
  });

  return response.data.clientID;
}
