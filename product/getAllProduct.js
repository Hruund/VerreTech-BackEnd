const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { checkTokenMiddleware, extractToken } = require('../../utils/auth_utils');


router.get('/protect', checkTokenMiddleware, async function(req, res, next) {
  const token = req.headers.authorization && extractToken(req.headers.authorization);

  if(token !== false) {
    const decoded = jwt.decode(token, { complete: false });
    res.json({ content: decoded });
    return
  } else {
    res.status(500).json({error: "Unable to verify this user"})
    return
  }

});

module.exports = router;