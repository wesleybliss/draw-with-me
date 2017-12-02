const defaultStylesConfig = [{
    css: {
        output: {
            comments: false
        },
        sourceMap: true
    }
}]

module.exports = {
    type: 'react-app',
    babel: {
        plugins: [
            'transform-react-pug',
            'transform-react-jsx'
        ]
    },
    webpack: {
        extra: {
            devtool: 'cheap-source-map'
        },
        styles: {
            css: defaultStylesConfig,
            stylus: defaultStylesConfig
        }
    }
}
