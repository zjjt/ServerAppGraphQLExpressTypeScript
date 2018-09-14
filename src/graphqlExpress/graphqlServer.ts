import {ApolloServer, makeExecutableSchema, mergeSchemas} from 'apollo-server-express';
import * as express from 'express';
import makeDBconnexion from './connectors';
import * as fs from 'fs';
import * as path from 'path';
import {importSchema} from 'graphql-import';
import * as Redis from 'ioredis';
import {User} from './typeORM/entity/User';

const startServer = async() => {

    const schemas : any = [];
    const folders = fs.readdirSync(path.join(__dirname, "./modules"));
    // read module folder for schema stiching in apollo server 2
    folders.forEach((folder) => {
        const {resolvers} = require(`./modules/${folder}/resolvers`);
        const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
        schemas.push(makeExecutableSchema({typeDefs, resolvers}));
    });
    const redis = new Redis({
        showFriendlyErrorStack: (process.env.NODE_ENV !== "production")
    });
    const server = new ApolloServer({
        schema: mergeSchemas({schemas}),
        context: async({req} : any) => ({
            redis,
            url: req.protocol + "://" + req.get("host")
        })
    });
    const expressApp = express();
    server.applyMiddleware({app: expressApp, cors: true});

    expressApp.get("/confirm-user/:id", async(req, res) => {
        const {id} = req.params;
        console.log(id);
        const userId = await redis.get(id);
        await redis.del(id);
        if (userId) {
            await User.update({
                id: userId
            }, {confirmed: true});
            res.send("ok");
        } else {
            res.send("invalid");
        }

    });
    await makeDBconnexion();
    // prettier-ignore
    let port : any;
    const app = await expressApp.listen({
        port: process.env.NODE_ENV === "test"
            ? 4005
            : 4000
    }, () => {
        port = process.env.NODE_ENV === "test"
            ? 4005
            : 4000;
        console.log(`GraphQL server running at http://localhost:${port}${server.graphqlPath}`)
    })
    console.log("port " + port + server.graphqlPath);
    const App = {
        app,
        port: process.env.NODE_ENV === "test"
            ? 4005
            : 4000,
        server
    };
    return App;
}

export default startServer;