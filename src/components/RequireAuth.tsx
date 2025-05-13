'use client';

import React from "react";
import { useUserContext } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const {username, isLoading} = useUserContext();
    if (isLoading) {
        return <Loading/>;
    }
    if (username !== 'guest') {
        return <>{children}</>;
    } else {
        return <div>Please log in to access this page.</div>;
    }
}