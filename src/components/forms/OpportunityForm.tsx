'use client';

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    MenuItem,
} from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OpportunitySchema, OpportunityFormData } from './schema/Opportunity';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import PrimaryContactForm from '@/components/forms/ContactForm';
import ControlledStringArrayField from '@/components/forms/inputs/ControlledStringArrayField';

/* ------------------------------------------------------------------ */
/*  Quick lookup arrays – replace with API data or constants          */
/* ------------------------------------------------------------------ */
const ROLE_OPTIONS = ['Developer', 'Architect', 'Engineer'];
const TYPE_OPTIONS = ['Residential', 'Commercial', 'Industrial'];
const STAGE_OPTIONS = ['Planning', 'Design', 'Construction'];


interface Props {
    id?: string;                          // let parent bind save button
    defaultValues?: Partial<OpportunityFormData>;
    onSubmit: (data: OpportunityFormData) => void;
    disabled?: boolean;
}

export default function OpportunityForm({
                                            id,
                                            defaultValues,
                                            onSubmit,
                                            disabled,
                                        }: Props) {
    const methods = useForm<OpportunityFormData>({
        defaultValues,
        resolver: zodResolver(OpportunitySchema),
        mode: 'onBlur',
    });

    const { control } = methods;

    return (
        <FormProvider {...methods}>
            <Box
                id={id}
                component="form"
                onSubmit={methods.handleSubmit(onSubmit)}
                sx={{ mt: 0 }}
            >
                {/* ------- BASIC INFO ----------------------------------- */}
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput
                            control={control}
                            name="name"
                            label="Opportunity Name"
                            required
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput
                            control={control}
                            name="description"
                            label="Description"
                            multiline
                            minRows={3}
                            required
                            disabled={disabled}
                        />
                    </Grid>
                </Grid>

                {/* ------- SELECTS -------------------------------------- */}
                <Typography variant="h6" sx={{ mt: 4 }}>
                    Classification
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput
                            select
                            control={control}
                            name="projectType"
                            label="Project Type"
                            required
                            disabled={disabled}
                        >
                            {TYPE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </ControlledTextInput>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <ControlledTextInput
                            select
                            control={control}
                            name="projectStage"
                            label="Project Stage"
                            required
                            disabled={disabled}
                        >
                            {STAGE_OPTIONS.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </ControlledTextInput>
                    </Grid>
                </Grid>

                {/* ------- Partnership Roles ---------------------------- */}
                <Typography variant="h6" sx={{ mt: 4 }}>
                    Partnership Roles Needed
                </Typography>

                <ControlledStringArrayField
                    name="partnershipRoles"
                    label="Roles"
                    disabled={disabled}
                />

                {/* ------- Primary Contact ------------------------------ */}
                <PrimaryContactForm
                    baseName="primaryContact"
                    disabled={disabled}
                />

                {/* ------- Partners (simple list of org IDs for now) ----- */}
                <Typography variant="h6" sx={{ mt: 4 }}>
                    Partners
                </Typography>
                <ControlledStringArrayField
                    name="partners"
                    label="Partner Organization IDs"
                    disabled={disabled}
                />

                {/* ------- Land (text field) ---------------------------- */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput
                            control={control}
                            name="land"
                            label="Land (optional)"
                            disabled={disabled}
                        />
                    </Grid>
                </Grid>

                {/* ------- Submit (if used standalone) ------------------ */}
                {!disabled && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                        <Button variant="contained" type="submit">
                            Save Opportunity
                        </Button>
                    </Grid>
                )}
            </Box>
        </FormProvider>
    );
}
