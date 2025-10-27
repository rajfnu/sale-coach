import React, { useState, useEffect } from 'react';
import { Briefcase, Settings, Zap, DollarSign, Database, Cpu, Brain, Users, TrendingUp, Target, Shield, MessageSquare, Info, X, Lightbulb, Award, Sparkles, Crown, Server, BarChart3 } from 'lucide-react';
import { useAppContext } from './AppContext';
import axios from 'axios';

// OPTIMIZED SCIP AGENT CONFIGURATION (Based on Tech_Design_Sales_Coach_AI_Agent_OPTIMIZED.md)
const SCIP_AGENTS = {
  supervisor: {
    id: 'supervisor',
    name: 'Supervisor Agent',
    icon: Settings,
    description: 'Master orchestrator using ImpactWon framework',
    category: 'Orchestration',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 4000,
      memory_type: 'redis',
      memory_window: 10,
      tools: ['all_mcp_tools'],
      usage_probability: 100, // Always used
      avg_tokens_per_request: 3000,
      requests_per_4cs_calculation: 1
    },
    llmOptions: [
      // Cheap models
      'gpt-5-nano', 'gemini-1.5-flash-8b', 'gpt-4.1-nano', 'gpt-4o-mini', 'claude-3-haiku',
      // Mid-range models
      'claude-3-5-haiku', 'claude-4-5-haiku', 'o3-mini', 'gpt-4.1', 'gpt-4o',
      // Expensive models
      'o3-deep-research', 'o1', 'claude-opus-4', 'gpt-5-pro', 'o3-pro',
      // On-premise models
      'llama-3-8b', 'llama-3.1-8b', 'mistral-7b', 'phi-3-mini', 'gemma-7b',
      'llama-3-70b', 'llama-3.1-70b', 'mistral-medium', 'mixtral-8x7b'
    ],
    toolsOptions: ['research_tool', 'content_generation_tool', 'competitive_intel_tool', 'fog_analysis_tool', 'engagement_excellence_tool', 'impact_theme_generator_tool'],
    memoryOptions: ['redis', 'cosmos-db', 'in-memory']
  },
  power_plan: {
    id: 'power_plan',
    name: 'Power Plan Agent (4Cs)',
    icon: Target,
    description: 'THE CRITICAL AGENT - Calculate Right to Win via 4Cs scoring',
    category: 'Core',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.3,
      max_tokens: 6000,
      memory_type: 'cosmos-db',
      memory_window: 20,
      tools: ['research_tool', 'fog_analysis_tool', 'impact_theme_generator_tool'],
      usage_probability: 100, // Always used for 4Cs
      avg_tokens_per_request: 8000,
      requests_per_4cs_calculation: 3
    },
    llmOptions: [
      // Cheap models
      'gpt-5-nano', 'gemini-1.5-flash-8b', 'gpt-4.1-nano', 'gpt-4o-mini', 'claude-3-haiku',
      // Mid-range models
      'claude-3-5-haiku', 'claude-4-5-haiku', 'o3-mini', 'gpt-4.1', 'gpt-4o',
      // Expensive models
      'o3-deep-research', 'o1', 'claude-opus-4', 'gpt-5-pro', 'o3-pro',
      // On-premise models
      'llama-3-8b', 'llama-3.1-8b', 'mistral-7b', 'phi-3-mini', 'gemma-7b',
      'llama-3-70b', 'llama-3.1-70b', 'mistral-medium', 'mixtral-8x7b'
    ],
    toolsOptions: ['research_tool', 'fog_analysis_tool', 'impact_theme_generator_tool', 'find_money_validator_tool'],
    memoryOptions: ['cosmos-db', 'azure-sql', 'redis']
  },
  strategic_planning: {
    id: 'strategic_planning',
    name: 'Strategic Planning Agent',
    icon: Brain,
    description: 'CEO Sales Plan + Attainment + Pursuit planning (consolidated)',
    category: 'Core',
    defaultConfig: {
      llm: 'claude-3.5-sonnet',
      temperature: 0.7,
      max_tokens: 8000,
      memory_type: 'cosmos-db',
      memory_window: 15,
      tools: ['research_tool', 'content_generation_tool', 'engagement_excellence_tool'],
      usage_probability: 75, // Used for strategic planning requests
      avg_tokens_per_request: 10000,
      requests_per_4cs_calculation: 2
    },
    llmOptions: ['claude-3.5-sonnet', 'gpt-4o', 'claude-3.5-opus'],
    toolsOptions: ['research_tool', 'content_generation_tool', 'competitive_intel_tool', 'engagement_excellence_tool'],
    memoryOptions: ['cosmos-db', 'azure-sql']
  },
  client_intelligence: {
    id: 'client_intelligence',
    name: 'Client Intelligence Agent',
    icon: Users,
    description: 'Client profiling + BBB stakeholder mapping + Right Clients (consolidated)',
    category: 'Core',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.5,
      max_tokens: 6000,
      memory_type: 'neo4j',
      memory_window: 25,
      tools: ['research_tool', 'competitive_intel_tool', 'fog_analysis_tool'],
      usage_probability: 90, // High probability for client-related queries
      avg_tokens_per_request: 7000,
      requests_per_4cs_calculation: 2
    },
    llmOptions: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    toolsOptions: ['research_tool', 'competitive_intel_tool', 'fog_analysis_tool'],
    memoryOptions: ['neo4j', 'cosmos-db', 'azure-sql']
  },
  deal_assessment: {
    id: 'deal_assessment',
    name: 'Deal Assessment Agent',
    icon: TrendingUp,
    description: 'Deal qualification + budget validation + risk assessment (consolidated)',
    category: 'Core',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.4,
      max_tokens: 5000,
      memory_type: 'cosmos-db',
      memory_window: 15,
      tools: ['research_tool', 'competitive_intel_tool', 'find_money_validator_tool'],
      usage_probability: 85, // Used for deal qualification
      avg_tokens_per_request: 6000,
      requests_per_4cs_calculation: 2
    },
    llmOptions: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    toolsOptions: ['research_tool', 'competitive_intel_tool', 'find_money_validator_tool'],
    memoryOptions: ['cosmos-db', 'azure-sql']
  },
  team_orchestration: {
    id: 'team_orchestration',
    name: 'Team Orchestration Agent',
    icon: Shield,
    description: 'Team planning + right team selection (consolidated)',
    category: 'Supporting',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.6,
      max_tokens: 4000,
      memory_type: 'cosmos-db',
      memory_window: 10,
      tools: ['research_tool', 'license_to_sell_tool'],
      usage_probability: 60, // Used for team-related queries
      avg_tokens_per_request: 5000,
      requests_per_4cs_calculation: 1
    },
    llmOptions: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    toolsOptions: ['research_tool', 'license_to_sell_tool'],
    memoryOptions: ['cosmos-db', 'azure-sql']
  },
  persona_coach: {
    id: 'persona_coach',
    name: 'Persona-Coach Agent (NBM)',
    icon: Lightbulb,
    description: 'CRITICAL: Generates Next-Best-Move recommendations based on 4Cs gaps and deal context',
    category: 'Core',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 4000,
      memory_type: 'cosmos-db',
      memory_window: 20,
      tools: ['research_tool', 'engagement_excellence_tool', 'impact_theme_generator_tool', 'fog_analysis_tool', 'content_generation_tool'],
      usage_probability: 100, // Always used - this is the main value proposition!
      avg_tokens_per_request: 5000,
      requests_per_4cs_calculation: 2 // Called after 4Cs to generate actions
    },
    llmOptions: ['gpt-4o', 'claude-3.5-opus', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    toolsOptions: ['research_tool', 'engagement_excellence_tool', 'impact_theme_generator_tool', 'fog_analysis_tool', 'content_generation_tool', 'competitive_intel_tool'],
    memoryOptions: ['cosmos-db', 'redis', 'azure-sql']
  },
  feedback_agent: {
    id: 'feedback_agent',
    name: 'Feedback Agent',
    icon: MessageSquare,
    description: 'Processes post-meeting notes, updates 4Cs scores, and tracks R2W delta for continuous learning',
    category: 'Supporting',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.5,
      max_tokens: 3000,
      memory_type: 'cosmos-db',
      memory_window: 30,
      tools: ['fog_analysis_tool', 'research_tool'],
      usage_probability: 80, // Used after meetings/interactions
      avg_tokens_per_request: 4000,
      requests_per_4cs_calculation: 1 // Called when feedback is provided
    },
    llmOptions: ['gpt-4o', 'claude-3.5-sonnet', 'gpt-4-turbo'],
    toolsOptions: ['fog_analysis_tool', 'research_tool', 'engagement_excellence_tool'],
    memoryOptions: ['cosmos-db', 'azure-sql', 'redis']
  },
  realtime_coach: {
    id: 'realtime_coach',
    name: 'Real-time Coach Agent',
    icon: Zap,
    description: 'OPTIONAL: Live meeting coaching with transcription',
    category: 'Optional',
    defaultConfig: {
      llm: 'gpt-4o',
      temperature: 0.5,
      max_tokens: 3000,
      memory_type: 'redis',
      memory_window: 50,
      tools: ['speech_to_text', 'fog_analysis_tool'],
      usage_probability: 30, // Optional feature
      avg_tokens_per_request: 4000,
      requests_per_4cs_calculation: 0
    },
    llmOptions: ['gpt-4o', 'gpt-4-turbo'],
    toolsOptions: ['speech_to_text', 'fog_analysis_tool'],
    memoryOptions: ['redis', 'in-memory']
  }
};

