"""
Cyber Flock Defense Hub - ML Risk Prediction & Explainability Engine
Utilizes XGBoost (with Scikit-Learn fallback) to predict breach likelihood and
enterprise financial impact, with feature importance explanations for CISO insights.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "artifacts")
os.makedirs(MODEL_DIR, exist_ok=True)
CLASSIFIER_PATH = os.path.join(MODEL_DIR, "breach_classifier.joblib")
REGRESSOR_PATH = os.path.join(MODEL_DIR, "loss_regressor.joblib")

FEATURE_NAMES = [
    "asset_criticality_factor",
    "asset_value",
    "cvss_score",
    "epss_score",
    "active_controls_count",
    "control_coverage_pct",
    "siem_alert_volume",
    "edr_threat_detections",
    "pam_anomalies",
    "is_cloud_asset",
    "is_public_facing"
]

FEATURE_DESCRIPTIONS = {
    "cvss_score": "Known vulnerability exploit severity rating",
    "epss_score": "Empirical probability of active in-the-wild exploitation",
    "control_coverage_pct": "Enterprise security control enforcement across perimeter",
    "asset_criticality_factor": "Business criticality and operational reliance",
    "edr_threat_detections": "Endpoint heuristic anomalies and unmitigated process alerts",
    "siem_alert_volume": "Aggregated security event telemetry correlation velocity",
    "pam_anomalies": "Privileged credential access misuse and permission escalations",
    "active_controls_count": "Active defense layers (EDR, MFA, WAF, Zero-Trust)",
    "is_public_facing": "Direct internet exposure to external reconnaissance",
    "asset_value": "Underlying asset replacement and liability value",
    "is_cloud_asset": "Cloud infrastructure and shared responsibility boundary"
}

class CyberMLRiskPredictor:
    def __init__(self):
        self.classifier = None
        self.regressor = None
        self._load_or_train_models()

    def _generate_synthetic_training_data(self, n_samples: int = 1500):
        """Generates realistic cybersecurity telemetry data to train baseline models."""
        np.random.seed(42)
        
        asset_crit = np.random.choice([1.0, 1.5, 2.0, 2.5, 3.0], size=n_samples, p=[0.2, 0.3, 0.25, 0.15, 0.1])
        asset_val = np.random.lognormal(mean=14.5, sigma=1.0, size=n_samples) # values in range ~1M - 50M INR
        cvss = np.random.uniform(2.0, 9.8, size=n_samples)
        epss = np.random.beta(a=1.5, b=4.0, size=n_samples) # right-skewed exploit prob
        controls_count = np.random.randint(1, 10, size=n_samples)
        control_cov = np.random.uniform(30.0, 98.0, size=n_samples)
        siem_vol = np.random.poisson(lam=12, size=n_samples)
        edr_alerts = np.random.poisson(lam=3, size=n_samples)
        pam_anom = np.random.poisson(lam=1.5, size=n_samples)
        is_cloud = np.random.binomial(n=1, p=0.7, size=n_samples)
        is_public = np.random.binomial(n=1, p=0.45, size=n_samples)
        
        # Risk score formula for synthetic breach outcome
        risk_index = (
            (cvss / 10.0) * 0.35 +
            epss * 0.25 +
            (is_public * 0.15) +
            (edr_alerts / 10.0) * 0.15 -
            (control_cov / 100.0) * 0.30 -
            (controls_count / 10.0) * 0.10
        )
        breach_prob = 1.0 / (1.0 + np.exp(-5.0 * (risk_index - 0.25)))
        breach_label = np.random.binomial(n=1, p=np.clip(breach_prob, 0.05, 0.95))
        
        # Loss formula
        loss = asset_val * np.random.uniform(0.15, 0.70, size=n_samples) * breach_label * (cvss / 10.0)
        
        X = pd.DataFrame({
            "asset_criticality_factor": asset_crit,
            "asset_value": asset_val,
            "cvss_score": cvss,
            "epss_score": epss,
            "active_controls_count": controls_count,
            "control_coverage_pct": control_cov,
            "siem_alert_volume": siem_vol,
            "edr_threat_detections": edr_alerts,
            "pam_anomalies": pam_anom,
            "is_cloud_asset": is_cloud,
            "is_public_facing": is_public
        })
        return X, breach_label, loss

    def _load_or_train_models(self):
        """Loads cached models or fits high-accuracy estimators."""
        if os.path.exists(CLASSIFIER_PATH) and os.path.exists(REGRESSOR_PATH):
            try:
                self.classifier = joblib.load(CLASSIFIER_PATH)
                self.regressor = joblib.load(REGRESSOR_PATH)
                return
            except Exception:
                pass

        X, y_breach, y_loss = self._generate_synthetic_training_data()
        
        if XGB_AVAILABLE:
            self.classifier = xgb.XGBClassifier(
                n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42, eval_metric="logloss"
            )
            self.regressor = xgb.XGBRegressor(
                n_estimators=100, max_depth=4, learning_rate=0.08, random_state=42
            )
        else:
            self.classifier = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
            self.regressor = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)

        self.classifier.fit(X, y_breach)
        self.regressor.fit(X, y_loss)

        joblib.dump(self.classifier, CLASSIFIER_PATH)
        joblib.dump(self.regressor, REGRESSOR_PATH)

    def predict(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts breach likelihood, projected impact, and explainable feature weights."""
        df = pd.DataFrame([{col: feature_data.get(col, 0.0) for col in FEATURE_NAMES}])
        
        # Classification
        breach_prob = float(self.classifier.predict_proba(df)[0][1])
        
        # Regression for projected financial loss
        predicted_loss = max(0.0, float(self.regressor.predict(df)[0]))
        
        # Determine risk tier
        if breach_prob >= 0.75:
            tier = "CRITICAL"
        elif breach_prob >= 0.50:
            tier = "HIGH"
        elif breach_prob >= 0.25:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # Feature importance extraction
        importances = self.classifier.feature_importances_
        feature_importance_list = []
        for name, imp in zip(FEATURE_NAMES, importances):
            feature_importance_list.append({
                "feature": name,
                "importance": round(float(imp), 4),
                "description": FEATURE_DESCRIPTIONS.get(name, name)
            })
            
        feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

        return {
            "breach_probability": round(breach_prob, 3),
            "predicted_financial_loss": round(predicted_loss, 2),
            "risk_tier": tier,
            "feature_importance": feature_importance_list[:6], # Top 6 drivers
            "model_type": "XGBoost Machine Learning" if XGB_AVAILABLE else "GradientBoosted / Random Forest"
        }

# Global singleton
ml_predictor = CyberMLRiskPredictor()

def predict_cyber_risk(features: Dict[str, Any]) -> Dict[str, Any]:
    return ml_predictor.predict(features)

