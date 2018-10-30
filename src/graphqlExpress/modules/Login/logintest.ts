import {request} from 'graphql-request';
import makeDBconnexion from '../../connectors';
import {wrongLogin, mailNotConfirmed} from '../../../utilitaires/errorMessages';
// import {host} from '../settings'; import {User} from
// '../graphqlExpress/typeORM/entity/User';

beforeAll(async() => {
    await makeDBconnexion();
});

const email = "itemail2gp5@gmnail.com";
const password = "oiuyi4o54";
const mutation = (e : string, p : string) => `
mutation{
    createUser(email:"${e}",password:"${p}"){
        path
        message
    }
}
`
const loginmutation = (e : string, p : string) => `
    mutation{
        login(email:"${e}",password:"${p}"){
            path
            message
        }
    }
`
describe("Login a user", async() => {
    test("if the user isnt found or doesnt exist", async() => {
        const response = await request(process.env.TEST_HOST_GRAPHQL as string, loginmutation(email, password));
        expect(response).toEqual({
            login: [
                {
                    path: "email",
                    message: wrongLogin
                }
            ]
        });
    });
    test("if the user has not confirmed his mail", async() => {
        // create the user first
        await request(process.env.TEST_HOST_GRAPHQL as string, mutation(email, password));
        const response1 = await request(process.env.TEST_HOST_GRAPHQL as string, loginmutation(email, password));
        expect(response1).toEqual({
            login: [
                {
                    path: "email",
                    message: mailNotConfirmed
                }
            ]
        });
    });
});
