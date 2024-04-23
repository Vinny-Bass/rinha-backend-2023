import { mock, test } from 'node:test'
import EventEmitter from 'node:events';
import assert from 'node:assert';
import { routes } from '../../../src/routes/personRoute.js';
import { CreatePersonValidationError, PG_DUPLICATE_ENTRY_ERR_CODE } from '../../../src/errors/errors.js';
import { CORRECT_LOCATION_REGEX, VALID_UUID_REGEX } from '../../../src/utils/regex_utils.js';

test('Person routes - GET', async (t) => {
    await t.test('GET - it not should call the database if no id is provided', async () => {
        const mockFindById = mock.fn(async (id) => null);
        const personServiceStub = {
            findById: mockFindById
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        const req = { url: '/person' };
        const res = {
            write: mock.fn((item) => null),
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };
        await endpoints.person.GET(req, res);
        assert.strictEqual(mockFindById.mock.callCount(), 0, 'Should not have called findById');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should have called res.end only once');
    })

    await t.test('GET - it should call findById if an id is provided as path parameter', async () => {
        const mockID = 'c26586a9-872a-490d-a2b8-31c5ff781609';
        const mockData = {
            "id": mockID,
            "nickname" : "josé",
            "name" : "José Roberto",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        };

        const mockFindById = mock.fn(async (id) => mockData);
        const personServiceStub = {
            findById: mockFindById
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        const req = { url: `/person/${mockID}` };
        const res = {
            write: mock.fn((item) => null),
            end: mock.fn(() => null)
        };
        await endpoints.person.GET(req, res);
        assert.strictEqual(mockFindById.mock.callCount(), 1, 'Should have called findById only once');
        assert.strictEqual(mockFindById.mock.calls[0].arguments[0], mockID, `Should have called findById with ${mockID}`);
        assert.strictEqual(res.write.mock.callCount(), 1, 'Should have called the write function');
        assert.deepStrictEqual(res.write.mock.calls[0].arguments[0], JSON.stringify(mockData), 'Should have called the write function with the correct params');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should have called res.end only once');
    })

    await t.test('GET - it should call findByTerm is the queryString is correct', async () => {
        const mockID = 'c26586a9-872a-490d-a2b8-31c5ff781609';
        const mockTerm = 'Node';
        const mockData = [{
            "id": mockID,
            "nickname" : "josé",
            "name" : "José Roberto",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        }];

        const mockFindByTerm = mock.fn(async (id) => mockData);
        const mockFindById = mock.fn(async (id) => mockData);
        const personServiceStub = {
            findByTerm: mockFindByTerm,
            findById: mockFindById
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        const req = { url: `/person?t=${mockTerm}` };
        const res = {
            write: mock.fn((item) => null),
            end: mock.fn(() => null)
        };
        await endpoints.person.GET(req, res);
        assert.strictEqual(mockFindById.mock.callCount(), 0, 'Should not have called findById');
        assert.strictEqual(mockFindByTerm.mock.callCount(), 1, 'Should have called findByTerm only once');
        assert.strictEqual(mockFindByTerm.mock.calls[0].arguments[0], mockTerm, `Should have called findByTerm with ${mockTerm}`);
        assert.strictEqual(res.write.mock.callCount(), 1, 'Should have called the write function');
        assert.deepStrictEqual(res.write.mock.calls[0].arguments[0], JSON.stringify(mockData), 'Should have called the write function with the correct params');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should have called res.end only once');
    })

    await t.test('GET - it should return 200 even if there is no matches', async () => {
        const mockTerm = 'Node';
        const mockData = [];

        const mockFindByTerm = mock.fn(async (id) => mockData);
        const mockFindById = mock.fn(async (id) => mockData);
        const personServiceStub = {
            findByTerm: mockFindByTerm,
            findById: mockFindById
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        const req = { url: `/person?t=${mockTerm}` };
        const res = {
            write: mock.fn((item) => null),
            end: mock.fn(() => null)
        };
        await endpoints.person.GET(req, res);
        assert.strictEqual(mockFindById.mock.callCount(), 0, 'Should not have called findById');
        assert.strictEqual(mockFindByTerm.mock.callCount(), 1, 'Should have called findByTerm only once');
        assert.strictEqual(mockFindByTerm.mock.calls[0].arguments[0], mockTerm, `Should have called findByTerm with ${mockTerm}`);
        assert.strictEqual(res.write.mock.callCount(), 1, 'Should have called the write function');
        assert.deepStrictEqual(res.write.mock.calls[0].arguments[0], JSON.stringify(mockData), 'Should have called the write function with the correct params');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should have called res.end only once');
    })
})

test('Person routes - POST', async(t) => {
    await t.test('POST - should return the correct status if request body is invalid', async () => {
        const mockData = JSON.stringify({
            "nickname" : "josé",
            "name" : null,
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        });

        const req = new EventEmitter();
        const res = {
            write: mock.fn((item) => null),
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };

        process.nextTick(() => {
            req.emit('data', mockData);
            req.emit('end');
        });

        const mockCreate = mock.fn(async (person) => null);
        const personServiceStub = {
            create: mockCreate
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        await endpoints.person.POST(req, res);
        assert.strictEqual(mockCreate.mock.callCount(), 0, 'Should not call person create');
        assert.strictEqual(res.writeHead.mock.callCount(), 1, 'Should call writeHead once');
        assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 400, 'Should call writeHead with 400 code');
        assert.strictEqual(res.write.mock.callCount(), 1, 'Should call write once');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should call end once');
    })

    await t.test('POST - should return the correct status if the person already exists', async () => {
        const mockData = JSON.stringify({
            "nickname" : "josé",
            "name" : "Some name",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        });

        const req = new EventEmitter();
        const res = {
            write: mock.fn((item) => null),
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };

        process.nextTick(() => {
            req.emit('data', mockData);
            req.emit('end');
        });

        const mockCreate = mock.fn(async (person) => {
            throw new CreatePersonValidationError({ code: PG_DUPLICATE_ENTRY_ERR_CODE, message: "" });
        });
        const personServiceStub = {
            create: mockCreate
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        await endpoints.person.POST(req, res);
        assert.strictEqual(mockCreate.mock.callCount(), 1, 'Should call person create');
        assert.strictEqual(res.writeHead.mock.callCount(), 1, 'Should call writeHead once');
        assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 422, 'Should call writeHead with 422 code');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should call end once');
    })

    await t.test('POST - should return 500 for undefined error', async () => {
        const mockData = JSON.stringify({
            "nickname" : "josé",
            "name" : "Some name",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        });

        const req = new EventEmitter();
        const res = {
            write: mock.fn((item) => null),
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };

        process.nextTick(() => {
            req.emit('data', mockData);
            req.emit('end');
        });

        const mockCreate = mock.fn(async (person) => {
            throw new Error();
        });
        const personServiceStub = {
            create: mockCreate
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        await endpoints.person.POST(req, res);
        assert.strictEqual(mockCreate.mock.callCount(), 1, 'Should call person create');
        assert.strictEqual(res.writeHead.mock.callCount(), 1, 'Should call writeHead once');
        assert.strictEqual(res.writeHead.mock.calls[0].arguments[0], 500, 'Should call writeHead with 422 code');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should call end once');
    })

    await t.test('POST - should reach the person creation service', async () => {
        const mockData = JSON.stringify({
            "nickname" : "josé",
            "name" : "Some name",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        });

        const req = new EventEmitter();
        const res = {
            write: mock.fn((item) => null),
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };

        process.nextTick(() => {
            req.emit('data', mockData);
            req.emit('end');
        });

        const mockCreate = mock.fn(async (person) => null);
        const personServiceStub = {
            create: mockCreate
        };

        const endpoints = routes({
            personService: personServiceStub
        });

        await endpoints.person.POST(req, res);
        assert.strictEqual(mockCreate.mock.callCount(), 1, 'Should call person create');
        const { id, ...mockArgs} = mockCreate.mock.calls[0].arguments[0];
        assert.match(id, VALID_UUID_REGEX, 'Person generated ID should be a valid UUID');
        assert.deepEqual(mockArgs, JSON.parse(mockData), 'Invalid person creation args passed');
        assert.strictEqual(res.writeHead.mock.callCount(), 1, 'Should call writeHead once');
        const [statusCode, headers] = res.writeHead.mock.calls[0].arguments;
        assert.strictEqual(statusCode, 201, 'Should call writeHead with 201 code');
        assert.match(headers['Location'], CORRECT_LOCATION_REGEX, 'Location header should be correct');
        assert.strictEqual(res.end.mock.callCount(), 1, 'Should call end once');
    })
})