import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getDashboardAllocations } from '../services/projects';
import type { AllocationSummary } from '../services/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-CA');
}

export function Dashboard() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [projects, setProjects] = useState<AllocationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const allocations = await getDashboardAllocations(userId);
        setProjects(allocations);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load allocations.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [userId]);

  const totalLoe = projects.reduce((sum, project) => sum + project.loePercent, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Allocation Summary</h1>
          <p className="text-sm text-on-surface-variant">Overview of current project allocations and assignment dates</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-xs tracking-widest text-on-surface-variant mb-1">TOTAL LOE</span>
            <span className="text-3xl font-bold text-on-surface">{totalLoe}%</span>
          </div>
        </div>
      </header>

      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-on-surface">Active Projects</h2>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {errorMessage}
          </div>
        ) : null}

        <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-variant/30">
                  <th className="p-4 text-xs font-semibold tracking-wider text-on-surface-variant">PROJECT NAME</th>
                  <th className="p-4 text-xs font-semibold tracking-wider text-on-surface-variant">CURRENT LOE %</th>
                  <th className="p-4 text-xs font-semibold tracking-wider text-on-surface-variant text-right">DATE ADDED</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-sm text-on-surface-variant">Loading allocations...</td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-sm text-on-surface-variant">No active project allocations found.</td>
                  </tr>
                ) : (
                  projects.map((project, idx) => (
                    <tr key={project.id} className={idx !== projects.length - 1 ? 'border-b border-outline-variant hover:bg-surface-variant/10' : 'hover:bg-surface-variant/10'}>
                      <td className="p-4 font-medium text-on-surface">{project.projectName}</td>
                      <td className="p-4 font-bold text-secondary">{project.loePercent}%</td>
                      <td className="p-4 text-right font-mono text-on-surface-variant">{formatDate(project.startDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            className="flex items-center gap-2 bg-secondary text-black px-6 py-3 rounded font-bold hover:bg-secondary/90 transition-colors"
            onClick={() => navigate('/time-logs')}
          >
            <Clock size={18} /> Log your time
          </button>
        </div>
      </div>
    </div>
  );
}
