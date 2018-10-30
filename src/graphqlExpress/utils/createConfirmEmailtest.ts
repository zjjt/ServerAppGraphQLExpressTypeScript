import makeDBconnexion from "../connectors";
import {createConfirmEmailLink} from "../utils/createConfirmEmailLink";
import {User} from "../typeORM/entity/User";
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
    test("Make sure it confirms user and clear key in redis", async() => {

        const url = await createConfirmEmailLink((process.env.TEST_HOST as string), userId, redis);
        const response = await fetch(url);
        const text = await response.text();
        // console.log(url);
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
        expect(value).toBeNull();

    });

    test("sends invalid back if wrong id is given through the url", async() => {
        const response = await fetch(`${process.env.TEST_HOST}/confirm-user/hhiyiggjjbjygiyo`);
        const text = await response.text();
        // console.log(url);
        expect(text).toEqual("invalid");
    });
});