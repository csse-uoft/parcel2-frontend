'use client';

import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';

import { postJSON } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import { useUserContext } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';

type InviteResponse = {
    message?: string;
    temporaryPassword?: string;
    emailSent?: boolean;
    user?: {
        username?: string;
        email?: string;
        roles?: string[];
    };
};

type InvitePayload = {
    username: string;
    email: string;
    sendEmail: boolean;
    roles?: string[];
};

type InviteFormValues = {
    username: string;
    email: string;
    sendEmail: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVITE_ENDPOINT = '/api/org-admin/users/invite';

export default function InviteUsersPage() {
    const { roles, enqueueMessage, isLoading } = useUserContext();
    const isAdmin = roles.includes('admin');
    const isOrgAdmin = roles.includes('org_admin');

    const adminInviteForm = useForm<InviteFormValues>({
        defaultValues: { username: '', email: '', sendEmail: true },
    });
    const orgInviteForm = useForm<InviteFormValues>({
        defaultValues: { username: '', email: '', sendEmail: true },
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

    const handleInviteError = (error: unknown, fallback: string) => {
        if (error instanceof FetcherError) {
            enqueueMessage(error.message, 'error');
        } else {
            enqueueMessage(fallback, 'error');
        }
    };

    const onAdminSubmit = adminInviteForm.handleSubmit(async values => {
        setAdminResult(null);
        try {
            const result = await adminInviteMutation.trigger({
                username: values.username.trim(),
                email: values.email.trim(),
                sendEmail: values.sendEmail,
                roles: ['org_admin'],
            });
            if (result) {
                setAdminResult(result);
            }
            enqueueMessage('Organization admin invited successfully', 'success');
            adminInviteForm.reset({ username: '', email: '', sendEmail: values.sendEmail });
        } catch (error) {
            handleInviteError(error, 'Unable to invite organization admin');
        }
    });

    const onOrgSubmit = orgInviteForm.handleSubmit(async values => {
        setOrgResult(null);
        try {
            const result = await orgInviteMutation.trigger({
                username: values.username.trim(),
                email: values.email.trim(),
                sendEmail: values.sendEmail,
                roles: ['user'],
            });
            if (result) {
                setOrgResult(result);
            }
            enqueueMessage('Organization user invited successfully', 'success');
            orgInviteForm.reset({ username: '', email: '', sendEmail: values.sendEmail });
        } catch (error) {
            handleInviteError(error, 'Unable to invite organization user');
        }
    });

    const renderInviteResult = (result: InviteResponse | null) => {
        if (!result) return null;
        return (
            <Alert severity="info">
                {result.temporaryPassword ? (
                    <>
                        Temporary password: <strong>{result.temporaryPassword}</strong>.
                    </>
                ) : (
                    <>{result.message ?? 'Invitation created.'}</>
                )}
                {' '}
                {result.emailSent === false && 'Email was not sent automatically.'}
            </Alert>
        );
    };

    if (isLoading) {
        return <Loading/>;
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
            <Typography variant="h4" gutterBottom>
                Invite Users
            </Typography>

            {isAdmin && (
                <Paper component="form" onSubmit={onAdminSubmit} sx={{ p: { xs: 2, md: 4 } }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="h5">Invite Organization Admin</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Admin users can add new organization administrators. The invite assigns the
                                user the <code>org_admin</code> role for your organization.
                            </Typography>
                        </Box>

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
                                disabled={adminInviteMutation.isMutating}
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
                            <Typography variant="h5">Invite Organization User</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Organization admins can invite regular users to join their organization. The invite
                                assigns the <code>user</code> role.
                            </Typography>
                        </Box>

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
                    </Stack>
                </Paper>
            )}
        </Stack>
    );
}
