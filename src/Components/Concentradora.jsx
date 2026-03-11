import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//importacion de componentes de ellucian
import { Button, Autocomplete, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@ellucian/react-design-system/core';
import { useZamoranoData } from '../hooks/useZamoranoData';
import Error from "../Components/Error";
import Loading from "../Components/Loading";

const Concentradora = (props) => {
    const { Classes } = props;

    const getLevels = useZamoranoData();
    const getPrograms = useZamoranoData();
    const getTerms = useZamoranoData();
    const getAreas = useZamoranoData();

    const [level, setlevel] = useState(null);
    const [selectPrograms, setSelectPrograms] = useState(null);
    const [selectTerm, setSelectTerm] = useState(null);
    const [selectArea, setSelectArea] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    // Como useZamoranoData ya devuelve json.response internamente, getLevels.data ya es el arreglo

    const levelList = Array.isArray(getLevels.data) ? getLevels.data : [];
    const programsList = Array.isArray(getPrograms.data) ? getPrograms.data : [];
    const termsList = Array.isArray(getTerms.data) ? getTerms.data : [];//getTerms.data && getTerms.data.response ? getTerms.data.response : [];
    const areasList = Array.isArray(getAreas.data) ? getAreas.data : [];

    useEffect(() => {
        getLevels.execute('/RT/v1/academic-levels', { method: 'GET' });
        getTerms.execute('/RT/v1/academic-periods', { method: 'GET' });
    }, []);


    useEffect(() => {
        if (level) {
            getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
        }
    }, [level]);

    useEffect(() => {
        if (selectTerm && selectPrograms) {
            getAreas.execute(`/RT/v1/program-requirements-program-area-attachments?keyblckTermCode=${selectTerm.code}&programs=${selectPrograms.code}`, { method: 'GET' });
        }
    }, [selectTerm, selectPrograms]);



    console.log('Concentradora props', Classes);
    //eventos de los combobox

    const handleLevelChange = (event, newValue) => {
        setlevel(newValue);
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

    const handleAreaChange = (event, newValue) => {
        setSelectArea(newValue);
        if (newValue) {
            //  getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
            btnRegistrar.disabled = true;
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

                {getLevels.data && getTerms.data && (
                    <Grid container spacing={4}>

                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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
                                        label="Buscar el periodo académico abierto y que este en el rango de fechas"
                                        placeholder="Escriba para filtrar..."
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                id="area"
                                value={selectArea}
                                //filtrar las areas que empiecen con AH
                                options={areasList ? areasList.flatMap(a => a.SMRPAAP || []).filter(item => item.area && item.area.startsWith('AH')) : []}
                                getOptionLabel={(option) => option ? (option.area + ' - Aprender Haciendo ' + option.area.substring(2, 3).toUpperCase() + option.area.substring(3)) : ''}
                                fullWidth
                                label="Area académica"
                                onChange={handleAreaChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Buscar el area académica"
                                        placeholder="Escriba para filtrar..."
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                    </Grid>
                )}
                <br />
            </div>

            <Button
                id="btnRegistrar"
                color="primary"
                fluid
                size="large"
                variant="contained"
                onClick={() => setOpenDialog(true)}
                disabled={!selectArea}
            >
                Registrar materias concentradoras en historiales académicos
            </Button>

            {/* Diálogo de Confirmación */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>¿Confirmar Registro de Materias?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Está a punto de registrar la materia concentradora en los historiales académicos de los estudiantes.
                        Asegúrese de ejecutar este proceso <strong>únicamente</strong> si ya ha finalizado el cierre de periodo académico y ejecutado el proceso CAPP.
                        <br /><br />
                        ¿Está completamente seguro de que desea continuar con el registro?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            setOpenDialog(false);
                            alert("¡Proceso de registro iniciado!"); // Esto se reemplazará por la llamada a la API
                        }}
                        color="primary"
                        variant="contained"
                    >
                        Confirmar y Registrar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
Concentradora.propTypes = {
    Classes: PropTypes.object.isRequired
};

export default Concentradora;