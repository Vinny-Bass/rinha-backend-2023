import { parse } from 'node:url';
import { once } from "events";
import Person from "../entities/person.js";
import { DEFAULT_HEADERS } from "../utils/server_utils.js";
import { validatePersonByIdGET, validatePersonPost } from "./validators/personValidators.js";
import { PG_DUPLICATE_ENTRY_ERR_CODE, CreatePersonValidationError } from '../errors/errors.js';

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
            const { pathname } = parse(url, true);
            const params = pathname.split('/');

            if (params.length > 2) {
                const id = params[2];
                validatePersonByIdGET(id, res);
                try {
                    const person = await personService.findById(id);
                    if (!person)
                        res.writeHead(404, DEFAULT_HEADERS);
                    else
                        res.write(JSON.stringify(person));
                } catch (err) {
                    console.log('Error trying to find a person', err);
                }
            }

            return res.end();
        }
    }
});

export { routes };