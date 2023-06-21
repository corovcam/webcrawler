import React from "react";
import { Button, Box } from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
  const [pageSize, setPageSize] = React.useState(20);
  const [selectionModel, setSelectionModel] = React.useState([]);
  const [rows, setRows] = React.useState([]);

  const fetchWebsiteRecords = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3001/website-records");
      if (response.ok) {
        const data = await response.json();
        const rowsWithDataId = data.websiteRecords.map((record) => ({
          ...record,
          id: record.record_id
        }));
        setRows(rowsWithDataId);
      } else {
        console.error("Failed to fetch website records:", response.status);
      }
    } catch (error) {
      console.error("Error while fetching website records:", error);
    }
  };

  React.useEffect(() => {
    fetchWebsiteRecords();
  }, []);

  const columns = [
    { field: "record_id", headerName: "ID", minWidth: 5 },
    { field: "url", headerName: "URL", minWidth: 150 },
    { field: "boundary_regexp", headerName: "Boundary RegExp", minWidth: 100 },
    { field: "periodicity", headerName: "Periodicity", width: 100 },
    { field: "label", headerName: "Label", minWidth: 50 },
    { field: "is_active", headerName: "Active?", minWidth: 50 },
    { field: "tags", headerName: "Tags", minWidth: 150 },
    { field: "last-exec-time", headerName: "Last Execution Time", width: 100 },
    { field: "last-exec-status", headerName: "Last Execution Status", width: 50 },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleShow(params.row.id)} // Použijeme record_id místo id
          >
            Show
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleEdit(params.row.id)} // Použijeme record_id místo id
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => handleDelete(params.row.id)} // Použijeme record_id místo id
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleCrawl(params.row.id)} // Použijeme record_id místo id
          >
            Crawl
          </Button>
        </>
      ),
    }
  ];

const handleShow = (recordId) => {
  fetch(`http://127.0.0.1:3001/website-record/${recordId}`)
    .then(response => response.json())
    .then(data => {
      console.log('Website Record:', data.websiteRecord);
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

const handleEdit = (recordId) => {
  fetch(`http://127.0.0.1:3001/website-record/${recordId}`)
    .then(response => response.json())
    .then(data => {
      console.log('Edit Website Record:', data.websiteRecord);
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

const handleDelete = (recordId) => {
  fetch(`http://127.0.0.1:3001/delete-website-record/${recordId}`, {
    method: 'DELETE'
  })
    .then(response => response.text())
    .then(data => {
      console.log('Delete Website Record:', data);
      fetchWebsiteRecords();
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

const handleCrawl = (recordId) => {
  fetch(`http://127.0.0.1:3001/crawl-website-record/${recordId}`)
    .then(response => response.text())
    .then(data => {
      console.log('Crawl Website Record:', data);
    })
    .catch(error => {
      console.error('Error:', error);
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
        <Box sx={{ height: 550, flexGrow: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[20, 50, 100]}
            checkboxSelection
            onSelectionModelChange={(newSelectionModel) => {
              setSelectionModel(newSelectionModel);
            }}
            selectionModel={selectionModel}
            components={{
              Toolbar: EditToolbar,
            }}
          />
        </Box>
      </Box>
      {selectionModel.length > 0 && (
        <Button
          startIcon={<VisibilityIcon />}
          onClick={() => alert(JSON.stringify(selectionModel))}
        >
          Visualise Selection
        </Button>
      )}
    </>
  );
}
