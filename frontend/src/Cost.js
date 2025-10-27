import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Server, Database, Cloud, BarChart3, Users, Zap, Settings, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAppContext } from './AppContext';

const Cost = () => {
  // Get Sales Coach configuration from context
  const { salesCoachConfig, getSalesCoachCostParams } = useAppContext();
  // Available AI Agents
  const [availableAgents, setAvailableAgents] = useState([]);

  // Current selection and parameters
  const [selectedAgent, setSelectedAgent] = useState('sales-coach');
  const [agentDetails, setAgentDetails] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Cost calculation results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Expanded rows state for showing formula, drivers, tips
  const [expandedRows, setExpandedRows] = useState({});

  // Parameters
  const [params, setParams] = useState({
    agent_type: 'sales-coach',
    service_tier: 'standard',
    num_users: 100,
    queries_per_user_per_month: 1000,
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
    use_reserved_instances: true
  });

  // Manual pricing overrides
  const [manualPricing, setManualPricing] = useState({
    dataSources: {},  // { "ZoomInfo": 15000, "LinkedIn": 9900, ... }
    monitoring: {}    // { "Log Analytics": 350, "Application Insights": 325, ... }
  });

  // Fetch available agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Fetch agent list
  const fetchAgents = async () => {
    try {
      const response = await axios.get('/api/cost/agents');
      setAvailableAgents(response.data.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // Fetch agent details when selection changes
  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDetails(selectedAgent);
    }
  }, [selectedAgent]);

  const fetchAgentDetails = async (agentId) => {
    try {
      const response = await axios.get(`/api/cost/agents/${agentId}`);
      setAgentDetails(response.data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
    }
  };

  // Calculate costs on param changes
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateCosts();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [params]);

  const calculateCosts = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/cost/calculate', params);
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleLLMMixChange = (model, value) => {
    setParams(prev => ({
      ...prev,
      llm_mix: { ...prev.llm_mix, [model]: parseFloat(value) }
    }));
  };

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    setParams(prev => ({ ...prev, agent_type: agentId }));
  };

  // Load Sales Coach configuration into Cost Calculator
  const loadSalesCoachConfig = () => {
    const salesCoachParams = getSalesCoachCostParams();
    // Merge with existing params to preserve defaults like infrastructure_scale
    setParams(prev => ({
      ...prev,
      ...salesCoachParams
    }));
    setSelectedAgent('sales-coach');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Toggle expanded row
  const toggleRow = (tabName, idx) => {
    const key = `${tabName}-${idx}`;
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Render expanded row details
  const renderExpandedDetails = (item) => {
    const hasDetails = item.calculation_formula || (item.cost_drivers && item.cost_drivers.length > 0) || (item.optimization_tips && item.optimization_tips.length > 0);

    if (!hasDetails) return null;

    return (
      <div className="p-4 space-y-3">
        {item.calculation_formula && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Formula:</div>
            <code className="block bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
              {item.calculation_formula}
            </code>
          </div>
        )}

        {item.cost_drivers && item.cost_drivers.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-700 mb-1">Cost Drivers:</div>
            <ul className="list-disc list-inside ml-2 text-sm text-gray-600 space-y-1">
              {item.cost_drivers.map((driver, i) => (
                <li key={i}>{driver}</li>
              ))}
            </ul>
          </div>
        )}

        {item.optimization_tips && item.optimization_tips.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center mb-2">
              <span className="text-green-700 font-semibold text-sm">💡 Optimization Tips:</span>
            </div>
            <ul className="list-disc list-inside ml-2 text-sm text-green-700 space-y-1">
              {item.optimization_tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Monthly Cost</h3>
            <DollarSign className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{results ? formatCurrency(results.total_monthly_cost) : '-'}</p>
          <p className="text-xs opacity-75 mt-1">Total infrastructure + LLM</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Per User/Month</h3>
            <Users className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{results ? formatCurrency(results.cost_per_user_monthly) : '-'}</p>
          <p className="text-xs opacity-75 mt-1">{params.num_users} users</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Per Query</h3>
            <Zap className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{results ? formatCurrency(results.cost_per_query) : '-'}</p>
          <p className="text-xs opacity-75 mt-1">{results ? formatNumber(results.queries_per_month) : 0} queries/mo</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Annual Cost</h3>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{results ? formatCurrency(results.total_annual_cost) : '-'}</p>
          <p className="text-xs opacity-75 mt-1">12-month projection</p>
        </div>
      </div>

      {/* Global Usage Parameters */}
      {results && results.global_usage_metrics && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Global Usage Parameters
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {results.global_usage_metrics.description}
          </p>

          {/* Per-User Metrics */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Per-User Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Tokens/User/Month</div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatNumber(results.global_usage_metrics.tokens_per_user_per_month)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Input: {formatNumber(results.global_usage_metrics.input_tokens_per_user_per_month)} |
                  Output: {formatNumber(results.global_usage_metrics.output_tokens_per_user_per_month)}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Storage/User</div>
                <div className="text-2xl font-bold text-green-900">
                  {results.global_usage_metrics.storage_per_user_gb.toFixed(2)} GB
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Total: {results.global_usage_metrics.total_storage_gb.toFixed(2)} GB
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Cost/User/Month</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(results.global_usage_metrics.cost_per_user_per_month)}
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  {results.global_usage_metrics.queries_per_user_per_month} queries/user
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Efficiency Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium">Cost/Query</div>
                <div className="text-xl font-bold text-orange-900">
                  ${results.global_usage_metrics.cost_per_query.toFixed(4)}
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <div className="text-sm text-pink-600 font-medium">Cost/1K Tokens</div>
                <div className="text-xl font-bold text-pink-900">
                  ${results.global_usage_metrics.cost_per_1k_tokens.toFixed(4)}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-sm text-indigo-600 font-medium">Cache Hit Rate</div>
                <div className="text-xl font-bold text-indigo-900">
                  {(results.global_usage_metrics.cache_hit_rate * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <div className="text-sm text-teal-600 font-medium">Tokens/Query</div>
                <div className="text-xl font-bold text-teal-900">
                  {formatNumber(results.global_usage_metrics.avg_tokens_per_query)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent Architecture */}
      {results && results.agent_architecture && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            {results.agent_architecture.agent_name}
          </h3>
          <p className="text-gray-600 mb-4">{results.agent_architecture.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600 mb-1">Sub-Agents</div>
              <div className="text-2xl font-bold text-blue-900">{results.agent_architecture.agents_count}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600 mb-1">Data Buckets</div>
              <div className="text-2xl font-bold text-green-900">{results.agent_architecture.data_buckets}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-600 mb-1">Complexity</div>
              <div className="text-2xl font-bold text-purple-900 capitalize">{results.agent_architecture.complexity}</div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-700 mb-2">Sub-Agents:</h4>
            <div className="flex flex-wrap gap-2">
              {results.agent_architecture.agents_list.map((agent, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {agent}
                </span>
              ))}
            </div>
          </div>

          {results.agent_architecture.mcp_tools && results.agent_architecture.mcp_tools.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">MCP Tools & Functions:</h4>
              <div className="flex flex-wrap gap-2">
                {results.agent_architecture.mcp_tools.map((tool, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Data Sources:</h4>
            <div className="flex flex-wrap gap-2">
              {results.agent_architecture.data_sources.map((source, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      {results && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Server className="w-5 h-5 mr-3 text-blue-600" />
                <span className="font-medium text-gray-700">Infrastructure</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{formatCurrency(results.infrastructure_costs)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-3 text-purple-600" />
                <span className="font-medium text-gray-700">LLM API Costs</span>
              </div>
              <span className="text-lg font-bold text-purple-900">{formatCurrency(results.llm_costs)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Database className="w-5 h-5 mr-3 text-green-600" />
                <span className="font-medium text-gray-700">Data Sources</span>
              </div>
              <span className="text-lg font-bold text-green-900">{formatCurrency(results.data_source_costs)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-3 text-orange-600" />
                <span className="font-medium text-gray-700">Monitoring</span>
              </div>
              <span className="text-lg font-bold text-orange-900">{formatCurrency(results.monitoring_costs)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Savings */}
      {results && (results.savings_from_caching > 0 || results.savings_from_reserved_instances > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4">💰 Cost Savings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.savings_from_caching > 0 && (
              <div>
                <div className="text-sm text-green-600 font-medium">Prompt Caching</div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(results.savings_from_caching)}/mo</div>
              </div>
            )}
            {results.savings_from_reserved_instances > 0 && (
              <div>
                <div className="text-sm text-green-600 font-medium">Reserved Instances</div>
                <div className="text-2xl font-bold text-green-900">{formatCurrency(results.savings_from_reserved_instances)}/mo</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const InfrastructureTab = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Infrastructure Costs (Azure Australia East)</h3>
      {results && results.infrastructure_breakdown && results.infrastructure_breakdown.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {results.infrastructure_breakdown.map((item, idx) => {
                const rowKey = `infrastructure-${idx}`;
                const isExpanded = expandedRows[rowKey];
                const hasDetails = item.calculation_formula || (item.cost_drivers && item.cost_drivers.length > 0) || (item.optimization_tips && item.optimization_tips.length > 0);

                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={`border-b border-gray-100 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => hasDetails && toggleRow('infrastructure', idx)}
                    >
                      <td className="py-3 px-4">
                        {hasDetails && (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{item.subcategory}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{item.quantity.toFixed(0)} {item.unit}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.monthly_cost)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.annual_cost)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.notes}</td>
                    </tr>
                    {isExpanded && hasDetails && (
                      <tr>
                        <td colSpan="6" className="bg-gray-50 border-t border-gray-200">
                          {renderExpandedDetails(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              <tr className="bg-blue-50 font-bold">
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-gray-900">Total Infrastructure</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-blue-900">{formatCurrency(results.infrastructure_costs)}</td>
                <td className="py-3 px-4 text-right text-blue-900">{formatCurrency(results.infrastructure_costs * 12)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No infrastructure data available</p>
      )}
    </div>
  );

  const LLMTab = () => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">LLM API Costs</h3>
      {results && results.llm_breakdown && results.llm_breakdown.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8"></th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Model</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tokens</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
              </tr>
            </thead>
            <tbody>
              {results.llm_breakdown.map((item, idx) => {
                const rowKey = `llm-${idx}`;
                const isExpanded = expandedRows[rowKey];
                const hasDetails = item.calculation_formula || (item.cost_drivers && item.cost_drivers.length > 0) || (item.optimization_tips && item.optimization_tips.length > 0);

                return (
                  <React.Fragment key={idx}>
                    <tr
                      className={`border-b border-gray-100 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => hasDetails && toggleRow('llm', idx)}
                    >
                      <td className="py-3 px-4">
                        {hasDetails && (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{item.subcategory}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatNumber(item.quantity)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.monthly_cost)}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.annual_cost)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.notes}</td>
                    </tr>
                    {isExpanded && hasDetails && (
                      <tr>
                        <td colSpan="6" className="bg-gray-50 border-t border-gray-200">
                          {renderExpandedDetails(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              <tr className="bg-purple-50 font-bold">
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-gray-900">Total LLM Costs</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right text-purple-900">{formatCurrency(results.llm_costs)}</td>
                <td className="py-3 px-4 text-right text-purple-900">{formatCurrency(results.llm_costs * 12)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No LLM data available</p>
      )}
    </div>
  );

  const DataSourcesTab = () => {
    const handleDataSourcePriceChange = (sourceName, value) => {
      setManualPricing(prev => ({
        ...prev,
        dataSources: {
          ...prev.dataSources,
          [sourceName]: parseFloat(value) || 0
        }
      }));
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Premium Data Sources</h3>
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Manual Pricing Override Enabled
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Manual Pricing:</strong> You can override the default pricing for each data source below.
            Enter your actual contract prices in USD per month.
          </p>
        </div>

        {results && results.data_source_breakdown && results.data_source_breakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8"></th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Source</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Default Monthly (AUD)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Override (USD/month)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {results.data_source_breakdown.map((item, idx) => {
                  const rowKey = `datasource-${idx}`;
                  const isExpanded = expandedRows[rowKey];
                  const hasDetails = item.calculation_formula || (item.cost_drivers && item.cost_drivers.length > 0) || (item.optimization_tips && item.optimization_tips.length > 0);

                  return (
                    <React.Fragment key={idx}>
                      <tr className="border-b border-gray-100">
                        <td
                          className={`py-3 px-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('datasource', idx)}
                        >
                          {hasDetails && (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 font-medium text-gray-800 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('datasource', idx)}
                        >
                          {item.subcategory}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold text-gray-900 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('datasource', idx)}
                        >
                          {formatCurrency(item.monthly_cost)}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            placeholder="Enter USD amount"
                            value={manualPricing.dataSources[item.subcategory] || ''}
                            onChange={(e) => handleDataSourcePriceChange(item.subcategory, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td
                          className={`py-3 px-4 text-right text-gray-600 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('datasource', idx)}
                        >
                          {formatCurrency(item.annual_cost)}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-500 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('datasource', idx)}
                        >
                          {item.notes}
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr>
                          <td colSpan="6" className="bg-gray-50 border-t border-gray-200">
                            {renderExpandedDetails(item)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                <tr className="bg-green-50 font-bold">
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-gray-900">Total Data Sources</td>
                  <td className="py-3 px-4 text-right text-green-900">{formatCurrency(results.data_source_costs)}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">Manual overrides above</td>
                  <td className="py-3 px-4 text-right text-green-900">{formatCurrency(results.data_source_costs * 12)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No premium data sources for this agent</p>
        )}
      </div>
    );
  };

  const MonitoringTab = () => {
    const handleMonitoringPriceChange = (serviceName, value) => {
      setManualPricing(prev => ({
        ...prev,
        monitoring: {
          ...prev.monitoring,
          [serviceName]: parseFloat(value) || 0
        }
      }));
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Monitoring & Observability</h3>
          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Manual Pricing Override Enabled
          </div>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>💡 Manual Pricing:</strong> You can override the default pricing for monitoring services below.
            Enter your actual monthly costs in AUD.
          </p>
        </div>

        {results && results.monitoring_breakdown && results.monitoring_breakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 w-8"></th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Default Monthly (AUD)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Override (AUD/month)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                </tr>
              </thead>
              <tbody>
                {results.monitoring_breakdown.map((item, idx) => {
                  const rowKey = `monitoring-${idx}`;
                  const isExpanded = expandedRows[rowKey];
                  const hasDetails = item.calculation_formula || (item.cost_drivers && item.cost_drivers.length > 0) || (item.optimization_tips && item.optimization_tips.length > 0);

                  return (
                    <React.Fragment key={idx}>
                      <tr className="border-b border-gray-100">
                        <td
                          className={`py-3 px-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {hasDetails && (
                            isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                        </td>
                        <td
                          className={`py-3 px-4 font-medium text-gray-800 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {item.subcategory}
                        </td>
                        <td
                          className={`py-3 px-4 text-right text-gray-600 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {item.quantity.toFixed(0)} {item.unit}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-semibold text-gray-900 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {formatCurrency(item.monthly_cost)}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            placeholder="Enter AUD amount"
                            value={manualPricing.monitoring[item.subcategory] || ''}
                            onChange={(e) => handleMonitoringPriceChange(item.subcategory, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td
                          className={`py-3 px-4 text-right text-gray-600 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {formatCurrency(item.annual_cost)}
                        </td>
                        <td
                          className={`py-3 px-4 text-sm text-gray-500 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                          onClick={() => hasDetails && toggleRow('monitoring', idx)}
                        >
                          {item.notes}
                        </td>
                      </tr>
                      {isExpanded && hasDetails && (
                        <tr>
                          <td colSpan="7" className="bg-gray-50 border-t border-gray-200">
                            {renderExpandedDetails(item)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                <tr className="bg-orange-50 font-bold">
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-gray-900">Total Monitoring</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right text-orange-900">{formatCurrency(results.monitoring_costs)}</td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500">Manual overrides above</td>
                  <td className="py-3 px-4 text-right text-orange-900">{formatCurrency(results.monitoring_costs * 12)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No monitoring data available</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Agent Cost Calculator</h1>
          <p className="text-gray-600">Production-ready cost estimation for Azure Australia East (Sydney) deployment</p>
        </div>

        {/* Agent Selector */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Select AI Agent</h2>
            {salesCoachConfig.lastUpdated && (
              <button
                onClick={loadSalesCoachConfig}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                title="Load usage parameters from Sales Coach configuration (preserves selected agent)"
              >
                <RefreshCw className="w-4 h-4" />
                Load Sales Coach Parameters
              </button>
            )}
          </div>
          {salesCoachConfig.lastUpdated && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Sales Coach configuration available</strong> - Last updated: {new Date(salesCoachConfig.lastUpdated).toLocaleString()}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Click "Load Sales Coach Parameters" to use parameters from your Sales Coach setup for ANY selected agent ({salesCoachConfig.globalParams.num_users} users, {salesCoachConfig.globalParams.assessments_per_user_per_month} queries/month)
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentChange(agent.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAgent === agent.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-bold text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{agent.agents_count} agents</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize">{agent.complexity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Message */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-indigo-200 mb-6">
          <div className="flex items-start">
            <Settings className="w-6 h-6 text-indigo-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Configure in Sales Coach Tab</h3>
              <p className="text-gray-700 mb-3">
                All configuration (Number of Users, Assessments per User, Agent Settings) is now managed in the
                <strong className="text-indigo-600"> "Sales Coach in the Pocket"</strong> tab.
              </p>
              <div className="bg-white rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Current Configuration:</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Users:</span>
                    <div className="font-semibold text-gray-800">{params.num_users}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Assessments/User:</span>
                    <div className="font-semibold text-gray-800">{params.queries_per_user_per_month}</div>
                    <div className="text-xs text-gray-500">Each assessment = ~8 AI queries</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Agent Type:</span>
                    <div className="font-semibold text-gray-800 capitalize">{selectedAgent.replace('-', ' ')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['overview', 'infrastructure', 'llm', 'data-sources', 'monitoring'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Calculating costs...</p>
              </div>
            )}

            {!loading && activeTab === 'overview' && <OverviewTab />}
            {!loading && activeTab === 'infrastructure' && <InfrastructureTab />}
            {!loading && activeTab === 'llm' && <LLMTab />}
            {!loading && activeTab === 'data-sources' && <DataSourcesTab />}
            {!loading && activeTab === 'monitoring' && <MonitoringTab />}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 All prices in AUD for Azure Australia East (Sydney) region</p>
          <p>Pricing updated: January 2025 | Includes Reserved Instance discounts & Prompt Caching savings</p>
        </div>
      </div>
    </div>
  );
};

export default Cost;
