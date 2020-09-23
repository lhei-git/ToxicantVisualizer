const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const cors = require('cors');

app.use('*', cors());

app.get('/_healthz', (req, res) => {
res.send('OK');
});
  
module.exports = app;
  