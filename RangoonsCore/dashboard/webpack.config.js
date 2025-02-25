const path = require('path');

module.exports = {
    entry: './src/index.js', // Your entry point for the application
    output: {
        filename: 'bundle.js', // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
        publicPath: '/' // Serve assets from the root
    },
    mode: 'development', // Set mode to development for better debugging
    devServer: {
        static: path.join(__dirname, 'public'), // Serve static files from public folder
        port: 8080, // Development server port
        hot: true, // Enable hot module replacement
        historyApiFallback: true // Redirect 404s to /index.html for SPA
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Process JavaScript files
                exclude: /node_modules/, // Exclude dependencies
                use: {
                    loader: 'babel-loader', // Transpile ES6+ code to ES5
                }
            },
            {
                test: /\.css$/, // Process CSS files
                use: [
                    'style-loader', // Inject styles into DOM
                    'css-loader', // Translate CSS into CommonJS
                    'postcss-loader' // Process CSS with PostCSS
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'] // Automatically resolve extensions
    },
    watchOptions: {
        ignored: /node_modules/ // Ignore watching files in node_modules
    }
};
