import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Tabs, Tab } from '@ellucian/react-design-system/core';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

import NrcCrudTermCode from './NrcCrudTermCode';
import HistoryNrc from './HistoryNrc';

const styles = theme => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing(3),
        backgroundColor: theme.palette.background.paper,
    },
    cardContentRoot: {
        paddingTop: spacing40,
    },
});

const content = {
    'Sincronizar NRC': <NrcCrudTermCode />,
    'Historial de NRC': <HistoryNrc />,
    //'All Students',
};

/**
 * Card Level Tabs without Scroll Buttons
 */
const SubTabNrc = (props) => {
    const { classes } = props;
    console.log('SubTabNrc props', classes);

    const [tab, setTab] = useState('Sincronizar NRC');

    const handleChange = (event, value) => {
        setTab(value)
    }

    return (
        <div>
            {/* <h3>Bienvenido {userInfo} </h3> */}
            {/* <Typography variant="h3">
            </Typography> */}
            <Tabs value={tab} onChange={handleChange} indicatorColor="primary" textColor="primary">
                <Tab label="Sincronizar NRC" value="Sincronizar NRC" />
                <Tab style={{ fontSize: '1rem' }} label="Historial de NRC" value="Historial de NRC" />
                {/* <Tab label="All Students" value="All Students" /> */}

            </Tabs>
            <div>
                {content[tab]}
            </div>

        </div>
    )
};

SubTabNrc.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(SubTabNrc);