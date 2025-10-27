# Quick Start Guide - Sales AI Agent

## Project Status ✅

All dependencies installed and ready to run!

## Start the Application

### Terminal 1: Start Backend

```bash
cd /Users/rajeevkumar/code/sale-coach/backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend will be available at: http://localhost:8001
API docs available at: http://localhost:8001/docs

### Terminal 2: Start Frontend

```bash
cd /Users/rajeevkumar/code/sale-coach/frontend
npm start
```

Frontend will be available at: http://localhost:3000

## Features

### Design Tab
- Configure Sales Coach AI agents (SCIP framework)
- Select service tier: Basic (default), Standard, or Premium
- Choose deployment type: Cloud API or On-Premise
- LLM models automatically filtered by tier and deployment type
- Configure memory systems, tools, and data sources
- Real-time per-agent cost estimation

### Cost Tab
- Comprehensive cost breakdown
- Deployment-aware pricing:
  - **Cloud API**: Token-based pricing
  - **On-Premise**: GPU-based pricing
    - Basic tier: 1 GPU
    - Standard tier: 2 GPUs
    - Premium tier: 4 GPUs
- Detailed formulas, cost drivers, and optimization tips
- Expandable rows for in-depth analysis

## Key Improvements from qa-ai-agent

1. ✅ Default tier changed to Basic (more practical starting point)
2. ✅ GPU-based pricing for On-Premise deployments
3. ✅ Tier-dependent GPU allocation
4. ✅ Simplified 2-tab interface
5. ✅ Standalone project focused on Sales Coach only

## Testing the Application

1. Start both backend and frontend
2. Open http://localhost:3000
3. In Design tab:
   - Select "On-Premise" deployment
   - Choose "Premium" tier
   - Notice LLM models filtered for on-premise deployment
   - Configure an agent and see GPU-based cost estimate
4. Switch to Cost tab:
   - See detailed breakdown with GPU costs
   - Expand rows to see calculation formulas
   - Compare with Cloud API deployment

## Troubleshooting

### Backend won't start
- Ensure Python dependencies installed: `pip install -r requirements.txt`
- Check port 8001 is not in use: `lsof -i :8001`

### Frontend won't start
- Ensure dependencies installed: `npm install`
- Check port 3000 is not in use: `lsof -i :3000`

### Import errors
- Verify you're in the correct directory
- Check all config files are present in `backend/app/config/`

## Next Steps

1. Customize service tiers in `backend/app/config/service_tiers.py`
2. Update pricing in `backend/app/config/pricing.yaml`
3. Add more LLM models or GPU types as needed
4. Customize UI styling in React components

For detailed migration information, see MIGRATION_GUIDE.md
