import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

const Notifications = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchActivities(selectedAccountId);
    }
  }, [selectedAccountId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/account/all');
            setAccounts(Array.isArray(res.data) ? res.data : []);
            if (res.data.length > 0) {
                setSelectedAccountId(res.data[0].id);
            }
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/account/${id}/activity-log`);
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to fetch activity log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDotColor = (action) => {
    const value = String(action || '');
    if (value.includes('LOGIN_SUCCESS')) return 'success';
    if (value.includes('TRANSFER') || value.includes('PAYMENT') || value.includes('DEPOSIT')) return 'info';
    if (value.includes('FAILED')) return 'danger';
    return 'warning';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <motion.div 
      className="page-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="page-header">
        <h1 className="page-title">Activity <span className="gradient-text">Log</span></h1>
        <p className="page-subtitle">View your recent account activities and notifications</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="account-tabs mb-lg">
        {accounts.map(acc => (
          <button
            key={acc.id}
            className={`account-tab ${selectedAccountId === acc.id ? 'active' : ''}`}
            onClick={() => setSelectedAccountId(acc.id)}
          >
            {acc.accountNickname || acc.nickname || acc.bankName || 'Account'} ({(acc.accountNumber || '').slice(-4) || 'XXXX'})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p className="loading-text">Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bell-slash empty-state-icon"></i>
          <h3 className="empty-state-title">No Activity Found</h3>
          <p className="empty-state-text">You haven't made any activities recently on this account.</p>
        </div>
      ) : (
        <motion.div 
          className="transaction-list glass-card"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              className="notification-item"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <div className={`notification-dot ${getDotColor(activity.activityType || activity.action)}`}></div>
              <div className="notification-content">
                <div className="notification-title">{activity.activityType || activity.action}</div>
                <div className="notification-text">{activity.description || activity.details}</div>
              </div>
              <div className="notification-time text-muted">{formatDate(activity.timestamp)}</div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Notifications;
