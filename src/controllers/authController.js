const express = require('express');
const pool = require("../database");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const secret = process.env.SECRET
const maxAge = 60 * 60;
const generateJWT = (id) => {
    return jwt.sign({ id }, secret, { expiresIn: maxAge })
}

const signup = async (req, res) => {
    try {
        const { email, password, name, surname } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length !== 0) return res.status(401).json({ error: "User is already registered" });

        const salt = await bcrypt.genSalt();
        const bcryptPassword = await bcrypt.hash(password, salt)
        const authUser = await pool.query(
            "INSERT INTO users(email, password, name, surname) values ($1, $2, $3, $4) RETURNING*",
            [email, bcryptPassword, name, surname]);
        const token = await generateJWT(authUser.rows[0].id);
        res
            .status(201)
            .cookie('jwt', token, { maxAge: 6000000, httpOnly: true })
            .json({ user_id: authUser.rows[0].id })
            .send;
    } catch (err) {res.status(400).send(err.message);}

}

module.exports = {
    signup
};