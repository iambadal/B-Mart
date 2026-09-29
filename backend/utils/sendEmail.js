import nodemailer from "nodemailer";
import { MailtrapClient } from "mailtrap";

const sendEmail = async (options) => {

    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
        // For development only [ Mailtrap SMTP sandbox]
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"My Cart" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        await transporter.sendMail(mailOptions);
        console.log("[DEV] : Email sent via Mailtrap Sandbox");
    } else {
        // For production only [Mailtrap Sending API]
        const client = new MailtrapClient({
            token: process.env.MAILTRAP_API_TOKEN,
        });

        await client.send({
            from :{
                email: process.env.MAILTRAP_SENDER_EMAIL,
                name: process.env.MAILTRAP_SENDER_NAME,
            },
            to: [{ email: options.to }],
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        console.log("[PROD] : Email sent via Mailtrap API");
    }

};

export default sendEmail;