const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2')
const db = mysql.createConnection({
    host: process.env.HOSTNAME_DDB,
    user: process.env.USERNAME_DDB,
    password: process.env.PASSWORD_DDB,
    database: process.env.DATABASE_DDB
});

function executeRequest(sql, callback) {
    db.connect(function (err) {
        if (err){
            console.log("TOTO")
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

module.exports = { executeRequest }; //pq sa veut pas push