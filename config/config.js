import dotenv from "dotenv";
dotenv.config();

class Config {
   constructor(){ 
      this.OPENAI_BASE_MODEL = process.env.OPENAI_BASE_MODEL;
      this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      this.NEWS_API_KEY = process.env.NEWS_API_KEY;
      this.BREVO_SMTP_API_KEY = process.env.BREVO_SMTP_API_KEY;
      this.BREVO_LIST_ID = process.env.BREVO_LIST_ID ? process.env.BREVO_LIST_ID : 5;
      this.SECRET_KEY = process.env.SECRET_KEY; 
      this.SESSION_SECRET = process.env.SESSION_SECRET; 
      this.PORT = process.env.PORT; 
      this.GOOGLE_OAUTH2_ID = process.env.GOOGLE_OAUTH2_ID; 
      this.GOOGLE_OAUTH2_SECRET = process.env.GOOGLE_OAUTH2_SECRET; 
      this.REDIS_PASSWORD = process.env.REDIS_PASSWORD; 
      this.REDIS_HOST = process.env.REDIS_HOST; 
      this.REDIS_PORT = process.env.REDIS_PORT; 
      this.BREVO_SMTP_SERVER = process.env.BREVO_SMTP_SERVER; 
      this.BREVO_SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN; 
      this.BREVO_SMTP_PASSWORD = process.env.BREVO_SMTP_PASSWORD; 
      this.BREVO_SMTP_PORT = process.env.BREVO_SMTP_PORT; 
      this.MONGODB_NAME = process.env.MONGODB_NAME; 
      this.MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
      this.MONGODB_DEPLOYMENT_STRING = process.env.MONGODB_DEPLOYMENT_STRING; 
      this.DOMAIN = process.env.DOMAIN ? `http://${process.env.DOMAIN}` : `http://localhost:${this.PORT}`; 
      this.ADMIN_EMAIL = process.env.ADMIN_EMAIL === undefined ? 'pwxcv7352@gmail.com' : process.env.ADMIN_EMAIL; 
      this.TELEGRAM_API_BASE_URL = process.env.TELEGRAM_API_BASE_URL; 
      this.TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
      this.TELEGRAM_BOT_CHAT_ID = process.env.TELEGRAM_BOT_CHAT_ID; 
   }
 }
 
 export default Config;
 