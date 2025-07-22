import { z } from 'zod';

export const PersonNameSchema = z.object({
    fullName:  z.string().min(1, 'Full name is required'),
    firstName: z.string().min(1, 'First name is required'),
    middleName:z.string().optional(),
    lastName:  z.string().min(1, 'Last name is required'),
});
