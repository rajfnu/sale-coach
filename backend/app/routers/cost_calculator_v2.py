import sys
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json

# Import service tier configurations
from app.config.service_tiers import (
    SERVICE_TIERS,
    LLM_CATEGORIES,
    get_tier_config,
    get_llm_models_for_tier,
    get_tier_summary,
    calculate_on_premise_cost
)

# Load LLM pricing from LLM_Pricing.json
def load_llm_pricing():
    """Load LLM pricing from LLM_Pricing.json file"""
    config_path = os.path.join(os.path.dirname(__file__), '../config/LLM_Pricing.json')
    try:
        with open(config_path, 'r') as f:
            data = json.load(f)
            # Flatten the providers structure to model_id: {input, output, ...}
            pricing = {}
            for provider, models in data.get('providers', {}).items():
                for model_id, model_data in models.items():
                    pricing[model_id] = {
                        'input': model_data.get('input', 0.0),
                        'output': model_data.get('output', 0.0),
                        'cache_read': model_data.get('cachedInput', 0.0)
                    }
            return pricing
    except Exception as e:
        print(f"Error loading LLM_Pricing.json: {e}")
        return {}

# Load pricing on module import
LLM_PRICING_USD = load_llm_pricing()

# ===========================
# PRICING CONFIGURATION
# ===========================

# Azure Pricing (AUD) - Sydney Region - January 2025
# Source: Azure Pricing Calculator
AZURE_PRICING_SYDNEY = {
    "compute": {
        "Standard_D16s_v5": {
            "payg": 1.44,  # per hour
            "reserved_1yr": 0.72,  # 50% discount
            "reserved_3yr": 0.58   # 60% discount
        },
        "Standard_NC6s_v3": {  # GPU node
            "payg": 3.06,  # per hour
            "reserved_1yr": 1.53,  # 50% discount
            "reserved_3yr": 1.22   # 60% discount
        }
    },
    "database": {
        "cosmosdb_ru_100": 0.008,  # per 100 RU/s per hour
        "redis_c6": 0.192,  # per hour
        "sql_standard": 0.192  # per vCore per hour
    },
    "storage": {
        "hot_lrs": 0.04,  # per GB per month
        "cool_lrs": 0.01,  # per GB per month
        "archive_lrs": 0.002  # per GB per month
    },
    "monitoring": {
        "log_analytics_gb": 2.30,  # per GB
        "application_insights_gb": 2.30  # per GB
    }
}

# Premium Data Source Pricing (USD per month) - January 2025
DATA_SOURCE_PRICING_USD = {
    "ZoomInfo": 15000,  # Enterprise tier
    "LinkedIn Sales Navigator": 9900,  # Enterprise tier
    "Clearbit": 5000,  # Enterprise tier
    "HubSpot/Salesforce CRM": 0,  # Data sync only, no UI
    "News APIs": 2000,  # Multiple news sources
    "Social Media APIs": 1500,  # Twitter, LinkedIn, etc.
    "Company Data APIs": 3000   # Various company data providers
}

# Exchange rate (AUD to USD)
AUD_TO_USD = 0.65

# ===========================
# AI AGENT CONFIGURATIONS
# ===========================

AI_AGENTS = {
    "sales-coach": {
        "name": "Sales Coach in the Pocket",
        "description": "Multi-agent sales coaching system with 4Cs framework",
        "data_sources": [
            "ZoomInfo",
            "LinkedIn Sales Navigator", 
            "Clearbit",
            "HubSpot/Salesforce CRM",
            "News APIs",
            "Social Media APIs",
            "Company Data APIs"
        ],
        "infrastructure": {
            "aks_nodes": 8,
            "gpu_nodes": 2,
            "sql_vcores": 12,
            "cosmos_ru": 45000,
            "neo4j_nodes": 2,
            "storage_hot_tb": 0.5,
            "storage_cool_tb": 2.0
        }
    }
}

# ===========================
# MODELS
# ===========================

class CostCalculatorRequest(BaseModel):
    # AI Agent Selection
    agent_type: str = Field(default="sales-coach", description="Type of AI agent")

    # Service Tier Selection (NEW - for end-user pricing plans)
    service_tier: str = Field(
        default="standard",
        description="Service tier: basic ($30/user), standard ($149/user), premium ($999/user)"
    )

    # Deployment Type (NEW - cloud API vs on-premise)
    deployment_type: str = Field(
        default="cloud_api",
        description="Deployment type: cloud_api (token-based pricing) or on_premise (infrastructure-based pricing)"
    )

    # User Parameters
    num_users: int = Field(default=100, ge=1, le=10000)
    queries_per_user_per_month: int = Field(default=1000, ge=10, le=10000)  # Lowered from 100 to 10 for Sales Coach assessments
    avg_input_tokens: int = Field(default=10000, ge=1000, le=100000)
    avg_output_tokens: int = Field(default=1000, ge=100, le=10000)

    # Infrastructure Parameters
    infrastructure_scale: float = Field(default=1.0, ge=0.1, le=5.0)
    memory_type: str = Field(default="redis", description="Memory system: redis, cosmos-db, neo4j, in_memory")

    # LLM Configuration
    llm_mix: Dict[str, float] = Field(
        default={"gpt-4o": 60.0, "claude-3.5-sonnet": 30.0, "llama-3.1-70b": 10.0},
        description="LLM model distribution (percentages must sum to 100)"
    )

    # Optimization Settings
    cache_hit_rate: float = Field(default=0.70, ge=0.0, le=1.0)
    use_prompt_caching: bool = Field(default=True)
    use_reserved_instances: bool = Field(default=True)

    # MCP Tools (NEW - addresses user's question)
    mcp_tools: List[str] = Field(
        default=[],
        description="Selected MCP tools for the agent"
    )

