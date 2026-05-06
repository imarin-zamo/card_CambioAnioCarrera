import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    TextField
} from "@ellucian/react-design-system/core";
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing30, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

const styles = () => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: spacing40,
        marginBottom: spacing40,
        padding: spacing30,
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        boxShadow: '0px 4px 20px rgba(0,0,0,0.06)',
    },
    toolbar: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20,
        marginBottom: spacing30,
    },
    toolbarSearch: {
        width: '100%',
    },
    toolbarActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
    },
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        overflowX: 'auto',
        boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
    },
    tableHead: {
        backgroundColor: '#00824C',
    },
    tableHeadCell: {
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        padding: spacing20,
    },
    tableCell: {
        padding: spacing20,
    },
    subCellContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    },
    subCellRow: {
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        flex: 1,
    },
    subCellRowLast: {
        display: 'flex',
        flex: 1,
    },
    subCellItem: {
        flex: 1,
        padding: spacing20,
        display: 'flex',
        alignItems: 'center',
    },
    subCellItemBordered: {
        flex: 1,
        padding: spacing20,
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing30,
        backgroundColor: '#f9f9f9',
        borderTop: '1px solid #eee'
    },
    paginationControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }
});

const PAGE_SIZES = [5, 10, 20, 50, 100];

const CustomDataGrid = ({ classes, columns, data, loading }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerTerm = searchTerm.toLowerCase();
        return data.filter(row => {
            return columns.some(col => {
                if (col.field && row[col.field]) {
                    // Para el array de modulos, buscar también en su interior
                    if (col.field === 'module' && Array.isArray(row.module)) {
                        return row.module.some(m => 
                            String(m.codeModule).toLowerCase().includes(lowerTerm) || 
                            String(m.grade).toLowerCase().includes(lowerTerm)
                        );
                    }
                    return String(row[col.field]).toLowerCase().includes(lowerTerm);
                }
                return false;
            });
        });
    }, [data, columns, searchTerm]);

    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        if (!filteredData || filteredData.length === 0) return;

        const headers = columns.map(col => `"${col.headerName}"`).join(",");
        
        const rows = filteredData.map(row => {
            return columns.map(col => {
                let val = "";
                if (col.field) {
                    val = row[col.field] ?? "";
                    if (col.field === 'module' && Array.isArray(val)) {
                        val = val.map(m => `${m.codeModule}: ${m.grade}`).join(" | ");
                    } else if (typeof val === 'object') {
                        val = JSON.stringify(val);
                    }
                }
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(",");
        });

        // Agregamos el BOM para que Excel detecte correctamente la codificación UTF-8
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_concentradora_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <Typography>Cargando datos...</Typography>;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className={classes.container}>
            <div className={classes.toolbar}>
                <div className={classes.toolbarSearch}>
                    <TextField
                        placeholder="Buscar en todos los campos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        fullWidth
                    />
                </div>
                <div className={classes.toolbarActions}>
                    <Button color="primary" onClick={exportToExcel} variant="contained">
                        Exportar a Excel (CSV)
                    </Button>
                </div>
            </div>

            <Paper className={classes.tableContainer} elevation={3}>
                <Table>
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableCell key={index} className={classes.tableHeadCell} style={{ color: '#fff' }}>
                                    {col.headerName}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <TableRow key={row.id || rowIndex} hover>
                                    {columns.map((col, colIndex) => {
                                        if (col.renderCell) {
                                            return (
                                                <TableCell key={colIndex} style={col.isSubCell ? { padding: 0, height: '100%' } : {}}>
                                                    {col.renderCell(row, classes)}
                                                </TableCell>
                                            );
                                        }
                                        return (
                                            <TableCell key={colIndex} className={classes.tableCell}>
                                                {row[col.field]}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: spacing40 }}>
                                    <Typography variant="body1">No se encontraron registros.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                
                <div className={classes.paginationContainer}>
                    <div>
                        <Typography variant="body2" color="textSecondary">
                            Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} de {totalRecords} registros
                        </Typography>
                    </div>
                    <div className={classes.paginationControls}>
                        <Typography variant="body2" style={{ marginRight: '8px' }}>Registros por página:</Typography>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '16px' }}
                        >
                            {PAGE_SIZES.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                        <Button 
                            variant="outlined" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </Button>
                        <Typography variant="body2" style={{ margin: '0 8px', fontWeight: 'bold' }}>
                            {currentPage} / {totalPages}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            </Paper>
        </div>
    );
};

CustomDataGrid.propTypes = {
    classes: PropTypes.object.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string,
            headerName: PropTypes.string.isRequired,
            renderCell: PropTypes.func,
            isSubCell: PropTypes.bool
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    loading: PropTypes.bool
};

export default withStyles(styles)(CustomDataGrid);
