'use client';

import React from 'react';
import {
    Box,
    Button,
    Grid,
    Typography,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import NameFieldsForm, { nameFields } from '@/components/forms/PersonForm';
import AddressForm from '@/components/forms/AddressForm';
import { AddressSchema } from "@/components/forms/schema/Address";
import { PersonNameSchema } from "@/components/forms/schema/Person";
import OrganizationForm from "@/components/forms/OrganizationForm";


const SetupProfileSchema = PersonNameSchema.extend({
    primaryAddress: AddressSchema,
});

export type SetupProfileFormData = z.infer<typeof SetupProfileSchema>;

const initialValues: SetupProfileFormData = {
    fullName: '',
    firstName: '',
    lastName: '',
    primaryAddress: {
        provinceName: '',
        countryName: '',
    },
};

interface Props {
    id?: string; // Optional ID for the form, useful for editing existing profiles
    defaultValues?: Partial<SetupProfileFormData>;
    onSubmit: (data: SetupProfileFormData) => void;
    disabled?: boolean; // Optional prop to disable the form
}

export default function SetupProfileForm({ id, defaultValues, onSubmit, disabled }: Props) {
    const methods = useForm<SetupProfileFormData>({
        defaultValues: { ...initialValues, ...defaultValues },
        resolver: zodResolver(SetupProfileSchema),
        mode: 'all', // or 'onChange' based on your preference
        reValidateMode: 'onChange', // Re-validate on every change
    });


    const { control, handleSubmit, setValue, watch, formState, getValues } = methods;

    const primaryAddress = watch('primaryAddress');
    console.log("Errors", formState.errors);
    console.log('Form values:', getValues());


    return (
        <>
            <FormProvider {...methods}>

                <Box
                    component="form"
                    onSubmit={methods.handleSubmit(onSubmit)}
                    id={id}
                    sx={{ p: 2, maxWidth: 900, mx: 'auto' }}
                >

                    {/*<input type="submit"/>*/}
                    <NameFieldsForm/>

                    <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Primary Address
                        </Typography>
                        <AddressForm baseName="primaryAddress" simplified/>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>

                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ py: 1.2 }}
                        >
                            Save Profile
                        </Button>
                    </Grid>
                </Box>
            </FormProvider>
        </>

    );
}
