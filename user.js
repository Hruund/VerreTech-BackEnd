const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_USER

const jwt = require("jsonwebtoken");
const PASSPHRASE = process.env.PASSPHRASE;

const cors = require('cors')
const corsOption = {
    origin: '*'
}
app.use(cors(corsOption))

const { executeRequest } = require('./database/database_utils')

app.get('/', (req, res) => {
    res.send('YA RIEN ICI');
})

/***** USER *****/
const { tryToLogin } = require('./user/user')

app.post('/api/login', (req, res) => {
    let email = req.query.email;
    let password = req.query.password;
    tryToLogin(email, password, (err, return_object) => {
        if (err) {
            res.json({
                message: "error",
                error: err
            })
        } else {
            res.json({ message: "success", access_token: return_object.token, user: return_object.user })
        }
    });
})

const { tryToRegister } = require('./user/user')

app.post('/api/register', (req, res) => { //TODO entrer les autres données!!!
    let username = req.query.lastname + "." + req.query.firstname;
    let password = req.query.password;
    let email = req.query.email;
    tryToRegister({ username, password, email }, (err, user) => {
        if (err) {
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
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})