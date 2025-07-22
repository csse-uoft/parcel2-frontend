import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import * as React from "react";

export function ControlledTextInput<T>({ control, name, label, required = false, disabled, ...params }: {
    control: any;
    name: keyof T;
    label: string;
    required?: boolean;
} & React.ComponentProps<typeof TextField>) {
    return (
        <Controller
            name={name as string}
            control={control}
            render={({ field, fieldState }) => (
                <TextField
                    required={required}
                    {...field}
                    label={label}
                    // size="small"
                    fullWidth
                    error={!disabled && !!fieldState.error}
                    helperText={!disabled && fieldState.error ? fieldState.error.message : ''}
                    disabled={disabled}
                    {...params}
                />
            )}
        />
    );
}