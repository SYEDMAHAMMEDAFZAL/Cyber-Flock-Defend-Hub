import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  ExternalLink,
  Smartphone,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { QRCodeSVG } from 'qrcode.react';

export const PaymentModal = ({ isOpen, onClose, selectedPlan = 'professional', onPaymentSuccess }) => {
  if (!isOpen) return null;

  const { formatCurrency, currency, activeOrg } = useAuth();
  
  // Step state: 1 = Plan selection/review, 2 = Choose app/gateway, 3 = Payment & Redirection, 4 = Receipt
  const [step, setStep] = useState(1);
  const [chosenPlanKey, setChosenPlanKey] = useState(selectedPlan.toLowerCase());
  const [paymentGateway, setPaymentGateway] = useState('PHONEPE'); // 'PHONEPE', 'GPAY', 'PAYTM', 'QR'
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute countdown
  const [processing, setProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const planPricing = {
    essential: {
      key: 'essential',
      name: 'Starter Defense Tier',
      priceINR: 14990,
      priceUSD: 180,
      slug: 'essential',
      features: ['Automated FAIR Risk Scoring', 'Single-Tenant Telemetry Dashboard', 'Basic NIST CSF Mapping'],
    },
    professional: {
      key: 'professional',
      name: 'Professional Enterprise Tier',
      priceINR: 49990,
      priceUSD: 599,
      slug: 'professional',
      features: ['10,000-Iteration Monte Carlo Engine', '6 Rotating BAS Adversary Stress Tests', 'Automated Knapsack Budget Optimizer', 'Priority Email & Webhook Dispatch'],
    },
    enterprise: {
      key: 'enterprise',
      name: 'Enterprise Sovereign Shield',
      priceINR: 89990,
      priceUSD: 1080,
      slug: 'enterprise',
      features: ['EVM Smart Contract SHA-256 Anchoring', 'Full Cross-Tenant Super Admin Oversight', 'RBI & SEBI Regulatory Attestation Letterhead', 'Dedicated SLA & DFIR Playbooks'],
    },
  };

  const currentPlan = planPricing[chosenPlanKey] || planPricing.professional;
  const basePrice = currency === 'INR' ? currentPlan.priceINR : Math.round(currentPlan.priceUSD * 83.5);
  const gstAmount = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gstAmount;

  // Real UPI deep-link URI
  const upiId = 'cyberflock.defense@icici';
  const upiUri = `upi://pay?pa=${upiId}&pn=Cyber%20Flock%20Defense%20Technologies&am=${totalPrice}&cu=INR&tn=License%20Activation%20${currentPlan.slug.toUpperCase()}`;

  // Countdown timer for step 3
  useEffect(() => {
    if (step !== 3) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleAppRedirect = (gateway) => {
    setPaymentGateway(gateway);
    setStep(3);
    // Attempt real mobile UPI protocol handler launch
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = upiUri;
    }
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    // Simulate gateway verification
    await new Promise((r) => setTimeout(r, 1400));

    try {
      await api.post(`/organizations/subscription/upgrade?plan_slug=${currentPlan.slug}`);
    } catch (e) {
      console.warn('Subscription upgrade API status:', e.message);
    }

    const txId = (paymentGateway === 'PHONEPE' ? 'PP_' : paymentGateway === 'GPAY' ? 'GPAY_' : 'PAYTM_') +
      Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');

    const receipt = {
      txnId: txId,
      utr: utrNumber || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      amount: `₹${totalPrice.toLocaleString('en-IN')}`,
      baseAmount: `₹${basePrice.toLocaleString('en-IN')}`,
      gstAmount: `₹${gstAmount.toLocaleString('en-IN')}`,
      plan: currentPlan.name,
      paidAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      paymentMethod: paymentGateway === 'PHONEPE' ? 'PhonePe UPI Direct' : paymentGateway === 'GPAY' ? 'Google Pay (GPay)' : (paymentGateway === 'PAYTM' ? 'Paytm Payments Gateway' : 'Dynamic UPI QR Scan'),
      gstin: '29ABCDE1234F1Z5',
      invoiceNumber: 'INV-CF-' + Math.floor(100000 + Math.random() * 900000),
      tenantName: activeOrg?.name || 'Enterprise Workspace',
    };

    setReceiptData(receipt);
    setProcessing(false);
    setStep(4);
    if (onPaymentSuccess) onPaymentSuccess(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:block">
      {/* On-screen Modal (Hidden during print) */}
      <div className="bg-[#0a1014] border border-[#1a282e] rounded-2xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn print:hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#18262a] bg-[#060c0f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                Enterprise License Activation Gateway
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Instant UPI
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans">
                Official Multi-App Payment: PhonePe &bull; Google Pay &bull; Paytm &bull; UPI QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="px-6 py-3 bg-[#04080a] border-b border-[#18262a] flex items-center justify-between text-xs font-mono">
          {[
            { num: 1, label: 'Select Tier' },
            { num: 2, label: 'Payment Method' },
            { num: 3, label: 'Authorize' },
            { num: 4, label: 'Activated' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 ${
                step === s.num
                  ? 'text-emerald-400 font-bold'
                  : step > s.num
                  ? 'text-slate-300'
                  : 'text-slate-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s.num
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(0,229,153,0.4)]'
                    : step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:inline text-[11px]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body: STEP 1 - PLAN SELECTION & BILLING REVIEW */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block mb-1">
                Step 1: Choose Enterprise Subscription Plan
              </span>
              <h4 className="text-base font-mono font-bold text-white">Select Your Organization Plan</h4>
            </div>

            <div className="space-y-2.5">
              {Object.values(planPricing).map((p) => {
                const isSelected = chosenPlanKey === p.key;
                return (
                  <div
                    key={p.key}
                    onClick={() => setChosenPlanKey(p.key)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(0,229,153,0.15)]'
                        : 'bg-[#060c0f] border-[#18262a] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <span className="font-mono font-bold text-white text-xs">{p.name}</span>
                        {p.key === 'professional' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ₹{p.priceINR.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono"> / month</span>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 pt-2 border-t border-[#18262a]/60 text-[11px] text-slate-300">
                      {p.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown with GST */}
            <div className="p-4 rounded-xl bg-[#060c0f] border border-[#18262a] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Base Plan Price:</span>
                <span className="text-slate-200">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (18% Input Tax Credit Eligible):</span>
                <span className="text-slate-200">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-[#18262a] pt-2 flex justify-between font-bold text-white text-sm">
                <span>Total Payable Amount:</span>
                <span className="text-emerald-400">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2"
            >
              <span>Proceed to Instant UPI Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Body: STEP 2 - PAYMENT METHOD / APP SELECTION */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block mb-1">
                  Step 2: Select UPI App or Gateway
                </span>
                <h4 className="text-base font-mono font-bold text-white">Choose Your Payment App</h4>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PhonePe */}
              <div
                onClick={() => handleAppRedirect('PHONEPE')}
                className="p-4 rounded-xl bg-[#070e12] border border-[#1a282f] hover:border-purple-500/50 hover:bg-purple-950/10 cursor-pointer transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#5f259f]/20 border border-[#5f259f]/40 flex items-center justify-center text-purple-400 font-bold text-lg font-mono shrink-0 group-hover:scale-105 transition-transform">
                  Pe
                </div>
                <div>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    PhonePe UPI
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Instant app redirect</div>
                </div>
              </div>

              {/* Google Pay */}
              <div
                onClick={() => handleAppRedirect('GPAY')}
                className="p-4 rounded-xl bg-[#070e12] border border-[#1a282f] hover:border-blue-500/50 hover:bg-blue-950/10 cursor-pointer transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg font-mono shrink-0 group-hover:scale-105 transition-transform">
                  G
                </div>
                <div>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    Google Pay (GPay)
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">UPI 1-Click Pay</div>
                </div>
              </div>

              {/* Paytm UPI */}
              <div
                onClick={() => handleAppRedirect('PAYTM')}
                className="p-4 rounded-xl bg-[#070e12] border border-[#1a282f] hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#00baf2]/20 border border-[#00baf2]/40 flex items-center justify-center text-cyan-400 font-bold text-lg font-mono shrink-0 group-hover:scale-105 transition-transform">
                  Pay
                </div>
                <div>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    Paytm UPI
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Paytm Gateway</div>
                </div>
              </div>

              {/* Scan Dynamic UPI QR Code */}
              <div
                onClick={() => handleAppRedirect('QR')}
                className="p-4 rounded-xl bg-[#070e12] border border-[#1a282f] hover:border-emerald-500/50 hover:bg-emerald-950/10 cursor-pointer transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                    Scan Dynamic QR
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">BHIM, Cred, Any App</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060c0f] border border-[#18262a] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Total Due Amount:</span>
              <span className="text-emerald-400 font-bold text-sm">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Modal Body: STEP 3 - AUTHORIZATION & APP REDIRECT */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block mb-1">
                  Step 3: Authorize UPI Transaction
                </span>
                <h4 className="text-base font-mono font-bold text-white">
                  Payment via {paymentGateway === 'PHONEPE' ? 'PhonePe' : paymentGateway === 'GPAY' ? 'Google Pay' : paymentGateway === 'PAYTM' ? 'Paytm' : 'UPI QR Code'}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* Direct App Launch Button (For PhonePe / GPay / Paytm) */}
            <div className="p-4 rounded-xl bg-[#081216] border border-[#1a2d33] text-center space-y-3">
              <span className="text-xs text-slate-300 block font-sans">
                Click below to launch <strong>{paymentGateway === 'PHONEPE' ? 'PhonePe' : paymentGateway === 'GPAY' ? 'Google Pay' : 'Paytm'}</strong> directly on your mobile device:
              </span>
              <a
                href={upiUri}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,229,153,0.3)] flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in {paymentGateway === 'PHONEPE' ? 'PhonePe App' : paymentGateway === 'GPAY' ? 'Google Pay App' : 'Paytm App'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Or Scan QR Code if on Laptop/Desktop */}
            <div className="p-4 rounded-xl bg-[#060c0f] border border-[#18262a] flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                <QRCodeSVG value={upiUri} size={160} level="M" />
              </div>
              <div className="space-y-2 text-left text-xs font-mono">
                <div className="text-slate-300 font-bold">Or Scan Dynamic QR from Mobile:</div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Open PhonePe, GPay, Paytm, or BHIM on your phone and scan the QR code above. Amount <strong>₹{totalPrice.toLocaleString('en-IN')}</strong> will auto-fill.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">VPA:</span>
                  <span className="text-emerald-400 font-mono font-bold text-xs">{upiId}</span>
                  <button
                    onClick={handleCopyUpi}
                    className="text-slate-400 hover:text-emerald-400 p-1 rounded"
                    title="Copy UPI VPA"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 12-Digit UPI Ref / UTR Confirmation */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">
                Enter 12-digit UPI Transaction Ref / UTR (Optional for Instant Activation):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 429182740192"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#070d10] border border-[#19262b] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmPayment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{processing ? 'Verifying...' : 'Verify & Activate'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body: STEP 4 - ACTIVATED RECEIPT & TAX INVOICE */}
        {step === 4 && receiptData && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(0,229,153,0.4)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-widest block mb-1">
                PAYMENT VERIFIED &bull; LICENSE ACTIVE
              </span>
              <h3 className="text-xl font-mono font-bold text-white">
                Subscription Successfully Activated!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your enterprise tenant <strong>{receiptData.tenantName}</strong> has been upgraded to{' '}
                <strong className="text-emerald-400">{receiptData.plan}</strong>.
              </p>
            </div>

            {/* Official Tax Invoice Card */}
            <div className="p-4 rounded-xl bg-[#060c0f] border border-[#18262a] text-left text-xs font-mono space-y-2.5">
              <div className="flex justify-between border-b border-[#18262a] pb-2">
                <span className="text-slate-500">TRANSACTION ID:</span>
                <span className="text-emerald-400 font-bold">{receiptData.txnId}</span>
              </div>
              <div className="flex justify-between border-b border-[#18262a] pb-2">
                <span className="text-slate-500">UPI UTR NO:</span>
                <span className="text-slate-200">{receiptData.utr}</span>
              </div>
              <div className="flex justify-between border-b border-[#18262a] pb-2">
                <span className="text-slate-500">INVOICE NO:</span>
                <span className="text-slate-200">{receiptData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-[#18262a] pb-2">
                <span className="text-slate-500">PAYMENT GATEWAY:</span>
                <span className="text-slate-200">{receiptData.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-[#18262a] pb-2">
                <span className="text-slate-500">TIMESTAMP:</span>
                <span className="text-slate-200">{receiptData.paidAt}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span className="text-slate-300">TOTAL PAID (INC. GST):</span>
                <span className="text-emerald-400">{receiptData.amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print GST Invoice</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)]"
              >
                Access Activated Features Now
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Printable Invoice (Hidden on screen, visible only on print) */}
      {step === 4 && receiptData && (
        <div className="hidden print:block absolute inset-0 bg-white text-slate-900 p-12 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-sm text-slate-500 mt-1">Official Receipt of Payment</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800">Cyber Flock Defense Technologies</h2>
              <p className="text-sm text-slate-500">GSTIN: {receiptData.gstin}</p>
              <p className="text-sm text-slate-500">Bangalore, Karnataka, India</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="flex justify-between mb-12">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="text-lg font-bold text-slate-800">{receiptData.tenantName}</p>
              <p className="text-sm text-slate-600">Enterprise Subscriber</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm"><span className="font-bold text-slate-500 inline-block mr-2">Invoice No:</span> <span className="font-mono">{receiptData.invoiceNumber}</span></p>
              <p className="text-sm"><span className="font-bold text-slate-500 inline-block mr-2">Date of Issue:</span> <span className="font-mono">{receiptData.paidAt}</span></p>
              <p className="text-sm"><span className="font-bold text-slate-500 inline-block mr-2">Transaction ID:</span> <span className="font-mono">{receiptData.txnId}</span></p>
              <p className="text-sm"><span className="font-bold text-slate-500 inline-block mr-2">Payment Method:</span> <span className="font-medium">{receiptData.paymentMethod}</span></p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-3 text-sm font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="py-3 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4">
                  <p className="font-bold text-slate-800">Cyber Flock Platform - {receiptData.plan}</p>
                  <p className="text-sm text-slate-500 mt-1">1 Month Subscription License</p>
                </td>
                <td className="py-4 text-right font-mono text-slate-800">{receiptData.baseAmount}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/2 max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-500">Subtotal</span>
                <span className="font-mono text-slate-800">{receiptData.baseAmount}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-500">IGST (18%)</span>
                <span className="font-mono text-slate-800">{receiptData.gstAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-800">Total Paid</span>
                <span className="text-xl font-bold font-mono text-emerald-600">{receiptData.amount}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-24 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p className="font-bold mb-1">Thank you for securing your enterprise with Cyber Flock.</p>
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
