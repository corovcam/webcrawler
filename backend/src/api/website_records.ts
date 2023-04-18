import { Express, Request, Response } from "express";
import { OkPacket, Pool, ResultSetHeader } from "mysql2";
import { WebsiteRecord } from "../../@types/index";

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
        console.log("Website records fetched successfully!");
        res.status(200).send({ websiteRecords: results });
      });
    });

    // DELETE request to delete a specific website record
    app.delete("/delete-website-record/:id", async (req, res) => {
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
          res.status(200).send({ data: message });
        }
      );
    });

    // POST request to add a new website record
    app.post("/add-website-record", async (req: Request, res: Response) => {
      console.log(JSON.stringify(req.body, null, 2));
      const record: WebsiteRecord = this.validateAndParseWebsiteRecord(
        req.body
      );
      console.log(record);
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
        res.status(200).send({ data: msg });
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
        record.crawledData,
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
        let msg = `Website record with ID: ${record.id} was successfully updated!`;
        console.log(msg);
        res.status(200).send({ data: msg });
        return;
      });
    });
  }

  private static validateAndParseWebsiteRecord(websiteRecord): WebsiteRecord {
    if (
      this.isValidInput("url", websiteRecord.url) &&
      this.isValidInput("regexp", websiteRecord.boundary_regexp) &&
      this.isValidInput("periodicity", websiteRecord.periodicity) &&
      this.isValidInput("label", websiteRecord.label)
    ) {
      return {
        id: websiteRecord.record_id,
        url: websiteRecord.url,
        boundaryRegExp: websiteRecord.boundary_regexp,
        periodicity: websiteRecord.periodicity,
        label: websiteRecord.label,
        isActive: websiteRecord.is_active,
        isBeingCrawled: websiteRecord.is_being_crawled ?? false,
        tags:
          websiteRecord.tags.constructor !== Array
            ? websiteRecord.tags.split(" ")
            : websiteRecord.tags,
        crawledData: JSON.stringify(websiteRecord.crawled_data),
        requestDoCrawl: websiteRecord.request_do_crawl ?? false,
      };
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
    console.log("Validating input: " + type + " with value: " + field);
    return validation.hasOwnProperty(type) ? validation[type]() : false;
  }
}

export default WebsiteRecordsAPI;
