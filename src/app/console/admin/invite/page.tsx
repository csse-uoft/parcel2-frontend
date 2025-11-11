'use client';

import { useMemo, useState } from 'react';
import useSWRMutation from 'swr/mutation';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { CreateOrganizationDialog } from '@/components/console/CreateOrganizationDialog';
import { OrganizationDetailsDialog } from '@/components/console/OrganizationDetailsDialog';
import type { AdminOrganization, ConsoleUser } from '@/components/console/types';
import { Loading } from '@/components/Loading';
import { useUserContext } from '@/contexts/UserContext';
import { FetcherError } from '@/lib/errors';
import { fetcher, postJSON } from '@/lib/fetcher';
import { OrganizationFormData } from '@/components/forms/OrganizationForm';
import { buildOrganizationUpdatePayload } from '@/components/forms/organizationFormAdapter';
import { useAdminOrganizations, useManagedOrganization } from '@/lib/hooks/useOrganizations';
import { useScopedConsoleUsers } from '@/lib/hooks/useConsoleUsers';

interface InviteResponse {
    message?: string;
    temporaryPassword?: string;
    emailSent?: boolean;
    user?: {
        username?: string;
        email?: string;
        roles?: string[];
    };
}

interface InvitePayload {
    username: string;
    email: string;
    sendEmail: boolean;
    roles?: string[];
    organizationIri?: string;
}

interface BaseInviteFormValues {
    username: string;
    email: string;
    sendEmail: boolean;
}

interface AdminInviteFormValues extends BaseInviteFormValues {
    role: 'org_admin' | 'user';
    organizationIri: string;
}

type OrgInviteFormValues = BaseInviteFormValues;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_ENDPOINT = '/api/org-admin/users/invite';

