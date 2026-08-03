# Import necessary libraries for web framework and numerical computations
from flask import Flask, request, jsonify
import numpy as np
import os
import logging

# Initialize Flask application
app = Flask(__name__)

# Configure logging for production debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure environment-based settings
FLASK_ENV = os.getenv('FLASK_ENV', 'production')
app.debug = (FLASK_ENV == 'development')

# Constants for validation
MIN_AGE = 18
MAX_AGE = 120
MIN_SAVINGS = 0
MAX_SAVINGS = 100_000_000
MIN_CONTRIBUTION = 0
MAX_CONTRIBUTION = 1_000_000
MIN_ALLOCATION = 0.0
MAX_ALLOCATION = 1.0
MIN_SIMULATIONS = 100
MAX_SIMULATIONS = 100_000  # Caps memory: the return array is n_sims x years x 3 floats
MIN_RETIREMENT_DURATION = 0
MAX_RETIREMENT_DURATION = 80


def simulate_portfolio(age, retirement_age, savings, contribution,
                       goal=1_000_000, n_simulations=10000, inflation_rate=0.03, inflation_vol=0.02,
                       stock_allocation=0.6, bond_allocation=0.3, cash_allocation=0.1,
                       stock_return=0.08, stock_vol=0.15, bond_return=0.04, bond_vol=0.08,
                       cash_return=0.02, cash_vol=0.01, correlation_stock_bond=0.3,
                       contribution_growth_rate=0.03, withdrawal_rate=0.04, retirement_duration=30):
    """
    Simulate a retirement portfolio using a vectorized Monte Carlo method.

    The model runs every scenario at once with NumPy, stepping through time one
    year at a time (the only loop is over years - tens of them - not over the
    thousands of simulations). It incorporates:
    - Lognormal, correlated multi-asset returns (multiplicative growth)
    - An accumulation phase with contributions that grow each year
    - A retirement phase using the "4% rule": a fixed real withdrawal set at
      retirement and indexed to realized inflation each year thereafter

    Two distinct quantities are reported:
    - The nest egg *at retirement* (end of the accumulation phase). The
      distribution stats and the goal probability are measured here, because
      this is the number you actually plan toward.
    - The wealth *at the end of the retirement horizon*, which drives the
      survival probability (did the money last) and the max-drawdown figure.

    Parameters:
    - age: Current age
    - retirement_age: Target retirement age
    - savings: Current savings amount
    - contribution: Initial annual contribution amount
    - goal: Target retirement savings amount (default: $1M)
    - n_simulations: Number of Monte Carlo simulations (default: 10,000)
    - inflation_rate: Expected annual inflation rate (default: 3%)
    - inflation_vol: Volatility of inflation (default: 2%)
    - stock_allocation: Fraction allocated to stocks (default: 60%)
    - bond_allocation: Fraction allocated to bonds (default: 30%)
    - cash_allocation: Fraction allocated to cash (default: 10%)
    - stock_return: Expected annual return for stocks (default: 8%)
    - stock_vol: Volatility for stocks (default: 15%)
    - bond_return: Expected annual return for bonds (default: 4%)
    - bond_vol: Volatility for bonds (default: 8%)
    - cash_return: Expected annual return for cash (default: 2%)
    - cash_vol: Volatility for cash (default: 1%)
    - correlation_stock_bond: Correlation between stock and bond returns (default: 0.3)
    - contribution_growth_rate: Annual growth rate of contributions (default: 3%)
    - withdrawal_rate: First-year withdrawal as a fraction of the retirement
      balance; the 4% rule (default: 4%)
    - retirement_duration: Years to simulate post-retirement (default: 30)

    Returns:
    Dictionary with summary statistics from all simulations.
    """
    # Coerce numeric types up front (JSON may deliver ints or numeric strings)
    age = int(age)
    retirement_age = int(retirement_age)
    savings = float(savings)
    contribution = float(contribution)
    n_simulations = int(n_simulations)
    retirement_duration = int(retirement_duration)

    # Calculate total simulation years (accumulation + retirement phases)
    accumulation_years = retirement_age - age
    total_years = accumulation_years + retirement_duration

    # Prepare multi-asset return parameters for lognormal distribution.
    # For lognormal returns the log-space mean is drift = expected_return - vol^2/2.
    drift = np.array([
        stock_return - stock_vol ** 2 / 2,
        bond_return - bond_vol ** 2 / 2,
        cash_return - cash_vol ** 2 / 2,
    ])

    # Build covariance matrix for correlated asset returns
    vols = np.array([stock_vol, bond_vol, cash_vol])
    corr_matrix = np.array([
        [1.0, correlation_stock_bond, 0.0],
        [correlation_stock_bond, 1.0, 0.0],
        [0.0, 0.0, 1.0],
    ])
    cov_matrix = np.outer(vols, vols) * corr_matrix

    # Portfolio allocation weights, applied to the per-asset log returns
    weights = np.array([stock_allocation, bond_allocation, cash_allocation])

    # --- Pre-sample every random draw at once (vectorized across simulations) ---
    # Correlated asset log returns, shape (n_simulations, total_years, 3)
    asset_log_returns = np.random.multivariate_normal(
        drift, cov_matrix, size=(n_simulations, total_years)
    )
    # Allocation-weighted portfolio log return per year, shape (n_simulations, total_years)
    portfolio_log_returns = asset_log_returns @ weights
    # Multiplicative growth factor per year
    growth_factors = np.exp(portfolio_log_returns)

    # Stochastic annual inflation, used to index retirement withdrawals
    inflation = np.random.normal(inflation_rate, inflation_vol, size=(n_simulations, total_years))

    # --- Per-simulation state (one entry per scenario) ---
    wealth = np.full(n_simulations, savings, dtype=float)
    peak = np.full(n_simulations, savings, dtype=float)
    max_drawdown = np.zeros(n_simulations)
    contribution_current = np.full(n_simulations, contribution, dtype=float)
    withdrawal_amount = np.zeros(n_simulations)
    wealth_at_retirement = None  # captured at the accumulation/retirement boundary

    # Step through time. The loop is over years (tens), while every operation
    # inside acts on all n_simulations scenarios at once.
    for year in range(total_years):
        # At the retirement boundary, lock in the nest egg and set the first
        # year's withdrawal to `withdrawal_rate` of the balance at retirement.
        if year == accumulation_years:
            wealth_at_retirement = wealth.copy()
            withdrawal_amount = wealth * withdrawal_rate

        # Apply this year's market growth (multiplicative for lognormal returns)
        wealth = wealth * growth_factors[:, year]

        if year < accumulation_years:
            # Accumulation phase: add this year's contribution, then grow it
            wealth = wealth + contribution_current
            contribution_current = contribution_current * (1 + contribution_growth_rate)
        else:
            # Retirement phase: withdraw a fixed real amount (4% rule), floored
            # at zero, then index that amount to this year's realized inflation.
            wealth = np.maximum(wealth - withdrawal_amount, 0.0)
            withdrawal_amount = withdrawal_amount * (1 + inflation[:, year])

        # Track peak wealth and the largest peak-to-trough drawdown seen so far
        peak = np.maximum(peak, wealth)
        drawdown = np.where(peak > 0, (peak - wealth) / peak, 0.0)
        max_drawdown = np.maximum(max_drawdown, drawdown)

    # If there is no retirement phase, the nest egg is simply the final wealth
    if wealth_at_retirement is None:
        wealth_at_retirement = wealth

    final_wealth = wealth
    survivals = final_wealth > 0

    # 5th-percentile threshold, reused for VaR and CVaR (tail expectation)
    var_5_level = np.percentile(wealth_at_retirement, 5)

    # Calculate comprehensive risk and return metrics
    return {
        "summary": {
            # --- Nest egg at retirement: the accumulation forecast ---
            # Central tendency: median balance at retirement (50th percentile)
            "median": float(np.median(wealth_at_retirement)),

            # Range of outcomes: 10th and 90th percentiles at retirement
            "percentile_10": float(np.percentile(wealth_at_retirement, 10)),
            "percentile_90": float(np.percentile(wealth_at_retirement, 90)),

            # Value at Risk: 5th percentile - the worst 5% of retirement outcomes
            "var_5": float(var_5_level),

            # Conditional VaR: expected balance within that worst 5% tail
            "cvar_5": float(np.mean(wealth_at_retirement[wealth_at_retirement <= var_5_level])),

            # Volatility: standard deviation of the retirement balance
            "volatility": float(np.std(wealth_at_retirement)),

            # Success probability: chance the retirement balance meets the goal
            "probability_reaching_goal": float(np.mean(wealth_at_retirement >= goal)),

            # --- Durability through the retirement drawdown phase ---
            # Survival probability: chance the money lasts the full horizon
            "survival_probability": float(np.mean(survivals)),

            # Median wealth remaining at the end of the retirement horizon
            "median_final_wealth": float(np.median(final_wealth)),

            # Average maximum drawdown experienced across the full lifetime
            "average_max_drawdown": float(np.mean(max_drawdown)),
        }
    }

