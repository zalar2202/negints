"use client";
import React from 'react';
import { DollarSign } from 'lucide-react';
// We can mix MUI with the custom CSS if needed, but per instructions, try to stick to "Vanilla CSS" or the existing design system.
// However, the project HAS MUI installed. 
// "use client"; at top.

const AccountingStats = ({ stats }) => {
    return (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
            {stats.map((stat, index) => (
                <div key={index} className="negints-card stat-card" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px', 
                    direction: 'rtl', 
                    textAlign: 'right',
                    padding: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600">
                                {stat.icon || <DollarSign className="w-5 h-5" />}
                            </div>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }} className="font-black uppercase tracking-tight">{stat.title}</span>
                        </div>
                        {stat.percentage && (
                            <span className="icon-wrapper font-black" style={{
                                backgroundColor: stat.trend === 'up' ? 'rgba(34, 197, 94, 0.1)' : (stat.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'),
                                color: stat.trend === 'up' ? '#22c55e' : (stat.trend === 'down' ? '#ef4444' : '#6366f1'),
                                padding: '4px 10px',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: '900'
                            }}>
                                {stat.percentage}
                            </span>
                        )}
                    </div>
                    <div className="stat-value font-black" style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: '5px 0' }}>
                        {stat.value}
                    </div>
                    <div className="stat-desc font-bold opacity-70" style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: '700' }}>
                        {stat.description}
                    </div>
                    
                    {/* Subtle accent line */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        right: 0, 
                        width: '30%', 
                        height: '3px', 
                        background: stat.trend === 'up' ? '#22c55e' : (stat.trend === 'down' ? '#ef4444' : 'var(--color-primary)'),
                        opacity: 0.3,
                        borderRadius: '10px 0 0 0'
                    }}></div>
                </div>
            ))}
        </div>
    );
};

export default AccountingStats;
