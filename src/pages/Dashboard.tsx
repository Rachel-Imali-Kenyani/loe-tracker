import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const projectsData = [
  { id: 1, name: 'ERM Assess', loe: '40%', dateAdded: '2023-01-15' },
  { id: 2, name: 'ERM: Net Zero Compass', loe: '15%', dateAdded: '2023-03-22' },
  { id: 3, name: 'Fintech: BDC', loe: '20%', dateAdded: '2023-05-10' },
  { id: 4, name: 'PixelEdge: Platform', loe: '10%', dateAdded: '2023-08-01' },
];

export function Dashboard() {
  const navigate = useNavigate();

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
            <span className="text-3xl font-bold text-on-surface">85%</span>
          </div>
        </div>
      </header>

      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-on-surface">Active Projects</h2>
        </div>

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
                {projectsData.map((project, idx) => (
                  <tr key={project.id} className={idx !== projectsData.length - 1 ? "border-b border-outline-variant hover:bg-surface-variant/10" : "hover:bg-surface-variant/10"}>
                    <td className="p-4 font-medium text-on-surface">{project.name}</td>
                    <td className="p-4 font-bold text-secondary">{project.loe}</td>
                    <td className="p-4 text-right font-mono text-on-surface-variant">{project.dateAdded}</td>
                  </tr>
                ))}
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
