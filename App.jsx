import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Receipt, CreditCard, UserCheck, 
  PlusCircle, Edit3, Trash2, CheckCircle2, Clock, Phone, Home, 
  FileText, Search, Printer, LogOut, Lock, ArrowRight, ShieldAlert,
  Zap, AlertCircle, KeyRound, CheckCircle, RefreshCw, 
  Smartphone, Send, Calculator, UserEdit
} from 'lucide-react';

// Demo Initial Tenants Data
const INITIAL_TENANTS = [
  {
    id: 't1',
    name: 'আব্দুর রহিম',
    phone: '01711000001',
    flatNo: 'ফ্ল্যাট ৪-এ',
    rent: 12000,
    wasteBill: 100,
    otherBill: 200,
    month: 'নভেম্বর ২০২৬',
    prevUnit: 1050,
    currUnit: 1200,
    unitRate: 10,
    paidAmount: 10000,
    lastTrxId: 'TXN984321',
    paymentMethod: 'bKash'
  },
  {
    id: 't2',
    name: 'কামরুল হাসান',
    phone: '01822000002',
    flatNo: 'ফ্ল্যাট ৩-বি',
    rent: 15000,
    wasteBill: 100,
    otherBill: 300,
    month: 'নভেম্বর ২০২৬',
    prevUnit: 800,
    currUnit: 1010,
    unitRate: 10,
    paidAmount: 17500,
    lastTrxId: 'NGD554129',
    paymentMethod: 'Nagad'
  },
  {
    id: 't3',
    name: 'ফারহানা ইয়াসমিন',
    phone: '01933000003',
    flatNo: 'ফ্ল্যাট ২-এ',
    rent: 10500,
    wasteBill: 100,
    otherBill: 0,
    month: 'নভেম্বর ২০২৬',
    prevUnit: 500,
    currUnit: 620,
    unitRate: 10,
    paidAmount: 0,
    lastTrxId: '',
    paymentMethod: ''
  }
];

