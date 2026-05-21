import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//importacion de componentes de ellucian
import { Button, Autocomplete, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@ellucian/react-design-system/core';
import { useZamoranoData } from '../hooks/useZamoranoData';
import CustomDataGrid from './CustomDataGrid';
import Loading from './Loading';

const Concentradora = () => {

    const getPrograms = useZamoranoData();
    const getTerms = useZamoranoData();
    const getCalculateConcentradora = useZamoranoData();

    const [selectPrograms, setSelectPrograms] = useState(null);
    const [selectTerm, setSelectTerm] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const programsData = Array.isArray(getPrograms.data) ? getPrograms.data : [];

    const programsList = programsData.filter(program => {
        const code = program.code || '';

        const is18OrL = code.startsWith('18') || code.startsWith('L');

        const hasCorrectLevel = program.academicLevel && program.academicLevel.id === 'a3e98c81-44bf-4087-b192-771c4ac6c608';

        const hasSites = program.sites && Array.isArray(program.sites) && program.sites.length > 0;

        return is18OrL && hasCorrectLevel && hasSites;
    });
    const termsList = Array.isArray(getTerms.data) ? getTerms.data : [];//getTerms.data && getTerms.data.response ? getTerms.data.response : [];


    useEffect(() => {
        //getLevels.execute('/RT/v1/academic-levels', { method: 'GET' });
        getTerms.execute('/RT/v1/academic-periods', { method: 'GET' });
        getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //eventos de los combobox

    const handleProgramsChange = (event, newValue) => {
        setSelectPrograms(newValue);
        if (newValue) {
            // getPrograms.execute('/RT/v1/academic-programs', { method: 'GET' });
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

    useEffect(() => {
        if (selectPrograms && selectTerm) {
            // "para ejectos de la prueba agrega el filtro a periodo 202520 que sea el filtro que ya tenemos o 202520 esto solo como pruebas."
            const periodo = '202520';
            const programa = selectPrograms.code;
            getCalculateConcentradora.execute(`/ZA/v1/History/ResgisterConcentratorHistoryAcacemic?periodo=${periodo}&programa=${programa}`, { method: 'POST' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectPrograms, selectTerm]);

    console.log('getCalculateConcentradora', getCalculateConcentradora.data);

    console.log('selectPrograms', selectPrograms);

    const columns = [
        { field: 'bannerd', headerName: 'Banner Id', align: 'center', width: '120px' },
        { field: 'name', headerName: 'Nombre', minWidth: '300px' },
        { field: 'averageNumbersModules', headerName: 'Módulos evaluados', align: 'center', width: '180px' },
        { field: 'area', headerName: 'Area', align: 'center', width: '100px' },
        {
            field: 'module',
            headerName: 'Módulos (Código / Nota)',
            isSubCell: true,
            minWidth: '500px',
            headerAlign: 'center',
            renderCell: (row, classes) => {
                if (!row.module || !row.module.length) return null;
                return (
                    <div className={classes.subCellContainer}>
                        {row.module.map((mod, idx) => {
                            const isLast = idx === row.module.length - 1;
                            const gradeFormat = mod.grade !== undefined && mod.grade !== null ? Number(mod.grade).toFixed(2) : '';
                            return (
                                <div key={idx} className={isLast ? classes.subCellRowLast : classes.subCellRow}>
                                    <div className={classes.subCellItemBordered}>{mod.codeModule + " - " + mod.nameModule}</div>
                                    <div className={classes.subCellItemCenter}>{gradeFormat}</div>
                                </div>
                            );
                        })}
                    </div>
                );
            },
        },
        { field: 'newCourseHistory', headerName: 'Código del curso', align: 'center', width: '160px' },
        { field: 'newCourseHistoryName', headerName: 'Nombre del curso', minWidth: '300px' },
        {
            field: 'grade',
            headerName: 'Nota',
            align: 'center',
            width: '100px',
            renderCell: (row) => row.grade !== undefined && row.grade !== null ? Number(row.grade).toFixed(2) : ''
        }
    ];

    let gridData = [];
    if (Array.isArray(getCalculateConcentradora.data)) {
        gridData = getCalculateConcentradora.data;
    } else if (getCalculateConcentradora.data?.items?.response) {
        gridData = getCalculateConcentradora.data.items.response;
    }

    return (
        <div>
            <div>
                <h2>Concentradora Cursos de AH</h2>

            </div>
            <div>
                <p>
                    Registrar materia concentradora en historiales académicos de Banner, se debe de hacer despues de haber realizado el cierre de periodo académico
                    y ejecutado el CAPP  <strong>Se migrarán las materias concentradoras a los historiales académicos de los estudiantes</strong>
                </p>


                {programsList && termsList && (
                    <Grid container spacing={4}>

                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                id="programs"
                                value={selectPrograms}
                                // Aquí filtramos dinámicamente la lista de programas
                                options={programsList}
                                getOptionLabel={(option) => option ? (option.code + ' - ' + option.title) : ''}
                                fullWidth
                                onChange={handleProgramsChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        // label="Buscar el programa"
                                        placeholder="Buscar el programa"
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
                                        // label="Buscar el periodo académico abierto y que este en el rango de fechas"
                                        placeholder="Buscar el periodo académico abierto y que este en el rango de fechas"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                    </Grid>
                )}
                <br />
            </div>

            {getCalculateConcentradora.loading && <Loading />}
            {!getCalculateConcentradora.loading && gridData?.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <CustomDataGrid columns={columns} data={gridData} loading={getCalculateConcentradora.loading} />
                </div>
            )}
            {gridData?.length > 0 &&
                <Button
                    id="btnRegistrar"
                    color="primary"
                    fluid
                    size="large"
                    variant="contained"
                    onClick={() => setOpenDialog(true)}
                    disabled={!selectTerm || !selectPrograms}
                >
                    Registrar materias concentradoras en historiales académicos
                </Button>
            }
            {/* <Button
                id="btnRegistrar"
                color="primary"
                fluid
                size="large"
                variant="contained"
                onClick={() => setOpenDialog(true)}
                disabled={!selectTerm || !selectPrograms}
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