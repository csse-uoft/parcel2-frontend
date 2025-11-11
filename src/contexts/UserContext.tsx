'use client';
import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    ReactNode,
    useRef,
    useCallback,
} from 'react';
import { useSnackbar } from 'notistack';
import { useUser } from "@/lib/hooks/useUser";
import { useLogout } from "@/lib/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

/* ---------- Types ----------------------------------------------------- */

export interface EnqueueOptions {
    buttonText?: string;
    buttonOnClick?: () => void;
    persist?: boolean;                // keep after page reload
}

export interface UserContextValue {
    isRegistrationComplete: boolean;
    username?: string;
    firstName: string;
    lastName: string;
    roles: string[];
    version: string;
    newMessages: number;
    exp: number;
    isLoading: boolean;

    /* mutators – implemented by the reducer */
    updateUser: (data: Partial<Pick<UserContextValue,
        'username' | 'firstName' | 'lastName' | 'roles'>>) => void;
    updateVersion: (v: string) => void;
    enqueueMessage: (
        message: string,
        type?: 'success' | 'info' | 'warning' | 'error',
        options?: EnqueueOptions,
    ) => void;
    logout: () => Promise<void>;
}

/* ---------- Initial (default) state ---------------------------------- */

const defaultState: UserContextValue = {
    isRegistrationComplete: false,
    username: 'guest',
    firstName: '',
    lastName: '',
    roles: [],
    version: '',
    newMessages: 0,
    exp: 0,
    isLoading: true,

    /* placeholders – will be replaced inside <UserProvider> */
    updateUser: () => undefined,
    updateVersion: () => undefined,
    enqueueMessage: () => undefined,
    logout: async () => undefined
};

/* ---------- Action & reducer ----------------------------------------- */

type Action =
    | { type: 'SET_FROM_STORAGE'; payload: Partial<UserContextValue> }
    | { type: 'UPDATE_USER'; payload: Partial<UserContextValue> }
    | { type: 'UPDATE_VERSION'; payload: string }
    | { type: 'INCREMENT_MESSAGES' }

const reducer = (state: UserContextValue, action: Action): UserContextValue => {
    switch (action.type) {
        case 'SET_FROM_STORAGE':
            return { ...state, ...action.payload };

        case 'UPDATE_USER':
            const newState = { ...state, ...action.payload };
            if (action.payload.username == null) {
                // e.g. oauth users who don't have a username
                newState.username = undefined;
            }
            return newState;

        case 'UPDATE_VERSION':
            return { ...state, version: action.payload };

        case 'INCREMENT_MESSAGES':
            return { ...state, newMessages: state.newMessages + 1 };

        default:
            return state;
    }
};

/* ---------- Helpers --------------------------------------------------- */

const STORAGE_KEY = 'userContext';

const loadFromStorage = (): Partial<UserContextValue> => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        console.log(`Loading user context from localStorage: ${json}`);
        if (!json) return {};
        return JSON.parse(json) as Partial<UserContextValue>;
    } catch {
        return {};
    }
};

const saveToStorage = (state: UserContextValue) => {
    const { enqueueMessage, updateUser, updateVersion, ...plain } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
};


let externalLogout: (() => void) = () => null;
export const logoutSilently = () => externalLogout?.();   // used by fetcher

/* ---------- Context & Provider --------------------------------------- */

const UserContext = createContext<UserContextValue>(defaultState);

export const useUserContext = (): UserContextValue => useContext(UserContext);

interface ProviderProps {
    children: ReactNode;
}


export const UserProvider = ({ children }: ProviderProps) => {
    const { user, isLoading } = useUser();
    const { trigger: userLogout } = useLogout();
    const router = useRouter();
    const pathname = usePathname();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [state, dispatch] = useReducer(reducer, defaultState);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const logout = useCallback(async () => {
        await userLogout();
        router.push('/login');
    }, [router, userLogout]);

    /** schedules auto-logout X seconds before exp */
    const scheduleExpiry = useCallback((exp?: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!exp) return;

        const ms = exp * 1000 - 60_000; // 1 min early
        if (ms > 0) {
            timerRef.current = setTimeout(() => {
                void logout();
            }, ms);
        }
    }, [logout]);

    useEffect(() => {
        externalLogout = logout;
        return () => {
            if (externalLogout === logout) {
                externalLogout = () => null;
            }
        };
    }, [logout]);

    useEffect(() => {
        console.log(`UserContext: user changed to ${user?.email} (exp: ${user?.exp})`);
        if (user && !isLoading && user.username !== 'guest') {
            dispatch({ type: 'UPDATE_USER', payload: user });
            scheduleExpiry(user.exp);
        } else {
            dispatch({ type: 'UPDATE_USER', payload: defaultState });
            if (timerRef.current) clearTimeout(timerRef.current);
        }

    }, [user, isLoading, scheduleExpiry]);

    // if the user is not registered, redirect to the registration page
    useEffect(() => {
        if (!user || isLoading) {
            return;
        }

        if (user.username !== 'guest' && !user.isRegistrationComplete && pathname !== '/register/setup') {
            router.push('/register/setup');
        }
    }, [user, isLoading, pathname, router]);

    /* wrap enqueueSnackbar so the rest of the app never sees notistack */
    const enqueueMessage = useCallback<UserContextValue['enqueueMessage']>(
        (message, type = 'info', options = {}) => {
            dispatch({ type: 'INCREMENT_MESSAGES' });

            const key = enqueueSnackbar(message, {
                variant: type,
                action: options.buttonText
                    ? () => (
                        <button
                            onClick={() => {
                                options.buttonOnClick?.();
                                closeSnackbar(key);
                            }}
                            style={{ color: 'inherit', background: 'none', border: 'none' }}
                        >
                            {options.buttonText}
                        </button>
                    )
                    : undefined,
            });

            /* persist message text if requested */
            if (options.persist) {
                const pending = JSON.parse(localStorage.getItem('pendingSnackbars') ?? '[]') as string[];
                pending.push(message);
                localStorage.setItem('pendingSnackbars', JSON.stringify(pending));
            }
        },
        [closeSnackbar, enqueueSnackbar]
    );

    /* ---- fill reducer helpers with dispatch wrappers ---- */
    const contextValue: UserContextValue = {
        ...state,
        isLoading,
        updateUser: data => dispatch({ type: 'UPDATE_USER', payload: data }),
        updateVersion: v => dispatch({ type: 'UPDATE_VERSION', payload: v }),
        enqueueMessage,
        logout,
    };

    /* ---- initial load from localStorage ---- */
    useEffect(() => {
        dispatch({ type: 'SET_FROM_STORAGE', payload: loadFromStorage() });

        const pending: string[] = JSON.parse(localStorage.getItem('pendingSnackbars') ?? '[]');
        pending.forEach(txt => enqueueMessage(txt, 'info'));
        localStorage.removeItem('pendingSnackbars');
    }, [enqueueMessage]);

    /* ---- persist every change ---- */
    useEffect(() => {
        saveToStorage(state);
    }, [state]);

    useEffect(() => () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
