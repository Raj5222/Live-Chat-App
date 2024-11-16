import FormData from "form-data";
import Mailgun from "mailgun-js";

const mailgunConfig = {
  domain: "sandbox-123.mailgun.org",
  apiKey: process.env.MailgunAPI,
  fromEmail: "mailgun@sandbox3f1315a5e2b349cdbf84eda1d47867ff.mailgun.org",
};

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: mailgunConfig.apiKey,
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const response = await mg.messages.create(mailgunConfig.domain, {
      from: mailgunConfig.fromEmail,
      to,
      subject,
      text,
      html,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const dailyLimit = 10;
const warningThreshold = dailyLimit * 0.5;
let emailCount = 0;
let previousDay = new Date().getDate().toLocaleString;

const sendWarningEmail = async () => {
  const warningEmailResponse = await sendEmail(
    "warning@example.com",
    "Warning: Email Limit Reached",
    `You have sent ${emailCount} emails today, which is ${Math.round(
      (emailCount / dailyLimit) * 100
    )}% of your limit.`,
    `<h1>Warning: Email Limit Reached</h1><p>You have sent ${emailCount} emails today, which is ${Math.round(
      (emailCount / dailyLimit) * 100
    )}% of your limit.</p>`
  );
  console.log("Warning email sent");
  return warningEmailResponse;
};

const checkAndSendEmail = async () => {
  const currentDay = new Date().getDate();

  if (currentDay !== previousDay) {
    previousDay = currentDay;
    emailCount = 0;
  }

  if (emailCount < dailyLimit) {
    try {
      const emailResponse = await sendEmail(
        "test@example.com",
        "Hello",
        "Testing some Mailgun awesomeness!",
        "<h1>Testing some Mailgun awesomeness!</h1>"
      );
      emailCount++;
      if (emailCount === warningThreshold) {
        await sendWarningEmail();
      }
      return emailResponse;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  } else {
    console.log("Daily limit reached. No more emails will be sent.");
  }
};

checkAndSendEmail(); //Check
