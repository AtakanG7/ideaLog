import { Router } from "express";
import { Blogs } from "../models/blogs.js";
import { Comments } from "../models/comments.js";
import { sendTelegramMessage } from "../../apis/telegram.js";
import { blogController } from "../controllers/blogController.js";
import authControllerMiddleware from "../controllers/authControllers/authControllerMiddlewares.js";
const authControllerMiddlewares = new authControllerMiddleware();

const isAuth = [authControllerMiddlewares.mustAuthenticated];
const isAdmin = [authControllerMiddlewares.mustBeAdmin];

// Using express router, creating specific routes
const router = Router()

router.get('/blog/:id',  async (req, res) => {
    try {
      let postId = req.params.id;
  
      const data = await Blogs.findById({ _id: postId });

      const comments = await Comments.find({ post: postId });
      
      // Add view count
      data.views += 1;
      await data.save();

      res.render('./pages/blogPage', {
        data:data,
        comments: comments,
        currentRoute: `/blogs`
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

router.get("/create", isAuth, (req, res) => {
    res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

router.post("/", isAuth, async (req, res) => {
    const author = '66583b4238da789167af97ce';
    const { authorName, category, description ,status, content } = req.body;
    const blog = new Blogs({ 
      authorName: "Atakan Gül",
      category: category,
      description: description,
      status: 'published',
      content: content,
      author: author,
      createdAt: Date.now(),
     });
    await blog.save();
    res.redirect("/blogs/blog/" + blog._id);
});

router.get("/new/blog/create", isAuth, (req, res) => {
  res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

// Create a route to make text search on mongo db blogs collection starts
router.get("/search", async (req, res) => {
  const search = req.query.search;
  // find the blog with the text
  const result = await Blogs.find({ $text: { $search: search } });
  res.json(result);
});

router.get("/ai/:id", isAuth, isAdmin, blogController.createAIGeneratedBlogs);

router.post("/blog/comments", isAuth , async (req, res) => {
  const { content, author, post} = req.body;
  
  if (!content || !author || !post) {
    res.status(400).json({ success: false });
    return;
  }

  const user = await authControllerMiddlewares.getUserFromSession(req, res);
  console.log(user)
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

  res.status(200).json({ success: true });
});

router.get('/blog/delete/:id', isAuth, isAdmin, async (req, res) => {
  const { id } = req.params;
  await Blogs.findByIdAndDelete(id);
  res.redirect('/blogs'); 
});

router.post('/blog/like', async (req, res) => {
  const { _id } = req.body;
  const blog = await Blogs.findById(_id);
  blog.likes += 1;
  await blog.save();
  res.status(200).json({ success: true });
});

export default router;