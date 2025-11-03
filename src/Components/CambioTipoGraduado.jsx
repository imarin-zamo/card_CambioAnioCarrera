import React  from 'react';
import PropTypes from 'prop-types';



const CambioTipoGraduado = (props) => {
    const { Classes  } = props;

    console.log('CambioTipoGraduado props', Classes);
    return (
        <div>
            <div>
                <h2>Cambio de Tipo de Graduado</h2>

            </div>
            <div>
                <p>
                    Esta tarjeta permite realizar el cambio de tipo de graduado de los estudiantes,
                    se debe de hacer despues de haber realizado el cierre de periodo académico
                    y ejecutado el CAPP para cada programa academico, que desea hacer el cambio.
                </p>
            </div>
        </div>
    );
}
CambioTipoGraduado.propTypes = {
    Classes: PropTypes.object.isRequired
};

export default CambioTipoGraduado;