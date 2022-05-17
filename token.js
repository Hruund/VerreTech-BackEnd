const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_TOKEN || 4000

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

/***** TOKEN *****/
app.post('/api/checkToken', (req, res) => {
    const token = req.query.access_token;
    const id = req.query.id;
    const username = req.query.username;

    if (token == null || id == null || username == null) {
        const decoded = jwt.decode(token, PASSPHRASE, { complete: false });
        if (decoded.id == id && decoded.email == req.query.email) {
            res.status(200).json({
                content: decoded,
                message: "success"
            });
        } else {
            res.status(500).json({
                error: "Unable to verify this token",
                message: "failure"
            })
        }
    } else {
        res.status(500).json({
            error: "Unable to verify this token",
            message: "failure"
        })
    }
})

app.post('/api/checkToken_admin', (req, res) => {
    const token = req.query.access_token;
    const id = req.query.id;
    const username = req.query.username;

    if (token == null || id == null || username == null) {
        const decoded = jwt.decode(token, PASSPHRASE, { complete: false });
        if (decoded.id == id && decoded.email == req.query.email) {
            let sql = `SELECT isAdmin FROM users WHERE id = ${id}`;
            executeRequest(sql, (err, rows) => {
                if (err) {
                    res.json({
                        message: err,
                        error: "ERROR CHECK ADMIN"
                    })
                } else {
                    if (rows[0].isAdmin == 1) {
                        res.status(200).json({
                            message: "success",
                            isAdmin: true
                        })
                    } else {
                        res.status(200).json({
                            message: "error user is not admin",
                        })
                    }
                }
            })
        } else {
            res.status(500).json({
                error: "Unable to verify this token",
                message: "failure"
            })
        }
    } else {
        res.status(500).json({
            error: "Unable to verify this token",
            message: "failure"
        })
    }
})

app.listen(port, () => {
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})