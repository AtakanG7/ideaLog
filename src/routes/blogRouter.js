import { Router } from "express";
import { Blogs } from "../models/blogs.js";
import { sendTelegramMessage } from "../../apis/telegram.js";
import { blogController } from "../controllers/blogController.js";
import AuthController from "../controllers/authControllers/authController.js";
const authController = new AuthController();

// Bind the sub-controller functions to the AuthController instance
const adminRules = [authController.authControllerMiddlewares.isAdmin];

// Using express router, creating specific routes
const router = Router()

router.get('/blog/:id',  async (req, res) => {
    try {
      let postId = req.params.id;
  
      const data = await Blogs.findById({ _id: postId });
      console.log("data")
      console.log(data)

      res.render('./pages/blogPage', {
        data:data,
        currentRoute: `/blogs`
      });
    } catch (error) {
        sendTelegramMessage(`[Error] ${error.message}`);
        console.log(error);
    }
});

router.get("/update/:id", (req, res) => {
    const { id } = req.params;
    res.render("./pages/blogEditPage", { id: Number(id), currentRoute: `/blogs/update/post_id-${id}` })
});

router.get("/new/blog/create", (req, res) => {
    res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

router.post("/", async (req, res) => {
    const author =('66455700e6482791a4404afe');
    console.log(req.body)
    const { title, authorName, status, content } = req.body;
    const blog = new Blogs({ 
      title: title,
      authorName: authorName,
      description: "weqwqewq",
      status: status,
      content: content,
      author: author,
      createdAt: Date.now(),
     });
    await blog.save();
    res.redirect("/blogs/blog/" + blog._id);
});

router.get("/new/blog/create", (req, res) => {
  res.render("./pages/blogPostPage", { currentRoute: `/blogs/creation` })
});

// Create a route to make text search on mongo db blogs collection starts
router.get("/search", async (req, res) => {
  const search = req.query.search;
  const result = await Blogs.find({ $text: { $search: search } });
  res.send(result);
});

router.get("/ai", blogController.createAIGeneratedBlogs);



export default router;