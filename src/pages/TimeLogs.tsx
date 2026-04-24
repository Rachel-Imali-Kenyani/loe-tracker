import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info, Clock, AlertTriangle } from 'lucide-react';
import './TimeLogs.css';

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
    <div className="time-logs">
      <header className="page-header time-header">
        <div>
          <h1 className="page-title" style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>Time Logger</h1>
          <div className="month-selector">
            <span className="current-month">{monthName}</span>
            <button className="icon-btn" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
            <button className="icon-btn" onClick={handleNextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <button 
            className="btn btn-danger submit-btn"
            disabled={incompleteDays.length > 0}
            style={incompleteDays.length > 0 ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
            title={incompleteDays.length > 0 ? "Complete all work days to submit" : ""}
          >
            <AlertTriangle size={16} /> Submit LoE
          </button>
          {incompleteDays.length > 0 && (
            <span style={{ fontSize: '0.65rem', color: '#ef4444', textAlign: 'right', maxWidth: '250px', lineHeight: 1.2 }}>
              Missing logs for {incompleteDays.length} work day(s)
            </span>
          )}
        </div>
      </header>

      <div className="page-content pt-0">
        <div className="status-cards">
          <div className="status-card border-left-lime">
            <div className="status-icon"><Info size={20} color="#a3e635" /></div>
            <div className="status-info">
              <span className="status-label">SUBMISSION DEADLINE</span>
              <span className="status-value">Oct 31, 23:59 EST</span>
            </div>
          </div>
          <div className="status-card border-left-teal">
            <div className="status-icon"><Clock size={20} color="var(--accent)" /></div>
            <div className="status-info">
              <span className="status-label">WORK DAYS</span>
              <span className="status-value">22 Days (176 Hours Total)</span>
            </div>
          </div>
          <div className="status-card border-left-white">
            <div className="status-icon"><AlertTriangle size={20} color="var(--text-primary)" /></div>
            <div className="status-info">
              <span className="status-label">STATUS</span>
              <span className="status-value">{Math.max(0, 176 - totalLoggedHours)} Hours Remaining</span>
            </div>
          </div>
        </div>

        {showForm ? (
          <div className="entry-controls" style={{ alignItems: 'center' }}>
            
            <div className="control-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginRight: '1rem' }}>
              <label style={{ margin: 0, cursor: 'pointer', color: isTimeOff ? 'var(--accent)' : 'var(--text-secondary)' }} onClick={() => setIsTimeOff(!isTimeOff)}>
                TIME OFF
              </label>
              <div 
                className={`toggle-switch ${isTimeOff ? 'active' : ''}`}
                onClick={() => setIsTimeOff(!isTimeOff)}
                style={{ margin: 0 }}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>

            {!isTimeOff && (
              <>
                <div className="control-group">
                  <label>PROJECT / ACTIVITY</label>
                  <select 
                    className="control-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                
                <div className="control-group">
                  <label>HOURS</label>
                  <input 
                    type="number" 
                    className="control-input" 
                    min="0.5"
                    max={8 - (totalHoursSelectedDay - (editingLogId ? (logs.find(l=>l.id===editingLogId)?.hours || 0) : 0))}
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {editingLogId && (
                <>
                  <button className="btn btn-danger" onClick={handleDeleteLog}>DELETE</button>
                  <button className="btn btn-outline" onClick={handleCancelEdit}>CANCEL</button>
                </>
              )}
              <button className="btn log-time-btn" onClick={handleLogTime}>
                {editingLogId ? 'UPDATE' : 'LOG TIME'}
              </button>
            </div>
          </div>
        ) : (
          <div className="entry-controls" style={{ alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} color="var(--accent)"/> Maximum hours (8h) logged for this day. Click on an entry in the calendar to edit it.
            </span>
          </div>
        )}

        <div className="calendar-grid">
          <div className="calendar-header">
            <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div>SUN</div>
          </div>
          <div className="calendar-body">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
              }

              const dateStr = formatDateStr(day);
              const dayLogs = logs.filter(l => l.date === dateStr);
              const isSelectedDay = isSelected(day);
              const isTodayDay = isToday(day);

              return (
                <div 
                  key={`day-${day}`}
                  onClick={() => {
                    setSelectedDate(new Date(year, month, day));
                    setEditingLogId(null);
                    setHours(8);
                    setIsTimeOff(false);
                  }}
                  className={`calendar-day ${isSelectedDay ? 'active-day' : ''}`}
                >
                  <span className={`date ${isTodayDay ? 'highlight' : ''}`}>
                    {String(day).padStart(2, '0')} {isTodayDay ? '(TODAY)' : ''}
                  </span>
                  
                  {dayLogs.map(log => {
                    const entryClass = log.category === 'PROJECT WORK' ? 'project-entry' : 
                                       log.category === 'MEETINGS' ? 'meeting-entry' : 'timeoff-entry';
                    return (
                      <div 
                        key={log.id} 
                        className={`log-entry ${entryClass}`}
                        onClick={(e) => handleEditLog(e, log)}
                        style={{ cursor: 'pointer', outline: editingLogId === log.id ? '2px solid var(--text-primary)' : 'none' }}
                      >
                        <span className="log-name">{log.project}</span>
                        <span className="log-hours">{log.hours.toFixed(1)}h</span>
                      </div>
                    );
                  })}

                  {isSelectedDay && showForm && !editingLogId && (
                    <div className="log-placeholder">LOG HOURS HERE</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="floating-stats">
          <h4>QUICK STATS</h4>
          <div className="stat-row">
            <span className="stat-name">BDC</span>
            <span className="stat-hours">104h</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">ERM Assess</span>
            <span className="stat-hours">42h</span>
          </div>
          <div className="stat-row">
            <span className="stat-name">Time-Off</span>
            <span className="stat-hours lime">8h</span>
          </div>
        </div>

      </div>
    </div>
  );
}
