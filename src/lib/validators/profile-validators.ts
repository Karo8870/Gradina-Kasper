import { z } from 'zod';
import validator from 'validator';

export const nameValidator = z
  .string()
  .min(1, 'Prenumele este obligatoriu')
  .regex(
    /^[a-zA-Z- ]+$/,
    'Prenumele poate conține numai litere mici, mari și linii'
  );

export const emailValidator = z
  .string()
  .min(1, 'Email-ul este obligatoriu')
  .refine(validator.isEmail, {
    message: 'Email-ul nu este valid'
  });

export const phoneNumberValidator = z
  .string()
  .min(1, 'Numărul de telefon este obligatoriu')
  .refine(
    (value) => {
      return validator.isMobilePhone(value, ['ro-RO']);
    },
    {
      message: 'Numărul de telefon nu este valid'
    }
  );

export const passwordValidator = z
  .string()
  .min(1, 'Parola este obligatorie')
  .refine(validator.isStrongPassword, {
    message:
      'Parola trebuie să conțină cel puțin 8 caractere, o literă mică, o literă mare, un număr și un caracter special'
  });
