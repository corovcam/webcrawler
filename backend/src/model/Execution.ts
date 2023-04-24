import { ExecutionDB } from "../../@types/index";

export default class Execution {
  id: number;
  status: boolean;
  startTime: Date;
  endTime: Date;
  sitesCrawledCount: number;
  websiteRecordId: number;

  public constructor(
    id: number,
    status: boolean,
    startTime: Date,
    endTime: Date,
    sitesCrawledCount: number,
    websiteRecordId: number
  ) {
    this.id = id;
    this.status = status;
    this.startTime = startTime;
    this.endTime = endTime;
    this.sitesCrawledCount = sitesCrawledCount;
    this.websiteRecordId = websiteRecordId;
  }

  public static getDefaultInstance(): Execution {
    return new Execution(-1, false, null, null, -1, -1);
  }

  public static parseExecution(execution: ExecutionDB): Execution {
    return new Execution(
      execution.execution_id,
      execution.status,
      new Date(execution.start_time),
      new Date(execution.end_time),
      execution.sites_crawled_count,
      execution.record_id
    );
  }

  public convertToExecutionDB(): ExecutionDB {
    return {
      execution_id: this.id,
      status: this.status,
      start_time: this.startTime.toISOString().slice(0, 19).replace('T', ' '),
      end_time: this.endTime.toISOString().slice(0, 19).replace('T', ' '),
      sites_crawled_count: this.sitesCrawledCount,
      record_id: this.websiteRecordId,
    };
  }
}
