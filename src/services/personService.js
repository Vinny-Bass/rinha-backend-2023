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

    async findByTerm(term) {
        return this.personProvider.findByTerm(term);
    }

    async count() {
        const { rows } = await this.personProvider.count();
        return rows[0].count;
    }
}