class AgentCostRequest(BaseModel):
    """Request model for calculating individual agent LLM costs"""
    llm_model: str = Field(..., description="The LLM model used by this agent")
    deployment_type: str = Field(default="cloud_api", description="cloud_api or on_premise")
    service_tier: str = Field(default="standard", description="Service tier for GPU allocation")
    num_users: int = Field(default=100, ge=1, le=10000)
    queries_per_user_per_month: int = Field(default=40, ge=1, le=10000)
    avg_tokens_per_request: int = Field(default=5000, ge=100, le=100000)
    cache_hit_rate: float = Field(default=0.70, ge=0.0, le=1.0)
    use_prompt_caching: bool = Field(default=True)

class AgentCostResponse(BaseModel):
    """Response model for individual agent cost"""
    agent_llm_cost_monthly: float
    agent_llm_cost_annual: float
    total_queries_per_month: int
    total_input_tokens_per_month: int
    total_output_tokens_per_month: int
    llm_model: str
    deployment_type: str

class CostBreakdown(BaseModel):
    category: str
    subcategory: str
    monthly_cost: float
    annual_cost: float
    unit: str
    quantity: float
    notes: str

    # NEW: Enhanced explanation fields
    calculation_formula: Optional[str] = None
    cost_drivers: Optional[List[str]] = None
    optimization_tips: Optional[List[str]] = None

class AgentArchitecture(BaseModel):
    name: str
    description: str
    data_sources: List[str]
    infrastructure: Dict[str, float]

class GlobalUsageMetrics(BaseModel):
    """Detailed per-user usage metrics"""
    # Per-User Metrics
    tokens_per_user_per_month: int
    input_tokens_per_user_per_month: int
    output_tokens_per_user_per_month: int
    queries_per_user_per_month: int
    storage_per_user_gb: float
    cost_per_user_per_month: float

    # Aggregate Metrics
    total_users: int
    total_tokens_per_month: int
    total_storage_gb: float
    total_queries_per_month: int

    # Efficiency Metrics
    cache_hit_rate: float
    avg_tokens_per_query: int
    cost_per_query: float
    cost_per_1k_tokens: float

    # Descriptive Text
    description: str = "Detailed breakdown of usage parameters normalized per user"

class CostCalculatorResponse(BaseModel):
    # Total Costs
    total_monthly_cost: float
    total_annual_cost: float
    
    # Cost Breakdown by Category
    llm_costs: float
    infrastructure_costs: float
    data_source_costs: float
    monitoring_costs: float
    memory_system_costs: float  # Tier-based
    retrieval_costs: float  # NEW - Tier-based RAG/Vector DB costs
    security_costs: float  # NEW - Tier-based security costs
    prompt_tuning_costs: float  # NEW - Tier-based prompt optimization costs
    mcp_tools_costs: float  # User-selected tools

    # Detailed Breakdown by Tab
    llm_breakdown: List[CostBreakdown]
    infrastructure_breakdown: List[CostBreakdown]
    data_source_breakdown: List[CostBreakdown]
    monitoring_breakdown: List[CostBreakdown]
    memory_system_breakdown: List[CostBreakdown]
    retrieval_breakdown: List[CostBreakdown]  # NEW
    security_breakdown: List[CostBreakdown]  # NEW
    prompt_tuning_breakdown: List[CostBreakdown]  # NEW
    mcp_tools_breakdown: List[CostBreakdown]

    # Metrics
    queries_per_month: int
    input_tokens_per_month: int
    output_tokens_per_month: int
    estimated_data_size_gb: float
    savings_from_caching: float
    savings_from_reserved_instances: float

    # NEW: Global Usage Parameters with detailed per-user metrics
    global_usage_metrics: GlobalUsageMetrics

# ===========================
# COST CALCULATION FUNCTIONS
# ===========================

def get_agent_infrastructure(agent_type: str, service_tier: str, scale: float, custom: Optional[Dict] = None) -> Dict[str, float]:
    """
    Get infrastructure configuration for an agent based on service tier.
    Uses tier-specific infrastructure from service_tiers.py instead of agent defaults.
    """
    from app.config.service_tiers import INFRASTRUCTURE_CONFIGS

    # Get tier-specific infrastructure configuration
    tier_infra = INFRASTRUCTURE_CONFIGS.get(service_tier.lower(), INFRASTRUCTURE_CONFIGS["standard"])

    # Convert storage from GB to TB for compatibility with existing calculations
    base_infra = {
        "aks_nodes": tier_infra.get("aks_nodes", 5),
        "gpu_nodes": 0,  # No GPU nodes in tier configs, set to 0
        "sql_vcores": tier_infra.get("sql_vcores", 6),
        "cosmos_ru": tier_infra.get("cosmos_ru", 15000),
        "neo4j_nodes": tier_infra.get("neo4j_nodes", 1),
        "storage_hot_tb": tier_infra.get("storage_hot_gb", 500) / 1024.0,  # Convert GB to TB
        "storage_cool_tb": tier_infra.get("storage_cool_gb", 4000) / 1024.0,  # Convert GB to TB
    }

    # Apply custom overrides if provided
    if custom:
        base_infra = {**base_infra, **custom}

    # Apply scale multiplier
    return {key: value * scale for key, value in base_infra.items()}

