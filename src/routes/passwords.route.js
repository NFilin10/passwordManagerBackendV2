const express = require('express')
const { addPassword, getPassword } = require('../controllers/passwordController')
const authenticate = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/add', authenticate, addPassword)
router.get('/get', authenticate, getPassword)


module.exports = router;