import { mock, test } from 'node:test'
import assert from 'node:assert';


import { routes } from '../../../src/routes/personRoute.js';


test('Person routes - endpoint test suite', async (t) => {
    await t.test('it not should call the database if no id is provided', async () => {
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
        assert.strictEqual(mockFindById.mock.calls.length, 0, 'Should not have called findById');
        assert.strictEqual(res.end.mock.calls.length, 1, 'Should have called res.end only once');
    })

    await t.test('it should call findById if an id is provided as path parameter', async () => {
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
            writeHead: mock.fn((code, options) => null),
            end: mock.fn(() => null)
        };
        await endpoints.person.GET(req, res);
        assert.strictEqual(mockFindById.mock.calls.length, 1, 'Should have called findById only once');
        assert.strictEqual(res.end.mock.calls.length, 1, 'Should have called res.end only once');
    })
})