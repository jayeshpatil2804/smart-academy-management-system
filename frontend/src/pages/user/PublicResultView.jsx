import React, { useState } from 'react';
import { 
    Search, FileText, AlertCircle, Calendar, User, Hash, 
    BookOpen, Award, CheckCircle, Mail
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const API = `${import.meta.env.VITE_API_URL}/master/exam-result/verify`;

const PublicResultView = () => {
    const [form, setForm] = useState({ email: '', enrollmentNo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setData(null);

        try {
            const { data } = await axios.post(API, form);
            setData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="max-w-5xl mx-auto text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest mb-4">
                        <Award size={14} /> Result Verification
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                        Check Your <span className="text-blue-600">Exam Results</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-500 text-sm">
                        Enter your Email and Enrollment No to view your official results.
                    </p>
                </motion.div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Search Form */}
                <motion.div 
                    className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="email" 
                                    name="email" 
                                    required
                                    value={form.email} 
                                    onChange={handleChange}
                                    placeholder="Enter your email" 
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Enrollment Number
                            </label>
                            <div className="relative">
                                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="enrollmentNo" 
                                    required 
                                    value={form.enrollmentNo} 
                                    onChange={handleChange}
                                    placeholder="e.g. ENR12345"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold uppercase"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Searching...' : 'View Result'}
                        </button>
                    </form>
                </motion.div>

                {/* Result Display */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {data ? (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Student Info Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-blue-600 p-4 text-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Student Profile</p>
                                                <h3 className="text-xl font-black">
                                                    {data.student.firstName} {data.student.middleName} {data.student.lastName}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Reg No</p>
                                                <p className="font-mono font-bold">{data.student.regNo}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Hash size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Enrollment</p>
                                                <p className="text-sm font-bold text-gray-700">{data.student.enrollmentNo}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <CheckCircle size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                                                <p className="text-sm font-bold text-green-600">Verified</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Results Table */}
                                {data.results.map((res, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{res.examName}</h4>
                                                <p className="text-xs text-gray-500">{res.courseName}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                    Grade: {res.grade}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3">Subject</th>
                                                        <th className="px-4 py-3 text-center">Theory</th>
                                                        <th className="px-4 py-3 text-center">Practical</th>
                                                        <th className="px-4 py-3 text-center">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {res.subjects.map((sub, sIdx) => (
                                                        <tr key={sIdx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-700">{sub.name}</td>
                                                            <td className="px-4 py-3 text-center text-gray-600">{sub.theory}</td>
                                                            <td className="px-4 py-3 text-center text-gray-600">{sub.practical}</td>
                                                            <td className="px-4 py-3 text-center font-bold text-blue-600">{sub.total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-blue-50/50 font-bold">
                                                    <tr>
                                                        <td className="px-4 py-3 text-gray-700">GRAND TOTAL</td>
                                                        <td colSpan={2}></td>
                                                        <td className="px-4 py-3 text-center text-blue-700 text-lg">
                                                            {res.marksObtained} / {res.totalMarks}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                        
                                        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">SOM No</p>
                                                <p className="text-xs font-bold text-gray-600">{res.somNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Cert No</p>
                                                <p className="text-xs font-bold text-gray-600">{res.certificateNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Issue Date</p>
                                                <p className="text-xs font-bold text-gray-600">{moment(res.issueDate).format('DD MMM YYYY')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">No Result Displayed</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                    Enter your credentials on the left to verify and view your official exam results.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PublicResultView;