def calculate_infrastructure_costs(infra: Dict[str, float], use_reserved: bool) -> tuple[float, List[CostBreakdown]]:
    """Calculate infrastructure costs based on Azure pricing"""
    breakdown = []
    total = 0.0

    # AKS Nodes
    aks_cost = AZURE_PRICING_SYDNEY["compute"]["Standard_D16s_v5"]["reserved_1yr" if use_reserved else "payg"] * infra["aks_nodes"] * 730
    total += aks_cost
    breakdown.append(CostBreakdown(
        category="Infrastructure",
        subcategory="AKS Nodes",
        monthly_cost=aks_cost,
        annual_cost=aks_cost * 12,
        unit="nodes",
        quantity=infra["aks_nodes"],
        notes=f"Standard_D16s_v5 × {int(infra['aks_nodes'])} nodes"
    ))

    # GPU Nodes (if any)
    if infra["gpu_nodes"] > 0:
        gpu_cost = AZURE_PRICING_SYDNEY["compute"]["Standard_NC6s_v3"]["reserved_1yr" if use_reserved else "payg"] * infra["gpu_nodes"] * 730
        total += gpu_cost
        breakdown.append(CostBreakdown(
            category="Infrastructure",
            subcategory="GPU Nodes",
            monthly_cost=gpu_cost,
            annual_cost=gpu_cost * 12,
            unit="nodes",
            quantity=infra["gpu_nodes"],
            notes=f"Standard_NC6s_v3 × {int(infra['gpu_nodes'])} nodes"
        ))

    # SQL Database
    sql_cost = AZURE_PRICING_SYDNEY["database"]["sql_standard"] * infra["sql_vcores"] * 730
    total += sql_cost
    breakdown.append(CostBreakdown(
        category="Infrastructure",
        subcategory="SQL Database",
        monthly_cost=sql_cost,
        annual_cost=sql_cost * 12,
        unit="vCores",
        quantity=infra["sql_vcores"],
        notes=f"Standard tier × {int(infra['sql_vcores'])} vCores"
    ))

    # Storage
    hot_storage_cost = AZURE_PRICING_SYDNEY["storage"]["hot_lrs"] * infra["storage_hot_tb"] * 1024  # TB to GB
    cool_storage_cost = AZURE_PRICING_SYDNEY["storage"]["cool_lrs"] * infra["storage_cool_tb"] * 1024
    storage_total = hot_storage_cost + cool_storage_cost
    total += storage_total
    breakdown.append(CostBreakdown(
        category="Infrastructure",
        subcategory="Storage",
        monthly_cost=storage_total,
        annual_cost=storage_total * 12,
        unit="GB",
        quantity=infra["storage_hot_tb"] + infra["storage_cool_tb"],
        notes=f"{infra['storage_hot_tb']}TB hot + {infra['storage_cool_tb']}TB cool"
    ))

    return total, breakdown

def calculate_llm_costs(
    llm_mix: Dict[str, float],
    total_queries: int,
    avg_input_tokens: int,
    avg_output_tokens: int,
    cache_hit_rate: float,
    use_prompt_caching: bool,
    deployment_type: str = "cloud_api",
    service_tier: str = "standard"
) -> tuple[float, List[CostBreakdown]]:
    """Calculate LLM costs based on deployment type: Cloud API (token-based) or On-Premise (GPU-based)"""
    breakdown = []
    total = 0.0

    # Handle On-Premise deployment (GPU-based pricing)
    if deployment_type == "on_premise":
        from app.config.service_tiers import LLM_CATEGORIES, GPU_COSTS

        # Determine number of GPUs based on tier
        gpu_count = {
            "basic": 1,      # 1 GPU for basic tier
            "standard": 2,   # 2 GPUs for standard tier
            "premium": 4     # 4 GPUs for premium tier
        }.get(service_tier.lower(), 1)

        for model, percentage in llm_mix.items():
            if percentage <= 0:
                continue

            # Find GPU type for this model
            gpu_type = "A100"  # Default
            for category in LLM_CATEGORIES.values():
                for model_info in category.get("on_premise", []):
                    if model_info["id"] == model:
                        gpu_type = model_info.get("gpu_type", "A100")
                        break

            # Calculate GPU cost for full month (730 hours)
            gpu_hourly_cost = GPU_COSTS[gpu_type]["hourly_cost"]
            monthly_cost_per_gpu_usd = gpu_hourly_cost * 730
            total_gpu_cost_usd = monthly_cost_per_gpu_usd * gpu_count * (percentage / 100)

            # Convert to AUD
            model_cost = total_gpu_cost_usd / AUD_TO_USD

            total += model_cost

            breakdown.append(CostBreakdown(
                category="LLM Costs (GPU)",
                subcategory=f"{model} ({gpu_type})",
                monthly_cost=model_cost,
                annual_cost=model_cost * 12,
                unit=f"{gpu_type} GPU(s)",
                quantity=gpu_count,
                notes=f"{percentage}% allocation, {gpu_count}x {gpu_type} GPU(s) @ ${gpu_hourly_cost}/hr ({service_tier} tier)",
                calculation_formula=f"{gpu_count} GPUs × ${gpu_hourly_cost}/hour × 730 hours × {percentage}% = ${model_cost:,.2f}/month",
                cost_drivers=[
                    f"Tier: {service_tier.title()} tier → {gpu_count} GPU(s)",
                    f"GPU Type: {gpu_type} (${gpu_hourly_cost}/hour)",
                    f"Allocation: {percentage}% of workload",
                    "Runtime: 730 hours/month (24/7 availability)"
                ],
                optimization_tips=[
                    "Consider Standard tier (2 GPUs) for balanced cost/performance",
                    "Use model quantization to run on cheaper GPU types",
                    "Implement auto-scaling to reduce GPU usage during low-traffic periods",
                    f"Switch to Cloud API for variable workloads (pay per token)"
                ]
            ))
    else:
        # Handle Cloud API deployment (token-based pricing)
        for model, percentage in llm_mix.items():
            if percentage <= 0:
                continue

            # Get pricing for this model
            pricing = LLM_PRICING_USD.get(model, {"input": 2.50, "output": 10.00, "cache_read": 1.25})

            # Calculate tokens for this model
            model_queries = total_queries * (percentage / 100)
            input_tokens = model_queries * avg_input_tokens
            output_tokens = model_queries * avg_output_tokens

            # Apply caching
            if use_prompt_caching and "cache_read" in pricing:
                cached_input_tokens = input_tokens * cache_hit_rate
                fresh_input_tokens = input_tokens * (1 - cache_hit_rate)

                # Cost calculation
                input_cost = (cached_input_tokens / 1000000 * pricing["cache_read"] +
                             fresh_input_tokens / 1000000 * pricing["input"])
            else:
                input_cost = input_tokens / 1000000 * pricing["input"]

            output_cost = output_tokens / 1000000 * pricing["output"]
            model_cost = (input_cost + output_cost) / AUD_TO_USD  # Convert to AUD

            total += model_cost

            breakdown.append(CostBreakdown(
                category="LLM Costs (API)",
                subcategory=model,
                monthly_cost=model_cost,
                annual_cost=model_cost * 12,
                unit="tokens",
                quantity=input_tokens + output_tokens,
                notes=f"{percentage}% of queries, {cache_hit_rate*100:.0f}% cache hit rate"
            ))

    return total, breakdown

