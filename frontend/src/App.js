import * as React from "react";
import { Routes, Route } from "react-router-dom";
import { Button, CssBaseline } from '@mui/material';
import './App.css';
import Wizard from "./pages/wizard"

function App() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="wizard" element={<WizardPage />} />
        </Routes>
      </div>
    </>
  );
}

function HomePage() {
  return (
    <>
      <main>
        <h1>Welcome to our WebCrawler App!</h1>
        <p>Enter the Wizard below to get started.</p>
      </main>
      <nav>
        <Button variant="contained" href="/wizard">Wizard</Button>
      </nav>
    </>
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
        <Button variant="contained" href="/">Home</Button>
      </nav>
    </>
  );
}

export default App;
