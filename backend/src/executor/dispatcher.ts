import { parentPort } from "worker_threads";
import axios from "axios";

export default function runDispatcherWorker() {
  axios.defaults.baseURL = "http://127.0.0.1:3001";
  axios.defaults.headers.post["Content-Type"] = "application/json";

  // Test API calls
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
  });
}

runDispatcherWorker();
