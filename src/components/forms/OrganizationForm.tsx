'use client';

import * as React from 'react';
import { Box, Typography, Collapse, FormControlLabel, Checkbox } from '@mui/material';
import Grid from '@mui/material/Grid'; // MUI 7 Grid2
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import type { SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import ControlledTaxonomySelect from '@/components/forms/inputs/ControlledTaxonomySelect';
import ControlledLegalField from '@/components/forms/inputs/ControlledLegalField';
import ControlledStringArrayField from '@/components/forms/inputs/ControlledStringArrayField';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import ContactForm from '@/components/forms/ContactForm';
import AddressForm, { AddressFormData } from '@/components/forms/AddressForm';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { MAX_LEGAL_NAMES, MAX_REGISTRATION_NUMBERS, OrganizationSchema } from '@/components/forms/schema/Organization';
import type { ContactFormData } from '@/components/forms/schema/Contact';

export type OrganizationFormData = z.infer<typeof OrganizationSchema>;

type LegalEntry = OrganizationFormData['legalNames'][number];
type RegistrationEntry = NonNullable<OrganizationFormData['registrationNumbers']>[number];
type AcronymEntry = NonNullable<OrganizationFormData['acronyms']>[number];

const addressKeys: (keyof AddressFormData)[] = [
    'streetNumber',
    'streetName',
    'streetType',
    'streetDirection',
    'unitDesignator',
    'unitIdentifier',
    'siteName',
    'ruralRouteIdentifier',
    'postalBoxIdentifier',
    'postalStationInformation',
    'postalCode',
    'localityName',
    'provinceName',
    'provinceCode',
    'countryName',
    'countryCode',
    'locationDescription',
    'lotInformation',
    'partLotInformation',
    'concessionInformation',
    'propertyIdentificationNumber',
    'stringRepresentation',
    'latitude',
    'longitude',
];

function createEmptyAddress(): AddressFormData {
    return {
        streetNumber: '',
        streetName: '',
        streetType: '',
        streetDirection: '',
        unitDesignator: '',
        unitIdentifier: '',
        siteName: '',
        ruralRouteIdentifier: '',
        postalBoxIdentifier: '',
        postalStationInformation: '',
        postalCode: '',
        localityName: '',
        provinceName: '',
        provinceCode: '',
        countryName: '',
        countryCode: '',
        locationDescription: '',
        lotInformation: '',
        partLotInformation: '',
        concessionInformation: '',
        propertyIdentificationNumber: '',
        stringRepresentation: '',
        latitude: '' as any,
        longitude: '' as any,
    };
}

function createEmptyLegalEntry(): LegalEntry {
    return {
        hasValue: '',
        registeringAuthority: '',
        jurisdiction: '',
        startDate: '' as any,
        endDate: '' as any,
    };
}

function createEmptyContact(): ContactFormData {
    return {
        contactName: '',
        email: '',
        phone: '',
    };
}

function normalizeContact(contact?: Partial<ContactFormData> | null): ContactFormData {
    const base = createEmptyContact();
    if (!contact) {
        return base;
    }
    return {
        contactName: typeof contact.contactName === 'string' ? contact.contactName : '',
        email: typeof contact.email === 'string' ? contact.email : '',
        phone: typeof contact.phone === 'string' ? contact.phone : '',
    };
}

function formatDateInput(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }
    const str = String(value);
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.slice(0, 10);
    }
    const parsed = new Date(str);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }
    return parsed.toISOString().slice(0, 10);
}

function normalizeLegalEntries(entries?: OrganizationFormData['legalNames']): OrganizationFormData['legalNames'] {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [createEmptyLegalEntry()];
    }
    return entries.map(entry => ({
        hasValue: entry?.hasValue ?? '',
        registeringAuthority: entry?.registeringAuthority ?? '',
        jurisdiction: entry?.jurisdiction ?? '',
        startDate: formatDateInput(entry?.startDate),
        endDate: formatDateInput(entry?.endDate),
    })) as OrganizationFormData['legalNames'];
}

function normalizeRegistrationEntries(entries?: OrganizationFormData['registrationNumbers']): OrganizationFormData['registrationNumbers'] {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }
    return entries.map(entry => ({
        hasValue: entry?.hasValue ?? '',
        registeringAuthority: entry?.registeringAuthority ?? '',
        jurisdiction: entry?.jurisdiction ?? '',
        startDate: formatDateInput(entry?.startDate),
        endDate: formatDateInput(entry?.endDate),
    })) as OrganizationFormData['registrationNumbers'];
}

