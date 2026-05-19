import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Search, CheckCircle, XCircle, AlertCircle, Calendar, User, Hash, 
    BookOpen, Clock, MapPin, CreditCard, ShieldAlert, Award, FileText 
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API = `${import.meta.env.VITE_API_URL}/students/verify-admission`;

const VerifyStudent = () => {
    const [form, setForm] = useState({ enrollmentNo: '', regNo: '', dob: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!form.enrollmentNo && !form.regNo) {
            setError('Please enter either your Enrollment Number or Registration Number.');
            return;
        }

        setLoading(true);

        try {
            const { data } = await axios.post(API, form);
            if (data.success) {
                setResult(data.student);
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials or Date of Birth. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-slate-50 to-blue-50/50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header / Hero Section */}
            <div className="max-w-4xl mx-auto text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest mb-4">
                        <Award size={14} className="animate-pulse" /> Student Corner
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
                        Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Admission Status</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-500 text-sm sm:text-base leading-relaxed">
                        Enter your Enrollment Number or Registration Number along with Date of Birth to verify your admission status.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Verification Form Card */}
                <motion.div 
                    className="lg:col-span-5 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Verify Credentials</h2>
                        <p className="text-xs text-gray-400">Enter either Enrollment No or Registration No, along with DOB.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                Enrollment Number
                            </label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="enrollmentNo" 
                                    value={form.enrollmentNo} 
                                    onChange={handleChange}
                                    placeholder="e.g. ENR12345" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold uppercase placeholder:normal-case placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-3 text-gray-400 text-xs font-bold uppercase tracking-widest">Or</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                Registration Number
                            </label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="regNo" 
                                    value={form.regNo} 
                                    onChange={handleChange}
                                    placeholder="e.g. 12-MN" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold uppercase placeholder:normal-case placeholder:font-normal"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                Date of Birth <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="date" 
                                    name="dob" 
                                    required 
                                    value={form.dob} 
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Search size={18} />
                                    <span>Verify Status</span>
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Verification Results Display */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {result ? (
                            <motion.div 
                                key="result-card"
                                className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Card Header with Student Name */}
                                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-6 text-white relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-1">Student Record Found</p>
                                            <h3 className="text-xl sm:text-2xl font-black truncate">
                                                {`${result.firstName} ${result.middleName ? result.middleName + ' ' : ''}${result.lastName}`}
                                            </h3>
                                        </div>
                                        {result.isCancelled ? (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-200 border border-red-500/30">
                                                <XCircle size={12} /> Cancelled
                                            </span>
                                        ) : result.isActive ? (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-200 border border-green-500/30">
                                                <CheckCircle size={12} /> Active Account
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-200 border border-yellow-500/30">
                                                <AlertCircle size={12} /> Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Main Details Body */}
                                <div className="p-6 space-y-6">
                                    {/* Status Badges Section */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registration</span>
                                            {result.isRegistered ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Completed</span>
                                            ) : (
                                                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Pending</span>
                                            )}
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Admission Fees</span>
                                            {result.isAdmissionFeesPaid ? (
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Paid</span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Pending</span>
                                            )}
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Enrollment No</span>
                                            <span className="text-xs font-bold text-gray-700 font-mono">{result.enrollmentNo || 'N/A'}</span>
                                        </div>

                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reg No</span>
                                            <span className="text-xs font-bold text-gray-700 font-mono">{result.regNo || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Academy Information Group */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Academic Profile</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex gap-3">
                                                <BookOpen className="text-blue-900 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enrolled Course</span>
                                                    <span className="text-sm font-semibold text-gray-800">{result.courseName}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Clock className="text-blue-900 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Batch</span>
                                                    <span className="text-sm font-semibold text-gray-800">{result.batch || 'Not Scheduled'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <MapPin className="text-blue-900 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Branch Location</span>
                                                    <span className="text-sm font-semibold text-gray-800">{result.branchName || 'Main Branch'}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Calendar className="text-blue-900 shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admission Date</span>
                                                    <span className="text-sm font-semibold text-gray-800">{formatDate(result.admissionDate)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fee Structure Summary */}
                                    <div className="bg-blue-50/50 rounded-2xl border border-blue-100/50 p-4">
                                        <h4 className="text-xs font-bold text-blue-900/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <CreditCard size={14} /> Fee Ledger Summary
                                        </h4>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="border-r border-blue-100 last:border-0">
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Course Fee</span>
                                                <span className="text-sm sm:text-base font-black text-gray-800">₹{result.totalFees}</span>
                                            </div>
                                            <div className="border-r border-blue-100 last:border-0">
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-green-600">Total Paid</span>
                                                <span className="text-sm sm:text-base font-black text-green-600">₹{result.totalFees - result.pendingFees}</span>
                                            </div>
                                            <div className="last:border-0">
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 text-red-500">Outstanding Balance</span>
                                                <span className="text-sm sm:text-base font-black text-red-600">₹{result.pendingFees}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credentials / Next Step Alert */}
                                    {!result.isRegistered && !result.isCancelled && (
                                        <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800 text-xs">
                                            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600" />
                                            <div>
                                                <p className="font-bold mb-0.5">Credentials Generation Pending</p>
                                                <p className="leading-relaxed opacity-90">
                                                    Your admission is recorded, but credentials for the student login portal have not been generated yet. Please contact the administration department to complete your registration.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="placeholder-card"
                                className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center py-20 flex flex-col items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-900 mb-4 border border-blue-100">
                                    <FileText size={28} className="animate-pulse" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Awaiting Verification</h3>
                                <p className="text-sm text-gray-400 max-w-sm">
                                    Fill in the verification credentials on the left to verify your admission and view academic status details.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VerifyStudent;
