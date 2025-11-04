import React from "react";
import {
    Box,
    Grid,
    TextField,
    Typography,
    IconButton,
    Button,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ControlledTextInput } from "@/components/forms/inputs/WrappedInputs";

interface Props {
    /** name of the array field – e.g. `"legalNames"` */
    name: string;
    label?: string;
    disabled?: boolean;
    min?: number; // Minimum number of items allowed
    max?: number; // Maximum number of items allowed
}

export default function ControlledStringArrayField({ name, label = "Items", disabled, min = 0, max}: Props) {
    const { control, register, formState: { errors }, } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name,  // e.g. "legalNames"
        rules: {
            minLength: min,
            maxLength: max,
        },
    });

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
                {label}
            </Typography>

            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {errors[name]?.root?.message as string || errors[name]?.message as string || ""}
            </Typography>

            {fields.map((field, idx) => (
                <Grid
                    container
                    spacing={1}
                    alignItems="center"
                    key={field.id}
                    sx={{ mb: 1 }}
                >
                    <Grid size={{ xs: 11, sm: 10 }}>
                        <ControlledTextInput
                            control={control}
                            name={`${name}.${idx}.value` as string}
                            label={label.slice(0, -1) + ' ' + (idx + 1)}
                            disabled={disabled}
                        />
                    </Grid>

                    <Grid size={{ xs: 1, sm: 2 }}>
                        <IconButton
                            aria-label="Delete"
                            disabled={disabled}
                            onClick={() => remove(idx)}
                        >
                            <Delete fontSize="small"/>
                        </IconButton>
                    </Grid>
                </Grid>
            ))}

            <Button
                variant="outlined"
                size="small"
                startIcon={<Add/>}
                disabled={disabled}
                onClick={() => append({ value: "" })}
            >
                Add {label.slice(0, -1)}
            </Button>
        </Box>
    );
}
