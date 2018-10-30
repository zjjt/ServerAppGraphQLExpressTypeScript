import {ApolloServer} from 'apollo-server-express';
import * as express from 'express';
import makeDBconnexion from './connectors';
import {redis} from './redis';
import {confirmEmailRoute} from './routes/confirmEmail';
import {genSchema} from './generateSchema';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

const startServer = async() => {

    const SESSION_SECRET = "8765567890gfghj";
    const RedisStore = connectRedis(session);

    const server = new ApolloServer({
        schema: genSchema(),
        context: async({req} : any) => ({
            redis,
            url: req.protocol + "://" + req.get("host"),
            session: req.session
        })
    });
    const expressApp = express();

    expressApp.use(session({
        store: new RedisStore({client: redis as any}),
        name: "rid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 *7 // 7 days
        }
    }))
    expressApp.get("/confirm-user/:id", confirmEmailRoute);
    server.applyMiddleware({app: expressApp, cors: true});
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