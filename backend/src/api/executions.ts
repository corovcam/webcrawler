import { Express, Request, Response } from "express";
import { OkPacket, Pool, ResultSetHeader } from "mysql2";
import { Execution } from "../../@types/index";

// Implements GET, GET last execution, get execution for a specific website record and POST API endpoints for executions
class ExecutionsAPI {
  public static init(app: Express, db: Pool) {
    // GET request to get all executions
    app.get("/executions", async (req: Request, res: Response) => {
      const query = "SELECT * FROM executions;";

      db.query(query, function (error, results, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        console.log("Executions fetched successfully!");
        res.status(200).send({ executions: results });
      });
    });

    // GET request to get the last execution
    app.get("/last-execution", async (req: Request, res: Response) => {
      const query =
        "SELECT * FROM executions ORDER BY execution_id DESC LIMIT 1;";

      db.query(query, function (error, results: OkPacket[], _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        if (results.length === 0) {
          res.status(200).send({ execution: null });
          return;
        }
        console.log("Last execution fetched successfully!");
        res.status(200).send({ execution: results[0] });
      });
    });

    // GET request to get all executions for a specific website record ordered by end time descending
    app.get(
      "/executions/website-record/:id",
      async (req: Request, res: Response) => {
        const query =
          "SELECT * FROM executions WHERE record_id = ? ORDER BY end_time DESC;";

        db.query(
          query,
          [req.params.id],
          function (error, results: OkPacket[], _) {
            if (error) {
              res.status(500).send({ errorMsg: error });
              return;
            }
            console.log(
              `Executions for website record ${req.params.id} fetched successfully!`
            );
            res.status(200).send({ executions: results });
          }
        );
      }
    );

    // POST request to add a new execution
    app.post("/add-execution", async (req: Request, res: Response) => {
      const query = `INSERT INTO executions(status, start_time, end_time, sites_crawled_count, record_id) VALUES (?,?,?,?,?);`;
      const params = [
        req.body.status,
        req.body.start_time,
        req.body.end_time,
        req.body.sites_crawled_count,
        req.body.record_id,
      ];

      db.query(query, params, function (error, results: ResultSetHeader, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        console.log(`Execution ${results.insertId} added successfully!`);
        res.status(201).send({ executionId: results.insertId });
      });
    });
  }
}

export default ExecutionsAPI;
