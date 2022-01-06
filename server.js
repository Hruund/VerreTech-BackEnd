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

app.get('/api/products', (req, res) => {
  executeRequest('SELECT * FROM product', (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})

const { tryToLogin } = require('./user/user')

app.post('/login', (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  tryToLogin(username, password, (err, user) => {
    if (err) {
      res.json({
        error: err
      })
    } else {
      res.json({
        user: user
      })
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
        error: err
      })
    } else {
      res.json({
        user: user
      })
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})