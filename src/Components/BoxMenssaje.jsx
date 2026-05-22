import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@ellucian/react-design-system/core';
import {
    borderWidthThickest,
} from '@ellucian/react-design-system/core/styles/tokens';

export default function BoxMenssaje({ title, description, color = 'primary.main' }) {
    const lines = description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return (
        <Box
            sx={{
                bgcolor: 'grey.100',
                borderLeftColor: color,
                borderLeftWidth: borderWidthThickest,
                borderLeftStyle: 'solid',
                p: 4,
                mb: 4,
                borderRadius: '0 8px 8px 0',
            }}
        >
            <Typography sx={{ mb: 2, display: 'block', fontWeight: 'bold' }} color="textSecondary" variant="caption">
                {title}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lines.map((line, idx) => (
                    <Typography 
                        key={idx} 
                        color="textPrimary" 
                        dangerouslySetInnerHTML={{ __html: line }} 
                    />
                ))}
            </div>
        </Box>
    );
}

BoxMenssaje.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string,
};