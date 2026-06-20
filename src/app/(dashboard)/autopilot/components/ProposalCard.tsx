'use client';

import { useState } from 'react';
import { ProposedChange } from '@/store/services/autopilotApi';
import {
  ChevronDown, ChevronUp, Shield, FileText, Search, ShoppingCart,
  DollarSign, CheckCircle2, XCircle, ArrowUpRight, Sparkles,
} from 'lucide-react';

interface Props {
  proposal: ProposedChange;
  onApprove: () => void;
  onReject?: () => void;
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

function changeTypeConfig(changeType: string) {
  switch (changeType) {
    case 'PRODUCT_TITLE':
      return { label: 'Title Change', icon: FileText, color: '#6C5CE7' };
    case 'PRODUCT_DESCRIPTION':
      return { label: 'Description Rewrite', icon: FileText, color: '#6C5CE7' };
    case 'META_TITLE':
      return { label: 'SEO Title', icon: Search, color: '#0891b2' };
    case 'META_DESCRIPTION':
      return { label: 'SEO Description', icon: Search, color: '#0891b2' };
    case 'PRICE_CHANGE':
      return { label: 'Price Adjustment', icon: DollarSign, color: '#d97706' };
    case 'CART_RECOVERY_COPY':
      return { label: 'Cart Recovery', icon: ShoppingCart, color: '#059669' };
    default:
      return { label: changeType, icon: FileText, color: '#6C5CE7' };
  }
}

function agentLabel(agentType: string): string {
  switch (agentType) {
    case 'LISTING_DOCTOR': return 'Listing Doctor';
    case 'SEO_COMMANDER': return 'SEO Commander';
    case 'CART_RECOVERY': return 'Cart Recovery';
    case 'PRICING_STRATEGIST': return 'Pricing Strategist';
    default: return agentType;
  }
}

function parseTextValue(raw: any): string {
  if (typeof raw === 'string') {
    // Try to parse as JSON string (backend wraps values in JSON)
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed;
      return raw;
    } catch {
      return raw;
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    // If it's a JSON node with text content
    if (typeof raw.textValue === 'string') return raw.textValue;
    if (typeof raw.asText === 'string') return raw.asText;
    return JSON.stringify(raw);
  }
  return String(raw || '');
}

const riskConfig = {
  LOW: { bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', color: '#16a34a', label: 'LOW RISK' },
  MEDIUM: { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)', color: '#d97706', label: 'MEDIUM RISK' },
  HIGH: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.2)', color: '#dc2626', label: 'HIGH RISK' },
};

/* ─── Component ─────────────────────────────────────────────────────── */

export function ProposalCard({ proposal, onApprove, onReject }: Props) {
  const [showReasoning, setShowReasoning] = useState(false);
  const ctConfig = changeTypeConfig(proposal.changeType);
  const CtIcon = ctConfig.icon;
  const risk = riskConfig[proposal.riskLevel] || riskConfig.LOW;
  const currentText = parseTextValue(proposal.currentValue);
  const proposedText = parseTextValue(proposal.proposedValue);

  const impactPercent = proposal.estimatedImpact?.changePercent;
  const impactConfidence = proposal.estimatedImpact?.confidence;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${ctConfig.color}14`, color: ctConfig.color }}
          >
            <CtIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
              {ctConfig.label}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              by {agentLabel(proposal.agentType)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Impact badge */}
          {impactPercent != null && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold"
              style={{ background: 'rgba(22,163,74,0.06)', color: '#16a34a' }}
            >
              <ArrowUpRight className="w-3 h-3" />
              +{impactPercent}%
            </div>
          )}
          {/* Risk badge */}
          <span
            className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
            style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}
          >
            {risk.label}
          </span>
        </div>
      </div>

      {/* Diff view */}
      <div className="px-5 py-4 space-y-3">
        {/* Current (red) */}
        <div
          className="rounded-lg px-4 py-3"
          style={{ background: 'rgba(220,38,38,0.03)', border: '1px solid rgba(220,38,38,0.1)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#dc2626' }}>
            Current
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-body)', textDecoration: 'line-through', opacity: 0.7 }}
          >
            {currentText || '(empty)'}
          </p>
        </div>

        {/* Proposed (green) */}
        <div
          className="rounded-lg px-4 py-3"
          style={{ background: 'rgba(22,163,74,0.03)', border: '1px solid rgba(22,163,74,0.15)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#16a34a' }}>
            Proposed
          </p>
          <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-heading)' }}>
            {proposedText || '(empty)'}
          </p>
        </div>
      </div>

      {/* Reasoning toggle */}
      <div
        className="px-5 py-3"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: 'var(--brand-accent)' }}
        >
          <Sparkles className="w-3 h-3" />
          {showReasoning ? 'Hide' : 'Show'} Agent Reasoning
          {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded reasoning */}
      {showReasoning && (
        <div
          className="px-5 pb-4 -mt-1"
        >
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(108,92,231,0.03)', border: '1px solid rgba(108,92,231,0.1)' }}
          >
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-body)' }}>
              {proposal.agentReasoning}
            </p>
            {impactConfidence != null && (
              <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>
                  <strong style={{ color: 'var(--text-heading)' }}>Impact:</strong>{' '}
                  {impactPercent != null ? `+${impactPercent}%` : '—'} on {proposal.estimatedImpact?.metric}
                </span>
                <span>
                  <strong style={{ color: 'var(--text-heading)' }}>Confidence:</strong>{' '}
                  {(impactConfidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div
        className="px-5 py-3 flex items-center justify-end gap-2"
        style={{ background: 'var(--bg-page)', borderTop: '1px solid var(--border-color)' }}
      >
        {onReject && (
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-body)',
            }}
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject
          </button>
        )}
        <button
          onClick={onApprove}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{
            background: 'var(--brand)',
            boxShadow: '0 1px 6px rgba(26,26,46,0.12)',
          }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approve & Apply
        </button>
      </div>
    </div>
  );
}
