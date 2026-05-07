import { z } from 'zod';

const phoneRegex =
  /^(?:(?:\+33|0033|0)\s*[1-9])(?:[\s.-]*\d{2}){4}$/;

export const signatureSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'Prénom trop court (2 caractères minimum)')
    .max(80, 'Prénom trop long'),
  lastName: z
    .string()
    .trim()
    .min(2, 'Nom trop court (2 caractères minimum)')
    .max(80, 'Nom trop long'),
  email: z.string().trim().toLowerCase().email('Adresse email invalide').max(160),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/u, 'Code postal invalide (5 chiffres)'),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || phoneRegex.test(v), 'Numéro de téléphone invalide'),
  consentCampaign: z.boolean(),
  consentNewsletter: z.boolean(),
  hp: z.string().max(0, 'spam').optional().or(z.literal('')),
});

export type SignatureFormValues = z.infer<typeof signatureSchema>;
