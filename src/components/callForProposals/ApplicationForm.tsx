"use client";

import * as React from "react";
import { Alert, Autocomplete, Box, Button, CircularProgress, MenuItem, Stack, TextField } from "@mui/material";
import { Controller, FormProvider, useForm } from "react-hook-form";
import ControlledUploadDropzone from "@/components/forms/inputs/ControlledUploadDropzone";
import { ACCEPTANCE_STATUSES, APPLICATION_STATUSES, PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";
import type { ApplicationInput } from "@/lib/callForProposals/types";
import { useOrganizationsCatalog } from "@/lib/hooks/useOrganizationsCatalog";

interface ApplicationFormProps {
    initialValue?: Partial<ApplicationInput> & {
        proposal?: {
            title?: string;
            description?: string;
            files?: string[];
            proposalStatus?: string;
        };
    };
    onSubmit: (values: ApplicationInput) => Promise<void> | void;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    error?: string;
    allowStatusFields?: boolean;
    allowDecisionFields?: boolean;
}

type FormValues = {
    proposal: {
        title: string;
        description: string;
        files: string[];
        proposalStatus: string;
    };
    coApplicants: string[];
    applicationStatus?: string;
    acceptanceStatus?: string;
};

const DEFAULT_SUBMIT_LABEL = "Save";

export function ApplicationForm({
    initialValue,
    onSubmit,
    onCancel,
    submitLabel,
    cancelLabel,
    isSubmitting,
    error,
    allowStatusFields,
    allowDecisionFields,
}: ApplicationFormProps) {
    const defaultValues = React.useMemo<FormValues>(() => ({
        proposal: {
            title: initialValue?.proposal?.title ?? "",
            description: initialValue?.proposal?.description ?? "",
            files: initialValue?.proposal?.files ?? [],
            proposalStatus: initialValue?.proposal?.proposalStatus ?? "draft",
        },
        coApplicants: Array.isArray(initialValue?.coApplicants)
            ? (initialValue?.coApplicants as string[]).filter(Boolean)
            : [],
        applicationStatus: initialValue?.applicationStatus,
        acceptanceStatus: initialValue?.acceptanceStatus,
    }), [initialValue]);

    const methods = useForm<FormValues>({
        defaultValues,
    });

    const { organizations, isLoading: isLoadingOrganizations } = useOrganizationsCatalog();

    const organizationOptions = React.useMemo(() => (
        organizations.map((org) => ({ iri: org.iri, name: org.name }))
    ), [organizations]);

    const organizationLookup = React.useMemo(() => {
        const map = new Map<string, { iri: string; name?: string }>();
        organizationOptions.forEach((option) => {
            map.set(option.iri, option);
        });
        return map;
    }, [organizationOptions]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = methods;

    React.useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const submit = handleSubmit(async (values) => {
        const coApplicants = Array.isArray(values.coApplicants)
            ? values.coApplicants
                .map((item) => (typeof item === "string" ? item.trim() : ""))
                .filter((iri) => iri.length > 0)
            : [];

        const payload: ApplicationInput = {
            proposal: {
                title: values.proposal.title,
                description: values.proposal.description,
                files: values.proposal.files ?? [],
                proposalStatus: values.proposal.proposalStatus ?? "draft",
            },
            coApplicants,
        };

        if (allowStatusFields && values.applicationStatus) {
            payload.applicationStatus = values.applicationStatus;
        }
        if (allowDecisionFields && values.acceptanceStatus) {
            payload.acceptanceStatus = values.acceptanceStatus;
        }

        await onSubmit(payload);
    });

    return (
        <FormProvider {...methods}>
            <Box component="form" onSubmit={submit} noValidate>
                <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Proposal title"
                        required
                        fullWidth
                        {...register("proposal.title", { required: "Title is required" })}
                        error={Boolean(errors?.proposal?.title)}
                        helperText={errors?.proposal?.title?.message}
                    />

                    <TextField
                        label="Proposal description"
                        required
                        multiline
                        minRows={4}
                        fullWidth
                        {...register("proposal.description", { required: "Description is required" })}
                        error={Boolean(errors?.proposal?.description)}
                        helperText={errors?.proposal?.description?.message}
                    />

                    <Controller
                        name="coApplicants"
                        control={control}
                        render={({ field: { value, onChange } }) => {
                            const selectedOptions = Array.isArray(value)
                                ? value.map((iri) => organizationLookup.get(iri) ?? { iri, name: iri })
                                : [];

                            return (
                                <Autocomplete
                                    multiple
                                    options={organizationOptions}
                                    value={selectedOptions}
                                    disableCloseOnSelect
                                    filterSelectedOptions
                                    loading={isLoadingOrganizations}
                                    getOptionLabel={(option) => option.name ?? option.iri}
                                    isOptionEqualToValue={(option, selectedOption) => option.iri === selectedOption.iri}
                                    onChange={(_, newValue) => {
                                        onChange(newValue.map((option) => option.iri));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Co-applicant organizations"
                                            placeholder={isLoadingOrganizations ? "Loading organizations…" : "Select organizations"}
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoadingOrganizations ? <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            );
                        }}
                    />

                    <TextField
                        select
                        label="Proposal status"
                        fullWidth
                        {...register("proposal.proposalStatus")}
                    >
                        {PROPOSAL_STATUSES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <ControlledUploadDropzone
                        name="proposal.files"
                        label="Supporting documents"
                        endpoint="/api/uploads/files"
                    />

                    {allowStatusFields && (
                        <TextField
                            select
                            label="Application status"
                            fullWidth
                            {...register("applicationStatus")}
                        >
                            {APPLICATION_STATUSES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {allowDecisionFields && (
                        <TextField
                            select
                            label="Decision status"
                            fullWidth
                            {...register("acceptanceStatus")}
                        >
                            {ACCEPTANCE_STATUSES.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        {onCancel && (
                            <Button onClick={onCancel} disabled={isSubmitting} variant="outlined">
                                {cancelLabel ?? "Cancel"}
                            </Button>
                        )}
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? "Saving…" : submitLabel ?? DEFAULT_SUBMIT_LABEL}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </FormProvider>
    );
}