def calculate_data_source_costs(agent_type: str, service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """Calculate data source costs based on service tier (NOT agent requirements)"""
    breakdown = []

    # Get tier-specific data source configuration from service_tiers.py
    tier_config = get_tier_config(service_tier)
    data_sources_config = tier_config.get("data_sources", {})

    # Use the tier-specific monthly cost directly
    monthly_cost_aud = data_sources_config.get("monthly_cost", 0.0)
    sources = data_sources_config.get("sources", [])

    if monthly_cost_aud > 0:
        # If there's a cost, add breakdown for included data sources
        sources_str = ", ".join(sources) if sources else "No premium data sources"
        breakdown.append(CostBreakdown(
            category="Data Sources",
            subcategory=f"{service_tier.title()} Tier Data Sources",
            monthly_cost=monthly_cost_aud,
            annual_cost=monthly_cost_aud * 12,
            unit="subscription",
            quantity=len(sources),
            notes=f"Included sources: {sources_str}"
        ))
    else:
        # Basic tier - no premium data sources
        breakdown.append(CostBreakdown(
            category="Data Sources",
            subcategory="No Premium Data Sources",
            monthly_cost=0.0,
            annual_cost=0.0,
            unit="subscription",
            quantity=0,
            notes="Basic tier includes no premium data sources"
        ))

    return monthly_cost_aud, breakdown

def calculate_monitoring_costs(data_ingestion_gb: float, service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """Calculate monitoring and observability costs based on service tier"""
    breakdown = []

    # Get tier-specific monitoring configuration from service_tiers.py
    tier_config = get_tier_config(service_tier)
    monitoring_config = tier_config.get("monitoring", {})

    monthly_cost = monitoring_config.get("monthly_cost", 0.0)
    apm_tool = monitoring_config.get("apm_tool", "basic_logging")
    features = monitoring_config.get("features", [])
    features_str = ", ".join(features)

    breakdown.append(CostBreakdown(
        category="Monitoring",
        subcategory=f"{apm_tool} ({service_tier.title()} Tier)",
        monthly_cost=monthly_cost,
        annual_cost=monthly_cost * 12,
        unit="service",
        quantity=1,
        notes=f"Features: {features_str}"
    ))

    return monthly_cost, breakdown

def calculate_memory_system_costs(memory_type: str, infrastructure: Dict[str, float], service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """
    Calculate memory system costs based on actual memory type selected.
    FIXED: Now honors the memory_type parameter instead of always using tier default.
    """
    breakdown = []

    # Get tier-specific memory configuration as fallback
    tier_config = get_tier_config(service_tier)
    tier_memory_config = tier_config.get("memory", {})

    # CRITICAL FIX: Honor the memory_type parameter if provided
    if memory_type and memory_type not in ["default", ""]:
        # Normalize memory_type (handle both dash and underscore variants)
        normalized_type = memory_type.replace("-", "_").lower()

        if normalized_type in ["cosmos_db", "cosmosdb"]:
            # Calculate actual Cosmos DB cost based on RU/s
            # Use minimum 10,000 RU/s if tier has 0 (user explicitly selected cosmos-db)
            cosmos_ru = infrastructure.get("cosmos_ru", 15000)
            if cosmos_ru == 0:
                cosmos_ru = 10000  # Minimum provisioned throughput for Cosmos DB
            # Formula: (RU/s ÷ 100) × $0.012 AUD/hour × 730 hours
            monthly_cost = (cosmos_ru / 100) * 0.012 * 730
            capacity_str = f"{int(cosmos_ru):,} RU/s"
            features_str = "Multi-model NoSQL, Global Distribution, Auto-scaling"

            breakdown.append(CostBreakdown(
                category="Memory System",
                subcategory=f"Cosmos DB ({service_tier.title()} Tier)",
                monthly_cost=monthly_cost,
                annual_cost=monthly_cost * 12,
                unit="RU/s",
                quantity=cosmos_ru,
                notes=f"{capacity_str} provisioned throughput. {features_str}",
                calculation_formula=f"({int(cosmos_ru):,} RU/s ÷ 100) × $0.012/hour × 730 hours = ${monthly_cost:,.2f}/month",
                cost_drivers=[
                    f"Request Units: {int(cosmos_ru):,} RU/s (primary cost driver)",
                    "Storage: Minimal impact at current scale",
                    "Multi-region replication: If enabled",
                    "Auto-scale vs provisioned: Currently provisioned"
                ],
                optimization_tips=[
                    f"Current: {int(cosmos_ru):,} RU/s. Monitor actual usage to right-size.",
                    "Enable auto-scale to pay only for RU/s used (vs provisioned)",
                    "Use reserved capacity for 1-3 year terms (up to 63% savings)",
                    "Optimize queries to reduce RU consumption",
                    "Consider serverless mode for unpredictable workloads"
                ]
            ))

        elif normalized_type == "redis":
            # Calculate Redis cost based on capacity
            capacity_gb = tier_memory_config.get("capacity_gb", 6)
            # C6 (6GB) = $0.765/hour × 730 = $558.45/month
            hourly_cost = 0.765 if capacity_gb >= 6 else 0.096  # C1 for < 6GB
            monthly_cost = hourly_cost * 730

            breakdown.append(CostBreakdown(
                category="Memory System",
                subcategory=f"Redis ({service_tier.title()} Tier)",
                monthly_cost=monthly_cost,
                annual_cost=monthly_cost * 12,
                unit="GB",
                quantity=capacity_gb,
                notes=f"{capacity_gb}GB Azure Cache for Redis. Persistence enabled, Replication enabled",
                calculation_formula=f"${hourly_cost}/hour × 730 hours = ${monthly_cost:,.2f}/month (C{6 if capacity_gb >= 6 else 1} tier)",
                cost_drivers=[
                    f"Cache size: {capacity_gb}GB (determines tier)",
                    "Premium features: Persistence, Clustering, Geo-replication",
                    "Azure Cache for Redis Standard/Premium tier",
                    "Region: Australia East"
                ],
                optimization_tips=[
                    "Use Basic tier if persistence not required (50% savings)",
                    f"Monitor memory usage - if < {capacity_gb * 0.6}GB consistently, downsize",
                    "Enable data eviction policies to reduce memory pressure",
                    "Consider moving cold data to Cosmos DB or SQL"
                ]
            ))

        elif normalized_type == "neo4j":
            # Calculate Neo4j cost based on number of nodes
            neo4j_nodes = int(infrastructure.get("neo4j_nodes", 1))
            # Standard_D16s_v5 reserved: $0.691/hour per node
            hourly_cost_per_node = 0.691
            monthly_cost = hourly_cost_per_node * neo4j_nodes * 730

            breakdown.append(CostBreakdown(
                category="Memory System",
                subcategory=f"Neo4j ({service_tier.title()} Tier)",
                monthly_cost=monthly_cost,
                annual_cost=monthly_cost * 12,
                unit="nodes",
                quantity=neo4j_nodes,
                notes=f"{neo4j_nodes} Neo4j cluster nodes. Graph database for relationship mapping",
                calculation_formula=f"{neo4j_nodes} nodes × ${hourly_cost_per_node}/hour × 730 hours = ${monthly_cost:,.2f}/month",
                cost_drivers=[
                    f"Number of nodes: {neo4j_nodes}",
                    "VM SKU: Standard_D16s_v5 (16 vCPU, 64GB RAM) per node",
                    "Reserved Instance pricing (1-year)",
                    "Storage: Premium SSD for graph data",
                    "High availability: Multi-node clustering"
                ],
                optimization_tips=[
                    "Use single node for development/testing environments",
                    f"Current: {neo4j_nodes} nodes. Scale down if graph < 1M nodes",
                    "Consider managed graph services if operational overhead is high",
                    "Optimize Cypher queries to reduce compute requirements"
                ]
            ))

        elif normalized_type in ["in_memory", "in-memory"]:
            # In-memory has zero cost
            monthly_cost = 0.0
            capacity_gb = tier_memory_config.get("capacity_gb", 4)

            breakdown.append(CostBreakdown(
                category="Memory System",
                subcategory=f"In-Memory ({service_tier.title()} Tier)",
                monthly_cost=0.0,
                annual_cost=0.0,
                unit="GB",
                quantity=capacity_gb,
                notes=f"{capacity_gb}GB application memory. WARNING: Data lost on restart, not suitable for production",
                calculation_formula="$0.00/month (uses application memory, no external service)",
                cost_drivers=[
                    "No infrastructure cost (uses app memory)",
                    "Limited by container/VM memory allocation",
                    "Non-persistent: Data lost on restart"
                ],
                optimization_tips=[
                    "Only use for stateless applications or development",
                    "Migrate to Redis for production workloads",
                    "Implement external persistence for critical data",
                    "WARNING: Not suitable for production use"
                ]
            ))

        else:
            # Unknown memory type - fall back to tier default
            monthly_cost = tier_memory_config.get("monthly_cost", 0.0)
            memory_type_tier = tier_memory_config.get("type", "in_memory")
            capacity_gb = tier_memory_config.get("capacity_gb", 0)

            breakdown.append(CostBreakdown(
                category="Memory System",
                subcategory=f"{memory_type_tier.title()} ({service_tier.title()} Tier - Default)",
                monthly_cost=monthly_cost,
                annual_cost=monthly_cost * 12,
                unit="GB",
                quantity=capacity_gb,
                notes=f"Unknown memory type '{memory_type}', using tier default: {memory_type_tier}"
            ))

    else:
        # No memory_type specified - use tier default
        monthly_cost = tier_memory_config.get("monthly_cost", 0.0)
        memory_type_tier = tier_memory_config.get("type", "in_memory")
        capacity_gb = tier_memory_config.get("capacity_gb", 0)
        persistence = tier_memory_config.get("persistence", False)
        replication = tier_memory_config.get("replication", False)

        features = []
        if persistence:
            features.append("Persistence")
        if replication:
            features.append("Replication")
        if tier_memory_config.get("global_distribution"):
            features.append("Global Distribution")

        features_str = ", ".join(features) if features else "No advanced features"

        breakdown.append(CostBreakdown(
            category="Memory System",
            subcategory=f"{memory_type_tier.title()} ({service_tier.title()} Tier - Default)",
            monthly_cost=monthly_cost,
            annual_cost=monthly_cost * 12,
            unit="GB",
            quantity=capacity_gb,
            notes=f"{capacity_gb}GB capacity. Features: {features_str}",
            calculation_formula=f"Tier default configuration: ${monthly_cost:,.2f}/month",
            cost_drivers=[
                f"Service tier: {service_tier}",
                f"Default memory type: {memory_type_tier}",
                f"Capacity: {capacity_gb}GB"
            ]
        ))

    return monthly_cost, breakdown

def calculate_mcp_tools_costs(selected_tools: List[str], num_assessments: int = 4000) -> tuple[float, List[CostBreakdown]]:
    """Calculate MCP tools costs based on selected tools"""
    breakdown = []
    
    # Calculate total monthly cost for MCP tools
    total_cost = 0.0

    # Simple pricing for MCP tools (estimated)
    mcp_tool_pricing = {
        "research_tool": 0.50,  # $0.50 per assessment
        "content_generation_tool": 0.30,  # $0.30 per assessment
        "competitive_intel_tool": 0.75,  # $0.75 per assessment
        "fog_analysis_tool": 0.40,  # $0.40 per assessment
        "engagement_excellence_tool": 0.60,  # $0.60 per assessment
        "impact_theme_generator_tool": 0.35,  # $0.35 per assessment
        "license_to_sell_tool": 0.25,  # $0.25 per assessment
        "find_money_validator_tool": 0.45,  # $0.45 per assessment
        "speech_to_text": 0.20  # $0.20 per assessment
    }

    for tool_name in selected_tools:
        if tool_name in mcp_tool_pricing:
            tool_cost = mcp_tool_pricing.get(tool_name, 0.0)
            total_cost += tool_cost

            breakdown.append(CostBreakdown(
                category="MCP Tools",
                subcategory=tool_name,
                monthly_cost=tool_cost,
                annual_cost=tool_cost * 12,
                unit="assessment",
                quantity=num_assessments,
                notes=f"Per assessment cost for {tool_name}"
            ))

    return total_cost, breakdown

def calculate_retrieval_costs(service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """Calculate retrieval/RAG costs based on service tier"""
    breakdown = []

    # Get tier-specific retrieval configuration from service_tiers.py
    tier_config = get_tier_config(service_tier)
    retrieval_config = tier_config.get("retrieval", {})

    monthly_cost = retrieval_config.get("monthly_cost", 0.0)
    vector_db = retrieval_config.get("vector_db", "in_memory")
    max_vectors = retrieval_config.get("max_vectors", 0)
    indexing = retrieval_config.get("indexing", "flat")

    features = []
    if retrieval_config.get("metadata_filtering"):
        features.append("Metadata Filtering")
    if retrieval_config.get("hybrid_search"):
        features.append("Hybrid Search")

    features_str = ", ".join(features) if features else f"Indexing: {indexing}"

    breakdown.append(CostBreakdown(
        category="Retrieval/RAG",
        subcategory=f"{vector_db} ({service_tier.title()} Tier)",
        monthly_cost=monthly_cost,
        annual_cost=monthly_cost * 12,
        unit="vectors",
        quantity=max_vectors,
        notes=f"{max_vectors:,} max vectors. {features_str}"
    ))

    return monthly_cost, breakdown

def calculate_security_costs(service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """Calculate security costs based on service tier"""
    breakdown = []

    # Get tier-specific security configuration from service_tiers.py
    tier_config = get_tier_config(service_tier)
    security_config = tier_config.get("security", {})

    monthly_cost = security_config.get("monthly_cost", 0.0)
    level = security_config.get("level", "basic")
    features = security_config.get("features", [])
    features_str = ", ".join(features)

    compliance = security_config.get("compliance", [])
    compliance_str = f" Compliance: {', '.join(compliance)}" if compliance else ""

    breakdown.append(CostBreakdown(
        category="Security",
        subcategory=f"{level.title()} Security ({service_tier.title()} Tier)",
        monthly_cost=monthly_cost,
        annual_cost=monthly_cost * 12,
        unit="service",
        quantity=1,
        notes=f"Features: {features_str}.{compliance_str}"
    ))

    return monthly_cost, breakdown

def calculate_prompt_tuning_costs(service_tier: str = "standard") -> tuple[float, List[CostBreakdown]]:
    """Calculate prompt tuning costs based on service tier"""
    breakdown = []

    # Get tier-specific prompt tuning configuration from service_tiers.py
    tier_config = get_tier_config(service_tier)
    prompt_tuning_config = tier_config.get("prompt_tuning", {})

    monthly_cost = prompt_tuning_config.get("monthly_cost", 0.0)
    approach = prompt_tuning_config.get("approach", "manual")
    features = prompt_tuning_config.get("features", [])
    features_str = ", ".join(features)

    breakdown.append(CostBreakdown(
        category="Prompt Tuning",
        subcategory=f"{approach.replace('_', ' ').title()} ({service_tier.title()} Tier)",
        monthly_cost=monthly_cost,
        annual_cost=monthly_cost * 12,
        unit="service",
        quantity=1,
        notes=f"Features: {features_str}"
    ))

    return monthly_cost, breakdown

def apply_service_tier_config(params: CostCalculatorRequest) -> CostCalculatorRequest:
    """Apply service tier configuration to request parameters"""

    # If service_tier is provided and exists in SERVICE_TIERS
    if params.service_tier and params.service_tier.lower() in SERVICE_TIERS:
        tier_config = SERVICE_TIERS[params.service_tier.lower()]

        # Override LLM mix with tier configuration (using deployment_type)
        # Build LLM mix based on available models in tier
        llm_models = tier_config["llm_models"].get(params.deployment_type, [])
        if llm_models:
            # Distribute evenly across available models
            percentage_per_model = 100.0 / len(llm_models)
            params.llm_mix = {model: percentage_per_model for model in llm_models}

        # Override caching settings from limits
        limits = tier_config.get("limits", {})
        params.cache_hit_rate = limits.get("cache_hit_rate", 0.70)

        # Override features
        features = tier_config.get("features", {})
        params.use_prompt_caching = features.get("use_prompt_caching", True)
        params.use_reserved_instances = features.get("use_reserved_instances", False)

    return params

# ===========================
# MAIN COST CALCULATION
# ===========================

async def calculate_costs(params: CostCalculatorRequest):
    """Calculate comprehensive costs for AI agent deployment"""

    # Apply service tier configuration (Basic, Standard, Premium)
    params = apply_service_tier_config(params)

    # Validate agent type
    if params.agent_type not in AI_AGENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Agent type '{params.agent_type}' not supported. Available: {list(AI_AGENTS.keys())}"
        )

    # Get agent configuration
    agent = AI_AGENTS[params.agent_type]

    # Get infrastructure configuration (tier-based)
    infra = get_agent_infrastructure(
        params.agent_type,
        params.service_tier,
        params.infrastructure_scale,
        None  # No custom infrastructure for now
    )

    # Calculate costs
    total_queries = params.num_users * params.queries_per_user_per_month
    total_input_tokens = total_queries * params.avg_input_tokens
    total_output_tokens = total_queries * params.avg_output_tokens

    # Calculate LLM costs (handles both Cloud API and On-Premise deployments)
    llm_total, llm_breakdown = calculate_llm_costs(
        params.llm_mix,
        total_queries,
        params.avg_input_tokens,
        params.avg_output_tokens,
        params.cache_hit_rate,
        params.use_prompt_caching,
        deployment_type=params.deployment_type,
        service_tier=params.service_tier
    )

    # Calculate infrastructure costs
    infra_total, infra_breakdown = calculate_infrastructure_costs(infra, params.use_reserved_instances)

    # Calculate tier-based costs using service_tiers.py configurations
    data_total, data_breakdown = calculate_data_source_costs(params.agent_type, params.service_tier)

    # Estimate data ingestion for monitoring (based on queries and users)
    estimated_data_gb = (params.num_users * params.queries_per_user_per_month * 0.001) + 100  # Base 100GB
    monitor_total, monitor_breakdown = calculate_monitoring_costs(estimated_data_gb, params.service_tier)

    # Calculate MEMORY SYSTEM costs (tier-based)
    memory_total, memory_breakdown = calculate_memory_system_costs(
        memory_type=params.memory_type,
        infrastructure=infra,
        service_tier=params.service_tier
    )

    # Calculate RETRIEVAL/RAG costs (NEW - tier-based)
    retrieval_total, retrieval_breakdown = calculate_retrieval_costs(params.service_tier)

    # Calculate SECURITY costs (NEW - tier-based)
    security_total, security_breakdown = calculate_security_costs(params.service_tier)

    # Calculate PROMPT TUNING costs (NEW - tier-based)
    prompt_tuning_total, prompt_tuning_breakdown = calculate_prompt_tuning_costs(params.service_tier)

    # Calculate MCP TOOLS costs (user-selected)
    total_queries = params.num_users * params.queries_per_user_per_month
    tools_total, tools_breakdown = calculate_mcp_tools_costs(
        params.mcp_tools,
        total_queries
    )

    # Calculate savings
    cache_savings = llm_total * (1 - params.cache_hit_rate) if params.use_prompt_caching else 0
    reserved_savings = infra_total * 0.5 if params.use_reserved_instances else 0

    # Calculate totals (INCLUDING all tier-based costs)
    fixed_monthly = (infra_total + data_total + monitor_total + memory_total +
                    retrieval_total + security_total + prompt_tuning_total + tools_total)
    variable_monthly = llm_total
    total_monthly = fixed_monthly + variable_monthly

    # NEW: Calculate Global Usage Metrics (per-user breakdown)
    tokens_per_user = (params.avg_input_tokens + params.avg_output_tokens) * params.queries_per_user_per_month
    storage_per_user = (infra["storage_hot_tb"] + infra["storage_cool_tb"]) * 1024 / params.num_users if params.num_users > 0 else 0  # Convert TB to GB
    cost_per_user = total_monthly / params.num_users if params.num_users > 0 else 0
    cost_per_query = total_monthly / total_queries if total_queries > 0 else 0
    total_tokens_month = tokens_per_user * params.num_users
    cost_per_1k_tokens = (total_monthly / total_tokens_month) * 1000 if total_tokens_month > 0 else 0

    global_usage_metrics = GlobalUsageMetrics(
        # Per-User Metrics
        tokens_per_user_per_month=int(tokens_per_user),
        input_tokens_per_user_per_month=int(params.avg_input_tokens * params.queries_per_user_per_month),
        output_tokens_per_user_per_month=int(params.avg_output_tokens * params.queries_per_user_per_month),
        queries_per_user_per_month=params.queries_per_user_per_month,
        storage_per_user_gb=round(storage_per_user, 2),
        cost_per_user_per_month=round(cost_per_user, 2),

        # Aggregate Metrics
        total_users=params.num_users,
        total_tokens_per_month=int(total_tokens_month),
        total_storage_gb=round((infra["storage_hot_tb"] + infra["storage_cool_tb"]) * 1024, 2),
        total_queries_per_month=total_queries,

        # Efficiency Metrics
        cache_hit_rate=params.cache_hit_rate,
        avg_tokens_per_query=int(params.avg_input_tokens + params.avg_output_tokens),
        cost_per_query=round(cost_per_query, 4),
        cost_per_1k_tokens=round(cost_per_1k_tokens, 4),

        # Description
        description=f"Usage metrics for {params.num_users} users with {params.queries_per_user_per_month} queries/user/month ({params.service_tier} tier)"
    )

    return CostCalculatorResponse(
        total_monthly_cost=total_monthly,
        total_annual_cost=total_monthly * 12,
        llm_costs=llm_total,
        infrastructure_costs=infra_total,
        data_source_costs=data_total,
        monitoring_costs=monitor_total,
        memory_system_costs=memory_total,
        retrieval_costs=retrieval_total,  # NEW - tier-based RAG costs
        security_costs=security_total,  # NEW - tier-based security costs
        prompt_tuning_costs=prompt_tuning_total,  # NEW - tier-based prompt tuning costs
        mcp_tools_costs=tools_total,
        infrastructure_breakdown=infra_breakdown,
        llm_breakdown=llm_breakdown,
        data_source_breakdown=data_breakdown,
        monitoring_breakdown=monitor_breakdown,
        memory_system_breakdown=memory_breakdown,
        retrieval_breakdown=retrieval_breakdown,  # NEW
        security_breakdown=security_breakdown,  # NEW
        prompt_tuning_breakdown=prompt_tuning_breakdown,  # NEW
        mcp_tools_breakdown=tools_breakdown,
        queries_per_month=total_queries,
        input_tokens_per_month=total_input_tokens,
        output_tokens_per_month=total_output_tokens,
        estimated_data_size_gb=infra["storage_hot_tb"] + infra["storage_cool_tb"],
        savings_from_caching=cache_savings,
        savings_from_reserved_instances=reserved_savings,
        global_usage_metrics=global_usage_metrics  # NEW: Global Usage Parameters
    )

# ===========================
# API ROUTES
# ===========================

router = APIRouter()

@router.post("/calculate", response_model=CostCalculatorResponse)
async def calculate_costs_endpoint(params: CostCalculatorRequest):
    """Calculate comprehensive costs for AI agent deployment"""
    return await calculate_costs(params)

@router.get("/agents")
async def list_agents():
    """List all available AI agents"""
    return {
        "agents": [
            {
                "id": agent_id,
                "name": agent["name"],
                "description": agent["description"],
                "data_sources": agent["data_sources"]
            }
            for agent_id, agent in AI_AGENTS.items()
        ]
    }

@router.get("/agents/{agent_id}")
async def get_agent_details(agent_id: str):
    """Get detailed information about a specific agent"""
    if agent_id not in AI_AGENTS:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} not found")
    
    agent = AI_AGENTS[agent_id]
    return {
        "id": agent_id,
        "name": agent["name"],
        "description": agent["description"],
        "data_sources": agent["data_sources"],
        "infrastructure": agent["infrastructure"]
    }

@router.get("/tiers")
async def list_service_tiers():
    """List all available service tiers"""
    return {
        "tiers": [
            {
                "tier_id": key,
                "name": value["name"],
                "target_price_per_user_monthly": value["target_price_per_user_monthly"],
                "description": value.get("description", ""),
                "data_sources_included": value.get("data_sources", {}).get("sources", [])
            }
            for key, value in SERVICE_TIERS.items()
        ]
    }

@router.get("/tiers/{tier_id}")
async def get_tier_details(tier_id: str):
    """Get detailed information about a specific service tier"""
    if tier_id.lower() not in SERVICE_TIERS:
        raise HTTPException(status_code=404, detail=f"Tier {tier_id} not found")

    tier_config = SERVICE_TIERS[tier_id.lower()]
    return {
        "tier_id": tier_id.lower(),
        "name": tier_config["name"],
        "description": tier_config.get("description", ""),
        "target_price_per_user_monthly": tier_config["target_price_per_user_monthly"],
        "data_sources_included": tier_config.get("data_sources", {}).get("sources", [])
    }

@router.get("/tiers/{tier_id}/models")
async def get_tier_models(tier_id: str, deployment_type: str = "cloud_api"):
    """Get available LLM models for a specific tier and deployment type"""
    if tier_id.lower() not in SERVICE_TIERS:
        raise HTTPException(status_code=404, detail=f"Tier {tier_id} not found")

    models = get_llm_models_for_tier(tier_id.lower(), deployment_type)
    return {
        "tier_id": tier_id.lower(),
        "deployment_type": deployment_type,
        "models": models
    }

@router.post("/calculate-agent", response_model=AgentCostResponse)
async def calculate_agent_cost_endpoint(params: AgentCostRequest):
    """
    Calculate LLM costs for a SINGLE agent only (no infrastructure costs).
    This endpoint is designed for per-agent cost calculation in the Sales Coach UI.
    """
    # Calculate total queries for this agent
    total_queries = params.num_users * params.queries_per_user_per_month

    # Calculate input/output tokens (70/30 split)
    avg_input_tokens = int(params.avg_tokens_per_request * 0.7)
    avg_output_tokens = int(params.avg_tokens_per_request * 0.3)

    total_input_tokens = total_queries * avg_input_tokens
    total_output_tokens = total_queries * avg_output_tokens

    # Handle on-premise deployment differently
    if params.deployment_type == "on_premise":
        # Find GPU type for this model from LLM_CATEGORIES
        from app.config.service_tiers import LLM_CATEGORIES

        gpu_type = "A100"  # Default
        for category in LLM_CATEGORIES.values():
            for model in category.get("on_premise", []):
                if model["id"] == params.llm_model:
                    gpu_type = model.get("gpu_type", "A100")
                    break

        # Determine number of GPUs based on service tier
        gpu_count = {
            "basic": 1,      # 1 GPU for basic tier
            "standard": 2,   # 2 GPUs for standard tier
            "premium": 4     # 4 GPUs for premium tier
        }.get(params.service_tier.lower(), 1)

        # Calculate full month GPU cost (730 hours) with tier-based allocation
        from app.config.service_tiers import GPU_COSTS
        gpu_hourly_cost = GPU_COSTS[gpu_type]["hourly_cost"]
        monthly_cost_usd = gpu_hourly_cost * 730 * gpu_count

        # Convert USD to AUD
        monthly_cost_aud = monthly_cost_usd / AUD_TO_USD
    else:
        # Cloud API - Calculate LLM costs using token pricing
        llm_total, _ = calculate_llm_costs(
            llm_mix={params.llm_model: 100.0},  # 100% of this single model
            total_queries=total_queries,
            avg_input_tokens=avg_input_tokens,
            avg_output_tokens=avg_output_tokens,
            cache_hit_rate=params.cache_hit_rate,
            use_prompt_caching=params.use_prompt_caching
        )
        monthly_cost_aud = llm_total

    return AgentCostResponse(
        agent_llm_cost_monthly=monthly_cost_aud,
        agent_llm_cost_annual=monthly_cost_aud * 12,
        total_queries_per_month=total_queries,
        total_input_tokens_per_month=total_input_tokens,
        total_output_tokens_per_month=total_output_tokens,
        llm_model=params.llm_model,
        deployment_type=params.deployment_type
    )
