const express = require('express');
const app = express();
const PORT = 3000;
const db = require('../Shared/db')

app.use(express.json());

app.post("/users", async (req,res) => {
  const {name, email} = req.body;

  if (!name || !email) {
    return res.status(400).json({error: "name and email are required"})
  }

  const {id} = await db.run(
    'INSERT INTO users (name,email) VALUE (?,?)',
    [name, email]
  )

  res.status(201).json({id, name, email})
})


app.get('/users', async(req, res) => {
  const users = await db.all('SELECT * FROM users ORDER BY id');
  res.json(users);
})


app.get('/users/:id', async (req, res) => {
  const user = await db.get('SELECT *  FROM users WHERE id = ?'. [req.params.id]);
  if (!user) {
    return res.status(404).json({error: 'Users not found'})
  }
  return res.json(user);
})


const healthCheck = async() => {
  const checks = {};

  try {
    await db.all('SELECT id from users LIMIT 1')
    return true;
  } catch(e) {
    return false;
  }
}

app.get('/users/health', async(req, res) => {
  const healthy = await healthCheck();
  res.status(healthy ? 200: 503).json({healthy})
})

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`server listending on ${PORT}`);
  })
})
