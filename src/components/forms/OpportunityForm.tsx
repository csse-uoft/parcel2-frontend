'use client';

import React from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    Switch,
    FormControlLabel,
    Alert,
} from '@mui/material';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OpportunitySchema, OpportunityFormData } from './schema/Opportunity';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import PrimaryContactForm from '@/components/forms/ContactForm';
import ControlledPartnersField from '@/components/forms/inputs/ControlledPartnersField';
import ControlledTaxonomySelect, { TaxonomyOption } from '@/components/forms/inputs/ControlledTaxonomySelect';
import LandForm from '@/components/forms/LandForm';
import ControlledUploadDropzone from '@/components/forms/inputs/ControlledUploadDropzone';
import ControlledImageUploadDropzone from '@/components/forms/inputs/ControlledImagesField';

interface Props {
    id?: string;
    defaultValues?: Partial<OpportunityFormData>;
    onSubmit: (data: OpportunityFormData) => void | Promise<void>;
    disabled?: boolean;

    /** RoleType taxonomy (multi-select) */
    roleTypeOptions: TaxonomyOption[];
    /** ProjectType taxonomy (single select) */
    projectTypeOptions: TaxonomyOption[];
    /** ProjectStage taxonomy (single select) */
    projectStageOptions: TaxonomyOption[];

    /** Land unit options */
    unitOptions: TaxonomyOption[];
    /** Land use options */
    landUseOptions: TaxonomyOption[];
    /** Parcel2 orgs for partners */
    orgOptions?: { id: string; label: string }[];

    /** Optional server error to display (e.g., from page submit) */
    serverErrorMessage?: string;
}

export default function OpportunityForm({
                                            id,
                                            defaultValues,
                                            onSubmit,
                                            disabled,
                                            roleTypeOptions,
                                            projectTypeOptions,
                                            projectStageOptions,
                                            unitOptions,
                                            landUseOptions,
                                            orgOptions = [],
                                            serverErrorMessage,
                                        }: Props) {
    const methods = useForm<any>({
        defaultValues,
        resolver: zodResolver(OpportunitySchema),
        mode: 'all',
        reValidateMode: 'onChange',
    });

    const { control, formState, getValues } = methods;
    const isSubmitting = formState.isSubmitting;
    const isDisabled = !!disabled || isSubmitting;

    console.log("Errors", formState.errors);
    console.log('Form values:', getValues());

    return (
        <FormProvider {...methods}>
            <Box id={id} component="form" onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                {serverErrorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {serverErrorMessage}
                    </Alert>
                )}

                {/* Basic Info */}
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <ControlledTextInput
                            control={control}
                            name="name"
                            label="Opportunity Name"
                            required
                            disabled={isDisabled}
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
                            disabled={isDisabled}
                        />
                    </Grid>
                </Grid>

                {/* Classification */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <ControlledTaxonomySelect
                        name="projectType"
                        label="Project Type"
                        options={projectTypeOptions}
                        disabled={isDisabled}
                        required
                    />
                    <ControlledTaxonomySelect
                        name="projectStage"
                        label="Project Stage"
                        options={projectStageOptions}
                        disabled={isDisabled}
                        required
                    />
                    <ControlledTaxonomySelect
                        name="partnershipRoles"
                        label="Partnership Roles Needed"
                        options={roleTypeOptions}
                        disabled={isDisabled}
                        multiple
                        size={{ xs: 12 }}
                        required
                    />
                </Grid>

                {/* Primary Contact */}
                <Typography variant="h6" sx={{ my: 2 }}>Primary Contact</Typography>
                <PrimaryContactForm baseName="primaryContact" disabled={isDisabled}/>

                {/* Partners (each with nested roles using same taxonomy) */}
                <ControlledPartnersField
                    name="partners"
                    label="Current Partners"
                    orgOptions={orgOptions}
                    roleTypeOptions={roleTypeOptions}
                    disabled={isDisabled}
                />

                {/* Land */}
                <LandForm
                    baseName="land"
                    unitOptions={unitOptions}
                    landUseOptions={landUseOptions}
                    disabled={isDisabled}
                />

                <Typography variant="h6" sx={{ mt: 4 }}>
                    Additional Info
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {/* Images with primary selection */}
                        <ControlledImageUploadDropzone
                            nameImages="additionalInfo.images"
                            namePrimary="additionalInfo.primaryImage"
                            endpoint="/api/uploads/images"
                            maxFiles={12}
                            disabled={isDisabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <ControlledUploadDropzone
                            name="additionalInfo.files"
                            label="Attachments"
                            endpoint="/api/uploads/files"
                            accept={{
                                'application/pdf': [],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
                                'text/plain': [],
                            }}
                            maxFiles={20}
                            multiple
                            disabled={isDisabled}
                        />
                    </Grid>

                    {/* Posted / Searchable toggles */}
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="additionalInfo.isPosted"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!field.value}
                                            onChange={(_, checked) => field.onChange(checked)}
                                            disabled={isDisabled}
                                        />
                                    }
                                    label="Mark as Posted"
                                />
                            )}
                        />
                        <Controller
                            name="additionalInfo.isSearchable"
                            control={control}
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!field.value}
                                            onChange={(_, checked) => field.onChange(checked)}
                                            disabled={isDisabled}
                                        />
                                    }
                                    label="Searchable (visible in search)"
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                {!disabled && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 4 }}>
                        <Button variant="contained" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving…' : 'Save Opportunity'}
                        </Button>
                    </Grid>
                )}
            </Box>
        </FormProvider>
    );
}
