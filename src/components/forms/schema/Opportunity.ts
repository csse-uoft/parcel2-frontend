import { z } from 'zod';
import { ContactSchema } from './Contact';

export const OpportunityAdditionalInfoSchema = z.object({
    images:        z.string().url().array().optional(),
    primaryImage:  z.string().url().optional(),
    files:         z.string().url().array().optional(),
    isPosted:      z.boolean().optional(),
    isSearchable:  z.boolean().optional(),
    datePosted:    z.date().optional(),
    dateModified:  z.date().optional(),
});

export const PartnerSchema = z.object({
    // dropdown
    organization: z.string().min(1, 'Partner name is required'),
    role:        z.string().min(1, 'Partner role is required'),
    // description: z.string().optional(),
})

export const OpportunitySchema = z.object({
    /* core fields ------------------------------------------------ */
    name:        z.string().min(1, 'Opportunity name is required'),
    description: z.string().min(1, 'Description is required'),

    /* selects / lists ------------------------------------------- */
    partnershipRoles: z.array(z.string()).min(1, 'At least one role is required'),
    projectType:      z.string().min(1, 'Select a project type'),
    projectStage:     z.string().min(1, 'Select a project stage'),

    /* nested forms ---------------------------------------------- */
    primaryContact:   ContactSchema,

    /* optional arrays / nested objects -------------------------- */
    partners:          z.array(z.string()).optional(),          // partner org IDs
    land:              z.string().optional(),
    additionalInfo:    OpportunityAdditionalInfoSchema.optional(),
});

export type OpportunityFormData = z.infer<typeof OpportunitySchema>;
