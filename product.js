const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT_PRODUCT || 5000

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

/***** PRODUCT *****/
app.get('/api/products', (req, res) => {
    executeRequest('SELECT * FROM product', (err, rows) => {
        if(err != null) {
            console.log(err);
        }
        res.json(rows);
    });
})

app.get('/api/products/filterCategories/:idCategorie', (req, res) => {
    executeRequest(`SELECT * FROM product WHERE id_categorie = ${req.params.idCategorie}`, (err, rows) => {
        if(err != null) {
            console.log(err);
        }
        res.json(rows);
    });
})
app.get('/api/products/filterName/:name', (req, res) => {
    executeRequest(`SELECT * FROM product WHERE name LIKE '%${req.params.name}%'`, (err, rows) => {
        if(err != null) {
            console.log(err);
        }
        res.json(rows);
    });
})
app.get('/api/products/filterPrice/:price', (req, res) => {
    executeRequest(`SELECT * FROM product WHERE price <= ${req.params.price}`, (err, rows) => {
        if(err != null) {
            console.log(err);
        }
        res.json(rows);
    });
})

app.get('/api/product/:id', (req, res) => {
    let id = req.params.id;
    if (id == null) {
        res.json({
            message: "id is null"
        })
        return;
    }
    let sql = `SELECT * FROM product WHERE id = ${id}`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.json(rows[0])
        }
    });
})

app.post('/api/addProduct', (req, res) => {
    let name = req.query.name;
    let price = parseFloat(req.query.price);
    let description = req.query.feature;
    let id_categorie = req.query.id_categorie;
    let image = req.query.image;
    let quantity = req.query.quantity
    //test name,price,description,id_categorie are not null
    if (name == null || price == null || description == null || id_categorie == null || image == null || quantity == null) {
        res.json({
            message: "name,price,description,id_categorie,quantity are null"
        })
        return;
    }
    let sql = `INSERT INTO product (name, price, quantity, feature, image, id_categorie) VALUES ('${name}', '${price}', '${quantity}', '${description}', '${image}', ${id_categorie})`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.json({ message: "success" })
        }
    });
})

app.put('/api/product/:id', (req, res) => {
    let id = req.params.id;
    let name = req.query.name;
    let price = parseFloat(req.query.price);
    let description = req.query.feature;
    let quantity = parseFloat(req.query.quantity);
    let id_categorie = req.query.id_categorie;
    let image = req.query.image;
    //test name,price,description,id_categorie are not null
    if (name == null || price == null || description == null || id_categorie == null || image == null || quantity == null) {
        res.json({
            message: "name,price,description,id_categorie are null"
        })
        return;
    }
    let sql = `UPDATE product SET name = '${name}', price = '${price}', quantity = '${quantity}', feature = '${description}', image = '${image}', id_categorie = ${id_categorie} WHERE id = ${id}`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.json({ message: "success" })
        }
    });
})

app.delete('/api/product/:id', (req, res) => {
    let id = req.params.id;
    if (id == null) {
        res.json({
            message: "id is null"
        })
        return;
    }
    let sql = `DELETE FROM product WHERE id = ${id}`;
    executeRequest(sql, (err, rows) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.json({ message: "success" })
        }
    });

})

app.listen(port, () => {
    console.log(`Adresse du serveur :  http://localhost:${port}`)
})