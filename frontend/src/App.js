import * as React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { Button, Stack, Box, CssBaseline } from '@mui/material';
import Wizard from "./pages/wizard"
import RecordsView from "./pages/records-view"
import ExecutionView from "./pages/execution-view"
import { BaseUrlContext } from "./base-url-context";

const baseUrl = "http://localhost:3001";

function App() {
  return (
    <>
      <BaseUrlContext.Provider value={baseUrl}>
        <CssBaseline enableColorScheme />
        <Box sx={{ textAlign: 'center' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="wizard" element={<WizardPage />} />
            <Route path="wizard/:recordId" element={<WizardPageId />}/>
            <Route path="view" element={<ViewPage />} />
            <Route path="execution/:recordId" element={<ExecutionPage />} />
          </Routes>
        </Box>
      </BaseUrlContext.Provider>
    </>
  );
}

function HomePage() {
  return (
    <Box sx={{ display: "flex", width: "100%", height: "100%", 
      position: "absolute", justifyContent: "center", alignItems: "center" }}
    >
      <div>
        <main>
          <h1>Welcome to our WebCrawler App!</h1>
          <p>Enter the Wizard below to get started.</p>
        </main>
        <nav>
          <Stack spacing={3} justifyContent="center" alignItems="center">
            <Button variant="contained" href="/wizard">Wizard</Button>
            <Button variant="contained" href="/view">View</Button>
          </Stack>
        </nav>
      </div>
    </Box>
  );
}

function WizardPage() {
  return (
    <>
      <main>
        <h1>Website Record Wizard</h1>
        <Wizard />
      </main>
      <nav>
        <Stack direction="row" spacing={3} m="1%" justifyContent="center" alignItems="center">
          <Button variant="contained" href="/">Home</Button>
          <Button variant="contained" href="/view">View</Button>
        </Stack>
      </nav>
    </>
  );
}

function WizardPageId(){
  const recordId = useParams()
  return (
    <>
      <main>
        <h1>Website Record Wizard</h1>
        <Wizard recordId={recordId}/>
      </main>
      <nav>
        <Stack direction="row" spacing={3} m="1%" justifyContent="center" alignItems="center">
          <Button variant="contained" href="/">Home</Button>
          <Button variant="contained" href="/view">View</Button>
        </Stack>
      </nav>
    </>
  );
}

function ViewPage() {
  return (
    <>
      <main>
        <h1>Website Records View</h1>
        <RecordsView />
      </main>
      <nav>
      <Stack direction="row" spacing={3} m="1%" justifyContent="center" alignItems="center">
        <Button variant="contained" href="/">Home</Button>
        <Button variant="contained" href="/wizard">Wizard</Button>
      </Stack>
      </nav>
    </>
  );
}

function ExecutionPage() {
  const { recordId } = useParams();
  return (
    <>
      <main>
        <h1>Execution View</h1>
        <ExecutionView recordId={recordId} />
      </main>
      <nav>
      <Stack direction="row" spacing={3} m="1%" justifyContent="center" alignItems="center">
        <Button variant="contained" href="/">Home</Button>
        <Button variant="contained" href="/wizard">Wizard</Button>
        <Button variant="contained" href="/view">View</Button>
      </Stack>
      </nav>
    </>
  );
}

export default App;