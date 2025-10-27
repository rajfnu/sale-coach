"""
Service Tier Configuration for Multi-Agent AI Cost Calculator

This module defines three service tiers (Basic, Standard, Premium) with:
- LLM model selections (cheap, mid-range, expensive)
- Infrastructure configurations
- Storage, retrieval, monitoring settings
- Prompt tuning and security features
- Local/Open-source LLM support
"""

from typing import Dict, List, Any
from enum import Enum

class TierLevel(str, Enum):
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"

class DeploymentType(str, Enum):
    CLOUD_API = "cloud_api"
    ON_PREMISE = "on_premise"
    HYBRID = "hybrid"

# ==========================================
# LLM MODEL CATEGORIZATION
# ==========================================

LLM_CATEGORIES = {
    "cheap": {
        "cloud_api": [
            # From LLM_Pricing.json - Cheapest models (input < $0.5/M tokens) - 5 models
            {"id": "gpt-5-nano", "provider": "openai", "input": 0.05, "output": 0.4},
            {"id": "gemini-1.5-flash-8b", "provider": "google", "input": 0.075, "output": 0.3},
            {"id": "gpt-4.1-nano", "provider": "openai", "input": 0.1, "output": 0.4},
            {"id": "gpt-4o-mini", "provider": "openai", "input": 0.15, "output": 0.6},
            {"id": "claude-3-haiku", "provider": "anthropic", "input": 0.25, "output": 1.25},
        ],
        "on_premise": [
            # Local/Open-Source Models (Infrastructure-based pricing) - 5 models
            {"id": "llama-3-8b", "provider": "meta", "deployment": "self_hosted", "gpu_type": "T4", "gpu_hourly_cost": 0.35},
            {"id": "llama-3.1-8b", "provider": "meta", "deployment": "self_hosted", "gpu_type": "T4", "gpu_hourly_cost": 0.35},
            {"id": "mistral-7b", "provider": "mistral", "deployment": "self_hosted", "gpu_type": "T4", "gpu_hourly_cost": 0.35},
            {"id": "phi-3-mini", "provider": "microsoft", "deployment": "self_hosted", "gpu_type": "T4", "gpu_hourly_cost": 0.30},
            {"id": "gemma-7b", "provider": "google", "deployment": "self_hosted", "gpu_type": "T4", "gpu_hourly_cost": 0.35},
        ]
    },
    "mid_range": {
        "cloud_api": [
            # From LLM_Pricing.json - Mid-range models ($0.5-$5/M input tokens) - 5 models
            {"id": "claude-3-5-haiku", "provider": "anthropic", "input": 0.8, "output": 4.0},
            {"id": "claude-4-5-haiku", "provider": "anthropic", "input": 1.0, "output": 5.0},
            {"id": "o3-mini", "provider": "openai", "input": 1.1, "output": 4.4},
            {"id": "gpt-4.1", "provider": "openai", "input": 2.0, "output": 8.0},
            {"id": "gpt-4o", "provider": "openai", "input": 2.5, "output": 10.0},
        ],
        "on_premise": [
            {"id": "llama-3-70b", "provider": "meta", "deployment": "self_hosted", "gpu_type": "A100", "gpu_hourly_cost": 1.5},
            {"id": "llama-3.1-70b", "provider": "meta", "deployment": "self_hosted", "gpu_type": "A100", "gpu_hourly_cost": 1.5},
            {"id": "mistral-medium", "provider": "mistral", "deployment": "self_hosted", "gpu_type": "A100", "gpu_hourly_cost": 1.5},
            {"id": "mixtral-8x7b", "provider": "mistral", "deployment": "self_hosted", "gpu_type": "A100", "gpu_hourly_cost": 1.5},
        ]
    },
    "expensive": {
        "cloud_api": [
            # From LLM_Pricing.json - Expensive/Reasoning models (> $5/M input tokens) - 5 models
            {"id": "o3-deep-research", "provider": "openai", "input": 10.0, "output": 40.0},
            {"id": "o1", "provider": "openai", "input": 15.0, "output": 60.0},
            {"id": "claude-opus-4", "provider": "anthropic", "input": 15.0, "output": 75.0},
            {"id": "gpt-5-pro", "provider": "openai", "input": 15.0, "output": 120.0},
            {"id": "o3-pro", "provider": "openai", "input": 20.0, "output": 80.0},
            # Perplexity Expensive
            {"id": "sonar-pro", "provider": "perplexity", "input": 3.0, "output": 15.0},
            {"id": "sonar-deep-research", "provider": "perplexity", "input": 2.0, "output": 8.0},
        ],
        "on_premise": [
            {"id": "llama-3-405b", "provider": "meta", "deployment": "self_hosted", "gpu_type": "H100", "gpu_hourly_cost": 3.0},
            {"id": "mixtral-8x22b", "provider": "mistral", "deployment": "self_hosted", "gpu_type": "H100", "gpu_hourly_cost": 3.0},
        ]
    }
}

