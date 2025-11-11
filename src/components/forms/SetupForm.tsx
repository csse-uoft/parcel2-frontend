'use client';

import React from 'react';
import {
    Box,
    Button,
    Grid,
    Typography,
} from '@mui/material';
import { useForm, FormProvider, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import NameFieldsForm, { nameFields } from '@/components/forms/PersonForm';
import AddressForm from '@/components/forms/AddressForm';
import { AddressSchema } from "@/components/forms/schema/Address";
import { PersonNameSchema } from "@/components/forms/schema/Person";


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
    id?: string;
    defaultValues?: Partial<SetupProfileFormData>;
    onSubmit: (data: SetupProfileFormData) => void;
    disabled?: boolean;
    showSubmitButton?: boolean;
    children?: React.ReactNode;
}

export default function SetupProfileForm({
                                              id,
                                              defaultValues,
                                              onSubmit,
                                              disabled,
                                              showSubmitButton = true,
                                              children,
                                          }: Props) {
    const methods = useForm<SetupProfileFormData>({
        defaultValues: { ...initialValues, ...defaultValues },
        resolver: zodResolver(SetupProfileSchema) as Resolver<SetupProfileFormData>,
        mode: 'all',
        reValidateMode: 'onChange',
    });

    const submitHandler = React.useCallback<SubmitHandler<SetupProfileFormData>>(
        values => onSubmit(values),
        [onSubmit]
    );

    return (
        <FormProvider {...methods}>
            <Box
                component="form"
                onSubmit={methods.handleSubmit(submitHandler)}
                id={id}
                sx={{ p: 2, maxWidth: 900, mx: 'auto' }}
            >
                <NameFieldsForm/>

                <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Primary Address
                    </Typography>
                    <AddressForm baseName="primaryAddress" disabled={disabled}/>
                </Grid>

                {showSubmitButton && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                        <Button
                            variant="contained"
                            type="submit"
                            sx={{ py: 1.2 }}
                            disabled={disabled}
                        >
                            Save Profile
                        </Button>
                    </Grid>
                )}

                {children}
            </Box>
        </FormProvider>
    );
}
