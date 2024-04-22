export default class PersonService {
    constructor({ personProvider }) {
        this.personProvider = personProvider;
    }

    async create(data) {
        return this.personProvider.create(data);
    }

    async findById(id) {
        const { rows } = await this.personProvider.findById(id);
        return rows[0];
    }
}