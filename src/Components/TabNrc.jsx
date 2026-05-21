import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Tabs, Tab } from '@ellucian/react-design-system/core';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';


import Concentradora from './Concentradora';
import SubTabNrc from './SubTabNrc';

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
    'Concentradora': <Concentradora />,
    'NRC': <SubTabNrc />,
    //'All Students',
};

/**
 * Card Level Tabs without Scroll Buttons
 */
const TabNrc = (props) => {
    const { classes } = props;
    console.log('TabConcentradora props', classes);

    const [tab, setTab] = useState('Concentradora');

    const handleChange = (event, value) => {
        setTab(value)
    }

    return (
        <div>
            {/* <h3>Bienvenido {userInfo} </h3> */}
            {/* <Typography variant="h3">
            </Typography> */}
            <Tabs value={tab} onChange={handleChange}>
                <Tab label="Concentradora" value="Concentradora" />
                <Tab label="NRC" value="NRC" />
                {/* <Tab label="All Students" value="All Students" /> */}

            </Tabs>
            <div>
                {content[tab]}
            </div>

        </div>
    )
};

TabNrc.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(TabNrc);