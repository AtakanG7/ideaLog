import { Router } from "express";
import { Blogs } from "../models/blogs.js";
import { sendTelegramMessage } from "../../config/telegram.js";
// Using express router, creating specific routes
const router = Router()

router.get('/:id', async (req, res) => {
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
    res.render("./pages/blogEditPage", { id: Number(id), currentRoute: `/blogs` })
});

export default router;