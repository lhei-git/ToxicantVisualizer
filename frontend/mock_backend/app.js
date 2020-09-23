const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const cors = require('cors');

app.use('*', cors());

app.get('/_healthz', (req, res) => {
    res.send('OK');
});

app.get('/search', (req, res) => {
    const zip = req.query.zip || 48208;
    const points = [
        { lat: 42.3314, lng: -83.0458 },
        { lat: 42.3314, lng: -83.05 }
    ]
    res.json(points);
});

app.use((error, req, res, next) => {
    console.log(error);
});

module.exports = app;
