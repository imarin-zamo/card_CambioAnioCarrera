import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    makeStyles,
    spacing40,
    spacing20
} from "@ellucian/react-design-system/core";
import Loading from "./Loading"; // using the existing Loading component
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

//Componente para la tabla de datos, creado por Ariel Marin.

const useStyles = makeStyles()(() => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing20,
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #eee',
        marginBottom: spacing20
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #eee',
        overflow: 'hidden',
        overflowX: 'auto',
        minHeight: '400px'
    },
    tableHead: {
        backgroundColor: '#00824C',
        fontFamily: "'Open Sans', sans-serif",
    },
    tableHeadCell: {
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `0 ${spacing20}`,
        marginTop: spacing20
    },
    filterPopup: {
        position: 'absolute',
        zIndex: 10,
        marginTop: '8px',
        width: '240px',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: spacing20,
        boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
        backgroundColor: '#fff'
    },
    filterItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        cursor: 'pointer'
    }
}));

export function DataTableCustom({
    data,
    columns,
    totalRecords: externalTotal,
    currentPage: externalPage,
    pageSize: externalPageSize,
    onPageChange: externalOnPageChange,
    onPageSizeChange: externalOnPageSizeChange,
    searchTerm: externalSearchTerm,
    onSearchChange: externalOnSearchChange,
    searchPlaceholder = "Buscar...",
    onCreate,
    createButtonLabel = "Crear Nuevo",
    loading = false,
    exportTitle = "Reporte de Datos", // Nuevo prop por defecto
}) {
    const { classes } = useStyles();
    const isServerPaginated = externalTotal !== undefined && externalPage !== undefined;

    const [internalPage, setInternalPage] = useState(1);
    const [internalPageSize, setInternalPageSize] = useState(externalPageSize || 10);
    const [internalSearch, setInternalSearch] = useState("");
    const [columnFilters, setColumnFilters] = useState({});
    const [openFilterColId, setOpenFilterColId] = useState(null);

    // 1. Filtrar globalmente
    const globalFilteredData = useMemo(() => {
        if (isServerPaginated) return data;

        let filtered = data;
        const term = (externalSearchTerm ?? internalSearch).toLowerCase();

        if (term) {
            filtered = filtered.filter(item => {
                return Object.values(item).some(val =>
                    String(val).toLowerCase().includes(term)
                );
            });
        }
        return filtered;
    }, [data, isServerPaginated, externalSearchTerm, internalSearch]);

    // 2. Extraer opciones únicas para el filtro de columnas
    const columnFilterOptions = useMemo(() => {
        const options = {};
        columns.forEach(col => {
            const colId = col.id || String(col.accessorKey);
            if (col.enableColumnFilter && colId) {
                const uniqueValues = new Set();
                globalFilteredData.forEach(item => {
                    let val = "";
                    if (col.getFilterValue) {
                        val = col.getFilterValue(item);
                    } else if (col.accessorKey) {
                        val = String(item[col.accessorKey] || "");
                    }
                    if (val) uniqueValues.add(val);
                });
                options[colId] = Array.from(uniqueValues).sort();
            }
        });
        return options;
    }, [globalFilteredData, columns]);

    // 3. Aplicar filtros de columna (Checklists)
    const columnFilteredData = useMemo(() => {
        if (isServerPaginated) return globalFilteredData;

        if (Object.keys(columnFilters).length === 0) return globalFilteredData;

        return globalFilteredData.filter(item => {
            return Object.entries(columnFilters).every(([colId, selectedValues]) => {
                if (!selectedValues || selectedValues.length === 0) return true;

                const column = columns.find(c => (c.id || String(c.accessorKey)) === colId);
                if (!column) return true;

                if (column.filterFn) {
                    return column.filterFn(item, selectedValues);
                }

                let val = "";
                if (column.getFilterValue) {
                    val = column.getFilterValue(item);
                } else if (column.accessorKey) {
                    val = String(item[column.accessorKey] || "");
                }

                return selectedValues.includes(val);
            });
        });
    }, [globalFilteredData, columnFilters, columns, isServerPaginated]);

    // 4. Paginar localmente si es necesario
    const paginatedData = useMemo(() => {
        if (isServerPaginated) return data;
        const size = externalPageSize ?? internalPageSize;
        const start = (internalPage - 1) * size;
        return columnFilteredData.slice(start, start + size);
    }, [data, isServerPaginated, externalPageSize, internalPageSize, internalPage, columnFilteredData]);

    const computedData = isServerPaginated ? data : paginatedData;
    const computedTotal = isServerPaginated ? externalTotal : columnFilteredData.length;
    const computedPage = isServerPaginated ? externalPage : internalPage;
    const computedPageSize = externalPageSize ?? internalPageSize;
    const computedTotalPages = Math.ceil(computedTotal / computedPageSize) || 1;

    const handlePageChange = (page) => {
        if (externalOnPageChange) externalOnPageChange(page);
        else setInternalPage(page);
    };

    const handlePageSizeChange = (e) => {
        const size = Number(e.target.value);
        if (externalOnPageSizeChange) externalOnPageSizeChange(size);
        else {
            setInternalPageSize(size);
            setInternalPage(1);
        }
    };

    const handleSearchChange = (term) => {
        if (externalOnSearchChange) externalOnSearchChange(term);
        else {
            setInternalSearch(term);
            setInternalPage(1);
        }
    };

    const handleFilterChange = (colId, value) => {
        setColumnFilters(prev => {
            const current = prev[colId] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];

            const newFilters = { ...prev, [colId]: updated };
            if (updated.length === 0) delete newFilters[colId];

            return newFilters;
        });
        setInternalPage(1);
    };

    const handleSelectAll = (colId, options) => {
        setColumnFilters(prev => {
            const current = prev[colId] || [];
            if (current.length === options.length) {
                const updated = { ...prev };
                delete updated[colId];
                return updated;
            } else {
                return { ...prev, [colId]: [...options] };
            }
        });
        setInternalPage(1);
    };

    const toggleFilterMenu = (colId) => {
        setOpenFilterColId(prev => prev === colId ? null : colId);
    };

    /**
     * Genera un archivo PDF con los datos actualmente filtrados 
     * mostrados en la vista del usuario.
     */
    const exportToPDF = () => {
        // Inicializar documento PDF
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(15);
        doc.text("Historial de Citas Médicas", 14, 15);

        doc.setFontSize(13);
        doc.text(exportTitle, 14, 22);

        doc.setFont("Arial", "normal");
        doc.setFontSize(11);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 29);

        // Preparar cabeceras de columnas validas (que tengan header)
        const tableColumns = columns.map(col => col.header);

        // Preparar las filas recorriendo el columnFilteredData (data con filtros aplicados pero sin paginar)
        const tableRows = columnFilteredData.map(item => {
            return columns.map(col => {
                if (col.cell) {
                    // Evaluar la funcion cell para extraer el string puro
                    // NOTA: jsPDF autotable necesita strings o numeros planados, si `cell` retornaba HTML complejo podria romperse.

                    return String(col.cell(item) || "");
                } else if (col.accessorKey) {
                    return String(item[col.accessorKey] || "");
                }
                return "";
            });
        });

        //console.log(tableRows)
        //console.log(tableColumns)

        // Configurar y dibujar tabla
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 30, // Dibujar debajo del titulo
            theme: 'striped',
            headStyles: { fillColor: [0, 130, 76] }, // Color verde oscuro de tu header
            styles: {
                fontSize: 9,
                cellPadding: 3,
                font: 'helvetica'
            },
        });

        // Generar descarga
        doc.save('ReporteHistorialMedico.pdf');
    };

    return (
        <Box className={classes.container}>
            {/* --- BARRA DE HERRAMIENTAS --- */}
            <Box className={classes.toolbar}>
                <Box style={{ width: '100%', maxWidth: '300px' }}>
                    <TextField
                        placeholder={searchPlaceholder}
                        value={externalSearchTerm ?? internalSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        fullWidth
                        type="search"
                    />
                </Box>
                <Box display="flex" gridGap={spacing20}>
                    <Button style={{ className: "hover:bg-orange-500", fontSize: '12px' }} color="primary" onClick={exportToPDF}>
                        Exportar a PDF
                    </Button>
                    {onCreate && (
                        <Button style={{ fontSize: '12px' }} color="primary" onClick={onCreate}>
                            {createButtonLabel}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* --- TABLA --- */}
            <Paper className={classes.tableContainer} elevation={2}>
                <Table>
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            {columns.map((col, index) => {
                                const colId = col.id || String(col.accessorKey);
                                const isFiltered = columnFilters[colId] && columnFilters[colId].length > 0;
                                const filterOptions = columnFilterOptions[colId] || [];

                                return (
                                    <TableCell key={index} className={classes.tableHeadCell} style={{ color: '#fff' }}>
                                        <Box display="flex" alignItems="center" justifyContent="space-between">
                                            {col.header}
                                            {col.enableColumnFilter && !isServerPaginated && (
                                                <Box style={{ position: 'relative' }}>
                                                    <Button
                                                        variant="text"
                                                        style={{
                                                            color: isFiltered ? '#ff3300ff' : '#fff',
                                                            fontSize: '10px',
                                                            border: '1px solid',
                                                            borderColor: isFiltered ? '#ff3300ff' : '#fff',
                                                            padding: '2px 6px',
                                                            minWidth: 'auto',
                                                            height: 'auto'
                                                        }}
                                                        onClick={() => toggleFilterMenu(colId)}
                                                    >
                                                        FILTRAR
                                                    </Button>
                                                    {openFilterColId === colId && (
                                                        <Paper className={classes.filterPopup}>
                                                            <Box
                                                                className={classes.filterItem}
                                                                style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}
                                                            >
                                                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        style={{ marginRight: '8px', cursor: 'pointer' }}
                                                                        checked={columnFilters[colId]?.length === filterOptions.length && filterOptions.length > 0}
                                                                        onChange={() => handleSelectAll(colId, filterOptions)}
                                                                    />
                                                                    <Typography variant="body2" style={{ fontWeight: 'bold', color: "#333" }}>(Seleccionar Todos)</Typography>
                                                                </label>
                                                            </Box>
                                                            {filterOptions.length === 0 && <Typography variant="caption" color="textSecondary">No hay valores</Typography>}
                                                            {filterOptions.map(option => {
                                                                const isSelected = columnFilters[colId]?.includes(option);
                                                                return (
                                                                    <Box
                                                                        key={option}
                                                                        className={classes.filterItem}
                                                                    >
                                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                style={{ marginRight: '8px', cursor: 'pointer' }}
                                                                                checked={isSelected}
                                                                                onChange={() => handleFilterChange(colId, option)}
                                                                            />
                                                                            <Typography variant="body2" style={{ color: "#333" }}>{option}</Typography>
                                                                        </label>
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Paper>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} style={{ textAlign: 'center', height: '128px' }}>
                                    <Loading />
                                </TableCell>
                            </TableRow>
                        ) : computedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} style={{ textAlign: 'center', height: '96px', color: '#666' }}>
                                    NO SE ENCONTRARON REGISTROS.
                                </TableCell>
                            </TableRow>
                        ) : (
                            computedData.map((item, idx) => (
                                <TableRow key={item.id || idx} hover>
                                    {columns.map((col, index) => (
                                        <TableCell key={index} className={col.className || ''}>
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? String(item[col.accessorKey] ?? '')
                                                    : null
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* --- PAGINACIÓN --- */}
            <Box className={classes.pagination}>
                <Typography variant="body2" color="textSecondary">
                    Mostrando {Math.min((computedPage - 1) * computedPageSize + 1, computedTotal) || 0} a {Math.min(computedPage * computedPageSize, computedTotal)} de <span style={{ fontWeight: 'bold' }}>{computedTotal}</span> resultados
                </Typography>

                <Box display="flex" alignItems="center" gridGap={spacing40}>
                    <Box display="flex" alignItems="center">
                        <Typography variant="body2" style={{ marginRight: '8px' }}>Filas:</Typography>
                        <select
                            value={computedPageSize}
                            onChange={handlePageSizeChange}
                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {[5, 10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </Box>

                    <Box display="flex" alignItems="center" gridGap={spacing20}>
                        <Button
                            variant="outlined"
                            onClick={() => handlePageChange(computedPage - 1)}
                            disabled={computedPage <= 1}
                            style={{ fontWeight: 'bold', minWidth: '40px', padding: '4px 8px' }}
                        >
                            {"<"}
                        </Button>
                        <Typography variant="body2" style={{ minWidth: '48px', textAlign: 'center', fontWeight: 'bold' }}>
                            {computedPage} / {computedTotalPages}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => handlePageChange(computedPage + 1)}
                            disabled={computedPage >= computedTotalPages}
                            style={{ fontWeight: 'bold', minWidth: '40px', padding: '4px 8px' }}
                        >
                            {">"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

DataTableCustom.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    totalRecords: PropTypes.number,
    currentPage: PropTypes.number,
    pageSize: PropTypes.number,
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    searchTerm: PropTypes.string,
    onSearchChange: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    onCreate: PropTypes.func,
    createButtonLabel: PropTypes.string,
    loading: PropTypes.bool,
    exportTitle: PropTypes.string
};

export default DataTableCustom;