function normalizeAcronyms(entries?: OrganizationFormData['acronyms']): AcronymEntry[] {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }
    return entries.map(entry => ({
        value: entry?.value ?? '',
    }));
}

function hasAddressData(address?: Partial<AddressFormData> | null): boolean {
    if (!address) return false;
    return addressKeys.some(key => {
        const value = address[key];
        if (value == null) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !Number.isNaN(value);
        return false;
    });
}

function buildAddress(source?: Partial<AddressFormData> | null): AddressFormData {
    const address = createEmptyAddress();
    if (!source) return address;
    for (const key of addressKeys) {
        const value = source[key];
        if (value === undefined || value === null) continue;
        (address as any)[key] = value;
    }
    return address;
}

function cloneAddress(address?: Partial<AddressFormData> | null): AddressFormData {
    return buildAddress(address ?? undefined);
}

type PartialOrganizationFormData = Partial<OrganizationFormData> | undefined;

function normalizeDefaults(defaultValues: PartialOrganizationFormData): OrganizationFormData {
    if (!defaultValues) {
        return createOrganizationFormDefaults();
    }

    const primaryAddress = buildAddress(defaultValues.primaryAddress);
    const mailingHasData = hasAddressData(defaultValues.mailingAddress);
    const deliveryHasData = hasAddressData(defaultValues.deliveryAddress);
    const mailingSame = defaultValues.mailingSameAsPrimary ?? !mailingHasData;
    const deliverySame = defaultValues.deliverySameAsPrimary ?? !deliveryHasData;

    return {
        name: defaultValues.name ?? '',
        tradeName: defaultValues.tradeName ?? '',
        briefDescription: defaultValues.briefDescription ?? '',
        description: defaultValues.description ?? '',
        missionStatement: defaultValues.missionStatement ?? '',
        valuesStatement: defaultValues.valuesStatement ?? '',
        legalNames: normalizeLegalEntries(defaultValues.legalNames),
        registrationNumbers: normalizeRegistrationEntries(defaultValues.registrationNumbers),
        acronyms: normalizeAcronyms(defaultValues.acronyms),
        primaryContact: normalizeContact(defaultValues.primaryContact),
        primaryAddress,
        mailingSameAsPrimary: mailingSame,
        deliverySameAsPrimary: deliverySame,
        mailingAddress: mailingSame ? cloneAddress(primaryAddress) : buildAddress(defaultValues.mailingAddress),
        deliveryAddress: deliverySame ? cloneAddress(primaryAddress) : buildAddress(defaultValues.deliveryAddress),
        roleTypes: Array.isArray(defaultValues.roleTypes)
            ? defaultValues.roleTypes.filter((value): value is string => typeof value === 'string' && value.length > 0)
            : [],
    };
}

export function createOrganizationFormDefaults(): OrganizationFormData {
    return {
        name: '',
        tradeName: '',
        briefDescription: '',
        description: '',
        missionStatement: '',
        valuesStatement: '',
        legalNames: [createEmptyLegalEntry()],
        registrationNumbers: [],
        acronyms: [],
        primaryContact: createEmptyContact(),
        primaryAddress: createEmptyAddress(),
        mailingAddress: createEmptyAddress(),
        deliveryAddress: createEmptyAddress(),
        mailingSameAsPrimary: true,
        deliverySameAsPrimary: true,
        roleTypes: [],
    };
}

export interface OrganizationFormProps {
    id?: string;
    formId?: string;
    defaultValues?: Partial<OrganizationFormData>;
    onSubmit: (data: OrganizationFormData) => void | Promise<void>;
    disabled?: boolean;
    resetKey?: number;
    children?: React.ReactNode;
}

export const organizationInitialValues = createOrganizationFormDefaults();

