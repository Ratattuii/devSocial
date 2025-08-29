const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:id', postController.getPostById);
router.post('/', authMiddleware.verifyToken, postController.createPost);

router.get('/', postController.searchPosts);

router.get('/:postId/comments', commentController.getCommentsByPostId);
router.post('/:postId/comments', authMiddleware.verifyToken, commentController.createComment);

router.post('/:postId/like', authMiddleware.verifyToken, postController.toggleLike);
router.post('/:postId/favorite', authMiddleware.verifyToken, postController.toggleFavorite);

router.put('/:id', authMiddleware.verifyToken, postController.updatePost);
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

module.exports = router;