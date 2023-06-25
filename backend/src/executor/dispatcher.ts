import { parentPort } from "worker_threads";
import workerpool, { WorkerPool } from "workerpool";
import axios from "axios";
import neo_driver from "../database/neo4j_config";
import neo4j from "neo4j-driver";
import { 
  addExecution,
  getLastExecutionForWebsiteRecord,
  getWebsiteRecords,
  updateWebsiteRecord,
} from "./api_calls";
import WebsiteRecord from "../model/WebsiteRecord";
import Execution from "../model/Execution";
import { ExecutionDB, IWebNode, WebsiteRecordDB } from "../../@types";

export default class Dispatcher {
  private recordExecutions: Record<number, number> = {};

  constructor() {
    axios.defaults.baseURL = "http://127.0.0.1:3001";
    axios.defaults.headers.post["Content-Type"] = "application/json";
  }

  public runDispatcherWorker() {
    parentPort.on("message", async (message: string) => {
      console.log("Worker thread received message: " + message);

      await this.startDispatcher();

      while (true) {
        const queueOfRecords: WebsiteRecord[] = [];
        let records: WebsiteRecord[];
        try {
          records = await getWebsiteRecords();
        } catch (e) {
          console.log("Error fetching records. Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        if (!records) continue;

        for (let i = 0; i < records.length; i++) {
          const record = records[i];

          let lastExecution: Execution;
          try {
            lastExecution = await getLastExecutionForWebsiteRecord(record.id);
          } catch (e) {
            console.log("Error fetching last execution. Retrying...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            i--;
            continue;
          }
          if (lastExecution && this.recordExecutions[record.id] === lastExecution.id) {
            if (!record.requestDoCrawl) continue;
          }
          record.lastExecution = lastExecution ?? null;

          if (this.crawlCheck(record)) {
            record.isBeingCrawled = true;
            record.requestDoCrawl = false;
            if (!await this.handleIncrementalWrite(
              updateWebsiteRecord, record.convertToWebsiteRecordDB()
            ))
              continue;
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
    try {
      let records = await getWebsiteRecords();
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const lastExecution = await getLastExecutionForWebsiteRecord(record.id);
        this.recordExecutions[record.id] = lastExecution?.id;
      }
      console.log("Dispatcher started.");
    } catch (e) {
      console.log("Error starting dispatcher. Retrying...");
      // Schedule startDispatcher retry after 5 seconds to avoid spamming the server
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.startDispatcher();
    }
  }

  private async handleIncrementalWrite(apiCall: (data: any) => any, data: WebsiteRecordDB | ExecutionDB) {
    try {
      return await apiCall(data);
    } catch (error) { // Retry incrementally if update fails
      let retryCount = 1;
      while (retryCount < 6) {
        console.log(`Retrying '${apiCall.name}'... Attempt ${retryCount}/5`)
        try {
          return await apiCall(data);
        } catch (e) {
          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      if (retryCount == 6) {
        console.log(`'${apiCall.name}' failure. Skipping...`);
        return null;
      }
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
    const pool: WorkerPool = workerpool.pool(__dirname + "/crawl_worker.js");
    const tasks: workerpool.Promise<any, Error>[] = [];

    for (let i = 0; i < records.length; i++) {
      let index = i;
      const record = records[index];

      record.isBeingCrawled = true;
      record.lastExecution = Execution.getDefaultInstance();
      record.lastExecution.startTime = new Date(Date.now());

      const task =
        pool
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
              
              if (!await this.handleIncrementalWrite(updateWebsiteRecord, record.convertToWebsiteRecordDB()))
                return;
              const executionId = await this.handleIncrementalWrite(addExecution, record.lastExecution.convertToExecutionDB());
              if (!executionId)
                return;

              if (!await this.writeToNeo4j(crawledNodes, record.id))
                throw new Error("Error writing Execution data to Neo4j.");

              this.recordExecutions[record.id] = executionId;
            }
          })
          .catch((err) => console.log(err));
      tasks.push(task);
    }

    Promise.all(tasks).then(() => {
      console.log("All tasks finished. Terminating pool...");
      pool.terminate();
    });
  }

  // Creates a graph of the crawled nodes and writes it to Neo4j
  // Each node is identified by its URL
  // Merge nodes with the same URL and add a relationship between them
  private async writeToNeo4j(nodes: IWebNode[], recordId: number) : Promise<boolean> {
    const session = neo_driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.WRITE
    });

    const createNodesQuery = `
      UNWIND $nodes AS node
      MERGE (n:Node {url: node.url, recordId: $recordId})
      ON CREATE SET n.url = node.url, n.title = node.title, n.crawlTime = node.crawlTime, n.recordId = $recordId
      RETURN n
    `;

    const createRelationshipsQuery = `
      UNWIND $nodes AS node
      UNWIND node.links AS link
      MATCH (n:Node {url: node.url, recordId: $recordId})
      MATCH (l:Node {url: link, recordId: $recordId})
      MERGE (n)-[:LINKS_TO]->(l)
    `;

    let txc_completed = true;
    const txc = session.beginTransaction()
    try {
      await txc.run(createNodesQuery, {
        nodes: nodes.map((node) => {
          return {
            url: node.url,
            title: node.title,
            crawlTime: neo4j.int(node.crawlTime),
          };
        }),
        recordId: neo4j.int(recordId),
      });
      await txc.run(createRelationshipsQuery, {
        nodes: nodes.map((node) => {
          return {
            url: node.url,
            links: node.links,
          };
        }),
        recordId: neo4j.int(recordId),
      });
      await txc.commit();
    } catch (e) {
      console.log(e);
      txc_completed = false;
      await txc.rollback();
    } finally {
      await session.close();
    }

    return txc_completed;
  }
}

new Dispatcher().runDispatcherWorker();
