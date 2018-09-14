import {request} from 'graphql-request';
// import {host} from '../settings';
import {duplicateEmail, emailNotValid, emailNotLongEnough, passwordNotLongEnough} from '../utils/errorMessages';
import makeDBconnexion from '../graphqlExpress/connectors';
import {User} from '../graphqlExpress/typeORM/entity/User';

const email = "itemail2gp5@gmail.com";
const password = "oiuyi4o54";
const mutation = (e : string, p : string) => `
    mutation{
        createUser(email:"${e}",password:"${p}"){
            path
            message
        }
    }
`
beforeAll(async() => {
    await makeDBconnexion();
})
describe("Creation of a user", async() => {
    it("check if it can create a user", async() => {
        const response = await request(process.env.TEST_HOST_GRAPHQL as string, mutation(email, password));
        expect(response).toEqual({createUser: null});
    }, 10000);

    it("can't recreate same user in DB and checks if password is crypted", async() => {
        const users = await User.find({where: {
                email
            }});
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password)
            .not
            .toEqual(password);
    });

    it("check for duplicate email", async() => {
        const response : any = await request(process.env.TEST_HOST_GRAPHQL as string, mutation(email, password));
        expect(response.createUser).toHaveLength(1);
        expect(response.createUser[0]).toEqual({path: "email", message: duplicateEmail});
    });

    it("check for bad email", async() => {
        // bad length(min)
        const response : any = await request(process.env.TEST_HOST_GRAPHQL as string, mutation("b", password));
        expect(response.createUser).toHaveLength(2);
        expect(response.createUser[0]).toEqual({path: "email", message: emailNotLongEnough});

        // bad email
        const response3 : any = await request(process.env.TEST_HOST_GRAPHQL as string, mutation("b@tt,ff", password));
        expect(response3.createUser).toHaveLength(1);
        expect(response3.createUser[0]).toEqual({path: "email", message: emailNotValid});

    })

    it("check for bad password", async() => {
        const response : any = await request(process.env.TEST_HOST_GRAPHQL as string, mutation(email, "p"));
        expect(response).toEqual({
            createUser: [
                {
                    path: "password",
                    message: passwordNotLongEnough
                }
            ]
        });
    });

    it("check for bad email and bad password", async() => {
        const response : any = await request(process.env.TEST_HOST_GRAPHQL as string, mutation("b", "p"));
        expect(response).toEqual({
            createUser: [
                {
                    path: "email",
                    message: emailNotLongEnough
                }, {
                    path: "email",
                    message: emailNotValid
                }, {
                    path: "password",
                    message: passwordNotLongEnough
                }
            ]
        });
    });
})