import http from 'node:http';
import cluster from 'node:cluster';
import handler from './handler.js';

const PORT = process.env.HTTP_PORT || 8080;
const TIMEOUT = process.env.REQ_TIMEOUT || 2000;
const numForks = Number(process.env.CLUSTER_WORKERS) || 5;

if (cluster.isPrimary && process.env.CLUSTER === 'true') {
    console.log(`index.js: Primary ${process.pid} is running`);
    for (let i = 0; i < numForks; i++)
        cluster.fork();
    cluster.on('exit', (worker, code, signal) => {
        console.log(`index.js: worker ${worker.process.pid} died: code ${code} signal ${signal}`);
    })
} else {
    const server = http.createServer(handler)
        .listen(PORT, () => console.log(`index.js:${process.pid} is running at ${PORT}`));
    
    if (process.env.USE_TIMEOUT === 'true') {
        server.setTimeout(TIMEOUT)
        console.log(`Starting with timeout as ${TIMEOUT}ms`)

        server.on('timeout', (socket) => {
            console.warn(`Timing out connection`);
            socket.end();
        })
    }
}