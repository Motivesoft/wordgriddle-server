const http = require('http');
const fs = require('fs');
const path = require('path');

// Get command-line arguments. Slice(2) is because args 0 and 1 are the node executable and this script file
const args = process.argv.slice(2);

// Look for switches
const helpArg = args.find(arg => (arg == '--help' || arg == '-h'));
const hostnameArg = args.find(arg => arg.startsWith('--hostname='));
const portArg = args.find(arg => arg.startsWith('--port='));
const publicFolderArg = args.find(arg => arg.startsWith('--public='));

if (helpArg) {
    console.log("Usage:");
    console.log("  node server.js [args]");
    console.log();
    console.log("Arguments (and defaults):");
    console.log("  --hostname=localhost     -- host name for the server");
    console.log("  --port=3000              -- port to serve pages from");
    console.log("  --public=./site          -- directory containing content");
    console.log("  --help, -h               -- this help information");
    return
}

// Look for hostname or use default (localhost)
const hostname = hostnameArg
    ? hostnameArg.split('=')[1]
    : "localhost";

// Look for port or use default (3000)
const port = parseInt(portArg
    ? portArg.split('=')[1]
    : 3000);

// Set default public folder or use the provided argument
const publicFolder = publicFolderArg
    ? publicFolderArg.split('=')[1]
    : path.join(__dirname, 'site');

const server = http.createServer((req, res) => {
    let filePath = path.join(publicFolder, req.url === '/' ? 'index.html' : req.url);
    let contentType = 'text/html';
    let extname = path.extname(filePath);

    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        logDebug(`Reading: ${filePath} (${contentType})`);

        if (err) {
            logError(`Server error: ${err.code}`);

            if (err.code === 'ENOENT') {
                // Page not found
                fs.readFile(path.join(__dirname, 'site', '404.html'), (err, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            logDebug(`Serving: ${filePath}`);
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

server.listen(port, hostname, () => {
    logInfo(`Server running at http://${hostname}:${port}/`);
    logDebug(`Serving files from: ${publicFolder}`);
});

// Helper functions

function logDebug( message ) {
    log( "DEBUG", message );
}

function logInfo( message ) {
    log( "INFO ", message );
}

function logWarning( message ) {
    log( "WARN ", message );
}

function logError( message ) {
    log( "ERROR", message );
}

function log( level, message ) {
    console.log( `${level}: ${message}` );
}