import PersonProvider from "../providers/postgres/personProvider.js";
import PersonService from "../services/personService.js";

const generateInstance = ({ db }) => {
    const personProvider = new PersonProvider({ db });
    const personService = new PersonService({ personProvider });
    return personService;
}

export {
    generateInstance
}