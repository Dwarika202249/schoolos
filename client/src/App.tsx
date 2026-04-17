import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">School OS</h1>
          <p className="text-slate-500">The intelligent operating system for your institution.</p>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            System Ready
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database</span>
            <p className="text-sm font-medium text-slate-700">MongoDB Atlas</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend</span>
            <p className="text-sm font-medium text-slate-700">Node.js + TS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
