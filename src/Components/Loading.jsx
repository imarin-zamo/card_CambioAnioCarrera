import React from "react";
import { Box, CircularProgress } from "@ellucian/react-design-system/core";

export default function Loading() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", p: "20px" }}>
            <CircularProgress />
        </Box>
    );
}