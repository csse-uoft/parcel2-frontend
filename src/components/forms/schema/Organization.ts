import { z } from "zod";
import { AddressSchema } from "@/components/forms/schema/Address";
import { ContactSchema } from "@/components/forms/schema/Contact";

export const MAX_LEGAL_NAMES = 2; // Maximum number of legal names allowed
export const MAX_REGISTRATION_NUMBERS = 5;


export const OrganizationLegalNameSchema = z.object({
    hasValue: z.string().min(1, 'Legal name is required'),
    registeringAuthority: z.string().optional(),
    jurisdiction: z.string().optional(),
    // Accept empty or yyyy-mm-dd strings and coerce to Date for backend
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
}).refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { path: ['endDate'], message: 'End date must be on/after start date' }
);

export const OrganizationLegalNamesSchema = z
    .array(OrganizationLegalNameSchema)
    .min(1, 'At least one legal name is required')
    .max(MAX_LEGAL_NAMES, `At most ${MAX_LEGAL_NAMES} legal names are allowed`);

export const OrganizationRegistrationNumberSchema = z.object({
    hasValue: z.string().min(1, 'Registration number is required'),
    registeringAuthority: z.string().optional(),
    jurisdiction: z.string().optional(),
    // Accept empty or yyyy-mm-dd strings and coerce to Date for backend
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
}).refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { path: ['endDate'], message: 'End date must be on/after start date' }
);

export const OrganizationRegistrationNumbersSchema = z
    .array(OrganizationLegalNameSchema)
    .max(MAX_REGISTRATION_NUMBERS, `At most ${MAX_LEGAL_NAMES} legal names are allowed`);

export const OrganizationSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    tradeName: z.string().optional(),
    legalNames: OrganizationLegalNamesSchema,
    acronyms: z
        .array(z.object({ value: z.string().min(1, "Acronym is required") }))
        .optional(),
    briefDescription: z.string().min(1, "Brief description is required"),
    description: z.string().min(1, "Description is required"),
    missionStatement: z.string().optional(),
    valuesStatement: z.string().optional(),
    registrationNumbers: OrganizationRegistrationNumbersSchema.optional(),
    primaryAddress: AddressSchema,
    mailingAddress: AddressSchema.optional(),
    deliveryAddress: AddressSchema.optional(),
    mailingSameAsPrimary: z.boolean(),
    deliverySameAsPrimary: z.boolean(),
    primaryContact: ContactSchema,
    // opportunities: z.string().optional()
});
