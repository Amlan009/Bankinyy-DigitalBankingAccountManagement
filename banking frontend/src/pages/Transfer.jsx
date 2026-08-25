import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

const Transfer = () => {
    const [accounts, setAccounts] = useState([]);
    const [activeTab, setActiveTab] = useState('others'); // 'others' | 'self'
    
    // Transfer to others state
    const [sourceAccount, setSourceAccount] = useState('');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [verifying, setVerifying] = useState(false);
    
    // Self transfer state
    const [selfDestAccount, setSelfDestAccount] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null); // {type: 'success' | 'danger', msg: ''}

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await api.get('/account/all');
            const data = Array.isArray(res.data) ? res.data : [];
            setAccounts(data);
            if (data.length > 0) {
                setSourceAccount(data[0].id);
            }
        } catch (err) {
            console.error("Error fetching accounts", err);
        }
    };

    const verifyRecipient = async () => {
        if (!recipientAccount) return;
        setVerifying(true);
        setAlert(null);
        setRecipientInfo(null);
        try {
            const res = await api.get(`/account/verify-recipient?accountNumber=${recipientAccount}`);
            setRecipientInfo(res.data);
            setAlert({ type: 'success', msg: `Verified: ${res.data.holderName} (${res.data.bankName})` });
        } catch (err) {
            setAlert({ type: 'danger', msg: 'Could not verify recipient account' });
        } finally {
            setVerifying(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            if (activeTab === 'others') {
                await api.post(`/account/${sourceAccount}/transfer`, {
                    recipientAccountNumber: recipientAccount,
                    amount: parseFloat(amount),
                    pin: pin
                });
            } else {
                await api.post('/account/self-transfer', {
                    sourceAccountId: Number(sourceAccount),
                    destinationAccountId: Number(selfDestAccount),
                    amount: parseFloat(amount),
                    pin: pin
                });
            }
            setAlert({ type: 'success', msg: 'Transfer successful!' });
            // Clear form
            setRecipientAccount('');
            setAmount('');
            setPin('');
            setRecipientInfo(null);
            fetchAccounts(); // refresh balances
        } catch (err) {
            const msg = err.response?.data; setAlert({ type: 'danger', msg: typeof msg === 'string' ? msg : (msg?.message || 'Transfer failed') });
        } finally {
            setLoading(false);
        }
    };

    const handlePinChange = (e, index) => {
        const val = e.target.value.replace(/\D/g, '').slice(-1);
        const digits = pin.padEnd(4, ' ').split('').slice(0, 4);
        digits[index] = val || ' ';
        setPin(digits.join('').replace(/ /g, '').substring(0, 4));

        if (val && index < 3) {
            const nextInput = document.getElementById(`pin-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    return (
        <div className="page-content">
            <motion.div 
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">Fund Transfer</h1>
                <p className="page-subtitle">Send money securely.</p>
            </motion.div>

            <motion.div 
                className="glass-card max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="account-tabs mb-lg">
                    <button 
                        className={`account-tab ${activeTab === 'others' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('others'); setAlert(null); }}
                    >
                        Transfer to Others
                    </button>
                    <button 
                        className={`account-tab ${activeTab === 'self' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('self'); setAlert(null); }}
                    >
                        Self Transfer
                    </button>
                </div>

                {alert && (
                    <div className={`alert alert-${alert.type} mb-md`}>
                        {alert.msg}
                    </div>
                )}

                <form onSubmit={handleTransfer}>
                    <div className="form-group">
                        <label className="form-label">Source Account</label>
                        <select 
                            className="form-select" 
                            value={sourceAccount} 
                            onChange={e => setSourceAccount(e.target.value)}
                            required
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.bankName} - ●●●●{acc.accountNumber?.slice(-4)} (₹{acc.balance})
                                </option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'others' ? (
                        <div className="form-group">
                            <label className="form-label">Recipient Account Number</label>
                            <div className="flex gap-sm">
                                <input 
                                    type="text" 
                                    className="form-input flex-1" 
                                    value={recipientAccount}
                                    onChange={e => setRecipientAccount(e.target.value)}
                                    required
                                />
                                <button type="button" className="btn btn-secondary" onClick={verifyRecipient} disabled={verifying || !recipientAccount}>
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <label className="form-label">Destination Account</label>
                            <select 
                                className="form-select" 
                                value={selfDestAccount} 
                                onChange={e => setSelfDestAccount(e.target.value)}
                                required
                            >
                                <option value="">Select account</option>
                                {accounts.filter(acc => String(acc.id) !== String(sourceAccount)).map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.bankName} - ●●●●{acc.accountNumber?.slice(-4)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Amount (₹)</label>
                        <input 
                            type="number" 
                            className="form-input" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">4-Digit PIN</label>
                        <div className="pin-input-group justify-start">
                            {[0, 1, 2, 3].map(i => (
                                <input
                                    key={i}
                                    id={`pin-${i}`}
                                    type="password"
                                    className="pin-input"
                                    maxLength="1"
                                    value={pin[i] || ''}
                                    onChange={e => handlePinChange(e, i)}
                                    required
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-md w-full" disabled={loading || pin.length < 4 || (activeTab === 'others' && !recipientInfo)}>
                        {loading ? 'Processing...' : 'Transfer Now'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Transfer;
