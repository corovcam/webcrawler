import { parentPort } from "worker_threads";
import workerpool from "workerpool";
import axios from "axios";
import {
  addExecution,
  getLastExecutionForWebsiteRecord,
  getWebsiteRecords,
  updateWebsiteRecord,
} from "./api_calls";
import WebsiteRecord from "../model/WebsiteRecord";
import Execution from "../model/Execution";
import { IWebNode } from "../../@types";

export default class Dispatcher {
  private recordExecutions: Record<number, number> = {};
  private readonly pool = workerpool.pool(__dirname + "/crawl_worker.js");

  constructor() {
    axios.defaults.baseURL = "http://127.0.0.1:3001";
    axios.defaults.headers.post["Content-Type"] = "application/json";
  }

  public runDispatcherWorker() {
    parentPort.on("message", async (message: string) => {
      console.log("Worker thread received message: " + message);

      this.startDispatcher();

      while (true) {
        const queueOfRecords: WebsiteRecord[] = [];
        const records = await getWebsiteRecords();
        if (!records) continue;

        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const lastExecution = await getLastExecutionForWebsiteRecord(
            record.id
          );
          if (lastExecution && this.recordExecutions[record.id] === lastExecution.id) {
            if (!record.requestDoCrawl) continue;
          }
          record.lastExecution = lastExecution ?? null;

          if (this.crawlCheck(record)) {
            record.isBeingCrawled = true;
            record.requestDoCrawl = false;
            await updateWebsiteRecord(record.convertToWebsiteRecordDB());
            queueOfRecords.push(record);
          }
        }

        if (queueOfRecords.length > 0) {
          console.log(
            "Queue contains records. Crawling...",
            queueOfRecords.length
          );
          this.startCrawler(queueOfRecords);
        }
      }
    });
  }

  private async startDispatcher() {
    let records = await getWebsiteRecords();
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const lastExecution = await getLastExecutionForWebsiteRecord(record.id);
      this.recordExecutions[record.id] = lastExecution?.id;
    }
  }

  private crawlCheck(record: WebsiteRecord): boolean {
    if (record.requestDoCrawl) return true;

    if (!record.isActive || record.isBeingCrawled) return false;

    if (!record.lastExecution) return true;

    const currentTime = new Date(Date.now());
    const lastExecutionEndTime = record.lastExecution.endTime;
    const minuteDifference = new Date(
      Math.floor(currentTime.getTime() - lastExecutionEndTime.getTime())
    ).getMinutes();
    if (minuteDifference >= record.periodicity) return true;

    return false;
  }

  private startCrawler(records: WebsiteRecord[]) {
    for (let i = 0; i < records.length; i++) {
      let index = i;
      const record = records[index];

      record.isBeingCrawled = true;
      record.lastExecution = Execution.getDefaultInstance();
      record.lastExecution.startTime = new Date(Date.now());

      this.pool
        .proxy()
        .then(async (worker) => {
          return await worker.runCrawlWorker(record);
        })
        .then(async (nodes: Promise<IWebNode[]>) => {
          const crawledNodes = await nodes;
          if (crawledNodes.length > 0) {
            record.lastExecution.sitesCrawledCount = crawledNodes.length;
            record.lastExecution.endTime = new Date(Date.now());
            record.lastExecution.status = false;
            record.lastExecution.websiteRecordId = record.id;

            record.crawledData = crawledNodes;
            record.isBeingCrawled = false;

            await updateWebsiteRecord(record.convertToWebsiteRecordDB());
            const executionId = await addExecution(
              record.lastExecution.convertToExecutionDB()
            );

            this.recordExecutions[record.id] = executionId;
          }
        })
        .catch((err) => console.log(err));
      console.log("Crawl started for record: " + record.id);
    }
  }
}

new Dispatcher().runDispatcherWorker();
