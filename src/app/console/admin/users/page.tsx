'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
    Alert,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';

import { useUserContext } from '@/contexts/UserContext';
import { fetcher, postJSON } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import { Loading } from '@/components/Loading';
import { ConsoleUser, ResetResponse } from '@/components/console/types';
import { UserDetailsDialog } from '@/components/console/UserDetailsDialog';

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

export default function ManageUsersPage() {
    const { roles, enqueueMessage, isLoading } = useUserContext();
    const isAdmin = roles.includes('admin');
    const isOrgAdmin = roles.includes('org_admin');

    const listEndpoint = useMemo(() => {
        if (isAdmin) return '/api/admin/users';
        if (isOrgAdmin) return '/api/org-admin/users';
        return null;
    }, [isAdmin, isOrgAdmin]);

    const { data: users, error, isLoading: isUsersLoading, mutate } = useSWR<ConsoleUser[]>(
        listEndpoint,
        endpoint => (endpoint ? fetcher<ConsoleUser[]>(endpoint) : Promise.resolve([])),
        { keepPreviousData: true },
    );

    const [selectedUser, setSelectedUser] = useState<ConsoleUser | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [resetResult, setResetResult] = useState<ResetResponse | null>(null);

    const handleOpen = (user: ConsoleUser) => {
        setSelectedUser(user);
        setResetResult(null);
    };

    const handleClose = () => {
        setSelectedUser(null);
        setResetResult(null);
    };

    const handleResetPassword = async (userId: string) => {
        setIsResetting(true);
        try {
            const base = isAdmin ? '/api/admin/users' : '/api/org-admin/users';
            const result = await postJSON<ResetResponse>(`${base}/${userId}/reset-password`, { arg: {} });
            setResetResult(result);
            enqueueMessage('Password reset successfully', 'success');
            await mutate();
        } catch (err) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to reset password', 'error');
            }
        } finally {
            setIsResetting(false);
        }
    };

    if (isLoading) {
        return <Loading/>;
    }

    if (!isAdmin && !isOrgAdmin) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Manage Users
                </Typography>
                <Alert severity="warning">You do not have permission to access this page.</Alert>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error instanceof FetcherError ? error.message : 'Failed to load users.'}
            </Alert>
        );
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" gutterBottom>
                    Manage Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isAdmin
                        ? 'View and manage all users across Parcel. Reset passwords directly from this screen.'
                        : 'Manage users within your organization. Reset passwords when team members need help signing in.'}
                </Typography>
            </Box>

            {isUsersLoading && <Loading/>}

            {users && users.length === 0 && !isUsersLoading && (
                <Alert severity="info">No users found.</Alert>
            )}

            {users && users.length > 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Roles</TableCell>
                                {isAdmin && <TableCell>Organization IRI</TableCell>}
                                <TableCell>Last Login</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user._id} hover>
                                    <TableCell>{user.username ?? '—'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                            {(user.roles ?? ['user']).map(role => (
                                                <Chip key={`${user._id}-${role}`} label={role} size="small" />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                    {isAdmin && <TableCell>{user.organizationIRI ?? '—'}</TableCell>}
                                    <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View details">
                                            <Button
                                                size="small"
                                                startIcon={<Visibility fontSize="small" />}
                                                onClick={() => handleOpen(user)}
                                            >
                                                View
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <UserDetailsDialog
                user={selectedUser}
                open={Boolean(selectedUser)}
                onClose={handleClose}
                isAdmin={isAdmin}
                onResetPassword={handleResetPassword}
                isResetting={isResetting}
                resetResult={resetResult}
            />
        </Stack>
    );
}
