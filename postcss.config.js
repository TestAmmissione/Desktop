// npm install cssnano --save-dev
// npm install postcss-preset-env --save-dev
// npm install postcss-cli --save-dev
// https://www.postcss.parts/
// https://cssnano.co/guides/presets/

module.exports = {
    plugins: [
        require('cssnano')({
            preset: [
                'default', {
                    discardComments: {
                        removeAll: true,
                    }
                },
            ]
        }),
        require('postcss-preset-env')({
            stage: false,
            features: [ 'css-nesting' ]
        })
    ],
};
/*
module.exports = {
    plugins: {
        'cssnano': {
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        },
        'postcss-preset-env': {
            stage: false,
            features: [ 'css-nesting' ]
        }
    }
};
*/