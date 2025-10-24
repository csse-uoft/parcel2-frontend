'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
    Alert,
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
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

const formatAddress = (org: AdminOrganization) => {
    const addr = org.primaryAddress;
    if (!addr) return '—';
    if (addr.stringRepresentation) return addr.stringRepresentation;
    const parts = [
        [addr.streetNumber, addr.streetName].filter(Boolean).join(' '),
        addr.localityName,
        addr.provinceName,
        addr.postalCode,
        addr.countryName,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
};

export default function ManageOrganizationsPage() {
    const { roles, enqueueMessage, isLoading } = useUserContext();
    const isAdmin = roles.includes('admin');

    const { data: organizations, error: orgError, isLoading: isOrgLoading } = useSWR<AdminOrganization[]>(
        isAdmin ? '/api/admin/organizations' : null,
        endpoint => (endpoint ? fetcher<AdminOrganization[]>(endpoint) : Promise.resolve([])),
        { keepPreviousData: true },
    );

    const { data: users, error: userError, isLoading: isUsersLoading, mutate: mutateUsers } = useSWR<ConsoleUser[]>(
        isAdmin ? '/api/admin/users' : null,
        endpoint => (endpoint ? fetcher<ConsoleUser[]>(endpoint) : Promise.resolve([])),
        { keepPreviousData: true },
    );

    const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null);
    const [selectedUser, setSelectedUser] = useState<ConsoleUser | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [resetResult, setResetResult] = useState<ResetResponse | null>(null);

    const orgUsers = useMemo(() => {
        if (!selectedOrg || !users) return [];
        return users.filter(user => user.organizationIRI === selectedOrg.iri);
    }, [selectedOrg, users]);

    const handleOpenOrg = (org: AdminOrganization) => {
        setSelectedOrg(org);
        setSelectedUser(null);
        setResetResult(null);
    };

    const handleCloseOrg = () => {
        setSelectedOrg(null);
        setSelectedUser(null);
        setResetResult(null);
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
            const result = await postJSON<ResetResponse>(`/api/admin/users/${userId}/reset-password`, { arg: {} });
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

    if (isLoading) {
        return <Loading/>;
    }

    if (!isAdmin) {
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

            {selectedOrg && (
                <Paper sx={{ p: { xs: 2, md: 4 } }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h5">{selectedOrg.name ?? 'Organization Details'}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                IRI: {selectedOrg.iri}
                            </Typography>
                        </Box>
                        <DetailRow label="Description" value={selectedOrg.description ?? selectedOrg.briefDescription ?? '—'} />
                        <DetailRow label="Email" value={selectedOrg.email ?? '—'} />
                        <DetailRow label="Phone" value={selectedOrg.phone ?? '—'} />
                        <DetailRow label="Mission" value={selectedOrg.missionStatement ?? '—'} />
                        <DetailRow label="Values" value={selectedOrg.valuesStatement ?? '—'} />
                        <DetailRow label="Structure" value={selectedOrg.organizationStructure ?? '—'} />
                        <DetailRow label="Primary Contact" value={selectedOrg.primaryContact?.contactName ?? '—'} />
                        <DetailRow label="Contact Email" value={selectedOrg.primaryContact?.email ?? '—'} />
                        <DetailRow label="Contact Phone" value={selectedOrg.primaryContact?.phone ?? '—'} />
                        <DetailRow label="Address" value={formatAddress(selectedOrg)} />

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6">Members</Typography>

                        {orgUsers.length === 0 && (
                            <Alert severity="info">No members found for this organization.</Alert>
                        )}

                        {orgUsers.length > 0 && (
                            <List dense disablePadding>
                                {orgUsers.map(user => (
                                    <ListItem
                                        key={user._id}
                                        secondaryAction={
                                            <Button size="small" onClick={() => handleOpenUser(user)}>
                                                View Details
                                            </Button>
                                        }
                                    >
                                        <ListItemText
                                            primary={user.username ?? user.email}
                                            secondary={user.email}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCloseOrg}>Close</Button>
                        </Box>
                    </Stack>
                </Paper>
            )}

            <UserDetailsDialog
                user={selectedUser}
                open={Boolean(selectedUser)}
                onClose={handleCloseUser}
                isAdmin
                onResetPassword={handleResetPassword}
                isResetting={isResetting}
                resetResult={resetResult}
            />
        </Stack>
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
