'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';

import OrganizationForm, {
    OrganizationFormData,
    createOrganizationFormDefaults,
} from '@/components/forms/OrganizationForm';

interface CreateOrganizationDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: OrganizationFormData) => void | Promise<void>;
    isSubmitting?: boolean;
    resetKey?: number;
}

export function CreateOrganizationDialog({
    open,
    onClose,
    onSubmit,
    isSubmitting = false,
    resetKey,
}: CreateOrganizationDialogProps) {
    const [internalResetKey, setInternalResetKey] = useState(0);

    useEffect(() => {
        if (open && resetKey == null) {
            setInternalResetKey(key => key + 1);
        }
    }, [open, resetKey]);

    const defaultValues = useMemo(() => createOrganizationFormDefaults(), []);
    const formResetKey = resetKey ?? internalResetKey;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogContent dividers>
                <OrganizationForm
                    formId="create-organization-form"
                    defaultValues={defaultValues}
                    onSubmit={onSubmit}
                    disabled={isSubmitting}
                    resetKey={formResetKey}
                />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button
                        type="submit"
                        form="create-organization-form"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating…' : 'Create Organization'}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
