export const location_arr = JSON.stringify([
  { name: "Ahmedabad", ia_active: true },
  { name: "Baroda", ia_active: true },
]);

// import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";
// import * as Handlebars from "handlebars";
// import * as fs from "fs";

// const emailConfig = {
//   apiKey:
//     "mlsn.7e0c87c5b96f0bd3d84cbe62d5dcf4f06ee9264e33e900924b264039172233d4",
//   senderEmail: "MS_TiRdpG@trial-o65qngkpj0jlwr12.mlsender.net",
// };

// // Load email template
// const emailTemplateSource = fs.readFileSync("email-template.hbs", "utf8");
// const emailTemplate = Handlebars.compile(emailTemplateSource);

// export async function sendEmail(
//   recipientEmail: string,
//   subject: string,
//   name: string,
//   message: string
// ): Promise<boolean> {
//   try {
//     // Input validation
//     if (!recipientEmail || !subject || !name || !message) {
//       throw new Error("Invalid input");
//     }

//     const mailerSend = new MailerSend({
//       apiKey: emailConfig.apiKey,
//     });

//     const recipient = new Recipient(recipientEmail);
//     const sender = new Sender(emailConfig.senderEmail);

//     // Render email template
//     const emailBody = emailTemplate({
//       subject,
//       name,
//       message,
//     });

//     const emailParams = new EmailParams()
//       .setFrom(sender)
//       .setTo([recipient])
//       .setSubject(subject)
//       .setHtml(emailBody);

//     await mailerSend.email.send(emailParams);
//     console.log("Email sent successfully!");
//     return true;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     return false;
//   }
// }

