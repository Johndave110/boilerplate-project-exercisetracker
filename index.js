const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let users = []
let exercises = []

app.post("/api/users", (req, res) => {
  const username = req.body.username
  const newUser = { username, _id: Date.now().toString() }
  users.push(newUser)
  res.json(newUser)
})

app.get("/api/users", (req, res) => {
  res.json(users)
})

app.post("/api/users/:_id/exercises", (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: "User not found" })

  const { description, duration, date } = req.body
  const exercise = {
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }

  exercises.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  })
})

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.json({ error: "User not found" })

  let log = exercises
    .filter(ex => ex.userId === user._id)
    .map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date
    }))

  if (from) {
    const fromDate = new Date(from)
    log = log.filter(ex => new Date(ex.date) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    log = log.filter(ex => new Date(ex.date) <= toDate)
  }

  if (limit) {
    log = log.slice(0, parseInt(limit))
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  })
})

const listener = app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + listener.address().port)
})