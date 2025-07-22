'use client';
import OpportunityForm from '@/components/forms/OpportunityForm';
import Container from "@mui/material/Container";
import { OpportunityFormData } from "@/components/forms/schema/Opportunity";
import { Typography } from "@mui/material";
import React from "react";

export default function NewOpportunityPage() {
    const handleSave = (data: OpportunityFormData) => {
        // POST to backend
        console.log(data);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Add a new Opportunity
            </Typography>
            <OpportunityForm onSubmit={handleSave} />
        </Container>
    );
}
