import nodemailer from 'nodemailer';
import Config from '../../config/config.js'; // Configuration file
import { Blogs } from '../../src/models/blogs.js';
import axios from 'axios';
import { sendTelegramMessage } from '../services/telegram.js';
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
  secure: false,
   auth: {
     user: keyValt.BREVO_SMTP_LOGIN,
     pass: keyValt.BREVO_SMTP_PASSWORD
  },
  tls: {
      ciphers:'SSLv3'
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
  mailOptions['from'] = "Atakan's Blog <no-reply@atakangul.com>";
  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Send a message to the Telegram bot
    sendTelegramMessage(`Email sent: ${info.response}`);
    return info;
    
  } catch (error) {
    sendTelegramMessage(`Error sending email: ${error}`);
    console.error('Error sending email:', error);
    throw error;
  }
};

// A function to subscribe people to the newsletter
export const subscribeToNewsletter = async (req, res) => {
  try {
    const email = req.body.email;
    const url = `https://api.brevo.com/v3/contacts`;

    const payload = {
      email: email,
      updateEnabled: true,
      listIds: [keyValt.BREVO_LIST_ID], 
      attributes: { EMAIL: email },
    };

    
    if(await isEmailInContacts(email)){
      res.render('pages/successPage', { message: 'You are already subscribed, keep an eye on your inbox!', user: {email:email}, isUnsubscription: false });
      return
    }

    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': keyValt.BREVO_SMTP_API_KEY,
      },
    });

    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: email,
      subject: 'Thanks for subscribing to our newsletter!',
      text: 'You have successfully subscribed to our newsletter. You will now receive our latest news and updates.',
    };

    await sendEmail(mailOptions);

    res.render('pages/successPage', { message: 'Congratulation! You have successfully subscribed to our newsletter!', user: {email:email}, isUnsubscription: false });

  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error('Email already subscribed:', email);
    } else {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }
};

export const isEmailInContacts = async (email) => {
  try {
    const apiKey = keyValt.BREVO_SMTP_API_KEY;
    const url = `https://api.brevo.com/v3/contacts/${email}`;

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
    });

    // If the response status is 200, the email is found in the contacts list
    if (response.status === 200) {
      console.log('Email is in the contacts list:', response.data);
      return true;
    }
  } catch (error) {
    // If the error response status is 404, the email is not found in the contacts list
    if (error.response && error.response.status === 404) {
      console.log('Email not found in the contacts list:', email);
      return false;
    } else {
      console.error('Error checking email in contacts list:', error);
      throw error;
    }
  }
};

export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const email = req.body.email;
    const url = `https://api.brevo.com/v3/contacts/${email}`;

    // Check if the email is in the contacts list
    if(!await isEmailInContacts(email)){
      res.render('pages/failurePage', { message: 'Your email is not subscribed!' });
      return;
    }
    // Payload for removing a contact from a list
    const payload = {
      listIds: [keyValt.BREVO_LIST_ID], // The list ID from which the contact should be removed
    };  

    // Making the DELETE request to Brevo API
    await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': keyValt.BREVO_SMTP_API_KEY,
      },
      data: payload,
    });

    // Send welcome email
    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: email,
      subject: 'You have successfully unsubscribed from our newsletter!',
      text: 'You have successfully unsubscribed from our newsletter. You will no longer receive our latest news and updates.',
    };

    await sendEmail(mailOptions);
    
    res.render('pages/successPage', { message: 'You have successfully unsubscribed from our newsletter.', user: {email:email}, isUnsubscription: true });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
  }
};

