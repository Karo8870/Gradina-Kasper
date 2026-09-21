import envConfig from '../../../env.config';
import {
  netopiaStartRequestSchema,
  netopiaStartResponseSchema,
  netopiaStatusRequestSchema,
  netopiaStatusResponseSchema
} from './schemas';

const baseURL =
  envConfig.NETOPIA_ENVIRONMENT === 'production'
    ? 'https://secure.mobilpay.ro/pay'
    : 'https://secure.sandbox.netopia-payments.com';

function getCredentials() {
  if (!envConfig.NETOPIA_API_KEY || !envConfig.NETOPIA_POS_SIGNATURE) {
    throw new Error(
      'NETOPIA_API_KEY and NETOPIA_POS_SIGNATURE must be configured.'
    );
  }

  return {
    apiKey: envConfig.NETOPIA_API_KEY,
    posSignature: envConfig.NETOPIA_POS_SIGNATURE
  };
}

async function netopiaFetch(path: string, body: unknown) {
  const { apiKey } = getCredentials();
  const response = await fetch(`${baseURL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    signal: AbortSignal.timeout(15_000)
  });
  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`NETOPIA returned HTTP ${response.status}.`);
  }

  return result;
}

export async function startNetopiaPayment(body: unknown) {
  const request = netopiaStartRequestSchema.parse(body);
  return netopiaStartResponseSchema.parse(
    await netopiaFetch('/payment/card/start', request)
  );
}

export async function getNetopiaPaymentStatus(input: {
  ntpID: string;
  orderID: string;
}) {
  const request = netopiaStatusRequestSchema.parse({
    ...input,
    posSignature: getCredentials().posSignature
  });
  return netopiaStatusResponseSchema.parse(
    await netopiaFetch('/operation/status', request)
  );
}

export function getNetopiaPOSSignature() {
  return getCredentials().posSignature;
}
