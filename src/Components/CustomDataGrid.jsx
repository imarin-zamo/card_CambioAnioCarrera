import React from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Typography,
} from "@ellucian/react-design-system/core";
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20 } from '@ellucian/react-design-system/core/styles/tokens';

const styles = () => ({
    tableContainer: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #eee',
        overflow: 'hidden',
        overflowX: 'auto',
        marginTop: spacing20,
        marginBottom: spacing20
    },
    tableHead: {
        backgroundColor: '#00824C',
    },
    tableHeadCell: {
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        fontSize: '0.875rem',
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
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
    },
    subCellItemBordered: {
        flex: 1,
        padding: '8px',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
    }
});

const CustomDataGrid = ({ classes, columns, data, loading }) => {

    if (loading) {
        return <Typography>Cargando datos...</Typography>;
    }

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Paper className={classes.tableContainer} elevation={2}>
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
                    {data.map((row, rowIndex) => (
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
                                    <TableCell key={colIndex}>
                                        {row[col.field]}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
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
