import test from "node:test";
import assert from "node:assert";
import { promisify } from "node:util";
import { CORRECT_LOCATION_REGEX } from "../../src/utils/regex_utils.js";
import { closeDB } from "../../src/handler.js";
import { randomUUID } from "node:crypto";

test('Person Integration Test Suite', async(t) => {
    const testPort = 9090;
    
    process.env.HTTP_PORT = testPort;
    const { server } = await import('../../src/server.js');

    const testServerAddress = `http://localhost:${testPort}`;
    let personID = "";
    const personNickname = "integration-test-" + randomUUID().split('-')[0];

    await t.test('it should create a person and return the correct location', async(t) => {
        const data = {
            "nickname" : personNickname,
            "name" : "Integration test",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        }

        const request = await fetch(`${testServerAddress}/person`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).catch();
        
        assert.match(
            request.headers.get('Location'),
            CORRECT_LOCATION_REGEX,
            'Invalid Location header after person creation'
        )

        assert.strictEqual(request.status, 201, 'Invalid status code after person creation');
        personID = request.headers.get('Location').split('/')[2];
    });

    await t.test('it should not create a person with the a duplicate key', async(t) => {
        const data = {
            "nickname" : personNickname,
            "name" : "José Roberto",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        }

        const request = await fetch(`${testServerAddress}/person`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).catch();

        assert.strictEqual(request.status, 422, 'Code for duplicate key should be 422');
    });

    await t.test('it should not create a person with wrong params', async(t) => {
        const data = {
            "nickname" : "unique",
            "name" : null,
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        }

        const request = await fetch(`${testServerAddress}/person`, {
            method: 'POST',
            body: JSON.stringify(data)
        }).catch();

        assert.strictEqual(request.status, 400, 'Code for invalid values should be 400');
    });

    await t.test('it should return not found on GET without ID', async(t) => {
        const request = await fetch(`${testServerAddress}/person`, {
            method: 'GET'
        }).catch();

        assert.strictEqual(request.status, 400, 'Should return 400 for get person without ID on path parameter');
    });

    await t.test('it should get a person by id', async(t) => {
        const data = {
            "id": personID,
            "nickname" : personNickname,
            "name" : "Integration test",
            "birth" : "2000-10-01",
            "stack" : ["C#", "Node", "Oracle"]
        }

        const request = await fetch(`${testServerAddress}/person/${personID}`, {
            method: 'GET'
        }).catch();

        assert.strictEqual(request.status, 200, 'Should return 200 for get person success');
        const person = await request.json();
        assert.deepEqual(person, data, 'Should return 200 for get person success');
    });

    await t.test('it should return 400 for an invalid or inexistent ID', async(t) => {
        const request = await fetch(`${testServerAddress}/person/invalid`, {
            method: 'GET'
        }).catch();

        assert.strictEqual(request.status, 400, 'Should return 400 for bad request');
    });

    await t.test('it should get the count of persons', async(t) => {
        const request = await fetch(`${testServerAddress}/person-count`, {
            method: 'GET'
        }).catch();

        assert.strictEqual(request.status, 200, 'Should return 200 for get person success');
        const count = await request.json();
        assert.match(count, /^-?\d+$/, 'Should return a count number');
    });

    closeDB();
    await promisify(server.close.bind(server))()
})