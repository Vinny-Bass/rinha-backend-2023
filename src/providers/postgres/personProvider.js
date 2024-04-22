export default class PersonProvider {
    constructor({ db }) {
        this.db = db.getPool();
    }

    async create(data) {
        const { id, nickname, name, birth, stack } = data;
        const query = `
            INSERT INTO person(id, nickname, name, birth, stack)
            VALUES ($1, $2, $3, $4, $5::json)
        `;
        return this.db.query(query, [id, nickname, name, birth, JSON.stringify(stack)]);
    }

    async findById(id) {
        const query = `
            SELECT id, nickname, name, to_char(birth, 'YYYY-MM-DD') as birth, stack
            FROM person
            WHERE id = $1
        `;
        return this.db.query(query, [id]);
    }

    async findByTerm(term) {
        const query = `
            SELECT id, nickname, name, to_char(birth, 'YYYY-MM-DD') as birth, stack
            FROM person
            WHERE searchable ILIKE $1
            LIMIT 50;
        `;
        return this.db.query(query, [`%${term}%`]);
    }

    async count() {
        const query = `SELECT COUNT(1) FROM person`;
        return this.db.query(query);
    }
}
