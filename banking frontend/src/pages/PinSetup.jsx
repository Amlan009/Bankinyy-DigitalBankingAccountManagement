import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

const PinSetup = () => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const confirmPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin, token } = useAuth();
    
    const state = location.state || {};
    const hasCredentials = !!(state.username && state.password);

    // Pre-fill from registration state
    useEffect(() => {
        if (state.username) setUsername(state.username);
        if (state.password) setPassword(state.password);
    }, []);

    const handlePinChange = (index, value, isConfirm = false) => {
        if (!/^\d*$/.test(value)) return;
        
        const newPin = isConfirm ? [...confirmPin] : [...pin];
        newPin[index] = value.substring(value.length - 1);
        
        if (isConfirm) {
            setConfirmPin(newPin);
        } else {
            setPin(newPin);
        }

        if (value && index < 3) {
            const nextRef = isConfirm ? confirmPinRefs[index + 1] : pinRefs[index + 1];
            nextRef.current.focus();
        }
    };

    const handleKeyDown = (e, index, isConfirm = false) => {
        if (e.key === 'Backspace') {
            const currentArray = isConfirm ? confirmPin : pin;
            if (!currentArray[index] && index > 0) {
                const prevRef = isConfirm ? confirmPinRefs[index - 1] : pinRefs[index - 1];
                prevRef.current.focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        const finalPin = pin.join('');
        const finalConfirmPin = confirmPin.join('');
        
        if (finalPin.length !== 4) {
            setError('Please enter a 4-digit PIN');
            return;
        }
        
        if (finalPin !== finalConfirmPin) {
            setError('PINs do not match');
            return;
        }

        if (!username || !password) {
            setError('Please enter your username and password');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Log in first to get JWT token (required for set-pin endpoint)
            let jwt = token;
            if (!jwt) {
                const loginRes = await api.post('/auth/login', { username, password });
                jwt = loginRes.data.accessToken;
                localStorage.setItem('nexus_token', jwt);
            }

            // Step 2: Set the PIN using the JWT token
            await api.post('/account/set-pin', 
                { password, pin: finalPin },
                { headers: { Authorization: `Bearer ${jwt}` } }
            );
            
            setSuccess('PIN set successfully! Redirecting to dashboard...');
            
            // Step 3: Log in properly through auth context
            setTimeout(async () => {
                try {
                    await authLogin(username, password);
                    navigate('/');
                } catch (loginErr) {
                    navigate('/login');
                }
            }, 1500);
            
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                setError('Cannot connect to server. Please make sure the backend is running on port 8080.');
            } else {
                const msg = err.response?.data;
                const errorText = typeof msg === 'string' ? msg : (msg?.message || '');
                if (err.response?.status === 401) {
                    setError('Invalid username or password. Please check your credentials.');
                } else {
                    setError(errorText || 'Failed to set PIN. Please try again.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
            </div>
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo">
                    <div className="auth-logo-icon"><i className="bi bi-bank"></i></div>
                    <div className="auth-logo-text">NexusBank</div>
                </div>
                <h1 className="auth-title">Set Your PIN</h1>
                <p className="auth-subtitle">Create a 4-digit security PIN for transactions</p>

                {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle"></i> {error}</div>}
                {success && <div className="alert alert-success"><i className="bi bi-check-circle"></i> {success}</div>}

                <form onSubmit={handleSubmit}>
                    {!hasCredentials && (
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label className="form-label">{hasCredentials ? 'Verify Password' : 'Password'}</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        {hasCredentials && (
                            <p className="form-hint">Enter the password you used during registration</p>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Enter 4-digit PIN</label>
                        <div className="pin-input-group">
                            {pin.map((digit, index) => (
                                <input
                                    key={`pin-${index}`}
                                    ref={pinRefs[index]}
                                    type="password"
                                    className="pin-input"
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value, false)}
                                    onKeyDown={(e) => handleKeyDown(e, index, false)}
                                    maxLength={1}
                                    required
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm PIN</label>
                        <div className="pin-input-group">
                            {confirmPin.map((digit, index) => (
                                <input
                                    key={`cpin-${index}`}
                                    ref={confirmPinRefs[index]}
                                    type="password"
                                    className="pin-input"
                                    value={digit}
                                    onChange={(e) => handlePinChange(index, e.target.value, true)}
                                    onKeyDown={(e) => handleKeyDown(e, index, true)}
                                    maxLength={1}
                                    required
                                />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-lg" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Set PIN'}
                    </button>
                </form>

                <div className="auth-footer mt-md">
                    <p className="text-muted">Want to set PIN later? <Link to="/login" className="gradient-text">Skip to Login</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default PinSetup;