export default function App() {
  const [role, setRole] = useState('owner'); // 'owner' or 'tenant'
  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('rent_manager_v6');
      return saved ? JSON.parse(saved) : INITIAL_TENANTS;
    } catch (err) {
      console.error('LocalStorage read error:', err);
      return INITIAL_TENANTS;
    }
  });

  // Owner Payment Gateway Numbers
  const [paymentGateways] = useState({
    bkash: '01712345678',
    nagad: '01812345678',
    rocket: '01912345678',
    bank: 'DBBL Acc: 123-456-7890 (Sonali Bank)'
  });

  // Copy state feedback
  const [copiedKey, setCopiedKey] = useState('');

  // Tenant Login State with OTP
  const [tenantPhone, setTenantPhone] = useState('');
  const [loginStep, setLoginStep] = useState('phone'); // 'phone' | 'otp'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '']);
  const [tempTenant, setTempTenant] = useState(null);
  const [loggedInTenant, setLoggedInTenant] = useState(null);
  const [loginError, setLoginError] = useState('');

  // Tenant online TrxID submission
  const [inputTrxId, setInputTrxId] = useState('');
  const [inputPayMethod, setInputPayMethod] = useState('bKash');
  const [inputPayAmount, setInputPayAmount] = useState('');
  const [trxSuccessMsg, setTrxSuccessMsg] = useState('');

  // Modals UI state
  const [isTenantAddModalOpen, setIsTenantAddModalOpen] = useState(false);
  const [selectedRoomForBill, setSelectedRoomForBill] = useState(null);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReceiptTenant, setSelectedReceiptTenant] = useState(null);

  // Add Tenant Form State
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    phone: '',
    flatNo: '',
    rent: '',
    wasteBill: '100',
    otherBill: '0',
    month: 'নভেম্বর ২০২৬',
    prevUnit: '0',
    currUnit: '0',
    unitRate: '10'
  });

  // Edit Tenant Info Form State
  const [editTenantData, setEditTenantData] = useState({
    name: '',
    phone: '',
    flatNo: '',
    rent: ''
  });

  // Room Bill & Payment Popup Form State
  const [billFormData, setBillFormData] = useState({
    rent: '0',
    prevUnit: '0',
    currUnit: '0',
    unitRate: '10',
    wasteBill: '100',
    otherBill: '0',
    paidAmount: '0',
    month: 'নভেম্বর ২০২৬'
  });

  useEffect(() => {
    try {
      localStorage.setItem('rent_manager_v6', JSON.stringify(tenants));
    } catch (err) {
      console.error('LocalStorage write error:', err);
    }
  }, [tenants]);

  // Copy helper
  const handleCopy = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Helper function to calculate electricity & financial totals
  const calculateTenantSummary = (t) => {
    if (!t) return { usedUnits: 0, elecBill: 0, totalBill: 0, dueAmount: 0, paid: 0, status: 'Due' };
    const rent = Number(t.rent) || 0;
    const prevU = Number(t.prevUnit) || 0;
    const currU = Number(t.currUnit) || 0;
    const rateU = Number(t.unitRate) || 0;

    const usedUnits = Math.max(0, currU - prevU);
    const elecBill = usedUnits * rateU;

    const waste = Number(t.wasteBill) || 0;
    const other = Number(t.otherBill) || 0;
    const paid = Number(t.paidAmount) || 0;

    const totalBill = rent + elecBill + waste + other;
    const dueAmount = Math.max(0, totalBill - paid);

    let status = 'Due';
    if (paid >= totalBill && totalBill > 0) {
      status = 'Paid';
    } else if (paid > 0 && paid < totalBill) {
      status = 'Partial';
    }

    return { usedUnits, elecBill, totalBill, dueAmount, paid, status };
  };

  // OTP Handlers
  const handleSendOtp = (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPhone = tenantPhone.trim();
    const found = tenants.find(t => t.phone === cleanPhone);

    if (found) {
      const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(mockOtp);
      setTempTenant(found);
      setLoginStep('otp');
      setEnteredOtp(['', '', '', '']);
    } else {
      setLoginError('এই নম্বরটি রেজিস্টার্ড নয়। বাসা মালিকের সাথে যোগাযোগ করুন।');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fullOtp = enteredOtp.join('');
    if (fullOtp === generatedOtp || fullOtp === '1234') {
      setLoggedInTenant(tempTenant);
      setLoginStep('phone');
      setEnteredOtp(['', '', '', '']);
      setLoginError('');
    } else {
      setLoginError('ভুল ওটিপি (OTP) কোড দিয়েছেন। আবার চেষ্টা করুন।');
    }
  };

  const handleOtpInput = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...enteredOtp];
    newOtp[index] = value;
    setEnteredOtp(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  useEffect(() => {
    if (loggedInTenant) {
      const updated = tenants.find(t => t.id === loggedInTenant.id);
      if (updated) setLoggedInTenant(updated);
    }
  }, [tenants]);

  // Open Room Bill Popup (When Clicking Room Card)
  const openRoomBillModal = (tenant) => {
    setSelectedRoomForBill(tenant);
    setBillFormData({
      rent: (tenant.rent || 0).toString(),
      prevUnit: (tenant.prevUnit || 0).toString(),
      currUnit: (tenant.currUnit || 0).toString(),
      unitRate: (tenant.unitRate || 10).toString(),
      wasteBill: (tenant.wasteBill || 100).toString(),
      otherBill: (tenant.otherBill || 0).toString(),
      paidAmount: (tenant.paidAmount || 0).toString(),
      month: tenant.month || 'নভেম্বর ২০২৬'
    });
  };

  // Open Edit Tenant Details Popup
  const openEditTenantModal = (tenant, e) => {
    e.stopPropagation();
    setSelectedTenantForEdit(tenant);
    setEditTenantData({
      name: tenant.name || '',
      phone: tenant.phone || '',
      flatNo: tenant.flatNo || '',
      rent: (tenant.rent || 0).toString()
    });
  };

  // Save Tenant Name & Phone Updates
  const handleSaveTenantInfo = (e) => {
    e.preventDefault();
    if (!selectedTenantForEdit) return;

    setTenants(prev => prev.map(t => {
      if (t.id === selectedTenantForEdit.id) {
        return {
          ...t,
          name: editTenantData.name,
          phone: editTenantData.phone,
          flatNo: editTenantData.flatNo,
          rent: Number(editTenantData.rent) || 0
        };
      }
      return t;
    }));

    setSelectedTenantForEdit(null);
  };

  // Save Room Bill and Payment Entry
  const handleSaveRoomBill = (e) => {
    e.preventDefault();
    if (!selectedRoomForBill) return;

    const rentNum = Number(billFormData.rent) || 0;
    const prevUNum = Number(billFormData.prevUnit) || 0;
    const currUNum = Number(billFormData.currUnit) || 0;
    const rateUNum = Number(billFormData.unitRate) || 0;
    const wasteNum = Number(billFormData.wasteBill) || 0;
    const otherNum = Number(billFormData.otherBill) || 0;
    const paidNum = Number(billFormData.paidAmount) || 0;

    setTenants(prev => prev.map(t => {
      if (t.id === selectedRoomForBill.id) {
        return {
          ...t,
          rent: rentNum,
          prevUnit: prevUNum,
          currUnit: currUNum,
          unitRate: rateUNum,
          wasteBill: wasteNum,
          otherBill: otherNum,
          paidAmount: paidNum,
          month: billFormData.month
        };
      }
      return t;
    }));

    setSelectedRoomForBill(null);
  };

  // Add New Renter Logic
  const handleAddNewTenant = (e) => {
    e.preventDefault();
    const newEntry = {
      id: 't_' + Date.now(),
      name: newTenantData.name,
      phone: newTenantData.phone,
      flatNo: newTenantData.flatNo,
      rent: Number(newTenantData.rent) || 0,
      wasteBill: Number(newTenantData.wasteBill) || 100,
      otherBill: Number(newTenantData.otherBill) || 0,
      month: newTenantData.month,
      prevUnit: Number(newTenantData.prevUnit) || 0,
      currUnit: Number(newTenantData.currUnit) || 0,
      unitRate: Number(newTenantData.unitRate) || 10,
      paidAmount: 0,
      lastTrxId: '',
      paymentMethod: ''
    };
    setTenants(prev => [newEntry, ...prev]);
    setIsTenantAddModalOpen(false);
    setNewTenantData({
      name: '',
      phone: '',
      flatNo: '',
      rent: '',
      wasteBill: '100',
      otherBill: '0',
      month: 'নভেম্বর ২০২৬',
      prevUnit: '0',
      currUnit: '0',
      unitRate: '10'
    });
  };

  // Tenant TrxID Submit Logic
  const handleSubmitTrxId = (e) => {
    e.preventDefault();
    if (!loggedInTenant) return;
    const addPay = Number(inputPayAmount) || 0;

    setTenants(prev => prev.map(t => {
      if (t.id === loggedInTenant.id) {
        return {
          ...t,
          paidAmount: (t.paidAmount || 0) + addPay,
          lastTrxId: inputTrxId,
          paymentMethod: inputPayMethod
        };
      }
      return t;
    }));

    setTrxSuccessMsg('ধন্যবাদ! আপনার পেমেন্ট ট্রানজেকশন আইডি মালিকের নিকট জমা হয়েছে।');
    setInputTrxId('');
    setInputPayAmount('');
    setTimeout(() => setTrxSuccessMsg(''), 4000);
  };

  // Delete Renter
  const handleDeleteTenant = (id, e) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি এই ভাড়াটিয়ার তথ্য মুছে ফেলতে নিশ্চিত?')) {
      setTenants(prev => prev.filter(t => t.id !== id));
    }
  };

  // Financial Summaries
  let overallTotalBill = 0;
  let overallTotalPaid = 0;
  let overallTotalDue = 0;
  let paidCount = 0;
  let partialCount = 0;
  let dueCount = 0;

  tenants.forEach(t => {
    const summary = calculateTenantSummary(t);
    overallTotalBill += summary.totalBill;
    overallTotalPaid += summary.paid;
    overallTotalDue += summary.dueAmount;

    if (summary.status === 'Paid') paidCount++;
    else if (summary.status === 'Partial') partialCount++;
    else dueCount++;
  });

  const filteredTenants = tenants.filter(t => {
    const summary = calculateTenantSummary(t);
    const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.flatNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.phone || '').includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || summary.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      
      {/* Navbar Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-teal-800/40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl shadow-md text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
                বাসা ভাড়া ও বিল হাব
              </h1>
              <p className="text-[11px] text-teal-300/80 font-medium">স্মার্ট বাসা ভাড়া ও মিটার হিসাব</p>
            </div>
          </div>

          <div className="bg-slate-800/90 p-1 rounded-xl flex items-center gap-1 border border-slate-700/80 shadow-inner">
            <button
              onClick={() => { setRole('owner'); setLoggedInTenant(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'owner' 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              মালিক ড্যাশবোর্ড
            </button>
            <button
              onClick={() => setRole('tenant')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'tenant' 
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              ভাড়াটিয়া ড্যাশবোর্ড (OTP)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* ================= OWNER PANEL ================= */}
        {role === 'owner' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>মালিক ড্যাশবোর্ড</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                    Admin
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  💡 <span className="font-bold text-teal-700">রুমের উপর ক্লিক করুন</span> — ইউনিটের মিটার রিডিং, বাসা ভাড়া ও জমা টাকা আপডেট করতে
                </p>
              </div>
              <button
                onClick={() => setIsTenantAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                নতুন ফ্ল্যাট / ভাড়াটিয়া যোগ করুন
              </button>
            </div>

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-2">
                  সর্বমোট হিসেবকৃত বিল
                  <Receipt className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-slate-800">৳ {overallTotalBill.toLocaleString('bn-BD')}</div>
                <p className="text-[11px] text-slate-400 mt-1">ভাড়া + কারেন্ট + ময়লা ফি</p>
              </div>

              <div className="bg-emerald-50/80 p-4.5 rounded-2xl border border-emerald-200 shadow-sm">
                <div className="flex justify-between items-center text-emerald-800 text-xs font-bold uppercase mb-2">
                  মোট জমা পাওয়া টাকা
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-700">৳ {overallTotalPaid.toLocaleString('bn-BD')}</div>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">প্রাপ্ত টাকা</p>
              </div>

              <div className="bg-rose-50/80 p-4.5 rounded-2xl border border-rose-200 shadow-sm">
                <div className="flex justify-between items-center text-rose-800 text-xs font-bold uppercase mb-2">
                  সর্বমোট বকেয়া (Due)
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-black text-rose-700">৳ {overallTotalDue.toLocaleString('bn-BD')}</div>
                <p className="text-[11px] text-rose-600 font-medium mt-1">{dueCount + partialCount} টি ফ্ল্যাটে বকেয়া আছে</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase mb-2">
                  মোট ফ্ল্যাট / ভাড়াটিয়া
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl font-black text-slate-800">{tenants.length} টি</div>
                <p className="text-[11px] text-slate-400 mt-1">নিবন্ধিত রুমসমূহ</p>
              </div>
            </div>

            {/* Filter Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ফ্ল্যাট, নাম বা মোবাইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-slate-500 mr-1">ফিল্টার:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  সব ({tenants.length})
                </button>
                <button
                  onClick={() => setFilterStatus('Paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'Paid' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  পরিশোধিত ({paidCount})
                </button>
                <button
                  onClick={() => setFilterStatus('Partial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'Partial' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  আংশিক ({partialCount})
                </button>
                <button
                  onClick={() => setFilterStatus('Due')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === 'Due' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  বকেয়া ({dueCount})
                </button>
              </div>
            </div>

            {/* ROOM / TENANT CARDS GRID */}
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-teal-600" />
                  রুম তালিকা (বিদ্যুৎ ইউনিট ও টাকা জমা দিতে রুমে ক্লিক করুন)
                </span>
                <span className="text-xs text-slate-500 font-normal">রুম সংখ্যা: {filteredTenants.length}টি</span>
              </h3>

              {filteredTenants.length === 0 ? (
                <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">কোনো ফ্ল্যাট বা ভাড়াটিয়া পাওয়া যায়নি!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTenants.map((t) => {
                    const summary = calculateTenantSummary(t);
                    return (
                      <div
                        key={t.id}
                        onClick={() => openRoomBillModal(t)}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 cursor-pointer transition-all duration-200 relative group"
                      >
                        {/* Top Badge & Room Title */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-block bg-teal-100 text-teal-800 font-black text-xs px-2.5 py-1 rounded-lg border border-teal-200">
                              {t.flatNo}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <h4 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                                {t.name}
                              </h4>
                              {/* Edit Tenant Name Button */}
                              <button
                                onClick={(e) => openEditTenantModal(t, e)}
                                className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
                                title="ভাড়াটিয়ার নাম ও তথ্য এডিট করুন"
                              >
                                <UserEdit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {t.phone}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {summary.status === 'Paid' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3" /> পরিশোধিত
                              </span>
                            )}
                            {summary.status === 'Partial' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <Clock className="w-3 h-3" /> আংশিক
                              </span>
                            )}
                            {summary.status === 'Due' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <AlertCircle className="w-3 h-3" /> বকেয়া
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Financial Info & Meter Calculation */}
                        <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>বাসা ভাড়া:</span>
                            <span className="font-bold">৳ {(t.rent || 0).toLocaleString('bn-BD')}</span>
                          </div>

                          {/* Unit Electricity Breakdown */}
                          <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200/60 my-1 text-[11px] space-y-0.5 text-amber-900">
                            <div className="flex justify-between font-bold">
                              <span>⚡ বিদ্যুৎ ইউনিট ({t.currUnit || 0} - {t.prevUnit || 0}):</span>
                              <span>{summary.usedUnits} ইউনিট</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-amber-700">
                              <span>রেট: ৳{t.unitRate || 10}/ইউনিট</span>
                              <span className="font-bold text-amber-900">বিল: ৳ {summary.elecBill.toLocaleString('bn-BD')}</span>
                            </div>
                          </div>

                          <div className="flex justify-between text-slate-600">
                            <span>ময়লা + অন্যান্য:</span>
                            <span className="font-bold">৳ {((t.wasteBill || 0) + (t.otherBill || 0)).toLocaleString('bn-BD')}</span>
                          </div>
                          <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-xs sm:text-sm">
                            <span>মোট বিল:</span>
                            <span>৳ {summary.totalBill.toLocaleString('bn-BD')}</span>
                          </div>
                        </div>

                        {/* Paid vs Due Bar */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <span className="text-[10px] text-emerald-700 font-bold uppercase block">প্রাপ্ত টাকা</span>
                            <span className="font-black text-emerald-800 text-sm">৳ {summary.paid.toLocaleString('bn-BD')}</span>
                          </div>
                          <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                            <span className="text-[10px] text-rose-700 font-bold uppercase block">বকেয়া (Due)</span>
                            <span className="font-black text-rose-800 text-sm">৳ {summary.dueAmount.toLocaleString('bn-BD')}</span>
                          </div>
                        </div>

                        {/* Online Transaction Proof */}
                        {t.lastTrxId && (
                          <div className="mt-2.5 bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg text-[11px] font-medium flex justify-between items-center border border-blue-200">
                            <span>অনলাইন TrxID:</span>
                            <span className="font-mono font-bold text-blue-700">{t.lastTrxId} ({t.paymentMethod})</span>
                          </div>
                        )}

                        {/* Action Hint & Actions */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-teal-600 group-hover:underline flex items-center gap-1">
                            <Edit3 className="w-3 h-3" /> বিদ্যুৎ ইউনিট ও বিল আপডেট &rarr;
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedReceiptTenant(t); }}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                              title="রসিদ দেখুন/প্রিন্ট"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTenant(t.id, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TENANT PANEL WITH OTP ================= */}
        {role === 'tenant' && (
          <div>
            {!loggedInTenant ? (
              /* Tenant OTP Login */
              <div className="max-w-md mx-auto mt-6 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-teal-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/20">
                    <KeyRound className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">ভাড়াটিয়া ড্যাশবোর্ড ওটিপি লগইন</h2>
                  <p className="text-xs text-slate-500 mt-1">নিবন্ধিত নম্বর দিয়ে ওটিপির মাধ্যমে প্রবেশ করুন</p>
                </div>

                {loginStep === 'phone' && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        মোবাইল নম্বর
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="যেমন: 01711000001"
                          value={tenantPhone}
                          onChange={(e) => setTenantPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 font-medium"
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2 font-medium">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      ওটিপি পাঠান (Send OTP)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}

                {loginStep === 'otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-center">
                      <p className="text-xs text-teal-800 font-medium">
                        ওটিপি কোড পাঠানো হয়েছে: <span className="font-mono font-bold text-teal-900">{tenantPhone}</span>
                      </p>
                      <div className="mt-2 bg-teal-600 text-white text-xs font-mono font-bold px-3 py-1 rounded-lg inline-block tracking-wider">
                        টেস্ট ওটিপি: {generatedOtp}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 text-center mb-3">
                        ৪-ডিজিটের ওটিপি কোডটি লিখুন
                      </label>
                      
                      <div className="flex justify-center gap-2.5">
                        {enteredOtp.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpInput(idx, e.target.value)}
                            className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                          />
                        ))}
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2 font-medium">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        ওটিপি সাবমিট করে ঢুকুন
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => { setLoginStep('phone'); setLoginError(''); }}
                        className="w-full text-xs text-slate-500 hover:text-slate-700 py-1 flex items-center justify-center gap-1 font-medium"
                      >
                        <RefreshCw className="w-3 h-3" /> নম্বর পরিবর্তন
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* COMPACT TENANT DASHBOARD (Read-Only) */
              (() => {
                const summary = calculateTenantSummary(loggedInTenant);
                return (
                  <div className="max-w-3xl mx-auto space-y-4">
                    
                    {/* Compact Renter Info Bar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center text-base shadow">
                          {loggedInTenant.name ? loggedInTenant.name.charAt(0) : 'T'}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">{loggedInTenant.name}</h2>
                          <p className="text-xs text-slate-500">
                            <span className="font-semibold text-teal-700">{loggedInTenant.flatNo}</span> • {loggedInTenant.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex text-[11px] text-slate-500 items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Lock className="w-3 h-3 text-teal-600" /> Read-Only
                        </span>
                        <button
                          onClick={() => { setLoggedInTenant(null); setTenantPhone(''); }}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          লগআউট
                        </button>
                      </div>
                    </div>

                    {/* Compact Financial Overview Strip */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-slate-900 text-white p-3.5 rounded-2xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">মোট বিল</p>
                        <h3 className="text-lg sm:text-xl font-black mt-1">৳ {summary.totalBill.toLocaleString('bn-BD')}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{loggedInTenant.month}</p>
                      </div>

                      <div className="bg-emerald-800 text-white p-3.5 rounded-2xl">
                        <p className="text-[10px] text-emerald-200 font-bold uppercase">পরিশোধিত</p>
                        <h3 className="text-lg sm:text-xl font-black text-emerald-300 mt-1">৳ {summary.paid.toLocaleString('bn-BD')}</h3>
                        <p className="text-[10px] text-emerald-200 mt-0.5">জমা প্রাপ্ত</p>
                      </div>

                      <div className={`p-3.5 rounded-2xl text-white ${
                        summary.dueAmount > 0 ? 'bg-rose-900' : 'bg-teal-900'
                      }`}>
                        <p className="text-[10px] text-rose-200 font-bold uppercase">বকেয়া (Due)</p>
                        <h3 className="text-lg sm:text-xl font-black text-rose-200 mt-1">৳ {summary.dueAmount.toLocaleString('bn-BD')}</h3>
                        <p className="text-[10px] text-rose-200 mt-0.5">
                          {summary.status === 'Paid' ? 'কোনো বকেয়া নেই' : 'অবশিষ্ট দেনা'}
                        </p>
                      </div>
                    </div>

                    {/* Compact Breakdown Details with Unit Calculator */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        বিল ও বিদ্যুৎ ইউনিটের বিস্তারিত বিবরণী
                      </h3>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600 font-medium">মূল বাসা ভাড়া:</span>
                          <span className="font-bold text-slate-800">৳ {(loggedInTenant.rent || 0).toLocaleString('bn-BD')}</span>
                        </div>

                        {/* Meter Unit Highlight Box */}
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1 text-amber-900">
                          <div className="flex justify-between font-extrabold text-xs">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-600" />
                              বিদ্যুৎ মিটারের হিসাব:
                            </span>
                            <span className="text-amber-900 font-black">৳ {summary.elecBill.toLocaleString('bn-BD')}</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-[11px] text-amber-800 pt-1 font-medium text-center">
                            <div className="bg-white/80 p-1.5 rounded border border-amber-200/60">
                              <span className="block text-[9px] text-slate-500">গত ইউনিট</span>
                              <span className="font-mono font-bold">{loggedInTenant.prevUnit || 0}</span>
                            </div>
                            <div className="bg-white/80 p-1.5 rounded border border-amber-200/60">
                              <span className="block text-[9px] text-slate-500">বর্তমান ইউনিট</span>
                              <span className="font-mono font-bold">{loggedInTenant.currUnit || 0}</span>
                            </div>
                            <div className="bg-white/80 p-1.5 rounded border border-amber-200/60">
                              <span className="block text-[9px] text-slate-500">মোট ব্যবহ্রত</span>
                              <span className="font-mono font-bold text-amber-900">{summary.usedUnits} ইউনিট</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-amber-700 text-right mt-0.5">
                            (প্রতি ইউনিট রেট: ৳{loggedInTenant.unitRate || 10})
                          </p>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-600 font-medium">ময়লা বিল:</span>
                          <span className="font-bold text-slate-800">৳ {(loggedInTenant.wasteBill || 0).toLocaleString('bn-BD')}</span>
                        </div>

                        {loggedInTenant.otherBill > 0 && (
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-600 font-medium">অন্যান্য চার্জ:</span>
                            <span className="font-bold text-slate-800">৳ {(loggedInTenant.otherBill || 0).toLocaleString('bn-BD')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Online Payment Methods */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          অনলাইন বিল পরিশোধ (bKash/Nagad/Rocket)
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          টাকা পাঠিয়ে নিচে TrxID জমা দিন
                        </p>
                      </div>

                      {/* Payment Numbers Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-200 text-center">
                          <span className="font-bold text-pink-700 text-xs block">bKash</span>
                          <span className="text-xs font-bold font-mono text-slate-800 block mt-0.5">{paymentGateways.bkash}</span>
                          <button
                            onClick={() => handleCopy(paymentGateways.bkash, 'bkash')}
                            className="mt-1.5 w-full py-1 bg-pink-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            {copiedKey === 'bkash' ? 'কপি হয়েছে' : 'কপি করুন'}
                          </button>
                        </div>

                        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-200 text-center">
                          <span className="font-bold text-orange-700 text-xs block">Nagad</span>
                          <span className="text-xs font-bold font-mono text-slate-800 block mt-0.5">{paymentGateways.nagad}</span>
                          <button
                            onClick={() => handleCopy(paymentGateways.nagad, 'nagad')}
                            className="mt-1.5 w-full py-1 bg-orange-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            {copiedKey === 'nagad' ? 'কপি হয়েছে' : 'কপি করুন'}
                          </button>
                        </div>

                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-center">
                          <span className="font-bold text-purple-700 text-xs block">Rocket</span>
                          <span className="text-xs font-bold font-mono text-slate-800 block mt-0.5">{paymentGateways.rocket}</span>
                          <button
                            onClick={() => handleCopy(paymentGateways.rocket, 'rocket')}
                            className="mt-1.5 w-full py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            {copiedKey === 'rocket' ? 'কপি হয়েছে' : 'কপি করুন'}
                          </button>
                        </div>

                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-center">
                          <span className="font-bold text-blue-700 text-xs block">DBBL Bank</span>
                          <span className="text-[10px] font-bold text-slate-800 block mt-0.5 truncate">{paymentGateways.bank}</span>
                          <button
                            onClick={() => handleCopy(paymentGateways.bank, 'bank')}
                            className="mt-1.5 w-full py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            {copiedKey === 'bank' ? 'কপি হয়েছে' : 'কপি করুন'}
                          </button>
                        </div>
                      </div>

                      {/* TrxID Submit Form */}
                      <form onSubmit={handleSubmitTrxId} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">মেথড</label>
                            <select
                              value={inputPayMethod}
                              onChange={(e) => setInputPayMethod(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                            >
                              <option value="bKash">bKash</option>
                              <option value="Nagad">Nagad</option>
                              <option value="Rocket">Rocket</option>
                              <option value="Bank">Bank</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">পাঠানো টাকা (৳)</label>
                            <input
                              type="number"
                              required
                              placeholder="5000"
                              value={inputPayAmount}
                              onChange={(e) => setInputPayAmount(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">TrxID</label>
                            <input
                              type="text"
                              required
                              placeholder="TXN8923712"
                              value={inputTrxId}
                              onChange={(e) => setInputTrxId(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                            />
                          </div>
                        </div>

                        {trxSuccessMsg && (
                          <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            {trxSuccessMsg}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-1">
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            পেমেন্ট তথ্য পাঠান
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedReceiptTenant(loggedInTenant)}
                            className="bg-slate-800 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-all flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            রসিদ
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL 1: ROOM BILL & ELECTRICITY CALCULATOR POPUP ================= */}
      {selectedRoomForBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-xs bg-teal-800 px-2.5 py-0.5 rounded font-bold">{selectedRoomForBill.flatNo}</span>
                <h3 className="font-black text-lg mt-0.5">{selectedRoomForBill.name} - বিল ও ইউনিট হিসাব</h3>
              </div>
              <button 
                onClick={() => setSelectedRoomForBill(null)}
                className="text-teal-200 hover:text-white font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRoomBill} className="p-5 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মাস</label>
                  <input
                    type="text"
                    required
                    value={billFormData.month}
                    onChange={(e) => setBillFormData({ ...billFormData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বাসা ভাড়া (৳)</label>
                  <input
                    type="number"
                    required
                    value={billFormData.rent}
                    onChange={(e) => setBillFormData({ ...billFormData, rent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* ELECTRICITY METER CALCULATOR BOX */}
              <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-amber-600" />
                    বিদ্যুৎ বিল (মিটার ইউনিট হিসাব)
                  </label>
                  
                  {/* Dynamic Meter Bill Calculation Preview */}
                  {(() => {
                    const pU = Number(billFormData.prevUnit) || 0;
                    const cU = Number(billFormData.currUnit) || 0;
                    const rU = Number(billFormData.unitRate) || 0;
                    const used = Math.max(0, cU - pU);
                    const cost = used * rU;
                    return (
                      <span className="text-xs font-black bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300">
                        মোট বিল: ৳ {cost.toLocaleString('bn-BD')} ({used} ইউনিট)
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-0.5">গত মাসের ইউনিট</label>
                    <input
                      type="number"
                      value={billFormData.prevUnit}
                      onChange={(e) => setBillFormData({ ...billFormData, prevUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-0.5">এই মাসের ইউনিট</label>
                    <input
                      type="number"
                      value={billFormData.currUnit}
                      onChange={(e) => setBillFormData({ ...billFormData, currUnit: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-amber-800 mb-0.5">প্রতি ইউনিটের দাম (৳)</label>
                    <input
                      type="number"
                      value={billFormData.unitRate}
                      onChange={(e) => setBillFormData({ ...billFormData, unitRate: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ময়লার ফি (৳)</label>
                  <input
                    type="number"
                    value={billFormData.wasteBill}
                    onChange={(e) => setBillFormData({ ...billFormData, wasteBill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অন্যান্য সার্ভিস ফি (৳)</label>
                  <input
                    type="number"
                    value={billFormData.otherBill}
                    onChange={(e) => setBillFormData({ ...billFormData, otherBill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Paid Amount Input */}
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <label className="block text-xs font-extrabold text-emerald-900 mb-1">
                  💵 ভাড়াটিয়া কত টাকা জমা দিয়েছে লিখুন (৳)
                </label>
                <input
                  type="number"
                  placeholder="যেমন: 10000"
                  value={billFormData.paidAmount}
                  onChange={(e) => setBillFormData({ ...billFormData, paidAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-sm font-black text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Auto Calculation display */}
              {(() => {
                const rent = Number(billFormData.rent) || 0;
                const pU = Number(billFormData.prevUnit) || 0;
                const cU = Number(billFormData.currUnit) || 0;
                const rU = Number(billFormData.unitRate) || 0;
                const elec = Math.max(0, cU - pU) * rU;
                const waste = Number(billFormData.wasteBill) || 0;
                const other = Number(billFormData.otherBill) || 0;

                const total = rent + elec + waste + other;
                const paid = Number(billFormData.paidAmount) || 0;
                const due = Math.max(0, total - paid);

                return (
                  <div className="bg-slate-100 p-3 rounded-2xl space-y-1 text-xs font-medium border border-slate-200">
                    <div className="flex justify-between text-slate-700">
                      <span>সর্বমোট বিল (ভাড়া + কারেন্ট + ময়লা):</span>
                      <span className="font-bold text-slate-900">৳ {total.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>জমাকৃত/প্রাপ্ত টাকা:</span>
                      <span>৳ {paid.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between text-rose-700 font-black border-t border-slate-200 pt-1 text-xs sm:text-sm">
                      <span>অবশিষ্ট বকেয়া (Due):</span>
                      <span>৳ {due.toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoomForBill(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-md text-xs sm:text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  জমা দিন (OK)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT TENANT INFO (NAME, PHONE, RENT) ================= */}
      {selectedTenantForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserEdit className="w-5 h-5" />
                ভাড়াটিয়ার তথ্য সংশোধন করুন
              </h3>
              <button 
                onClick={() => setSelectedTenantForEdit(null)}
                className="text-teal-200 hover:text-white font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveTenantInfo} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ভাড়াটিয়ার নাম</label>
                <input
                  type="text"
                  required
                  value={editTenantData.name}
                  onChange={(e) => setEditTenantData({ ...editTenantData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  required
                  value={editTenantData.phone}
                  onChange={(e) => setEditTenantData({ ...editTenantData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফ্ল্যাট / রুম নম্বর</label>
                  <input
                    type="text"
                    required
                    value={editTenantData.flatNo}
                    onChange={(e) => setEditTenantData({ ...editTenantData, flatNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বাসা ভাড়া (৳)</label>
                  <input
                    type="number"
                    required
                    value={editTenantData.rent}
                    onChange={(e) => setEditTenantData({ ...editTenantData, rent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForEdit(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ADD NEW TENANT ================= */}
      {isTenantAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">নতুন ফ্ল্যাট ও ভাড়াটিয়া যুক্ত করুন</h3>
              <button 
                onClick={() => setIsTenantAddModalOpen(false)}
                className="text-teal-200 hover:text-white font-bold text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddNewTenant} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ভাড়াটিয়ার নাম</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: শরিফুল ইসলাম"
                    value={newTenantData.name}
                    onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফ্ল্যাট / রুম নম্বর</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ফ্ল্যাট ৩-বি"
                    value={newTenantData.flatNo}
                    onChange={(e) => setNewTenantData({ ...newTenantData, flatNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর (লগইন আইডি)</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={newTenantData.phone}
                    onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মূল বাসা ভাড়া (৳)</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={newTenantData.rent}
                    onChange={(e) => setNewTenantData({ ...newTenantData, rent: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">গত ইউনিট</label>
                  <input
                    type="number"
                    value={newTenantData.prevUnit}
                    onChange={(e) => setNewTenantData({ ...newTenantData, prevUnit: e.target.value })}
                    className="w-full px-2 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">বর্তমান ইউনিট</label>
                  <input
                    type="number"
                    value={newTenantData.currUnit}
                    onChange={(e) => setNewTenantData({ ...newTenantData, currUnit: e.target.value })}
                    className="w-full px-2 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-900 mb-0.5">রেট (৳/ইউনিট)</label>
                  <input
                    type="number"
                    value={newTenantData.unitRate}
                    onChange={(e) => setNewTenantData({ ...newTenantData, unitRate: e.target.value })}
                    className="w-full px-2 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ময়লার ফি (৳)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newTenantData.wasteBill}
                    onChange={(e) => setNewTenantData({ ...newTenantData, wasteBill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অন্যান্য চার্জ (৳)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newTenantData.otherBill}
                    onChange={(e) => setNewTenantData({ ...newTenantData, otherBill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTenantAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: RECEIPT PRINT ================= */}
      {selectedReceiptTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {(() => {
            const summary = calculateTenantSummary(selectedReceiptTenant);
            return (
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-6 space-y-4" id="printable-receipt">
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h2 className="text-lg font-black text-slate-900">বাসা ভাড়ার প্রাপ্তি স্বীকারপত্র</h2>
                    <p className="text-xs text-slate-500 mt-0.5">মাস: {selectedReceiptTenant.month}</p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">ভাড়াটিয়ার নাম:</span>
                      <span className="font-bold text-slate-800">{selectedReceiptTenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">ফ্ল্যাট নম্বর:</span>
                      <span className="font-bold text-slate-800">{selectedReceiptTenant.flatNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">ফোন নম্বর:</span>
                      <span className="text-slate-800 font-medium">{selectedReceiptTenant.phone}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>বাসা ভাড়া:</span>
                      <span className="font-semibold">৳ {(selectedReceiptTenant.rent || 0).toLocaleString('bn-BD')}</span>
                    </div>

                    {/* Unit Breakdown */}
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 space-y-0.5">
                      <div className="flex justify-between font-bold">
                        <span>বিদ্যুৎ ইউনিট ({selectedReceiptTenant.currUnit || 0} - {selectedReceiptTenant.prevUnit || 0}):</span>
                        <span>{summary.usedUnits} ইউনিট</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-amber-800">
                        <span>রেট: ৳{selectedReceiptTenant.unitRate || 10}/ইউনিট</span>
                        <span className="font-bold">বিল: ৳ {summary.elecBill.toLocaleString('bn-BD')}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span>ময়লা বিল:</span>
                      <span className="font-semibold">৳ {selectedReceiptTenant.wasteBill || 0}</span>
                    </div>
                    {selectedReceiptTenant.otherBill > 0 && (
                      <div className="flex justify-between">
                        <span>অন্যান্য ফি:</span>
                        <span className="font-semibold">৳ {selectedReceiptTenant.otherBill || 0}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-slate-900">
                      <span>সর্বমোট হিসেবকৃত বিল:</span>
                      <span>৳ {summary.totalBill.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs text-emerald-700">
                      <span>জমাকৃত/প্রাপ্ত টাকা:</span>
                      <span>৳ {summary.paid.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-rose-700">
                      <span>অবশিষ্ট বকেয়া (Due):</span>
                      <span>৳ {summary.dueAmount.toLocaleString('bn-BD')}</span>
                    </div>

                    {selectedReceiptTenant.lastTrxId && (
                      <div className="border-t border-slate-200 pt-2 text-[11px] font-mono text-slate-600 flex justify-between">
                        <span>অনলাইন TrxID:</span>
                        <span className="font-bold text-slate-900">{selectedReceiptTenant.lastTrxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedReceiptTenant(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Printer className="w-4 h-4" /> প্রিন্ট করুন
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
