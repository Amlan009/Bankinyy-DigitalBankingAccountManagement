import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { isCredit, transactionClass, formatSignedAmount } from '../utils/transactions';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cardRef = useRef(null);

    // Modals state
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showAddBankModal, setShowAddBankModal] = useState(false);
    
    // Deposit state
    const [depositAmount, setDepositAmount] = useState('');
    const [depositSource, setDepositSource] = useState('External Transfer');
    const [depositLoading, setDepositLoading] = useState(false);
    
    // Banks state
    const [banks, setBanks] = useState([]);

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
            setLoading(true);
            const response = await api.get('/account/all');
            const data = Array.isArray(response.data) ? response.data : [];
            setAccounts(data);
            if (data.length > 0) {
                setSelectedAccountId(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching accounts", err);
            setError("Failed to load accounts.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async (accountId) => {
        try {
            const response = await api.get(`/account/${accountId}/transactions`);
            setTransactions(response.data.slice(0, 5)); // Last 5
        } catch (err) {
            console.error("Error fetching transactions", err);
        }
    };

    const fetchBanks = async () => {
        try {
            const response = await api.get('/banks/all');
            setBanks(response.data);
        } catch (err) {
            console.error("Error fetching banks", err);
        }
    };

    const handleAddBankClick = () => {
        fetchBanks();
        setShowAddBankModal(true);
    };

    const handleAddBank = async (bankId) => {
        try {
            await api.post(`/banks/add/${bankId}`);
            setShowAddBankModal(false);
            fetchAccounts();
        } catch (err) {
            console.error("Error adding bank", err);
            alert("Failed to add bank.");
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            setDepositLoading(true);
            await api.post(`/account/${selectedAccountId}/deposit`, {
                amount: parseFloat(depositAmount),
                source: depositSource
            });
            setShowDepositModal(false);
            setDepositAmount('');
            fetchAccounts(); // Refresh balance
            fetchTransactions(selectedAccountId); // Refresh transactions
        } catch (err) {
            console.error("Error depositing", err);
            alert("Deposit failed.");
        } finally {
            setDepositLoading(false);
        }
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        cardRef.current.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
            if(cardRef.current) cardRef.current.style.transition = '';
        }, 500);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    if (loading) {
        return (
            <div className="loading-page flex flex-col items-center justify-center h-full">
                <div className="spinner"></div>
                <div className="loading-text mt-md text-muted">Loading your finances...</div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <motion.div 
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'User'}</span></h1>
                <p className="page-subtitle">Here's your financial overview today.</p>
            </motion.div>

            {accounts.length === 0 ? (
                <motion.div 
                    className="empty-state mt-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <i className="bi bi-bank empty-state-icon"></i>
                    <h2 className="empty-state-title">No Accounts Yet</h2>
                    <p className="empty-state-text mb-lg">Link a bank account to start managing your finances with NexusBank.</p>
                    <button className="btn btn-primary" onClick={handleAddBankClick}>
                        <i className="bi bi-plus-lg"></i> Add Bank Account
                    </button>
                </motion.div>
            ) : (
                <>
                    <motion.div 
                        className="account-tabs mb-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {accounts.map(account => (
                            <button 
                                key={account.id}
                                className={`account-tab ${selectedAccountId === account.id ? 'active' : ''}`}
                                onClick={() => setSelectedAccountId(account.id)}
                            >
                                {account.accountNickname || account.nickname || account.bankName}
                            </button>
                        ))}
                        <button className="account-tab" onClick={handleAddBankClick}>
                            <i className="bi bi-plus"></i>
                        </button>
                    </motion.div>

                    <div className="dashboard-grid">
                        <motion.div 
                            className="balance-card-3d"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="balance-card-inner" ref={cardRef}>
                                <div className="balance-card-label">Total Balance</div>
                                <div className="balance-card-amount">{formatCurrency(selectedAccount?.balance || 0)}</div>
                                <div className="balance-card-bottom flex justify-between items-center mt-lg">
                                    <div className="balance-card-account">
                                        ●●●● {selectedAccount?.accountNumber?.slice(-4) || 'XXXX'}
                                    </div>
                                    <div className="balance-card-bank text-muted">
                                        {selectedAccount?.bankName}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="glass-card-header mb-md">
                                <h3 className="glass-card-title">Quick Actions</h3>
                            </div>
                            <div className="quick-actions-grid">
                                <Link to="/transfer" className="quick-action-btn">
                                    <div className="quick-action-icon"><i className="bi bi-send-fill"></i></div>
                                    <div className="quick-action-label">Transfer</div>
                                </Link>
                                <button className="quick-action-btn" onClick={() => setShowDepositModal(true)}>
                                    <div className="quick-action-icon"><i className="bi bi-wallet-fill"></i></div>
                                    <div className="quick-action-label">Deposit</div>
                                </button>
                                <Link to="/pay-bill" className="quick-action-btn">
                                    <div className="quick-action-icon"><i className="bi bi-receipt"></i></div>
                                    <div className="quick-action-label">Pay Bill</div>
                                </Link>
                                <Link to="/cards" className="quick-action-btn">
                                    <div className="quick-action-icon"><i className="bi bi-credit-card-fill"></i></div>
                                    <div className="quick-action-label">Cards</div>
                                </Link>
                                <Link to="/loan" className="quick-action-btn">
                                    <div className="quick-action-icon"><i className="bi bi-cash-coin"></i></div>
                                    <div className="quick-action-label">Loan</div>
                                </Link>
                                <Link to="/transactions" className="quick-action-btn">
                                    <div className="quick-action-icon"><i className="bi bi-clock-history"></i></div>
                                    <div className="quick-action-label">History</div>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="glass-card full-width mt-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="glass-card-header mb-md flex justify-between items-center">
                                <h3 className="glass-card-title">Recent Transactions</h3>
                                <Link to="/transactions" className="text-info">View All</Link>
                            </div>
                            
                            {transactions.length > 0 ? (
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
                                <div className="empty-state py-md">
                                    <p className="text-muted">No recent transactions.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}

            {/* Deposit Modal */}
            <AnimatePresence>
                {showDepositModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="modal-content glass-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Make a Deposit</h3>
                                <button className="modal-close" onClick={() => setShowDepositModal(false)}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <form onSubmit={handleDeposit} className="mt-md">
                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        required 
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Source</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        value={depositSource}
                                        onChange={(e) => setDepositSource(e.target.value)}
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block mt-lg" disabled={depositLoading}>
                                    {depositLoading ? 'Processing...' : 'Deposit Funds'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Bank Modal */}
            <AnimatePresence>
                {showAddBankModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="modal-content glass-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-header">
                                <h3 className="modal-title">Link a Bank</h3>
                                <button className="modal-close" onClick={() => setShowAddBankModal(false)}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="mt-md flex flex-col gap-sm">
                                {banks.map(bank => (
                                    <button 
                                        key={bank.id} 
                                        className="btn btn-outline flex justify-between items-center"
                                        onClick={() => handleAddBank(bank.id)}
                                    >
                                        <span>{bank.name}</span>
                                        <i className="bi bi-plus-circle"></i>
                                    </button>
                                ))}
                                {banks.length === 0 && <p className="text-muted text-center py-md">No banks available.</p>}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
