import { z } from 'zod';
import { RoleSchema } from './Role';

export const PartnerSchema = z.object({
    // Organization picked from Parcel2 (IRI string)
    organization: z.string().optional(),
    // When org is not on Parcel2, user supplies a free text name
    organizationName: z.string().optional(),
    roles: z.array(RoleSchema).min(1, 'Each partner needs at least one role'),
})
    // Require at least one of {organization, organizationName}
    .refine(
        (p) => !!(p.organization && p.organization.trim()) || !!(p.organizationName && p.organizationName.trim()),
        { message: 'Pick an organization or enter an organization name', path: ['organizationName'] }
    );

export type PartnerFormData = z.infer<typeof PartnerSchema>;
