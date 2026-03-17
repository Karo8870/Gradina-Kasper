import { config } from 'dotenv';

config();

const env = process.env;

export default {
  R2_BUCKET_NAME: env.R2_BUCKET_NAME!,
  R2_BUCKET_ENDPOINT: env.R2_BUCKET_ENDPOINT!,
  R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID!,
  R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY!,
  R2_BUCKET_PUBLIC_ENDPOINT: env.R2_BUCKET_PUBLIC_ENDPOINT!,
  R2_REGION: env.R2_REGION!
};
