export const PG_DUPLICATE_ENTRY_ERR_CODE = "23505";
export const PERSON_CREATION_VALIDATION_ERR = "person-validation-err";

export class CreatePersonValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = PERSON_CREATION_VALIDATION_ERR;
    }
}

export class GetPersonValidationError extends Error {
    constructor({ code, message }) {
        super(message);
        this.code = code;
        this.name = PERSON_CREATION_VALIDATION_ERR;
    }
}