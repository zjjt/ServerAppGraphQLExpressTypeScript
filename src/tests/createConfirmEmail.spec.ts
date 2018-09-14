import makeDBconnexion from "../graphqlExpress/connectors";
import {createConfirmEmailLink} from "../utils/createConfirmEmailLink";
import {User} from "../graphqlExpress/typeORM/entity/User";
import * as Redis from 'ioredis';
import fetch from 'node-fetch';

let userId = "";
const redis = new Redis();
beforeAll(async() => {
    await makeDBconnexion();
    const user = await User
        .create({email: "test@test.com", password: "oeitjtjfkk34kd"})
        .save();
    userId = user.id;
});
describe("Confirmation mail to send to the newly created user", async() => {
    it("creates a dynamic url,make sure it confirm user and clear key in redis", async() => {

        const url = await createConfirmEmailLink((process.env.TEST_HOST as string), userId, redis);
        const response = await fetch(url);
        const text = await response.text();
        console.log(url);
        expect(text).toEqual("ok");
        const user = await User.findOne({
            where: {
                id: userId
            }
        });
        expect((user as User).confirmed).toBeTruthy();
        const urlSplittedBySlashes = url.split("/");
        const key = urlSplittedBySlashes[urlSplittedBySlashes.length - 1];
        const value = await redis.get(key);
        console.log("value = " + value);
        expect(value).toBeNull();

    });
});