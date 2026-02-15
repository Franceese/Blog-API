const Blog = require("../models/blog.model");
const calculateReadingTime = require("../utils/readingTime");

/**
 * Create Blog
 */
exports.createBlog = async (req, res, next) => {
  try {
    const reading_time = calculateReadingTime(req.body.body);

    const blog = await Blog.create({
      ...req.body,
      author: req.user._id,
      reading_time,
    });

    res.status(201).json(blog);
  } catch (error) {
    next(error);
  }
};

/**
 * Publish Blog
 */
exports.publishBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    blog.state = "published";
    await blog.save();

    res.json(blog);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Blog
 */
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    Object.assign(blog, req.body);

    if (req.body.body) {
      blog.reading_time = calculateReadingTime(blog.body);
    }

    await blog.save();

    res.json(blog);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Blog
 */
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    await blog.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Logged-in User Blogs
 */
exports.getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate("author", "-password")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Published Blogs (Public)
 */
exports.getPublishedBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const query = { state: "published" };

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Filter by title (case insensitive)
    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: "i" };
    }

    // Filter by multiple tags
    if (req.query.tags) {
      const tagsArray = req.query.tags.split(",");
      query.tags = { $in: tagsArray };
    }

    // Safe sorting
    const allowedSortFields = ["createdAt", "read_count", "reading_time"];
    let sort = { createdAt: -1 };

    if (
      req.query.orderBy &&
      allowedSortFields.includes(req.query.orderBy)
    ) {
      sort[req.query.orderBy] =
        req.query.order === "desc" ? -1 : 1;
    }

    const blogs = await Blog.find(query)
      .populate("author", "-password")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json(blogs);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Published Blog
 */
exports.getSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      state: "published",
    }).populate("author", "-password");

    if (!blog)
      return res.status(404).json({ message: "Blog not found" });

    // Atomic increment
    await Blog.findByIdAndUpdate(req.params.id, {
      $inc: { read_count: 1 },
    });

    res.json(blog);
  } catch (error) {
    next(error);
  }
};
