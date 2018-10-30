import * as nodemailer from "nodemailer";

export const configMailOptions = (from : string, to : string, subject : string, html : string) : object => {
    return {from, to, subject, html}
}

export const sendEmail = async(from : string, to : string, subject : string, html : string) => {
    if (process.env.NODE_ENV === "test") {
        await nodemailer.createTestAccount((err, account) => {
            const smtpConfig = {
                /* Options pour quand on utilise nos propres services
                host:process.env.MAIL_HOST,
                port:process.env.MAIL_PORT,
                secure:false,
                */
                // a enlever si on utilise nos propre services host: process.env.MAIL_HOST,
                // port: process.env.MAIL_PORT, host: 'smtp.ethereal.email' est utiliser pour
                // les tests acceder avec l'addresse https://ethereal.email/message/message_id
                host: 'smtp.ethereal.email',
                // : 587, // process.env.MAIL_PORT,
                secure: false,
                auth: {
                    user: account.user, // process.env.MAIL_USER,
                    pass: account.pass // process.env.MAIL_PASSWORD
                }
            };
            const transporter = nodemailer.createTransport(smtpConfig as nodemailer.TransportOptions);
            transporter.sendMail(configMailOptions(from, to, subject, html), (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(info);
                }
            });
        })
    } else {
        const smtpConfig = {
            /* Options pour quand on utilise nos propres services
            host:process.env.MAIL_HOST,
            port:process.env.MAIL_PORT,
            secure:false,
            */
            // a enlever si on utilise nos propre services host: process.env.MAIL_HOST,
            // port: process.env.MAIL_PORT, host: 'smtp.ethereal.email' est utiliser pour
            // les tests acceder avec l'addresse https://ethereal.email/message/message_id
            // host: 'smtp.ethereal.email', // process.env.MAIL_HOST,
            service: "Gmail",
            // : 587, // process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER, // account.user, // process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD // account.pass // process.env.MAIL_PASSWORD
            }
        };
        const transporter = nodemailer.createTransport(smtpConfig as nodemailer.TransportOptions);
        await transporter.sendMail(configMailOptions(from, to, subject, html), (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log(info);
            }
        });
    }

}