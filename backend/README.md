# Retirement Portfolio Simulator

A Monte Carlo retirement model that projects how your savings can grow over time. It uses random market scenarios to estimate outcomes, risk levels, and the chance you hit your goal.

## What It Does

- Simulates retirement savings with 10,000+ scenarios
- Handles stocks/bonds/cash allocation
- Includes annual contributions and retirement withdrawals
- Gives stats: median outcome, 10th/90th percentiles, VaR, survival chance

## Quick Start

1. Create a virtual environment and install dependencies:
```bash
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```
2. Run the app:
```bash
./venv/bin/python app.py
```
3. Open a request tool (curl or Postman) and send to `http://127.0.0.1:5001/simulate`

The app listens on port **5001** by default. Override it with `PORT=8000 ./venv/bin/python app.py`. (Port 5000 is avoided because macOS AirPlay Receiver already uses it.)

## Simple Example

```bash
curl -X POST http://127.0.0.1:5001/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 20,
    "retirement_age": 65,
    "savings": 5000,
    "contribution": 3000
  }'
```

### Key output fields
- `median`: typical nest egg at retirement
- `percentile_10`: conservative nest egg (only 10% of runs do worse)
- `percentile_90`: strong nest egg (only 10% of runs do better)
- `probability_reaching_goal`: chance your retirement balance meets the goal
- `survival_probability`: chance the money lasts through retirement

## Optional Advanced Configuration

You can include extra fields in request JSON:
- `stock_allocation`, `bond_allocation`, `cash_allocation`
- `contribution_growth_rate`, `withdrawal_rate`
- `n_simulations` (bigger makes it more accurate; 100–100,000)

## Note

This is a learning tool, not investment advice. Real investing should include professional guidance.

---

## Example Response

`POST /simulate` returns a single `summary` object. The first group describes
your **nest egg at retirement** (the accumulation forecast); the second group
describes how that nest egg holds up through the retirement drawdown phase.

```json
{
  "summary": {
    "median": 981000,
    "percentile_10": 567000,
    "percentile_90": 1787000,
    "var_5": 490000,
    "cvar_5": 427000,
    "volatility": 536000,
    "probability_reaching_goal": 0.48,
    "survival_probability": 0.73,
    "median_final_wealth": 801000,
    "average_max_drawdown": 0.57
  }
}
```

Values above are illustrative — every run is randomized, so numbers vary
between calls. Advanced users: full API and modeling details are in the code
comments and in the sections below.

### Python Example

```python
import requests

# Your retirement plan
data = {
    "age": 20,
    "retirement_age": 65,
    "savings": 5000,
    "contribution": 3000,
    "stock_allocation": 0.8,  # 80% stocks (aggressive)
    "bond_allocation": 0.2    # 20% bonds
}

response = requests.post("http://127.0.0.1:5001/simulate", json=data)
result = response.json()

print(f"Median savings at retirement: ${result['summary']['median']:,.0f}")
print(f"Chance of reaching $1M: {result['summary']['probability_reaching_goal']*100:.0f}%")
```

## API Parameters

### Required
- `age` - Your current age
- `retirement_age` - When you want to retire
- `savings` - Money you have saved now
- `contribution` - How much you save per year

### Optional (Advanced)
- `stock_allocation` - % in stocks (0.0 to 1.0) [default: 0.6]
- `bond_allocation` - % in bonds [default: 0.3]
- `cash_allocation` - % in cash [default: 0.1]
- `contribution_growth_rate` - Annual salary increase [default: 0.03]
- `withdrawal_rate` - % withdrawn in retirement [default: 0.04]
- `n_simulations` - Number of scenarios to test [default: 10,000; range 100–100,000]
- `retirement_duration` - Years of retirement to simulate [default: 30; range 0–80]

## What Makes This Cool

### 🧮 **Monte Carlo Simulation**
Instead of guessing "you'll have X dollars," it runs thousands of "what if" scenarios with different market conditions, giving you a probability distribution of outcomes.

### 📊 **Real Market Math**
- **Lognormal returns**: Markets grow multiplicatively (not additively), so we use lognormal distributions that match real stock behavior
- **Correlations**: Stocks and bonds don't move independently - we model their relationships
- **Inflation**: Everything adjusts for rising prices over time

### 🎯 **Advanced Risk Analysis**
- **VaR (Value at Risk)**: "In the worst 5% of scenarios, you might have this much" - industry-standard risk metric
- **Survival Probability**: Chance your money lasts through retirement
- **Max Drawdown**: Biggest drop you'd experience

