import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { Layout } from './components/Layout';
import { TimeLogs } from './pages/TimeLogs';
import { Dashboard } from './pages/Dashboard';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { SignIn } from './pages/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="time-logs" element={<TimeLogs />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
