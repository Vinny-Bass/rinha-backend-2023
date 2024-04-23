import http from 'node:http';
import handler from './handler.js';

const PORT = process.env.HTTP_PORT || 8080;
export const server = http.createServer(handler)
    .listen(PORT, () => console.log(`server is running at ${PORT}`));