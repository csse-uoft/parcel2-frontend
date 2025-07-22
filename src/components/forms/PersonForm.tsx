'use client';

import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { ControlledTextInput } from "@/components/forms/inputs/WrappedInputs";


/* ------------------------------------------------------------------ */
/* 1. field-meta list (re-export if needed elsewhere)                  */
/* ------------------------------------------------------------------ */
export const nameFields = [
    { label: 'Full Name',   key: 'fullName',  size: { xs: 12, sm: 12 } },
    { label: 'First Name',  key: 'firstName', size: { xs: 12, sm: 4 } },
    { label: 'Middle Name', key: 'middleName',size: { xs: 12, sm: 4 } },
    { label: 'Last Name',   key: 'lastName',  size: { xs: 12, sm: 4 } },
] as const;

/* ------------------------------------------------------------------ */
/* 2. reusable form section                                            */
/* ------------------------------------------------------------------ */
interface Props {
    /** prefix for nested object, eg `"contact"` → contact.currentFirstName */
    baseName?: string;
}

export default function NameFieldsForm({ baseName }: Props) {
    const { control } = useFormContext();

    const makePath = (key: string) => (baseName ? `${baseName}.${key}` : key);

    return (
        <Box sx={{ mb: 0 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Name Information
            </Typography>

            <Grid container spacing={2}>
                {nameFields.map(({ key, label, size }) => (
                    <Grid key={key} size={size}>
                        <ControlledTextInput
                            control={control}
                            name={makePath(key)}
                            label={label}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