# Health check endpoint for load balancers and monitoring
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return jsonify({"status": "healthy", "service": "retirement-simulator"}), 200


def validate_input(data):
    """
    Validate portfolio simulation input parameters.
    Returns tuple: (is_valid: bool, error_message: str or None)
    """
    try:
        if not isinstance(data, dict):
            return False, "Request body must be a JSON object"

        # Required fields
        required = ['age', 'retirement_age', 'savings', 'contribution']
        for field in required:
            if field not in data:
                return False, f"Missing required field: {field}"

        age = float(data['age'])
        retirement_age = float(data['retirement_age'])
        savings = float(data['savings'])
        contribution = float(data['contribution'])

        # Validate age parameters
        if not (MIN_AGE <= age <= MAX_AGE):
            return False, f"Age must be between {MIN_AGE} and {MAX_AGE}"
        if not (age < retirement_age <= MAX_AGE):
            return False, f"Retirement age must be greater than current age and <= {MAX_AGE}"

        # Validate financial parameters
        if not (MIN_SAVINGS <= savings <= MAX_SAVINGS):
            return False, f"Savings must be between {MIN_SAVINGS} and {MAX_SAVINGS}"
        if not (MIN_CONTRIBUTION <= contribution <= MAX_CONTRIBUTION):
            return False, f"Contribution must be between {MIN_CONTRIBUTION} and {MAX_CONTRIBUTION}"

        # Validate optional allocations if provided
        if 'stock_allocation' in data or 'bond_allocation' in data or 'cash_allocation' in data:
            stock_alloc = float(data.get('stock_allocation', 0.6))
            bond_alloc = float(data.get('bond_allocation', 0.3))
            cash_alloc = float(data.get('cash_allocation', 0.1))

            for alloc in [stock_alloc, bond_alloc, cash_alloc]:
                if not (MIN_ALLOCATION <= alloc <= MAX_ALLOCATION):
                    return False, "Allocations must be between 0 and 1"

            total_allocation = stock_alloc + bond_alloc + cash_alloc
            if not (0.99 <= total_allocation <= 1.01):  # Allow 1% tolerance for floating-point
                return False, f"Allocations must sum to 1.0 (current sum: {total_allocation:.2f})"

        # Validate optional simulation controls if provided
        if 'n_simulations' in data:
            n_sims = int(data['n_simulations'])
            if not (MIN_SIMULATIONS <= n_sims <= MAX_SIMULATIONS):
                return False, f"n_simulations must be between {MIN_SIMULATIONS} and {MAX_SIMULATIONS}"
        if 'retirement_duration' in data:
            retirement_duration = int(data['retirement_duration'])
            if not (MIN_RETIREMENT_DURATION <= retirement_duration <= MAX_RETIREMENT_DURATION):
                return False, (f"retirement_duration must be between "
                               f"{MIN_RETIREMENT_DURATION} and {MAX_RETIREMENT_DURATION}")

        return True, None

    except (ValueError, TypeError) as e:
        return False, f"Invalid parameter type: {str(e)}"


