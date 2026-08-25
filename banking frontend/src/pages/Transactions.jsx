import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';
import { isCredit, transactionClass, formatSignedAmount } from '../utils/transactions';

const Transactions = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccountId) {
            fetchTransactions(selectedAccountId);
        }
    }, [selectedAccountId]);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/account/all');
            const data = Array.isArray(res.data) ? res.data : [];
            setAccounts(data);
            if (data.length > 0) {
                setSelectedAccountId(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching accounts", err);
        }
    };

    const fetchTransactions = async (accountId) => {
        setLoading(true);
        try {
            const res = await api.get(`/account/${accountId}/transactions`);
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!selectedAccountId) return;
        try {
            const token = localStorage.getItem('nexus_token');
            const res = await fetch(`/api/account/${selectedAccountId}/export/csv`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${selectedAccountId}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error("Error exporting", err);
            alert("Failed to export transactions.");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    // Calculate stats
    const totalTransactions = transactions.length;
    const totalCredits = transactions.filter(t => isCredit(t)).reduce((acc, t) => acc + Math.abs(Number(t.amount || 0)), 0);
    const totalDebits = transactions.filter(t => !isCredit(t)).reduce((acc, t) => acc + Math.abs(Number(t.amount || 0)), 0);

    return (
        <div className="page-content">
            <motion.div 
                className="page-header flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Your transaction history and statements.</p>
                </div>
                <button className="btn btn-outline" onClick={handleExport} disabled={transactions.length === 0}>
                    <i className="bi bi-download"></i> Export CSV
                </button>
            </motion.div>

            {accounts.length > 0 && (
                <div className="account-tabs mb-lg">
                    {accounts.map(account => (
                        <button 
                            key={account.id}
                            className={`account-tab ${selectedAccountId === account.id ? 'active' : ''}`}
                            onClick={() => setSelectedAccountId(account.id)}
                        >
                            {account.accountNickname || account.nickname || account.bankName}
                        </button>
                    ))}
                </div>
            )}

            <div className="stats-grid mb-lg">
                <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon text-info"><i className="bi bi-receipt"></i></div>
                    <div>
                        <div className="stat-value">{totalTransactions}</div>
                        <div className="stat-label">Total Transactions</div>
                    </div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon text-success"><i className="bi bi-arrow-down-left"></i></div>
                    <div>
                        <div className="stat-value">{formatCurrency(totalCredits)}</div>
                        <div className="stat-label">Total Credits</div>
                    </div>
                </motion.div>
                <motion.div className="stat-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon text-danger"><i className="bi bi-arrow-up-right"></i></div>
                    <div>
                        <div className="stat-value">{formatCurrency(totalDebits)}</div>
                        <div className="stat-label">Total Debits</div>
                    </div>
                </motion.div>
            </div>

            <motion.div 
                className="glass-card full-width"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {loading ? (
                    <div className="text-center py-lg text-muted">Loading transactions...</div>
                ) : transactions.length > 0 ? (
                    <div className="transaction-list">
                        {transactions.map((tx, idx) => (
                            <div className="transaction-item" key={tx.id || idx}>
                                <div className={`transaction-icon ${transactionClass(tx)}`}>
                                    <i className={`bi ${isCredit(tx) ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-desc">{tx.description}</div>
                                    <div className="transaction-time">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : ''}</div>
                                </div>
                                <div className={`transaction-amount ${transactionClass(tx)}`}>
                                    {formatSignedAmount(tx, formatCurrency)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state py-lg">
                        <i className="bi bi-receipt empty-state-icon"></i>
                        <h3 className="empty-state-title">No Transactions Yet</h3>
                        <p className="empty-state-text">You haven't made any transactions with this account.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Transactions;
