import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
//importacion de componentes de ellucian
import { Button, Autocomplete, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@ellucian/react-design-system/core';
import { useUserInfo } from '@ellucian/experience-extension-utils';
import { useZamoranoData } from '../hooks/useZamoranoData';
import CustomDataGrid from './CustomDataGrid';
import Loading from './Loading';
import BoxMenssaje from './BoxMenssaje';
import Error from './Error';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Concentradora = () => {
    const userInfo = useUserInfo();

    const getPrograms = useZamoranoData();
    const getTerms = useZamoranoData();
    const getCalculateConcentradora = useZamoranoData();
    const getLocalNrcs = useZamoranoData();

    const [selectPrograms, setSelectPrograms] = useState(null);
    const [selectTerm, setSelectTerm] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [postResult, setPostResult] = useState(null);

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
        1. <strong>Crear las secciones (NRC) de Aprender Haciendo en Banner (SSASECT).</strong>
        2. <strong>Vincular dichos NRC en la pestaña de "NRC" dentro de esta tarjeta.</strong>
        3. Asegurar el rolado de calificaciones y verificar las listas de clase (SFASLST).
        <strong>4. Ejecutar el proceso de la Concentradora AH.</strong>
        5. Calcular los promedios globales del periodo (SHRCGPA) o forzar el recálculo individual (SHRGPAC).
        6. Ejecutar la evaluación de CAPP para actualizar el avance académico.
        `,
            color: 'primary.main',
        },
        {
            title: 'Requisito Indispensable',
            description: 'Para que los promedios se calculen con exactitud, cada módulo de AH debe tener sus atributos de curso configurados para el periodo activo. Por favor, valide en Banner (Pantalla SCADETL > pestaña Atributos de Grado) que esta configuración esté completa antes de iniciar el proceso masivo.',
            color: '#c93204ff', // Mantiene el tono de advertencia
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
            const periodo = selectTerm.code; // '202520'
            const programa = selectPrograms.code;
            getCalculateConcentradora.execute(`/ZA/v1/History/AuditConcentratorHistoryAcacemic?periodo=${periodo}&programa=${programa}`, { method: 'GET' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectPrograms, selectTerm]);


    console.log('userInfo full object:', userInfo.firstname);

    const columns = [
        { field: 'bannerId', headerName: 'Banner Id', align: 'center', width: '150px' },
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
                // Mapear de forma amigable la respuesta del servidor en caso de 404 u otros errores
                setValidationError(getLocalNrcs.error || "No se encontraron NRCs para el período especificado.");
                setIsValidating(false);
                return;
            }

            const localItems = localRes.items || [];

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

            // Mapear los datos de gridData al formato requerido por el body de la API
            const requestData = gridData.map(row => {
                const studentCourseCode = (row.newCourseHistory || "").trim().toUpperCase();
                const studentCourseName = (row.newCourseHistoryName || "").trim().toUpperCase();

                // Buscar el NRC local correspondiente
                const matchingNrc = localItems.find(item => {
                    const nrcCode = `${(item.materia || "").trim()}${(item.numeroCurso || "")}`.trim().toUpperCase();
                    const nrcAlias = (item.aliasCurso || "").trim().toUpperCase();
                    const nrcTitle = (item.titulo || "").trim().toUpperCase();
                    return studentCourseCode === nrcCode || studentCourseName === nrcAlias || studentCourseName === nrcTitle;
                });

                const crn = matchingNrc ? Number(matchingNrc.nrc) : null;
                const creditHours = matchingNrc ? Number(matchingNrc.creditos) : 0;
                const longCourseTitle = matchingNrc ? (matchingNrc.titulo || matchingNrc.aliasCurso) : row.newCourseHistoryName;

                return {
                    id: String(row.bannerId || row.id || ""),
                    module: Array.isArray(row.module) ? row.module.map(m => ({
                        codeModule: m.codeModule || "",
                        nameModule: m.nameModule || "",
                        grade: m.grade !== undefined && m.grade !== null ? Number(m.grade) : 0
                    })) : [],
                    area: row.area || "",
                    keyRule: row.keyRule || (row.newCourseHistory ? `AH_${row.newCourseHistory.replace(/\D/g, '')}` : ""),
                    newCourseHistory: row.newCourseHistory || "",
                    newCourseHistoryName: row.newCourseHistoryName || "",
                    grade: row.grade !== undefined && row.grade !== null ? String(row.grade) : "",
                    keyblckTermCode: Number(termCode),
                    averageNumbersModules: row.averageNumbersModules !== undefined && row.averageNumbersModules !== null ? Number(row.averageNumbersModules) : 0,
                    courseMaintenance: [
                        {
                            creditHours: creditHours,
                            gmodCode: "N",
                            primaryLevlInd: "Y",
                            nagrCmmt: "Registrado desde proceso masivo Concentradora",
                            gchgCode: "OE",
                            levlCode: "LI",
                            crn: crn,
                            longCourseTitle: longCourseTitle || ""
                        }
                    ]
                };
            });

            const payload = {
                data: requestData,
                userName: userInfo.firstName,
                hostName: "hostname",
            };

            console.log('Payload a postear:', payload);

            // Registro final de promedios (POST con el payload)
            const response = await getCalculateConcentradora.execute(
                `/ZA/v1/History/ResgisterConcentratorHistoryAcacemicBatches`,
                {
                    method: 'POST',
                    body: payload
                }
            );

            if (response) {
                // Guardar el resultado estructurado de la API
                setPostResult(response);
            }
        } catch (error) {
            setValidationError(`Ocurrió un error inesperado durante el proceso: ${error.message}`);
        } finally {
            setIsValidating(false);
        }
    };



    const handleDownloadPDF = () => {
        if (!postResult) return;

        const doc = new jsPDF();

        // 1. Encabezado
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Registro de materias concentradoras de AH en historiales academicos", 14, 20);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);

        const fecha = new Date().toLocaleString();
        const usuario = userInfo.firstName;
        const periodoStr = selectTerm ? `${selectTerm.code} - ${selectTerm.title}` : "";

        doc.text(`Fecha: ${fecha}`, 14, 30);
        doc.text(`Usuario: ${usuario}`, 14, 35);
        doc.text(`Periodo: ${periodoStr}`, 14, 40);

        // Resumen
        doc.setFont("Helvetica", "bold");
        doc.text("Resumen del Proceso:", 14, 52);
        doc.setFont("Helvetica", "normal");
        doc.text(`Total procesados: ${postResult.totalProcesados}`, 14, 58);
        doc.text(`Exitosos: ${postResult.exitosos}`, 14, 64);
        doc.text(`Fallidos: ${postResult.fallidos}`, 14, 70);

        let currentY = 80;

        // Tabla de Registros Exitosos
        if (postResult.detalleExitosos && postResult.detalleExitosos.length > 0) {
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Registros Exitosos", 14, currentY);
            currentY += 4;

            const headersExitosos = [["Banner ID", "NRC", "Curso", "Nota"]];
            const dataExitosos = postResult.detalleExitosos.map(item => [
                item.bannerId || "",
                item.crn !== undefined ? String(item.crn) : "",
                item.curso || "",
                item.nota !== undefined ? String(item.nota) : ""
            ]);

            autoTable(doc, {
                startY: currentY,
                head: headersExitosos,
                body: dataExitosos,
                theme: 'striped',
                headStyles: { fillColor: [46, 125, 50] }, // Verde
                styles: { fontSize: 9 },
                didDrawPage: (data) => {
                    currentY = data.cursor.y + 12;
                }
            });
        }

        // Tabla de Registros Fallidos
        if (postResult.detalleFallidos && postResult.detalleFallidos.length > 0) {
            if (currentY > 260) {
                doc.addPage();
                currentY = 20;
            }

            const translateBannerError = (errorMessage) => {
                if (!errorMessage) {
                    return "Error desconocido: El servidor no proporcionó detalles del fallo.";
                }

                if (errorMessage.includes("Duplicate CRN's are not permitted")) {
                    return "Error de duplicidad: El estudiante ya cuenta con este NRC en su historial (SHATCKN) para el periodo actual.";
                }
                if (errorMessage.includes("Grade entered is not valid")) {
                    return "La nota calculada no es válida para la escala de calificaciones de esta carrera.";
                }
                return `Error en Banner: ${errorMessage}`;
            };


            doc.setFont("Helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Registros Fallidos", 14, currentY);
            currentY += 4;

            const headersFallidos = [["Banner ID", "NRC", "Error"]];
            const dataFallidos = postResult.detalleFallidos.map(item => {
                return [
                    item.bannerId || "",
                    item.crn !== undefined ? String(item.crn) : "",
                    translateBannerError(item.error?.errors?.[0]?.message)
                ];
            });

            autoTable(doc, {
                startY: currentY,
                head: headersFallidos,
                body: dataFallidos,
                theme: 'striped',
                headStyles: { fillColor: [211, 47, 47] }, // Rojo
                styles: { fontSize: 9 },
                columnStyles: {
                    2: { cellWidth: 'auto' }
                }
            });
        }

        const fileName = `registro_concentradora_${selectPrograms?.code}-${selectTerm?.code}_${new Date().getTime()}.pdf`;
        doc.save(fileName);
        // handleFinalizeProcess();
    };

    const handleFinalizeProcess = () => {
        setOpenDialog(false);
        setPostResult(null);
        setSelectPrograms(null);
        setSelectTerm(null);
        getCalculateConcentradora.clearData();
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
                    <strong> Se migrarán las materias concentradoras a los historiales académicos de los estudiantes</strong>
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

            {/* Diálogo de Confirmación y Resultados */}
            <Dialog
                open={openDialog}
                onClose={() => {
                    if (!isValidating) {
                        if (postResult) {
                            handleFinalizeProcess();
                        } else {
                            setOpenDialog(false);
                        }
                    }
                }}
                maxWidth="md"
                fullWidth
            >
                {postResult ? (
                    <>
                        <DialogTitle>Resultados del Registro de Materias</DialogTitle>
                        <DialogContent>
                            <DialogContentText style={{ marginBottom: '15px' }}>
                                El proceso de registro de materias concentradoras ha finalizado.
                            </DialogContentText>
                            <div style={{ padding: '12px', backgroundColor: '#f0f4f9', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #1976d2' }}>
                                <p style={{ margin: '4px 0', fontSize: '15px' }}><strong>Total procesados:</strong> {postResult.totalProcesados}</p>
                                <p style={{ margin: '4px 0', fontSize: '15px', color: '#2e7d32' }}><strong>Exitosos:</strong> {postResult.exitosos}</p>
                                <p style={{ margin: '4px 0', fontSize: '15px', color: postResult.fallidos > 0 ? '#d32f2f' : '#666' }}><strong>Fallidos:</strong> {postResult.fallidos}</p>
                            </div>

                            {postResult.detalleExitosos?.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: '#2e7d32', marginBottom: '8px', borderBottom: '1px solid #e0e0e0', paddingBottom: '4px' }}>Registros Exitosos</h4>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                            {postResult.detalleExitosos.map((item, idx) => (
                                                <li key={idx} style={{ fontSize: '14px', marginBottom: '4px' }}>
                                                    Estudiante <strong>{item.bannerId}</strong>: {item.curso} - {item.mensaje}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {postResult.detalleFallidos?.length > 0 && (
                                <div>
                                    <h4 style={{ color: '#d32f2f', marginBottom: '8px', borderBottom: '1px solid #e0e0e0', paddingBottom: '4px' }}>Registros Fallidos</h4>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                            {postResult.detalleFallidos.map((item, idx) => {
                                                const errorMsg = item.error?.errors?.[0]?.message || item.error?.message || "Error desconocido";
                                                const cleanCurso = item.curso?.includes("List`1") ? "APRENDER HACIENDO IV" : item.curso;
                                                return (
                                                    <li key={idx} style={{ fontSize: '14px', marginBottom: '8px', color: '#c62828' }}>
                                                        <strong>Estudiante {item.bannerId}</strong> - {cleanCurso}
                                                        <br />
                                                        <span style={{ fontSize: '12px', color: '#555', marginLeft: '10px', display: 'block', fontStyle: 'italic' }}>
                                                            Motivo: {errorMsg}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleDownloadPDF}
                                color="secondary"
                                //variant="outlined"
                                style={{ marginRight: 'auto' }}
                            >
                                Descargar PDF
                            </Button>
                            <Button
                                onClick={handleFinalizeProcess}
                                color="primary"
                                variant="contained"
                            >
                                Cerrar
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </Dialog>
        </div>
    );
}
Concentradora.propTypes = {
    Classes: PropTypes.object.isRequired
};

export default Concentradora;