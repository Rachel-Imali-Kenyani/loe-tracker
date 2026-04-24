import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TimeLogs } from './pages/TimeLogs';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="time-logs" element={<TimeLogs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
