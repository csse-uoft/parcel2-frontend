// schemas/land.ts
import { z } from 'zod';
import { AddressSchema } from './Address';

export const LandSchema = z
    .object({
        notes: z.string().nullish().refine(val => val?.trim().length, { message: 'Land notes is required' }),
        parcelId: z.string().optional(),

        // Address[] with at least one item
        addresses: z.array(AddressSchema).min(1, 'At least one address is required'),

        area: z.transform(Number).pipe(z.number()).optional().refine((val) => val == null || val > 0, {
            message: 'Area must be a positive number',
        }),
        // onClass 'bedeo:Unit' → store as Unit IRI / ID (string)
        areaUnit: z.string().optional(),

        // onClass 'bedeo:LandUse' → store as IRI / ID (string)
        currentLandUse: z.string().optional(),
        designatedLandUse: z.string().optional(),
        proposedLandUse: z.string().optional(),
    })
    // If area is provided, a unit must also be provided
    .superRefine((v, ctx) => {
        if (v.area != null && (!v.areaUnit || v.areaUnit === '')) {
            ctx.addIssue({
                path: ['areaUnit'],
                code: z.ZodIssueCode.custom,
                message: 'Unit is required when area is set',
            });
        }
    });

export type LandFormData = z.infer<typeof LandSchema>;
