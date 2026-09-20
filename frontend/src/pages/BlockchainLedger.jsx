import React, { useState, useEffect } from 'react';
import { Server, Link, ShieldCheck, Activity, FileText, Download } from 'lucide-react';
import { fabricAPI } from '../api/client';

export const BlockchainLedger = () => {
  const [status, setStatus] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, txRes] = await Promise.allSettled([
          fabricAPI.getStatus(),
          fabricAPI.getAllRisks()
        ]);
        
        if (statusRes.status === 'fulfilled' && statusRes.value.data.success) {
          setStatus(statusRes.value.data);
        }
        if (txRes.status === 'fulfilled' && txRes.value.data.success) {
          // Sort by timestamp descending so the newest is at the top
          const sortedTx = txRes.value.data.data.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          setTransactions(sortedTx);
        }
      } catch (error) {
        console.error("Failed to fetch Fabric data:", error);
      }
    };

    fetchData(); // Initial load

    // Continuously update the feed every 5 seconds
    let intervalId;
    if (isPolling) {
      intervalId = setInterval(fetchData, 5000);
    }
    
    return () => clearInterval(intervalId);
  }, [isPolling]);

  if (!status) return <div className="p-8 text-emerald-400 font-mono">Connecting to Hyperledger Fabric Orderer...</div>;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="border-b border-[#18262a] pb-4">
        <h1 className="text-2xl font-mono font-bold text-white">Distributed Ledger Audit Trail</h1>
        <p className="text-sm text-slate-400">Hyperledger Fabric 2.5 Tamper-Evident Verification</p>
      </div>

      {/* Network Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#060b0e] p-5 rounded-xl border border-[#18262a] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">Network</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-sm text-white truncate">{status.network}</div>
          <div className="text-xs text-slate-400 mt-1">Status: <strong className="text-emerald-400">CONNECTED</strong></div>
        </div>
        
        <div className="bg-[#060b0e] p-5 rounded-xl border border-[#18262a] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">World State Height</span>
            <Link className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-bold text-2xl text-cyan-400 font-mono tracking-tight">{status.blockHeight}</div>
          <div className="text-xs text-slate-400 mt-1 truncate">Ch: {status.channel} | CC: {status.chaincode}</div>
        </div>
        
        <div className="bg-[#060b0e] p-5 rounded-xl border border-[#18262a] shadow-lg md:col-span-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-2">Block Hashes</div>
          <div className="space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase mr-2">Latest Hash:</span>
              <span className="font-bold text-xs text-amber-400 font-mono break-all">{status.latestBlockHash}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase mr-2">Prev Hash:</span>
              <span className="font-bold text-[10px] text-slate-400 font-mono break-all">{status.previousBlockHash}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Transaction Feed */}
      <div className="bg-[#060b0e] border border-[#18262a] rounded-xl overflow-hidden shadow-lg mt-8">
        <div className="px-4 py-3 border-b border-[#18262a] flex items-center gap-2 bg-[#081115]">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Live Commits</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#04080a] text-slate-500">
              <tr>
                <th className="px-4 py-3">Risk ID</th>
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">Financial Risk</th>
                <th className="px-4 py-3">SHA-256 Digest</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 divide-y divide-[#18262a]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#0a1216] transition-colors">
                  <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{tx.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{tx.endpointId}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-red-400 whitespace-nowrap">Score: {tx.riskScore}</span>
                      <span className="text-slate-400 whitespace-nowrap">VaR: ${Number(tx.var).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-emerald-400 truncate max-w-[200px]" title={tx.sha256Hash}>
                      {tx.sha256Hash}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex flex-col gap-1">
                      <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 w-max font-bold">
                        <ShieldCheck className="w-3 h-3" /> COMMITTED
                      </span>
                      <span className="text-[10px] text-slate-500">{tx.verification}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        const reportContent = `Cyber Flock Defense Hub - Ledger Audit Report\n\nRisk ID: ${tx.id}\nEndpoint: ${tx.endpointId}\nRisk Score: ${tx.riskScore}\nFinancial Value at Risk: $${tx.var}\n\nBlockchain Anchor:\nSHA-256 Digest: ${tx.sha256Hash}\nTimestamp: ${new Date(tx.timestamp).toISOString()}\nStatus: COMMITTED (Hyperledger Fabric 2.5)\nVerification: Org1MSP & Org2MSP Endorsed`;
                        const blob = new Blob([reportContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Audit_Report_${tx.id}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 p-2 rounded hover:bg-emerald-400/10 transition-colors inline-flex"
                      title="Download Audit Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No transactions found in the ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockchainLedger;
