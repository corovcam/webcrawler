import * as React from "react";
import { Routes, Route, useParams, Link } from "react-router-dom";
import { Button, Stack, Box, CssBaseline } from "@mui/material";
import Wizard from "./pages/wizard";
import RecordsView from "./pages/records-view";
import ExecutionView from "./pages/execution-view";
import { BaseUrlContext } from "./utils/base-url-context";

const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3001";

function App() {
  const [activeSelection, setActiveSelection] = React.useState([]);
  const [staticGraph, setStaticGraph] = React.useState(true);

  const appState = {
    activeSelection,
    setActiveSelection,
    staticGraph,
    setStaticGraph,
  };

  return (
    <>
      <BaseUrlContext.Provider value={baseUrl}>
        <CssBaseline enableColorScheme />
        <Box sx={{ textAlign: "center" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="wizard" element={<WizardPage appState={appState} />} />
            <Route path="wizard/:recordId" element={<WizardPageId />} />
            <Route path="view" element={<ViewPage appState={appState} />} />
            <Route
              path="execution/:recordId"
              element={<ExecutionPage appState={appState} />}
            />
          </Routes>
        </Box>
      </BaseUrlContext.Provider>
    </>
  );
}

function HomePage() {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <main>
          <h1>Welcome to our WebCrawler App!</h1>
          <p>Enter the Wizard below to get started.</p>
        </main>
        <nav>
          <Stack spacing={3} justifyContent="center" alignItems="center">
            <Link to="/wizard">
              <Button variant="contained">Wizard</Button>
            </Link>
            <Link to="/view">
              <Button variant="contained">View</Button>
            </Link>
          </Stack>
        </nav>
      </div>
    </Box>
  );
}

function WizardPage({ appState }) {
  const { activeSelection, setActiveSelection, setStaticGraph } = appState;

  return (
    <>
      <main>
        <h1>Website Record Wizard</h1>
        <Wizard
          activeSelection={activeSelection}
          setActiveSelection={setActiveSelection}
          setStaticGraph={setStaticGraph}
        />
      </main>
      <nav>
        <Stack
          direction="row"
          spacing={3}
          m="1%"
          justifyContent="center"
          alignItems="center"
        >
          <Link to="/">
            <Button variant="contained">Home</Button>
          </Link>
          <Link to="/view">
            <Button variant="contained">View</Button>
          </Link>
        </Stack>
      </nav>
    </>
  );
}

function WizardPageId() {
  const recordId = useParams();
  return (
    <>
      <main>
        <h1>Website Record Wizard</h1>
        <Wizard recordId={recordId} />
      </main>
      <nav>
        <Stack
          direction="row"
          spacing={3}
          m="1%"
          justifyContent="center"
          alignItems="center"
        >
          <Link to="/">
            <Button variant="contained">Home</Button>
          </Link>
          <Link to="/view">
            <Button variant="contained">View</Button>
          </Link>
        </Stack>
      </nav>
    </>
  );
}

function ViewPage({ appState }) {
  const { activeSelection, setActiveSelection, staticGraph, setStaticGraph } =
    appState;

  return (
    <>
      <main>
        <h1>Website Records View</h1>
        <RecordsView
          activeSelection={activeSelection}
          setActiveSelection={setActiveSelection}
          staticGraph={staticGraph}
          setStaticGraph={setStaticGraph}
        />
      </main>
      <nav>
        <Stack
          direction="row"
          spacing={3}
          m="1%"
          justifyContent="center"
          alignItems="center"
        >
          <Link to="/">
            <Button variant="contained">Home</Button>
          </Link>
          <Link to="/wizard">
            <Button variant="contained">Wizard</Button>
          </Link>
        </Stack>
      </nav>
    </>
  );
}

function ExecutionPage({ appState }) {
  const { staticGraph, setStaticGraph } = appState;

  const { recordId } = useParams();
  return (
    <>
      <main>
        <h1>Execution View</h1>
        <ExecutionView
          recordId={recordId}
          staticGraph={staticGraph}
          setStaticGraph={setStaticGraph}
        />
      </main>
      <nav>
        <Stack
          direction="row"
          spacing={3}
          m="1%"
          justifyContent="center"
          alignItems="center"
        >
          <Link to="/">
            <Button variant="contained">Home</Button>
          </Link>
          <Link to="/wizard">
            <Button variant="contained">Wizard</Button>
          </Link>
          <Link to="/view">
            <Button variant="contained">View</Button>
          </Link>
        </Stack>
      </nav>
    </>
  );
}

export default App;
