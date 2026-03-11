
import React, { useState, useEffect } from 'react';

import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
//import { Calendar, ChevronRight } from '@ellucian/ds-icons/lib';
import { Autocomplete, Button, Grid, TextField } from '@ellucian/react-design-system/core'; //Alert, Card, CardHeader, INLINE_VARIANT
import PropTypes from 'prop-types';
import { useZamoranoData } from '../hooks/useZamoranoData';
import Error from "../Components/Error";
import Loading from "../Components/Loading";

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },

});



const CambioAnioCarrera = (props) => {
    const { classes } = props;


    const getLevels = useZamoranoData();
    const getPrograms = useZamoranoData();
    const getTerms = useZamoranoData();

    const [selectLevel, setSelectLevel] = useState(null);
    const [selectPrograms, setSelectPrograms] = useState(null);
    const [selectTerm, setSelectTerm] = useState(null);

    const levelList = Array.isArray(getLevels.data) ? getLevels.data : [];
    const programsList = Array.isArray(getPrograms.data) ? getPrograms.data : [];
    const termsList = Array.isArray(getTerms.data) ? getTerms.data : [];

    useEffect(() => {
        getLevels.execute('/RT/v1/academic-levels', { method: 'GET' });
        getTerms.execute('/RT/v1/academic-periods', { method: 'GET' });
    }, []);


    useEffect(() => {
        if (selectLevel) {
            getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
        }
    }, [selectLevel]);

    useEffect(() => {
        if (selectTerm && selectPrograms) {
            document.getElementById('btnCambioAnioCarrera').disabled = true;
        }
    }, [selectTerm, selectPrograms]);


    const handleLevelChange = (event, newValue) => {
        setSelectLevel(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            // console.log('level in handleLevelChange', level);
        }
    };

    const handleProgramsChange = (event, newValue) => {
        setSelectPrograms(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            //console.log('programs in handleProgramsChange', selectPrograms);
        }
    };

    const handleTermChange = (event, newValue) => {
        setSelectTerm(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            // console.log('term in handleTermChange', selectTerm);
        }
    };

    console.log('classes', classes)
    return (
        <div className='columns-4xs'>
            {/* <Typography variant="h4"></Typography> */}
            <p>
                Esta tarjeta permite realizar el cambio de año de carrera de los estudiantes,
                se debe de hacer despues de haber realizado el cierre de periodo académico y ejecutado el CAPP para cada programa academico, que desea hacer el cambio.
            </p>
            <div>
                <h3 className='Center'>Seleccione los siguientes parámetros para realizar el cambio de año de carrera</h3>
            </div>
            {getLevels.loading && <Loading />}
            {getLevels.error && <Error alertText={getLevels.error} variant='inline' />}

            {getLevels.data && getTerms.data && (

                <Grid container spacing={4}>

                    <Grid item xs={12} sm={4}>
                        <Autocomplete
                            id="level"
                            options={levelList}
                            getOptionLabel={(option) => {
                                if (!option) return "";
                                if (typeof option === 'string') return option;
                                return option.title ? `${option.code} - ${option.title}` : "";
                            }}
                            value={selectLevel}
                            onChange={handleLevelChange}
                            fullWidth
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Nivel académico"
                                    placeholder="Escriba para filtrar..."
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Autocomplete
                            id="programs"
                            value={selectPrograms}
                            // Aquí filtramos dinámicamente la lista de programas
                            options={selectLevel ? programsList.filter(p => p.academicLevel?.id === selectLevel.id) : []}
                            getOptionLabel={(option) => option ? (option.code + ' - ' + option.title) : ''}
                            fullWidth
                            onChange={handleProgramsChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Programa académico"
                                    placeholder="Escriba para filtrar..."
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Autocomplete
                            id="term"
                            value={selectTerm}
                            options={termsList.filter(t => {
                                // validar que el periodo este abierto y que la fecha de fin no haya pasado    "registration": "open",  "endOn": "2026-04-30T00:00:00+00:00",
                                if (t.registration !== 'open') return false;
                                if (!t.endOn) return false;
                                const endDate = new Date(t.endOn);
                                const today = new Date();
                                // Solo evaluar la fecha
                                endDate.setHours(0, 0, 0, 0);
                                today.setHours(0, 0, 0, 0);
                                return endDate >= today;
                            })}
                            getOptionLabel={(option) => option ? (option.code + ' - ' + option.title) : ''}
                            fullWidth
                            label="Periodo académico"
                            onChange={handleTermChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Periodo académico"
                                    placeholder="Escriba para filtrar..."
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            )}
            <br />

            <Button
                id="btnCambioAnioCarrera"
                color="primary"
                fluid
                size="large"
                variant="contained"
                disabled={!selectLevel || !selectPrograms || !selectTerm}
            >
                Realizar el cambio de año de estudiantes
            </Button>




        </div>
    );
};

CambioAnioCarrera.propTypes = {
    classes: PropTypes.object.isRequired
};


export default withStyles(styles)(CambioAnioCarrera);