const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT

const cors = require('cors')
const corsOption = {
  origin: '*'
}
app.use(cors(corsOption))

const { executeRequest } = require('./database/database_utils')

app.get('/', (req, res) => {
  res.send('YA RIEN ICI');
})

app.get('api/cart/:id', (req, res) => {
  const sql = `SELECT * FROM cart WHERE user_id = ${req.params.id}`
  executeRequest(sql, (err, rows) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(rows)
    }
  })
})

app.get('/api/products', (req, res) => {
  executeRequest('SELECT * FROM product', (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})

const { tryToLogin } = require('./user/user')

app.post('/api/login', (req, res) => {
  let email = req.query.email;
  let password = req.query.password;
  tryToLogin(email, password, (err, return_object) => {
    if (err) {
      res.json({
        message : err
      })
    } else {
      res.json({ message: "success",access_token: return_object.token, user : return_object.user })
    }
  });
})

const { tryToRegister } = require('./user/user')

app.post('/register', (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  let email = req.query.email;
  tryToRegister({username, password, email}, (err, user) => {
    if(err) {
      res.json({
        message: err
      })
    } else {
      res.json({
        message: "success"
      })
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})