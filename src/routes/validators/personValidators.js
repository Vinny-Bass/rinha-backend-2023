import { PERSON_CREATION_VALIDATION_ERR, CreatePersonValidationError } from "../../errors/errors.js";
import { VALID_UUID_REGEX } from "../../utils/regex_utils.js";
import { DEFAULT_HEADERS } from "../../utils/server_utils.js";

export function validatePersonByIdGET(id, res)
{
    if (!id) {
        res.writeHead(400, DEFAULT_HEADERS);
        res.end('Person ID not provided');
    }

    if (!VALID_UUID_REGEX.test(id)) {
        res.writeHead(400, DEFAULT_HEADERS);
        res.end(`Invalid ID ${id}`);
    }
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (dateString.match(regex) === null) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

function areAllStrings(array) {
    return array.every(element => typeof element === 'string');
}

export function validatePersonPost(person, res) {
    if (!person) {
        res.writeHead(400, DEFAULT_HEADERS);
        res.end('Invalid JSON');
    }

    const { nickname, name, birth, stack } = person;
    
    if (!nickname || typeof nickname != "string" || nickname.length > 32)
        throw new CreatePersonValidationError({ code: PERSON_CREATION_VALIDATION_ERR, message: 'Invalid nickname' })

    if (!name || typeof name != "string" || name.length > 100){
        throw new CreatePersonValidationError({ code: PERSON_CREATION_VALIDATION_ERR, message: 'Invalid name' })
    }

    if (!birth || typeof birth != "string" || !isValidDate(birth))
        throw new CreatePersonValidationError({ code: PERSON_CREATION_VALIDATION_ERR, message: 'Invalid birth' })

    if (stack && (!Array.isArray(stack) || !areAllStrings(stack)))
        throw new CreatePersonValidationError({ code: PERSON_CREATION_VALIDATION_ERR, message: 'Invalid stack'})
}