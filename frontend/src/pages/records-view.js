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

  const columns = [
    { field: "id", headerName: "ID", minWidth: 5 },
    { field: "url", headerName: "URL", minWidth: 150 },
    { field: "regexp", headerName: "Boundary RegExp", minWidth: 100 },
    { field: "periodicity", headerName: "Periodicity", width: 150 },
    { field: "label", headerName: "Label", minWidth: 50 },
    { field: "active", headerName: "Active?", minWidth: 50 },
    { field: "tags", headerName: "Tags", minWidth: 150 },
    { field: "last-exec-time", headerName: "Last Execution Time", width: 200 },
    { field: "last-exec-status", headerName: "Last Execution Status", width: 30 },
  ];

  const rows = require("../data/webcrawler-data.json");

  return (
    <>
      <Box
        sx={{
          display: "flex",
          width: "80%",
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
