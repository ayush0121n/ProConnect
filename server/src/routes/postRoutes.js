const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, updatePost, deletePost, likePost, unlikePost, addComment, deleteComment, getPostsByHashtag } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPosts);
router.post('/', protect, createPost);
router.get('/hashtag/:tag', protect, getPostsByHashtag);
router.get('/:id', protect, getPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
