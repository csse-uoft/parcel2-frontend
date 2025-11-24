import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useForgotPassword } from '@/lib/hooks/useAuth';
import { FetcherError } from '@/lib/errors';

interface ForgotPasswordProps {
    open: boolean;
    handleClose: () => void;
}

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
    const { trigger: requestReset, isMutating } = useForgotPassword();
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const resetState = React.useCallback(() => {
        setEmail('');
        setError(null);
        setSuccessMessage(null);
    }, []);

    React.useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open, resetState]);

    const handleDialogClose = () => {
        if (isMutating) {
            return;
        }
        resetState();
        handleClose();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (successMessage) {
            handleDialogClose();
            return;
        }
        const formData = new FormData(event.currentTarget);
        const emailValue = (formData.get('email') as string | null)?.trim() ?? '';

        if (!emailValue) {
            setError('Email is required');
            setSuccessMessage(null);
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailValue)) {
            setError('Enter a valid email address');
            setSuccessMessage(null);
            return;
        }

        setError(null);
        setSuccessMessage(null);
        setEmail(emailValue);

        try {
            await requestReset({ email: emailValue });
            setSuccessMessage('If that email is registered with Parcel, we have sent password reset instructions.');
        } catch (err) {
            const message = err instanceof FetcherError ? err.message : 'Unable to send reset email. Please try again later.';
            setError(message);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit,
                    sx: { backgroundImage: 'none' },
                },
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ width: '100%' }}>
                    <DialogContentText>
                        Enter your account&apos;s email address and we&apos;ll send you a link to reset your password.
                    </DialogContentText>
                    {successMessage && (
                        <Alert severity="success">
                            {successMessage}
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="forgot-password-email"
                        name="email"
                        label="Email address"
                        placeholder="email@example.com"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={event => {
                            setEmail(event.target.value);
                            if (error) {
                                setError(null);
                            }
                            if (successMessage) {
                                setSuccessMessage(null);
                            }
                        }}
                        disabled={isMutating}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleDialogClose} disabled={isMutating}>Cancel</Button>
                <Button variant="contained" type="submit" disabled={isMutating}>
                    {successMessage ? 'Close' : isMutating ? 'Sending…' : 'Send reset link'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}