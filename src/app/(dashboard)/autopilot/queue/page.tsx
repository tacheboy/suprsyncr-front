'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useGetQueueQuery,
  useApproveChangeMutation,
  useApplyChangeMutation,
  useRejectChangeMutation,
} from '@/store/services/autopilotApi';
import { ProposalCard } from '../components/ProposalCard';
import { useActiveStoreId } from '@/hooks/useActiveStoreId';
import {
  Sparkles, Zap, ArrowRight, CheckCircle2, Filter,
  Inbox, TrendingUp, Shield, Loader2,
} from 'lucide-react';

type RiskFilter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

export default function ApprovalQueuePage() {
  const { storeId } = useActiveStoreId();
  const { data: queue = [], isLoading } = useGetQueueQuery(storeId, {
    pollingInterval: 10_000, // Auto-refresh every 10s to pick up async proposals
  });
  const [approveChange] = useApproveChangeMutation();
  const [applyChange] = useApplyChangeMutation();
  const [rejectChange] = useRejectChangeMutation();
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [batchApproving, setBatchApproving] = useState(false);

  const handleApproveAndApply = async (changeId: string) => {
    await approveChange({ changeId });
    await applyChange({ changeId });
  };

  const handleReject = async (changeId: string) => {
    await rejectChange(changeId);
  };

  const handleBatchApproveLow = async () => {
    setBatchApproving(true);
    const lowRisk = pendingChanges.filter(c => c.riskLevel === 'LOW');
    for (const change of lowRisk) {
      try {
        await approveChange({ changeId: change.changeId });
        await applyChange({ changeId: change.changeId });
      } catch (e) {
        console.error(`Failed to approve ${change.changeId}`, e);
      }
    }
    setBatchApproving(false);
  };

  const pendingChanges = queue.filter(c => c.status === 'PENDING_APPROVAL');
  const filteredChanges = riskFilter === 'ALL'
    ? pendingChanges
    : pendingChanges.filter(c => c.riskLevel === riskFilter);

  const lowCount = pendingChanges.filter(c => c.riskLevel === 'LOW').length;
  const medCount = pendingChanges.filter(c => c.riskLevel === 'MEDIUM').length;
  const highCount = pendingChanges.filter(c => c.riskLevel === 'HIGH').length;

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-64 rounded-lg animate-pulse" style={{ background: 'var(--bg-muted)' }} />
        <div className="h-4 w-48 rounded animate-pulse" style={{ background: 'var(--bg-muted)' }} />
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-xl animate-pulse" style={{ background: 'var(--bg-muted)' }} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (pendingChanges.length === 0) {
    return (
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center py-20">
          {/* Illustration */}
          <div className="relative mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(108,92,231,0.08)' }}
            >
              <Inbox className="w-10 h-10" style={{ color: 'var(--brand-accent)' }} />
            </div>
            <div
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2"
              style={{
                background: 'rgba(22,163,74,0.1)',
                borderColor: 'var(--bg-page)',
              }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: '#16a34a' }} />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
            Queue is clear!
          </h2>
          <p className="text-sm max-w-md mb-8" style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
            No pending proposals right now. Run the AI agents to analyze your store 
            and generate optimization recommendations.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/autopilot/services"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5 no-underline"
              style={{
                background: 'var(--brand)',
                boxShadow: '0 2px 12px rgba(26,26,46,0.15)',
              }}
            >
              <Zap className="w-4 h-4" />
              Run AI Services
            </Link>
            <Link
              href="/autopilot/impact-lab"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
                color: 'var(--brand-accent)',
              }}
            >
              <TrendingUp className="w-4 h-4" />
              View Impact Lab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--brand-accent)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                Approval Queue
              </h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Review AI-proposed changes to your store — approve in seconds, see impact in days.
            </p>
          </div>
          <Link
            href="/autopilot/impact-lab"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-color)',
              color: 'var(--brand-accent)',
            }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Impact Lab
          </Link>
        </div>

        {/* Summary strip */}
        <div
          className="rounded-xl px-5 py-4 flex items-center justify-between"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid rgba(108,92,231,0.15)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 2px 12px rgba(108,92,231,0.06)',
          }}
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--brand-accent)' }}>
                {pendingChanges.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Pending
              </p>
            </div>
            <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#16a34a' }}>
                <Shield className="w-3 h-3" /> {lowCount} Low
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#d97706' }}>
                <Shield className="w-3 h-3" /> {medCount} Med
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#dc2626' }}>
                <Shield className="w-3 h-3" /> {highCount} High
              </span>
            </div>
          </div>

          {/* Batch approve */}
          {lowCount > 0 && (
            <button
              onClick={handleBatchApproveLow}
              disabled={batchApproving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                background: '#16a34a',
                boxShadow: '0 1px 6px rgba(22,163,74,0.2)',
              }}
            >
              {batchApproving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Approving...</>
              ) : (
                <><CheckCircle2 className="w-3.5 h-3.5" /> Auto-Approve {lowCount} Low Risk</>
              )}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 mr-1" style={{ color: 'var(--text-muted)' }} />
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as RiskFilter[]).map(filter => {
            const isActive = riskFilter === filter;
            const count = filter === 'ALL' ? pendingChanges.length
              : filter === 'LOW' ? lowCount
              : filter === 'MEDIUM' ? medCount
              : highCount;
            return (
              <button
                key={filter}
                onClick={() => setRiskFilter(filter)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--brand-accent)' : 'var(--bg-white)',
                  color: isActive ? 'white' : 'var(--text-body)',
                  border: isActive ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {filter === 'ALL' ? 'All' : filter} ({count})
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filteredChanges.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{
                background: 'var(--bg-white)',
                border: '1px solid var(--border-color)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No {riskFilter !== 'ALL' ? `${riskFilter} risk ` : ''}proposals to show.
              </p>
            </div>
          ) : (
            filteredChanges.map(change => (
              <ProposalCard
                key={change.changeId}
                proposal={change}
                onApprove={() => handleApproveAndApply(change.changeId)}
                onReject={() => handleReject(change.changeId)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
