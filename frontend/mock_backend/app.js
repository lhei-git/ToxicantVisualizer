const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const cors = require('cors');
const points = require('./points');

app.use('*', cors());

app.get('/_healthz', (req, res) => {
    res.send('OK');
});

app.get('/search', (req, res) => {
    console.log(req.query);
    res.json(points);

});

app.use((error, req, res, next) => {
    console.log(error);
});

module.exports = app;
