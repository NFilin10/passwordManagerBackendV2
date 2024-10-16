const express = require('express');
const pool = require("../database");


function encryptPassword(text, masterPassword) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(masterPassword, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    encrypted = salt.toString('hex') + encrypted + iv.toString('hex'); // Convert salt and iv to hex strings
    return encrypted;
}


const addPassword = async (req, res) => {

    const data = req.body;


    // const user = await pool.query("SELECT * FROM users WHERE id = $1", [data.user]);
    // if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });
    //
    // const userPass = user.rows[0].password
    //
    // const encrtptedPass = encryptPassword(data.password, userPass)


    try {

        const passwordInsertResult = await pool.query(
            "INSERT INTO passwords (service_name, link, login, password, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [data.service_name, data.link, data.login, data.password, data.user_id]
        );


        res.status(201).json({ message: 'Password added successfully' });
    } catch (error) {
        console.error('Error adding password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    addPassword
};