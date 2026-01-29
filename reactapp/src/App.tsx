// ====================
// PULSE V2 - Κύριο Component Routes
// ====================
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HUD from './pages/HUD';

// Κύριο App Component - Διαχείριση Routing
export default function App(): React.ReactElement {
  return (
    <HashRouter>
      <Routes>
        {/* Κεντρική σελίδα -> Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Mini-Focus HUD (Pop-out Window) */}
        <Route path="/hud" element={<HUD />} />

        {/* Fallback για άγνωστες διαδρομές */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

