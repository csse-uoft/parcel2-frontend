import { z } from 'zod';

export const MAX_ROLE_TYPES = 10;

// UI: we select RoleType taxonomy items by ID (string).
// Backend can map these IDs to RoleType instances.
export const RoleSchema = z.object({
    startDate: z.iso.date().optional(),
    endDate:   z.iso.date().optional(),
    description: z.string().optional(),
    roleTypes: z.array(z.string()).min(1, 'At least one role type is required') // taxonomy IDs
}).refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { path: ['endDate'], message: 'End date must be on/after start date' }
);

export type RoleFormData = z.infer<typeof RoleSchema>;