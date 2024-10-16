const express = require('express');
const pool = require("../database");
const crypto = require('crypto');


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


function decryptPassword(encryptedData, salt, iv, masterPassword) {
    const key = crypto.pbkdf2Sync(masterPassword, Buffer.from(salt, 'hex'), 100000, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


const addPassword = async (req, res) => {
    const data = req.body;

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });

    const userPass = user.rows[0].password
    const encrtptedPass = encryptPassword(data.password, userPass)

    try {

        await pool.query(
            "INSERT INTO passwords (service_name, link, login, password, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [data.service_name, data.link, data.login, encrtptedPass, req.userId]
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