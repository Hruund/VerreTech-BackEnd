const dotenv = require('dotenv');
const res = require('express/lib/response');
dotenv.config();
const mysql = require('mysql2')
const db = mysql.createConnection({
    host: process.env.HOSTNAME_DDB || "54.36.191.244",
    user: process.env.USERNAME_DDB || "back",
    password: process.env.PASSWORD_DDB || "VerreTech@2021",
    database: process.env.DATABASE_DDB || "verretech"
});

function executeRequest(sql, callback) {
    db.connect(function (err) {
        if (err){
            throw err;
        }
        db.query(sql, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    });
}

module.exports = { executeRequest };
