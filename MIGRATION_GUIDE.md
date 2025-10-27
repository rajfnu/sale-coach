# Migration Guide: From qa-ai-agent to sale-coach

## Overview

This document explains what was extracted from the `qa-ai-agent` project to create the standalone `sale-coach` project.

## Project Comparison

### Original Project (qa-ai-agent)
- **Name**: QA AI Agent
- **Tabs**: Sales Coach in the Pocket, Cost Calculator
- **Purpose**: Multi-purpose AI agent platform

### New Project (sale-coach)
- **Name**: Sales AI Agent
- **Tabs**: Design, Cost
- **Purpose**: Dedicated Sales Coach AI agent design and cost calculator

## What Was Moved

### Frontend Files

#### From qa-ai-agent/frontend/src/
- ✅ `SalesCoach.js` → `sale-coach/frontend/src/Design.js`
  - Renamed component from `SalesCoach` to `Design`
  - Contains all Sales Coach agent configuration functionality

- ✅ `CostCalculator.js` → `sale-coach/frontend/src/Cost.js`
  - Renamed component from `CostCalculator` to `Cost`
  - Contains cost calculation and breakdown functionality

- ✅ `AppContext.js` → `sale-coach/frontend/src/AppContext.js`
  - Shared state management between tabs
  - Maintains sales coach configuration

#### New Frontend Files Created
- `App.js` - Main application with 2-tab layout (Design & Cost)
- `index.js` - React entry point
- `index.css` - Global styles

### Backend Files

#### From qa-ai-agent/backend/
- ✅ `app/routers/cost_calculator_v2.py` → `sale-coach/backend/app/routers/cost_calculator_v2.py`
  - All cost calculation endpoints
  - On-premise and Cloud API pricing logic
  - GPU-based cost calculations

- ✅ `config/service_tiers.py` → `sale-coach/backend/app/config/service_tiers.py`
  - Service tier configurations (Basic, Standard, Premium)
  - LLM model definitions
  - GPU cost configurations

- ✅ `config/pricing.yaml` → `sale-coach/backend/app/config/pricing.yaml`
  - Pricing data for all services
  - MCP tools pricing
  - Infrastructure costs

- ✅ `config/LLM_Pricing.json` → `sale-coach/backend/app/config/LLM_Pricing.json`
  - LLM token pricing data for all models
  - Provider-specific pricing information

#### New Backend Files Created
- `app/main.py` - FastAPI application with CORS and routing
- `requirements.txt` - Python dependencies

## Architecture Changes

### Tab Structure

**Before (qa-ai-agent):**
```
App
├── Sales Coach in the Pocket (SalesCoach component)
└── Cost Calculator (CostCalculator component)
```

**After (sale-coach):**
```
Sales AI Agent
├── Design (Design component = SalesCoach)
└── Cost (Cost component = CostCalculator)
```

### File Structure

**sale-coach Project Structure:**
```
sale-coach/
├── README.md
├── .gitignore
├── MIGRATION_GUIDE.md
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css
│       ├── App.js           # Main app with 2 tabs
│       ├── AppContext.js    # Shared state
│       ├── Design.js        # Tab 1: Agent Design (from SalesCoach.js)
│       └── Cost.js          # Tab 2: Cost Calculator (from CostCalculator.js)
│
└── backend/
    ├── requirements.txt
    └── app/
        ├── __init__.py
        ├── main.py          # FastAPI app
        ├── routers/
        │   ├── __init__.py
        │   └── cost_calculator_v2.py
        └── config/
            ├── __init__.py
            ├── service_tiers.py
            ├── pricing.yaml
            └── LLM_Pricing.json
```

## What Was NOT Moved

The following features from qa-ai-agent were **NOT** included in sale-coach:

- ❌ Multi-agent platform features (only Sales Coach)
- ❌ Other agent types (Customer Service, Marketing, etc.)
- ❌ Admin/management features
- ❌ User authentication
- ❌ Database integration
- ❌ Multiple project configurations

## Setup Instructions

### Backend Setup

```bash
cd /Users/rajeevkumar/code/sale-coach/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend will run on: http://localhost:8001
API docs available at: http://localhost:8001/docs

### Frontend Setup

```bash
cd /Users/rajeevkumar/code/sale-coach/frontend
npm install
npm start
```

Frontend will run on: http://localhost:3000

## Key Features

### Design Tab
- Configure Sales Coach SCIP agents (Supervisor, Power Plan, Strategic Planning, etc.)
- Select service tier (Basic, Standard, Premium)
- Choose deployment type (Cloud API vs On-Premise)
- Configure LLM models filtered by tier and deployment type
- Set memory systems, tools, and data sources
- Real-time cost estimation per agent

### Cost Tab
- Comprehensive cost breakdown
- Global usage metrics (tokens/user, storage/user, cost/user)
- Infrastructure costs
- LLM costs (token-based for Cloud API, GPU-based for On-Premise)
- Data source costs
- Monitoring costs
- Expandable row details with:
  - Calculation formulas
  - Cost drivers
  - Optimization tips

## Configuration Differences

### Default Settings

**qa-ai-agent:**
- Default tier: Premium
- Default deployment: Cloud API

**sale-coach:**
- Default tier: Basic
- Default deployment: Cloud API

## API Endpoints

All endpoints are the same as in qa-ai-agent, but prefixed with `/api/cost`:

- `GET /api/cost/tiers` - List all service tiers
- `GET /api/cost/tiers/{tier_id}` - Get tier details
- `GET /api/cost/tiers/{tier_id}/models?deployment_type=cloud_api|on_premise` - Get LLM models
- `POST /api/cost/calculate` - Calculate comprehensive costs
- `POST /api/cost/calculate-agent` - Calculate per-agent costs

## Dependencies

### Frontend Dependencies
- react: ^18.2.0
- react-dom: ^18.2.0
- react-scripts: 5.0.1
- lucide-react: ^0.263.1
- axios: ^1.6.0

### Backend Dependencies
- fastapi: 0.104.1
- uvicorn[standard]: 0.24.0
- pydantic: 2.5.0
- pyyaml: 6.0.1
- python-multipart: 0.0.6

## Important Notes

1. **Port Configuration**:
   - Backend: 8001
   - Frontend: 3000
   - These match the original project

2. **Data Persistence**:
   - No database integration
   - All configuration is client-side
   - No backend storage

3. **Deployment Types**:
   - Cloud API: Token-based pricing
   - On-Premise: GPU-based pricing with tier-dependent GPU count
     - Basic: 1 GPU
     - Standard: 2 GPUs
     - Premium: 4 GPUs

4. **State Management**:
   - React Context API for shared state
   - Configuration flows from Design tab to Cost tab via context

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend compiles successfully
- [ ] Design tab loads with Basic tier selected
- [ ] Can switch between service tiers
- [ ] Can toggle deployment types
- [ ] LLM models filter correctly by tier and deployment
- [ ] Cost tab shows calculations
- [ ] Can switch between Design and Cost tabs
- [ ] Global usage metrics display
- [ ] Expandable cost breakdown rows work
- [ ] API endpoints respond correctly

## Next Steps

1. Install dependencies for both frontend and backend
2. Start both services
3. Test the application at http://localhost:3000
4. Verify all features work as expected
5. Customize branding if needed

## Support

For issues or questions about this migration, refer to:
- `README.md` for setup instructions
- Original qa-ai-agent project for feature comparisons
- API documentation at http://localhost:8001/docs
