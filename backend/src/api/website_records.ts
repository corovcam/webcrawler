import { Express, Request, Response } from "express";
import { OkPacket, Pool, ResultSetHeader } from "mysql2";
import neo_driver from "../database/neo4j_config";
import neo4j from "neo4j-driver";
import { Result } from "neo4j-driver";
import { WebsiteRecordDB } from "../../@types/index";
import WebsiteRecord from "../model/WebsiteRecord";

// Implements GET, DELETE and POST API endpoints for website records
class WebsiteRecordsAPI {
  public static init(app: Express, db: Pool) {
    // GET request to get all website records
    app.get("/website-records", async (req: Request, res: Response) => {
      const query = "SELECT * FROM website_records;";

      db.query(query, function (error, results, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        // console.log("Website records fetched successfully!");
        res.status(200).send({ websiteRecords: results });
      });
    });

    // GET request to get a specific website record
    app.get("/website-record/:id", async (req: Request, res: Response) => {
      const query = "SELECT * FROM website_records WHERE record_id = ?;";
      db.query(query, [req.params.id], function (error, results: OkPacket, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        if (results.affectedRows === 0) {
          res
            .status(404)
            .send({ errorMsg: `Record ${req.params.id} not found!` });
          return;
        }
        // console.log("Website record fetched successfully!");
        res.status(200).send({ websiteRecord: results[0] });
      });
    });

    // DELETE request to delete a specific website record
    app.delete("/delete-website-record/:id", async (req: Request, res: Response) => {
      const query = "DELETE FROM website_records WHERE record_id = ?;";

      db.query(
        query,
        [req.params.id],
        function (error, results: ResultSetHeader, _) {
          if (error) {
            res.status(500).send({ errorMsg: error });
            return;
          }
          if (results.affectedRows === 0) {
            res
              .status(404)
              .send({ errorMsg: `Record ${req.params.id} not found!` });
            return;
          }
          const message = `Record ${req.params.id} deleted successfully!`;
          console.log(message);
          res.status(200).send(message);
        }
      );
    });

    // POST request to add a new website record
    app.post("/add-website-record", async (req: Request, res: Response) => {
      const record: WebsiteRecord = this.validateAndParseWebsiteRecord(
        req.body
      );
      const query = `INSERT INTO website_records(url, boundary_regexp, periodicity, label, is_active, is_being_crawled, tags, crawled_data, request_do_crawl) 
            VALUES (?,?,?,?,?,?,JSON_ARRAY(?),?,?);`;
      const params = [
        record.url,
        record.boundaryRegExp,
        record.periodicity,
        record.label,
        record.isActive,
        record.isBeingCrawled,
        record.tags,
        record.crawledData,
        record.requestDoCrawl,
      ];

      db.query(query, params, function (error, results: OkPacket, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        const msg =
          "New website record with ID: " +
          results.insertId +
          " was successfully created!";
        console.log(msg);
        res.status(200).send({ recordId: results.insertId, message: msg });
        return;
      });
    });

    // POST request to update an existing website record
    app.post("/update-website-record", async (req: Request, res: Response) => {
      const record: WebsiteRecord = this.validateAndParseWebsiteRecord(
        req.body
      );
      const query = `UPDATE website_records 
            SET url = ?, boundary_regexp = ?, periodicity = ?, label = ?, is_active = ?, is_being_crawled = ?, tags = JSON_ARRAY(?), crawled_data = ?, request_do_crawl = ? 
            WHERE record_id = ?;`;
      const params = [
        record.url,
        record.boundaryRegExp,
        record.periodicity,
        record.label,
        record.isActive,
        record.isBeingCrawled,
        record.tags,
        typeof record.crawledData === "string" ? record.crawledData : JSON.stringify(record.crawledData),
        record.requestDoCrawl,
        record.id,
      ];

      db.query(query, params, function (error, results: OkPacket, _) {
        if (error) {
          res.status(500).send({ errorMsg: error });
          return;
        }
        if (results.affectedRows === 0) {
          res.status(404).send({
            errorMsg: `Website record with ID: ${record.id} not found!`,
          });
          return;
        }
        const msg = `Website record with ID: ${record.id} was successfully updated!`;
        // console.log(msg);
        res.status(200).send(msg);
        return;
      });
    });

    // Request to crawl a specific website record (by ID)
    app.get(
      "/crawl-website-record/:id",
      async (req: Request, res: Response) => {
        const query =
          "UPDATE website_records SET request_do_crawl = ? WHERE record_id = ?";

        db.query(
          query,
          [true, req.params.id],
          function (error, results: OkPacket, _) {
            if (error) {
              res.status(500).send({ errorMsg: error });
              return;
            }
            if (results.affectedRows === 0) {
              res
                .status(404)
                .send({ errorMsg: `Record ${req.params.id} not found!` });
              return;
            }
            const message = `Record ${req.params.id} successfully requested for crawling!`;
            console.log(message);
            res.status(200).send(message);
          }
        );
      }
    );

    // Request to get the crawled data of a specific website record (by ID) from Neo4j database
    app.get(
      "/get-crawled-data/:id",
      async (req: Request, res: Response) => {
        const session = neo_driver.session({
          database: 'neo4j',
          defaultAccessMode: neo4j.session.READ
        });

        const query = `
        MATCH (n:Node {recordId: $recordId})
        OPTIONAL MATCH (n)-[:LINKS_TO]->(m:Node {recordId: $recordId})
        WITH n, collect(DISTINCT properties(m)) AS links
        RETURN properties(n), links;`;

        session
          .run(query, { recordId: neo4j.int(req.params.id) })
          .then((result) => {
            const data = result.records.map((record) => {
              const node = record.get(0);
              const links = record.get(1);
              
              return {
                node: node,
                links: links,
              };
            });
            res.status(200).send(data);
          })
          .catch((error) => {
            res.status(500).send({ errorMsg: error });
          })
          .finally(() => {
            session.close();
          });
      }
    )
  }

  private static validateAndParseWebsiteRecord(
    websiteRecord: WebsiteRecordDB
  ): WebsiteRecord {
    if (
      this.isValidInput("url", websiteRecord.url) &&
      this.isValidInput("regexp", websiteRecord.boundary_regexp) &&
      this.isValidInput("periodicity", websiteRecord.periodicity) &&
      this.isValidInput("label", websiteRecord.label)
    ) {
      return WebsiteRecord.parseRecord(websiteRecord);
    }
    return null;
  }

  private static isValidInput(
    type: string,
    field: string | number | undefined
  ): boolean {
    const validation = {
      url: () =>
        typeof field === "string" &&
        (field.startsWith("https://") || field.startsWith("http://")),
      regexp: () => field !== undefined,
      periodicity: () => !isNaN(field as number),
      label: () => field !== undefined,
    };
    // console.log("Validating input: " + type + " with value: " + field);
    return validation.hasOwnProperty(type) ? validation[type]() : false;
  }
}

export default WebsiteRecordsAPI;
