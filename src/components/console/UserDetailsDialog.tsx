'use client';

import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { ConsoleUser, ResetResponse } from './types';

interface Props {
    user: ConsoleUser | null;
    open: boolean;
    onClose: () => void;
    isAdmin?: boolean;
    onResetPassword?: (userId: string) => void;
    isResetting?: boolean;
    resetResult?: ResetResponse | null;
}

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString();
    } catch {
        return value;
    }
};

export function UserDetailsDialog({
    user,
    open,
    onClose,
    isAdmin = false,
    onResetPassword,
    isResetting,
    resetResult,
}: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>User Details</DialogTitle>
            <DialogContent dividers>
                {user && (
                    <Stack spacing={1.5}>
                        <DetailRow label="Username" value={user.username ?? '—'} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Roles" value={(user.roles ?? ['user']).join(', ')} />
                        {isAdmin && (
                            <DetailRow label="Organization IRI" value={user.organizationIRI ?? '—'} />
                        )}
                        <DetailRow
                            label="Registration Complete"
                            value={user.isRegistrationComplete ? 'Yes' : 'No'}
                        />
                        <DetailRow label="Last Login" value={formatDateTime(user.lastLogin)} />
                        {resetResult && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Temporary password: <strong>{resetResult.newPassword}</strong>
                            </Alert>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {user && onResetPassword && (
                    <Button
                        variant="contained"
                        onClick={() => onResetPassword(user._id)}
                        disabled={isResetting}
                    >
                        {isResetting ? 'Resetting…' : 'Reset Password'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body1">{value}</Typography>
        </Stack>
    );
}
