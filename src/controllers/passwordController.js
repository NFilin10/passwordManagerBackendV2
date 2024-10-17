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
    encrypted = salt.toString('hex') + encrypted + iv.toString('hex');
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
            "INSERT INTO passwords (service_name, link, login, password, user_id) VALUES ($1, $2, $3, $4, $5)",
            [data.service_name, data.link, data.login, encrtptedPass, req.userId]
        );
        res.status(201).json({ message: 'Password added successfully' });
    } catch (error) {
        console.error('Error adding password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getPassword = async (req, res) => {

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" , userID: req.userId});

    const userPass = user.rows[0].password

    try {
        const passwords = await pool.query(
            `SELECT id, service_name, link, login, password FROM passwords 
             WHERE user_id = $1`,
            [req.userId]
        );

        const decryptedPasswords = passwords.rows.map(row => {
            const { id, service_name, link, login, password, logo } = row;
            const salt = password.slice(0, 32); // Extract salt from the encrypted password
            const iv = password.slice(-32); // Extract IV from the encrypted password
            const encryptedData = password.slice(32, -32); // Extract encrypted data
            const decryptedPass = decryptPassword(encryptedData, salt, iv, userPass);

            return { id, service_name, link, login, password: decryptedPass, logo };
        })

        res.json(Object.values(decryptedPasswords));
    } catch (error) {
        console.error('Error fetching passwords:', error);
        res.status(500).json({ error: error });
    }
}


const deletePassword = async (req, res) => {
    try {
        const { id } = req.params

        await pool.query(
            "DELETE FROM passwords WHERE id = $1 AND user_id = $2",
            [id, req.userId]
        );
        res.status(201).json({ message: 'Password deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error. Error deleting password' });
    }
}


const updatePassword = async (req, res) => {
    const { id } = req.params
    const data = req.body;

    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    if (user.rows.length === 0) return res.status(401).json({ error: "User is not registered" });

    const userPass = user.rows[0].password

    const encrtptedPass = encryptPassword(data.password, userPass)

    try {
        await pool.query(
            "UPDATE passwords SET service_name = $1, link = $2, login = $3, password = $4 WHERE id = $5 AND user_id = $6",
            [data.service_name, data.link, data.login, encrtptedPass, id, req.userId]
        );
        res.status(201).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error Error updating password' });
    }
}


module.exports = {
    addPassword,
    getPassword,
    deletePassword,
    updatePassword
};