export default function OrganizationForm({
                                               id,
                                               formId,
                                               defaultValues,
                                               onSubmit,
                                               disabled = false,
                                               resetKey,
                                               children,
                                           }: OrganizationFormProps) {
    const normalizedDefaults = React.useMemo<OrganizationFormData>(
        () => normalizeDefaults(defaultValues),
        [defaultValues]
    );
    console.log('resetKey:', resetKey);

    const methods = useForm<OrganizationFormData>({
        defaultValues: normalizedDefaults,
        resolver: zodResolver(OrganizationSchema) as Resolver<OrganizationFormData>,
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const { items: roleTypes, isLoading: loadingRoleTypes } = useTaxonomy('bedeo:RoleType');

    React.useEffect(() => {
        methods.reset(normalizedDefaults);
    }, [methods, normalizedDefaults, resetKey]);

    const control = methods.control;
    const setValue = methods.setValue;
    const primaryAddress = (useWatch({ control, name: 'primaryAddress' }) as AddressFormData | undefined) ?? createEmptyAddress();
    const mailingSameAsPrimary = useWatch({ control, name: 'mailingSameAsPrimary' }) ?? true;
    const deliverySameAsPrimary = useWatch({ control, name: 'deliverySameAsPrimary' }) ?? true;

    React.useEffect(() => {
        if (mailingSameAsPrimary) {
            setValue('mailingAddress', cloneAddress(primaryAddress), { shouldDirty: false, shouldValidate: false });
        }
    }, [mailingSameAsPrimary, primaryAddress, setValue]);

    React.useEffect(() => {
        if (deliverySameAsPrimary) {
            setValue('deliveryAddress', cloneAddress(primaryAddress), { shouldDirty: false, shouldValidate: false });
        }
    }, [deliverySameAsPrimary, primaryAddress, setValue]);

    const submitHandler = React.useCallback<SubmitHandler<OrganizationFormData>>(
        values => onSubmit(values),
        [onSubmit]
    );

    const resolvedFormId = formId ?? id;

    return (
        <FormProvider {...methods}>
            <Box
                id={resolvedFormId}
                component="form"
                onSubmit={methods.handleSubmit(submitHandler)}
                sx={{ p: 2 }}
                noValidate
            >
                <Typography variant="h6" gutterBottom>
                    Organization Details
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="name"
                            label="Name"
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="tradeName"
                            label="Trade Name"
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="briefDescription"
                            label="Brief Description"
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="description"
                            label="Description"
                            multiline
                            minRows={2}
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTaxonomySelect
                            name="roleTypes"
                            label="Roles"
                            options={roleTypes}
                            multiple
                            size={{ xs: 12 }}
                            required
                            disabled={disabled || loadingRoleTypes}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="missionStatement"
                            label="Mission Statement"
                            multiline
                            minRows={2}
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData>
                            control={control}
                            name="valuesStatement"
                            label="Values Statement"
                            multiline
                            minRows={2}
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledLegalField name="legalNames" label="Legal Names" disabled={disabled} max={MAX_LEGAL_NAMES} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledLegalField
                            name="registrationNumbers"
                            label="Registration Numbers"
                            disabled={disabled}
                            max={MAX_REGISTRATION_NUMBERS}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledStringArrayField name="acronyms" label="Acronyms" disabled={disabled} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Primary Contact
                        </Typography>
                        <ContactForm baseName="primaryContact" disabled={disabled} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Primary Address
                        </Typography>
                        <AddressForm baseName="primaryAddress" disabled={disabled} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Mailing Address
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={mailingSameAsPrimary}
                                    onChange={event => setValue('mailingSameAsPrimary', event.target.checked)}
                                    disabled={disabled}
                                />
                            }
                            label="Same as primary address"
                            disabled={disabled}
                        />
                        <Collapse in={!mailingSameAsPrimary} timeout="auto">
                            <AddressForm
                                baseName="mailingAddress"
                                disabled={disabled || mailingSameAsPrimary}
                            />
                        </Collapse>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Delivery Address
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={deliverySameAsPrimary}
                                    onChange={event => setValue('deliverySameAsPrimary', event.target.checked)}
                                    disabled={disabled}
                                />
                            }
                            label="Same as primary address"
                            disabled={disabled}
                        />
                        <Collapse in={!deliverySameAsPrimary} timeout="auto">
                            <AddressForm
                                baseName="deliveryAddress"
                                disabled={disabled || deliverySameAsPrimary}
                            />
                        </Collapse>
                    </Grid>
                </Grid>

                {children}
            </Box>
        </FormProvider>
    );
}
