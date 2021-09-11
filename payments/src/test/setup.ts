import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

declare global {
    // namespace NodeJS {
    //     interface Global {
    //         signin(): string[];
    //     }
    // }
    var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = '123456';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) => {
    // Build JWT payload
    const payload = { id: id || new mongoose.Types.ObjectId().toHexString(), email: 'test@test.com' };
    // Create JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // Build session object
    const session = { jwt: token };
    // Turn it to JWT
    const sessionJSON = JSON.stringify(session);
    // Encode as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    // Return cookie string
    return [`express:sess=${base64}`];
}