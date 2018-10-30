import makeDBconnexion from "../graphqlExpress/connectors";

beforeAll(async() => {
    await makeDBconnexion();
});