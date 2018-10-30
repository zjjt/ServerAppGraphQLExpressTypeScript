import * as bcrypt from 'bcryptjs';
import {ResolverMap} from '../../types/graphql-utils';
import {User} from '../../typeORM/entity/User';
import {wrongLogin, mailNotConfirmed} from '../../../utilitaires/errorMessages';

const errorResponse = [
    {
        path: "email",
        message: wrongLogin
    }
]

export const resolvers : ResolverMap = {
    Query: {
        test1: () => "it works"
    },
    Mutation: {
        login: async(_, args, {session}) => {
            {

                const user = await User.findOne({
                    where: {
                        email: args.email
                    }
                });
                if (!user) {
                    return errorResponse;
                }
                if (!user.confirmed) {
                    return [
                        {
                            path: "email",
                            message: mailNotConfirmed
                        }
                    ]
                }
                const isValidPassword = await bcrypt.compare(args.password, user.password);
                if (!isValidPassword) {
                    return errorResponse;
                }

                session.userid = user.id;
                return null;
            }
        }
    }
};