export default function InviteUsersPage() {
    const { roles, enqueueMessage, isLoading } = useUserContext();
    const isAdmin = roles.includes('admin');
    const isOrgAdmin = roles.includes('org_admin');

    const {
        data: organizations,
        error: organizationsError,
        isLoading: isOrganizationsLoading,
        mutate: mutateOrganizations,
    } = useAdminOrganizations(isAdmin);

    const {
        data: users,
        error: usersError,
        isLoading: isUsersLoading,
        mutate: mutateUsers,
    } = useScopedConsoleUsers(isAdmin ? 'admin' : null);

    const {
        data: managedOrganization,
        error: managedOrgError,
        isLoading: isManagedOrgLoading,
    } = useManagedOrganization(!isAdmin && isOrgAdmin);

    const adminInviteForm = useForm<AdminInviteFormValues>({
        defaultValues: {
            username: '',
            email: '',
            sendEmail: true,
            role: 'org_admin',
            organizationIri: '',
        },
    });

    const orgInviteForm = useForm<OrgInviteFormValues>({
        defaultValues: {
            username: '',
            email: '',
            sendEmail: true,
        },
    });

    const adminInviteMutation = useSWRMutation<InviteResponse, FetcherError, string, InvitePayload>(
        INVITE_ENDPOINT,
        postJSON,
    );
    const orgInviteMutation = useSWRMutation<InviteResponse, FetcherError, string, InvitePayload>(
        INVITE_ENDPOINT,
        postJSON,
    );

    const [adminResult, setAdminResult] = useState<InviteResponse | null>(null);
    const [orgResult, setOrgResult] = useState<InviteResponse | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createDialogResetKey, setCreateDialogResetKey] = useState(0);
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewOrganization, setPreviewOrganization] = useState<AdminOrganization | null>(null);

    const availableOrganizations: AdminOrganization[] = useMemo(
        () => organizations ?? [],
        [organizations]
    );
    const hasOrganizations = availableOrganizations.length > 0;

    const organizationStats = useMemo(() => {
        const map = new Map<string, { userCount: number; adminCount: number; members: ConsoleUser[] }>();
        if (!users) {
            return map;
        }

        for (const org of availableOrganizations) {
            const members = users.filter((user: ConsoleUser) => user.organizationIRI === org.iri);
            const adminCount = members.filter((user: ConsoleUser) => (user.roles ?? []).includes('org_admin')).length;
            map.set(org.iri, {
                userCount: members.length,
                adminCount,
                members,
            });
        }

        return map;
    }, [availableOrganizations, users]);

    const selectedOrgIri = adminInviteForm.watch('organizationIri');
    const selectedOrganization = useMemo(
        () => availableOrganizations.find((org: AdminOrganization) => org.iri === selectedOrgIri) ?? null,
        [availableOrganizations, selectedOrgIri]
    );
    const selectedOrganizationMembers = selectedOrganization
        ? organizationStats.get(selectedOrganization.iri)?.members ?? []
        : [];

    const handleInviteError = (error: unknown, fallback: string) => {
        if (error instanceof FetcherError) {
            enqueueMessage(error.message, 'error');
        } else {
            enqueueMessage(fallback, 'error');
        }
    };

    const handleOpenCreateOrganization = () => {
        setCreateDialogResetKey(key => key + 1);
        setIsCreateDialogOpen(true);
    };

    const handleCloseCreateOrganization = () => {
        setIsCreateDialogOpen(false);
    };

    const handleOpenPreview = () => {
        if (!selectedOrganization) {
            return;
        }
        setPreviewOrganization(selectedOrganization);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setPreviewOrganization(null);
    };

    const handleCreateOrganization = async (values: OrganizationFormData) => {
        setIsCreatingOrg(true);
        try {
            const payload = buildOrganizationUpdatePayload(values);
            const created = await fetcher<AdminOrganization>('/api/organizations', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            enqueueMessage('Organization created successfully', 'success');
            setIsCreateDialogOpen(false);
            adminInviteForm.setValue('organizationIri', created.iri, { shouldValidate: true });
            adminInviteForm.clearErrors('organizationIri');
            await mutateOrganizations();
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

    const onAdminSubmit = adminInviteForm.handleSubmit(async values => {
        setAdminResult(null);
        if (!values.organizationIri) {
            adminInviteForm.setError('organizationIri', { type: 'manual', message: 'Organization is required' });
            return;
        }

        try {
            const rolesToAssign = values.role === 'org_admin' ? ['org_admin', 'user'] : ['user'];
            const result = await adminInviteMutation.trigger({
                username: values.username.trim(),
                email: values.email.trim(),
                sendEmail: values.sendEmail,
                roles: rolesToAssign,
                organizationIri: values.organizationIri,
            });

            if (result) {
                setAdminResult(result);
            }
        } catch (error) {
            handleInviteError(error, 'Unable to send invitation');
        }
    });

    const onOrgSubmit = orgInviteForm.handleSubmit(async values => {
        setOrgResult(null);
        if (!managedOrganization?.iri) {
            enqueueMessage('Organization information is unavailable', 'error');
            return;
        }

        try {
            const result = await orgInviteMutation.trigger({
                username: values.username.trim(),
                email: values.email.trim(),
                sendEmail: values.sendEmail,
                roles: ['user'],
                organizationIri: managedOrganization.iri,
            });

            if (result) {
                setOrgResult(result);
            }

            enqueueMessage('Invitation sent successfully', 'success');
            orgInviteForm.reset({ username: '', email: '', sendEmail: values.sendEmail });
        } catch (error) {
            handleInviteError(error, 'Unable to send invitation');
        }
    });

    const renderInviteResult = (result: InviteResponse | null) => {
        if (!result) return null;
        return (
            <Alert severity="info">
                {result.temporaryPassword ? (
                    <>
                        Temporary password: <strong>{result.temporaryPassword}</strong>
                    </>
                ) : (
                    <>{result.message ?? 'Invitation created.'}</>
                )}{' '}
                {result.emailSent === false && 'Email was not sent automatically.'}
            </Alert>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!isAdmin && !isOrgAdmin) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Invite Users
                </Typography>
                <Alert severity="warning">You do not have permission to access this page.</Alert>
            </Box>
        );
    }

    return (
        <Stack spacing={3}>
            {isAdmin && (
                <Paper component="form" onSubmit={onAdminSubmit} sx={{ p: { xs: 2, md: 4 } }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h5">Invite Organization Members</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose the organization and role for the invite. Organization admins also receive the
                                regular <code>user</code> role.
                            </Typography>
                        </Box>

                        {organizationsError && (
                            <Alert severity="error">
                                {organizationsError instanceof FetcherError
                                    ? organizationsError.message
                                    : 'Failed to load organizations.'}
                            </Alert>
                        )}

                        {usersError && (
                            <Alert severity="error">
                                {usersError instanceof FetcherError
                                    ? usersError.message
                                    : 'Failed to load organization members.'}
                            </Alert>
                        )}

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            alignItems={{ sm: 'center' }}
                        >
                            <Controller
                                control={adminInviteForm.control}
                                name="organizationIri"
                                rules={{ required: 'Organization is required' }}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        select
                                        fullWidth
                                        label="Organization"
                                        disabled={isOrganizationsLoading || !hasOrganizations}
                                        error={Boolean(fieldState.error)}
                                        helperText={fieldState.error?.message ?? ' '}
                                    >
                                        {hasOrganizations ? (
                                            availableOrganizations.map(org => {
                                                const stats = organizationStats.get(org.iri);
                                                const userCount = stats?.userCount ?? 0;
                                                const adminCount = stats?.adminCount ?? 0;
                                                const userLabel = `${userCount} user${userCount === 1 ? '' : 's'}`;
                                                const adminLabel = `${adminCount} org admin${adminCount === 1 ? '' : 's'}`;

                                                return (
                                                    <MenuItem key={org.iri} value={org.iri}>
                                                        <Stack spacing={0.25}>
                                                            <Typography>{org.name ?? org.iri}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {userCount === 0 && adminCount === 0
                                                                    ? 'No members yet'
                                                                    : `${userLabel} • ${adminLabel}`}
                                                            </Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                );
                                            })
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No organizations available
                                            </MenuItem>
                                        )}
                                    </TextField>
                                )}
                            />

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleOpenCreateOrganization}
                                    disabled={isCreatingOrg}
                                    fullWidth
                                >
                                    Create Organization
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleOpenPreview}
                                    disabled={!selectedOrganization || isUsersLoading}
                                    fullWidth
                                >
                                    View Details
                                </Button>
                            </Stack>
                        </Stack>

                        {!isOrganizationsLoading && !hasOrganizations && (
                            <Alert severity="info">
                                Create an organization before sending invitations.
                            </Alert>
                        )}

                        <Controller
                            control={adminInviteForm.control}
                            name="role"
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Role"
                                    helperText="Organization admins receive both admin and user access."
                                >
                                    <MenuItem value="org_admin">Organization Admin</MenuItem>
                                    <MenuItem value="user">Organization User</MenuItem>
                                </TextField>
                            )}
                        />

                        <TextField
                            label="Email"
                            type="email"
                            autoComplete="off"
                            {...adminInviteForm.register('email', {
                                required: 'Email is required',
                                pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
                            })}
                            error={Boolean(adminInviteForm.formState.errors.email)}
                            helperText={adminInviteForm.formState.errors.email?.message ?? ' '}
                        />

                        <TextField
                            label="Username"
                            autoComplete="off"
                            {...adminInviteForm.register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                            })}
                            error={Boolean(adminInviteForm.formState.errors.username)}
                            helperText={adminInviteForm.formState.errors.username?.message ?? ' '}
                        />

                        <Controller
                            control={adminInviteForm.control}
                            name="sendEmail"
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Checkbox {...field} checked={field.value} />}
                                    label="Send invitation email with the temporary password"
                                />
                            )}
                        />

                        {renderInviteResult(adminResult)}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={adminInviteMutation.isMutating || !hasOrganizations}
                            >
                                {adminInviteMutation.isMutating ? 'Sending…' : 'Send Invite'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            )}

            {isAdmin && isOrgAdmin && <Divider />}

            {isOrgAdmin && (
                <Paper component="form" onSubmit={onOrgSubmit} sx={{ p: { xs: 2, md: 4 } }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h5">Invite Users To Your Organization</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Invites automatically link to your organization and assign the <code>user</code> role.
                            </Typography>
                        </Box>

                        {managedOrgError && (
                            <Alert severity="error">
                                {managedOrgError instanceof FetcherError
                                    ? managedOrgError.message
                                    : 'Failed to load organization information.'}
                            </Alert>
                        )}

                        {isManagedOrgLoading ? (
                            <Typography variant="body2" color="text.secondary">
                                Loading organization information…
                            </Typography>
                        ) : managedOrganization ? (
                            <>
                                <Alert severity="info">
                                    Invites will be associated with{' '}
                                    <strong>{managedOrganization.name ?? managedOrganization.iri}</strong>.
                                </Alert>

                                <TextField
                                    label="Email"
                                    type="email"
                                    autoComplete="off"
                                    {...orgInviteForm.register('email', {
                                        required: 'Email is required',
                                        pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
                                    })}
                                    error={Boolean(orgInviteForm.formState.errors.email)}
                                    helperText={orgInviteForm.formState.errors.email?.message ?? ' '}
                                />

                                <TextField
                                    label="Username"
                                    autoComplete="off"
                                    {...orgInviteForm.register('username', {
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                                    })}
                                    error={Boolean(orgInviteForm.formState.errors.username)}
                                    helperText={orgInviteForm.formState.errors.username?.message ?? ' '}
                                />

                                <Controller
                                    control={orgInviteForm.control}
                                    name="sendEmail"
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={<Checkbox {...field} checked={field.value} />}
                                            label="Send invitation email with the temporary password"
                                        />
                                    )}
                                />

                                {renderInviteResult(orgResult)}

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={orgInviteMutation.isMutating}
                                    >
                                        {orgInviteMutation.isMutating ? 'Sending…' : 'Send Invite'}
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Alert severity="warning">
                                Organization information is unavailable. Contact an administrator to link your account.
                            </Alert>
                        )}
                    </Stack>
                </Paper>
            )}

            {isAdmin && (
                <CreateOrganizationDialog
                    open={isCreateDialogOpen}
                    onClose={handleCloseCreateOrganization}
                    onSubmit={handleCreateOrganization}
                    isSubmitting={isCreatingOrg}
                    resetKey={createDialogResetKey}
                />
            )}

            {isAdmin && (
                <OrganizationDetailsDialog
                    open={isPreviewOpen && Boolean(previewOrganization)}
                    organization={previewOrganization}
                    members={selectedOrganizationMembers}
                    canEdit={false}
                    canDelete={false}
                    isSaving={false}
                    isDeleting={false}
                    onClose={handleClosePreview}
                    onSave={() => {}}
                />
            )}
        </Stack>
    );
}
