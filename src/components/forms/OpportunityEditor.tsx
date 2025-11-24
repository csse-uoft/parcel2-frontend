'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import { Typography, Alert } from '@mui/material';
import OpportunityForm from '@/components/forms/OpportunityForm';
import type { OpportunityFormData } from '@/components/forms/schema/Opportunity';
import type { TaxonomyOption } from '@/components/forms/inputs/ControlledTaxonomySelect';
import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import {
    useOrgOptions,
    useOpportunity,
    useCreateOpportunity,
    useUpdateOpportunity
} from '@/lib/hooks/useOpportunities';
import { dtoToForm } from '@/lib/opportunities/mapper';
import { useRouter } from '@/i18n/navigation';
import OpportunityFormSkeleton from "@/components/forms/skeleton/OpportunityFormSkeleton";

type Props = Partial<{ mode: 'create' | 'edit'; iri: string }>;

export default function OpportunityEditor(props: Props) {
    const router = useRouter();

    // taxonomies (your existing hook already uses SWR)
    const { items: roleTypes, isLoading: loadingRoleTypes } = useTaxonomy('bedeo:RoleType');
    const { items: projectStages, isLoading: loadingProjectStage } = useTaxonomy('bedeo:ProjectStage');
    const { items: projectTypes, isLoading: loadingProjectType } = useTaxonomy('bedeo:ProjectType');
    const { items: unitOptions, isLoading: loadingUnit } = useTaxonomy('bedeo:AreaUnit');
    const { items: landUseOptions, isLoading: loadingLandUse } = useTaxonomy('bedeo:LandUse');

    const taxLoading =
        loadingRoleTypes || loadingProjectStage || loadingProjectType || loadingUnit || loadingLandUse;

    // orgs
    const { options: orgOptions } = useOrgOptions();

    // create or edit
    const isEdit = props.mode === 'edit';
    const opportunityIri = props.iri;

    const { data: opDTO, error: loadErr, isLoading: loadingOp, mutate: mutateOp } =
        useOpportunity(isEdit && opportunityIri ? opportunityIri : null);

    const { trigger: createTrigger, isMutating: creating, error: createErr } = useCreateOpportunity();
    const {
        trigger: updateTrigger,
        isMutating: updateIsMutating,
        error: updateErr,
    } = useUpdateOpportunity(isEdit && opportunityIri ? opportunityIri : undefined);

    const updating = isEdit ? updateIsMutating : false;

    const saving = creating || updating;

    const defaults: OpportunityFormData | undefined = React.useMemo(() => {
        if (isEdit) return opDTO ? dtoToForm(opDTO) : undefined;
        return {
            name: '',
            description: '',
            partnershipRoles: [],
            projectType: undefined,
            projectStage: undefined,
            primaryContact: { name: '', email: '', phone: '' } as any,
            partners: [],
            land: {} as any,
            additionalInfo: { images: [], files: [], isPosted: false, isSearchable: true },
        };
    }, [isEdit, opDTO]);

    async function handleSubmit(data: OpportunityFormData) {
        if (isEdit) {
            if (!opportunityIri) {
                throw new Error('Missing opportunity identifier for update.');
            }
            const updated = await updateTrigger(data);
            await mutateOp(updated, { revalidate: false });
            return;
        }
        const created = await createTrigger(data);
        const iri = created?.iri ?? '';
        router.push(iri ? `/console/opportunity/${encodeURIComponent(iri)}` : '/opportunities/me');
    }

    const errorMessage =
        loadErr?.message || createErr?.message || updateErr?.message || undefined;

    if (taxLoading) {
        return <OpportunityFormSkeleton/>;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }} aria-busy={taxLoading || saving || (isEdit && loadingOp)}>
            <Typography variant="h4" gutterBottom>
                {isEdit ? 'Edit Opportunity' : 'Add a new Opportunity'}
            </Typography>

            {taxLoading ? <OpportunityFormSkeleton/> : (
                <>
                    {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

                    {!defaults ? (
                        <Typography variant="body2">Loading…</Typography>
                    ) : (
                        <OpportunityForm
                            defaultValues={defaults}
                            onSubmit={handleSubmit}
                            disabled={saving}
                            roleTypeOptions={roleTypes as TaxonomyOption[]}
                            projectStageOptions={projectStages as TaxonomyOption[]}
                            projectTypeOptions={projectTypes as TaxonomyOption[]}
                            unitOptions={unitOptions as TaxonomyOption[]}
                            landUseOptions={landUseOptions as TaxonomyOption[]}
                            orgOptions={orgOptions}
                        />
                    )}
                </>
            )}


        </Container>
    );
}
