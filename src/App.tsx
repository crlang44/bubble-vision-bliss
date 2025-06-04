import { Toaster } from './components/ui/sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OceanAnnotationGamePage from './pages/OceanAnnotationGamePage';
import QuickIDGamePage from './pages/QuickIDGamePage';
import NotFound from './pages/NotFound';
import GroundTruthEditor from './pages/GroundTruthEditor';

import './index.css';
import './styles/ocean-styles.css';
import { useClickSound } from './hooks/useClickSound';


function App() {
  useClickSound(); // Just add this line!

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/ocean-annotation" replace />} />
          <Route path="/ocean-annotation" element={<OceanAnnotationGamePage />} />
          <Route path="/quick-id" element={<QuickIDGamePage />} />
          <Route path="/ground-truth-editor" element={<GroundTruthEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
