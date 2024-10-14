import { Router } from "express";
import { Blogs } from "../models/blogs.js";
import { Comments } from "../models/comments.js";
import { sendTelegramMessage } from "../../apis/services/telegram.js";
import { blogController } from "../controllers/blogController.js";
import authControllerMiddleware from "../controllers/authControllers/authControllerMiddlewares.js";
const authControllerMiddlewares = new authControllerMiddleware();

const isAuth = [authControllerMiddlewares.mustAuthenticated];
const isAdmin = [authControllerMiddlewares.mustBeAdmin];

// Using express router, creating specific routes
const router = Router()

router.get('/most-viewed', async (req, res) => {
  const mostViewedPosts = await Blogs
    .find({ status: 'published' })
    .sort({ publishedAt : -1})
    .limit(3);

  res.json(mostViewedPosts);
});

router.get("/recommendations", blogController.getNextPopularBlogs);

router.get("/q", async (req, res) => {
  const search = req.query.q;
  // find the blog with the text
  const result = await Blogs.find({ $text: { $search: search } }).limit(10);
  res.json(result);
});

router.get("/create", isAdmin, isAuth, (req, res) => {
  res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

router.get("/search", blogController.getRelatedBlogs);

router.get('/:url',  async (req, res) => {
    try {
      let postURL = req.params.url;
  
      const post = await Blogs.findOne({ url: postURL });
      
      const comments = await Comments.find({ post: post._id, verified: true });
      
      // Get most viewed posts
      const mostViewedPosts = await Blogs
        .find({ status: 'published' })
        .sort({ views: -1 })
        .limit(3);

      // Add view count
      post.views += 1;
      await post.save();
     
      res.render('./pages/blogPage', {
        data:post,
        comments: comments,
        currentRoute: `/blogs`,
        recommendations: mostViewedPosts
      });
    } catch (error) {
        sendTelegramMessage(`[Error] ${error.message}`);
        console.log(error);
    }
});

router.get("/update/:id", isAuth, isAdmin, (req, res) => {
    const { id } = req.params;
    res.render("./pages/blogEditPage", { id: Number(id), currentRoute: `/blogs/update/post_id-${id}` })
});

router.post("/", isAuth, isAdmin, blogController.createUserWrittenBlogs);

router.get("/new/blog/create", isAuth, isAdmin, (req, res) => {
  res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

router.get("/ai/:id", isAuth, isAdmin, blogController.createAIGeneratedBlogs);

router.post("/comments", isAuth , async (req, res) => {
  const { content, author, post} = req.body;
  
  if (!content || !author || !post) {
    res.status(400).json({ success: false });
    return;
  }

  const user = await authControllerMiddlewares.getUserFromSession(req, res);
  const comment = new Comments({
    content: content,
    author: user._id,
    authorName: user.name ? user.name : user.email,
    createdAt: Date.now(),
    post: post
  });
  await comment.save();

  const blog = await Blogs.findById(post);
  blog.comments.push(comment._id);
  await blog.save();

  res.status(200).json({ success: true, comment: comment });
});

router.get('/delete/:id', isAuth, isAdmin, async (req, res) => {
  const { id } = req.params;
  await Blogs.findByIdAndDelete(id);
  res.redirect('/blogs'); 
});

router.post('/like', async (req, res) => {
  const { _id } = req.body;
  const blog = await Blogs.findById(_id);
  blog.likes += 1;
  await blog.save();
  res.status(200).json({ success: true });
});

export default router;

