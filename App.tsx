import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import InvoiceModule from './components/InvoiceModule';
import BimModule from './components/BimModule';
import RiskModule from './components/RiskModule';
import ComplianceModule from './components/ComplianceModule';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoice');

  const renderContent = () => {
    switch (activeTab) {
      case 'invoice':
        return <InvoiceModule />;
      case 'bim':
        return <BimModule />;
      case 'risk':
        return <RiskModule />;
      case 'compliance':
        return <ComplianceModule />;
      default:
        return <InvoiceModule />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden h-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;