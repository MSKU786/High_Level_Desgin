const express = require('express');

const db = require('../Shared/db.js')
const PORT = 3001;
const {callService} = require('../Shared/downstream.js')

const app = express();
app.use(express.json());

app.post("/posts", async (req,res) => {
  const {title, body, userId} = req.body;

  if (!title || !userId) {
    return res.status(400).json({error: 'Missing required fields'});
  }

  const newPost = {
    title,
    body,
    userId,
    createdAt: new Date().toISOString(),
  }

  
  try {
    const id = await db.run('INSERT INTO posts (title, body, userId, createdAt) VALUES (?, ?, ?, ?)', [newPost.title, newPost.body, newPost.userId, newPost.createdAt]);

    return res.status(201).json({message: "Post created successfully", post: newPost});

  } catch(err) {
    console.error('Error creating posts:', err);
    return res.status(500).json({error: "Internal server error"});
  }

})


app.get('/post/:postId', async (req,res) => {
  const {postId} = req.params;

  const post = post_id
  ? await db.all('SELECT * FROM posts WHERE id = ?', [postId])
  : []


  try {
    const user = await callService('users', `http://localhost:3002/users/${userId}`);
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    return res.json({...post, user})
  } catch(e) {
    if (e.circuitOpen) {
      return res.status(503).json({error: 'user service unavilable'})
    }

    return res.status(502).json({error: 'failed to fetch user'})
  }
})


app.get('/posts/:userId', async(req, res) => {
  const {userId} = req.params;

  const posts = userId
  ? await db.all('SELECT * FROM posts WHERE userId = ?', [userId])
  : []

  return res.status(200).json({posts});
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
