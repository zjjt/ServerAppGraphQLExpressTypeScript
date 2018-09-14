import {getConnectionOptions, createConnection} from "typeorm";

export const createTypeOrmConnection = async() => {
    const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
    console.log("environnment de " + process.env.NODE_ENV);
    console.log("database is " + connectionOptions.database)
    return createConnection({
        ...connectionOptions,
        name: "default"
    });
}