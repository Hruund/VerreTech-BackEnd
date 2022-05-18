const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_CART || 7000

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

/***** CART *****/
app.get('/api/cart/:id', (req, res) => {
    const sql = `SELECT * FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ${req.params.id})`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: "error",
                error: err
            })
        } else {
            //id_cart, id_product, quantity
            const sql2 = `SELECT * FROM product WHERE id IN (SELECT id_product FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ${req.params.id}))`;
            executeRequest(sql2, (err, rows2) => {
                if (err) {
                    res.json({
                        message: "error",
                        error: err
                    })
                } else {
                    for (let i = 0; i < rows2.length; i++) {
                        rows2[i].quantity = rows.find(x => x.id_product === rows2[i].id).quantity;
                    }
                    res.json({
                        message: "success",
                        cart: rows,
                        products: rows2
                    })
                }
            })
        }
    })
})
app.post('/api/cart/:id', (req, res) => {
    let idProduct = req.query.idProduct;
    let quantity = req.query.quantityToUse;
    let idClient = req.query.idClient;
    let sql = `INSERT INTO cart_product (id_cart, id_product, quantity) VALUES ((SELECT id FROM cart WHERE id_user = ${idClient}), ${idProduct}, ${quantity})`
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: "error",
                error: err
            })
        } else {
            res.json({
                message: "success"
            })
        }
    })
})
app.delete('/api/cart/:id/:idproduct', (req, res) => {
    let sql = `DELETE FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ${req.params.id}) AND id_product = ${req.params.idproduct}`
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: "error",
                error: err
            })
        } else {
            res.json({
                message: "success"
            })
        }
    })
})
app.get('/api/cart/orders/:id', (req, res) => {
    try{
        let sql = `SELECT * FROM order_table WHERE id_client = ${req.params.id}`
        executeRequest(sql, (err, rows) => {
            if (err) {
                res.json({
                    message: "error",
                    error: err
                })
            } else {
                let sql2 = `SELECT * FROM order_list WHERE order_table_id IN (SELECT id FROM order_table WHERE id_client = ${req.params.id})`
                executeRequest(sql2, (err, rows2) => {
                    if (err) {
                        res.json({
                            message: "error",
                            error: err
                        })
                    } else {
                        res.json({
                            message: "success",
                            orders: rows2,
                            order_table: rows
                        })
                    }
                })
                // res.json({
                //     message: "success",
                //     orders: rows
                // })
            }
        })
    }catch(e){
        res.json({
            message: "error",
            error: e
        })    
    }
})
app.get('/api/cart/order/:id',(req,res)=>{
    try{
        let sql = `SELECT * FROM order_table WHERE id = ${req.params.id}`
        executeRequest(sql, (err, rows) => {
            if (err) {
                res.json({
                    message: "error",
                    error: err
                })
            }else{
                let sql2 = `SELECT * FROM order_list WHERE order_table_id = ${req.params.id}`
                executeRequest(sql2, async (err, rows2) => {
                    if (err) {
                        res.json({
                            message: "error",
                            error: err
                        })
                    }else{
                        let productList = await getEveryProduct(rows2);
                        // let productList = mergeArray(rows,rows2,"id");
                        res.json({
                            message: "success",
                            order: rows[0],
                            products: productList
                        })
                    }
                })
            }
        });
    }catch(err){
        res.json({
            message: "error",
            error: err
        })
    }
})

async function getEveryProduct(rows){
    let products = [];
    // rows.forEach(async (element) => {
    //     let result = await getProduct(element);
    //     products.push(result);
    // });
    for(const element of rows){
        let result = await getProduct(element);
        result[0].quantity = element.quantity;
        products.push(result);
    }
    return products;
}

async function getProduct(element){
    let productList = [];
    let sql3 = `SELECT * FROM product WHERE id = ${element.product_id}`;
    var foo = new Promise((resolve, reject) => {
        executeRequest(sql3, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                productList.push(rows[0]);
                resolve(productList);
            }
        });
    });
    return foo.then(function(result){
        return result;
    }).catch(function(err){
        return;
    })
}

