import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';

const purposes = ['Home Loan', 'Personal Loan', 'Education Loan', 'Vehicle Loan', 'Business Loan'];
const purposeIcons = {
  'Home Loan': 'bi-house-fill',
  'Personal Loan': 'bi-person-fill',
  'Education Loan': 'bi-mortarboard-fill',
  'Vehicle Loan': 'bi-car-front-fill',
  'Business Loan': 'bi-briefcase-fill'
};

export default function LoanApply() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('Personal Loan');
  const [loanTenure, setLoanTenure] = useState(12);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(false);
  const [estimatedEmi, setEstimatedEmi] = useState(0);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    calculateEmi();
  }, [loanAmount, loanTenure]);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/account/all');
      const data = Array.isArray(res.data) ? res.data : [];
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(String(data[0].id));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load accounts.' });
    } finally {
      setPageLoading(false);
    }
  };

  const calculateEmi = () => {
    const p = parseFloat(loanAmount);
    if (!p || isNaN(p) || p <= 0) {
      setEstimatedEmi(0);
      return;
    }
    const r = 10 / 12 / 100; // 10% annual
    const n = parseInt(loanTenure);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEstimatedEmi(emi);
  };

  const totalInterest = estimatedEmi && loanAmount
    ? (estimatedEmi * parseInt(loanTenure)) - parseFloat(loanAmount)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccount || !loanAmount || parseFloat(loanAmount) <= 0) {
      setAlert({ type: 'warning', message: 'Please fill all required fields correctly.' });
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      await api.post(`/account/${selectedAccount}/loans/apply`, {
        amount: parseFloat(loanAmount),
        purpose: loanPurpose,
        monthlyIncome: 0,
        loanTenureMonths: parseInt(loanTenure)
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data;
      setAlert({ type: 'danger', message: typeof msg === 'string' ? msg : (msg?.message || 'Loan application failed. Please try again.') });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}
      >
        <div className="glass-card text-center" style={{ maxWidth: 480, padding: '48px 32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '16px' }}
          >
            <i className="bi bi-file-earmark-check-fill"></i>
          </motion.div>
          <h2 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Application Submitted!</h2>
          <p className="text-muted" style={{ marginBottom: '12px' }}>
            Your <strong>{loanPurpose}</strong> application for <strong>₹{parseFloat(loanAmount || 0).toLocaleString('en-IN')}</strong> has been received.
          </p>
          <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.85rem' }}>
            Reference: <strong>{Math.random().toString(36).substring(2, 10).toUpperCase()}</strong>
          </p>
          <button className="btn btn-primary w-full" onClick={() => { setSuccess(false); setLoanAmount(''); }}>
            Apply for Another Loan
          </button>
        </div>
      </motion.div>
    );
  }

  if (pageLoading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p className="loading-text">Loading loan application...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <h1 className="page-title">Apply for <span className="gradient-text">Loan</span></h1>
        <p className="page-subtitle">Get instant approval with attractive interest rates</p>
      </div>

      {accounts.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🏦</div>
            <h3 className="empty-state-title">No Bank Accounts</h3>
            <p className="empty-state-text">Please add a bank account from the Dashboard first to apply for a loan.</p>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Left: Application Form */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3 className="glass-card-title">
                <i className="bi bi-file-earmark-text" style={{ marginRight: 8 }}></i>
                Application Details
              </h3>
            </div>

            {alert && (
              <div className={`alert alert-${alert.type}`}>
                <i className={`bi ${alert.type === 'danger' ? 'bi-exclamation-circle' : alert.type === 'success' ? 'bi-check-circle' : 'bi-info-circle'}`}></i>
                {' '}{alert.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Linked Account</label>
                <select className="form-select" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} required>
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName || acc.accountNickname || 'Account'} •••• {(acc.accountNumber || '').slice(-4)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1000"
                  step="1000"
                  placeholder="e.g. 100000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loan Purpose</label>
                <select className="form-select" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} required>
                  {purposes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tenure: <strong>{loanTenure} months</strong></label>
                <input
                  type="range"
                  className="w-full"
                  min="6"
                  max="60"
                  step="6"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="flex justify-between text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                  <span>6 months</span>
                  <span>60 months</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block mt-lg" disabled={loading}>
                {loading ? (
                  <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Submitting...</>
                ) : (
                  <><i className="bi bi-send-fill"></i> Submit Application</>
                )}
              </button>
            </form>
          </div>

          {/* Right: EMI Calculator */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: 'var(--accent-primary)',
              marginBottom: '20px'
            }}>
              <i className="bi bi-calculator-fill"></i>
            </div>
            <h3 style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>EMI Calculator</h3>
            <p className="text-muted" style={{ marginBottom: '24px', fontSize: '0.85rem' }}>
              Estimated monthly installment at 10% p.a.
            </p>

            <div className="glass-card w-full" style={{ padding: '20px', marginBottom: '16px' }}>
              <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '4px' }}>Estimated EMI</div>
              <div className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
                ₹{estimatedEmi ? Math.round(estimatedEmi).toLocaleString('en-IN') : '0'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>per month</div>
            </div>

            <div className="flex w-full gap-sm">
              <div className="glass-card w-full text-center" style={{ padding: '12px' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Principal</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  ₹{loanAmount ? parseFloat(loanAmount).toLocaleString('en-IN') : '0'}
                </div>
              </div>
              <div className="glass-card w-full text-center" style={{ padding: '12px' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total Interest</div>
                <div style={{ fontWeight: 700, color: 'var(--warning, #f59e0b)' }}>
                  ₹{totalInterest > 0 ? Math.round(totalInterest).toLocaleString('en-IN') : '0'}
                </div>
              </div>
            </div>

            <div className="glass-card w-full text-center" style={{ padding: '12px', marginTop: '8px' }}>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Total Payable</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                ₹{estimatedEmi ? Math.round(estimatedEmi * parseInt(loanTenure)).toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
