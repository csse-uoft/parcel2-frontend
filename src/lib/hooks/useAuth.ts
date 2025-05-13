import useSWRMutation from 'swr/mutation';
import { fetcher, postJSON } from '@/lib/fetcher';
import { useUser } from './useUser';
import { FetcherError } from "@/lib/errors";

type Credentials = { username: string; password: string };
type RegisterPayload = Credentials & { email: string };

export function useLogin() {
    const { mutate: mutateUser } = useUser();

    return useSWRMutation<{ token: string }, FetcherError, string, Credentials>(
        '/api/auth/login',
        postJSON,
        {
            onSuccess: () => mutateUser(),   // refresh /api/auth/me
        },
    );
}

export function useRegister() {
    return useSWRMutation<void, FetcherError, string, RegisterPayload>(
        '/api/auth/register',
        postJSON,
    );
}

export function useLogout() {
    const { mutate: mutateUser } = useUser();

    return useSWRMutation<void>(
        '/api/auth/logout',
        postJSON,
        {
            onSuccess: () => mutateUser(undefined, { revalidate: false }),
        },
    );
}
