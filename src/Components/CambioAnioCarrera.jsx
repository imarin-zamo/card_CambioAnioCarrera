
import React, { useState } from 'react';

import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
//import { Calendar, ChevronRight } from '@ellucian/ds-icons/lib';
import { Autocomplete, Button ,Grid} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});



const CambioAnioCarrera = (props) => {
    const { classes } = props;
     const [spacing, setSpacing] = React.useState(2);

    // Manejar los state del modulo
    const [value, setValue] = useState(null);
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState();

    console.log('CambioAnioCarrera props', classes);


     const onChange = (event, newValue) => {
        setValue(newValue);
    };

    const onBlur = () => {
        setError(!value);
        setHelperText(!value ? 'A selection is required' : undefined);
    };


    return (
        <div className='columns-4xs'>
            {/* <Typography variant="h4"></Typography> */}
            <p>
                Esta tarjeta permite realizar el cambio de año de carrera de los estudiantes,
                se debe de hacer despues de haber realizado el cierre de periodo académico y ejecutado el CAPP para cada programa academico, que desea hacer el cambio.
            </p>

            <Grid container className={classes.card} spacing={spacing}>
                <Grid item xs={12}>
                    <h2>Seleccione los siguientes parámetros para realizar el cambio de año de carrera</h2>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                    
                </Grid>
            </Grid>

            
            <Autocomplete
                id="programs"
                options={SUGGESTIONS_SAMPLE_DATA_PROGRAMS}
                requerido
                error={error}
                helperText={helperText + ' de los programas'}
                label="Carrera"
                value={value}
                onChange={onChange}
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
                onChange={onChange}
                onBlur={onBlur}
            />

            <Button
                color="primary"
                fluid
                size="large"
                variant="contained"
            >
                Realizar el cambio de año
            </Button>
        </div>
    );
};

CambioAnioCarrera.propTypes = {
    classes: PropTypes.object.isRequired
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
export default withStyles(styles)(CambioAnioCarrera);