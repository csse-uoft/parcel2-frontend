'use client';

import * as React from 'react';
import {
    Container,
    Typography,
    Paper,
    Button,
    Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FormProvider, useForm, type Resolver, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import { useUserContext } from '@/contexts/UserContext';
import { FetcherError } from '@/lib/errors';
import { fetcher } from '@/lib/fetcher';

const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine(values => values.newPassword === values.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords must match',
    });

export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;

const defaultValues: ChangePasswordFormData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

export default function ChangePasswordPage() {
    const { enqueueMessage } = useUserContext();
    const methods = useForm<ChangePasswordFormData>({
        defaultValues,
        resolver: zodResolver(ChangePasswordSchema) as Resolver<ChangePasswordFormData>,
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const { control, handleSubmit, reset } = methods;
    const [saving, setSaving] = React.useState(false);

    const onSubmit = React.useCallback<SubmitHandler<ChangePasswordFormData>>(async values => {
        try {
            setSaving(true);
            await fetcher('/api/profile/password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: values.currentPassword,
                    newPassword: values.newPassword,
                }),
            });

            reset({ ...defaultValues });
            enqueueMessage('Password updated successfully.', 'success');
        } catch (error) {
            if (error instanceof FetcherError) {
                enqueueMessage(error.message ?? 'Unable to update password.', 'error');
            } else {
                enqueueMessage('Unable to update password.', 'error');
            }
        } finally {
            setSaving(false);
        }
    }, [enqueueMessage, reset]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Choose a strong password to help keep your account secure.
                </Typography>
            </Stack>

            <Paper elevation={3} sx={{ p: 3 }}>
                <FormProvider {...methods}>
                    <Stack
                        component="form"
                        spacing={3}
                        id="change-password-form"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <ControlledTextInput<ChangePasswordFormData>
                                    control={control}
                                    name="currentPassword"
                                    label="Current Password"
                                    type="password"
                                    autoComplete="current-password"
                                    disabled={saving}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput<ChangePasswordFormData>
                                    control={control}
                                    name="newPassword"
                                    label="New Password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={saving}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput<ChangePasswordFormData>
                                    control={control}
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    type="password"
                                    autoComplete="new-password"
                                    disabled={saving}
                                />
                            </Grid>
                        </Grid>

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </Stack>
                    </Stack>
                </FormProvider>
            </Paper>
        </Container>
    );
}
