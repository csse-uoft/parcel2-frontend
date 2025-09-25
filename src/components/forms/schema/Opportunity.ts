import { z } from 'zod';
import { ContactSchema } from './Contact';
import { LandSchema } from "@/components/forms/schema/Land";
import { PartnerSchema } from "@/components/forms/schema/Partner";

export const OpportunityAdditionalInfoSchema = z.object({
    images: z.string().array().optional(),
    primaryImage: z.string().optional(),
    files: z.string().array().optional(),
    isPosted: z.boolean().optional(),
    isSearchable: z.boolean().optional(),
    datePosted: z.date().optional(),
    dateModified: z.date().optional(),
});

export const OpportunitySchema = z.object({
    /* core fields ------------------------------------------------ */
    name: z.string().nullish().refine(val => val?.trim().length, { message: 'Opportunity name is required' }),
    description: z.string().nullish().refine(val => val?.trim().length, { message: 'Description is required' }),

    /* selects / lists ------------------------------------------- */
    partnershipRoles: z
        .array(z.string())
        .nullish().refine(val => val?.length, { message: 'Select at least one partnership role' }),
    projectType: z.string().nullish().refine(val => val?.trim().length, { message: 'Select a project type' }),
    projectStage: z.string().nullish().refine(val => val?.trim().length, { message: 'Select a project stage' }),

    /* nested forms ---------------------------------------------- */
    primaryContact: ContactSchema,

    /* optional arrays / nested objects -------------------------- */
    partners: z.array(PartnerSchema),
    land: LandSchema,
    additionalInfo: OpportunityAdditionalInfoSchema.optional(),
});

export type OpportunityFormData = z.infer<typeof OpportunitySchema>;


export interface LandFormData extends Omit<z.infer<typeof LandSchema>, 'area'> {
    area?: number;
}