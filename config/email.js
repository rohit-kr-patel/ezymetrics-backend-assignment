const nodemailer = require("nodemailer");

const sendMail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rp58007@gmail.com",
    pass: "Rohit123@",
  },
});

module.exports = sendMail;
