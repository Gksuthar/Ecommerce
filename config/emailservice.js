import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host :"smtp.gmail.com",
    port  : 465,
    secure: true,
    auth : {
        user : process.env.EMAIL,
        pass : process.env.EMAIL_PASS
    }
 })

 async function sendEmail({sendTo, subject, text, html}) {
    try {
        console.log(sendTo, subject, text, html + 'ddjd')
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: sendTo, 
            subject: subject, 
            text: text,
            html: html 
        });

        console.log("Email sent successfully: ", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
}
export default sendEmail;