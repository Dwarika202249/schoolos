import React from 'react';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
