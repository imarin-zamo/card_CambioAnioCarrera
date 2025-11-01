module.exports = {
    name: 'CardCambioAnioCarrera',
    publisher: 'IAMS',
    cards: [{
        type: 'CardCambioAnioCarreraCard',
        source: './src/cards/CardCambioAnioCarreraCard',
        title: 'CardCambioAnioCarrera Card',
        displayCardType: 'CardCambioAnioCarrera Card',
        description: 'Esta tarjeta realizar el cambio de año de carrera del estudiante.',
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a','button','#Content']
        },
        // configuration: {
        //     client: [{
        //         key: 'myurl',
        //         label: 'ingresa Url'
        //         // type: 'url',
        //         // required: true
        //     }],
        //     server: [{
        //         key: 'ethosApiKey',
        //         label: 'Ingresa tu Ethos API Key',
        //         // type: 'url',
        //         required: true
        //     }]
        // },
    }],
    page: {
        source: './src/page/router.jsx'
    }
};