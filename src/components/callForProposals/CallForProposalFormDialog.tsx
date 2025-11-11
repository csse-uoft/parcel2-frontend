"use client";

import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { CALL_FOR_PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";
import type { CallForProposalInput } from "@/lib/callForProposals/types";

export interface OptionItem {
    value: string;
    label: string;
}

interface CallForProposalFormDialogProps {
    open: boolean;
    title: string;
    initialValue?: Partial<CallForProposalInput>;
    opportunityOptions: OptionItem[];
    onSubmit: (values: CallForProposalInput) => Promise<void> | void;
    onClose: () => void;
    error?: string;
    isSubmitting?: boolean;
}

const isoDate = (value?: string | Date) => {
    if (!value) return "";
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
};

export function CallForProposalFormDialog({
    open,
    title,
    opportunityOptions,
    initialValue,
    onSubmit,
    onClose,
    error,
    isSubmitting,
}: CallForProposalFormDialogProps) {
    const {
        register,
        handleSubmit,
    formState: { errors },
        reset,
    } = useForm<CallForProposalInput>({
        defaultValues: {
            forPartnershipOpportunity: initialValue?.forPartnershipOpportunity ?? "",
            startDate: isoDate(initialValue?.startDate),
            endDate: isoDate(initialValue?.endDate),
            status: initialValue?.status ?? CALL_FOR_PROPOSAL_STATUSES[0].value,
        },
    });

    React.useEffect(() => {
        reset({
            forPartnershipOpportunity: initialValue?.forPartnershipOpportunity ?? "",
            startDate: isoDate(initialValue?.startDate),
            endDate: isoDate(initialValue?.endDate),
            status: initialValue?.status ?? CALL_FOR_PROPOSAL_STATUSES[0].value,
        });
    }, [initialValue, reset]);

    const submit = handleSubmit(async (values) => {
        await onSubmit(values);
    });

    return (
        <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        select
                        label="Opportunity"
                        fullWidth
                        {...register("forPartnershipOpportunity", { required: "Opportunity is required" })}
                        error={Boolean(errors.forPartnershipOpportunity)}
                        helperText={errors.forPartnershipOpportunity?.message}
                    >
                        {opportunityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            type="date"
                            label="Start date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            {...register("startDate", { required: "Start date is required" })}
                            error={Boolean(errors.startDate)}
                            helperText={errors.startDate?.message}
                        />
                        <TextField
                            type="date"
                            label="End date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            {...register("endDate", { required: "End date is required" })}
                            error={Boolean(errors.endDate)}
                            helperText={errors.endDate?.message}
                        />
                    </Stack>
                    <TextField
                        select
                        label="Status"
                        fullWidth
                        {...register("status", { required: true })}
                    >
                        {CALL_FOR_PROPOSAL_STATUSES.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={submit} variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
