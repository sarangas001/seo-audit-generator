const express = require('express');
const cors = require('cors');
const HOSTNAME = process.env.HOSTNAME || require('os').hostname();
const seoRouter = require('./routes/seoRoutes');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Routes
app.get('/', (req, res) => {
    return res.json({
        message: "Hello from Simple App (Node)",
        status: true,
        container: HOSTNAME
    })
});

app.use('/api/seo-audit', seoRouter);


module.exports = app;