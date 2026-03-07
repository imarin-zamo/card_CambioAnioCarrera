import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//importacion de componentes de ellucian
import { Button, Autocomplete, TextField, Grid } from '@ellucian/react-design-system/core';
import { useZamoranoData } from '../hooks/useZamoranoData';
import Error from "../Components/Error";
import Loading from "../Components/Loading";

const Concentradora = (props) => {
    const { Classes } = props;

    const getLevels = useZamoranoData();
    const getPrograms = useZamoranoData();

    const [level, setlevel] = useState(null);
    const [selectPrograms, setSelectPrograms] = useState(null);
    // Como useZamoranoData ya devuelve json.response internamente, getLevels.data ya es el arreglo

    const levelList = Array.isArray(getLevels.data) ? getLevels.data : [];
    const programsList = Array.isArray(getPrograms.data) ? getPrograms.data : [];

    useEffect(() => {
        getLevels.execute('/RT/v1/academic-levels', { method: 'GET' });
    }, []);

    console.log('get niveles academicos', getLevels);

    useEffect(() => {
        if (level) {
            getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
        }
    }, [level]);


    // const getTerms = useZamoranoData();
    // const termsList = getTerms.data && getTerms.data.response ? getTerms.data.response : [];
    // const [term, setterm] = useState([]);



    // useEffect(() => {
    //     if (level) {
    //         getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
    //     }
    // }, [level]);

    // useEffect(() => {
    //     getTerms.execute('/RT/v1/acadsemic-periods', { method: 'GET' });
    // }, []);

    console.log('Concentradora props', Classes);
    //eventos de los combobox
    const handleLevelChange = (event, newValue) => {
        setlevel(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            console.log('level in handleLevelChange', level);
        }
    };

    const handleProgramsChange = (event, newValue) => {
        setSelectPrograms(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            console.log('programs in handleProgramsChange', selectPrograms);
        }
    };


    return (
        <div>
            <div>
                <h2>Concentradora</h2>

            </div>
            <div>
                <p>
                    Registrar materia concentradora en historiales académicos, se debe de hacer despues de haber realizado el cierre de periodo académico
                    y ejecutado el CAPP  <strong>Se migrarán las materias concentradoras a los historiales académicos de los estudiantes</strong>
                </p>


                {getLevels.loading && <Loading />}
                {getLevels.error && <Error alertText={getLevels.error} variant='inline' />}
                {getLevels.data && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                id="level"
                                options={levelList}
                                getOptionLabel={(option) => {
                                    if (!option) return "";
                                    if (typeof option === 'string') return option;
                                    return option.title ? `${option.code} - ${option.title}` : "";
                                }}
                                value={level}
                                onChange={handleLevelChange}
                                fullWidth
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Buscar el nivel académico"
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
                                options={level ? programsList.filter(p => p.academicLevel?.id === level.id) : []}
                                getOptionLabel={(option) => option ? (option.code + ' - ' + option.title) : ''}
                                fullWidth
                                onChange={handleProgramsChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Buscar el programa"
                                        placeholder="Escriba para filtrar..."
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        {/* <Grid item xs={12} sm={4}>
                        <Autocomplete
                            id="term"
                            value={term}
                            options={termsList}
                            getOptionLabel={(option) => option ? (option.code + ' - ' + option.title) : ''}
                            fullWidth
                            label="Periodo académico"
                            onChange={(event, newValue) => setterm(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar el periodo académico"
                                    placeholder="Escriba para filtrar..."
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid> */}
                    </Grid>
                )}
                <br />
            </div>

            <Button
                color="primary"
                fluid
                size="large"
                variant="contained"

            >
                Registrar materias concentradoras en historiales académicos
            </Button>
        </div>
    );
}
Concentradora.propTypes = {
    Classes: PropTypes.object.isRequired
};

export default Concentradora;