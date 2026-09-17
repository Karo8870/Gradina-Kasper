import { z } from 'zod';

export const emailSchema = z
  .email('Introdu o adresă de email validă.')
  .min(1, 'Adresa de email este obligatorie.');

export const passwordSchema = z
  .string()
  .min(8, 'Parola trebuie să aibă cel puțin 8 caractere.');
