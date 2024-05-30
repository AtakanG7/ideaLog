import { Blogs } from "../models/blogs.js";
import { fetchLatestTechNews, generateBlogPost, startAIPostCreation } from "../../apis/llm.js";

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
          currentRoute: '/'
        });
    },
    
    createAIGeneratedBlogs: async (req, res) => {
        const content = await startAIPostCreation()
        console.log(content)
        // Save the ai post to the database
        const blog = new Blogs({ 
            title: "First AI generated blog post",
            description: "I will not delete this blog post ı want it to be public. AHAHAHA",
            content: content,
            authorName: "AItakan",
            author: "66455700e6482791a4404afe", // AItakan's special id :)
            createdAt: Date.now(),
            publisedAt: Date.now(),
            category: "technology",
            status: "published"
         });
        await blog.save();
        res.redirect("/blogs/blog/" + blog._id);
    }
}

