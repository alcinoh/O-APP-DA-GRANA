/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Cart } from './components/Cart';
import { Analytics } from './components/Analytics';
import { AIChat } from './components/AIChat';
import { StrategyGallery } from './components/StrategyGallery';
import { BiometricsLockScreen } from './components/BiometricsLockScreen';

function AppContent() {
  const { user, isAppLocked, setIsAppLocked } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  return (
    <>
      {isAppLocked && (
        <BiometricsLockScreen onUnlock={() => setIsAppLocked(false)} />
      )}

      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} onNavigateToChat={() => setActiveTab('chat')} />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'cart' && <Cart />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'chat' && <AIChat />}
        {activeTab === 'strategies' && <StrategyGallery />}
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
