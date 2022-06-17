import * as fs from "fs";
import * as mysql from "mysql";

function dbConnection() {
  return mysql.createConnection({
    host: "webcrawler-t16.mysql.database.azure.com",
    user: "admint16",
    password: "webcrawler-t16",
    database: "webcrawler",
    port: 3306,
    ssl: { ca: fs.readFileSync("../data/DigiCertGlobalRootCA.crt.pem") },
  });
};

// function getRows() {
//   const conn = dbConnection();
//   let rows = [];
//   conn.connect(function (err) {
//     if (err) throw err;
//     conn.query(
//       "SELECT * FROM website_records",
//       function (err, result, fields) {
//         if (err) throw err;
//         rows = result;
//       }
//     );
//   });
//   return rows;
// }

module.exports = { dbConnection };