import { z } from 'zod';

export const ContactSchema = z.object({
    contactName: z.string().min(1, 'Contact name is required'),
    email: z
        .string()
        .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'Invalid e-mail')
        .optional()
        .or(z.literal('')),          // let the field be blank
    phone: z
        .string()
        .regex(/^\+\d{7,15}$/, 'Phone must be +[country-code][number]')
        .optional()
        .or(z.literal('')),
});

export type ContactFormData = z.infer<typeof ContactSchema>;
