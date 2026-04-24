import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Info, Clock, AlertTriangle } from 'lucide-react';

type Category = 'PROJECT WORK' | 'MEETINGS' | 'TIME-OFF';

interface Log {
  id: string;
  date: string;
  project: string;
  category: Category;
  hours: number;
}

const PROJECTS = [
  'ERM Assess',
  'ERM: Net Zero Compass',
  'Fintech: BDC',
  'ERM COMPASS',
  'Meetings',
  'Others'
];

const INITIAL_LOGS = (() => {
  const generatedLogs: Log[] = [];
  const today = new Date();
  const currentDayOfWeek = today.getDay(); 
  const diffToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  
  const startOfCurrentWeek = new Date(today);
  startOfCurrentWeek.setDate(today.getDate() - diffToMonday);
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let idCounter = 1;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(currentYear, currentMonth, day);
    if (d.getMonth() !== currentMonth) break; 
    if (d >= startOfCurrentWeek) break; 
    
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; 
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rand = Math.random();
    
    if (rand < 0.15) {
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'TIME-OFF', category: 'TIME-OFF', hours: 8 });
    } else if (rand < 0.4) {
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'ERM ASSESS', category: 'PROJECT WORK', hours: 6 });
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'MEETINGS', category: 'MEETINGS', hours: 2 });
    } else if (rand < 0.7) {
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'FINTECH: BDC', category: 'PROJECT WORK', hours: 8 });
    } else {
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'PIXELEDGE: PLATFORM', category: 'PROJECT WORK', hours: 4 });
      generatedLogs.push({ id: `mock-${idCounter++}`, date: dateStr, project: 'ERM COMPASS', category: 'PROJECT WORK', hours: 4 });
    }
  }
  return generatedLogs;
})();

const getFirstUnloggedDay = (logs: Log[]) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Weekday
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hoursLogged = logs.filter(l => l.date === dateStr).reduce((acc, log) => acc + log.hours, 0);
      if (hoursLogged < 8) {
        return d;
      }
    }
  }
  return today;
};