# ==========================================
# INFRASTRUCTURE CONFIGURATION
# ==========================================

INFRASTRUCTURE_CONFIGS = {
    "basic": {
        "aks_nodes": 2,
        "sql_vcores": 2,
        "cosmos_ru": 0,  # No Cosmos DB
        "neo4j_nodes": 0,  # No Neo4j
        "storage_hot_gb": 20,
        "storage_cool_gb": 100,
        "bandwidth_gb": 50,
        "load_balancer": "basic",
        "compute_tier": "B2s",  # Burstable tier
    },
    "standard": {
        "aks_nodes": 5,
        "sql_vcores": 6,
        "cosmos_ru": 15000,
        "neo4j_nodes": 1,
        "storage_hot_gb": 500,
        "storage_cool_gb": 4000,
        "bandwidth_gb": 500,
        "load_balancer": "standard",
        "compute_tier": "D4s_v3",
    },
    "premium": {
        "aks_nodes": 12,
        "sql_vcores": 18,
        "cosmos_ru": 67500,
        "neo4j_nodes": 3,
        "storage_hot_gb": 2500,
        "storage_cool_gb": 20000,
        "bandwidth_gb": 2000,
        "load_balancer": "premium",
        "compute_tier": "E8s_v3",  # Memory-optimized
    }
}

# ==========================================
# MEMORY/STORAGE CONFIGURATION
# ==========================================

MEMORY_CONFIGS = {
    "basic": {
        "type": "in_memory",
        "monthly_cost": 0.0,  # Free, using application memory
        "capacity_gb": 4,
        "persistence": False,
        "replication": False,
    },
    "standard": {
        "type": "redis",
        "monthly_cost": 558.0,  # Azure Cache for Redis Standard
        "capacity_gb": 26,
        "persistence": True,
        "replication": True,
    },
    "premium": {
        "type": "cosmos_db",
        "monthly_cost": 3942.0,  # Cosmos DB with high RU/s
        "capacity_gb": 500,
        "persistence": True,
        "replication": True,
        "global_distribution": True,
    }
}

# ==========================================
# RETRIEVAL/RAG CONFIGURATION
# ==========================================

RETRIEVAL_CONFIGS = {
    "basic": {
        "vector_db": "in_memory",  # Using FAISS in-memory
        "monthly_cost": 0.0,
        "dimensions": 768,
        "max_vectors": 100000,
        "indexing": "flat",
    },
    "standard": {
        "vector_db": "pinecone_starter",  # Managed vector DB
        "monthly_cost": 70.0,
        "dimensions": 1536,
        "max_vectors": 5000000,
        "indexing": "hnsw",
    },
    "premium": {
        "vector_db": "pinecone_enterprise",
        "monthly_cost": 500.0,
        "dimensions": 3072,
        "max_vectors": 50000000,
        "indexing": "hnsw",
        "metadata_filtering": True,
        "hybrid_search": True,
    }
}

# ==========================================
# MONITORING CONFIGURATION
# ==========================================

