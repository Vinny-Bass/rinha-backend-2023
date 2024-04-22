import { parse } from 'node:url';
import { DEFAULT_HEADERS } from './utils/server_utils.js';
import { routes } from './routes/personRoute.js';
import PG from './providers/postgres/db/db.js';
import { generateInstance } from './factories/personFactory.js'

const db = new PG();
const personService = generateInstance({ db });

const personRoutes = routes({ personService });

const allRoutes = {
    ...personRoutes,
    default: (req, res) => {
        res.writeHead(404, DEFAULT_HEADERS);
        //res.write('Route not found'); commenting errors info for performance
        res.end();
    }
}

async function handler(req, res) {
    const { url, method } = req;
    let { pathname } = parse(url, true);
    pathname = pathname.split('/')[1];
    const route = allRoutes[pathname][method] || allRoutes.default;

    await route(req, res);
}

export function closeDB() {
    db.pool.end();
}

export default handler;