const { getUserInfo } = require('./user/user');
const res = require('express/lib/response');
app.get('/api/carts/validate/:id',(req,res)=>{
    var id = req.params.id;
    var access_token = req.query.access_token;
    const params = {
        id: id,
        token: access_token
    };
    // //identifier l'utilisateur
    getUserInfo(params, (err, user) => {
        if (err) {
            res.json({
                message: "error",
                error: err
            })
        } else {
            //récuperer les produits qu'y été dans le panier
            var sql = 'SELECT * FROM product WHERE id IN (SELECT id_product FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ' + user.id + '))';
            executeRequest(sql, (err, rows) => {
                if (err) {
                    res.json({
                        message: "error",
                        error: err
                    })
                } else {
                    //récuperer les quantités qu'y été dans le panier
                    var sql2 = 'SELECT id_product,quantity FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ' + user.id + ')';
                    executeRequest(sql2, (err, rows2) => {
                        if (err) {
                            res.json({
                                message: "error",
                                error: err
                            })
                        } else {
                            var merged = mergeArray(rows, rows2);
                            var totalPrice = getTotalPrice(merged);
                            //le mettre dans la table order_list
                            var sql3 = 'INSERT INTO order_table (id_client,date,date_maj,price,shop,state) VALUES (' + user.id + ',NOW(),NOW(),' + totalPrice +',"aucun",0)';
                            executeRequest(sql3, (err, rows3) => {
                                if (err) {
                                    res.json({
                                        message: "error",
                                        error: err
                                    })
                                } else {
                                    var sql4 = 'SELECT id FROM order_table WHERE id_client = ' + user.id + ' AND date = NOW()';
                                    executeRequest(sql4,async (err, rows4) => {
                                        if (err) {
                                            res.json({
                                                message: "error",
                                                error: err
                                            })
                                        } else {
                                            for (var i = 0; i < merged.length; i++) {
                                                var sql5 = 'INSERT INTO order_list (order_table_id,product_id,quantity) VALUES (' + rows4[0].id + ',' + merged[i].id+','+merged[i].quantity+')';
                                                var sql7 = 'UPDATE product SET quantity = quantity - ' + merged[i].quantity + ' WHERE id = ' + merged[i].id;
                                                await new Promise((resolve, reject) => {
                                                    executeRequest(sql7, (err, rows7) => {
                                                        if(err){

                                                        }else{

                                                        }
                                                    });
                                                    executeRequest(sql5, (err, rows5) => {
                                                        if (err) {
                                                            res.json({
                                                                message: "error",
                                                                error: err
                                                            })
                                                            reject();
                                                        } else {
                                                        resolve();
                                                        }
                                                    })
                                                })
                                                .then(function(result){

                                                }).catch(function(err){
                                                });
                                            }
                                            //supprimer le panier
                                            var sql6 = 'DELETE FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ' + user.id + ')';
                                            executeRequest(sql6, (err, rows6) => {
                                                if (err) {
                                                    res.json({
                                                        message: "error",
                                                        error: err
                                                    })
                                                } else {
                                                    res.json({
                                                        message: "success",
                                                        order: rows4[0],
                                                        products: merged
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }});
                    }});

            // //vider le panier de l'utilisateur
            // clearUserCart(req.params.id);
            // //retourner un message de succès
        }
    });
   
})

function mergeArray(array1, array2, doublonTolook ="id_product"){
    var result = [];
    for(var i = 0; i < array1.length; i++){
        result.push(array1[i]);
    }
    for(var i = 0; i < array2.length; i++){
        let nodoublon = false;
        for(var t = 0; t < array1.length; t++){
            if(array1[t].id == array2[i][doublonTolook]){
                result[t].quantity = array2[i].quantity;
                nodoublon = true;
            }
        }
        if(!nodoublon){
            result.push(array2[i]);
        }
    }
    return result;
}

function getTotalPrice(array){
    var totalPrice = 0;
    for(var i = 0; i < array.length; i++){
        totalPrice += array[i].price * array[i].quantity;
    }
    return totalPrice;
}

app.listen(port, () => {
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})
