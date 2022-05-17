const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_USER || 6500

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

app.post('/api/register', (req, res) => {

    const objectToSend = {
        username : req.query.lastname + "." + req.query.firstname,
        email : req.query.email,
        password : req.query.password,

        nom : req.query.lastname,
        prenom : req.query.firstname,

        user_adress : req.query.address,
        user_postal_code: req.query.addressCP,
        user_city : req.query.city,
        user_phone: req.query.number,
    };

    tryToRegister(objectToSend, (err, user) => {
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


const { getUserInfo } = require('./user/user')
app.get('/api/user/:id', (req, res) => {
    const requestID = req.params.id;
    const Token = req.query.access_token;
    const params = {
        id: requestID,
        token : Token
    };
    getUserInfo(params, (err, user) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.json({
                message: "success",
                user: user
            })
        }
    });
        
})

app.listen(port, () => {
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})