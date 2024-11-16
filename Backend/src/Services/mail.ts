import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";
import * as Handlebars from "handlebars";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const emailConfig = {
  apiKey: process.env.mailkey, // No need for String() conversion
  senderEmail: process.env.email,
};

// Load email template
const emailTemplateSource = fs.readFileSync(
  "src/Services/email-template.hbs",
  "utf8"
);
const emailTemplate = Handlebars.compile(emailTemplateSource);

export async function sendEmail(
  recipientEmail: string,
  subject: string,
  super_admin: string,
  message: string,
  link?: string
): Promise<boolean> {
  try {
    if (!recipientEmail || !subject || !super_admin || !message) {
      throw new Error("Invalid input");
    }

    const mailerSend = new MailerSend({
      apiKey: emailConfig.apiKey, // Ensure this is not undefined
    });

    const recipient = new Recipient(recipientEmail);
    const sender = new Sender(emailConfig.senderEmail);

    // Render email template
    const emailBody = emailTemplate({
      subject,
      link,
      super_admin,
      message,
    });

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([recipient])
      .setSubject(subject)
      .setHtml(emailBody);

    await mailerSend.email.send(emailParams);
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    return false;
  }
}
