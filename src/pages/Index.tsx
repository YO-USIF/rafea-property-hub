
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
import AssignmentOrdersPage from '../components/AssignmentOrdersPage';
import AccountingPage from '../components/AccountingPage';
import InvoicesPage from '../components/InvoicesPage';
import MaintenancePage from '../components/MaintenancePage';
import TasksPage from '../components/TasksPage';
import ReportsPage from '../components/ReportsPage';
import SettingsPage from '../components/SettingsPage';
import NotificationsManagement from '../components/NotificationsManagement';
import { WarehousePage } from '../components/WarehousePage';
import { PermissionsManagement } from '../components/PermissionsManagement';
import { ProtectedPage } from '../components/ProtectedPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProtectedPage pageName="dashboard">
            <Dashboard />
          </ProtectedPage>
        );
      case 'projects':
        return (
          <ProtectedPage pageName="projects">
            <ProjectsPage />
          </ProtectedPage>
        );
      case 'sales':
        return (
          <ProtectedPage pageName="sales">
            <SalesPage />
          </ProtectedPage>
        );
      case 'contractors':
        return (
          <ProtectedPage pageName="contractors">
            <ContractorsPage />
          </ProtectedPage>
        );
      case 'suppliers':
        return (
          <ProtectedPage pageName="suppliers">
            <SuppliersPage />
          </ProtectedPage>
        );
      case 'purchases':
        return (
          <ProtectedPage pageName="purchases">
            <PurchasesPage />
          </ProtectedPage>
        );
      case 'warehouse':
        return <WarehousePage />;
      case 'extracts':
        return (
          <ProtectedPage pageName="extracts">
            <ExtractsPage />
          </ProtectedPage>
        );
      case 'assignment_orders':
        return (
          <ProtectedPage pageName="assignment_orders">
            <AssignmentOrdersPage />
          </ProtectedPage>
        );
      case 'accounting':
        return (
          <ProtectedPage pageName="accounting">
            <AccountingPage />
          </ProtectedPage>
        );
      case 'invoices':
        return (
          <ProtectedPage pageName="invoices">
            <InvoicesPage />
          </ProtectedPage>
        );
      case 'maintenance':
        return (
          <ProtectedPage pageName="maintenance">
            <MaintenancePage />
          </ProtectedPage>
        );
      case 'tasks':
        return (
          <ProtectedPage pageName="tasks">
            <TasksPage />
          </ProtectedPage>
        );
      case 'reports':
        return (
          <ProtectedPage pageName="reports">
            <ReportsPage />
          </ProtectedPage>
        );
      case 'notifications':
        return <NotificationsManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'settings':
        return (
          <ProtectedPage pageName="settings">
            <SettingsPage />
          </ProtectedPage>
        );
      default:
        return (
          <ProtectedPage pageName="dashboard">
            <Dashboard />
          </ProtectedPage>
        );
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
