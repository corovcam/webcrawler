import { IWebNode } from "../../@types/index";

export default class WebNode implements IWebNode {
  url: string;
  title: string;
  crawlTime: number;
  isBoundary: boolean;
  executionId: number;
  links: string[] = [];

  public setData(url: string, title: string) {
    this.url = url;
    this.title = title;
  }

  public setStartTime() {
    this.crawlTime = Date.now();
  }

  public setCrawlTime() {
    this.crawlTime = Date.now() - this.crawlTime;
  }

  public addLinkToPage(url: string) {
    this.links.push(url);
  }
}
