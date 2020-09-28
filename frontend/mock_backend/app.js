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
    console.log(req.query);
    const points = [
        { latitude: 42.3314, longitude: -83.0458, chemical: 'CHROMIUM'},
        { latitude: 42.3314, longitude: -83.05, chemical: 'LEAD'},
        { latitude: 42.0, longitude: -83.05, chemical: 'CHROMIUM'},
    ]
    res.json(points);

});

app.use((error, req, res, next) => {
    console.log(error);
});

module.exports = app;
