import express from 'express';
import { Worker } from 'worker_threads';
import db_conn from './database/db_config';
import WebsiteRecordsAPI from './api/website_records';

const cors = require('cors');

const port = 3001;

const dispatcher = new Worker(__dirname + "/executor/dispatcher.js", {
  workerData: {
    path: __dirname + "/executor/dispatcher.ts"
  }
});
dispatcher.postMessage("dispatch");

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors({
  "origin": '*',
}));

new WebsiteRecordsAPI(app, db_conn).init();

app.listen(port, () => {
  console.log(`Example server listening on port ${port}`);
});
