import { Toaster } from './components/ui/sonner';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import QuickIDGamePage from './pages/QuickIDGamePage';
import NotFound from './pages/NotFound';
import GroundTruthEditor from './pages/GroundTruthEditor';
import { MusicProvider } from './components/MusicProvider';
import MusicControl from './components/MusicControl';
import MusicManager from './components/MusicManager';
import './index.css';
import './styles/ocean-styles.css';
import { useClickSound } from './hooks/useClickSound';


function App() {
  useClickSound(); // Just add this line!

  return (
    <>
      <MusicProvider>
        <Router>
          <MusicManager />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quick-id-game" element={<QuickIDGamePage />} />
            <Route path="/ground-truth-editor" element={<GroundTruthEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <MusicControl />
        <Toaster />
      </MusicProvider>
    </>
  );
}

export default App;