MONITORING_CONFIGS = {
    "basic": {
        "apm_tool": "basic_logging",
        "monthly_cost": 25.0,
        "features": ["basic_logs", "uptime_monitoring"],
        "retention_days": 7,
        "alerting": False,
    },
    "standard": {
        "apm_tool": "app_insights",
        "monthly_cost": 150.0,
        "features": ["apm", "distributed_tracing", "custom_metrics", "alerting"],
        "retention_days": 30,
        "alerting": True,
    },
    "premium": {
        "apm_tool": "datadog_premium",
        "monthly_cost": 500.0,
        "features": ["full_apm", "distributed_tracing", "rum", "synthetics", "security_monitoring", "ml_anomaly_detection"],
        "retention_days": 90,
        "alerting": True,
        "sla_monitoring": True,
    }
}

# ==========================================
# PROMPT TUNING CONFIGURATION
# ==========================================

PROMPT_TUNING_CONFIGS = {
    "basic": {
        "approach": "manual",
        "monthly_cost": 0.0,
        "features": ["manual_prompt_editing"],
    },
    "standard": {
        "approach": "prompt_caching",
        "monthly_cost": 100.0,
        "features": ["prompt_caching", "version_control", "a_b_testing"],
        "cache_hit_rate": 0.70,
    },
    "premium": {
        "approach": "advanced_optimization",
        "monthly_cost": 500.0,
        "features": ["prompt_caching", "auto_optimization", "rag_optimization", "chain_of_thought", "self_reflection"],
        "cache_hit_rate": 0.85,
        "prompt_compression": True,
    }
}

# ==========================================
# SECURITY CONFIGURATION
# ==========================================

SECURITY_CONFIGS = {
    "basic": {
        "level": "basic",
        "monthly_cost": 50.0,
        "features": ["basic_auth", "ssl", "rate_limiting"],
    },
    "standard": {
        "level": "standard",
        "monthly_cost": 200.0,
        "features": ["oauth2", "rbac", "audit_logs", "encryption_at_rest", "ddos_protection"],
    },
    "premium": {
        "level": "premium",
        "monthly_cost": 800.0,
        "features": ["zero_trust", "advanced_threat_protection", "data_loss_prevention", "compliance_monitoring", "penetration_testing"],
        "compliance": ["SOC2", "HIPAA", "GDPR"],
    }
}

# ==========================================
# DATA SOURCES CONFIGURATION
# ==========================================

DATA_SOURCES_CONFIGS = {
    "basic": {
        "sources": [],  # No premium data sources
        "monthly_cost": 0.0,
    },
    "standard": {
        "sources": ["linkedin_sales_navigator"],
        "monthly_cost": 1299.0,  # LinkedIn Sales Navigator Team
    },
    "premium": {
        "sources": [
            "linkedin_sales_navigator",
            "zoominfo",
            "clearbit",
            "apollo",
            "salesforce_data_cloud",
            "6sense"
        ],
        "monthly_cost": 5700.0,  # All premium sources
    }
}

# ==========================================
# COMPREHENSIVE SERVICE TIER DEFINITIONS
# ==========================================

