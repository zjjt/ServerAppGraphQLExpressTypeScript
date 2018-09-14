import * as bcrypt from 'bcryptjs';
import {ResolverMap} from '../../types/graphql-utils';
import * as yup from 'yup';
import {User} from '../../typeORM/entity/User';
import {formatYupError} from '../../../utils/formatyuperrors';
import {duplicateEmail, emailNotLongEnough, emailTooLong, emailNotValid, passwordNotLongEnough} from '../../../utils/errorMessages';
import {createConfirmEmailLink} from '../../../utils/createConfirmEmailLink';

const schema = yup
    .object()
    .shape({
        email: yup
            .string()
            .min(3, emailNotLongEnough)
            .max(255, emailTooLong)
            .email(emailNotValid),
        password: yup
            .string()
            .min(3, passwordNotLongEnough)
            .max(255)
    })

export const resolvers : ResolverMap = {
    Query: {
        test: () => "it works"
    },
    Mutation: {
        createUser: async(_, args, {redis, url}) => {
            {
                try {
                    await schema.validate(args, {abortEarly: false})
                } catch (err) {
                    console.log(err.inner[0].message);
                    return formatYupError(err);
                }
                const userAlreadyExists = await User.findOne({
                    where: {
                        email: args.email
                    },
                    select: ["id"]
                });
                if (userAlreadyExists) {
                    return [
                        {
                            path: "email",
                            message: duplicateEmail
                        }
                    ];
                }
                const hashedPassword = await bcrypt.hash(args.password, 10);
                const user = User.create({email: args.email, password: hashedPassword});
                await user.save();
                await createConfirmEmailLink(url, user.id, redis);
                return null;
            }
        }
    }
};
