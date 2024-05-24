import { Blogs } from "../models/blogs.js";

/**
 * Controller for managing blog-related operations
 */
export const blogController = {
    /**
     * Create a new blog post
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     */
    createBlog: async (req, res) => {
        const { title, content, author } = req.body;
        const blog = new Blogs({ title, content, author });
        await blog.save();
        res.redirect("/blogs");
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
    }
}

