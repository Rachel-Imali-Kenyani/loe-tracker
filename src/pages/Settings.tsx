import { useState } from 'react';

export function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Settings</h1>
          <p className="text-sm text-on-surface-variant">Manage your account preferences and notifications</p>
        </div>
      </header>
      <div className="pt-0">
        <div className="bg-surface-container border border-outline-variant rounded-lg p-6 mb-6">
          <h2 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold uppercase">NOTIFICATIONS</h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-3 border-b border-outline-variant">
              <span className="text-on-surface text-sm font-semibold">Real-time Email Alerts</span>
              <div 
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${emailAlerts ? 'bg-primary' : 'bg-outline-variant'}`}
                onClick={() => setEmailAlerts(!emailAlerts)}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] transition-transform duration-200 ${emailAlerts ? 'translate-x-5 bg-black' : ''}`}></div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-on-surface text-sm font-semibold">Weekly LoE Digest</span>
              <div 
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${weeklyDigest ? 'bg-primary' : 'bg-outline-variant'}`}
                onClick={() => setWeeklyDigest(!weeklyDigest)}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] transition-transform duration-200 ${weeklyDigest ? 'translate-x-5 bg-black' : ''}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-lg p-6 mb-6">
          <h2 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold uppercase">ACCOUNT</h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-on-surface-variant tracking-wider block mb-2">FULL NAME</label>
              <input type="text" className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm w-full max-w-md focus:border-primary outline-none" defaultValue="Imali Kenyani" />
            </div>
            <div>
              <label className="text-xs text-on-surface-variant tracking-wider block mb-2">EMAIL ADDRESS</label>
              <input type="email" className="bg-transparent border border-outline-variant text-on-surface px-4 py-2.5 rounded text-sm w-full max-w-md focus:border-primary outline-none" defaultValue="imali.kenyani@example.com" disabled />
            </div>
            <div className="mt-2">
              <button className="bg-secondary text-black hover:bg-secondary/90 px-6 py-2.5 rounded font-bold text-sm transition-colors">
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
