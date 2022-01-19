const dotenv = require('dotenv');
dotenv.config();
const express = require('express')
const app = express()
const port = process.env.PORT

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
        message : "error",
        error : err
      })
    } else {
      //id_cart, id_product, quantity
      const sql2 = `SELECT * FROM product WHERE id IN (SELECT id_product FROM cart_product WHERE id_cart = (SELECT id FROM cart WHERE id_user = ${req.params.id}))`;
      executeRequest(sql2, (err, rows2) => {
        if (err) {
          res.json({
            message : "error",
            error : err
          })
        } else {
          for(let i = 0; i < rows2.length; i++) {
            rows2[i].quantity = rows.find(x => x.id_product === rows2[i].id).quantity;
          }
          res.json({
            message : "success",
            cart : rows,
            products : rows2
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
        message : "success"
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
        message : "success"
      })
    }
  })
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
      res.json({ message: "success",access_token: return_object.token, user : return_object.user })
    }
  });
})

const { tryToRegister } = require('./user/user')

app.post('/api/register', (req, res) => { //TODO entrer les autres données!!!
  let username = req.query.lastname + "." + req.query.firstname;
  let password = req.query.password;
  let email = req.query.email;
  tryToRegister({username, password, email}, (err, user) => {
    if(err) {
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

/***** PRODUCT *****/
app.get('/api/products', (req, res) => {
  executeRequest('SELECT * FROM product', (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})

app.get('/api/products/filterCategories/:idCategorie', (req, res) => {
  executeRequest(`SELECT * FROM product WHERE id_categorie = ${req.params.idCategorie}`, (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})
app.get('/api/products/filterName/:name', (req, res) => {
  executeRequest(`SELECT * FROM product WHERE name LIKE '%${req.params.name}%'`, (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})
app.get('/api/products/filterPrice/:price', (req, res) => {
  executeRequest(`SELECT * FROM product WHERE price <= ${req.params.price}`, (err, rows) => {
    console.log(err);
    res.json(rows);
  });
})

app.get('/api/product/:id', (req, res) => {
  let id = req.params.id;
  if(id == null) {
    res.json({
      message: "id is null"
    })
    return;
  }
  let sql = `SELECT * FROM product WHERE id = ${id}`;
  executeRequest(sql, (err, rows) => {
    if (err) {
      res.json({
        message : err
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
  //test name,price,description,id_categorie are not null
  if (name == null || price == null || description == null || id_categorie == null || image == null) {
    res.json({
      message: "name,price,description,id_categorie are null"
    })
    return;
  }
  let sql = `INSERT INTO product (name, price, feature, image, id_categorie) VALUES ('${name}', '${price}', '${description}', '${image}', ${id_categorie})`;
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
  let id_categorie = req.query.id_categorie;
  let image = req.query.image;
  //test name,price,description,id_categorie are not null
  if (name == null || price == null || description == null || id_categorie == null || image == null) {
    res.json({
      message: "name,price,description,id_categorie are null"
    })
    return;
  }
  let sql = `UPDATE product SET name = '${name}', price = '${price}', feature = '${description}', image = '${image}', id_categorie = ${id_categorie} WHERE id = ${id}`;
  executeRequest(sql, (err, rows) => {
    if (err) {
      res.json({
        message : err
      })
    } else {
      res.json({ message: "success" })
    }
  });
})

app.delete('/api/product/:id',(req,res) => {
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
        message : err
      })
    } else {
      res.json({ message: "success" })
    }
  });
  
})

/***** TOKEN *****/
app.post('/api/checkToken', (req, res) => {
  const token = req.query.access_token;
  const id = req.query.id;
  const username = req.query.username;

  if (token == null || id == null || username == null) {
    const decoded = jwt.decode(token, PASSPHRASE, { complete: false });
    if (decoded.id == id && decoded.email == req.query.email ) {
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
  }else{
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
            error : "ERROR CHECK ADMIN"
          })
        } else {
          if (rows[0].isAdmin == 1) {
            res.status(200).json({
              message : "success",
              isAdmin : true
            })
          } else {
            res.status(200).json({
              message : "error user is not admin",
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