
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import ProjectsPage from '../components/ProjectsPage';
import SalesPage from '../components/SalesPage';
import ContractorsPage from '../components/ContractorsPage';
import SuppliersPage from '../components/SuppliersPage';
import PurchasesPage from '../components/PurchasesPage';
import ExtractsPage from '../components/ExtractsPage';
import AccountingPage from '../components/AccountingPage';
import InvoicesPage from '../components/InvoicesPage';
import MaintenancePage from '../components/MaintenancePage';
import TasksPage from '../components/TasksPage';
import ReportsPage from '../components/ReportsPage';
import SettingsPage from '../components/SettingsPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectsPage />;
      case 'sales':
        return <SalesPage />;
      case 'contractors':
        return <ContractorsPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'extracts':
        return <ExtractsPage />;
      case 'accounting':
        return <AccountingPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'tasks':
        return <TasksPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      
      <main className="transition-all duration-300 pt-16 pr-64 pl-6 pb-6">
        <div className="max-w-7xl mx-auto py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
