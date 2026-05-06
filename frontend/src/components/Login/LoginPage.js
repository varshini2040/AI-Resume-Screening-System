import React, { useState } from 'react';
import { loginAdmin } from '../../services/api';
import { FaEnvelope, FaLock, FaSearch } from 'react-icons/fa';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Customizable Theme Colors
  const theme = {
    primary: '#4299e1',
    primaryDark: '#3182ce',
    leftGradientStart: '#e8f0f8',
    leftGradientEnd: '#f0e8f8',
    textDark: '#1a202c',
    textMedium: '#2d3748',
    textLight: '#718096',
    borderColor: '#e2e8f0',
    bgLight: '#f5f5f5',
    iconBg: '#e8f0ff'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginAdmin(username, password);
      if (response.data.access_token) {
        onLogin(response.data.access_token);
      }
    } catch (err) {
      setError('Invalid credentials! Use varshini / varshu');
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      background: 'white',
      padding: 0,
      margin: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'white',
        overflow: 'hidden'
      }}>
        {/* Left Side - Brand Section */}
        <div style={{
          flex: 1,
          background: `linear-gradient(135deg, ${theme.leftGradientStart} 0%, ${theme.leftGradientEnd} 100%)`,
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Section with Logo */}
          <div style={{
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '60px',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '45px',
                height: '45px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <FaSearch style={{
                  fontSize: '24px',
                  color: theme.primary
                }} />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: theme.textMedium,
                  lineHeight: '1.2'
                }}>
                  AI Resume
                </div>
                <div style={{
                  fontSize: '12px',
                  color: theme.textLight,
                  fontWeight: '500'
                }}>
                  Screening System
                </div>
              </div>
            </div>

            {/* Main Heading - Centered */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '700',
              color: theme.textDark,
              marginBottom: '20px',
              lineHeight: '1.3',
              maxWidth: '100%',
              textAlign: 'center'
            }}>
              AI-Powered Resume Screening Made Simple
            </h1>

            {/* Subheading - Centered */}
            <p style={{
              fontSize: '15px',
              color: theme.textLight,
              lineHeight: '1.6',
              maxWidth: '100%',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              Analyze, rank and hire the best candidates faster with the power of AI.
            </p>
          </div>

          {/* Illustration Section - Professional Student with Laptop */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '40px'
          }}>
            <img 
              src="/LOGIN.jpg" 
              alt="Student with Laptop"
              style={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                borderRadius: '15px',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* Decorative dots - optional */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '30px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)',
            backgroundSize: '20px 20px',
            opacity: 0.5
          }}></div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: 1,
          padding: '60px 50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'white',
          height: '100%',
          overflowY: 'auto'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Icon Circle - Centered */}
            <div style={{
              width: '70px',
              height: '70px',
              background: theme.iconBg,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              fontSize: '36px',
              margin: '0 auto 30px auto'
            }}>
              🔒
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: '32px',
              color: theme.textDark,
              marginBottom: '8px',
              fontWeight: '700'
            }}>
              Admin Login
            </h2>

            {/* Subheading */}
            <p style={{
              color: theme.textLight,
              fontSize: '15px',
              marginBottom: '30px',
              fontWeight: '500'
            }}>
              Welcome back! Please login to continue.
            </p>

            {/* Error Message */}
            {error && (
              <div style={{
                background: '#fee',
                color: '#c33',
                padding: '14px 16px',
                borderRadius: '10px',
                marginBottom: '25px',
                fontSize: '14px',
                border: '1px solid #fcc',
                fontWeight: '500',
                width: '100%'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Username Field */}
              <div style={{
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: theme.textMedium,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Username
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <FaEnvelope style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#cbd5e0',
                    fontSize: '16px'
                  }} />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      border: `1.5px solid ${theme.borderColor}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      backgroundColor: '#fafbfc'
                    }}
                    required
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primary;
                      e.target.style.boxShadow = `0 0 0 3px rgba(66, 153, 225, 0.1)`;
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#fafbfc';
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{
                marginBottom: '28px',
                textAlign: 'left'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: theme.textMedium,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Password
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <FaLock style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#cbd5e0',
                    fontSize: '16px'
                  }} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      border: `1.5px solid ${theme.borderColor}`,
                      borderRadius: '10px',
                      fontSize: '15px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit',
                      backgroundColor: '#fafbfc'
                    }}
                    required
                    disabled={loading}
                    onFocus={(e) => {
                      e.target.style.borderColor = theme.primary;
                      e.target.style.boxShadow = `0 0 0 3px rgba(66, 153, 225, 0.1)`;
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.borderColor;
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#fafbfc';
                    }}
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={{
                marginBottom: '32px',
                textAlign: 'right'
              }}>
                <a href="#" style={{
                  fontSize: '14px',
                  color: theme.primary,
                  textDecoration: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = theme.primaryDark;
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = theme.primary;
                  e.target.style.textDecoration = 'none';
                }}
                onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: loading ? 0.75 : 1,
                  boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.primaryDark;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(66, 153, 225, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = theme.primary;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.3)';
                  }
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '12px',
        color: '#a0aec0',
        width: '100%',
        pointerEvents: 'none'
      }}>
        © 2024 AI Resume Screening System. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;