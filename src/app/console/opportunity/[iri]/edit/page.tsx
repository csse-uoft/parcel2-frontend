'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import OpportunityEditor from '@/components/forms/OpportunityEditor';

export default function EditOpportunityPage() {
    const params = useParams<{ iri: string }>();
    const iri = React.useMemo(() => {
        try { return decodeURIComponent(params.iri); } catch { return params.iri; }
    }, [params.iri]);

    return <OpportunityEditor mode="edit" iri={iri} />;
}
