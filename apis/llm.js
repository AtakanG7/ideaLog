import { sendTelegramMessage } from './telegram.js';
import Config from '../config/config.js';
import { OpenAI } from 'openai';
import axios from 'axios';
// Initialize configuration
const keyValt = new Config();

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: keyValt.OPENAI_API_KEY
});

/**
 * Fetch latest news articles
 * @returns {Promise<Array>} - An array of news articles
 */
async function fetchLatestTechNews() {
    const apiKey = keyValt.NEWS_API_KEY;
    let promptContent = []
    let totalCharCount = 0;
    const url = `https://newsapi.org/v2/everything?q=technology&sortBy=publishedAt&apiKey=867ac15225dc455eae63014b1473f517`;
    
    try {
        const response = await axios.get(url);
        for(let i = 0; i < response.data.articles.length; i++) {
            const article = response.data.articles[i];
            let content = {title: article.title, content: article.content};
            promptContent.push(content);
            totalCharCount += article.title.length + article.content.length;
            if(totalCharCount > 10000) {
                break;
            }
        }   
        console.log("promptContent")
        console.log(promptContent)
        return JSON.stringify(promptContent);
    } catch (error) {
        console.error('Error fetching tech news:', error);
        return [];
    }
}

/**
 * Generate a blog post using OpenAI GPT-3.5-turbo
 * @param {string} prompt - The prompt to send to the OpenAI API
 * @returns {Promise<string>} - The generated blog post
 */
async function generateBlogPost(prompt) {
  try {
    const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: keyValt.OPENAI_BASE_MODEL ,
    });
    const message = chatCompletion.choices[0].message.content;
    return message.trim();
  } catch (error) {
    console.error('Error generating blog post:', error);
    return 'An error occurred while generating the blog post.';
  }
}

/**
 * startAIPostCreation function to fetch news and generate a blog post
 */
async function startAIPostCreation() {
  try {
    const articles = await fetchLatestTechNews();
   
    if (articles.length === 0) {
      sendTelegramMessage('No articles found. Please try again later.');
      return;
    }

    const prompt = `You are an AI blogger. Your task is to write blog posts for Atakan. Atakan is well known with his enthisuasm in tech. So, he will provide you a lot of resources
    to create a compherensive latest tech trends blog post. As mentioned, he really cares about the tech news, and he expects you to give your best shot at writing the blog post.

    The purpose of making you write this blog post is to make people understand how joyful and enjoyable is AI. So, if you want to make ai nation shine and be a part of it, try to
    put some excitement into sentences. Who cares telling the pro words, keep it simple and make fun of the subject and keep it in taste.

    Expected output format:
    {
      title: "Title of your blog post",
      description: "Description of your blog post",
      {
          title: "Title of your blog post",
          content: "Content of your blog post"
      },
      author: "Author of your blog post (AItakan)"
    }

    Described output format is json format. You are expected to write your blog post in json format. Put the post into meaningful chunks or segments. The most important thing is to 
    figure out what are the latest trends and what are the reviews on them you need to understand it from the given context. Let's start, Here are the dozens of articles that I found on the internet: ${articles}
    `;

    const blogPost = await generateBlogPost(prompt);
    sendTelegramMessage('Gnerated Blog Post:\n' + blogPost);

    return JSON.stringify(blogPost);
  } catch (error) {
    console.error('Error generating blog post:', error);
    sendTelegramMessage('Error generating blog post:\n' + error);
    return null;
  }
}


export { fetchLatestTechNews, generateBlogPost, startAIPostCreation };
