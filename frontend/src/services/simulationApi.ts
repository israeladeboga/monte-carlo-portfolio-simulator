
export interface SimulationRequest {
  age: number;
  retirement_age: number;
  savings: number;
  contribution: number;
  return_rate: number;
  volatility: number;
  risk_tolerance: string;
  inflation_rate: number;
  wealth_goal: number;
  num_simulations?: number;
}

export interface SimulationResponse {
  summary: {
    median: number;
    percentile_10: number;
    percentile_90: number;
    var_5: number;
    cvar_5: number;
    volatility: number;
    goal_probability: number;
    max_drawdown: number;
  };
  wealth_percentiles: Record<string, {
    p10: number;
    p50: number;
    p90: number;
  }>;
  metadata: {
    num_simulations: number;
    years: number;
  };
}

const API_BASE_URL = 'https://retirement-sim.onrender.com';

export const runSimulation = async (data: SimulationRequest): Promise<SimulationResponse> => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        // Failed to parse error response, use default message
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during simulation');
    }
  }
};
