
// --- Zod Schema ---
import { z } from "zod";

export const AddressSchema = z.object({
    streetNumber: z.string().optional(),
    streetName: z.string().optional(),
    streetType: z.string().optional(),
    streetDirection: z.string().optional(),
    unitDesignator: z.string().optional(),
    unitIdentifier: z.string().optional(),
    siteName: z.string().optional(),
    ruralRouteIdentifier: z.string().optional(),
    postalBoxIdentifier: z.string().optional(),
    postalStationInformation: z.string().optional(),
    postalCode: z.string().optional(),
    localityName: z.string().optional(),
    provinceName: z.string(),
    provinceCode: z.string().optional(),
    countryName: z.string(),
    countryCode: z.string().optional(),
    locationDescription: z.string().optional(),
    lotInformation: z.string().optional(),
    partLotInformation: z.string().optional(),
    concessionInformation: z.string().optional(),
    propertyIdentificationNumber: z.string().optional(),
    stringRepresentation: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
});

