import nodemailer from 'nodemailer';
import Config from '../config/config.js'; // Configuration file
import { Blogs } from '../src/models/blogs.js';
import axios from 'axios';
import { sendTelegramMessage } from './telegram.js';
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
    const apiKey = keyValt.BREVO_SMTP_API_KEY;
    const listId = keyValt.BREVO_LIST_ID;
    const url = `https://api.brevo.com/v3/contacts`;

    if(await isEmailInContacts(email)){
      console.log('Email already subscribed:', email);
      res.render('pages/failurePage', { notify: 'Your email is already subscribed. :) Keep an eye on your inbox!' });
      return
    }
    // Payload for adding a contact to a list
    const payload = {
      email: email,
      updateEnabled: true,
      listIds: [listId], // Adding the list ID to which the contact should be added
      attributes: { EMAIL: email },
    };

    // Making the POST request to Brevo API
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
    });

    // Send welcome email
    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: email,
      subject: 'Thanks for subscribing to our newsletter!',
      text: 'You have successfully subscribed to our newsletter. You will now receive our latest news and updates.',
    };

    await sendEmail(mailOptions);

    res.render('pages/successPage', { notify: 'Horaay, You have successfully subscribed to our newsletter!' });

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
    const apiKey = keyValt.BREVO_SMTP_API_KEY;
    const listId = keyValt.BREVO_LIST_ID;
    const url = `https://api.brevo.com/v3/contacts/${email}`;

    // Check if the email is in the contacts list
    if(!await isEmailInContacts(email)){
      res.render('pages/failurePage', { notify: 'Your email is not subscribed. :(' });
      return;
    }
    // Payload for removing a contact from a list
    const payload = {
      listIds: [listId], // The list ID from which the contact should be removed
    };  

    // Making the DELETE request to Brevo API
    const response = await axios.delete(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      data: payload,
    });

    // Send welcome email
    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: email,
      subject: 'You have successfully unsubscribed from our newsletter!',
      text: 'You have successfully unsubscribed from our newsletter. You will no longer receive our latest news and updates.',
      html: 'You have successfully unsubscribed from our newsletter. You will no longer receive our latest news and updates.',
    };

    await sendEmail(mailOptions);
    
    res.render('pages/successPage', { notify: 'You have successfully unsubscribed from our newsletter.' });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    throw error;
  }
};

// A function to send an email to all subscribers in the contact list
export const sendLatestNewsletterToAllSubscribers = async () => {
  try {
    const apiKey = keyValt.BREVO_SMTP_API_KEY;
    const listId = keyValt.BREVO_LIST_ID;
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts`;
    const payload = {
      attributes: { EMAIL: 'ALL' },
    };

    // Get the latest blog post from the database efficiently
    const blogPosts = await Blogs.find().sort({ createdAt: -1 }).limit(1);
    const latestBlogPost = blogPosts[0];
    console.log(latestBlogPost)
    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: 'no-reply@atakangul.com',
      subject: 'Latest Blog Post',
      text: `Here's the latest blog post: ${latestBlogPost.title}`,
      html: `Here's the latest blog post: <a href="https://atakangul.com/blogs/blog/${latestBlogPost._id}">`,
    };

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      params: payload,
    });

    const subscribers = response.data.contacts;
    console.log("subscribers")
    console.log(subscribers)
    // Send email to each subscriber
    for (const subscriber of subscribers) {
      const { email } = subscriber;
      const subscriberMailOptions = {
        ...mailOptions,
        to: email,
      };

      await sendEmail(subscriberMailOptions);
    }

    console.log('Email sent to all subscribers');
  } catch (error) {
    console.error('Error sending email to all subscribers:');
    throw error;
  }
};

export const sendLatestAINewsletterToAllSubscribers = async () => {
  try {
    const apiKey = keyValt.BREVO_SMTP_API_KEY;
    const listId = keyValt.BREVO_LIST_ID;
    const url = `https://api.brevo.com/v3/contacts/lists/${listId}/contacts`;
    const payload = {
      attributes: { EMAIL: 'ALL' },
    };

    // Get the latest blog post from the database efficiently find the only author is AItakan

    const blogPosts = await Blogs
    .find({ authorName: "AItakan" })
    .sort({ createdAt: -1 })
    .limit(1);
    const latestBlogPost = blogPosts[0];
    const mailOptions = {
      from: "Atakan's Blog <no-reply@atakangul.com>",
      to: 'no-reply@atakangul.com',
      subject: 'Latest Blog Post',
      text: `Here's the latest blog post: ${latestBlogPost.title}`,
      html: `Here's the latest blog post: <a href="https://atakangul.com/blogs/blog/${latestBlogPost._id}">`,
    };

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      params: payload,
    });

    const subscribers = response.data.contacts;
    // Send email to each subscriber
    for (const subscriber of subscribers) {
      const { email } = subscriber;
      const subscriberMailOptions = {
        ...mailOptions,
        to: email,
      };

      await sendEmail(subscriberMailOptions);
    }

    console.log('Email sent to all subscribers');
  } catch (error) {
    console.error('Error sending email to all subscribers:');
    throw error;
  }
};
