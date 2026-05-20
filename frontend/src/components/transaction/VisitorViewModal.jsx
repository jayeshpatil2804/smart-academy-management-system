import React from 'react';
import { X, Phone, User, Calendar, Clock, BookOpen, Tag, Home, FileText, Building } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const VisitorViewModal = ({ visitor, onClose }) => {
    if (!visitor) return null;

    // Resolve source
    const getSourceInfo = () => {
        if (visitor.inquiryId) {
            const src = visitor.inquiryId.source;
            if (!src) {
                return {
                    label: 'Offline (Converted Inquiry)',
                    colorClass: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white',
                    subtext: 'Inquiry details were completed offline.'
                };
            }
            const lowercaseSrc = src.toLowerCase();
            if (lowercaseSrc === 'walk-in' || lowercaseSrc === 'offline') {
                return {
                    label: 'Offline (Walk-in Inquiry)',
                    colorClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-100',
                    subtext: 'Came directly as an offline inquiry walkthrough.'
                };
            } else if (lowercaseSrc === 'online' || lowercaseSrc === 'social media' || lowercaseSrc === 'onlineadmission' || lowercaseSrc === 'quickcontact') {
                return {
                    label: `Online Inquiry (${src})`,
                    colorClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-100',
                    subtext: 'Inquiry received through online portals/social media.'
                };
            } else if (lowercaseSrc === 'dsr') {
                return {
                    label: 'DSR Inquiry (Daily Sales Report)',
                    colorClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-100',
                    subtext: 'Inquiry generated via direct marketing or field executive (DSR).'
                };
            } else if (lowercaseSrc === 'call') {
                return {
                    label: 'Telephonic Inquiry',
                    colorClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-100',
                    subtext: 'Inquiry registered from a phone call.'
                };
            } else if (lowercaseSrc === 'reference') {
                return {
                    label: 'Reference Inquiry',
                    colorClass: 'bg-gradient-to-r from-violet-500 to-pink-600 text-white shadow-md shadow-violet-100',
                    subtext: `Inquiry introduced by ${visitor.inquiryId.referenceBy || 'a referrer'}.`
                };
            } else {
                return {
                    label: `Inquiry (Source: ${src})`,
                    colorClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-100',
                    subtext: `Inquiry registered through ${src}.`
                };
            }
        } else if (visitor.reference) {
            return {
                label: `External Reference: ${visitor.reference}`,
                colorClass: 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-100',
                subtext: `Introduced by reference contact: ${visitor.referenceContact || 'N/A'}`
            };
        } else {
            return {
                label: 'Direct Walk-in (Offline)',
                colorClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-100',
                subtext: 'Visited the academy directly without any prior inquiry.'
            };
        }
    };

    const sourceInfo = getSourceInfo();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <User className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-wide">Visitor Information Profile</h2>
                            <p className="text-xs text-blue-100 mt-0.5">Comprehensive view of visitor details & source origin</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-white hover:bg-white/10 p-2 rounded-full transition duration-200"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 text-sm">
                    
                    {/* Source Origin Highlight Card */}
                    <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm">
                        <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${sourceInfo.colorClass}`}>
                            <div className="flex items-center gap-2">
                                <Tag size={20} className="opacity-90 flex-shrink-0" />
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Registration Origin</span>
                                    <span className="font-extrabold text-base tracking-wide">{sourceInfo.label}</span>
                                </div>
                            </div>
                            {visitor.inquiryId && (
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto border border-white/20">
                                    Inquiry Converted
                                </span>
                            )}
                        </div>
                        <div className="bg-gray-50/80 p-3 px-4 border-t border-gray-100 text-xs text-gray-500 font-medium flex items-center justify-between">
                            <span>{sourceInfo.subtext}</span>
                            {visitor.inquiryId?.inquiryDate && (
                                <span>Inquiry Date: {formatDate(visitor.inquiryId.inquiryDate)}</span>
                            )}
                        </div>
                    </div>

                    {/* Student details */}
                    <div>
                        <div className="bg-blue-50/70 p-2 px-3 font-bold text-blue-800 uppercase text-xs tracking-wider border-l-4 border-blue-600 mb-3 rounded-r-md flex items-center gap-1.5">
                            <User size={14} /> Student Profile
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-2 rounded-lg">
                            <div>
                                <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wide">Full Name</span>
                                <span className="font-bold text-gray-800 text-base">{visitor.studentName}</span>
                            </div>
                            <div>
                                <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wide">Course Interested In</span>
                                <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                                    <BookOpen size={14} className="text-blue-500" />
                                    {visitor.course?.name || 'Not Specified'}
                                </span>
                            </div>
                            {visitor.branchId && (
                                <div className="md:col-span-2">
                                    <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wide">Branch Scoped</span>
                                    <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                                        <Building size={14} className="text-gray-400" />
                                        {visitor.branchId.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Numbers */}
                    <div>
                        <div className="bg-blue-50/70 p-2 px-3 font-bold text-blue-800 uppercase text-xs tracking-wider border-l-4 border-blue-600 mb-3 rounded-r-md flex items-center gap-1.5">
                            <Phone size={14} /> Contact Information
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-150 relative overflow-hidden group">
                                <div className="absolute right-2 top-2 text-gray-300 opacity-20">S</div>
                                <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Student Mobile</span>
                                <span className="font-bold text-blue-600 text-sm block mt-1">{visitor.mobileNumber || '—'}</span>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-150 relative overflow-hidden">
                                <div className="absolute right-2 top-2 text-gray-300 opacity-20">G</div>
                                <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Guardian / Parent</span>
                                <span className="font-bold text-gray-800 text-sm block mt-1">{visitor.contactParent || '—'}</span>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-150 relative overflow-hidden">
                                <div className="absolute right-2 top-2 text-gray-300 opacity-20">H</div>
                                <span className="block text-gray-500 text-[10px] uppercase font-bold tracking-wider">Home Contact</span>
                                <span className="font-bold text-gray-800 text-sm block mt-1">{visitor.contactHome || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Visiting details */}
                    <div>
                        <div className="bg-blue-50/70 p-2 px-3 font-bold text-blue-800 uppercase text-xs tracking-wider border-l-4 border-blue-600 mb-3 rounded-r-md flex items-center gap-1.5">
                            <Calendar size={14} /> Visit & Scheduling Logs
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <span className="block text-gray-400 text-[9px] uppercase font-bold">Visit Date</span>
                                    <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                                        <Calendar size={12} className="text-gray-400" />
                                        {formatDate(visitor.visitingDate)}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <span className="block text-gray-400 text-[9px] uppercase font-bold">Attended By</span>
                                    <span className="font-bold text-gray-800 truncate block mt-0.5" title={visitor.attendedBy?.name}>
                                        {visitor.attendedBy?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
                                    <span className="block text-emerald-800/60 text-[9px] uppercase font-bold">In-Time</span>
                                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                                        <Clock size={12} />
                                        {visitor.inTime || '—'}
                                    </span>
                                </div>
                                <div className="bg-red-50/40 p-2.5 rounded-lg border border-red-100">
                                    <span className="block text-red-800/60 text-[9px] uppercase font-bold">Out-Time</span>
                                    <span className="font-bold text-red-600 flex items-center gap-1 mt-0.5">
                                        <Clock size={12} />
                                        {visitor.outTime || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reference External Details if present */}
                    {!visitor.inquiryId && visitor.reference && (
                        <div>
                            <div className="bg-blue-50/70 p-2 px-3 font-bold text-blue-800 uppercase text-xs tracking-wider border-l-4 border-blue-600 mb-3 rounded-r-md flex items-center gap-1.5">
                                <Home size={14} /> Reference External Details
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-150">
                                <div>
                                    <span className="block text-gray-500 text-[10px] uppercase font-bold">Reference Person</span>
                                    <span className="font-semibold text-gray-800">{visitor.reference || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-[10px] uppercase font-bold">Reference Contact</span>
                                    <span className="font-semibold text-gray-800">{visitor.referenceContact || '—'}</span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="block text-gray-500 text-[10px] uppercase font-bold">Reference Address</span>
                                    <span className="font-medium text-gray-800">{visitor.referenceAddress || '—'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <div className="bg-blue-50/70 p-2 px-3 font-bold text-blue-800 uppercase text-xs tracking-wider border-l-4 border-blue-600 mb-3 rounded-r-md flex items-center gap-1.5">
                            <FileText size={14} /> Remarks & Narrative
                        </div>
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-150 text-gray-700 italic leading-relaxed text-xs max-h-36 overflow-y-auto whitespace-pre-wrap">
                            {visitor.remarks || 'No remarks recorded for this visit.'}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 px-6 border-t border-gray-150 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md transition duration-200"
                    >
                        Close Profile
                    </button>
                </div>

            </div>
        </div>
    );
};

export default VisitorViewModal;
