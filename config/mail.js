import nodemailer from 'nodemailer';
import Config from './config.js'; // Configuration file

// Initializing the configuration file
const keyValt = new Config();

/**
 * This module provides a function to send emails using an SMTP provider.
 * It uses the `nodemailer` library to interact with the SMTP server.
 */

/**
 * Create a reusable transporter object using the SMTP transport
 * Replace the configuration options with your SMTP provider's details
 */
const transporter = nodemailer.createTransport({
  host: keyValt.BREVO_SMTP_SERVER, // SMTP host
  port: keyValt.BREVO_SMTP_PORT || 587, // SMTP port (typically 587 for modern SMTP servers)
  secure: true,
   auth: {
     user: keyValt.BREVO_SMTP_LOGIN,
     pass: keyValt.BREVO_SMTP_PASSWORD
  }
});

/**
 * Send an email using the transporter object
 * @param {Object} mailOptions - The options for the email to be sent
 * @param {string} [mailOptions.from] - The email address of the sender
 * @param {string} mailOptions.to - The email address of the recipient
 * @param {string} mailOptions.subject - The subject line of the email
 * @param {string} mailOptions.text - The plain text body of the email
 * @param {string} [mailOptions.html] - The HTML body of the email (optional)
 * @returns {Promise<Object>} - A Promise that resolves with the response from the SMTP server
 */
export const sendEmail = async (mailOptions) => {
  mailOptions['from'] = mailOptions.from || process.env.FROM_EMAIL || keyValt.ADMIN_EMAIL;
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
    
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

