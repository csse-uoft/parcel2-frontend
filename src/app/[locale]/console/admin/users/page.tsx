'use client';

import { useMemo, useState } from 'react';
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
import DeleteOutline from '@mui/icons-material/DeleteOutline';

import { useUserContext } from '@/contexts/UserContext';
import { fetcher, postJSON } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import { Loading } from '@/components/Loading';
import { AdminOrganization, ConsoleUser, ResetResponse } from '@/components/console/types';
import { UserDetailsDialog } from '@/components/console/UserDetailsDialog';
import { OrganizationDetailsDialog } from '@/components/console/OrganizationDetailsDialog';
import { useConsoleUsers } from '@/lib/hooks/useConsoleUsers';
import { useAdminOrganizations } from '@/lib/hooks/useOrganizations';
import { useUser } from '@/lib/hooks/useUser';

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

    const { user: currentUser } = useUser();

    const listEndpoint = useMemo(() => {
        if (isAdmin) return '/api/admin/users';
        if (isOrgAdmin) return '/api/org-admin/users';
        return null;
    }, [isAdmin, isOrgAdmin]);

    const { data: users, error, isLoading: isUsersLoading, mutate } = useConsoleUsers(listEndpoint);

    const {
        data: organizations,
        error: organizationsError,
        isLoading: isOrganizationsLoading,
    } = useAdminOrganizations(isAdmin);

    const [selectedUser, setSelectedUser] = useState<ConsoleUser | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [resetResult, setResetResult] = useState<ResetResponse | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [resettingUserId, setResettingUserId] = useState<string | null>(null);
    const [selectedOrganizationIri, setSelectedOrganizationIri] = useState<string | null>(null);
    const [organizationDialogResetKey, setOrganizationDialogResetKey] = useState(0);

    const selectedOrganization: AdminOrganization | null = useMemo(() => {
        if (!selectedOrganizationIri || !organizations) return null;
        return organizations.find(org => org.iri === selectedOrganizationIri) ?? null;
    }, [organizations, selectedOrganizationIri]);

    const organizationMembers: ConsoleUser[] = useMemo(() => {
        if (!selectedOrganization || !users) return [];
        return users.filter(user => user.organizationIRI === selectedOrganization.iri);
    }, [selectedOrganization, users]);

    const handleOpen = (user: ConsoleUser) => {
        setSelectedUser(user);
        setResetResult(null);
    };

    const handleClose = () => {
        setSelectedUser(null);
        setResetResult(null);
    };

    const handleOpenOrganization = (organizationIri: string) => {
        if (!organizations || organizations.length === 0) {
            enqueueMessage('Organization details are still loading.', 'info');
            return;
        }

        const organization = organizations.find(org => org.iri === organizationIri);
        if (!organization) {
            enqueueMessage('Organization details were not found.', 'warning');
            return;
        }

        setSelectedUser(null);
        setSelectedOrganizationIri(organizationIri);
        setOrganizationDialogResetKey(key => key + 1);
    };

    const handleCloseOrganization = () => {
        setSelectedOrganizationIri(null);
    };

    const handleResetPassword = async (userId: string) => {
        setIsResetting(true);
        setResettingUserId(userId);
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
            setResettingUserId(null);
        }
    };

    const handleDeleteUser = async (user: ConsoleUser) => {
        if (!isAdmin && !isOrgAdmin) {
            return;
        }

        if (currentUser?._id === user._id) {
            enqueueMessage('You cannot delete your own account.', 'warning');
            return;
        }

        const confirmed = window.confirm(`Delete user "${user.email}"? This action cannot be undone.`);
        if (!confirmed) {
            return;
        }

        setDeletingUserId(user._id);

        try {
            const base = isAdmin ? '/api/admin/users' : '/api/org-admin/users';
            await fetcher<{ message: string }>(`${base}/${user._id}`, { method: 'DELETE' });
            enqueueMessage('User deleted successfully.', 'success');
            if (selectedUser?._id === user._id) {
                handleClose();
            }
            await mutate();
        } catch (err) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to delete user.', 'error');
            }
        } finally {
            setDeletingUserId(null);
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

            {isAdmin && organizationsError && (
                <Alert severity="warning">
                    {organizationsError instanceof FetcherError
                        ? organizationsError.message
                        : 'Unable to load organization details. You can still manage users.'}
                </Alert>
            )}

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
                                    {isAdmin && (
                                        <TableCell>
                                            {user.organizationIRI ? (
                                                <Tooltip title="View organization details">
                                                    <span>
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            onClick={() => handleOpenOrganization(user.organizationIRI!)}
                                                            disabled={Boolean(isOrganizationsLoading) || !organizations}
                                                            sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                                                        >
                                                            {user.organizationIRI}
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            ) : '—'}
                                        </TableCell>
                                    )}
                                    <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View details">
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility fontSize="small" />}
                                                    onClick={() => handleOpen(user)}
                                                >
                                                    View
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Delete user">
                                                <span>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        startIcon={<DeleteOutline fontSize="small" />}
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={deletingUserId === user._id || currentUser?._id === user._id}
                                                    >
                                                        {deletingUserId === user._id ? 'Deleting…' : 'Delete'}
                                                    </Button>
                                                </span>
                                            </Tooltip>
                                        </Stack>
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
                resettingUserId={resettingUserId}
                resetResult={resetResult}
            />

            <OrganizationDetailsDialog
                open={Boolean(selectedOrganization)}
                organization={selectedOrganization}
                members={organizationMembers}
                canEdit={false}
                canDelete={false}
                isSaving={false}
                isDeleting={false}
                formResetKey={organizationDialogResetKey}
                onClose={handleCloseOrganization}
                onSave={() => {}}
                onSelectMember={handleOpen}
            />
        </Stack>
    );
}
