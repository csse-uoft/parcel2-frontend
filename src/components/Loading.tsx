import React from "react";
import { CircularProgress, Typography } from "@mui/material";


export function Loading({message = 'Loading Components...'}) {
    return (
        <div style={{textAlign: 'center'}}>
            <CircularProgress sx={{m: 2, mt: '50px'}}/>
            <Typography variant="subtitle2" color={"textSecondary"}>
                {message}
            </Typography>
        </div>
    );
}
