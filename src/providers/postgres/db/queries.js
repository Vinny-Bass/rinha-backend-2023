const CREATE_TABLES_QUERY = `
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    CREATE OR REPLACE FUNCTION generate_searchable(_nickname VARCHAR, _name VARCHAR, _stack JSON)
        RETURNS TEXT AS $$
        BEGIN
        RETURN _nickname || _name || _stack;
        END;
    $$ LANGUAGE plpgsql IMMUTABLE;

    CREATE TABLE IF NOT EXISTS person (
        id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
        nickname VARCHAR(32) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        birth DATE NOT NULL,
        stack JSON,
        searchable TEXT GENERATED ALWAYS AS (generate_searchable(nickname, name, stack)) STORED
    );

    CREATE INDEX IF NOT EXISTS idx_searchable ON person USING GIN (searchable gin_trgm_ops);
`

export {
    CREATE_TABLES_QUERY
}