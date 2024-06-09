import axios from 'axios';
import Config from '../config/config.js';

/**
 * This module provides functions to interact with the Telegram Bot API.
 * It allows you to send messages to a specific chat or group.
 */

// Initialize the configuration module
const keyValt = new Config();

/**
 * Sends a message to a specific Telegram chat or group.
 * @param {string} chatId - The ID of the chat or group to send the message to.
 * @param {string} message - The message to send.
 * @returns {Promise<void>} - A Promise that resolves when the message is sent successfully.
 */
export const sendTelegramMessage = async (message) => {
  try {
    const url = `${keyValt.TELEGRAM_API_BASE_URL}${keyValt.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const data = {
      chat_id: keyValt.TELEGRAM_BOT_CHAT_ID,
      text: message,
    };

    await axios.post(url, data);
  } catch (error) {
    console.error('Error sending message to Telegram:');
  }
};

sendTelegramMessage('Server started! 🚀. Visit the website : ' + `${keyValt.DOMAIN}`);