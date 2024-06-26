import { parse } from 'node:url';
import { once } from "events";
import Person from "../entities/person.js";
import { DEFAULT_HEADERS } from "../utils/server_utils.js";
import { validatePersonByIdGET, validatePersonPost } from "./validators/personValidators.js";
import { PG_DUPLICATE_ENTRY_ERR_CODE, CreatePersonValidationError, GetPersonValidationError } from '../errors/errors.js';

const routes = ({ personService }) => ({
    person: {
        POST: async (req, res) => {
            try {
                const data = await once(req, 'data');
                const item = JSON.parse(data);
                validatePersonPost(item);
                const person = new Person(item);
                const id = person.id;
        
                await personService.create(person);
                const headers = {
                    ...DEFAULT_HEADERS,
                    'Location': `/person/${id}`
                };
                res.writeHead(201, headers);
                return res.end();
            } catch (err) {
                if (err.code === PG_DUPLICATE_ENTRY_ERR_CODE) {
                    res.writeHead(422, DEFAULT_HEADERS);
                    return res.end();
                }
                if (err instanceof CreatePersonValidationError) {
                    res.writeHead(400, DEFAULT_HEADERS);
                    res.write(err.message);
                    return res.end();
                }
                res.writeHead(500, DEFAULT_HEADERS);
                return res.end();
            }
        },
        GET: async (req, res) => {
            const { url } = req;
            const { pathname, query } = parse(url, true);
            const params = pathname.split('/');

            if (params.length > 2) {
                try {
                    const id = params[2];
                    validatePersonByIdGET(id, res);
                    const person = await personService.findById(id);
                    if (!person)
                        res.writeHead(404, DEFAULT_HEADERS);
                    else
                        res.write(JSON.stringify(person));
                    return res.end();
                } catch (err) {
                    if (err instanceof GetPersonValidationError) {
                        res.writeHead(400, DEFAULT_HEADERS);
                        res.write(err.message);
                        return res.end();
                    }
                    res.writeHead(500, DEFAULT_HEADERS);
                    return res.end();
                }
            } else {
                try {
                    const term = query['t'];
                    if (term) {
                        const people = await personService.findByTerm(term);
                        res.write(JSON.stringify(people));
                        return res.end();
                    } 
                } catch (err) {
                    res.writeHead(500, DEFAULT_HEADERS);
                    return res.end();
                }
            }
            res.writeHead(400, DEFAULT_HEADERS);
            return res.end()
        }
    },
    'person-count': {
        GET: async (req, res) => {
            try {
                const count = await personService.count();
                res.write(JSON.stringify(count));
                return res.end();
            } catch (err) {
                res.writeHead(500, DEFAULT_HEADERS);
                return res.end();
            }
        }
    }
});

export { routes };