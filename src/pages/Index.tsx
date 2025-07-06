
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">إدارة المشاريع</h2>
            <p className="text-gray-600">قريباً... إدارة شاملة لجميع المشاريع العقارية</p>
          </div>
        );
      case 'sales':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">مبيعات الشقق</h2>
            <p className="text-gray-600">قريباً... نظام إدارة المبيعات والعقود</p>
          </div>
        );
      case 'contractors':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">المقاولون والمستخلصات</h2>
            <p className="text-gray-600">قريباً... إدارة المقاولين والمستخلصات</p>
          </div>
        );
      case 'suppliers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">الموردون والفواتير</h2>
            <p className="text-gray-600">قريباً... إدارة الموردين والفواتير</p>
          </div>
        );
      case 'purchases':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">المشتريات</h2>
            <p className="text-gray-600">قريباً... نظام إدارة المشتريات</p>
          </div>
        );
      case 'maintenance':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">الصيانة والتشغيل</h2>
            <p className="text-gray-600">قريباً... نظام إدارة الصيانة</p>
          </div>
        );
      case 'tasks':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">المهام اليومية</h2>
            <p className="text-gray-600">قريباً... إدارة المهام والأنشطة</p>
          </div>
        );
      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">التقارير</h2>
            <p className="text-gray-600">قريباً... تقارير تفصيلية وتحليلات</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">الإعدادات</h2>
            <p className="text-gray-600">قريباً... إعدادات النظام والمستخدمين</p>
          </div>
        );
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
