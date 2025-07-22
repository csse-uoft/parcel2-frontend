import { z } from "zod";
import { AddressSchema } from "@/components/forms/schema/Address";
import { ContactSchema } from "@/components/forms/schema/Contact";

export const MAX_LEGAL_NAMES = 2; // Maximum number of legal names allowed

export const OrganizationSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    tradeName: z.string().optional(),
    legalNames: z
        .array(z.object({ value: z.string().min(1, "Legal name is required") }))
        .min(1, "At least one legal name is required")
        .max(MAX_LEGAL_NAMES, `A maximum of ${MAX_LEGAL_NAMES} legal names is allowed`),
    acronyms: z
        .array(z.object({ value: z.string().min(1, "Acronym is required") }))
        .optional(),
    briefDescription: z.string().min(1, "Brief description is required"),
    description: z.string().min(1, "Description is required"),
    missionStatement: z.string().optional(),
    valuesStatement: z.string().optional(),
    businessRegistrationNumber: z.string().optional(),
    primaryAddress: AddressSchema,
    mailingAddress: AddressSchema.optional(),
    deliveryAddress: AddressSchema.optional(),
    mailingSameAsPrimary: z.boolean(),
    deliverySameAsPrimary: z.boolean(),
    primaryContact: ContactSchema,
    // opportunities: z.string().optional()
});