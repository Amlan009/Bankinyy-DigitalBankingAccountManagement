import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';

const billers = [
  { id: 'Electricity', name: 'Electricity', icon: 'bi-lightning-charge-fill', color: '#f59e0b' },
  { id: 'Water', name: 'Water', icon: 'bi-droplet-fill', color: '#06b6d4' },
  { id: 'Internet', name: 'Internet', icon: 'bi-wifi', color: '#8b5cf6' },
  { id: 'Mobile Recharge', name: 'Mobile Recharge', icon: 'bi-phone-fill', color: '#10b981' },
  { id: 'Gas', name: 'Gas', icon: 'bi-fire', color: '#ef4444' },
  { id: 'Insurance', name: 'Insurance', icon: 'bi-shield-check', color: '#3b82f6' }
];

export default function BillPay() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [customBiller, setCustomBiller] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/account/all');
      const data = Array.isArray(res.data) ? res.data : [];
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(String(data[0].id));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load accounts. Please try again.' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalBiller = selectedBiller || customBiller;
    if (!finalBiller) {
      setAlert({ type: 'warning', message: 'Please select or enter a biller name.' });
      return;
    }
    if (!selectedAccount || !amount || !pin) {
      setAlert({ type: 'warning', message: 'Please fill in all required fields.' });
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      await api.post(`/account/${selectedAccount}/paybill`, {
        billerName: finalBiller,
        amount: parseFloat(amount),
        pin
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data;
      setAlert({
        type: 'danger',
        message: typeof msg === 'string' ? msg : (msg?.message || 'Bill payment failed. Please try again.')
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setAmount('');
    setPin('');
    setSelectedBiller('');
    setCustomBiller('');
    setAlert(null);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}
      >
        <div className="glass-card text-center" style={{ maxWidth: 420, padding: '48px 32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '16px' }}
          >
            <i className="bi bi-check-circle-fill"></i>
          </motion.div>
          <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Payment Successful!</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            Your bill payment of ₹{parseFloat(amount || 0).toLocaleString('en-IN')} to <strong>{selectedBiller || customBiller}</strong> has been processed.
          </p>
          <button className="btn btn-primary w-full" onClick={resetForm}>Make Another Payment</button>
        </div>
      </motion.div>
    );
  }

  if (pageLoading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p className="loading-text">Loading bill payment...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <h1 className="page-title">Pay <span className="gradient-text">Bills</span></h1>
        <p className="page-subtitle">Pay your utility bills instantly and securely</p>
      </div>

      {accounts.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3 className="empty-state-title">No Bank Accounts</h3>
            <p className="empty-state-text">Please add a bank account from the Dashboard first to pay bills.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Left: Biller Selection */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3 className="glass-card-title">
                <i className="bi bi-receipt" style={{ marginRight: 8 }}></i>
                Select Biller
              </h3>
            </div>
            <div className="quick-actions-grid" style={{ marginBottom: '20px' }}>
              {billers.map(biller => (
                <button
                  key={biller.id}
                  type="button"
                  className="quick-action-btn"
                  style={selectedBiller === biller.id ? {
                    background: 'rgba(99, 102, 241, 0.15)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--text-primary)'
                  } : {}}
                  onClick={() => { setSelectedBiller(biller.id); setCustomBiller(''); setAlert(null); }}
                >
                  <div className="quick-action-icon" style={{ background: `${biller.color}20`, color: biller.color }}>
                    <i className={`bi ${biller.icon}`}></i>
                  </div>
                  <div className="quick-action-label">{biller.name}</div>
                </button>
              ))}
            </div>

            <div className="divider"></div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Or Enter Custom Biller</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter biller name..."
                value={customBiller}
                onChange={(e) => { setCustomBiller(e.target.value); setSelectedBiller(''); }}
              />
            </div>
          </div>

          {/* Right: Payment Form */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3 className="glass-card-title">
                <i className="bi bi-credit-card" style={{ marginRight: 8 }}></i>
                Payment Details
              </h3>
            </div>

            {alert && (
              <div className={`alert alert-${alert.type}`}>
                <i className={`bi ${alert.type === 'danger' ? 'bi-exclamation-circle' : alert.type === 'success' ? 'bi-check-circle' : 'bi-info-circle'}`}></i>
                {alert.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Source Account</label>
                <select
                  className="form-select"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName || acc.accountNickname || 'Account'} •••• {(acc.accountNumber || '').slice(-4)} (₹{(acc.balance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedBiller || customBiller) && (
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  <i className="bi bi-receipt"></i>
                  Paying: <strong>{selectedBiller || customBiller}</strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transaction PIN</label>
                <input
                  type="password"
                  className="form-input"
                  maxLength="4"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block mt-lg" disabled={loading || (!selectedBiller && !customBiller)}>
                {loading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Processing...</>
                ) : (
                  <><i className="bi bi-send-fill"></i> Pay Bill Now</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
