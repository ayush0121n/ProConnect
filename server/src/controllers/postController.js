const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'firstName lastName profilePicture headline company')
      .populate('comments.user', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await Post.countDocuments({ visibility: 'public' });
    res.json({ success: true, data: posts, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (error) { next(error); }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture headline')
      .populate('comments.user', 'firstName lastName profilePicture');
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
};

exports.createPost = async (req, res, next) => {
  try {
    const { content, visibility, hashtags, media } = req.body;
    const extractedTags = content.match(/#\w+/g)?.map(t => t.slice(1).toLowerCase()) || [];
    const allTags = [...new Set([...(hashtags || []), ...extractedTags])];
    const post = await Post.create({ author: req.user._id, content, visibility: visibility || 'public', hashtags: allTags, media: media || [] });
    const populated = await Post.findById(post._id).populate('author', 'firstName lastName profilePicture headline');
    res.status(201).json({ success: true, data: populated, message: 'Post created successfully' });
  } catch (error) { next(error); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Not authorized' });
    post.content = req.body.content || post.content;
    post.visibility = req.body.visibility || post.visibility;
    post.isEdited = true; post.editedAt = Date.now();
    await post.save();
    res.json({ success: true, data: post, message: 'Post updated' });
  } catch (error) { next(error); }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) { next(error); }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    if (post.likes.some(l => l.user.toString() === req.user._id.toString())) return res.status(400).json({ success: false, error: 'Already liked' });
    post.likes.push({ user: req.user._id });
    post.likesCount = post.likes.length;
    await post.save();
    if (post.author.toString() !== req.user._id.toString()) {
      Notification.create({ recipient: post.author, sender: req.user._id, type: 'post_like', content: `${req.user.firstName} liked your post`, relatedEntity: { entityType: 'post', entityId: post._id } }).catch(() => {});
    }
    res.json({ success: true, data: { likesCount: post.likesCount } });
  } catch (error) { next(error); }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    post.likes = post.likes.filter(l => l.user.toString() !== req.user._id.toString());
    post.likesCount = post.likes.length;
    await post.save();
    res.json({ success: true, data: { likesCount: post.likesCount } });
  } catch (error) { next(error); }
};

exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    post.comments.push({ user: req.user._id, text: req.body.text });
    post.commentsCount = post.comments.length;
    await post.save();
    if (post.author.toString() !== req.user._id.toString()) {
      Notification.create({ recipient: post.author, sender: req.user._id, type: 'post_comment', content: `${req.user.firstName} commented on your post`, relatedEntity: { entityType: 'post', entityId: post._id } }).catch(() => {});
    }
    const populated = await Post.findById(post._id).populate('comments.user', 'firstName lastName profilePicture');
    res.status(201).json({ success: true, data: populated.comments });
  } catch (error) { next(error); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Not authorized' });
    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    post.commentsCount = post.comments.length;
    await post.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) { next(error); }
};

exports.getPostsByHashtag = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Post.find({ hashtags: req.params.tag.toLowerCase() })
      .populate('author', 'firstName lastName profilePicture headline')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ success: true, data: posts });
  } catch (error) { next(error); }
};
