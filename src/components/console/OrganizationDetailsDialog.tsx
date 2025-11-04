'use client';

import { useMemo } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';
import type { AdminOrganization, ConsoleUser } from './types';
import OrganizationForm, { OrganizationFormData } from '@/components/forms/OrganizationForm';
import { mapOrganizationToFormData } from '@/components/forms/organizationFormAdapter';

interface OrganizationDetailsDialogProps {
    open: boolean;
    organization: AdminOrganization | null;
    members: ConsoleUser[];
    canEdit: boolean;
    canDelete: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    formResetKey?: number;
    onClose: () => void;
    onSave: (values: OrganizationFormData) => void;
    onDelete?: () => void;
    onSelectMember?: (user: ConsoleUser) => void;
}

export function OrganizationDetailsDialog({
    open,
    organization,
    members,
    canEdit,
    canDelete,
    isSaving,
    isDeleting,
    formResetKey,
    onClose,
    onSave,
    onDelete,
    onSelectMember,
}: OrganizationDetailsDialogProps) {
    const formValues = useMemo(
        () => (organization ? mapOrganizationToFormData(organization) : null),
        [organization]
    );

    if (!organization || !formValues) {
        return null;
    }
    const disableFields = !canEdit;
    const canShowDelete = canDelete && Boolean(onDelete);
    const isSubmitting = isSaving || isDeleting;
    const canSelectMember = typeof onSelectMember === 'function';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {organization.name ?? 'Organization Details'}
                <Typography variant="caption" component="div" color="text.secondary">
                    {organization.iri}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <OrganizationForm
                    formId="organization-details-form"
                    defaultValues={formValues}
                    disabled={disableFields || isSubmitting}
                    onSubmit={onSave}
                    resetKey={formResetKey}
                >
                    <Divider sx={{ mt: 3 }}>Members</Divider>
                    {members.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            This organization does not have any members.
                        </Alert>
                    ) : (
                        <List dense disablePadding sx={{ mt: 2 }}>
                            {members.map(member => (
                                <ListItem
                                    key={member._id}
                                    secondaryAction={
                                        canSelectMember ? (
                                            <Button size="small" onClick={() => onSelectMember?.(member)}>
                                                View Details
                                            </Button>
                                        ) : undefined
                                    }
                                >
                                    <ListItemText
                                        primary={member.username ?? member.email}
                                        secondary={member.email}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </OrganizationForm>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1}>
                    {canShowDelete && (
                        <Button
                            color="error"
                            onClick={onDelete}
                            disabled={isSubmitting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete Organization'}
                        </Button>
                    )}
                </Stack>
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    {canEdit && (
                        <Button
                            type="submit"
                            form="organization-details-form"
                            variant="contained"
                            disabled={isSubmitting}
                        >
                            {isSaving ? 'Saving…' : 'Save Changes'}
                        </Button>
                    )}
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
