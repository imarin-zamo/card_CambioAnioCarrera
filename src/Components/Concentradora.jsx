import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//importacion de componentes de ellucian
import { Button, Autocomplete, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@ellucian/react-design-system/core';
import { useZamoranoData } from '../hooks/useZamoranoData';
import CustomDataGrid from './CustomDataGrid';
import Loading from './Loading';
import BoxMenssaje from './BoxMenssaje';
import Error from './Error';

const Concentradora = () => {

    const getPrograms = useZamoranoData();
    const getTerms = useZamoranoData();
    const getCalculateConcentradora = useZamoranoData();
    const getLocalNrcs = useZamoranoData();

    const [selectPrograms, setSelectPrograms] = useState(null);
    const [selectTerm, setSelectTerm] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isValidating, setIsValidating] = useState(false);

    const programsData = Array.isArray(getPrograms.data) ? getPrograms.data : [];

    const programsList = programsData.filter(program => {
        const code = program.code || '';

        const is18OrL = code.startsWith('18') || code.startsWith('L');

        const hasCorrectLevel = program.academicLevel && program.academicLevel.id === 'a3e98c81-44bf-4087-b192-771c4ac6c608';

        const hasSites = program.sites && Array.isArray(program.sites) && program.sites.length > 0;

        return is18OrL && hasCorrectLevel && hasSites;
    });
    const termsList = Array.isArray(getTerms.data) ? getTerms.data : [];//getTerms.data && getTerms.data.response ? getTerms.data.response : [];



    const messageData = [
        {
            title: 'Pasos a seguir',
            description: `
            1. Registrar los NRC AH en SSASECT.
            2. Registrar los NRC en est&aacute; tarjeta en el tag de NRC.
            3. Rolado de las Notas de los NRC, validarlas en SFASLST.
            <strong>4. Ejecutar la Concentradora AH</strong>.
            5. Ejecutar el calculo de promedios global para el periodo en SHRCGPA y/o recalculo de promedio en SHRGPAC.
            6. Correr CAPP.
            `,
            color: 'primary.main',
        },
        {
            title: 'Para tener en cuenta',
            description: 'Cada modulo de AH debe de tener configurado los atributos de curso, sin esto los promedios no serán los correctos,antes de realizar este proceso validar cada modulo de AH tenga configurado los atributos de curso en SCADETL | atributos de grado.',
            color: '#c93204ff',
        }
    ];

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

    // console.log('getCalculateConcentradora', getCalculateConcentradora.data);

    // console.log('selectPrograms', selectPrograms);

    const columns = [
        { field: 'bannerd', headerName: 'Banner Id', align: 'center', width: '150px' },
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
        { field: 'newCourseHistory', headerName: 'Código del curso', align: 'center', width: '200px' },
        { field: 'newCourseHistoryName', headerName: 'Nombre del curso', minWidth: '300px' },
        {
            field: 'grade',
            headerName: 'Nota',
            align: 'center',
            width: '100px',
            renderCell: (row) => row.grade !== undefined && row.grade !== null ? Number(row.grade).toFixed(2) : ''
        }
    ];

    const handleOpenDialog = () => {
        setValidationError(null);
        setOpenDialog(true);
    };

    const handleConfirmarRegistro = async () => {
        setValidationError(null);
        setIsValidating(true);

        try {
            const termCode = selectTerm?.code;
            if (!termCode) {
                setValidationError("Por favor, seleccione un período académico.");
                setIsValidating(false);
                return;
            }

            // Consultar los NRCs registrados localmente
            const localRes = await getLocalNrcs.execute(`/ZA/v1/Academic/nrcAHLocal/${termCode}`, { method: 'GET' });

            if (!localRes) {
                setValidationError("Error al obtener la información de los NRC para validar.");
                setIsValidating(false);
                return;
            }

            const localItems = localRes.items || [];

            console.log('localItems', localItems);
            console.log('termCode', termCode);

            // Determinar los cursos obligatorios según terminación del período
            let expectedCourses = [];
            if (termCode.endsWith('10')) {
                expectedCourses = ["APRENDER HACIENDO I", "APRENDER HACIENDO IV", "APRENDER HACIENDO VII"];
            } else if (termCode.endsWith('20')) {
                expectedCourses = ["APRENDER HACIENDO II", "APRENDER HACIENDO V", "APRENDER HACIENDO VIII"];
            } else if (termCode.endsWith('30')) {
                expectedCourses = ["APRENDER HACIENDO III", "APRENDER HACIENDO VI", "APRENDER HACIENDO IX"];
            }

            // Comparación robusta insensible a mayúsculas y espacios
            const matchesExpected = (item, expected) => {
                const alias = (item.aliasCurso || "").trim().toUpperCase();
                const titulo = (item.titulo || "").trim().toUpperCase();
                const target = expected.trim().toUpperCase();
                return alias === target || titulo === target;
            };

            // Filtrar los cursos que no están en el JSON devuelto
            const missing = expectedCourses.filter(expected => {
                return !localItems.some(item => matchesExpected(item, expected));
            });

            if (missing.length > 0) {
                // Alerta amigable al usuario final sin usar la palabra "local" ni similares
                const missingListStr = missing.join(', ');
                setValidationError(`Falta registrar los siguientes NRC obligatorios: ${missingListStr} en el periodo ${termCode}`);
                setIsValidating(false);
                return;
            }

            // Registro final de promedios
            const periodo = selectTerm.code;
            const programa = selectPrograms.code;
            const response = await getCalculateConcentradora.execute(
                `/ZA/v1/History/ResgisterConcentratorHistoryAcacemic?periodo=${periodo}&programa=${programa}`,
                { method: 'POST' }
            );

            if (response) {
                alert("¡Proceso de registro finalizado con éxito!");
                setOpenDialog(false);
            }
        } catch (error) {
            setValidationError(`Ocurrió un error inesperado durante la validación: ${error.message}`);
        } finally {
            setIsValidating(false);
        }
    };

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
                    <strong>Se migrarán las materias concentradoras a los historiales académicos de los estudiantes</strong>
                </p>



                {messageData &&
                    messageData.map((message, index) => (
                        <BoxMenssaje
                            key={index}
                            title={message.title}
                            description={message.description}
                            color={message.color}
                        />
                    ))}
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
                    onClick={handleOpenDialog}
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
            */}

            {/* Diálogo de Confirmación */}
            <Dialog
                open={openDialog}
                onClose={() => !isValidating && setOpenDialog(false)}
            >
                <DialogTitle>¿Confirmar Registro de Materias?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Está a punto de registrar la materia concentradora en los historiales académicos de los estudiantes.
                        Asegúrese de ejecutar este proceso <strong>únicamente si ya ha finalizado el enrolado de NRC y el cierre de periodo académicos</strong>
                        <br /><br />
                        ¿Está completamente seguro de que desea continuar con el registro?
                    </DialogContentText>
                    {isValidating && <Loading />}
                    {validationError && (
                        <Error alertText={validationError} />
                    )}
                    {getLocalNrcs.error && (
                        <Error alertText={`Error al consultar NRCs: ${getLocalNrcs.error}`} />
                    )}
                    {getCalculateConcentradora.error && (
                        <Error alertText={`Error al registrar materias: ${getCalculateConcentradora.error}`} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary" disabled={isValidating}>
                        Cancelar
                    </Button>
                    <Button
                        id="btnConfirmarRegistro"
                        onClick={handleConfirmarRegistro}
                        color="primary"
                        variant="contained"
                        disabled={isValidating || !!validationError || getLocalNrcs.loading || getCalculateConcentradora.loading}
                    >
                        {isValidating ? 'Validando...' : 'Confirmar y Registrar'}
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