import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/api';

const Cards = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [cvv, setCvv] = useState('***');

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccountId) {
            fetchCard(selectedAccountId);
            setFlipped(false);
            setCvv('***');
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

    const fetchCard = async (accountId) => {
        setLoading(true);
        try {
            const res = await api.get(`/account/${accountId}/card`);
            setCard(res.data);
        } catch (err) {
            console.error("Error fetching card", err);
            setCard(null);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (action) => {
        if (!card || !selectedAccountId) return;
        try {
            const res = await api.post(`/account/${selectedAccountId}/card/${action}`);
            setCard(res.data);
        } catch (err) {
            console.error(`Error toggling ${action}`, err);
        }
    };

    const showCvv = async () => {
        try {
            const res = await api.get(`/account/${selectedAccountId}/card/cvv`);
            setCvv(res.data.cvv);
            setFlipped(true);
            setTimeout(() => {
                setCvv('***');
                setFlipped(false);
            }, 5000);
        } catch (err) {
            console.error("Error fetching CVV", err);
        }
    };

    const formatCardNumber = (number) => {
        if (!number) return 'XXXX XXXX XXXX XXXX';
        const digits = String(number).replace(/\D/g, '');
        return (digits || number).replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (dateString) => {
        if (!dateString) return 'MM/YY';
        if (typeof dateString === 'string' && dateString.includes('/')) return dateString;
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return dateString;
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
    };

    return (
        <div className="page-content">
            <motion.div 
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="page-title">Virtual Debit Card</h1>
                <p className="page-subtitle">Manage your card settings securely.</p>
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

            {loading ? (
                <div className="text-center py-lg text-muted">Loading card details...</div>
            ) : card ? (
                <div className="flex flex-col md:flex-row gap-lg items-start">
                    <motion.div 
                        className="w-full md:w-1/2 flex justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="credit-card-scene" onClick={() => setFlipped(!flipped)}>
                            <div className={`credit-card-3d ${flipped ? 'flipped' : ''}`}>
                                <div className="credit-card-face credit-card-front">
                                    <div className="flex justify-between items-start">
                                        <div className="credit-card-chip"></div>
                                        <i className="bi bi-wifi text-2xl text-white opacity-80"></i>
                                    </div>
                                    <div className="credit-card-number mt-md">
                                        {formatCardNumber(card.cardNumber)}
                                    </div>
                                    <div className="credit-card-info flex justify-between mt-sm">
                                        <div className="credit-card-holder flex-1">
                                            <div className="credit-card-expiry-label">Card Holder</div>
                                            <div className="credit-card-name uppercase truncate">{card.cardHolderName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="credit-card-expiry-label">Expires</div>
                                            <div className="credit-card-expiry">{formatExpiry(card.expiryDate)}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-right">
                                        <span className="font-bold text-white italic text-lg">NexusBank</span>
                                    </div>
                                </div>
                                <div className="credit-card-face credit-card-back">
                                    <div className="credit-card-strip mt-md"></div>
                                    <div className="px-md mt-md">
                                        <div className="text-right text-xs text-white mb-1">CVV</div>
                                        <div className="credit-card-cvv-box flex justify-end items-center px-sm text-black bg-white rounded h-8">
                                            {cvv}
                                        </div>
                                    </div>
                                    <div className="px-md mt-sm text-xs text-white opacity-60">
                                        This card is issued by NexusBank pursuant to a license from Mastercard International. Use of this card is governed by the Cardholder Agreement.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="w-full md:w-1/2 glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="glass-card-title mb-md">Card Controls</h3>
                        
                        <div className="flex flex-col gap-md">
                            <div className="settings-row flex justify-between items-center py-sm border-b border-white/10">
                                <div>
                                    <div className="settings-row-label font-bold text-white">Card Active</div>
                                    <div className="text-sm text-muted">Temporarily freeze your card</div>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={card.active} 
                                        onChange={() => handleToggle('toggle')} 
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div className="settings-row flex justify-between items-center py-sm border-b border-white/10">
                                <div>
                                    <div className="settings-row-label font-bold text-white">Online Transactions</div>
                                    <div className="text-sm text-muted">Enable for e-commerce purchases</div>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={card.onlineTransactionsEnabled} 
                                        onChange={() => handleToggle('online-toggle')} 
                                        disabled={!card.active}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div className="settings-row flex justify-between items-center py-sm border-b border-white/10">
                                <div>
                                    <div className="settings-row-label font-bold text-white">International Usage</div>
                                    <div className="text-sm text-muted">Enable for international transactions</div>
                                </div>
                                <label className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        checked={card.internationalTransactionsEnabled} 
                                        onChange={() => handleToggle('international-toggle')} 
                                        disabled={!card.active}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <button className="btn btn-outline mt-sm w-full" onClick={showCvv}>
                                <i className="bi bi-eye"></i> Show CVV
                            </button>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="empty-state py-lg">
                    <i className="bi bi-credit-card empty-state-icon"></i>
                    <h3 className="empty-state-title">No Card Found</h3>
                    <p className="empty-state-text">No debit card is associated with this account.</p>
                </div>
            )}
        </div>
    );
};

export default Cards;
