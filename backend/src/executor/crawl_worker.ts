import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";
import workerpool from "workerpool";
import WebsiteRecord from "../model/WebsiteRecord";
import WebNode from "../model/WebNode";
import { IWebNode } from "../../@types";

export default class CrawlWorker {
  private crawledSites: Record<string, boolean> = {};
  private nodes: IWebNode[] = [];
  private linksToProcess = 1;

  public async runCrawlWorker(record: WebsiteRecord): Promise<IWebNode[]> {
    console.log(`Crawl worker started for record: ${record.id} - ${record.url}`)

    return await this.fetchAndCrawl(record.url, record.boundaryRegExp);
  }

  private async fetchAndCrawl(url: string, regex: string): Promise<IWebNode[]> {
    const result = await this.fetchData(url);
    return await this.parseAndProcessSite(result, url, regex);
  }

  private async parseAndProcessSite(response: AxiosResponse<any, any>, url: string, regex: string): Promise<IWebNode[]> {
    if (this.linksToProcess === 1 && this.nodes.length > 1) {
      console.log(`Emit nodes: ${this.nodes.length}`);
      return this.nodes;
    }

    this.linksToProcess--;
    const node = new WebNode();
    node.url = url;

    if (response == null) {
      node.title = `[ERROR ${response.status} - ${response.statusText}]`;
      node.crawlTime = 0;
      node.links = [];
      if (this.nodes.every((item) => item.url !== node.url)) {
        this.nodes.push(node);
      }
      return this.nodes;
    }

    if (this.crawledSites[url]) 
      return;
    
    this.crawledSites[url] = true;
    node.setStartTime();
    node.isBoundary = true;

    const $ = cheerio.load(response.data);
    const title = $("title").text();
    node.title = title;

    if (url.match(regex)) {
      node.isBoundary = false;
      const domainWithProtocol = this.getDomain(url);
      const links = $("a");
      links.each((i, elem) => {
        let link = $(elem).attr("href");
        if (link) {
          if (!link.startsWith("http")) {
            link = domainWithProtocol + (link.startsWith("/") ? "" : "/") + link;
          }
          if (!node.links.includes(link) && !link.includes("mailto")) {
            node.links.push(link);
          }
        }
      });
    }

    node.setCrawlTime();
    this.linksToProcess += node.links.length;
    if (this.nodes.every((item) => item.url !== node.url)) {
      this.nodes.push(node);
    }

    await this.crawlLinks(node.links, regex);

    return this.nodes;
  }

  private async crawlLinks(links: string[], regex: string): Promise<void> {
    for (const link of links) {
      await this.fetchAndCrawl(link, regex);
    }
  }

  private async fetchData(url: string): Promise<any> {
    const response = await axios
      .get(url)
      .catch((err) => {
        return err.response;
      });
    
    if (!response || response.status !== 200) {
      console.log(`Error fetching data from ${url} [${response.status} - ${response.statusText}]`);
      return;
    }

    return response;
  }

  private getDomain(url: string): string {
    if (!url.startsWith("http")) {
      url = "http://" + url;
    }
    const domain = url.substring(0, url.indexOf("/", 8));
    return !domain ? url : domain;
  }
}

workerpool.worker({
  runCrawlWorker: async (record: WebsiteRecord) => {
    return await new CrawlWorker().runCrawlWorker(record);
  },
});
