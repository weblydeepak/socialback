const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
    let transport = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "a0669df7580aff",
          pass: "6a6c252126c4ba"
        }
      });

  const mailOptions = {
    // from: process.env.SMPT_MAIL,
    from: process.env.SMTmail,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(mailOptions);
};