### 🔄 **Dynamic Planning**
- Contributions grow with your salary increases
- Withdrawals follow the "4% rule" — a fixed real amount set at retirement and indexed to inflation each year
- Multi-asset portfolios with realistic return assumptions
- Full retirement phase simulation (not just saving)

### ⚡ **Performance & Scale**
- **10,000+ simulations** per request for statistical accuracy
- **Fast NumPy computations** handle complex calculations quickly
- **Production-ready API** with proper error handling and validation

## Understanding Results

Balance figures are measured **at retirement** (end of the accumulation phase), except where noted.

| Metric | What It Means |
|--------|---------------|
| `median` | Middle nest egg at retirement — 50% do better, 50% worse |
| `percentile_10` | Conservative nest egg — only 10% chance of doing worse |
| `percentile_90` | Strong nest egg — only 10% chance of doing better |
| `var_5` | Value at Risk — the 5th-percentile (worst-5%) retirement balance |
| `cvar_5` | Expected balance *within* that worst-5% tail |
| `probability_reaching_goal` | % chance your retirement balance meets the goal |
| `survival_probability` | % chance the money lasts the full retirement horizon |
| `median_final_wealth` | Median wealth remaining at the end of retirement |
| `average_max_drawdown` | Average worst peak-to-trough drop over the lifetime |

## Project Structure

```
retirement-sim/
├── app.py              # Main Flask app with simulation logic
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── .gitignore         # Files to ignore in git
```

## Technical Details

### Asset Assumptions (Based on Historical Data)
- **Stocks**: 8% average annual return, 15% volatility (S&P 500 historical averages)
- **Bonds**: 4% average annual return, 8% volatility (US Treasury bonds)
- **Cash**: 2% average annual return, 1% volatility (money market funds)
- **Correlation**: Stocks/bonds correlation coefficient of 0.3 (realistic diversification)

### Simulation Engine
- **Vectorized across simulations**: every scenario advances together as NumPy arrays; the only Python loop is over years (tens of iterations), not over the thousands of simulations
- **Correlated sampling**: multi-asset log returns are drawn from a multivariate normal built from the asset volatilities and the stock/bond correlation
- **Geometric returns**: `wealth *= exp(log_return)` for multiplicative growth
- **Stochastic inflation**: sampled per year and used to index retirement withdrawals
- **Performance**: ~10,000 simulations in well under a second (`n_simulations` is capped at 100,000)

### API Architecture
- **Flask REST API**: Clean endpoints with JSON request/response
- **Input validation**: Type checking, bounds validation, allocation constraints
- **Error handling**: Proper HTTP status codes (400, 500) with descriptive messages
- **Logging**: Structured logging for debugging and monitoring
- **Health checks**: `/health` endpoint for deployment monitoring

### Mathematical Models

**Lognormal Returns Formula:**
```
log_return = Normal(μ - σ²/2, σ)  # Drift-adjusted for lognormal
wealth = wealth * exp(log_return)  # Multiplicative growth
```

**Multivariate Correlations:**
```
Σ = covariance_matrix  # From volatilities and correlations
returns = multivariate_normal(means, Σ)  # Correlated sampling
```

**Retirement Withdrawals (4% rule):**
```
withdrawal_0 = withdrawal_rate * balance_at_retirement  # fixed real amount
withdrawal_t = withdrawal_{t-1} * (1 + inflation_t)     # indexed to inflation
wealth_t     = max(wealth_t - withdrawal_t, 0)          # depletes to zero, never negative
```

**Risk Metrics:**
```
# VaR/CVaR/goal are measured on the balance at retirement:
VaR_5    = percentile(retirement_wealths, 5)              # 5th percentile
CVaR_5   = mean(retirement_wealths[retirement_wealths ≤ VaR_5])  # tail expectation
# Survival is measured on the balance at the end of the retirement horizon:
Survival = mean(final_wealths > 0)  # probability the money lasts
```

## Important Notes

⚠️ **This is for learning/planning only** - Not financial advice!
- Assumes historical market patterns continue
- Doesn't include taxes, fees, or market crashes
- Real retirement planning needs professional help

## Future Ideas

- Web interface (React/Vue)
- More asset classes (real estate, crypto)
- Tax calculations
- Mobile app
- Historical market data integration

---

Built by Israel Adeboga - Exploring Python, finance, and probabilistic modeling!
