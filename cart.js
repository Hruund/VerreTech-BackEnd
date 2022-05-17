const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_CART

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
        // console.log("foo catch : ",err);
        return;
    })
}

app.listen(port, () => {
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})
