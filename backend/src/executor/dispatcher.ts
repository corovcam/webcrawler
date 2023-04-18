import { parentPort } from "worker_threads";
import axios from "axios";

export default function runDispatcherWorker() {
  axios.defaults.baseURL = "http://127.0.0.1:3001";
  axios.defaults.headers.post["Content-Type"] = "application/json";

  // Test Website Record API calls
  parentPort.on("message", async (message: string) => {
    console.log("Worker thread received message: " + message);

    let records = await axios
      .get("/website-records/")
      .then((response) => response.data.websiteRecords)
      .catch((error) => console.log(error.response.data.errorMsg));
    console.log(
      "Worker thread fetched website records: \n" +
        JSON.stringify(records, null, 2)
    );

    console.log("Worker thread adding a new website record...");
    let record = records[0];
    console.log(record);
    await axios
      .post("/add-website-record/", JSON.stringify(record))
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error.response.data.errorMsg));

    record = records[3];
    record.request_do_crawl = true;
    console.log(record);
    await axios
      .post("/update-website-record/", JSON.stringify(record))
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error.response.data.errorMsg));

    // await axios
    //   .delete(`/delete-website-record/${records.length}`)
    //   .then((response) => console.log(response.data.data))
    //   .catch((error) => console.log(error.response.data.errorMsg));

    // Text execution API calls
    let executions = await axios
      .get("/executions/")
      .then((response) => response.data.executions)
      .catch((error) => console.log(error.response.data.errorMsg));
    console.log(
      "Worker thread fetched executions: \n" +
        JSON.stringify(executions, null, 2)
    );

    console.log("Worker thread adding a new execution...");
    let execution = executions[0];
    console.log(execution);
    await axios
      .post("/add-execution/", JSON.stringify(execution))
      .then((response) => console.log(response.data.data))
      .catch((error) => console.log(error.response.data.errorMsg));

    let lastExecution = await axios
      .get("/last-execution/")
      .then((response) => response.data.execution)
      .catch((error) => console.log(error.response.data.errorMsg));
    console.log(
      "Worker thread fetched last execution: \n" +
        JSON.stringify(lastExecution, null, 2)
    );

    let executionsForRecord = await axios
      .get("/executions/website-record/1")
      .then((response) => response.data.executions)
      .catch((error) => console.log(error.response.data.errorMsg));
    console.log(
      "Worker thread fetched executions for website record 1: \n" +
        JSON.stringify(executionsForRecord, null, 2)
    );
    
  });
}

runDispatcherWorker();
