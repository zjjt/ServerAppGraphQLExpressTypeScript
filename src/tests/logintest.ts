import {request} from 'graphql-request';
// import {host} from '../settings'; import {User} from
// '../graphqlExpress/typeORM/entity/User';
import {wrongLogin, mailNotConfirmed} from '../utilitaires/errorMessages';
import {User} from '../graphqlExpress/typeORM/entity/User';

const email = "itemail2gp5@gmnail.com";
const password = "oiuyi4o54";
const testFunc = async(e : string, p : string, test : number, error : string) => {
    if (test === 2) {
        await request(process.env.TEST_HOST_GRAPHQL as string, mutation(e, p));

    }
    const response = await request(process.env.TEST_HOST_GRAPHQL as string, loginmutation(e, p));
    expect(response).toEqual({
        login: [
            {
                path: "email",
                message: error
            }
        ]
    });
}
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
        await testFunc(email, password, 1, wrongLogin);
    });
    test("if the user has not confirmed his mail", async() => {
        // create the user first
        await testFunc(email, password, 2, mailNotConfirmed);
        // once we confirm he hasnt confirmed yet we activate the flag
        await User.update({
            email
        }, {confirmed: true});
        // we re check if he can now connect
        const response = await request(process.env.TEST_HOST_GRAPHQL as string, loginmutation(email, password));
        expect(response).toEqual({login: null});
    });

});