SERVICE_TIERS: Dict[str, Dict[str, Any]] = {
    "basic": {
        "name": "Basic Tier",
        "description": "Cost-optimized for startups and experimentation",
        "target_price_per_user_monthly": 30.0,
        "deployment_type": DeploymentType.CLOUD_API,

        # LLM Configuration
        "llm_models": {
            "cloud_api": [m["id"] for m in LLM_CATEGORIES["cheap"]["cloud_api"]],  # All 5 cheap models
            "on_premise": [m["id"] for m in LLM_CATEGORIES["cheap"]["on_premise"]],  # All 5 cheap local models
        },
        "default_llm": "gpt-4o-mini",

        # Infrastructure
        "infrastructure": INFRASTRUCTURE_CONFIGS["basic"],
        "infrastructure_scale": 0.3,

        # Memory & Storage
        "memory": MEMORY_CONFIGS["basic"],

        # Retrieval/RAG
        "retrieval": RETRIEVAL_CONFIGS["basic"],

        # Monitoring
        "monitoring": MONITORING_CONFIGS["basic"],

        # Prompt Tuning
        "prompt_tuning": PROMPT_TUNING_CONFIGS["basic"],

        # Security
        "security": SECURITY_CONFIGS["basic"],

        # Data Sources
        "data_sources": DATA_SOURCES_CONFIGS["basic"],

        # Limits
        "limits": {
            "max_queries_per_user_per_month": 50,
            "max_input_tokens": 5000,
            "max_output_tokens": 500,
            "max_concurrent_users": 50,
            "cache_hit_rate": 0.80,  # Higher cache = lower cost
        },

        # Features
        "features": {
            "use_prompt_caching": True,
            "use_reserved_instances": False,
            "use_batch_processing": True,
            "use_model_distillation": False,
        }
    },

    "standard": {
        "name": "Standard Tier",
        "description": "Balanced performance and cost for growing businesses",
        "target_price_per_user_monthly": 149.0,
        "deployment_type": DeploymentType.HYBRID,

        # LLM Configuration
        "llm_models": {
            "cloud_api": [m["id"] for m in LLM_CATEGORIES["cheap"]["cloud_api"]] +
                         [m["id"] for m in LLM_CATEGORIES["mid_range"]["cloud_api"]],  # 5 cheap + 5 mid = 10 models
            "on_premise": [m["id"] for m in LLM_CATEGORIES["cheap"]["on_premise"]],  # 5 on-premise models
        },
        "default_llm": "gpt-4o",

        # Infrastructure
        "infrastructure": INFRASTRUCTURE_CONFIGS["standard"],
        "infrastructure_scale": 0.6,

        # Memory & Storage
        "memory": MEMORY_CONFIGS["standard"],

        # Retrieval/RAG
        "retrieval": RETRIEVAL_CONFIGS["standard"],

        # Monitoring
        "monitoring": MONITORING_CONFIGS["standard"],

        # Prompt Tuning
        "prompt_tuning": PROMPT_TUNING_CONFIGS["standard"],

        # Security
        "security": SECURITY_CONFIGS["standard"],

        # Data Sources
        "data_sources": DATA_SOURCES_CONFIGS["standard"],

        # Limits
        "limits": {
            "max_queries_per_user_per_month": 500,
            "max_input_tokens": 10000,
            "max_output_tokens": 2000,
            "max_concurrent_users": 200,
            "cache_hit_rate": 0.70,
        },

        # Features
        "features": {
            "use_prompt_caching": True,
            "use_reserved_instances": True,
            "use_batch_processing": True,
            "use_model_distillation": False,
        }
    },

    "premium": {
        "name": "Premium Tier",
        "description": "Maximum performance with all features for enterprises",
        "target_price_per_user_monthly": 999.0,
        "deployment_type": DeploymentType.HYBRID,

        # LLM Configuration - All models available
        "llm_models": {
            "cloud_api": [m["id"] for m in LLM_CATEGORIES["cheap"]["cloud_api"]] +
                         [m["id"] for m in LLM_CATEGORIES["mid_range"]["cloud_api"]] +
                         [m["id"] for m in LLM_CATEGORIES["expensive"]["cloud_api"]],
            "on_premise": [m["id"] for m in LLM_CATEGORIES["cheap"]["on_premise"]] +
                          [m["id"] for m in LLM_CATEGORIES["mid_range"]["on_premise"]] +
                          [m["id"] for m in LLM_CATEGORIES["expensive"]["on_premise"]],
        },
        "default_llm": "claude-opus-4",

        # Infrastructure
        "infrastructure": INFRASTRUCTURE_CONFIGS["premium"],
        "infrastructure_scale": 1.5,

        # Memory & Storage
        "memory": MEMORY_CONFIGS["premium"],

        # Retrieval/RAG
        "retrieval": RETRIEVAL_CONFIGS["premium"],

        # Monitoring
        "monitoring": MONITORING_CONFIGS["premium"],

        # Prompt Tuning
        "prompt_tuning": PROMPT_TUNING_CONFIGS["premium"],

        # Security
        "security": SECURITY_CONFIGS["premium"],

        # Data Sources
        "data_sources": DATA_SOURCES_CONFIGS["premium"],

        # Limits
        "limits": {
            "max_queries_per_user_per_month": 999999,  # Unlimited
            "max_input_tokens": 100000,
            "max_output_tokens": 10000,
            "max_concurrent_users": 1000,
            "cache_hit_rate": 0.60,  # Lower cache = fresher responses
        },

        # Features
        "features": {
            "use_prompt_caching": True,
            "use_reserved_instances": True,
            "use_batch_processing": True,
            "use_model_distillation": True,
        }
    }
}

