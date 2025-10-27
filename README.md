# Sales AI Agent

AI-Powered Sales Coach Design & Cost Calculator

## Project Structure

```
sale-coach/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── App.js        # Main app with 2 tabs: Design & Cost
│   │   ├── Design.js     # Sales Coach Agent Design tab
│   │   ├── Cost.js       # Cost Calculator tab
│   │   └── AppContext.js # Shared state management
│   ├── public/
│   └── package.json
└── backend/           # FastAPI backend
    ├── app/
    │   ├── main.py           # FastAPI application
    │   ├── routers/          # API endpoints
    │   └── config/           # Configuration files
    └── requirements.txt
```

## Features

### Design Tab
- Configure Sales Coach AI agents (SCIP framework)
- Set up service tiers (Basic, Standard, Premium)
- Configure LLM models (Cloud API or On-Premise)
- Design multi-agent architecture
- Configure memory systems, tools, and data sources

### Cost Tab
- Real-time cost calculation
- Deployment-type aware pricing (Cloud API vs On-Premise)
- Tier-based infrastructure costs
- GPU allocation for on-premise deployments
- Detailed cost breakdowns with formulas

## Getting Started

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at http://localhost:8001

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The application will open at http://localhost:3000

## Technology Stack

- **Frontend**: React 18, Lucide Icons, Axios
- **Backend**: FastAPI, Pydantic, Python 3.9+
- **Styling**: Tailwind CSS classes

## API Endpoints

- `GET /` - API root
- `GET /health` - Health check
- `GET /api/cost/tiers` - Get available service tiers
- `GET /api/cost/tiers/{tier_id}/models` - Get LLM models for a tier
- `POST /api/cost/calculate` - Calculate comprehensive costs
- `POST /api/cost/calculate-agent` - Calculate per-agent costs

## License

Proprietary - All rights reserved
