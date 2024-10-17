const express = require('express')
const { addPassword, getPassword, deletePassword, updatePassword} = require('../controllers/passwordController')
const authenticate = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/add', authenticate, addPassword)
router.get('/get', authenticate, getPassword)
router.delete('/delete/:id', authenticate, deletePassword)
router.put('/update/:id', authenticate, updatePassword)


module.exports = router;