const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = []
let exercises = []

app.post("/api/users", (req, res) => {
  const username = req.body.username
  const newUser = {
    _id: Date.now().toString(),
    username
  }
  users.push(newUser)
  res.json(newUser)
})

app.get("/api/users", (req, res) => {
  res.json(users)
})

app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body
  const user = users.find(u => u._id === req.params._id)

  if (!user) return res.json({ error: "User not found" })

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: user._id,
    username: user.username
  }

  exercises.push({ ...exercise, userId: user._id })

  res.json(exercise)
})

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query
  const user = users.find(u => u._id === req.params._id)

  if (!user) return res.json({ error: "User not found" })

  let userLogs = exercises.filter(e => e.userId === user._id)

  if (from) {
    const fromDate = new Date(from)
    userLogs = userLogs.filter(e => new Date(e.date) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    userLogs = userLogs.filter(e => new Date(e.date) <= toDate)
  }

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit))
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userLogs.length,
    log: userLogs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  })
})

const listener = app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + listener.address().port)
})