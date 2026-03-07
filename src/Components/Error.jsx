import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Box } from "@ellucian/react-design-system/core";

export default function Error({ alertText, variant = "inline" }) {
    const [open, setOpen] = useState(true);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            {open && (
                <Box sx={{ py: 2 }}>
                    <Alert alertType="error" open={open} onClose={handleClose} text={alertText} variant={variant} />
                </Box>
            )}
        </>
    );
}

Error.propTypes = {
    alertText: PropTypes.string.isRequired,
    variant: PropTypes.string.isRequired,
};