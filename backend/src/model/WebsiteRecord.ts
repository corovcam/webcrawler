import Execution from "./Execution";
import { WebsiteRecordDB, WebNode } from "../../@types/index";

export default class WebsiteRecord {
  id: number;
  url: string;
  boundaryRegExp: string;
  periodicity: number;
  label: string;
  isActive: boolean;
  isBeingCrawled: boolean;
  tags: string[];
  crawledData: WebNode[];
  requestDoCrawl: boolean;
  lastExecution?: Execution;

  constructor(
    id: number,
    url: string,
    boundaryRegExp: string,
    periodicity: number,
    label: string,
    isActive: boolean,
    isBeingCrawled: boolean,
    tags: string[],
    crawledData: WebNode[],
    requestDoCrawl: boolean,
    lastExecution?: Execution
  ) {
    this.id = id;
    this.url = url;
    this.boundaryRegExp = boundaryRegExp;
    this.periodicity = periodicity;
    this.label = label;
    this.isActive = isActive;
    this.isBeingCrawled = isBeingCrawled;
    this.tags = tags;
    this.crawledData = crawledData;
    this.requestDoCrawl = requestDoCrawl;
    this.lastExecution = lastExecution;
  }

  public static parseRecord(websiteRecord: WebsiteRecordDB): WebsiteRecord {
    return new WebsiteRecord(
      websiteRecord.record_id,
      websiteRecord.url,
      websiteRecord.boundary_regexp,
      websiteRecord.periodicity,
      websiteRecord.label,
      websiteRecord.is_active,
      websiteRecord.is_being_crawled ?? false,
      typeof websiteRecord.tags === "string"
        ? websiteRecord.tags.split(" ")
        : websiteRecord.tags,
      JSON.parse(websiteRecord.crawled_data),
      websiteRecord.request_do_crawl ?? false
    );
  }

  public convertToWebsiteRecordDB(): WebsiteRecordDB {
    return {
      record_id: this.id,
      url: this.url,
      boundary_regexp: this.boundaryRegExp,
      periodicity: this.periodicity,
      label: this.label,
      is_active: this.isActive,
      is_being_crawled: this.isBeingCrawled,
      tags: JSON.stringify(this.tags),
      crawled_data: JSON.stringify(this.crawledData),
      request_do_crawl: this.requestDoCrawl,
    };
  }
}
