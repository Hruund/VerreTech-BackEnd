const { executeRequest } = require('./../database/database_utils');
const bcrypt = require('bcrypt');

const tableToUse = 'users';

function tryToLogin(username, password, callback) {
    let sql = `SELECT * FROM ${tableToUse} WHERE username = '${username}' LIMIT 1`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            if (rows.length === 0) {
                callback(null, null);
            } else {
                comparePassword(password, rows[0].password)
                    .then(async () => {
                        let user = "good";
                        callback(null, user);
                    })
                    .catch(err => {
                        callback(err, null);
                    });
            }
        }
    });
}

function tryToRegister(paramsObject,callback) {
    let sql = `SELECT * FROM ${tableToUse} WHERE email = '${paramsObject.email}'`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            if (rows.length === 0) {
                bcrypt.hash(paramsObject.password, 10)
                    .then(hash => { 
                        let sql = `INSERT INTO ${tableToUse} (username, password, email) VALUES ('${paramsObject.username}', '${hash}', '${paramsObject.email}')`;
                        executeRequest(sql, (err, rows) => {
                            if (err) {
                                callback(err, null);
                            } else {
                                let user = "good";
                                callback(null, user);
                            }
                        });
                    })
                    .catch(err => {
                        callback(err, null);
                    });
            } else {
                callback(null, null);
            }
        }
    });
}

async function comparePassword(plainPassword, hash) {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, hash, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

module.exports = { tryToLogin, tryToRegister };