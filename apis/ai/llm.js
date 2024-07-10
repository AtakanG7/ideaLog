import { sendTelegramMessage } from '../services/telegram.js';
import Config from '../../config/config.js';
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
async function fetchLatestTechNews(query) {
    const apiKey = keyValt.NEWS_API_KEY;
    let promptContent = []
    let totalCharCount = 0;
    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}&sortBy=publishedAt&language=en`;
    
    try {
        const response = await axios.get(url);
        for(let i = 0; i < response.data.articles.length; i++) {
            const article = response.data.articles[i];
            promptContent.push({content: article.title + article.content});
            totalCharCount += article.title.length + article.content.length;
            if(totalCharCount > 10000) {
                break;
            }
        }   
        return JSON.stringify(promptContent);
    } catch (error) {
        console.error('Error fetching tech news:', error);
        return [];
    }
}

function getBlogPostURL(title) {
    // Convert the title to lowercase and replace spaces with hyphens
    let url = title.toLowerCase().replace(/\s+/g, '-');
    
    // Remove special characters and symbols
    url = url.replace(/[^\w-]+/g, '');
    
    // Remove consecutive hyphens
    url = url.replace(/--+/g, '-');
    
    // Remove leading and trailing hyphens
    url = url.replace(/^-+|-+$/g, '');
    
    return url;
}

/**
 * Generate a blog post using OpenAI GPT-3.5-turbo
 * @param {string} prompt - The prompt to send to the OpenAI API
 * @returns {Promise<string>} - The generated blog post
 */
async function sendToLLM(prompt, isCheapTask) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: !isCheapTask? keyValt.OPENAI_BASE_MODEL : 'gpt-3.5-turbo',
      temperature: 0.8,
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
 * @async 
 * @function
 * @name startAIPostCreation
 * @returns {Promise<void>}
 * @throws {Error}
 * 
 */
async function startAIPostCreation(query) {
  try {
    // Fetch latest news articles about technology
    const articles = await fetchLatestTechNews(query);
   
    if (articles.length === 0) {
      sendTelegramMessage('[CANCELLED] No articles found. Please try again later.');
      return;
    }

    const promptDirectives = `You are an experienced professional blogger with a unique, playful sense of humor. Your blog posts are characterized by:

      Simple, conversational language that avoids jargon and complex words
      Highly engaging writing with plenty of witty, humorous phrasing
      Short, punchy sentences that keep the reader's interest
      An irreverent, fun tone that gently pokes fun at the subject matter while still remaining good-natured

      Your goal is to take potentially dry or boring topics and make them incredibly entertaining to read through your clever writing style. You have a knack for injecting excitement and hilarity into the most mundane subjects.
      Rather than just dryly stating facts, you want to tell an amusing story or narrative around the topic. Don't be afraid to be bold with your humor - the more outrageous the better, as long as it's all in good fun. Just be sure to keep things relatively family-friendly without veering into offensiveness.
      The end result should be blog posts that are an absolute joy to read from start to finish, leaving the reader entertained, enlightened and eager to read more of your wonderfully amusing work. Aim for posts of at least 500 words that really allow you to flex your comedic writing chops.`

    
    const expectedOutputFormat = `{
      "1": {
        "title": "Title of the first segment of the blog post",
        "content": "Content of the first segment of the blog post quotes,lists,orders,code block,headers,sections,main content, and more you can use. You have access to daisy ui classes.",
        "one_keyword": "Best keyword of the first segment of the blog post"
      },
      "2": {
        "title": "Title of the second segment of the blog post",
        "content": "Content of the second segment of the blog post quotes,lists,orders,code block,headers,sections,main content, and more you can use. You have access to daisy ui classes.",
        "one_keyword": "Best keyword of the second segment of the blog post"
      },
      "3": {
        "title": "Title of the third segment of the blog post",
        "content": "Content of the third segment of the blog post quotes,lists,orders,code block,headers,sections,main content, and more you can use. You have access to daisy ui classes.",
        "one_keyword": "Best keyword of the third segment of the blog post"
      } ... (if there are more segments in the article you can add them here)
    }`

    // Blog Post Content
    const blogPostContent = await getAICreatedBlogPost(promptDirectives, expectedOutputFormat, articles);
    sendTelegramMessage('Blog Post Content:\n' + blogPostContent);
    
    // Blog Post Title
    const blogPostTitle = await getBlogPostTitle(blogPostContent);
    sendTelegramMessage('Blog Post Title:\n' + blogPostTitle);

    // Blog Post webFriendlyURL
    const webFriendlyURL = await getBlogPostURL(blogPostTitle);
    sendTelegramMessage('Blog Post webFriendlyURL:\n' + webFriendlyURL);

    // Blog Post Description
    const blogPostDescription = await getBlogPostDescription(blogPostContent);
    sendTelegramMessage('Blog Post Description:\n' + blogPostDescription);
    
    // Important Keywords
    let importantKeywords = await getImportantKeywords(blogPostContent);
    sendTelegramMessage('Important Keywords:\n' + importantKeywords);

    importantKeywords += blogPostTitle + blogPostDescription + blogPostContent;

    sendTelegramMessage('Important Keywords:\n' + importantKeywords);
    return ({
      url: webFriendlyURL,
      title: blogPostTitle,
      content: blogPostContent,
      description: blogPostDescription,
      search_keywords: importantKeywords
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    sendTelegramMessage('Error generating blog post:\n' + error);
    return null;
  }
}

async function startUserPostCreation(content) {
  try {

    // Blog Post Content
    const blogPostContent = JSON.stringify([
      {
        content: content
      }
    ]);
    
    // Blog Post Title
    const blogPostTitle = await getBlogPostTitle(blogPostContent);
    sendTelegramMessage('Blog Post Title:\n' + blogPostTitle);

    // Blog Post webFriendlyURL
    const webFriendlyURL = await getBlogPostURL(blogPostTitle);
    sendTelegramMessage('Blog Post webFriendlyURL:\n' + webFriendlyURL);

    // Blog Post Description
    const blogPostDescription = await getBlogPostDescription(blogPostContent);
    sendTelegramMessage('Blog Post Description:\n' + blogPostDescription);
    
    // Important Keywords
    let importantKeywords = await getImportantKeywords(blogPostContent);
    sendTelegramMessage('Important Keywords:\n' + importantKeywords);

    importantKeywords += blogPostTitle + blogPostDescription + blogPostContent;

    sendTelegramMessage('Important Keywords:\n' + importantKeywords);
    return ({
      url: webFriendlyURL,
      title: blogPostTitle,
      content: blogPostContent,
      description: blogPostDescription,
      search_keywords: importantKeywords
    });

  } catch (error) {
    console.error('Error generating blog post:', error);
    sendTelegramMessage('Error generating blog post:\n' + error);
    return null;
  }
}

async function getAICreatedBlogPost(directives ,articles, expectedOutputFormat, isCheapTask = true) {

  const prompt = `${directives}

  The output you generate will be in plain text format. However, the content of your blog post should be in JSON format. 
  Do not include the 'json' keyword or any other formatting at the beginning or end of your output. 
  The content itself should be in the JSON format.

  How output looks like:
  ${expectedOutputFormat}

  Described output format is json format. You are expected to write your blog post in json format. Put the post into meaningful chunks or segments. 
  Depend on the given articales don't go yourself and get out of the way. Let's start, Here are the articles to write blog on ${articles}
  `;

  // Blog Post Generation
  const blogPost = await sendToLLM(prompt, isCheapTask);
  sendTelegramMessage('Gnerated Blog Post:\n' + blogPost);

  return blogPost;
}

async function getImportantKeywords(content, isCheapTask = true) {
  try {

    const prompt = `You are a keyword finder. Given the context, determine what the content is about. The content may be in JSON format or plain text; your output should be plain text.
    Example:
    content: {
      "...": "\\n\\"description\\":\\"Stay up-to-date with the latest tech trends and reviews in the tech world with this vibrant and exciting blog post. From UNOX Ovens to HitPaw Video Converter, Marvell stock to Hamamatsu Photonics, and big tech companies forming Ultra Accelerator Link group, get ready to dive into the world of technology like never before!\\",\\n\\"content\\": {\\n\\"segment1\\": \\"<h2>UNOX Ovens Lounge Launch in Guwahati</h2><p>Exciting news! UNOX, a leading Italian brand, has launched UNOX Lounge in Guwahati. This is a major milestone for the brand, following successful launches in Goa and Mumbai. With top-notch Italian technology, UNOX Ovens are set to revolutionize cooking experiences. Read more <a href='#'>here</a>.</p>\\",\\n\\"segment2\\": \\"<h2>HitPaw Video Converter V4.2.0 - What's New?</h2><p>HitPaw introduces the latest software version - HitPaw Video Converter V4.2.0. This update brings exciting new features like video download and music conversion. Enrich your life with HitPaw's innovative software. Learn more <a href='#'>here</a>.</p>\\",\\n\\"segment3\\":\\"<h2>Marvell Stock Update - What's in Store?</h2><p>Despite a sales dip, Marvell Technology Group Ltd. maintains a strong buy rating with a target of $94. Find out more about Marvell's performance in the market and what analysts have to say. Dive deeper <a href='#'>here</a>.</p>\\",\\n\\"segment4\\":\\"<h2>Best Smokeless Indoor Grills for 2024</h2><p>Summer is here, and it's time for grilling season! Explore the 6 best smokeless indoor grills for 2024. Whether you're a grilling enthusiast or a novice, these grills are sure to elevate your BBQ game. Get grilling <a href='#'>here</a>.</p>\\",\\n\\"segment5\\":\\"<h2>Hamamatsu Photonics Acquisition of NKT Photonics</h2><p>Exciting news! Hamamatsu Photonics has completed the acquisition of NKT Photonics A/S. This strategic move is set to enhance the capabilities of both companies in the photonics industry. Learn more <a href='#'>here</a>.</p>\\"\\n},\\n\\"author\\": \\"AItakan\\"\\n"
    }

    You should be careful about the order. Start from the most significant to the least significant. In your first keyword make sure you decide that
    the keyword really describes the content with one or two words.

    Expected output: Tech trends, UNOX Ovens, HitPaw Video Converter, Marvell stock, Hamamatsu Photonics, UNOX Lounge, HitPaw Video Converter V4.2.0, Marvell Technology, best indoor grills, Hamamatsu Photonics acquisition, AItakan.
    
    content: ${content}
    
    Your keywords:
    `

    const keywords = await sendToLLM(prompt, isCheapTask);
    sendTelegramMessage('keywords from Blog Post:\n' + keywords);

    return keywords;
  } catch (error) {
    console.error('Error keywords generatingblog post:', error);
    sendTelegramMessage('Error generating blog post keywords:\n' + error);
    return null;
  }
}

async function getBlogPostDescription(content, isCheapTask = true) {
  try {

    const prompt = `You are a description generator. Given the content, determine what the content is about. The content may be in JSON format or plain text; your output should be plain text.
    Example:
    content: {
      "...": "\\n\\"content\\":\\"Stay up-to-date with the latest tech trends and reviews in the tech world with this vibrant and exciting blog post. From UNOX Ovens to HitPaw Video Converter, Marvell stock to Hamamatsu Photonics, and big tech companies forming Ultra Accelerator Link group, get ready to dive into the world of technology like never before!\\",\\n\\"content\\": {\\n\\"segment1\\": \\"<h2>UNOX Ovens Lounge Launch in Guwahati</h2><p>Exciting news! UNOX, a leading Italian brand, has launched UNOX Lounge in Guwahati. This is a major milestone for the brand, following successful launches in Goa and Mumbai. With top-notch Italian technology, UNOX Ovens are set to revolutionize cooking experiences. Read more <a href='#'>here</a>.</p>\\",\\n\\"segment2\\": \\"<h2>HitPaw Video Converter V4.2.0 - What's New?</h2><p>HitPaw introduces the latest software version - HitPaw Video Converter V4.2.0. This update brings exciting new features like video download and music conversion. Enrich your life with HitPaw's innovative software. Learn more <a href='#'>here</a>.</p>\\",\\n\\"segment3\\":\\"<h2>Marvell Stock Update - What's in Store?</h2><p>Despite a sales dip, Marvell Technology Group Ltd. maintains a strong buy rating with a target of $94. Find out more about Marvell's performance in the market and what analysts have to say. Dive deeper <a href='#'>here</a>.</p>\\",\\n\\"segment4\\":\\"<h2>Best Smokeless Indoor Grills for 2024</h2><p>Summer is here, and it's time for grilling season! Explore the 6 best smokeless indoor grills for 2024. Whether you're a grilling enthusiast or a novice, these grills are sure to elevate your BBQ game. Get grilling <a href='#'>here</a>.</p>\\",\\n\\"segment5\\":\\"<h2>Hamamatsu Photonics Acquisition of NKT Photonics</h2><p>Exciting news! Hamamatsu Photonics has completed the acquisition of NKT Photonics A/S. This strategic move is set to enhance the capabilities of both companies in the photonics industry. Learn more <a href='#'>here</a>.</p>\\"\\n},\\n\\"author\\": \\"AItakan\\"\\n"
    }
    Expected output: Stay updated on the latest tech trends and reviews in this exciting blog post. From UNOX Ovens to HitPaw Video Converter, Marvell stock to Hamamatsu Photonics, dive into the world of technology like never before!
    content: ${content}
    
    Your description: `;

    const description = await sendToLLM(prompt, isCheapTask);
    sendTelegramMessage('description from Blog Post:\n' + description);

    return description;
  } catch (error) {
    console.error('Error description generating blog post:', error);
    sendTelegramMessage('Error generating blog post description:\n' + error);
    return null;
  }
};

async function getBlogPostTitle(content, isCheapTask = true) {
  try {
    const prompt = `You are a title generator. Given the content, determine what the content is about. The content may be in JSON format or plain text; your output should be plain text.
    Example:
    content: {
      "...": "\\n\\"content\\":\\"Stay up-to-date with the latest tech trends and reviews in the tech world with this vibrant and exciting blog post. From UNOX Ovens to HitPaw Video Converter, Marvell stock to Hamamatsu Photonics, and big tech companies forming Ultra Accelerator Link group, get ready to dive into the world of technology like never before!\\",\\n\\"content\\": {\\n\\"segment1\\": \\"<h2>UNOX Ovens Lounge Launch in Guwahati</h2><p>Exciting news! UNOX, a leading Italian brand, has launched UNOX Lounge in Guwahati. This is a major milestone for the brand, following successful launches in Goa and Mumbai. With top-notch Italian technology, UNOX Ovens are set to revolutionize cooking experiences. Read more <a href='#'>here</a>.</p>\\",\\n\\"segment2\\": \\"<h2>HitPaw Video Converter V4.2.0 - What's New?</h2><p>HitPaw introduces the latest software version - HitPaw Video Converter V4.2.0. This update brings exciting new features like video download and music conversion. Enrich your life with HitPaw's innovative software. Learn more <a href='#'>here</a>.</p>\\",\\n\\"segment3\\":\\"<h2>Marvell Stock Update - What's in Store?</h2><p>Despite a sales dip, Marvell Technology Group Ltd. maintains a strong buy rating with a target of $94. Find out more about Marvell's performance in the market and what analysts have to say. Dive deeper <a href='#'>here</a>.</p>\\",\\n\\"segment4\\":\\"<h2>Best Smokeless Indoor Grills for 2024</h2><p>Summer is here, and it's time for grilling season! Explore the 6 best smokeless indoor grills for 2024. Whether you're a grilling enthusiast or a novice, these grills are sure to elevate your BBQ game. Get grilling <a href='#'>here</a>.</p>\\",\\n\\"segment5\\":\\"<h2>Hamamatsu Photonics Acquisition of NKT Photonics</h2><p>Exciting news! Hamamatsu Photonics has completed the acquisition of NKT Photonics A/S. This strategic move is set to enhance the capabilities of both companies in the photonics industry. Learn more <a href='#'>here</a>.</p>\\"\\n},\\n\\"author\\": \\"AItakan\\"\\n"
    }
    Expected title: Tech Trends & Reviews
    
    content: ${content}
    
    Now determine the best title according to the content. Make it short!`;

    const title = await sendToLLM(prompt, isCheapTask);
    sendTelegramMessage('title from Blog Post:\n' + title);

    return title;
  } catch (error) {
    console.error('Error title generating blog post:', error);
    sendTelegramMessage('Error generating blog post title:\n' + error);
    return null;
  }
};

export { startAIPostCreation, startUserPostCreation };
