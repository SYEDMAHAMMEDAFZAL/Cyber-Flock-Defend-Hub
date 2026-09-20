import os
import sys

base_dir = r"C:\Users\asifs\.gemini\antigravity\scratch\cyber-flock-defense-hub"
services_dir = os.path.join(base_dir, "backend", "app", "services")
os.makedirs(services_dir, exist_ok=True)
print(f"Target services dir: {services_dir}")
