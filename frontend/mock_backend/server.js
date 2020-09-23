const http = require('http');
const app = require('./app');

const port = process.env.PORT || 8000;

const server = http.Server(app).listen(port, () => {
  console.log(`listening on 0.0.0.0:${port}`);
});
