"""
Validate the Monte Carlo engine against closed-form results, and benchmark the
vectorized implementation against an equivalent per-path Python loop.

Run:  python scripts/validate_and_benchmark.py
Requires only numpy (plus the app module on the path).
"""
import os
import sys
import time
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app import simulate_portfolio  # noqa: E402


def naive_loop(age, retirement_age, savings, contribution, n_simulations,
               retirement_duration=30, withdrawal_rate=0.04, contribution_growth_rate=0.03,
               inflation_rate=0.03, inflation_vol=0.02,
               stock_allocation=0.6, bond_allocation=0.3, cash_allocation=0.1,
               stock_return=0.08, stock_vol=0.15, bond_return=0.04, bond_vol=0.08,
               cash_return=0.02, cash_vol=0.01, correlation_stock_bond=0.3, seed=0):
    """Reference implementation: one Python loop per path (pre-vectorization style)."""
    rng = np.random.default_rng(seed)
    acc = retirement_age - age
    total = acc + retirement_duration
    drift = [stock_return - stock_vol**2 / 2, bond_return - bond_vol**2 / 2, cash_return - cash_vol**2 / 2]
    vols = np.array([stock_vol, bond_vol, cash_vol])
    corr = np.array([[1, correlation_stock_bond, 0], [correlation_stock_bond, 1, 0], [0, 0, 1]])
    cov = np.outer(vols, vols) * corr
    finals = np.empty(n_simulations)
    for i in range(n_simulations):
        wealth, contrib, wr = savings, contribution, 0.0
        for year in range(total):
            if year == acc:
                wr = wealth * withdrawal_rate
            lr = rng.multivariate_normal(drift, cov)
            plr = stock_allocation * lr[0] + bond_allocation * lr[1] + cash_allocation * lr[2]
            wealth *= np.exp(plr)
            if year < acc:
                wealth += contrib
                contrib *= (1 + contribution_growth_rate)
            else:
                wealth = max(wealth - wr, 0.0)
                wr *= (1 + rng.normal(inflation_rate, inflation_vol))
        finals[i] = wealth
    return finals


def benchmark(n=10000):
    params = dict(age=20, retirement_age=65, savings=5000, contribution=3000, n_simulations=n)
    t0 = time.time(); simulate_portfolio(**params, seed=0); t_vec = time.time() - t0
    t0 = time.time(); naive_loop(**params, seed=0);          t_loop = time.time() - t0
    print(f"\n[benchmark] {n:,} scenarios")
    print(f"  loop-based : {t_loop*1000:8.1f} ms")
    print(f"  vectorized : {t_vec*1000:8.1f} ms")
    print(f"  speedup    : {t_loop/t_vec:6.1f}x  ({(1-t_vec/t_loop)*100:.1f}% runtime reduction)")


def validate_gbm(n=100000):
    """100% stock, no contributions, no withdrawals => terminal wealth is lognormal."""
    W0, mu, sig, T = 100000.0, 0.08, 0.15, 30
    s = simulate_portfolio(age=35, retirement_age=65, savings=W0, contribution=0.0,
                           n_simulations=n, retirement_duration=0,
                           stock_allocation=1.0, bond_allocation=0.0, cash_allocation=0.0,
                           stock_return=mu, stock_vol=sig, seed=123)["summary"]
    m, sd = (mu - 0.5 * sig**2) * T, sig * np.sqrt(T)
    q = lambda z: W0 * np.exp(m + sd * z)  # analytic lognormal quantile
    rows = [("median", s["median"], q(0.0)),
            ("p10", s["percentile_10"], q(-1.2815515595)),
            ("p90", s["percentile_90"], q(+1.2815515595)),
            ("var_5", s["var_5"], q(-1.6448536270))]
    print(f"\n[validation] GBM terminal wealth vs closed-form lognormal ({n:,} paths)")
    worst = 0.0
    for name, sim, ana in rows:
        err = abs(sim - ana) / ana * 100
        worst = max(worst, err)
        print(f"  {name:7s} sim={sim:13,.0f}  analytic={ana:13,.0f}  err={err:4.2f}%")
    print(f"  max relative error: {worst:.2f}%  ->  {'PASS' if worst < 2.0 else 'CHECK'}")


if __name__ == "__main__":
    validate_gbm()
    benchmark()
