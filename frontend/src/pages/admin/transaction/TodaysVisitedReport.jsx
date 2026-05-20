import React, { useState, useEffect } from 'react';
import { FileText, Search, Edit, Trash2, ArrowRightCircle, Printer, Eye, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../utils/dateUtils';
import visitorService from '../../../services/visitorService';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import axios from 'axios';
import VisitorViewModal from '../../../components/transaction/VisitorViewModal';

const TodaysVisitedReport = () => {
    const navigate = useNavigate();
    
    const handlePrintList = () => {
        window.print();
    };
    
    // State
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const { user } = useSelector((state) => state.auth);

    // View Modal State
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingVisitor, setViewingVisitor] = useState(null);
    
    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        search: '',
        limit: 50,
        branchId: '',
        reportType: 'followup' // Default to follow-up as requested
    });

    const [followups, setFollowups] = useState([]);

    useEffect(() => {
        if (user && user.role === 'Super Admin') {
            fetchBranches();
        }
    }, [user]);

    useEffect(() => {
        fetchVisitors();
    }, [filters.reportType, filters.fromDate, filters.toDate, filters.branchId]);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/branches`, { withCredentials: true });
            setBranches(res.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    // Fetch data based on report type
    const fetchVisitors = async () => {
        setLoading(true);
        try {
            if (filters.reportType === 'visited') {
                const data = await visitorService.getAllVisitors(filters);
                setVisitors(data);
                setFollowups([]);
            } else {
                // Fetch Inquiries for Follow-up
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/transaction/inquiry`, {
                    params: {
                        startDate: filters.fromDate,
                        endDate: filters.toDate,
                        search: filters.search,
                        branchId: filters.branchId,
                        dateFilterType: 'followUpDate'
                    },
                    withCredentials: true
                });
                setFollowups(res.data);
                setVisitors([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch records");
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchVisitors();
    };

    const handleReset = () => {
        setFilters({
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0],
            search: '',
            limit: 50,
            branchId: '',
            reportType: 'followup'
        });
        setVisitors([]);
        setFollowups([]);
        toast.info('Filters reset');
    };

    const handleView = (visitor) => {
        setViewingVisitor(visitor);
        setShowViewModal(true);
    };

    const handleEdit = (visitor) => {
        // Navigate to Visitors page with pre-filled data
        navigate('/transaction/visitors', { state: { visitorData: visitor } });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this visitor?')) {
            try {
                await visitorService.deleteVisitor(id);
                toast.success('Visitor deleted successfully');
                fetchVisitors(); // Refresh the list
            } catch (error) {
                console.error("Error deleting visitor:", error);
                toast.error("Failed to delete visitor");
            }
        }
    };

    return (
        <div className="w-full p-2 animate-fadeIn">
            <style>{`
                .print-only-header {
                    display: none !important;
                }
                @media print {
                    body {
                        visibility: hidden !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .printable-table-container,
                    .printable-table-container * {
                        visibility: visible !important;
                    }
                    .printable-table-container {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        overflow: visible !important;
                    }
                    .print-only-header {
                        display: block !important;
                    }
                    /* Hide the Actions column (last th and td) */
                    .printable-table-container th:last-child,
                    .printable-table-container td:last-child {
                        display: none !important;
                    }
                    /* Clean up page breaks */
                    tr {
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
            <div className="bg-white rounded-lg shadow-lg p-2">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Activity Visitor Report</h2>
                            <p className="text-xs text-gray-500">Track visitors and follow-ups for {formatDate(filters.fromDate)}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 items-center w-full md:w-auto">
                        <button 
                            onClick={handlePrintList}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shadow-sm font-bold transition-all transform hover:scale-105"
                        >
                            <Printer size={16} /> Print List
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-xl flex-grow md:flex-none">
                            <button 
                                onClick={() => setFilters({...filters, reportType: 'followup'})}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filters.reportType === 'followup' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Follow-ups
                            </button>
                            <button 
                                onClick={() => setFilters({...filters, reportType: 'visited'})}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filters.reportType === 'visited' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Visitors
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div>
                        <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">From Date</label>
                        <input 
                            type="date" 
                            name="fromDate" 
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                            className="w-full border-blue-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none h-10 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">To Date</label>
                        <input 
                            type="date" 
                            name="toDate" 
                            value={filters.toDate}
                            onChange={handleFilterChange}
                            className="w-full border-blue-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none h-10 shadow-sm"
                        />
                    </div>
                    
                    {user?.role === 'Super Admin' && (
                        <div>
                            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Branch</label>
                            <select 
                                name="branchId" 
                                value={filters.branchId} 
                                onChange={handleFilterChange}
                                className="w-full border-blue-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none h-10 shadow-sm"
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="lg:col-span-1">
                        <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Search</label>
                        <input 
                            type="text" 
                            name="search" 
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search by name..."
                            className="w-full border-blue-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none h-10 shadow-sm"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button 
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-200 h-10 flex-1 justify-center"
                        >
                            <Search size={16} /> Fetch
                        </button>
                        <button 
                            onClick={handleReset}
                            className="bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 h-10 transition-all shadow-sm"
                        >
                            Reset
                        </button>
                    </div>

                </div>

                {/* Table */}
                <div className="overflow-x-auto printable-table-container">
                    <div className="print-only-header mb-6 text-center">
                        <h1 className="text-2xl font-bold text-blue-800 uppercase tracking-wide">
                            {filters.reportType === 'visited' ? 'Visitor Report' : 'Follow-up Report'}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Report Period: {formatDate(filters.fromDate)} to {formatDate(filters.toDate)} | Generated on {new Date().toLocaleDateString('en-GB')} | Total Records: {filters.reportType === 'visited' ? visitors?.length || 0 : followups?.length || 0}
                        </p>
                    </div>
                    <div className="mb-4 flex justify-between items-center print:hidden">
                        <div className="text-sm font-bold text-gray-700">
                            Showing {filters.reportType === 'visited' ? visitors.length : followups.length} {filters.reportType} records
                        </div>
                        <select 
                            name="limit" 
                            value={filters.limit}
                            onChange={(e) => {
                                handleFilterChange(e); 
                                setTimeout(fetchVisitors, 100); 
                            }}
                            className="border rounded-lg p-2 text-xs text-gray-600 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="50">50 Records</option>
                            <option value="100">100 Records</option>
                            <option value="200">200 Records</option>
                        </select>
                    </div>
                    <table className="w-full border-collapse min-w-[1000px]">
                        {filters.reportType === 'visited' ? (
                            <thead>
                                <tr className="bg-blue-600 text-white text-left text-xs uppercase tracking-wider">
                                    <th className="p-2 border font-semibold w-12 text-center">Sr. No.</th>
                                    <th className="p-2 border font-semibold">Visiting Date</th>
                                    {user?.role === 'Super Admin' && <th className="p-2 border font-semibold">Branch</th>}
                                    <th className="p-2 border font-semibold">Student Name</th>
                                    <th className="p-2 border font-semibold text-center w-36">Contact</th>
                                    <th className="p-2 border font-semibold">Gender</th>
                                    <th className="p-2 border font-semibold text-center">Status</th>
                                    <th className="p-2 border font-semibold">In Time</th>
                                    <th className="p-2 border font-semibold">Out Time</th>
                                    <th className="p-2 border font-semibold w-36">Remarks/Details</th>
                                    <th className="p-2 border font-semibold text-center sticky right-0 bg-blue-600 z-10 w-32">Actions</th>
                                </tr>
                            </thead>
                        ) : (
                            <thead>
                                <tr className="bg-blue-600 text-white text-left text-xs uppercase tracking-wider">
                                    <th className="p-2 border font-semibold w-12 text-center">Sr. No.</th>
                                    <th className="p-2 border font-semibold">Inquiry Date</th>
                                    {user?.role === 'Super Admin' && <th className="p-2 border font-semibold">Branch</th>}
                                    <th className="p-2 border font-semibold">Student Name</th>
                                    <th className="p-2 border font-semibold text-center w-36">Contact</th>
                                    <th className="p-2 border font-semibold">Gender</th>
                                    <th className="p-2 border font-semibold text-center">Status</th>
                                    <th className="p-2 border font-semibold">Followup Date</th>
                                    <th className="p-2 border font-semibold">Followup Time</th>
                                    <th className="p-2 border font-semibold w-36">Followup Details</th>
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={filters.reportType === 'visited' ? (user?.role === 'Super Admin' ? 11 : 10) : (user?.role === 'Super Admin' ? 10 : 9)} className="text-center p-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                            <p className="text-gray-400 font-medium">Fetching records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filters.reportType === 'visited' ? (
                                visitors.length === 0 ? (
                                    <tr>
                                        <td colSpan={user?.role === 'Super Admin' ? 11 : 10} className="text-center py-8 text-gray-400 italic">
                                            No visitor records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    visitors.map((visitor, index) => (
                                        <tr key={visitor._id} className="hover:bg-blue-50 text-xs border-b border-gray-100 transition-colors">
                                            <td className="p-2 border text-center text-gray-400 font-medium">{index + 1}</td>
                                            <td className="p-2 border font-semibold text-gray-700">{formatDate(visitor.visitingDate)}</td>
                                            {user?.role === 'Super Admin' && <td className="p-2 border text-gray-600">{visitor.branchId?.name || '-'}</td>}
                                            <td className="p-2 border font-bold text-gray-800">{visitor.studentName}</td>
                                            <td className="p-0 border align-top w-36">
                                                <div className="flex border-b border-gray-200 last:border-b-0">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">G</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start">
                                                        {visitor.contactParent || '-'}
                                                    </div>
                                                </div>
                                                <div className="flex border-b border-gray-200 last:border-b-0">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">H</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start">
                                                        {visitor.contactHome || '-'}
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">S</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start text-blue-600">
                                                        {visitor.mobileNumber || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 border text-gray-600">-</td>
                                            <td className="p-2 border text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                                                    visitor.inquiryId ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                                }`}>
                                                    {visitor.inquiryId ? 'Converted' : 'Visited'}
                                                </span>
                                            </td>
                                            <td className="p-2 border text-center">
                                                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-200">
                                                    {visitor.inTime || '-'}
                                                </span>
                                            </td>
                                            <td className="p-2 border text-center">
                                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold border border-red-200">
                                                    {visitor.outTime || '-'}
                                                </span>
                                            </td>
                                            <td className="p-2 border text-gray-600 truncate max-w-xs" title={visitor.remarks}>
                                                {visitor.remarks ? (visitor.remarks.length > 14 ? `${visitor.remarks.substring(0, 14)}...` : visitor.remarks) : '-'}
                                            </td>
                                            <td className="p-2 border text-center sticky right-0 bg-white print:hidden">
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => navigate('/master/student-admission', { state: { visitorData: visitor } })} className="bg-green-50 text-green-600 border border-green-200 p-1.5 rounded hover:bg-green-100 transition" title="Take Admission">
                                                        <GraduationCap size={14} />
                                                    </button>
                                                    <button onClick={() => handleView(visitor)} className="bg-indigo-50 text-indigo-600 border border-indigo-200 p-1.5 rounded hover:bg-indigo-100 transition" title="View Details">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={() => handleEdit(visitor)} className="bg-blue-50 text-blue-600 border border-blue-200 p-1.5 rounded hover:bg-blue-100 transition" title="Edit">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(visitor._id)} className="bg-red-50 text-red-600 border border-red-200 p-1.5 rounded hover:bg-red-100 transition" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                followups.length === 0 ? (
                                    <tr>
                                        <td colSpan={user?.role === 'Super Admin' ? 10 : 9} className="text-center py-8 text-gray-400 italic">
                                            No student follow-ups scheduled for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    followups.map((hist, index) => (
                                        <tr key={hist._id} className="hover:bg-blue-50 text-xs border-b border-gray-100 transition-colors">
                                            <td className="p-2 border text-center text-gray-400 font-medium">{index + 1}</td>
                                            <td className="p-2 border font-semibold text-gray-700">{formatDate(hist.inquiryDate)}</td>
                                            {user?.role === 'Super Admin' && <td className="p-2 border text-gray-600">{hist.branchId?.name || '-'}</td>}
                                            <td className="p-2 border font-bold text-gray-800">{hist.firstName} {hist.lastName}</td>
                                            <td className="p-0 border align-top w-36">
                                                <div className="flex border-b border-gray-200 last:border-b-0">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">G</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start">
                                                        {hist.contactParent || '-'}
                                                    </div>
                                                </div>
                                                <div className="flex border-b border-gray-200 last:border-b-0">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">H</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start">
                                                        {hist.contactHome || '-'}
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <div className="w-6 border-r border-gray-200 p-1 font-bold text-gray-500 bg-gray-50 flex items-center justify-center">S</div>
                                                    <div className="p-1 flex-1 text-gray-700 font-medium text-left px-2 flex items-center justify-start text-blue-600">
                                                        {hist.contactStudent || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-2 border text-gray-600">{hist.gender || '-'}</td>
                                            <td className="p-2 border text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                                                    hist.status === 'Open' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    hist.status === 'Recall' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    'bg-gray-100 text-gray-600 border-gray-200'
                                                }`}>
                                                    {hist.status}
                                                </span>
                                            </td>
                                            <td className="p-2 border text-gray-700">{hist.followUpDate ? formatDate(hist.followUpDate) : '-'}</td>
                                            <td className="p-2 border text-gray-700">
                                                {hist.followUpDate ? new Date(hist.followUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="p-2 border text-gray-600 truncate max-w-xs" title={hist.followUpDetails}>
                                                {hist.followUpDetails ? (hist.followUpDetails.length > 14 ? `${hist.followUpDetails.substring(0, 14)}...` : hist.followUpDetails) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Visitor View Modal */}
                {showViewModal && (
                    <VisitorViewModal 
                        visitor={viewingVisitor}
                        onClose={() => {
                            setShowViewModal(false);
                            setViewingVisitor(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default TodaysVisitedReport;
