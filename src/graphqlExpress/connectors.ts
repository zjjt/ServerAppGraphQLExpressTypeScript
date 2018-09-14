import {createTypeOrmConnection} from "./typeORM/typeORMconnectionHandler";

const makeDBconnexion = async() => {
    // here we await all types of connection needed for the app to work
    await createTypeOrmConnection();
}
export default makeDBconnexion;