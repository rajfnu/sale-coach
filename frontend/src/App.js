import React, { useState } from 'react';
import Design from './Design';
import Cost from './Cost';
import Architecture from './Architecture';
import AppContext from './AppContext';

function App() {
  const [activeTab, setActiveTab] = useState('architecture');

  // Shared state between Design and Cost tabs
  const [salesCoachConfig, setSalesCoachConfig] = useState({
    globalParams: {
      num_users: 100,
      assessments_per_user_per_month: 40,
      service_tier: 'basic'
    },
    agentConfigs: {},
    lastUpdated: null
  });

  // Function to update sales coach configuration from Design tab
  const updateSalesCoachConfig = (globalParams, agentConfigs, agentCosts) => {
    setSalesCoachConfig({
      globalParams,
      agentConfigs,
      agentCosts,
      lastUpdated: new Date().toISOString()
    });
  };

  // Function to get cost parameters from Sales Coach configuration
  const getSalesCoachCostParams = () => {
    return {
      agent_type: 'sales-coach',
      num_users: salesCoachConfig.globalParams.num_users,
      queries_per_user_per_month: salesCoachConfig.globalParams.assessments_per_user_per_month,
      service_tier: salesCoachConfig.globalParams.service_tier,
      avg_input_tokens: 10000,
      avg_output_tokens: 1000,
      infrastructure_scale: 1.0,
      llm_mix: {
        'gpt-4o': 60.0,
        'claude-3.5-sonnet': 30.0,
        'llama-3.1-70b': 10.0
      },
      cache_hit_rate: 0.70,
      use_prompt_caching: true,
      use_reserved_instances: true,
      deployment_type: 'cloud_api'
    };
  };

  return (
    <AppContext.Provider value={{ salesCoachConfig, setSalesCoachConfig, updateSalesCoachConfig, getSalesCoachCostParams }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-4xl font-bold">Sales AI Agent</h1>
            <p className="text-blue-100 mt-2">AI-Powered Sales Coach Design & Cost Calculator</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-white shadow-lg rounded-xl">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'architecture', name: 'SCIP Architecture', icon: 'Settings' },
                  { id: 'design', name: 'Sales Coach Design', icon: 'Briefcase' },
                  { id: 'cost', name: 'Cost Calculator', icon: 'DollarSign' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'architecture' && <Architecture />}
              {activeTab === 'design' && <Design />}
              {activeTab === 'cost' && <Cost />}
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
