import pytest
from app.services.monte_carlo import run_monte_carlo_simulation

def test_monte_carlo_simulation():
    sle = 5000000.0
    aro = 0.85
    result = run_monte_carlo_simulation(single_loss_expectancy=sle, annualized_rate_of_occurrence=aro, iterations=5000)

    assert result["iterations"] == 5000
    assert result["mean_loss"] > 0.0
    assert result["median_loss"] >= 0.0
    assert result["p90_loss"] > 0.0
    assert result["p95_loss"] >= result["p90_loss"]
    assert result["p99_loss"] >= result["p95_loss"]

    assert len(result["bins"]) > 0
    assert len(result["frequencies"]) > 0
    assert len(result["loss_exceedance_curve"]) > 0

    # Ensure deterministic reproduction with seed
    res2 = run_monte_carlo_simulation(single_loss_expectancy=sle, annualized_rate_of_occurrence=aro, iterations=5000, seed=42)
    assert result["mean_loss"] == res2["mean_loss"]

