'use client';

import * as React from 'react';
import {
    Box,
    Typography,
    Button, Collapse
} from '@mui/material';
import Grid from '@mui/material/Grid'; // MUI 7.1+ Grid2
import { useForm, Controller, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AddressForm from "@/components/forms/AddressForm";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { ControlledTextInput } from "@/components/forms/inputs/WrappedInputs";
import ControlledStringArrayField from "@/components/forms/inputs/ControlledStringArrayField";
import { MAX_LEGAL_NAMES, MAX_REGISTRATION_NUMBERS, OrganizationSchema } from "@/components/forms/schema/Organization";
import ContactForm from "@/components/forms/ContactForm";
import ControlledLegalField from "@/components/forms/inputs/ControlledLegalField";
import ControlledTaxonomySelect from "@/components/forms/inputs/ControlledTaxonomySelect";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";

export type OrganizationFormData = z.infer<typeof OrganizationSchema>;

export interface OrganizationFormProps {
    id?: string; // Optional ID for the form, useful for editing existing organizations
    defaultValues?: Partial<OrganizationFormData>;
    onSubmit: (data: OrganizationFormData) => void;
    disabled?: boolean; // Optional prop to disable the form
}

// Some required fields needed to initialize the form validator
// mitigate issues with "Invalid input: expected string, received undefined"
export const organizationInitialValues = {
    name: '',
    briefDescription: '',
    description: '',
    legalNames: [],
    registrationNumbers: [],
    acronym: [],
    primaryAddress: {
        provinceName: '',
        countryName: ''
    },
    primaryContact: {
        contactName: '',
        email: '',
        phone: ''
    },
    mailingSameAsPrimary: true,
    deliverySameAsPrimary: true,
}

export default function OrganizationForm({ id, defaultValues, onSubmit, disabled }: OrganizationFormProps) {

    const methods = useForm<any>({
        defaultValues: defaultValues ?? organizationInitialValues,
        resolver: zodResolver(OrganizationSchema),
        mode: 'all', // or 'onChange' based on your preference
        reValidateMode: 'onChange', // Re-validate on every change
        // shouldUnregister: true, // Unregister fields when they are removed
    });

    const { items: roleTypes, isLoading: loadingRoleTypes } = useTaxonomy('bedeo:RoleType');

    const { control, handleSubmit, setValue, watch, formState, getValues } = methods;

    const primaryAddress = watch('primaryAddress');
    const mailingSameAsPrimary = watch('mailingSameAsPrimary');
    const deliverySameAsPrimary = watch('deliverySameAsPrimary');

    console.log("Errors", formState.errors);
    console.log('Form values:', getValues());

    return (
        <FormProvider {...methods}>
            <Box id={id} component="form" onSubmit={handleSubmit((data) => console.log(data))} sx={{ p: 2 }} noValidate>
                {/*<input type="submit"/>*/}
                <Typography variant="h6" gutterBottom>
                    Organization Details
                </Typography>

                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="name" label="Name"/>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="tradeName"
                                                                   label="Trade Name"/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="briefDescription"
                                                                   label="Brief Description"/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="description" multiline minRows={2}
                                                                   label="Description"/>
                    </Grid>


                    <Grid size={{ xs: 12 }}>
                        <ControlledTaxonomySelect
                            name="roleTypes"
                            label="Roles"
                            options={roleTypes}
                            multiple
                            size={{ xs: 12 }}
                            required
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="missionStatement"
                                                                   label="Mission Statement" multiline minRows={2}/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput<OrganizationFormData> control={control} name="valuesStatement"
                                                                   label="Values Statement" multiline minRows={2}/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledLegalField name="legalNames" label="Legal Names" />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledLegalField name="registrationNumbers" label="Registration Numbers" max={MAX_REGISTRATION_NUMBERS} />
                    </Grid>


                    <Grid size={{ xs: 12 }}>
                        <ControlledStringArrayField name="acronyms" label="Acronyms"/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Primary Contact
                        </Typography>
                        <ContactForm baseName="primaryContact"/>
                    </Grid>


                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Primary Address
                        </Typography>
                        <AddressForm baseName="primaryAddress"/>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h5" gutterBottom>
                            Mailing Address
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={mailingSameAsPrimary}
                                    onChange={(e) => {
                                        // If checked, copy primary address to mailing address and hide mailing address fields
                                        const checked = e.target.checked;
                                        setValue('mailingSameAsPrimary', checked);
                                        setValue('mailingAddress', primaryAddress);

                                        if (checked) {
                                            setValue('mailingAddress', primaryAddress);
                                        }
                                    }}
                                />
                            }
                            label="Same as primary address"
                        />
                        {/* If mailingSameAsPrimary is true, disable the fields in AddressForm */}
                        <Collapse in={!mailingSameAsPrimary} timeout="auto">
                            <AddressForm baseName="mailingAddress" disabled={mailingSameAsPrimary}/>
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
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        console.log('Delivery Same as Primary:', checked);
                                        setValue('deliverySameAsPrimary', checked);
                                        setValue('deliveryAddress', primaryAddress);
                                        if (checked) {
                                            setValue('deliveryAddress', primaryAddress);
                                        }
                                    }}
                                />
                            }
                            label="Same as primary address"
                        />
                        <Collapse in={!deliverySameAsPrimary} timeout="auto">
                            <AddressForm baseName="deliveryAddress" disabled={deliverySameAsPrimary}/>
                        </Collapse>

                    </Grid>
                    {/*<input type="submit"/>*/}
                    <Grid size={{ xs: 12 }}>
                        <Button variant="contained" type="submit" onClick={(() => {
                            console.log('Form submitted with values:', methods.getValues());
                            onSubmit(methods.getValues());
                        })}>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </FormProvider>
    );
}
