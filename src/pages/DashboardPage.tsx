import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import OverviewTab from '../components/dashboard/OverviewTab';
import WorkoutsTab from '../components/dashboard/WorkoutsTab';
import NutritionTab from '../components/dashboard/NutritionTab';
import GoalsTab from '../components/dashboard/GoalsTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import SettingsTab from '../components/dashboard/SettingsTab';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onTabChange={setActiveTab} />;
      case 'workouts':
        return <WorkoutsTab />;
      case 'nutrition':
        return <NutritionTab />;
      case 'goals':
        return <GoalsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default DashboardPage;