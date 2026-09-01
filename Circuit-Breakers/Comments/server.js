const express = require('express');
const app = express();
const db = require('../Shared/db.js')
const PORT = 3000;

app.use(express.json());

app.post("/comments/create", (req,res) => {
  const {postId, comment, userId} = req.body;\

  if (!postId || !comment || !userId) {
    return res.status(400).json({error: 'Missing required fields'});
  }


  
  try {
    const id = await db.run('INSERT INTO comments (postId, comment, userId, createdAt) VALUES (?, ?, ?, ?)', [newComment.postId, newComment.comment, newComment.userId, newComment.createdAt]);

    const newComment = {
      id,
      postId,
      comment,
      userId,
      createdAt: new Date().toISOString(),
    }

    return res.status(201).json({message: "Comment created successfully", comment: newComment});

  } catch(err) {
    console.error('Error creating comment:', err);
    return res.status(500).json({error: "Internal server error"});
  }

})


app.get('/comments/post/:postId', async (req,res) => {
  const {postId} = req.params;

  const comments = post_id
  ? await db.all('SELECT * FROM comments WHERE postId = ?', [postId])
  : []

  return res.status(200).json({comments});
})


app.get('/comments/:id', async(req, res) => {
  const comment = await db.get('SELECT * FROM comments WHERE id = ?', [id]);

  if (!comment) {
    return res.status(404).json({error: 'Comment not found'});
  }

  const {user_id, post_id}= comment;

  const post = await axios.get(`http://localhost:3000/posts/${post_id}`);
  if (!post) {
    return res.status(404).json({error: 'Post not found'});
  }

  const user = await axios.get(`http://localhost:3000/users/${user_id}`);
  if (!user) {
    return res.status(404).json({error: 'User not found'});
  }

  res.json({
    ...comment,
    post: post.data,
    user: user.data,
  })
})


const healthCheck = async() => {
  const checks = {};

  try {
    await db.run('SELECT 1');
    checks.db = 'ok';
  } catch(err) {
    checks.db = 'fail';
  }

  const healthy = Object.values(checks).every(status => status === 'ok');
  return healthy;
}


app.get('/health', async (req, res) => {
  const healthy = await healthCheck();
  res.json({healthy});
})

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`server listending on ${PORT}`);
  })
}).catch((err) => {
  console.error('Error initializing database:', err);
  process.exit(1);
})
