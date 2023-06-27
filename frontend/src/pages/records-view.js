import React, { useEffect, useState } from "react";
import { Button, Box, Stack } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import { GraphVisualisationFromIds } from "../components/graph-visualisation.js";

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} href="/wizard">
        Add Website Record
      </Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function RecordsView() {
  const [pageSize, setPageSize] = useState(20);
  const [selectionModel, setSelectionModel] = useState([]);
  const [rows, setRows] = useState([]);

  const fetchWebsiteRecords = React.useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/website-records");
      if (response.ok) {
        const data = await response.json();
        const rowsWithDataId = await Promise.all(
          data.websiteRecords.map(async (record) => {
            const lastExecution = await fetchLastExecution(record.record_id);
            return {
              ...record,
              id: record.record_id,
              "last-exec-time": lastExecution?.end_time ?? "",
              "last-exec-status":
                lastExecution?.status === 0 ? "completed" : "crawling",
              is_active: record.is_active === 0 ? false : true,
              tags: record.tags,
            };
          })
        );
        setRows(rowsWithDataId);
      } else {
        console.error("Failed to fetch website records:", response.status);
      }
    } catch (error) {
      console.error("Error while fetching website records:", error);
    }
  }, []);

  const fetchLastExecution = async (recordId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:3001/last-execution/website-record/${recordId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.execution;
      } else if (response.status === 404) {
        return null;
      } else {
        console.error("Failed to fetch last execution:", response.status);
      }
    } catch (error) {
      console.error("Error while fetching last execution:", error);
    }
  };

  useEffect(() => {
    fetchWebsiteRecords();
  }, [fetchWebsiteRecords]);

  const columns = [
    { field: "record_id", headerName: "ID", minWidth: 5 },
    { field: "url", headerName: "URL", minWidth: 150 },
    { field: "boundary_regexp", headerName: "Boundary RegExp", minWidth: 100 },
    { field: "periodicity", headerName: "Periodicity", width: 100 },
    { field: "label", headerName: "Label", minWidth: 50 },
    { field: "is_active", headerName: "Active?", minWidth: 50 },
    { field: "tags", headerName: "Tags", minWidth: 150 },
    { field: "last-exec-time", headerName: "Last Execution Time", width: 100 },
    {
      field: "last-exec-status",
      headerName: "Last Execution Status",
      width: 50,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <>
          <Link to={`/execution/${params.row.id}`}>
            <Button variant="outlined" color="primary" size="small">
              Show
            </Button>
          </Link>
          <Link to={`/wizard/${params.row.id}`}>
            <Button variant="outlined" color="primary" size="small">
              Edit
            </Button>
          </Link>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleCrawl(params.row.id)}
          >
            Crawl
          </Button>
        </>
      ),
    },
  ];

  const handleDelete = (recordId) => {
    fetch(`http://127.0.0.1:3001/delete-website-record/${recordId}`, {
      method: "DELETE",
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("Delete Website Record:", data);
        fetchWebsiteRecords();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCrawl = (recordId) => {
    fetch(`http://127.0.0.1:3001/crawl-website-record/${recordId}`)
      .then((response) => response.text())
      .then((data) => {
        console.log("Crawl Website Record:", data);
        fetchWebsiteRecords();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "90%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          m: "auto auto",
        }}
      >
        <Stack direction="column" spacing={2}>
          <Box sx={{ height: 550, flexGrow: 1 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[20, 50, 100]}
              checkboxSelection
              onRowSelectionModelChange={(newSelectionModel) => {
                setSelectionModel(newSelectionModel);
              }}
              rowSelectionModel={selectionModel}
              slots={{
                toolbar: EditToolbar,
              }}
            />
          </Box>
          {selectionModel.length > 0 && (
            // <>
            //   <Button
            //     startIcon={<VisibilityIcon />}
            //     // Zobraziť graf pre vybrané recordIds v selectionModel
            //     // Graf sa zobrazí ako modal dialog (https://mui.com/components/dialogs/#modal) alebo ako nová stránka
            //     onClick={() => graphContainerRef.current.append(<></>)}
            //   >
            //     Visualise Selection
            //   </Button>
            //   <div ref={graphContainerRef} />
            // </>
            <GraphVisualisationFromIds graphIds={selectionModel} />
          )}
        </Stack>
      </Box>
    </>
  );
}
