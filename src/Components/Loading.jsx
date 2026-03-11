import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, CircularProgress } from "@ellucian/react-design-system/core";
import loadingPng from "../assets/icons/ZAMO-LOGO-Z-RECORTE.png";

export default function Loading({ text = "Cargando..." }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: "20px", gap: "16px", }}>
            <Box sx={{ position: "relative", width: "80px", height: "80px", }}>
                <CircularProgress size={80} thickness={3} sx={{ position: "absolute", top: 0, left: 0, }} />

                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", width: "40px",
                    height: "40px", animation: "rotateBounce 1.5s ease-in-out infinite", zIndex: 1,
                }}>
                    <img src={loadingPng} alt="Cargando..." style={{ width: "100%", height: "100%", display: "block" }} />
                </Box>
            </Box>

            {text && <Typography variant="h3">{text}</Typography>}

            <style>
                {`
            @keyframes rotateBounce {
              0% { transform: translate(-50%, -50%) rotate(0deg) translateY(0); }
              25% { transform: translate(-50%, -50%) rotate(10deg) translateY(-5px); }
              50% { transform: translate(-50%, -50%) rotate(0deg) translateY(0); }
              75% { transform: translate(-50%, -50%) rotate(-10deg) translateY(-5px); }
              100% { transform: translate(-50%, -50%) rotate(0deg) translateY(0); }
            }
          `}
            </style>
        </Box>
    );
}

Loading.propTypes = {
    text: PropTypes.string
};