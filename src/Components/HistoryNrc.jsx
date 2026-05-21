import React, { useEffect } from 'react';
import { useZamoranoData } from '../hooks/useZamoranoData';
import CustomDataGrid from './CustomDataGrid';
import Loading from './Loading';

const HistoryNrc = () => {
    const getNrcAHLocalAll = useZamoranoData();

    // Consultar todo el historial al montar el componente
    useEffect(() => {
        getNrcAHLocalAll.execute('/ZA/v1/Academic/nrcAHLocal', { method: 'GET' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nrcColumns = [
        { field: 'idNRCAH', headerName: 'ID', align: 'center', width: '80px' },
        { field: 'nrc', headerName: 'NRC', align: 'center', width: '100px' },
        { field: 'materia', headerName: 'Materia', align: 'center', width: '100px' },
        { field: 'numeroCurso', headerName: 'Nº Curso', align: 'center', width: '100px' },
        {
            field: 'numeroAH',
            headerName: 'Nº AH',
            align: 'center',
            width: '100px',
            renderCell: (row) => `${row.materia?.trim() || ''}${row.numeroCurso || ''}`
        },
        { field: 'titulo', headerName: 'Título', minWidth: '125px' },
        { field: 'aliasCurso', headerName: 'Alias Curso', minWidth: '125px' },
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
            field: 'estadoNRC',
            headerName: 'Estado NRC',
            align: 'center',
            width: '120px',
            renderCell: (row) => row.estadoNRC ? "Activo" : "Inactivo"
        }
    ];

    const nrcGridData = getNrcAHLocalAll.data?.items || [];

    return (
        <div style={{ marginTop: '20px' }}>
            <p>
                Listado histórico completo de todos los NRCs Sincronizados.
            </p>

            {getNrcAHLocalAll.loading && <Loading />}

            {getNrcAHLocalAll.error && (
                <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>
                    Error al obtener el historial local: {getNrcAHLocalAll.error}
                </div>
            )}

            {!getNrcAHLocalAll.loading && nrcGridData.length > 0 && (
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <CustomDataGrid
                        columns={nrcColumns}
                        data={nrcGridData}
                        loading={getNrcAHLocalAll.loading}
                    />
                </div>
            )}

            {!getNrcAHLocalAll.loading && nrcGridData.length === 0 && !getNrcAHLocalAll.error && (
                <div style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                    No hay registros de historial de NRC local disponibles.
                </div>
            )}
        </div>
    );
};

export default HistoryNrc;