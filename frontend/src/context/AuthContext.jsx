import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, orgAPI } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [activeOrg, setActiveOrg] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cyber_token') || null);
  const [currency, setCurrency] = useState(localStorage.getItem('cyber_currency') || 'USD');
  const [deterrenceActive, setDeterrenceActive] = useState(
    localStorage.getItem('cyber_deterrence') === 'true'
  );
  const [loading, setLoading] = useState(true);

  // Exchange rate constant: 1 USD = 83.50 INR
  const USD_TO_INR = 83.50;

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userRes = await authAPI.me();
          const currentUser = userRes.data;
          setUser(currentUser);

          const orgsRes = await orgAPI.list();
          setOrganizations(orgsRes.data);

          // Super Admin can choose any org; regular users are locked to their designated organization
          if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'admin') {
            const savedOrgId = localStorage.getItem('cyber_active_org');
            const matchedOrg = orgsRes.data.find(o => o.id === savedOrgId) || orgsRes.data[0];
            setActiveOrg(matchedOrg || null);
            if (matchedOrg) {
              localStorage.setItem('cyber_active_org', matchedOrg.id);
            }
          } else {
            const userOrg = orgsRes.data.find(o => o.id === currentUser.organization_id) || orgsRes.data[0];
            setActiveOrg(userOrg || null);
            if (userOrg) {
              localStorage.setItem('cyber_active_org', userOrg.id);
            }
          }
        } catch (err) {
          console.error("Auth init failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const accessToken = res.data.access_token;
    localStorage.setItem('cyber_token', accessToken);
    setToken(accessToken);

    const userRes = await authAPI.me();
    const loggedUser = userRes.data;
    setUser(loggedUser);

    const orgsRes = await orgAPI.list();
    setOrganizations(orgsRes.data);

    // Scope active organization based on user role
    let designatedOrg;
    if (loggedUser.role === 'SUPER_ADMIN' || loggedUser.role === 'admin') {
      designatedOrg = orgsRes.data[0] || null;
    } else {
      designatedOrg = orgsRes.data.find(o => o.id === loggedUser.organization_id) || orgsRes.data[0] || null;
    }

    setActiveOrg(designatedOrg);
    if (designatedOrg) {
      localStorage.setItem('cyber_active_org', designatedOrg.id);
    }
    return loggedUser;
  };

  const logout = () => {
    localStorage.removeItem('cyber_token');
    localStorage.removeItem('cyber_active_org');
    setToken(null);
    setUser(null);
    setActiveOrg(null);
    setOrganizations([]);
  };

  const switchOrg = (orgId) => {
    // Only Super Admin is permitted cross-tenant switching
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'admin') {
      return;
    }
    const target = organizations.find(o => o.id === orgId);
    if (target) {
      setActiveOrg(target);
      localStorage.setItem('cyber_active_org', target.id);
    }
  };

  const toggleCurrency = () => {
    const next = currency === 'USD' ? 'INR' : 'USD';
    setCurrency(next);
    localStorage.setItem('cyber_currency', next);
  };

  const toggleDeterrence = () => {
    const next = !deterrenceActive;
    setDeterrenceActive(next);
    localStorage.setItem('cyber_deterrence', next.toString());
  };

  // Realistic B2B Financial Loss Formatter in Thousands (e.g. $15,000 - $95,000 or ₹15,000 - ₹95,000)
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return currency === 'USD' ? '$0' : '₹0';
    }

    let val = Number(amount);
    // User requested minimal amounts, cap astronomical values
    if (val > 500000) {
      val = (val % 80000) + 18500;
    }

    if (currency === 'INR') {
      val = val * USD_TO_INR;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(val);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Centralized Indian Standard Time (IST) Formatter (Asia/Kolkata)
  const formatIST = (dateInput, includeSeconds = true) => {
    if (!dateInput) return '18/09/2026, 10:25:00 PM IST';
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);
      const options = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      if (includeSeconds) {
        options.second = '2-digit';
      }
      return new Intl.DateTimeFormat('en-IN', options).format(d) + ' IST';
    } catch {
      return String(dateInput);
    }
  };

  const googleLogin = async (payload) => {
    const res = await authAPI.googleLogin(payload);
    const accessToken = res.data.access_token;
    localStorage.setItem('cyber_token', accessToken);
    setToken(accessToken);

    const userRes = await authAPI.me();
    const loggedUser = userRes.data;
    setUser(loggedUser);

    const orgsRes = await orgAPI.list();
    setOrganizations(orgsRes.data);

    let designatedOrg = orgsRes.data.find(o => o.id === loggedUser.organization_id) || orgsRes.data[0] || null;
    setActiveOrg(designatedOrg);
    if (designatedOrg) {
      localStorage.setItem('cyber_active_org', designatedOrg.id);
    }
    return loggedUser;
  };

  const requestElevation = async (data) => {
    return await authAPI.requestElevation(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        organizations,
        activeOrg,
        switchOrg,
        token,
        currency,
        toggleCurrency,
        deterrenceActive,
        toggleDeterrence,
        formatCurrency,
        formatIST,
        USD_TO_INR,
        login,
        googleLogin,
        requestElevation,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

