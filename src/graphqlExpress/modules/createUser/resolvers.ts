import * as bcrypt from 'bcryptjs';
import {ResolverMap} from '../../types/graphql-utils';
import * as yup from 'yup';
import {User} from '../../typeORM/entity/User';
import {formatYupError} from '../../../utilitaires/formatyuperrors';
import {duplicateEmail, emailNotLongEnough, emailTooLong, emailNotValid, passwordNotLongEnough} from '../../../utilitaires/errorMessages';
import {createConfirmEmailLink} from '../../utils/createConfirmEmailLink';
import {sendEmail} from '../../../utilitaires/sendEmail';

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
                console.log("userID " + user.id);
                await user.save();
                const confirmMailLink = await createConfirmEmailLink(url, user.id, redis);
                const message = process.env.NODE_ENV === "test"
                    ? `
                <html>
                <body>
                <p>Ceci est un test avec nodemailer et gmail</p>
                <a href="${confirmMailLink}">${confirmMailLink}</a>
                </body>
                </html>
                `
                    : `
                <html>
                <body>
                <p>Ceci est un test avec nodemailer et gmail</p>
                <a href="${confirmMailLink}">${confirmMailLink}</a>
                </body>
                </html>
                `;
                sendEmail("testServer@typescript.com", args.email, "test sending email with links", message);
                console.log(url);
                return null;
            }
        }
    }
};