export function TimeLogs() {
  const selectedCellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCellRef.current) {
      setTimeout(() => {
        selectedCellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => getFirstUnloggedDay(INITIAL_LOGS));
  
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [hours, setHours] = useState<number | string>(8);
  const [isTimeOff, setIsTimeOff] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const [logs, setLogs] = useState<Log[]>(INITIAL_LOGS);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleLogTime = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    const otherLogsHours = logs.filter(l => l.date === dateStr && l.id !== editingLogId).reduce((acc, l) => acc + l.hours, 0);
    const newHours = isTimeOff ? 8 : Number(hours);
    
    if (otherLogsHours + newHours > 8) {
      alert("Total logged hours for a day cannot exceed 8 hours.");
      return;
    }

    let newLog: Log;
    if (isTimeOff) {
      newLog = {
        id: editingLogId || Math.random().toString(36).substr(2, 9),
        date: dateStr,
        project: 'TIME-OFF',
        category: 'TIME-OFF',
        hours: 8
      };
    } else {
      if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) return;
      const category: Category = selectedProject === 'Meetings' ? 'MEETINGS' : 'PROJECT WORK';
      
      newLog = {
        id: editingLogId || Math.random().toString(36).substr(2, 9),
        date: dateStr,
        project: selectedProject.toUpperCase(),
        category,
        hours: Number(hours)
      };
    }
    
    if (editingLogId) {
      setLogs(logs.map(l => l.id === editingLogId ? newLog : l));
      setEditingLogId(null);
    } else {
      setLogs([...logs, newLog]);
    }
    
    setHours(8); // reset
    setIsTimeOff(false);
  };

  const handleEditLog = (e: React.MouseEvent, log: Log) => {
    e.stopPropagation();
    const [logYear, logMonth, logDay] = log.date.split('-').map(Number);
    setSelectedDate(new Date(logYear, logMonth - 1, logDay));
    setEditingLogId(log.id);
    if (log.category === 'TIME-OFF') {
      setIsTimeOff(true);
      setHours(8);
    } else {
      setIsTimeOff(false);
      const matchedProject = PROJECTS.find(p => p.toUpperCase() === log.project);
      setSelectedProject(matchedProject || (log.category === 'MEETINGS' ? 'Meetings' : 'Others'));
      setHours(log.hours);
    }
  };

  const handleDeleteLog = () => {
    if (editingLogId) {
      setLogs(logs.filter(l => l.id !== editingLogId));
      setEditingLogId(null);
      setHours(8);
      setIsTimeOff(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setHours(8);
    setIsTimeOff(false);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) days.push(null);
    return days;
  }, [daysInMonth, startOffset]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const isToday = (d: number) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };
  const isSelected = (d: number) => {
    return d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const formatDateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const totalLoggedHours = logs.reduce((acc, log) => acc + log.hours, 0);

  const dateStrSelected = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayLogs = logs.filter(l => l.date === dateStrSelected);
  const totalHoursSelectedDay = selectedDayLogs.reduce((acc, log) => acc + log.hours, 0);
  const hasTimeOffSelectedDay = selectedDayLogs.some(log => log.category === 'TIME-OFF');

  const isDayFull = totalHoursSelectedDay >= 8 || hasTimeOffSelectedDay;
  const showForm = editingLogId !== null || !isDayFull;

  const incompleteDays = useMemo(() => {
    const missingDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hoursLogged = logs.filter(l => l.date === dateStr).reduce((acc, log) => acc + log.hours, 0);
        if (hoursLogged < 8) {
          missingDays.push(day);
        }
      }
    }
    return missingDays;
  }, [year, month, daysInMonth, logs]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Time Logger</h1>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded border border-outline-variant mt-2">
            <span className="font-mono text-sm text-on-surface-variant mr-4">{monthName}</span>
            <button className="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
            <button className="p-1 rounded text-on-surface hover:bg-surface-variant transition-colors" onClick={handleNextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button 
            className="px-6 py-3 rounded font-bold transition-colors flex items-center justify-center gap-2 text-sm bg-error-container text-on-error-container hover:bg-error"
            disabled={incompleteDays.length > 0}
            style={incompleteDays.length > 0 ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
            title={incompleteDays.length > 0 ? "Complete all work days to submit" : ""}
          >
            <AlertTriangle size={16} /> Submit LoE
          </button>
          {incompleteDays.length > 0 && (
            <span className="text-[0.65rem] text-error text-right max-w-[250px] leading-tight mt-1">
              Missing logs for {incompleteDays.length} work day(s)
            </span>
          )}
        </div>
      </header>

      <div className="pt-0">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-secondary">
            <div><Info size={20} className="text-secondary" /></div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">SUBMISSION DEADLINE</span>
              <span className="text-base text-on-surface font-mono">Oct 31, 23:59 EST</span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-primary">
            <div><Clock size={20} className="text-primary" /></div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">WORK DAYS</span>
              <span className="text-base text-on-surface font-mono">22 Days (176 Hours Total)</span>
            </div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg p-6 flex items-center gap-4 border-l-4 border-l-on-surface">
            <div><AlertTriangle size={20} className="text-on-surface" /></div>
            <div className="flex flex-col">
              <span className="text-[0.65rem] text-on-surface-variant tracking-widest mb-1">STATUS</span>
              <span className="text-base text-on-surface font-mono">{Math.max(0, 176 - totalLoggedHours)} Hours Remaining</span>
            </div>
          </div>
        </div>

        {showForm ? (
          <div className="flex items-center bg-surface-variant/20 p-6 rounded border border-outline-variant mb-8">
            
            <div className="flex flex-row items-center gap-3 mr-6">
              <label 
                className={`text-xs tracking-wider cursor-pointer font-semibold ${isTimeOff ? 'text-primary' : 'text-on-surface-variant'}`} 
                onClick={() => setIsTimeOff(!isTimeOff)}
              >
                TIME OFF
              </label>
              <div 
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${isTimeOff ? 'bg-primary' : 'bg-outline-variant'}`}
                onClick={() => setIsTimeOff(!isTimeOff)}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] transition-transform duration-200 ${isTimeOff ? 'translate-x-5 bg-black' : ''}`}></div>
              </div>
            </div>

            {!isTimeOff && (
              <>
                <div className="flex flex-col gap-2 mr-6">
                  <label className="text-xs text-on-surface-variant tracking-wider">PROJECT / ACTIVITY</label>
                  <select 
                    className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm focus:border-primary outline-none min-w-[200px]"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {PROJECTS.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2 mr-6">
                  <label className="text-xs text-on-surface-variant tracking-wider">HOURS</label>
                  <input 
                    type="number" 
                    className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm focus:border-primary outline-none w-24 text-center" 
                    min="0.5"
                    max={8 - (totalHoursSelectedDay - (editingLogId ? (logs.find(l=>l.id===editingLogId)?.hours || 0) : 0))}
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="ml-auto flex gap-2">
              {editingLogId && (
                <>
                  <button className="px-4 py-2.5 rounded font-bold transition-colors text-sm bg-error-container text-on-error-container hover:bg-error" onClick={handleDeleteLog}>DELETE</button>
                  <button className="px-4 py-2.5 rounded font-bold transition-colors text-sm border border-outline-variant text-on-surface hover:bg-surface-variant" onClick={handleCancelEdit}>CANCEL</button>
                </>
              )}
              <button className="bg-secondary text-black hover:bg-secondary/90 px-6 py-2.5 rounded font-bold text-sm" onClick={handleLogTime}>
                {editingLogId ? 'UPDATE' : 'LOG TIME'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-surface-variant/20 rounded border border-outline-variant mb-8">
            <span className="text-sm text-on-surface-variant flex items-center gap-2">
              <Info size={16} className="text-primary"/> Maximum hours (8h) logged for this day. Click on an entry in the calendar to edit it.
            </span>
          </div>
        )}

        <div className="border border-outline-variant bg-surface-container rounded-lg overflow-hidden mb-8">
          <div className="grid grid-cols-7 border-b border-outline-variant">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
              <div key={d} className="p-4 text-center text-xs text-on-surface-variant tracking-wider border-r border-outline-variant last:border-r-0">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="min-h-[120px] border-r border-b border-outline-variant p-2 bg-black/20 cursor-default [&:nth-child(7n)]:border-r-0"></div>;
              }

              const dateStr = formatDateStr(day);
              const dayLogs = logs.filter(l => l.date === dateStr);
              const isSelectedDay = isSelected(day);
              const isTodayDay = isToday(day);

              return (
                <div 
                  key={`day-${day}`}
                  ref={isSelectedDay ? selectedCellRef : null}
                  onClick={() => {
                    setSelectedDate(new Date(year, month, day));
                    setEditingLogId(null);
                    setHours(8);
                    setIsTimeOff(false);
                  }}
                  className={`min-h-[120px] border-r border-b border-outline-variant p-2 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-surface-variant/30 [&:nth-child(7n)]:border-r-0 ${isSelectedDay ? 'bg-surface-variant/20 ring-1 ring-inset ring-primary' : ''}`}
                >
                  <span className={`text-sm font-mono mb-1 ${isTodayDay ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                    {String(day).padStart(2, '0')} {isTodayDay ? '(TODAY)' : ''}
                  </span>
                  
                  {dayLogs.map(log => {
                    const entryClass = log.category === 'PROJECT WORK' ? 'bg-primary/15 text-primary' : 
                                       log.category === 'MEETINGS' ? 'bg-white/10 text-on-surface-variant' : 'bg-secondary/15 text-secondary';
                    return (
                      <div 
                        key={log.id} 
                        className={`flex justify-between p-1 px-2 rounded-sm text-[0.65rem] font-mono cursor-pointer ${entryClass}`}
                        onClick={(e) => handleEditLog(e, log)}
                        style={{ outline: editingLogId === log.id ? '2px solid currentColor' : 'none' }}
                      >
                        <span className="truncate mr-2 font-semibold">{log.project}</span>
                        <span>{log.hours.toFixed(1)}h</span>
                      </div>
                    );
                  })}

                  {isSelectedDay && showForm && !editingLogId && (
                    <div className="bg-error/20 text-error p-1 text-center text-[0.65rem] italic rounded-sm mt-1">LOG HOURS HERE</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 bg-[#080a0f] border border-outline-variant p-5 rounded-lg shadow-2xl w-64 z-10">
          <h4 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold">QUICK STATS</h4>
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-on-surface-variant">BDC</span>
            <span className="text-primary font-mono font-bold">104h</span>
          </div>
          <div className="flex justify-between mb-3 text-sm">
            <span className="text-on-surface-variant">ERM Assess</span>
            <span className="text-primary font-mono font-bold">42h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Time-Off</span>
            <span className="text-secondary font-mono font-bold">8h</span>
          </div>
        </div>

      </div>
    </div>
  );
}
