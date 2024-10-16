
const express = require('express');
const cors = require('cors')
const passwordsRoute = require('./routes/passwords.route')
const authRoute = require('./routes/auth.route')
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = process.env.PORT || 8080;
const app = express();
app.set("trust proxy", 1);

const corsOptions ={
    credentials: true,
    optionSuccessStatus: 200,
    origin: true,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/', passwordsRoute);
app.use('/auth/', authRoute);

const server = app.listen(port, () => {
    console.log("Server is listening to port " + port);
});

module.exports = server;