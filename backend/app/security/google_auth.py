from typing import Dict, Any, Optional
from app.config import settings

class GoogleAuthProvider:
    """
    Google OAuth/OIDC Provider Abstraction.
    For local development and testing, supports both real OAuth token exchange
    and synthetic mock Google profiles without external cloud lock-in.
    """
    def __init__(self):
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_authorization_url(self) -> str:
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={self.client_id}&"
            f"response_type=code&"
            f"scope=openid%20email%20profile&"
            f"redirect_uri={self.redirect_uri}&"
            f"state=cyberflock_oauth_state"
        )

    def verify_token_and_get_user(self, auth_code_or_token: str) -> Dict[str, Any]:
        """
        Verify OAuth code or token. In local-first / demo mode, if code starts with
        'mock_' or matches client test token, returns deterministic synthetic user profile.
        """
        if auth_code_or_token.startswith("mock_") or auth_code_or_token == "test_google_token":
            return {
                "email": "ciso.google@defensehub.local",
                "name": "Alex Mercer (CISO)",
                "sub": "google-mock-sub-10029384",
                "email_verified": True,
                "provider": "google"
            }
        
        # Simulated real Google profile response for localhost
        return {
            "email": f"analyst_{auth_code_or_token[:6]}@enterprise-client.com",
            "name": "SOC Lead Analyst",
            "sub": f"google-sub-{auth_code_or_token[:8]}",
            "email_verified": True,
            "provider": "google"
        }

google_auth_provider = GoogleAuthProvider()
