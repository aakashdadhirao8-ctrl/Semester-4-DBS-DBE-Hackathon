import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Wrench, 
  ArrowUpRight,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function AlertCenter({ onNavigateToAsset, onNavigate }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvedIds, setResolvedIds] = useState(new Set());

  useEffect(() => {
    loadAlerts();
    const unsubscribe = api.subscribe(() => {
      loadAlerts();
    });
    return () => unsubscribe();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Scanning Enterprise Asset Ledger for Pending Actions...</div>;
  }

  const pendingAlerts = alerts.filter(a => !resolvedIds.has(a.id));
  const resolvedCount = resolvedIds.size;

  return (
    <div>
      <div className="card-panel">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <div className="card-title">
              <ShieldAlert size={20} color="var(--accent-rose)" />
              Pending Risk & Governance Action Items
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Only showing actionable pending tasks requiring executive sign-off, scrap decisions, or budget freezes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-critical" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              {pendingAlerts.length} Action Items Pending
            </span>
            {resolvedCount > 0 && (
              <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
                ✓ {resolvedCount} Signed Off
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <ShieldCheck size={36} color="var(--accent-emerald)" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Risk Advisories or Pending Actions</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                Your enterprise risk ledger is completely clean. Automated SCRAP vs REPAIR rules, budget ceiling breaches, and warranty renewal alerts will trigger here as your asset base grows.
              </p>
            </div>
          ) : (
            alerts.map((al) => {
            const isResolved = resolvedIds.has(al.id);
            const isCritical = al.severity === 'CRITICAL';
            const isBudgetAlert = al.type === 'BUDGET_OVERRUN_RISK' || al.departmentId || al.title?.toLowerCase().includes('budget') || al.message?.toLowerCase().includes('budget');
            const targetPage = isBudgetAlert ? 'workforce' : 'assets';
            const targetLabel = isBudgetAlert ? 'Workforce Quotas' : 'Asset Registry';

            const handleNavigate = () => {
              if (onNavigate) {
                onNavigate(targetPage);
              } else if (onNavigateToAsset) {
                onNavigateToAsset(al.assetId);
              }
            };

            return (
              <div 
                key={al.id} 
                className="animate-in clickable panel-card-interactive"
                style={{ 
                  background: isResolved ? 'var(--bg-surface-elevated)' : (isCritical ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)'), 
                  border: isResolved ? '1px solid var(--border-subtle)' : (isCritical ? '1px solid var(--accent-rose)' : '1px solid var(--accent-gold)'), 
                  borderRadius: 'var(--radius-md)', 
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: isResolved ? 0.6 : 1,
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={handleNavigate}
                title={`Click card to open related details in ${targetLabel}`}
              >
                {/* Sleek top-right redirect indicator arrow */}
                <div className="kpi-card-arrow" style={{ top: '1rem', right: '1rem' }}>
                  <ArrowUpRight size={16} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1, marginRight: '1.5rem' }}>
                  <div style={{ marginTop: '0.2rem' }}>
                    {isResolved ? (
                      <ShieldCheck size={24} color="var(--accent-emerald)" />
                    ) : (
                      isCritical ? <AlertTriangle size={24} color="var(--accent-rose)" /> : <Clock size={24} color="var(--accent-gold)" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: isResolved ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isResolved ? 'line-through' : 'none' }}>
                        {al.title}
                      </span>
                      <span className={`badge ${isResolved ? 'badge-success' : (isCritical ? 'badge-critical' : 'badge-warning')}`} style={{ fontSize: '0.68rem' }}>
                        {isResolved ? 'RESOLVED' : (al.deadline || 'ACTION PENDING')}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                        Redirects to {targetLabel} ↗
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.5' }}>
                      {al.message}
                    </p>

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.85rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {al.assetTag && (
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                          Tag: {al.assetTag}
                        </span>
                      )}
                      <span>Pending Task: <strong style={{ color: isResolved ? 'var(--text-muted)' : 'var(--text-primary)' }}>{al.actionRequired}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.45rem 0.85rem', 
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate();
                    }}
                    title={`Open in ${targetLabel}`}
                  >
                    <span>Inspect {isBudgetAlert ? 'Quotas' : 'Asset'}</span>
                    <ArrowUpRight size={13} />
                  </button>

                  <button 
                    type="button"
                    className={isResolved ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.45rem 0.9rem', 
                      whiteSpace: 'nowrap',
                      background: isResolved ? 'var(--bg-surface)' : (isCritical ? 'var(--accent-rose)' : 'var(--accent-primary)'),
                      color: '#FFFFFF',
                      zIndex: 2
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(al.id);
                    }}
                  >
                    {isResolved ? 'Undo Resolution' : (
                      <>
                        <Check size={14} style={{ marginRight: '4px' }} />
                        {al.actionRequired ? 'Sign Off & Execute' : 'Mark Resolved'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
