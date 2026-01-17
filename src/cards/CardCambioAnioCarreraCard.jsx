import React from 'react';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
//import { Calendar, ChevronRight } from '@ellucian/ds-icons/lib';
import { Button } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});
//Typography variant="h4"
const CardCambioAnioCarreraCard = (props) => {
    const { classes } = props;

    return (
        <div>

            <div className={classes.card}>
                <p>
                    Está tarjeta permite realizar diferentes procesos académicos masivos.
                </p>
                <br/>
                <br/>

                <Button
                    color="primary"
                    fluid
                    size="large"
                    variant="contained"
                >
                    Ir a procesos académicos
                </Button>
            </div>
        </div>
    );
};

CardCambioAnioCarreraCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CardCambioAnioCarreraCard);