const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Blog = require('./modules/blog.models');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Error handler
const handleError = (res, err) => {
    console.error(err);
    res.status(500).send({ message: "Something went wrong" });
};

// Create blog
app.post('/create-blog', async (req, res) => {
    const { title, description } = req.body;

    try {
        if (await Blog.exists({ title })) {
            return res.status(400).send({ message: "Title already exists!" });
        }

        const blog = new Blog({ title, description });
        const savedBlog = await blog.save();
        res.status(201).send(savedBlog);
    } catch (err) {
        handleError(res, err);
    }
});

// Get all blogs
app.get('/get-blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.send({ count: blogs.length, data: blogs });
    } catch (err) {
        handleError(res, err);
    }
});

// Get single blog
app.get('/blog/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ message: "Blog not found" });
        }
        res.send(blog);
    } catch (err) {
        handleError(res, err);
    }
});

// Update blog
app.put('/blog/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, data, { new: true });
        if (!updatedBlog) {
            return res.status(404).send({ message: "Blog not found" });
        }
        res.send(updatedBlog);
    } catch (err) {
        handleError(res, err);
    }
});

// Delete blog
app.delete('/blog/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).send({ message: "Blog not found" });
        }
        res.send({ message: "Blog deleted" });
    } catch (err) {
        handleError(res, err);
    }
});

// Root route
app.get('/', (req, res) => {
    res.send("Hello from server 3000");
});

// Connect to MongoDB and start server
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        });
    })
    .catch(err => {
        console.error(err);
    });
