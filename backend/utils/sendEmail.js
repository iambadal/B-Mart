import nodemailer from "nodemailer";
import { MailtrapClient } from "mailtrap";

const sendEmail = async (options) => {

    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
        const missing = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"].filter((key) => !process.env[key]);
        if (missing.length) {
            const error = new Error(`Email is not configured. Set ${missing.join(", ")} in backend/.env.`);
            error.code = "EMAIL_CONFIGURATION";
            throw error;
        }

        const port = Number(process.env.EMAIL_PORT || 587);
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port,
            secure: process.env.EMAIL_SECURE === "true" || port === 465,
            connectionTimeout: 10000,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"B-Mart" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        await transporter.sendMail(mailOptions);
        console.log("[DEV] : Email sent via Mailtrap Sandbox");
    } else {
        const missing = ["MAILTRAP_API_TOKEN", "MAILTRAP_SENDER_EMAIL", "MAILTRAP_SENDER_NAME"].filter((key) => !process.env[key]);
        if (missing.length) {
            const error = new Error(`Email is not configured for production. Set ${missing.join(", ")} in the backend environment.`);
            error.code = "EMAIL_CONFIGURATION";
            throw error;
        }

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
