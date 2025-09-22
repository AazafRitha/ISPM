import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendTestMail() {
  try {
    await transporter.sendMail({
      from: `"IT Security" <${process.env.EMAIL_USER}>`,
      to: 'hanasaleed369@gmail.com', // send to yourself
      subject: 'Test Email',
      html: '<p>This is a test email from your phishing simulation setup.</p>'
    });
    console.log('Email sent successfully!');
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

sendTestMail();
