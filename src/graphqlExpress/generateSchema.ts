import {importSchema} from "graphql-import";
import {makeExecutableSchema, mergeSchemas} from 'apollo-server-express';
import * as fs from 'fs';
import * as path from 'path';

export const genSchema = () => {
    const schemas : any = [];
    console.log(path.join(__dirname, "./modules"));
    const folders = fs.readdirSync(path.join(__dirname, "./modules"));
    // read module folder for schema stiching in apollo server 2
    folders.forEach((folder) => {
        const {resolvers} = require(`./modules/${folder}/resolvers`);
        const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`));
        schemas.push(makeExecutableSchema({typeDefs, resolvers}));
    });

    return mergeSchemas({schemas});
}
