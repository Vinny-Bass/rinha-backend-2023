import { randomUUID } from "crypto";

export default class Person {
    constructor({ nickname, name, birth, stack }) {
        this.id = randomUUID();
        this.nickname = nickname;
        this.name = name;
        this.birth = birth;
        this.stack = stack;
    }   
}