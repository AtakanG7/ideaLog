import { Blogs } from "../models/blogs.js";
import { Users } from "../models/users.js";
import { sendTelegramMessage } from "../../apis/telegram.js";
import { startAIPostCreation, startUserPostCreation } from "../../apis/llm.js";
import AuthController from "../controllers/authControllers/authController.js";
const authController = new AuthController();
/**
 * Controller for managing blog-related operations
 */
export const  blogController = {
    /**
     * Create a new blog post
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    createBlog: async (req, res) => {
        const { title, content, author } = req.body;
        const blog = new Blogs({ title, content, author });
        await blog.save();
        res.redirect("/");
    },

    /**
     * Update an existing blog post
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    updateBlog: async (req, res) => {
        const { blogId } = req.params;
        const { title, content, author } = req.body;
        await Blogs.findByIdAndUpdate(blogId, { title, content, author });
        res.redirect("/blogs");
    },  

    /**
     * Delete a blog post
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    deleteBlog: async (req, res) => {
        const { blogId } = req.params;
        await Blogs.findByIdAndDelete(blogId);
        res.redirect("/blogs");
    },

    /**
     * Get all blog posts
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    getAllBlogs: async (req, res) => {
        const blogs = await Blogs.find();   
        res.render("./pages/blogPage.ejs", { blogs });
    },

    /**
     * Get a specific blog post by ID
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    getBlogById: async (req, res) => {
        const { blogId } = req.params;
        const blog = await Blogs.findById(blogId);
        res.render("./pages/blogEditPage.ejs", { blog });
    },

    /**
     * Get all blog posts belonging to a specific user
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    getBlogsByUser: async (req, res) => {
        const { userId } = req.params;
        const blogs = await Blogs.find({ author: userId });
        res.render("./pages/blogPage.ejs", { blogs });
    },

    // Get blogs with the status published. Crete the function.
    getPublishedBlogs: async (req, res) => {
        let perPage = 10;
        let page = req.query.page || 1;
        

        const data = await Blogs
            .find({ status: 'published' })
            .sort({ createdAt: -1 })
            .skip(perPage * (page - 1))
            .limit(perPage)
            .exec();
    
        // Count is deprecated - please use countDocuments
        // const count = await Post.count();
        const count = await Blogs.countDocuments({});
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
    
        res.render('../views/pages/indexPage', { 
          data,
          current: page,
          blogCount: count,
          nextPage: hasNextPage ? nextPage : null,
          currentRoute: '/',
        });
    },
    
    createAIGeneratedBlogs: async (req, res) => {
        try {
            sendTelegramMessage(`[INFO] Starting ai blog creation...`);
            
            // Get blog post required metadata minus authorMetadata
            const blogPostRequiredMetadata = await startAIPostCreation(req.query.q)
            
            // Get author metadata
            const authorMetadata = await Users.findById(req.params.id)
            
            // Save the ai post to the database
            const blog = new Blogs({
                ...blogPostRequiredMetadata,
                authorMetadata: authorMetadata,
                status: 'published',
            });

            await blog.save();

            res.status(200).json({
                success: true,
                message: "Blog post created successfully",
                data: blog
            });
        } catch (error) {
            sendTelegramMessage(`[Error] During ai blog creation:  ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    createUserWrittenBlogs: async (req, res) => {
        try {
            sendTelegramMessage(`[INFO] Starting user blog creation...`);
            
            // Get blog post required metadata minus authorMetadata
            const blogPostRequiredMetadata = await startUserPostCreation(req.body.content)
            
            // Get author metadata
            const authorMetadata = await authController.authControllerMiddlewares.getUserFromSession(req, res);
            
            console.log(authorMetadata)
            
            // Save the ai post to the database
            const blog = new Blogs({
                ...blogPostRequiredMetadata,
                authorMetadata: authorMetadata,
                status: 'published',
            });

            await blog.save();

            res.status(200).json({
                success: true,
                message: "Blog post created successfully",
                data: blog
            });
        } catch (error) {
            sendTelegramMessage(`[Error] During ai blog creation:  ${error.message}`);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
}