const Design = () => {
  // Get context for sharing config with other tabs
  const { updateSalesCoachConfig } = useAppContext();

  const [activeAgent, setActiveAgent] = useState('supervisor');
  const [agentConfigs, setAgentConfigs] = useState(() => {
    // Initialize with default configs
    const configs = {};
    Object.keys(SCIP_AGENTS).forEach(agentId => {
      configs[agentId] = {
        ...SCIP_AGENTS[agentId].defaultConfig,
        deployment_type: 'cloud_api' // Each agent has its own deployment type
      };
    });
    return configs;
  });

  // Global parameters including service tier
  const [globalParams, setGlobalParams] = useState({
    num_users: 100,
    assessments_per_user_per_month: 40, // 10 deals x 4 assessments each
    service_tier: 'basic' // Default to basic tier
  });

  // Service tiers state
  const [tierModels, setTierModels] = useState({ cloud_api: [], on_premise: [] });
  const [tierData, setTierData] = useState({}); // Store full tier information including costs
  const [tierCosts, setTierCosts] = useState({ basic: null, standard: null, premium: null }); // Per-user costs for each tier
  const [tierCostBreakdown, setTierCostBreakdown] = useState(null); // Detailed breakdown for selected tier

  // Popup state for info modal
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // Cost details tabs state
  const [costDetailsTab, setCostDetailsTab] = useState('overview');

  // Individual agent cost calculation
  const [agentCosts, setAgentCosts] = useState({});

  // Calculate individual agent cost (LLM only)
  const calculateAgentCost = async (agentId, config) => {
    try {
      const response = await axios.post('/api/cost/calculate-agent', {
        llm_model: config.llm,
        deployment_type: config.deployment_type || 'cloud_api',
        num_users: globalParams.num_users,
        queries_per_user_per_month: globalParams.assessments_per_user_per_month,
        avg_tokens_per_request: config.avg_tokens_per_request || 5000,
        cache_hit_rate: 0.70,
        use_prompt_caching: true
      });

      return response.data.agent_llm_cost_monthly;
    } catch (error) {
      console.error(`Error calculating cost for ${agentId}:`, error);
      return 0;
    }
  };

  // Update agent cost when configuration changes
  const updateAgentCost = async (agentId) => {
    const config = agentConfigs[agentId];
    if (config) {
      const cost = await calculateAgentCost(agentId, config);
      setAgentCosts(prev => ({ ...prev, [agentId]: cost }));
    }
  };

  // Calculate costs when agent configs or global params change
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(agentConfigs).forEach(agentId => {
        updateAgentCost(agentId);
      });
    }, 500); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentConfigs, globalParams]);

  // Fetch available service tiers from backend
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await axios.get('/api/cost/tiers');
        if (response.data && response.data.tiers) {
          // Convert array to object for easier lookup
          const tiersObj = {};
          response.data.tiers.forEach(tier => {
            tiersObj[tier.tier_id] = tier;
          });
          setTierData(tiersObj);
        }
      } catch (error) {
        console.error('Error fetching service tiers:', error);
      }
    };
    fetchTiers();
  }, []);

  // Calculate per-user costs for ALL tiers when num_users or assessments change
  useEffect(() => {
    const calculateAllTierCosts = async () => {
      try {
        const tiers = ['basic', 'standard', 'premium'];
        const costs = {};

        // Get actual LLM cost from agents
        const actualLLMCost = getActualLLMCost();

        // Calculate cost for each tier in parallel
        const promises = tiers.map(async (tier) => {
          const response = await axios.post('/api/cost/calculate', {
            agent_type: 'sales-coach',
            service_tier: tier,
            deployment_type: 'cloud_api',
            num_users: globalParams.num_users,
            queries_per_user_per_month: globalParams.assessments_per_user_per_month
          });

          if (response.data) {
            // Replace backend's LLM cost with actual agent costs
            const actualTotalCost = response.data.infrastructure_costs +
                                   actualLLMCost +
                                   response.data.memory_system_costs +
                                   response.data.data_source_costs +
                                   response.data.monitoring_costs +
                                   response.data.retrieval_costs +
                                   response.data.security_costs +
                                   response.data.prompt_tuning_costs +
                                   (response.data.mcp_tools_costs || 0);

            // Calculate per-user cost for this tier
            costs[tier] = Math.round(actualTotalCost / globalParams.num_users);
          }
        });

        await Promise.all(promises);
        setTierCosts(costs);
      } catch (error) {
        console.error('Error calculating tier costs:', error);
      }
    };

    const timer = setTimeout(() => {
      calculateAllTierCosts();
    }, 800); // Debounce

    return () => clearTimeout(timer);
  }, [globalParams.num_users, globalParams.assessments_per_user_per_month, agentCosts, agentConfigs]);

  // Fetch detailed cost breakdown for the currently selected tier
  useEffect(() => {
    const fetchTierBreakdown = async () => {
      try {
        const response = await axios.post('/api/cost/calculate', {
          agent_type: 'sales-coach',
          service_tier: globalParams.service_tier,
          deployment_type: 'cloud_api',
          num_users: globalParams.num_users,
          queries_per_user_per_month: globalParams.assessments_per_user_per_month
        });

        if (response.data) {
          setTierCostBreakdown(response.data);
        }
      } catch (error) {
        console.error('Error fetching tier breakdown:', error);
      }
    };

    const timer = setTimeout(() => {
      fetchTierBreakdown();
    }, 800); // Debounce

    return () => clearTimeout(timer);
  }, [globalParams.service_tier, globalParams.num_users, globalParams.assessments_per_user_per_month]);

  // Fetch available models for selected tier (both cloud_api and on_premise)
  useEffect(() => {
    const fetchTierModels = async () => {
      if (!globalParams.service_tier) return;

      try {
        // Fetch both deployment types
        const [cloudResponse, onPremResponse] = await Promise.all([
          axios.get(`/api/cost/tiers/${globalParams.service_tier}/models`, {
            params: { deployment_type: 'cloud_api' }
          }),
          axios.get(`/api/cost/tiers/${globalParams.service_tier}/models`, {
            params: { deployment_type: 'on_premise' }
          })
        ]);

        setTierModels({
          cloud_api: cloudResponse.data?.models?.cloud_api || [],
          on_premise: onPremResponse.data?.models?.on_premise || []
        });
      } catch (error) {
        console.error('Error fetching tier models:', error);
      }
    };
    fetchTierModels();
  }, [globalParams.service_tier]);

  // Sync configuration changes to AppContext (for Cost Calculator)
  useEffect(() => {
    updateSalesCoachConfig(globalParams, agentConfigs, agentCosts);
  }, [globalParams, agentConfigs, agentCosts, updateSalesCoachConfig]);

  // Reset LLM models when tier changes or agent's deployment type changes
  useEffect(() => {
    // Check each agent and reset LLM if not available in current tier/deployment combo
    const updatedConfigs = { ...agentConfigs };
    let hasChanges = false;

    Object.keys(updatedConfigs).forEach(agentId => {
      const config = updatedConfigs[agentId];
      const agent = SCIP_AGENTS[agentId];
      const deploymentType = config.deployment_type || 'cloud_api';
      const availableModels = tierModels[deploymentType] || [];

      if (availableModels.length === 0) return;

      const availableModelIds = availableModels.map(m => m.id);

      if (config.llm && !availableModelIds.includes(config.llm)) {
        // Find first available model for this agent that's in the tier
        const firstAvailableModel = agent.llmOptions.find(model => availableModelIds.includes(model));

        if (firstAvailableModel) {
          updatedConfigs[agentId] = { ...config, llm: firstAvailableModel };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setAgentConfigs(updatedConfigs);
    }
  }, [globalParams.service_tier, tierModels, agentConfigs]);

  const currentAgent = SCIP_AGENTS[activeAgent];
  const currentConfig = agentConfigs[activeAgent];

  // Get per-user per-month cost for a specific tier
  const getPerUserCost = (tierKey) => {
    // Use pre-calculated cost for this specific tier
    if (tierCosts[tierKey]) {
      return tierCosts[tierKey];
    }
    // Use target prices as fallback while calculating
    const targets = { basic: 30, standard: 149, premium: 999 };
    return targets[tierKey] || 0;
  };

  // Calculate actual total LLM cost from individual agent costs (weighted by usage probability)
  const getActualLLMCost = () => {
    let totalLLMCost = 0;
    Object.entries(agentConfigs).forEach(([agentId, config]) => {
      const agentCost = agentCosts[agentId] || 0;
      const probability = (config.usage_probability || 0) / 100;
      totalLLMCost += agentCost * probability;
    });
    return totalLLMCost;
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number helper
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-AU').format(num);
  };

  // Get filtered LLM options based on selected tier and agent's deployment type
  const getFilteredLLMOptions = () => {
    const deploymentType = currentConfig.deployment_type || 'cloud_api';
    const availableModels = tierModels[deploymentType] || [];

    if (availableModels.length === 0) {
      // Fallback to agent's default options if tier models not loaded
      return currentAgent.llmOptions;
    }

    // Get model IDs from tier configuration
    const availableModelIds = availableModels.map(m => m.id);

    // Filter agent's LLM options to only include models available in the selected tier
    return currentAgent.llmOptions.filter(model => availableModelIds.includes(model));
  };

  const handleConfigChange = (field, value) => {
    setAgentConfigs(prev => ({
      ...prev,
      [activeAgent]: {
        ...prev[activeAgent],
        [field]: value
      }
    }));
    
    // Trigger cost recalculation for this agent when LLM or other key parameters change
    if (['llm', 'deployment_type', 'memory_type', 'avg_tokens_per_request'].includes(field)) {
      setTimeout(() => {
        updateAgentCost(activeAgent);
      }, 100); // Small delay to ensure state is updated
    }
  };

  const handleToolToggle = (tool) => {
    const currentTools = currentConfig.tools || [];
    const newTools = currentTools.includes(tool)
      ? currentTools.filter(t => t !== tool)
      : [...currentTools, tool];
    handleConfigChange('tools', newTools);
  };

  const handleGlobalParamChange = (field, value) => {
    setGlobalParams(prev => ({ ...prev, [field]: value }));
  };

  // Individual agent cost is now calculated via API calls

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Sales Coach in the Pocket</h1>
          </div>
          <p className="text-gray-600">
            Configure the 9 optimized AI agents for ImpactWon 4Cs assessment • Lean Agents + Rich Tools Architecture
          </p>
        </div>

        {/* Service Tier Selection */}
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-8 shadow-xl border-2 border-indigo-200 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Award className="w-7 h-7 text-indigo-600 mr-3" />
              Service Tier Selection
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Choose your service tier to automatically configure LLM models, infrastructure, and features.
              Select deployment type (Cloud API / On-Premise) for each agent below.
            </p>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Tier */}
            <div
              onClick={() => handleGlobalParamChange('service_tier', 'basic')}
              className={`cursor-pointer rounded-xl p-6 transition-all transform hover:scale-105 ${
                globalParams.service_tier === 'basic'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl ring-4 ring-green-300'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Sparkles className={`w-6 h-6 mr-2 ${globalParams.service_tier === 'basic' ? 'text-white' : 'text-green-600'}`} />
                  <h3 className="text-xl font-bold">Basic</h3>
                </div>
                {globalParams.service_tier === 'basic' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold mb-1">
                  ${getPerUserCost('basic')}
                  <span className="text-lg font-normal opacity-80">/user/mo</span>
                </div>
                <p className={`text-sm ${globalParams.service_tier === 'basic' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                  Cost-optimized for startups
                </p>
              </div>

              <div className={`space-y-2 text-sm ${globalParams.service_tier === 'basic' ? 'text-white' : 'text-gray-700'}`}>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>50 queries/user/month</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Cheap LLM models</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Basic infrastructure</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>In-memory storage</span>
                </div>
              </div>
            </div>

            {/* Standard Tier */}
            <div
              onClick={() => handleGlobalParamChange('service_tier', 'standard')}
              className={`cursor-pointer rounded-xl p-6 transition-all transform hover:scale-105 ${
                globalParams.service_tier === 'standard'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl ring-4 ring-blue-300'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Award className={`w-6 h-6 mr-2 ${globalParams.service_tier === 'standard' ? 'text-white' : 'text-blue-600'}`} />
                  <h3 className="text-xl font-bold">Standard</h3>
                </div>
                {globalParams.service_tier === 'standard' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold mb-1">
                  ${getPerUserCost('standard')}
                  <span className="text-lg font-normal opacity-80">/user/mo</span>
                </div>
                <p className={`text-sm ${globalParams.service_tier === 'standard' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                  Balanced for production
                </p>
              </div>

              <div className={`space-y-2 text-sm ${globalParams.service_tier === 'standard' ? 'text-white' : 'text-gray-700'}`}>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>500 queries/user/month</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Mid-range LLM models</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Standard infrastructure</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Redis + Data sources</span>
                </div>
              </div>
            </div>

            {/* Premium Tier */}
            <div
              onClick={() => handleGlobalParamChange('service_tier', 'premium')}
              className={`cursor-pointer rounded-xl p-6 transition-all transform hover:scale-105 ${
                globalParams.service_tier === 'premium'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl ring-4 ring-purple-300'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Crown className={`w-6 h-6 mr-2 ${globalParams.service_tier === 'premium' ? 'text-yellow-300' : 'text-purple-600'}`} />
                  <h3 className="text-xl font-bold">Premium</h3>
                </div>
                {globalParams.service_tier === 'premium' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-4xl font-bold mb-1">
                  ${getPerUserCost('premium').toLocaleString()}
                  <span className="text-lg font-normal opacity-80">/user/mo</span>
                </div>
                <p className={`text-sm ${globalParams.service_tier === 'premium' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                  Maximum performance
                </p>
              </div>

              <div className={`space-y-2 text-sm ${globalParams.service_tier === 'premium' ? 'text-white' : 'text-gray-700'}`}>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Unlimited queries</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>All LLM models</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Premium infrastructure</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>All features + Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown for Selected Tier */}
          {globalParams.service_tier && tierCostBreakdown && (() => {
            // Calculate actual LLM cost from individual agents
            const actualLLMCost = getActualLLMCost();

            // Calculate actual total cost (replace backend's incorrect LLM cost with actual sum)
            const actualTotalCost = tierCostBreakdown.infrastructure_costs +
                                   actualLLMCost +
                                   tierCostBreakdown.memory_system_costs +
                                   tierCostBreakdown.data_source_costs +
                                   tierCostBreakdown.monitoring_costs +
                                   tierCostBreakdown.retrieval_costs +
                                   tierCostBreakdown.security_costs +
                                   tierCostBreakdown.prompt_tuning_costs +
                                   (tierCostBreakdown.mcp_tools_costs || 0);

            return (
              <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-md">
                <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {globalParams.service_tier.charAt(0).toUpperCase() + globalParams.service_tier.slice(1)} Tier - Cost Calculation
                </h3>

                <div className="space-y-2 text-sm">
                  {/* Total Monthly Cost */}
                  <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                    <span className="font-semibold text-gray-700">Total Monthly Cost:</span>
                    <span className="font-bold text-indigo-900">${actualTotalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>

                  {/* Cost Components */}
                  <div className="pl-3 space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>• Infrastructure:</span>
                      <span className="font-medium">${tierCostBreakdown.infrastructure_costs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• LLM Costs (from agents):</span>
                      <span className="font-medium">${actualLLMCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Memory (Cosmos DB):</span>
                      <span className="font-medium">${tierCostBreakdown.memory_system_costs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Data Sources:</span>
                      <span className="font-medium">${tierCostBreakdown.data_source_costs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Monitoring & Other:</span>
                      <span className="font-medium">${(tierCostBreakdown.monitoring_costs + tierCostBreakdown.retrieval_costs + tierCostBreakdown.security_costs + tierCostBreakdown.prompt_tuning_costs).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>

                  {/* Per User Calculation */}
                  <div className="flex justify-between items-center py-2 border-t-2 border-indigo-300 mt-2 pt-2">
                    <span className="font-semibold text-gray-700">Number of Users:</span>
                    <span className="font-bold text-indigo-900">{globalParams.num_users}</span>
                  </div>

                  {/* Final Per-User Cost */}
                  <div className="flex justify-between items-center py-3 bg-indigo-100 rounded-lg px-3 border border-indigo-300">
                    <span className="font-bold text-indigo-900">Cost Per User Per Month:</span>
                    <span className="text-xl font-bold text-indigo-900">
                      ${Math.round(actualTotalCost / globalParams.num_users).toLocaleString()}
                    </span>
                  </div>

                  {/* Formula */}
                  <div className="text-xs text-gray-500 italic mt-2 text-center">
                    Formula: Total Monthly Cost (${actualTotalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}) ÷ {globalParams.num_users} users = ${Math.round(actualTotalCost / globalParams.num_users)}/user/month
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Global Parameters */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-indigo-600" />
            Global Usage Parameters
            <button
              onClick={() => setShowInfoPopup(true)}
              className="ml-2 p-1 hover:bg-indigo-100 rounded-full transition-colors"
              title="Learn how these parameters affect cost"
            >
              <Info className="w-5 h-5 text-indigo-600" />
            </button>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Users: {globalParams.num_users}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={globalParams.num_users}
                onChange={(e) => handleGlobalParamChange('num_users', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Sales team members using the system</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessments per User/Month: {globalParams.assessments_per_user_per_month}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={globalParams.assessments_per_user_per_month}
                onChange={(e) => handleGlobalParamChange('assessments_per_user_per_month', parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const deals = Math.ceil(globalParams.assessments_per_user_per_month / 4);
                  const assessmentsPerDeal = Math.round(globalParams.assessments_per_user_per_month / deals);
                  return `Typical: ${deals} deals × ${assessmentsPerDeal} assessments = ${globalParams.assessments_per_user_per_month}/month`;
                })()}
              </p>
            </div>
          </div>

          {/* Total Requests Display */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                Total System Load:
              </span>
              <span className="text-lg font-bold text-indigo-700">
                {(globalParams.num_users * globalParams.assessments_per_user_per_month).toLocaleString()} assessments/month
              </span>
            </div>
          </div>
        </div>

        {/* Info Popup Modal */}
        {showInfoPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Info className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">How Global Parameters Impact Costs</h3>
                  </div>
                  <button
                    onClick={() => setShowInfoPopup(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Overview */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Cost Calculation Formula
                  </h4>
                  <div className="text-sm text-blue-800 font-mono bg-white p-3 rounded border border-blue-300">
                    Total Requests = num_users × assessments_per_user_per_month
                  </div>
                  <p className="text-sm text-blue-800 mt-2">
                    Example: 100 users × 40 assessments = <strong>4,000 total requests/month</strong>
                  </p>
                </div>

                {/* Parameters Explanation */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">Parameter Details:</h4>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Users className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="font-semibold text-gray-900">Number of Users</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Total sales team members using Sales Coach in the Pocket concurrently.
                        </p>
                        <p className="text-sm text-indigo-700 mt-2 font-medium">
                          Impact: Scales LLM costs linearly (2x users = 2x LLM costs)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Target className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                      <div>
                        <h5 className="font-semibold text-gray-900">Assessments per User/Month</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          How many 4Cs (Right-to-Win) assessments each user performs monthly.
                          Typical: {Math.ceil(globalParams.assessments_per_user_per_month / 4)} deals × {Math.round(globalParams.assessments_per_user_per_month / Math.ceil(globalParams.assessments_per_user_per_month / 4))} assessments per deal = {globalParams.assessments_per_user_per_month} assessments.
                        </p>
                        <p className="text-sm text-indigo-700 mt-2 font-medium">
                          Impact: Scales LLM costs linearly (2x assessments = 2x LLM costs)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">How Costs Are Calculated:</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">1.</span>
                      <p><strong>Total requests</strong> are calculated using the formula above</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">2.</span>
                      <p>Each <strong>agent</strong> uses these requests based on its <strong>usage probability</strong> and <strong>requests per assessment</strong></p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">3.</span>
                      <p><strong>LLM API costs</strong> scale with token consumption (agent requests × tokens per request)</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">4.</span>
                      <p><strong>Infrastructure costs</strong> are mostly fixed (~$17K/month) but storage scales slightly</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">5.</span>
                      <p><strong>Data source costs</strong> are fixed subscriptions (~$57K/month for ZoomInfo, LinkedIn, etc.)</p>
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Real Example from Testing
                  </h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div className="flex justify-between">
                      <span>50 users × 40 assessments =</span>
                      <strong>2,000 requests → $75,377/month</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>200 users × 40 assessments =</span>
                      <strong>8,000 requests → $75,626/month</strong>
                    </div>
                    <p className="mt-3 pt-3 border-t border-green-300">
                      💡 <strong>Key Insight:</strong> 4x users = only 0.3% increase in total cost because
                      infrastructure ($17K) and data sources ($57K) are fixed. LLM costs ($73 → $290) scale but are small compared to fixed costs.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowInfoPopup(false)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {Object.entries(SCIP_AGENTS).map(([agentId, agent]) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={agentId}
                    onClick={() => setActiveAgent(agentId)}
                    className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                      activeAgent === agentId
                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{agent.name}</span>
                    {agent.category === 'Core' && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">Core</span>
                    )}
                    {agent.category === 'Optional' && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Optional</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Configuration Panel */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentAgent.name}</h2>
              <p className="text-gray-600">{currentAgent.description}</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentAgent.category === 'Orchestration' ? 'bg-purple-100 text-purple-700' :
                  currentAgent.category === 'Core' ? 'bg-indigo-100 text-indigo-700' :
                  currentAgent.category === 'Supporting' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {currentAgent.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: LLM & Memory Config */}
              <div className="space-y-6">
                {/* LLM Selection */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
                  <label className="block text-sm font-semibold text-purple-900 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    LLM Model
                  </label>

                  {/* Deployment Type Toggle */}
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-purple-300 mb-3">
                    <button
                      onClick={() => handleConfigChange('deployment_type', 'cloud_api')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        (currentConfig.deployment_type || 'cloud_api') === 'cloud_api'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Cloud API
                    </button>
                    <button
                      onClick={() => handleConfigChange('deployment_type', 'on_premise')}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        currentConfig.deployment_type === 'on_premise'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      On-Premise
                    </button>
                  </div>

                  <select
                    value={currentConfig.llm}
                    onChange={(e) => handleConfigChange('llm', e.target.value)}
                    className="w-full rounded-md border-purple-300 shadow-sm p-3 bg-white"
                  >
                    {getFilteredLLMOptions().map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                  {getFilteredLLMOptions().length === 0 && (
                    <p className="mt-2 text-xs text-red-600">
                      No models available for this tier. Please select a different tier.
                    </p>
                  )}
                  {getFilteredLLMOptions().length < currentAgent.llmOptions.length && (
                    <p className="mt-2 text-xs text-purple-600">
                      {currentAgent.llmOptions.length - getFilteredLLMOptions().length} model(s) unavailable in {globalParams.service_tier} tier
                    </p>
                  )}
                  {/* Estimated Cost Display */}
                  <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-900">Estimated Cost (This Agent Only):</span>
                      <span className="text-lg font-bold text-purple-700">
                        ${agentCosts[activeAgent] ? agentCosts[activeAgent].toLocaleString('en-US', { maximumFractionDigits: 0 }) : '...'}
                        <span className="text-sm font-normal text-gray-600">/month</span>
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      Based on {globalParams.num_users} users × {globalParams.assessments_per_user_per_month} assessments
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Temperature</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={currentConfig.temperature}
                        onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                        className="w-full rounded-md border-purple-300 p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        min="1000"
                        max="32000"
                        step="1000"
                        value={currentConfig.max_tokens}
                        onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value))}
                        className="w-full rounded-md border-purple-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Memory Configuration */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Memory System
                  </label>
                  <select
                    value={currentConfig.memory_type}
                    onChange={(e) => handleConfigChange('memory_type', e.target.value)}
                    className="w-full rounded-md border-blue-300 shadow-sm p-3 bg-white mb-3"
                  >
                    {currentAgent.memoryOptions.map(memory => (
                      <option key={memory} value={memory}>{memory}</option>
                    ))}
                  </select>
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">
                      Memory Window: {currentConfig.memory_window} conversations
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={currentConfig.memory_window}
                      onChange={(e) => handleConfigChange('memory_window', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Usage Parameters */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
                  <label className="block text-sm font-semibold text-green-900 mb-3 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Usage Parameters
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">
                        Usage Probability: {currentConfig.usage_probability}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={currentConfig.usage_probability}
                        onChange={(e) => handleConfigChange('usage_probability', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        Probability this agent is invoked per 4Cs calculation
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">Avg Tokens/Request</label>
                      <input
                        type="number"
                        min="1000"
                        max="20000"
                        step="500"
                        value={currentConfig.avg_tokens_per_request}
                        onChange={(e) => handleConfigChange('avg_tokens_per_request', parseInt(e.target.value))}
                        className="w-full rounded-md border-green-300 p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-green-700 mb-1">Requests per 4Cs Calculation</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={currentConfig.requests_per_4cs_calculation}
                        onChange={(e) => handleConfigChange('requests_per_4cs_calculation', parseInt(e.target.value))}
                        className="w-full rounded-md border-green-300 p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Tools & Cost */}
              <div className="space-y-6">
                {/* MCP Tools */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200">
                  <label className="block text-sm font-semibold text-amber-900 mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    MCP Tools & Functions
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentAgent.toolsOptions.map(tool => (
                      <label key={tool} className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={(currentConfig.tools || []).includes(tool)}
                          onChange={() => handleToolToggle(tool)}
                          className="rounded border-amber-300"
                        />
                        <span className="text-sm text-gray-700">{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cost Estimation */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Estimated Cost (This Agent Only)
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-indigo-300">
                      <div className="text-xs text-indigo-600 font-medium mb-1">Monthly Cost</div>
                      <div className="text-2xl font-bold text-indigo-900">
                        ${agentCosts[activeAgent] ? agentCosts[activeAgent].toFixed(0) : '...'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-300">
                      <div className="text-xs text-indigo-600 font-medium mb-1">Annual Cost</div>
                      <div className="text-2xl font-bold text-indigo-900">
                        ${agentCosts[activeAgent] ? (agentCosts[activeAgent] * 12).toFixed(0) : '...'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-indigo-200">
                      <div className="text-xs text-gray-600">Estimated Requests/Month</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {globalParams.num_users * globalParams.assessments_per_user_per_month}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-indigo-700 bg-white p-3 rounded border border-indigo-200">
                    <strong>Note:</strong> This is the cost for {currentAgent.name} only.
                    See the Cost Calculator tab for complete system costs including infrastructure, tools, and all agents.
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Configuration Tips</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• <strong>Temperature:</strong> Lower (0.1-0.4) for factual tasks, higher (0.6-0.9) for creative tasks</li>
                    <li>• <strong>Usage Probability:</strong> 100% for critical agents, lower for optional features</li>
                    <li>• <strong>Memory Window:</strong> Larger for context-heavy agents (Power Plan, Client Intelligence)</li>
                    <li>• <strong>Tools:</strong> Select only tools actually used by this agent to reduce latency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Details Tabs */}
        {tierCostBreakdown && (() => {
          const actualLLMCost = getActualLLMCost();
          const actualTotalCost = tierCostBreakdown.infrastructure_costs +
                                 actualLLMCost +
                                 tierCostBreakdown.memory_system_costs +
                                 tierCostBreakdown.data_source_costs +
                                 tierCostBreakdown.monitoring_costs +
                                 tierCostBreakdown.retrieval_costs +
                                 tierCostBreakdown.security_costs +
                                 tierCostBreakdown.prompt_tuning_costs +
                                 (tierCostBreakdown.mcp_tools_costs || 0);

          return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex overflow-x-auto">
                  {['overview', 'infrastructure', 'llm', 'data-sources', 'monitoring'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setCostDetailsTab(tab)}
                      className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        costDetailsTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab === 'overview' && 'Overview'}
                      {tab === 'infrastructure' && 'Infrastructure'}
                      {tab === 'llm' && 'LLM'}
                      {tab === 'data-sources' && 'Data Sources'}
                      {tab === 'monitoring' && 'Monitoring'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {costDetailsTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium opacity-90">Monthly Cost</h3>
                          <DollarSign className="w-5 h-5 opacity-75" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(actualTotalCost)}</p>
                        <p className="text-xs opacity-75 mt-1">Total system cost</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium opacity-90">Per User/Month</h3>
                          <Users className="w-5 h-5 opacity-75" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(actualTotalCost / globalParams.num_users)}</p>
                        <p className="text-xs opacity-75 mt-1">{globalParams.num_users} users</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium opacity-90">Per Query</h3>
                          <Zap className="w-5 h-5 opacity-75" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(actualTotalCost / (globalParams.num_users * globalParams.assessments_per_user_per_month))}</p>
                        <p className="text-xs opacity-75 mt-1">{formatNumber(globalParams.num_users * globalParams.assessments_per_user_per_month)} queries/mo</p>
                      </div>

                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium opacity-90">Annual Cost</h3>
                          <TrendingUp className="w-5 h-5 opacity-75" />
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(actualTotalCost * 12)}</p>
                        <p className="text-xs opacity-75 mt-1">12-month projection</p>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Cost Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Server className="w-5 h-5 mr-3 text-blue-600" />
                            <span className="font-medium text-gray-700">Infrastructure</span>
                          </div>
                          <span className="text-lg font-bold text-blue-900">{formatCurrency(tierCostBreakdown.infrastructure_costs)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center">
                            <Zap className="w-5 h-5 mr-3 text-purple-600" />
                            <span className="font-medium text-gray-700">LLM API Costs (from agents)</span>
                          </div>
                          <span className="text-lg font-bold text-purple-900">{formatCurrency(actualLLMCost)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <Database className="w-5 h-5 mr-3 text-green-600" />
                            <span className="font-medium text-gray-700">Data Sources</span>
                          </div>
                          <span className="text-lg font-bold text-green-900">{formatCurrency(tierCostBreakdown.data_source_costs)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center">
                            <BarChart3 className="w-5 h-5 mr-3 text-orange-600" />
                            <span className="font-medium text-gray-700">Monitoring</span>
                          </div>
                          <span className="text-lg font-bold text-orange-900">{formatCurrency(tierCostBreakdown.monitoring_costs)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Infrastructure Tab */}
                {costDetailsTab === 'infrastructure' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Infrastructure Costs (Azure Australia East)</h3>
                    {tierCostBreakdown.infrastructure_breakdown && tierCostBreakdown.infrastructure_breakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resource</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tierCostBreakdown.infrastructure_breakdown.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-800">{item.subcategory}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{item.quantity.toFixed(0)} {item.unit}</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.monthly_cost)}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.annual_cost)}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{item.notes}</td>
                              </tr>
                            ))}
                            <tr className="bg-blue-50 font-bold">
                              <td className="py-3 px-4 text-gray-900" colSpan="2">Total Infrastructure</td>
                              <td className="py-3 px-4 text-right text-blue-900">{formatCurrency(tierCostBreakdown.infrastructure_costs)}</td>
                              <td className="py-3 px-4 text-right text-blue-900">{formatCurrency(tierCostBreakdown.infrastructure_costs * 12)}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No infrastructure data available</p>
                    )}
                  </div>
                )}

                {/* LLM Tab */}
                {costDetailsTab === 'llm' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">LLM Costs from Individual Agents</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Agent</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">LLM Model</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Usage %</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Cost (100%)</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Weighted Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(agentConfigs).map(([agentId, config]) => {
                            const agentInfo = SCIP_AGENTS[agentId];
                            const agentCost = agentCosts[agentId] || 0;
                            const weightedCost = agentCost * (config.usage_probability / 100);

                            return (
                              <tr key={agentId} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-800">{agentInfo?.name || agentId}</td>
                                <td className="py-3 px-4 text-gray-600">{config.llm || 'N/A'}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{config.usage_probability}%</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(agentCost)}</td>
                                <td className="py-3 px-4 text-right font-semibold text-purple-900">{formatCurrency(weightedCost)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-purple-50 font-bold">
                            <td className="py-3 px-4 text-gray-900" colSpan="4">Total LLM Costs</td>
                            <td className="py-3 px-4 text-right text-purple-900">{formatCurrency(actualLLMCost)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Data Sources Tab */}
                {costDetailsTab === 'data-sources' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Premium Data Sources</h3>
                    {tierCostBreakdown.data_source_breakdown && tierCostBreakdown.data_source_breakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Source</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tierCostBreakdown.data_source_breakdown.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-800">{item.subcategory}</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.monthly_cost)}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.annual_cost)}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{item.notes}</td>
                              </tr>
                            ))}
                            <tr className="bg-green-50 font-bold">
                              <td className="py-3 px-4 text-gray-900">Total Data Sources</td>
                              <td className="py-3 px-4 text-right text-green-900">{formatCurrency(tierCostBreakdown.data_source_costs)}</td>
                              <td className="py-3 px-4 text-right text-green-900">{formatCurrency(tierCostBreakdown.data_source_costs * 12)}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No premium data sources for this tier</p>
                    )}
                  </div>
                )}

                {/* Monitoring Tab */}
                {costDetailsTab === 'monitoring' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Monitoring & Observability</h3>
                    {tierCostBreakdown.monitoring_breakdown && tierCostBreakdown.monitoring_breakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Monthly</th>
                              <th className="text-right py-3 px-4 font-semibold text-gray-700">Annual</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tierCostBreakdown.monitoring_breakdown.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-800">{item.subcategory}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{item.quantity.toFixed(0)} {item.unit}</td>
                                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.monthly_cost)}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.annual_cost)}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{item.notes}</td>
                              </tr>
                            ))}
                            <tr className="bg-orange-50 font-bold">
                              <td className="py-3 px-4 text-gray-900" colSpan="2">Total Monitoring</td>
                              <td className="py-3 px-4 text-right text-orange-900">{formatCurrency(tierCostBreakdown.monitoring_costs)}</td>
                              <td className="py-3 px-4 text-right text-orange-900">{formatCurrency(tierCostBreakdown.monitoring_costs * 12)}</td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No monitoring data available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Info Footer */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About the Optimized SCIP Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Lean Agents + Rich Tools</h4>
              <p>
                Reduced from 21 agents to 9 optimized agents following AI best practices.
                Complex reasoning stays in agents; data retrieval and templates moved to MCP tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Cost Savings & Impact</h4>
              <p>
                57% reduction in agents = 57% cost savings with 50-60% faster response times.
                Every agent configuration (LLM, tokens, usage probability) directly impacts the Cost Calculator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Design;