# ==========================================
# GPU COST CONFIGURATIONS (On-Premise)
# ==========================================

GPU_COSTS = {
    "T4": {
        "hourly_cost": 0.35,
        "monthly_cost": 252.0,  # 24 * 30 * 0.35
        "memory_gb": 16,
        "suitable_for": ["llama-3-8b", "mistral-7b", "phi-3-mini"],
    },
    "A100": {
        "hourly_cost": 1.5,
        "monthly_cost": 1080.0,  # 24 * 30 * 1.5
        "memory_gb": 40,
        "suitable_for": ["llama-3-70b", "mixtral-8x7b"],
    },
    "H100": {
        "hourly_cost": 3.0,
        "monthly_cost": 2160.0,  # 24 * 30 * 3.0
        "memory_gb": 80,
        "suitable_for": ["llama-3-405b", "mixtral-8x22b"],
    }
}

# Additional on-premise operational costs
ON_PREMISE_OPEX = {
    "basic": {
        "power_cooling_monthly": 100.0,
        "network_monthly": 50.0,
        "maintenance_hours_monthly": 20,
        "engineer_hourly_rate": 80.0,
    },
    "standard": {
        "power_cooling_monthly": 300.0,
        "network_monthly": 150.0,
        "maintenance_hours_monthly": 40,
        "engineer_hourly_rate": 100.0,
    },
    "premium": {
        "power_cooling_monthly": 800.0,
        "network_monthly": 400.0,
        "maintenance_hours_monthly": 80,
        "engineer_hourly_rate": 120.0,
    }
}

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def get_tier_config(tier: str) -> Dict[str, Any]:
    """Get complete configuration for a specific tier"""
    return SERVICE_TIERS.get(tier.lower(), SERVICE_TIERS["standard"])

def get_llm_models_for_tier(tier: str, deployment_type: str = "cloud_api") -> List[Dict[str, Any]]:
    """Get all available LLM models for a specific tier and deployment type"""
    tier_config = get_tier_config(tier)
    model_ids = tier_config["llm_models"].get(deployment_type, [])

    # Find model details from LLM_CATEGORIES
    models = []
    for category in ["cheap", "mid_range", "expensive"]:
        for model in LLM_CATEGORIES[category][deployment_type]:
            if model["id"] in model_ids:
                models.append(model)
    return models

def calculate_on_premise_cost(gpu_type: str, tier: str, num_gpus: int = 1) -> float:
    """Calculate monthly cost for on-premise deployment"""
    gpu_cost = GPU_COSTS[gpu_type]["monthly_cost"] * num_gpus
    opex = ON_PREMISE_OPEX[tier]
    total_opex = (
        opex["power_cooling_monthly"] +
        opex["network_monthly"] +
        (opex["maintenance_hours_monthly"] * opex["engineer_hourly_rate"])
    )
    return gpu_cost + total_opex

def get_tier_summary(tier: str) -> Dict[str, Any]:
    """Get a summary of costs for a specific tier"""
    config = get_tier_config(tier)

    # Calculate fixed monthly costs
    fixed_costs = {
        "memory": config["memory"]["monthly_cost"],
        "retrieval": config["retrieval"]["monthly_cost"],
        "monitoring": config["monitoring"]["monthly_cost"],
        "prompt_tuning": config["prompt_tuning"]["monthly_cost"],
        "security": config["security"]["monthly_cost"],
        "data_sources": config["data_sources"]["monthly_cost"],
    }

    total_fixed = sum(fixed_costs.values())

    return {
        "tier": tier,
        "name": config["name"],
        "description": config["description"],
        "target_price_per_user": config["target_price_per_user_monthly"],
        "fixed_monthly_cost": total_fixed,
        "fixed_cost_breakdown": fixed_costs,
        "available_llm_models_count": {
            "cloud_api": len(config["llm_models"]["cloud_api"]),
            "on_premise": len(config["llm_models"]["on_premise"]),
        },
        "limits": config["limits"],
        "features": config["features"],
    }
