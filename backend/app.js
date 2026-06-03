const express = require('express');
const cors = require('cors');
const HOSTNAME = process.env.HOSTNAME || require('os').hostname();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Routes
app.use('/', (req, res) => {
    return res.json({
        message: "Hello from Simple App (Node)",
        status: true,
        container: HOSTNAME
    })
});


module.exports = app;