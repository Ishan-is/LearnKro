import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME || "LearnKro AI"}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`✉️ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed. Falling back to console log.");
    console.log("\n==================================================");
    console.log(`TO: ${options.email}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`MESSAGE:\n${options.message}`);
    console.log("==================================================\n");
    // Return true on console fallback so development flow is not interrupted
    return true;
  }
};

export default sendEmail;
