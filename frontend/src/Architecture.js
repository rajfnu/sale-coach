import React, { useState } from 'react';
import { 
  Settings, Brain, Users, TrendingUp, Target, Shield, MessageSquare, 
  Lightbulb, Zap, Database, Server, BarChart3, Cpu, 
  ArrowRight, ArrowDown
} from 'lucide-react';

const Architecture = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Agent definitions with relationships
  const agents = [
    {
      id: 'supervisor',
      name: 'Supervisor Agent',
      icon: Settings,
      category: 'Orchestration',
      color: 'blue',
      description: 'Master orchestrator using ImpactWon framework',
      position: { x: 50, y: 10 },
      connections: ['power_plan', 'strategic_planning', 'client_intelligence', 'deal_assessment'],
      usage_probability: 100,
      requests_per_assessment: 1
    },
    {
      id: 'power_plan',
      name: 'Power Plan Agent (4Cs)',
      icon: Target,
      category: 'Core',
      color: 'green',
      description: 'Calculates 4Cs (Right-to-Win) scoring',
      position: { x: 20, y: 30 },
      connections: ['persona_coach'],
      usage_probability: 100,
      requests_per_assessment: 3
    },
    {
      id: 'strategic_planning',
      name: 'Strategic Planning Agent',
      icon: Brain,
      category: 'Core',
      color: 'purple',
      description: 'CEO Sales Plan + Attainment + Pursuit planning',
      position: { x: 80, y: 30 },
      connections: ['persona_coach'],
      usage_probability: 75,
      requests_per_assessment: 2
    },
    {
      id: 'client_intelligence',
      name: 'Client Intelligence Agent',
      icon: Users,
      category: 'Core',
      color: 'indigo',
      description: 'Client profiling + BBB stakeholder mapping',
      position: { x: 20, y: 50 },
      connections: ['persona_coach'],
      usage_probability: 90,
      requests_per_assessment: 2
    },
    {
      id: 'deal_assessment',
      name: 'Deal Assessment Agent',
      icon: TrendingUp,
      category: 'Core',
      color: 'orange',
      description: 'Deal qualification + budget validation',
      position: { x: 80, y: 50 },
      connections: ['persona_coach'],
      usage_probability: 85,
      requests_per_assessment: 2
    },
    {
      id: 'team_orchestration',
      name: 'Team Orchestration Agent',
      icon: Shield,
      category: 'Support',
      color: 'teal',
      description: 'Team management + license validation',
      position: { x: 50, y: 70 },
      connections: ['persona_coach'],
      usage_probability: 60,
      requests_per_assessment: 1
    },
    {
      id: 'persona_coach',
      name: 'Persona-Coach Agent (NBM)',
      icon: Lightbulb,
      category: 'Core',
      color: 'yellow',
      description: 'CRITICAL: Generates Next-Best-Move recommendations',
      position: { x: 50, y: 90 },
      connections: ['feedback_agent'],
      usage_probability: 100,
      requests_per_assessment: 2
    },
    {
      id: 'feedback_agent',
      name: 'Feedback Agent',
      icon: MessageSquare,
      category: 'Learning',
      color: 'pink',
      description: 'Post-meeting analysis + learning loop',
      position: { x: 20, y: 110 },
      connections: [],
      usage_probability: 80,
      requests_per_assessment: 1
    },
    {
      id: 'realtime_coach',
      name: 'Real-time Coach Agent',
      icon: Zap,
      category: 'Optional',
      color: 'red',
      description: 'Live meeting coaching with transcription',
      position: { x: 80, y: 110 },
      connections: [],
      usage_probability: 30,
      requests_per_assessment: 0
    }
  ];

  const mcpTools = [
    {
      name: 'research_tool',
      description: 'Web research and data retrieval',
      type: 'server',
      cost: '$126/month',
      color: 'blue'
    },
    {
      name: 'content_generation_tool',
      description: 'Content creation and templates',
      type: 'server',
      cost: '$126/month',
      color: 'green'
    },
    {
      name: 'competitive_intel_tool',
      description: 'Competitor analysis and intelligence',
      type: 'server',
      cost: '$126/month',
      color: 'purple'
    },
    {
      name: 'fog_analysis_tool',
      description: 'FOG (Fear, Opportunity, Greed) analysis',
      type: 'server',
      cost: '$126/month',
      color: 'orange'
    },
    {
      name: 'engagement_excellence_tool',
      description: 'Engagement strategies and tactics',
      type: 'server',
      cost: '$126/month',
      color: 'indigo'
    },
    {
      name: 'impact_theme_generator_tool',
      description: 'Impact themes and value propositions',
      type: 'server',
      cost: '$126/month',
      color: 'teal'
    },
    {
      name: 'speech_to_text',
      description: 'Real-time transcription',
      type: 'function',
      cost: 'Usage-based',
      color: 'red'
    },
    {
      name: 'license_to_sell_tool',
      description: 'License validation and compliance',
      type: 'function',
      cost: 'Usage-based',
      color: 'pink'
    }
  ];

  const dataSources = [
    {
      tier: 'Basic',
      sources: ['No premium sources'],
      cost: '$0/month',
      color: 'gray'
    },
    {
      tier: 'Standard',
      sources: ['LinkedIn Sales Navigator'],
      cost: '$1,299/month',
      color: 'blue'
    },
    {
      tier: 'Premium',
      sources: ['ZoomInfo', 'LinkedIn', 'Clearbit', 'Apollo', 'Salesforce Data Cloud', '6sense'],
      cost: '$5,700/month',
      color: 'purple'
    }
  ];

  const infrastructure = [
    {
      component: 'Memory Systems',
      basic: 'Redis (in-memory)',
      standard: 'Cosmos DB (document store)',
      premium: 'Neo4j (graph) + Cosmos DB',
      color: 'blue'
    },
    {
      component: 'Vector DB (RAG)',
      basic: 'In-memory FAISS (free)',
      standard: 'Pinecone Starter ($70/month)',
      premium: 'Pinecone Enterprise ($500/month)',
      color: 'green'
    },
    {
      component: 'Monitoring',
      basic: 'Basic logging ($25/month)',
      standard: 'Application Insights ($150/month)',
      premium: 'Datadog Premium ($500/month)',
      color: 'purple'
    },
    {
      component: 'GPU Allocation',
      basic: '1 GPU (T4/A100/H100)',
      standard: '2 GPUs',
      premium: '4 GPUs',
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      teal: 'bg-teal-100 text-teal-800 border-teal-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Architecture Diagram */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          SCIP AI Agent Architecture Flow
        </h3>
        
        <div className="relative bg-white rounded-lg p-8 min-h-[600px]">
          {/* Assessment Flow */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3">
            <div className="text-center">
              <div className="font-bold text-yellow-800">1 Assessment</div>
              <div className="text-sm text-yellow-600">~8.3 AI Queries</div>
            </div>
          </div>

          {/* Agents positioned */}
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                className={`absolute ${getColorClasses(agent.color)} border-2 rounded-lg p-3 min-w-[200px]`}
                style={{
                  left: `${agent.position.x}%`,
                  top: `${agent.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="flex items-center mb-2">
                  <Icon className="w-5 h-5 mr-2" />
                  <div className="font-bold text-sm">{agent.name}</div>
                </div>
                <div className="text-xs mb-1">{agent.description}</div>
                <div className="text-xs">
                  <span className="font-semibold">Usage:</span> {agent.usage_probability}% | 
                  <span className="font-semibold"> Queries:</span> {agent.requests_per_assessment}
                </div>
              </div>
            );
          })}

          {/* Flow arrows */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-blue-600" />
          </div>
          <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-blue-600" />
          </div>
          <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-blue-600" />
          </div>
          <div className="absolute top-80 left-1/2 transform -translate-x-1/2">
            <ArrowDown className="w-6 h-6 text-blue-600" />
          </div>

          {/* Side arrows for parallel processing */}
          <div className="absolute top-40 left-30 transform -translate-y-1/2">
            <ArrowRight className="w-4 h-4 text-green-600" />
          </div>
          <div className="absolute top-40 right-30 transform -translate-y-1/2">
            <ArrowRight className="w-4 h-4 text-purple-600" />
          </div>
          <div className="absolute top-60 left-30 transform -translate-y-1/2">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="absolute top-60 right-30 transform -translate-y-1/2">
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </div>
        </div>

        {/* Flow explanation */}
        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3">Assessment Flow Explanation:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-600 mb-2">1. Orchestration Phase</div>
              <div className="text-gray-600">Supervisor Agent triggers and coordinates all other agents</div>
            </div>
            <div>
              <div className="font-semibold text-green-600 mb-2">2. Analysis Phase</div>
              <div className="text-gray-600">Power Plan calculates 4Cs scores, other agents provide context</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-600 mb-2">3. Recommendation Phase</div>
              <div className="text-gray-600">Persona-Coach generates Next-Best-Move recommendations</div>
            </div>
            <div>
              <div className="font-semibold text-pink-600 mb-2">4. Learning Phase</div>
              <div className="text-gray-600">Feedback Agent captures learnings for future improvements</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <h4 className="text-lg font-bold text-green-900 mb-3">Total Agents</h4>
          <div className="text-3xl font-bold text-green-600">9</div>
          <div className="text-sm text-green-700 mt-1">Specialized AI agents</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-bold text-blue-900 mb-3">Queries per Assessment</h4>
          <div className="text-3xl font-bold text-blue-600">~8.3</div>
          <div className="text-sm text-blue-700 mt-1">AI queries per 4Cs assessment</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h4 className="text-lg font-bold text-purple-900 mb-3">MCP Tools</h4>
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-sm text-purple-700 mt-1">External capabilities</div>
        </div>
      </div>
    </div>
  );

  const AgentsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          SCIP Agent Details
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className={`${getColorClasses(agent.color)} border-2 rounded-lg p-4`}>
                <div className="flex items-center mb-3">
                  <Icon className="w-6 h-6 mr-3" />
                  <div>
                    <div className="font-bold text-lg">{agent.name}</div>
                    <div className="text-sm opacity-75">{agent.category}</div>
                  </div>
                </div>
                <div className="text-sm mb-3">{agent.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold">Usage:</span> {agent.usage_probability}%
                  </div>
                  <div>
                    <span className="font-semibold">Queries:</span> {agent.requests_per_assessment}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ToolsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center">
          <Cpu className="w-6 h-6 mr-2" />
          MCP Tools & External Functions
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Always-On Servers */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-600" />
              Always-On Servers (Fixed Monthly Cost)
            </h4>
            <div className="space-y-3">
              {mcpTools.filter(tool => tool.type === 'server').map((tool) => (
                <div key={tool.name} className={`${getColorClasses(tool.color)} border rounded-lg p-3`}>
                  <div className="font-semibold">{tool.name}</div>
                  <div className="text-sm mb-1">{tool.description}</div>
                  <div className="text-sm font-semibold">{tool.cost}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Serverless Functions */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-orange-600" />
              Serverless Functions (Usage-Based)
            </h4>
            <div className="space-y-3">
              {mcpTools.filter(tool => tool.type === 'function').map((tool) => (
                <div key={tool.name} className={`${getColorClasses(tool.color)} border rounded-lg p-3`}>
                  <div className="font-semibold">{tool.name}</div>
                  <div className="text-sm mb-1">{tool.description}</div>
                  <div className="text-sm font-semibold">{tool.cost}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DataTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
          <Database className="w-6 h-6 mr-2" />
          Data Sources & Infrastructure
        </h3>
        
        {/* Data Sources */}
        <div className="mb-8">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Data Sources by Tier</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSources.map((tier) => (
              <div key={tier.tier} className={`${getColorClasses(tier.color)} border-2 rounded-lg p-4`}>
                <div className="font-bold text-lg mb-2">{tier.tier} Tier</div>
                <div className="text-sm mb-2">{tier.sources.join(', ')}</div>
                <div className="font-semibold">{tier.cost}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure Components */}
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-4">Infrastructure Components</h4>
          <div className="space-y-4">
            {infrastructure.map((component) => (
              <div key={component.component} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="font-bold text-gray-800 mb-3">{component.component}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-600">Basic</div>
                    <div className="text-gray-800">{component.basic}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Standard</div>
                    <div className="text-gray-800">{component.standard}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-600">Premium</div>
                    <div className="text-gray-800">{component.premium}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <h2 className="text-3xl font-bold flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          SCIP AI Agent Architecture
        </h2>
        <p className="text-indigo-100 mt-2">
          Multi-Agent Orchestration System for Sales Coaching
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', name: 'Architecture Overview', icon: BarChart3 },
              { id: 'agents', name: 'Agent Details', icon: Brain },
              { id: 'tools', name: 'MCP Tools', icon: Cpu },
              { id: 'data', name: 'Data & Infrastructure', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'agents' && <AgentsTab />}
          {activeTab === 'tools' && <ToolsTab />}
          {activeTab === 'data' && <DataTab />}
        </div>
      </div>
    </div>
  );
};

export default Architecture;
