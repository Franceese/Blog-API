const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const blogController = require("../controllers/blog.controller");

// Public routes
router.get("/", blogController.getPublishedBlogs);
router.get("/user/me", authMiddleware, blogController.getMyBlogs);
router.get("/:id", blogController.getSingleBlog);

// Protected routes
router.post("/", authMiddleware, blogController.createBlog);
router.patch("/:id/publish", authMiddleware, blogController.publishBlog);
router.patch("/:id", authMiddleware, blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

module.exports = router;
