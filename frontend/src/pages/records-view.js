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

const GraphVisualisationFromIds = React.lazy(() =>
  import("../components/GraphVisualisationFromIds")
);

export default function RecordsView({
  activeSelection,
  setActiveSelection,
  staticGraph,
  setStaticGraph,
}) {
  const [pageSize, setPageSize] = useState(20);
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
              "last-exec-status": record?.is_being_crawled === 0 ? true : false,
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
    { field: "periodicity", headerName: "Periodicity", type: "number" },
    { field: "label", headerName: "Label", minWidth: 50 },
    { field: "is_active", headerName: "Active?", type: "boolean" },
    { field: "tags", headerName: "Tags", minWidth: 150 },
    {
      field: "last-exec-time",
      headerName: "Last Execution Time",
      type: "dateTime",
      valueGetter: ({ value }) => value && new Date(value),
    },
    {
      field: "last-exec-status",
      headerName: "Last Execution Status",
      type: "boolean",
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 300,
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
                setActiveSelection(newSelectionModel);
              }}
              rowSelectionModel={activeSelection}
              keepNonExistentRowsSelected
              slots={{
                toolbar: EditToolbar,
              }}
            />
          </Box>
          {activeSelection.length > 0 && (
            <React.Suspense fallback="LOADING...">
              <GraphVisualisationFromIds
                graphIds={activeSelection}
                staticGraph={staticGraph}
                setStaticGraph={setStaticGraph}
              />
            </React.Suspense>
          )}
        </Stack>
      </Box>
    </>
  );
}

function EditToolbar() {
  return (
    <GridToolbarContainer>
      <Link to={`/wizard`}>
        <Button color="primary" startIcon={<AddIcon />}>
          Add Website Record
        </Button>
      </Link>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}
