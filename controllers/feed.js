const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({ message: 'Fetched successfully', posts, totalItems });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed, entered data not correct');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const err = new Error('No image');
    err.statusCode = 422;
    throw err;
  }

  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: {
      name: 'oksana',
    },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: ' post create successfully',
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error('Could not find post');
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({ message: 'Post fetched', post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed, entered data not correct');
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error('Could not find post');
        err.statusCode = 404;
        throw err;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.cintent = content;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'post updated', post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const err = new Error('Could not find post');
        err.statusCode = 404;
        throw err;
      }
      //check logged user
      clearImage(post.imageUrl);
      return Post.findByIdAndDelete(postId);
    })
    .then(() => {
      res.status(200).json({ message: 'post deleted' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
