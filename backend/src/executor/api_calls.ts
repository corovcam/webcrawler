import axios from "axios";
import {
  AddRecordResponse,
  ExecutionDB,
  WebsiteRecordDB,
} from "../../@types/index";
import WebsiteRecord from "../model/WebsiteRecord";
import Execution from "../model/Execution";

axios.defaults.baseURL = "http://127.0.0.1:3001";
axios.defaults.headers.post["Content-Type"] = "application/json";

export async function getWebsiteRecords(): Promise<WebsiteRecord[]> {
  try {
    // console.log("Worker thread fetching website records...");
    const response = await axios.get("/website-records/");
    const records: WebsiteRecordDB[] = await response.data.websiteRecords;
    const parsedRecords = records.map(
      (record: WebsiteRecordDB): WebsiteRecord => {
        return WebsiteRecord.parseRecord(record);
      }
    );
    return parsedRecords;
  } catch (error) {
    console.log(error);
  }
}

export async function addWebsiteRecord(
  record: WebsiteRecordDB
): Promise<AddRecordResponse> {
  try {
    // console.log("Worker thread adding a new website record...");
    const response = await axios.post(
      "/add-website-record/",
      JSON.stringify(record)
    );
    return await response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function updateWebsiteRecord(
  record: WebsiteRecordDB
): Promise<string> {
  try {
    // console.log("Worker thread updating a website record...");
    const response = await axios.post(
      "/update-website-record/",
      JSON.stringify(record)
    );
    return await response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteWebsiteRecord(id: number): Promise<string> {
  try {
    // console.log("Worker thread deleting a website record...");
    const response = await axios.delete(`/delete-website-record/${id}`);
    return await response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function crawlWebsiteRecord(id: number): Promise<string> {
  try {
    // console.log("Worker thread crawling a website record...");
    const response = await axios.get(`/crawl-website-record/${id}`);
    return await response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getExecutions(): Promise<Execution[]> {
  try {
    // console.log("Worker thread fetching executions...");
    const response = await axios.get("/executions/");
    const executions: ExecutionDB[] = await response.data.executions;
    const parsedExecutions = executions.map(
      (execution: ExecutionDB): Execution => {
        return Execution.parseExecution(execution);
      }
    );
    return parsedExecutions;
  } catch (error) {
    console.log(error);
  }
}

export async function addExecution(execution: ExecutionDB): Promise<number> {
  try {
    // console.log("Worker thread adding a new execution...");
    const response = await axios.post(
      "/add-execution/",
      JSON.stringify(execution)
    );
    return await response.data.executionId;
  } catch (error) {
    console.log(error);
  }
}

export async function getLastExecutionForWebsiteRecord(
  id: number
): Promise<Execution> {
  try {
    // console.log(`Worker thread fetching last execution for website record with id ${id}...`);
    const response = await axios.get(`/last-execution/website-record/${id}`);
    const execution: ExecutionDB = await response.data.execution;
    return execution ? Execution.parseExecution(execution) : null;
  } catch (error) {
    console.log(error);
  }
}

export async function getExecutionsForWebsiteRecord(
  id: number
): Promise<Execution[]> {
  try {
    // console.log(`Worker thread fetching executions for website record with id ${id}...`);
    const response = await axios.get(`/executions/website-record/${id}`);
    const executions: ExecutionDB[] = await response.data.executions;
    const parsedExecutions = executions.map(
      (execution: ExecutionDB): Execution => {
        return Execution.parseExecution(execution);
      }
    );
    return parsedExecutions;
  } catch (error) {
    console.log(error);
  }
}
