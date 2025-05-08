
import { Toaster } from './components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import QuickIDGamePage from './pages/QuickIDGamePage';
import NotFound from './pages/NotFound';
import GroundTruthEditor from './pages/GroundTruthEditor';
import './index.css';
import './styles/ocean-styles.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/quick-id-game" element={<QuickIDGamePage />} />
          <Route path="/ground-truth-editor" element={<GroundTruthEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
