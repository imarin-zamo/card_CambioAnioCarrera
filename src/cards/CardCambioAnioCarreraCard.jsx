import React, { useState } from 'react';

import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Autocomplete } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

const CardCambioAnioCarreraCard = (props) => {
    // Manejar los state del modulo
    const [value, setValue] = useState(null);
    
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState();
    
    
    const onChangeLevel = (event, newValue) => {
        setValue(newValue);
    };
    
    const onChangePrograms = (event, newValue) => {
        setValue(newValue);
    };
    
    const onChangeTerm = (event, newValue) => {
        setValue(newValue);
    };
    
    const onBlur = () => {
        setError(!value);
        setHelperText(!value ? 'Es obligatorio seleccionar una opción' : undefined);
    };

    const { classes } = props;

    return (
        <div className={classes.card}>
            <Typography variant="h4">
                Cambio de Año de Carrera de estudiantes
            </Typography>
            <p>
                Esta tarjeta permite realizar el cambio de año de carrera de los estudiantes,
                se debe de hacer despues de haber realizado el cierre de periodo académico y ejecutado el CAPP para cada programa academico, que desea hacer el cambio.
            </p>

            {/* Ejemplo de combobox */}
            <Autocomplete
                id="level"
                options={SUGGESTIONS_SAMPLE_DATA_LEVEL}
                requerido
                error={error}
                helperText={helperText + ' del nivel académico'}
                label="Nivel académico"
                value={value}
                onChange={onChangeLevel}
                onBlur={onBlur}
            />
            <Autocomplete
                id="programs"
                options={SUGGESTIONS_SAMPLE_DATA_PROGRAMS}
                requerido
                error={error}
                helperText={helperText+' de los programas'}
                label="Carrera"
                value={value}
                onChange={onChangePrograms}
                onBlur={onBlur}
            />

            <Autocomplete
                id="term"
                options={SUGGESTIONS_SAMPLE_DATA_TERM}
                requerido
                error={error}
                helperText={helperText + ' del periodo académico'}
                label="Periodo académico"
                value={value}
                onChange={onChangeTerm}
                onBlur={onBlur}
            />
        </div>
    );
};

const SUGGESTIONS_SAMPLE_DATA_LEVEL = [
    { label: 'LI - LICENCIATURA' },
    { label: 'MA - MAESTRIA' },
    { label: 'DO - DOCTORADO' },
    { label: 'TE - TECNICOS' }
];

const SUGGESTIONS_SAMPLE_DATA_PROGRAMS = [
    { label: '18AGI - AGROINDUSTRIA ALIMENTARIA' },
    { label: '18AGN - ADMINISTRACION DE AGRONEGOCIOS' },
    { label: '18IAD - AMBIENTE Y DESARROLLO' },
    { label: '18CIA - INGENIERIA AGRONOMICA' },
    { label: 'MACAFE - MAE EN CAFICULTURA Y NEGOCIOS' },
    { label: 'MAGN - MAESTRIA EN AGRONEGOCIOS' },
    { label: 'MANU - MAESTRIA EN NUTRICION' },
    { label: 'MATS - AGRI TROPICAL SOSTENIBLE' },
    { label: 'MEAGN - MAE EJECUTIVA EN AGRONEGOCIOS' },
];

const SUGGESTIONS_SAMPLE_DATA_TERM = [
    { label: '202510 - LI' },
    { label: '202520 - LI' },
    { label: '202530 - LI' },
    { label: '202540 - MA' },
    { label: '202550 - MA' },
    { label: '202560 - MA' },
    { label: '202580 - DO' },
    { label: '202590 - DO' },
];
CardCambioAnioCarreraCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardCambioAnioCarreraCard);