import startServer from "../graphqlExpress/graphqlServer";

export const setup = async() => {
    const app = await startServer();
    process.env.TEST_HOST_GRAPHQL = `http://127.0.0.1:${app.port}${app.server.graphqlPath}`;
    process.env.TEST_HOST = `http://127.0.0.1:${app.port}`;
};