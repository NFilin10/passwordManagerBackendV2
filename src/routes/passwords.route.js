const express = require('express')
const { addPassword } = require('../controllers/passwordController')
const authenticate = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/add', authenticate, addPassword)


module.exports = router;