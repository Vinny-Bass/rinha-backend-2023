import { GetPersonValidationError, CreatePersonValidationError } from "../../errors/errors.js";
import { VALID_UUID_REGEX } from "../../utils/regex_utils.js";
import { DEFAULT_HEADERS } from "../../utils/server_utils.js";

export function validatePersonByIdGET(id, res)
{
    if (!id)
        throw new GetPersonValidationError('No ID founded');

    if (!VALID_UUID_REGEX.test(id))
        throw new GetPersonValidationError('Invalid ID');
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
    
    if (!nickname || typeof nickname != "string" || nickname.length > 32) {
        console.log({ validationErr: 'Invalid nickname', person })
        throw new CreatePersonValidationError('Invalid nickname')
    }

    if (!name || typeof name != "string" || name.length > 100) {
        console.log({ validationErr: 'Invalid name', person })
        throw new CreatePersonValidationError('Invalid name')
    }

    if (!birth || typeof birth != "string" || !isValidDate(birth)) {
        console.log({ validationErr: 'Invalid birth', person })
        throw new CreatePersonValidationError('Invalid birth')
    }

    if (stack && (!Array.isArray(stack) || !areAllStrings(stack))) {
        console.log({ validationErr: 'Invalid stack', person })
        throw new CreatePersonValidationError('Invalid stack')
    }
}