# API endpoint to handle portfolio simulation requests
@app.route('/simulate', methods=['POST'])
def simulate():
    """Portfolio simulation endpoint.

    POST body (JSON):
    - age (required): Current age in years
    - retirement_age (required): Target retirement age
    - savings (required): Current savings in dollars
    - contribution (required): Annual contribution in dollars
    - All other parameters are optional with sensible defaults

    Returns: JSON with simulation statistics
    """
    try:
        # Parse JSON request
        if not request.is_json:
            logger.warning("Non-JSON request received")
            return jsonify({"error": "Content-Type must be application/json"}), 400

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Request body must be valid JSON"}), 400

        # Validate input
        is_valid, error_msg = validate_input(data)
        if not is_valid:
            logger.warning(f"Invalid input: {error_msg}")
            return jsonify({"error": error_msg}), 400

        # Run simulation with user-provided parameters (use defaults for optional fields)
        result = simulate_portfolio(
            age=data['age'],
            retirement_age=data['retirement_age'],
            savings=data['savings'],
            contribution=data['contribution'],
            goal=data.get('goal', 1_000_000),
            n_simulations=data.get('n_simulations', 10000),
            inflation_rate=data.get('inflation_rate', 0.03),
            inflation_vol=data.get('inflation_vol', 0.02),
            stock_allocation=data.get('stock_allocation', 0.6),
            bond_allocation=data.get('bond_allocation', 0.3),
            cash_allocation=data.get('cash_allocation', 0.1),
            stock_return=data.get('stock_return', 0.08),
            stock_vol=data.get('stock_vol', 0.15),
            bond_return=data.get('bond_return', 0.04),
            bond_vol=data.get('bond_vol', 0.08),
            cash_return=data.get('cash_return', 0.02),
            cash_vol=data.get('cash_vol', 0.01),
            correlation_stock_bond=data.get('correlation_stock_bond', 0.3),
            contribution_growth_rate=data.get('contribution_growth_rate', 0.03),
            withdrawal_rate=data.get('withdrawal_rate', 0.04),
            retirement_duration=data.get('retirement_duration', 30)
        )

        # Return simulation results as JSON response
        logger.info(f"Simulation completed for age {data['age']} -> {data['retirement_age']}")
        return jsonify(result), 200

    except Exception as e:
        # Catch unexpected errors
        logger.error(f"Simulation error: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors."""
    return jsonify({"error": "Method not allowed"}), 405


# Run the Flask application with environment-based configuration
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # 5000 is taken by AirPlay Receiver on macOS
    host = os.getenv('HOST', '127.0.0.1')
    logger.info(f"Starting retirement simulator on {host}:{port} (ENV: {FLASK_ENV})")
    app.run(host=host, port=port, debug=app.debug)
