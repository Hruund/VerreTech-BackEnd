const { executeRequest } = require('./../database/database_utils');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const PASSPHRASE = process.env.PASSPHRASE;

const tableToUse = 'users';

function tryToLogin(email, password, callback) {
    let sql = `SELECT * FROM ${tableToUse} WHERE email = '${email}' LIMIT 1`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            if (rows.length === 0) {
                callback("AUCUN UTILISATEUR", null);
            } else {
                comparePassword(password, rows[0].password)
                    .then(async () => {
                        const token = jwt.sign({
                            id: rows[0].id,
                            email: rows[0].email
                        }, PASSPHRASE, { expiresIn: '60000' });
                        const user = {
                            id: rows[0].id,
                            email: rows[0].email,
                            username : rows[0].username
                        }
                        callback(null, { token, user });
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
            console.log("error : ", err);
            callback(err, null);
        } else {
            if (rows.length === 0) {
                bcrypt.hash(paramsObject.password, 10)
                    .then(hash => { 
                        let sql = `INSERT INTO ${tableToUse} (username, password, email,nom,prenom,user_adress,user_postal_code,user_city,user_phone) VALUES ('${paramsObject.username}', '${hash}', '${paramsObject.email}', '${paramsObject.nom}', '${paramsObject.prenom}', '${paramsObject.user_adress}', '${paramsObject.user_postal_code}', '${paramsObject.user_city}', '${paramsObject.user_phone}')`;
                        executeRequest(sql, (err, rows) => {
                            if (err) {
                                callback(err, null);
                            } else {
                                sql = `INSERT INTO cart (id_user) VALUES (${rows.insertId})`;
                                executeRequest(sql, (err, rows) => {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        let user = "good";
                                        callback(null, user);
                                    }
                                })
                            }
                        });
                    })
                    .catch(err => {
                        callback(err, null);
                    });
            } else {
                callback("already used", null);
            }
        }
    });
}

function getUserInfo(params,callback){
    try{
        const id = params.id;
        const token = params.token;
        let sql = `SELECT * FROM ${tableToUse} WHERE id = ${id}`;
        executeRequest(sql, (err, rows) => {
            if (err) {
                callback(err, null);
            } else {
                if (rows.length === 0) {
                    callback("AUCUN UTILISATEUR", null);
                } else {
                    let result = compareToken({ token: token},{id: rows[0].id, email: rows[0].email});
                    const user = {
                        id: rows[0].id,
                        username : rows[0].username,
                        email: rows[0].email,
                        nom: rows[0].nom,
                        prenom: rows[0].prenom,
                        user_adress: rows[0].user_adress,
                        user_postal_code: rows[0].user_postal_code,
                        user_city: rows[0].user_city,
                        user_phone: rows[0].user_phone
                    }
                    callback(null, user);
                }
            }
        });
    }catch(err){
        callback(err, null);
    }
}

function compareToken(objectUserSend,ObjectBDD){
    let tokenFromuser = objectUserSend.token;
    let idFromBDD = ObjectBDD.id;
    let emailFromBDD = ObjectBDD.email;
    try{
        const decoded = jwt.verify(tokenFromuser, PASSPHRASE, { complete: false });
        let toReturn;
        if (decoded.id == idFromBDD && decoded.email == emailFromBDD) {
            toReturn = {
                content: decoded,
                message: "success"
            };
        } else {
            toReturn = {
                error: "Unable to verify this token",
                message: "failure"
            };
        }
        return toReturn;
    }catch(err){
        return {
            error: "Unable to verify this token",
            message: "failure"
        };
    }
}


async function comparePassword(plainPassword, hash) {
    return await new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, hash, function (err, result) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

module.exports = { tryToLogin, tryToRegister, getUserInfo };