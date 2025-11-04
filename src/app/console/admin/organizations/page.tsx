'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';

import { useUserContext } from '@/contexts/UserContext';
import { fetcher, postJSON } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import { Loading } from '@/components/Loading';
import { AdminOrganization, ConsoleUser, ResetResponse } from '@/components/console/types';
import { UserDetailsDialog } from '@/components/console/UserDetailsDialog';
import { OrganizationDetailsDialog } from '@/components/console/OrganizationDetailsDialog';
import { CreateOrganizationDialog } from '@/components/console/CreateOrganizationDialog';
import { OrganizationFormData } from '@/components/forms/OrganizationForm';
import { buildOrganizationUpdatePayload } from '@/components/forms/organizationFormAdapter';
import { pruneEmpty } from '@/lib/utils';

export default function ManageOrganizationsPage() {
    const { roles, enqueueMessage, isLoading } = useUserContext();
    const isAdmin = roles.includes('admin');
    const isOrgAdmin = roles.includes('org_admin');

    const {
        data: adminOrganizations,
        error: adminOrgError,
        isLoading: isAdminOrgLoading,
        mutate: mutateAdminOrganizations,
    } = useSWR<AdminOrganization[]>(
        isAdmin ? '/api/admin/organizations' : null,
        endpoint => fetcher<AdminOrganization[]>(endpoint),
        { keepPreviousData: true },
    );

    const {
        data: managedOrganization,
        error: managedOrgError,
        isLoading: isManagedOrgLoading,
        mutate: mutateManagedOrganization,
    } = useSWR<AdminOrganization | null>(
        !isAdmin && isOrgAdmin ? '/api/org-admin/organization' : null,
        endpoint => fetcher<AdminOrganization>(endpoint),
        { keepPreviousData: true },
    );

    const {
        data: users,
        error: userError,
        isLoading: isUsersLoading,
        mutate: mutateUsers,
    } = useSWR<ConsoleUser[]>(
        isAdmin ? '/api/admin/users' : isOrgAdmin ? '/api/org-admin/users' : null,
        endpoint => fetcher<ConsoleUser[]>(endpoint),
        { keepPreviousData: true },
    );

    const organizations = useMemo(() => {
        if (isAdmin) return adminOrganizations ?? [];
        if (isOrgAdmin) return managedOrganization ? [managedOrganization] : [];
        return [];
    }, [isAdmin, isOrgAdmin, adminOrganizations, managedOrganization]);

    const orgError = adminOrgError ?? managedOrgError;
    const isOrgLoading = isAdmin ? isAdminOrgLoading : isManagedOrgLoading;

    const refreshOrganizations = async () => {
        if (isAdmin && mutateAdminOrganizations) {
            await mutateAdminOrganizations();
        } else if (isOrgAdmin && mutateManagedOrganization) {
            await mutateManagedOrganization();
        }
    };

    const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null);
    const [selectedUser, setSelectedUser] = useState<ConsoleUser | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [resetResult, setResetResult] = useState<ResetResponse | null>(null);
    const [isSavingOrg, setIsSavingOrg] = useState(false);
    const [isDeletingOrg, setIsDeletingOrg] = useState(false);
    const [formResetKey, setFormResetKey] = useState(0);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createDialogResetKey, setCreateDialogResetKey] = useState(0);
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);

    const orgUsers = useMemo(() => {
        if (!selectedOrg || !users) return [];
        return users.filter(user => user.organizationIRI === selectedOrg.iri);
    }, [selectedOrg, users]);

    const handleOpenOrg = (org: AdminOrganization) => {
        setSelectedOrg(org);
        setSelectedUser(null);
        setResetResult(null);
        setFormResetKey(key => key + 1);
    };

    const handleCloseOrg = () => {
        setSelectedOrg(null);
        setSelectedUser(null);
        setResetResult(null);
        setIsSavingOrg(false);
        setIsDeletingOrg(false);
    };

    const handleOpenUser = (user: ConsoleUser) => {
        setSelectedUser(user);
        setResetResult(null);
    };

    const handleCloseUser = () => {
        setSelectedUser(null);
        setResetResult(null);
    };

    const handleResetPassword = async (userId: string) => {
        setIsResetting(true);
        try {
            const endpoint = isAdmin
                ? `/api/admin/users/${userId}/reset-password`
                : `/api/org-admin/users/${userId}/reset-password`;
            const result = await postJSON<ResetResponse>(endpoint, { arg: {} });
            setResetResult(result);
            enqueueMessage('Password reset successfully', 'success');
            await mutateUsers();
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

    const handleSaveOrganization = async (values: OrganizationFormData) => {
        if (!selectedOrg) return;

        setIsSavingOrg(true);

        try {
            const endpoint = isAdmin
                ? `/api/admin/organizations/${encodeURIComponent(selectedOrg.iri)}`
                : `/api/org-admin/organization`;

            const updated = await fetcher<AdminOrganization>(endpoint, {
                method: 'PATCH',
                body: JSON.stringify({ organization: pruneEmpty(buildOrganizationUpdatePayload(values)) }),
            });

            setSelectedOrg(updated);
            setFormResetKey(key => key + 1);
            enqueueMessage('Organization updated successfully', 'success');
            await refreshOrganizations();
        } catch (err) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to update organization', 'error');
            }
        } finally {
            setIsSavingOrg(false);
        }
    };

    const handleDeleteOrganization = async () => {
        if (!selectedOrg || !isAdmin) return;
        if (!window.confirm('Delete this organization? This cannot be undone.')) {
            return;
        }

        setIsDeletingOrg(true);
        try {
            await fetcher<{ message: string }>(
                `/api/admin/organizations/${encodeURIComponent(selectedOrg.iri)}`,
                { method: 'DELETE' },
            );

            enqueueMessage('Organization deleted', 'success');
            handleCloseOrg();
            await refreshOrganizations();
            await mutateUsers();
        } catch (err) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to delete organization', 'error');
            }
        } finally {
            setIsDeletingOrg(false);
        }
    };

    const handleOpenCreateOrganization = () => {
        setCreateDialogResetKey(key => key + 1);
        setIsCreateDialogOpen(true);
    };

    const handleCloseCreateOrganization = () => {
        setIsCreateDialogOpen(false);
    };

    const handleCreateOrganization = async (values: OrganizationFormData) => {
        setIsCreatingOrg(true);
        try {
            const payload = buildOrganizationUpdatePayload(values);
            const created = await fetcher<AdminOrganization>(
                '/api/organizations',
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            enqueueMessage('Organization created successfully', 'success');
            setIsCreateDialogOpen(false);
            setSelectedOrg(created);
            setFormResetKey(key => key + 1);
            await refreshOrganizations();
            await mutateUsers();
        } catch (err) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to create organization', 'error');
            }
        } finally {
            setIsCreatingOrg(false);
        }
    };

    if (isLoading) {
        return <Loading/>;
    }

    if (!isAdmin && !isOrgAdmin) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Organizations
                </Typography>
                <Alert severity="warning">You do not have permission to access this page.</Alert>
            </Box>
        );
    }

    if (orgError || userError) {
        const err = orgError ?? userError;
        return (
            <Alert severity="error">
                {err instanceof FetcherError ? err.message : 'Failed to load data.'}
            </Alert>
        );
    }

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" gutterBottom>
                    Organizations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review organization profiles and manage their members.
                </Typography>
            </Box>

            {isAdmin && (
                <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={handleOpenCreateOrganization}>
                        Create Organization
                    </Button>
                </Stack>
            )}

            {(isOrgLoading || isUsersLoading) && <Loading/>}

            {organizations && organizations.length === 0 && !isOrgLoading && (
                <Alert severity="info">No organizations found.</Alert>
            )}

            {organizations && organizations.length > 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell align="center">Members</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {organizations.map(org => {
                                const memberCount = users?.filter(user => user.organizationIRI === org.iri).length ?? 0;
                                return (
                                    <TableRow key={org.iri} hover>
                                        <TableCell>{org.name ?? '—'}</TableCell>
                                        <TableCell>{org.briefDescription ?? org.description ?? '—'}</TableCell>
                                        <TableCell>{org.email ?? '—'}</TableCell>
                                        <TableCell>{org.phone ?? '—'}</TableCell>
                                        <TableCell align="center">{memberCount}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                startIcon={<Visibility fontSize="small" />}
                                                onClick={() => handleOpenOrg(org)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <OrganizationDetailsDialog
                open={Boolean(selectedOrg)}
                organization={selectedOrg}
                members={orgUsers}
                canEdit={isAdmin || isOrgAdmin}
                canDelete={isAdmin && orgUsers.length === 0}
                isSaving={isSavingOrg}
                isDeleting={isDeletingOrg}
                formResetKey={formResetKey}
                onClose={handleCloseOrg}
                onSave={handleSaveOrganization}
                onDelete={isAdmin ? handleDeleteOrganization : undefined}
                onSelectMember={handleOpenUser}
            />

            <UserDetailsDialog
                user={selectedUser}
                open={Boolean(selectedUser)}
                onClose={handleCloseUser}
                isAdmin
                onResetPassword={handleResetPassword}
                isResetting={isResetting}
                resetResult={resetResult}
            />

            <CreateOrganizationDialog
                open={isCreateDialogOpen}
                onClose={handleCloseCreateOrganization}
                onSubmit={handleCreateOrganization}
                isSubmitting={isCreatingOrg}
                resetKey={createDialogResetKey}
            />
        </Stack>
    );
}
