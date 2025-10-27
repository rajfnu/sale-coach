import { createContext, useContext } from 'react';

const AppContext = createContext({
  salesCoachConfig: {
    globalParams: {
      num_users: 100,
      assessments_per_user_per_month: 40,
      service_tier: 'basic'
    },
    agentConfigs: {},
    lastUpdated: null
  },
  setSalesCoachConfig: () => {},
  updateSalesCoachConfig: () => {},
  getSalesCoachCostParams: () => {}
});

export const useAppContext = () => useContext(AppContext);

export default AppContext;
