import React, { useContext } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { GraphVisualisationFromIds } from "../graph-visualisation";
import { BaseUrlContext } from "../base-url-context";
import { DataGrid } from "@mui/x-data-grid";

export default function ExecutionView({ recordId }) {
  const baseUrl = useContext(BaseUrlContext);

  const [requestedRecord, setRequestedRecord] = React.useState(null);

  const [requestedExecutions, setRequestedExecutions] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;

    Promise.all([
      fetch(`${baseUrl}/website-record/${recordId}`, { method: "GET" }), //get stored data for requested record
      fetch(`${baseUrl}/executions/website-record/${recordId}`, {
        method: "GET",
      }), //get all executions for a website record
    ])
      .then(([websiteRecord, executions]) => {
        if (websiteRecord.ok) {
          if (!ignore) {
            websiteRecord.json().then((websiteRecordData) => {
              setRequestedRecord(websiteRecordData.websiteRecord);
            });
          }
        } else {
          console.error(websiteRecord.status);
        }

        if (executions.ok) {
          if (!ignore) {
            executions.json().then((executionsData) => {
              setRequestedExecutions(executionsData.executions);
            });
          }
        } else {
          console.error(executions.status);
        }
      })
      .catch((err) => {
        console.error(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [recordId, baseUrl]);

  const idForGraph = [recordId];

  return (
    <>
      <Box sx={{ width: 5 / 8, margin: "auto auto" }}>
        <CrawledRecordInfo
          record={requestedRecord}
          listExecutions={requestedExecutions}
        />
        <GraphVisualisationFromIds graphIds={idForGraph} />
      </Box>
    </>
  );
}

function CrawledRecordInfo({ record, listExecutions = [] }) {
  const baseUrl = useContext(BaseUrlContext);

  return (
    <>
      <Box
        sx={{
          border: "2px solid grey",
          borderRadius: "16px",
          justifyContent: "center",
          textAlign: "left",
          padding: 5,
          width: 1,
        }}
      >
        {record !== null ? (
          <>
            <div style={{ marginBottom: 25 }}>
              <span style={{ fontSize: 30 }}>{record.label}</span>

              <span style={{ float: "right" }}>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `${baseUrl}/crawl-website-record/${record.record_id}`,
                        { method: "GET" }
                      );

                      if (!response.ok) {
                        console.error(
                          `Error! Status: ${response.status}, while trying to crawl website record.`
                        );
                      }
                    } catch {
                      console.error("ERROR crawl record!");
                    }
                  }}
                >
                  CRAWL
                </Button>
              </span>
            </div>
            URL: <span style={{ float: "right" }}>{record.url}</span>
            <hr />
            Boundary REGEX: <span style={{ float: "right" }}>{record.boundary_regexp}</span>
            <hr />
            Status – active:{" "}
            <span style={{ float: "right" }}>{(record.is_active === 0 ? "false" : "true")}</span>
            <hr />
            Record ID:{" "}
            <span style={{ float: "right" }}>{record.record_id}</span>
            <hr />
            Crawl time:{" "}
            <span style={{ float: "right" }}>{record.periodicity}</span>
            <hr />
            Executions for this node:
            
            {listExecutions !== [] ? (
              <Executions executionsData={listExecutions} recordLabel={record.label} />
            ) : (
              <>
                <br />
                <i> Nothing to show here.</i>
              </>
            )}
          </>
        ) : (
          <>
            <i> Nothing to show, no record founded.</i>
          </>
        )}
      </Box>
    </>
  );
}



function Executions({ executionsData, recordLabel }) {

  const columns = [
    { field: "recordLabel", headerName: "Record label", minWidth: 320},
    { field: "start_time", headerName: "Started", minWidth: 200},
    { field: "end_time", headerName: "Ended", minWidth: 200},
    { field: "sites_crawled_count", headerName: "Sites crawled", minWidth: 50}
  ];


  try {
    const items = executionsData.map((ex) => (
      {
        ...ex,
        "recordLabel": recordLabel,
        "id": ex.execution_id
      }
    ));


    return (
      <Box sx={{
        marginTop: 3,
        '& .red': {
          backgroundColor: '#FEBDAA',
          color: 'black',
        },
        '& .green': {
          backgroundColor: '#D3FEAA',
          color: 'black',
        },
      }}>
        <DataGrid
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            maxHeight: 400,
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          columns={columns}
          rows={items}
          disableRowSelectionOnClick
          pageSizeOptions={[5]}
          getRowClassName={(r) => {
            return r.status === 0 ? "red" : "green";
          }}
        />
      </Box>
    );
  } catch (err) {
    return <></>;
  }
}


