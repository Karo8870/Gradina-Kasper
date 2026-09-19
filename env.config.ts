import { cleanEnv, num, str, url } from 'envalid';

export default cleanEnv(process.env, {
  S3_BUCKET: str(),
  S3_ACCESS_KEY_ID: str(),
  S3_SECRET_ACCESS_KEY: str(),
  S3_BUCKET_PUBLIC_ENDPOINT: str(),
  S3_REGION: str({
    default: 'auto'
  }),
  PAYLOAD_SECRET: str(),
  BETTER_AUTH_SECRET: str(),
  DATABASE_URL: url(),
  NEXT_PUBLIC_SERVER_URL: url({
    default: 'http://localhost:3000'
  }),
  SMTP_HOST: str(),
  SMTP_PORT: num({
    default: 587
  }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  SMTP_FROM_NAME: str(),
  SMTP_FROM_ADDRESS: str()
});
