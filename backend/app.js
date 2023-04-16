const express = require('express')
const app = express();
// const db_conn = require('./database/db_config')

const port = 3001

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  console.log('GET /');
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})