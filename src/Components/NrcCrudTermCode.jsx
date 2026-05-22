import React, { useState, useEffect } from 'react';
import {
    Autocomplete,
    TextField,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@ellucian/react-design-system/core';

import { useZamoranoData } from '../hooks/useZamoranoData';
import CustomDataGrid from './CustomDataGrid';
import Loading from './Loading';
import Error from './Error';


const NrcCrudTermCode = () => {


    const getTerms = useZamoranoData();
    const getNrcAHLocalByTerm = useZamoranoData();

    // CRUD hooks
    const getNrcByConcentrator = useZamoranoData();
    const postNrc = useZamoranoData();
    const putNrc = useZamoranoData();
    const deleteNrc = useZamoranoData();

    const [selectTerm, setSelectTerm] = useState(null);

    // Dialog Add/Edit State
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingRow, setEditingRow] = useState(null);
    const [dialogSelectedNrc, setDialogSelectedNrc] = useState(null);

    // Dialog Delete State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingRow, setDeletingRow] = useState(null);

    const termsList = Array.isArray(getTerms.data) ? getTerms.data : [];

    // Cargar períodos académicos al iniciar
    useEffect(() => {
        getTerms.execute('/RT/v1/academic-periods', { method: 'GET' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Consultar NRCs locales al cambiar el período seleccionado
    useEffect(() => {
        if (selectTerm) {
            getNrcAHLocalByTerm.execute(`/ZA/v1/Academic/nrcAHLocal/${selectTerm.code}`, { method: 'GET' });
        } else {
            getNrcAHLocalByTerm.clearData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectTerm]);

    // Preseleccionar el NRC correspondiente en el diálogo al editar
    useEffect(() => {
        if (isEdit && editingRow && getNrcByConcentrator.data?.items) {
            const found = getNrcByConcentrator.data.items.find(
                item => Number(item.NRC || item.nrc) === Number(editingRow.nrc)
            );
            if (found) {
                setDialogSelectedNrc(found);
            }
        }
    }, [getNrcByConcentrator.data, isEdit, editingRow]);

    const handleTermChange = (event, newValue) => {
        setSelectTerm(newValue);
    };

    const handleOpenAddDialog = () => {
        setIsEdit(false);
        setEditingRow(null);
        setDialogSelectedNrc(null);
        postNrc.clearData();
        getNrcByConcentrator.clearData();
        setOpenAddEditDialog(true);
        if (selectTerm) {
            getNrcByConcentrator.execute(`/ZA/v1/Academic/NrcByConcentrator?termCode=${selectTerm.code}`, { method: 'GET' });

        }
    };

    const handleOpenUpdateDialog = (row) => {
        setIsEdit(true);
        setEditingRow(row);
        setDialogSelectedNrc(null);
        putNrc.clearData();
        getNrcByConcentrator.clearData();
        setOpenAddEditDialog(true);
        if (selectTerm) {
            getNrcByConcentrator.execute(`/ZA/v1/Academic/NrcByConcentrator?termCode=${selectTerm.code}`, { method: 'GET' });
        }
    };

    const handleOpenDeleteDialog = (row) => {
        setDeletingRow(row);
        deleteNrc.clearData();
        setOpenDeleteDialog(true);
    };

    const handleSave = async () => {
        if (!dialogSelectedNrc) return;

        if (isEdit) {
            const payload = {
                idNRCAH: editingRow.idNRCAH,
                nrc: Number(dialogSelectedNrc.NRC || dialogSelectedNrc.nrc),
                materia: dialogSelectedNrc.Materia || dialogSelectedNrc.materia,
                numeroCurso: Number(dialogSelectedNrc.NumeroCurso || dialogSelectedNrc.numeroCurso),
                aliasCurso: dialogSelectedNrc.AliasCurso || dialogSelectedNrc.aliasCurso,
                titulo: dialogSelectedNrc.AliasCurso || dialogSelectedNrc.aliasCurso,
                modoCalificar: dialogSelectedNrc.ModoCalificar || dialogSelectedNrc.modoCalificar,
                tipoPeriodo: dialogSelectedNrc.PartePeriodo || dialogSelectedNrc.tipoPeriodo,
                periodo: Number(dialogSelectedNrc.periodo),
                creditos: Number(dialogSelectedNrc.Creditos !== undefined ? dialogSelectedNrc.Creditos : dialogSelectedNrc.creditos),
                estado: dialogSelectedNrc.Estado !== undefined ? (dialogSelectedNrc.Estado === 'A' || dialogSelectedNrc.Estado === true) : (dialogSelectedNrc.estado ?? true),
                estadoNRC: false,
                usuarioModifica: "zamorano/imarin",
                hostModifica: "experience",
                fechaModifica: new Date().toISOString()
            };

            console.log('payload update', payload);

            const response = await putNrc.execute('/ZA/v1/Academic/nrcAHLocal', {
                method: 'PUT',
                body: payload
            });

            if (response) {
                setOpenAddEditDialog(false);
                setDialogSelectedNrc(null);
                getNrcAHLocalByTerm.execute(`/ZA/v1/Academic/nrcAHLocal/${selectTerm.code}`, { method: 'GET' });
            }
        } else {
            const payload = {
                idNRCAH: 0,
                nrc: Number(dialogSelectedNrc.NRC || dialogSelectedNrc.nrc),
                materia: dialogSelectedNrc.Materia || dialogSelectedNrc.materia,
                numeroCurso: Number(dialogSelectedNrc.NumeroCurso || dialogSelectedNrc.numeroCurso),
                aliasCurso: dialogSelectedNrc.AliasCurso || dialogSelectedNrc.aliasCurso,
                titulo: dialogSelectedNrc.AliasCurso || dialogSelectedNrc.aliasCurso,
                modoCalificar: dialogSelectedNrc.ModoCalificar || dialogSelectedNrc.modoCalificar,
                tipoPeriodo: dialogSelectedNrc.PartePeriodo || dialogSelectedNrc.tipoPeriodo,
                periodo: Number(dialogSelectedNrc.periodo),
                creditos: Number(dialogSelectedNrc.Creditos !== undefined ? dialogSelectedNrc.Creditos : dialogSelectedNrc.creditos),
                estado: dialogSelectedNrc.Estado !== undefined ? (dialogSelectedNrc.Estado === 'A' || dialogSelectedNrc.Estado === true) : (dialogSelectedNrc.estado ?? true),
                estadoNRC: false,
                usuarioCreador: "zamorano/imarin",
                hostCreador: "experience",
                fechaCreador: new Date().toISOString()
            };

            console.log('payload ADD', payload);

            const response = await postNrc.execute('/ZA/v1/Academic/nrcAHLocal', {
                method: 'POST',
                body: payload
            });

            if (response) {
                setOpenAddEditDialog(false);
                setDialogSelectedNrc(null);
                getNrcAHLocalByTerm.execute(`/ZA/v1/Academic/nrcAHLocal/${selectTerm.code}`, { method: 'GET' });
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingRow) return;

        const payload = {
            idNRCAH: deletingRow.idNRCAH,
            usuarioModifica: "zamorano/imarin",
            hostModifica: "experience"
        };

        const response = await deleteNrc.execute('/ZA/v1/Academic/nrcAHLocal', {
            method: 'DELETE',
            body: payload
        });

        if (response) {
            setOpenDeleteDialog(false);
            setDeletingRow(null);
            getNrcAHLocalByTerm.execute(`/ZA/v1/Academic/nrcAHLocal/${selectTerm.code}`, { method: 'GET' });
        }
    };

    const nrcColumns = [
        { field: 'idNRCAH', headerName: 'ID', align: 'center', width: '80px' },
        { field: 'nrc', headerName: 'NRC', align: 'center', width: '100px' },
        { field: 'materia', headerName: 'Materia', align: 'center', width: '100px' },
        { field: 'numeroCurso', headerName: 'Nº Curso', align: 'center', width: '100px' },
        { field: 'titulo', headerName: 'Título', minWidth: '200px' },
        {
            field: 'modoCalificar',
            headerName: 'Modo Calif.',
            align: 'center',
            width: '120px',
            renderCell: (row) => row.modoCalificar === 'N' ? 'Numérico' : row.modoCalificar
        },
        {
            field: 'tipoPeriodo',
            headerName: 'Tipo Periodo',
            align: 'center',
            width: '200px',
            renderCell: (row) => row.tipoPeriodo === 'LI1' ? 'PERIODO LICENCIATURA COMPLETO - LI1' : row.tipoPeriodo
        },
        { field: 'periodo', headerName: 'Periodo', align: 'center', width: '100px' },
        { field: 'creditos', headerName: 'Créditos', align: 'center', width: '90px' },
        {
            field: 'estado',
            headerName: 'Estado',
            align: 'center',
            width: '100px',
            renderCell: (row) => row.estado ? "Activo" : "Inactivo"
        },
        {
            field: 'estadoNRC',
            headerName: 'Estado NRC',
            align: 'center',
            width: '120px',
            renderCell: (row) => row.estadoNRC ? "Sincronizado" : "No Sincronizado"
        },
        {
            field: 'acciones',
            headerName: 'Acciones',
            align: 'center',
            width: '200px',
            renderCell: (row) => (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <Button
                        color="secondary"
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenUpdateDialog(row)}
                    >
                        Actualizar
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDeleteDialog(row)}
                    >
                        Eliminar
                    </Button>
                </div>
            )
        }
    ];


    const nrcGridData = getNrcAHLocalByTerm.data?.items || [];
    const concentratoraOptions = getNrcByConcentrator.data?.items || [];

    return (
        <div style={{ marginTop: '20px' }}>
            <p>
                Registrar NRC. Seleccione el período académico para consultar los NRCs disponibles.
            </p>

            {getTerms.error && (
                <Error alertText={`Error al obtener períodos académicos: ${getTerms.error}`} />
            )}

            {termsList && (
                <Grid container spacing={4} style={{ marginBottom: '20px' }}>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            id="termCodeSearch"
                            value={selectTerm}
                            options={termsList.filter(t => {
                                if (t.registration !== 'open') return false;
                                if (!t.endOn) return false;
                                const endDate = new Date(t.endOn);
                                const today = new Date();
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
                                    placeholder="Buscar el periodo académico abierto y que este en el rango de fechas"
                                    variant="outlined"
                                />
                            )}
                        />
                    </Grid>
                    {selectTerm && (
                        <Grid item xs={12} sm={6} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                            <Button
                                id="btnAddNrc"
                                color="primary"
                                variant="contained"
                                onClick={handleOpenAddDialog}
                            >
                                Agregar NRC
                            </Button>
                        </Grid>
                    )}
                </Grid>
            )}

            {getNrcAHLocalByTerm.loading && <Loading />}

            {getNrcAHLocalByTerm.error && (
                <Error alertText={`Error al obtener NRCs: ${getNrcAHLocalByTerm.error}`} />
            )}

            {!getNrcAHLocalByTerm.loading && nrcGridData.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <CustomDataGrid
                        columns={nrcColumns}
                        data={nrcGridData}
                        loading={getNrcAHLocalByTerm.loading}
                    />
                </div>
            )}

            {!getNrcAHLocalByTerm.loading && selectTerm && nrcGridData.length === 0 && !getNrcAHLocalByTerm.error && (
                <div style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                    No se encontraron registros de NRC para el período seleccionado.
                </div>
            )}

            {/* Diálogo para Agregar/Actualizar NRC */}
            <Dialog
                open={openAddEditDialog}
                onClose={() => setOpenAddEditDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{isEdit ? 'Actualizar NRC' : 'Agregar NRC'}</DialogTitle>
                <DialogContent>
                    <DialogContentText style={{ marginBottom: '15px' }}>
                        {isEdit
                            ? 'Seleccione el nuevo NRC de la concentradora para actualizar el registro.'
                            : 'Seleccione un NRC de la concentradora para registrarlo en este período.'
                        }
                    </DialogContentText>

                    {getNrcByConcentrator.loading && <Loading />}

                    {getNrcByConcentrator.error && (
                        <Error alertText={`Error al obtener NRCs de la concentradora: ${getNrcByConcentrator.error}`} />
                    )}

                    {postNrc.error && (
                        <Error alertText={`Error al registrar NRC: ${postNrc.error}`} />
                    )}

                    {putNrc.error && (
                        <Error alertText={`Error al actualizar NRC: ${putNrc.error}`} />
                    )}

                    {!getNrcByConcentrator.loading && !getNrcByConcentrator.error && (
                        <div style={{ marginTop: '15px', minHeight: '120px' }}>
                            <Autocomplete
                                id="dialogNrcSelect"
                                value={dialogSelectedNrc}
                                options={concentratoraOptions}
                                getOptionLabel={(option) => option ? `${option.NRC || option.nrc || ''} - ${option.AliasCurso || option.aliasCurso || ''} (${option.Materia || option.materia || ''}${option.NumeroCurso || option.numeroCurso || ''})` : ''}
                                fullWidth
                                label="NRC de Concentradora"
                                onChange={(event, newValue) => setDialogSelectedNrc(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Buscar por NRC, Materia o Título"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenAddEditDialog(false)}
                        color="secondary"
                        disabled={postNrc.loading || putNrc.loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        color="primary"
                        variant="contained"
                        disabled={!dialogSelectedNrc || getNrcByConcentrator.loading || postNrc.loading || putNrc.loading}
                    >
                        {postNrc.loading || putNrc.loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Confirmación para Eliminar */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>¿Confirmar eliminación de NRC?</DialogTitle>
                <DialogContent>
                    {deleteNrc.error && (
                        <Error alertText={`Error al eliminar: ${deleteNrc.error}`} />
                    )}
                    <DialogContentText>
                        ¿Está realmente seguro de que desea eliminar el NRC <strong>{deletingRow?.nrc}</strong> ({deletingRow?.materia}{deletingRow?.numeroCurso} - {deletingRow?.aliasCurso}) para el período <strong>{deletingRow?.periodo}</strong>?
                        <br /><br />
                        Esta acción es irreversible y removerá el registro.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        color="secondary"
                        disabled={deleteNrc.loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="secondary"
                        variant="contained"
                        disabled={deleteNrc.loading}
                    >
                        {deleteNrc.loading ? 'Eliminando...' : 'Confirmar y Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default NrcCrudTermCode;