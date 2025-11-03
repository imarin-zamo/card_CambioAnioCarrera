import React , {useState} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import {
    Tabs,
    Tab,
    Typography
} from '@ellucian/react-design-system/core';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import CambioAnioCarrera from './CambioAnioCarrera';
import CambioTipoGraduado from './CambioTipoGraduado';

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

const content ={
    'Cambio de Año de Carrera': <CambioAnioCarrera />,
    'Cambio de estudiantes a graduados': <CambioTipoGraduado />,
    //'All Students',
};

/**
 * Card Level Tabs without Scroll Buttons
 */
const CardLevelTabs = (props) => {
    const { classes } = props;
    console.log('CardLevelTabs props', classes);
  //  console.log('La data es ', Data)

    const [tab,setTab]=useState('Cambio de Año de Carrera');

    const handleChange=(event, value)=>{
        setTab(value)
    }

   return (
     <div>
        <Typography variant="h4">
            En esta tarjeta se pueden realizar diferentes procesos académicos, como el cambio de año de carrera y el cambio de estudiantes a graduados entre otros.
        </Typography>
        <Tabs value={tab} onChange={handleChange}>
            <Tab label="Cambio de Año de Carrera" value="Cambio de Año de Carrera" />
            <Tab label="Cambio de estudiantes a graduados" value="Cambio de estudiantes a graduados" />
            {/* <Tab label="All Students" value="All Students" /> */}

        </Tabs>
        <div>
            {content[tab]}
        </div>

     </div>
   )
};

CardLevelTabs.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(CardLevelTabs);