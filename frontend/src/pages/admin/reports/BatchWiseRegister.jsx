import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import { fetchStudents, resetStatus } from '../../../features/student/studentSlice';
import { fetchBatches, fetchBranches, fetchCourses } from '../../../features/master/masterSlice';
import { fetchEmployees } from '../../../features/employee/employeeSlice';
import { Printer, FileText, Search, Loader2, ChevronDown, Filter, RefreshCw } from 'lucide-react';
import StudentSearch from '../../../components/StudentSearch';
import logo from '../../../assets/logo2.png';
import { toast } from 'react-toastify';

const BatchWiseRegister = () => {
    const dispatch = useDispatch();
    const componentRef = useRef();
    
    const { students, isLoading: studentsLoading } = useSelector((state) => state.students);
    const { batches, branches, courses, isLoading: batchesLoading } = useSelector((state) => state.master);
    const { employees } = useSelector((state) => state.employees);
    const { user } = useSelector((state) => state.auth);

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: moment().format('YYYY-MM-DD'),
        courseFilter: '',
        branchId: user?.branchId || '',
        studentName: '',
        batch: 'All',
        reference: '',
        isRegistered: 'true'
    });

    const [showReport, setShowReport] = useState(true);

    const [selectedBatch, setSelectedBatch] = useState('All');
    const [groupedData, setGroupedData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);

    useEffect(() => {
        dispatch(fetchBatches());
        dispatch(fetchCourses());
        dispatch(fetchEmployees({ pageSize: 1000 }));
        if (user?.role === 'Super Admin') {
            dispatch(fetchBranches());
        }
        // Initial search to show all data
        dispatch(fetchStudents({ 
            ...filters,
            isActive: true,
            pageSize: 3000
        }));
    }, [dispatch, user]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleStudentSelect = (id, student) => {
        setFilters(prev => ({ ...prev, studentName: student ? `${student.firstName} ${student.lastName}` : '' }));
    };

    const handleReset = () => {
        setFilters({
            startDate: '',
            endDate: moment().format('YYYY-MM-DD'),
            courseFilter: '',
            branchId: user?.branchId || '',
            studentName: '',
            batch: 'All',
            reference: '',
            isRegistered: 'true'
        });
        setShowReport(false);
    };

    const handleSearch = () => {
        dispatch(fetchStudents({ 
            ...filters,
            batch: filters.batch === 'All' ? undefined : filters.batch,
            pageSize: 3000
        }));
        setShowReport(true);
    };

    useEffect(() => {
        if (students && students.length > 0) {
            // Group by batch
            const groups = {};
            students.forEach(student => {
                const bName = student.batch || 'Unassigned';
                if (!groups[bName]) groups[bName] = [];
                groups[bName].push(student);
            });

            // Sort groups
            const sortedGroups = {};
            Object.keys(groups).sort((a, b) => {
                if (a.toLowerCase().includes('general')) return 1;
                if (b.toLowerCase().includes('general')) return -1;
                return a.localeCompare(b);
            }).forEach(key => {
                sortedGroups[key] = groups[key];
            });

            setGroupedData(sortedGroups);

            // Calculate summary
            const summary = Object.keys(groups).map(batchName => ({
                name: batchName,
                count: groups[batchName].length
            })).sort((a, b) => a.name.localeCompare(b.name));
            setSummaryData(summary);
        } else {
            setGroupedData({});
            setSummaryData([]);
        }
    }, [students]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Batch_Wise_Register_Report',
    });

    const getBranchInfo = () => {
        let branchId = user?.branchId;

        if (user?.role === 'Super Admin') {
            return {
                name: "Main Branch",
                address: "Smart Institute",
                phone: "96017-49300",
                mobile: "98988-30409",
                email: "smartinstitutes@gmail.com"
            };
        }

        if (user && user.branchDetails && user.branchDetails.address) {
            return user.branchDetails;
        }

        if (branchId) {
             if (branches && branches.length > 0) {
                 const found = branches.find(b => b._id === branchId || b._id === branchId?._id);
                 if (found) return found;
             }
        }

         return {
            name: user?.branchName || "Main Branch", 
            address: "Smart Institute",
            phone: "96017-49300", 
            mobile: "98988-30409",
            email: "smartinstitutes@gmail.com" 
        };
    };

    const headerBranch = getBranchInfo();

    const parseStartHour = (startTimeStr) => {
        if (!startTimeStr) return null;
        const cleaned = startTimeStr.toUpperCase().trim();
        const isPM = cleaned.includes('PM');
        
        let timeStr = cleaned;
        const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            timeStr = timeMatch[0];
        }
        
        const parts = timeStr.replace(/[A-Z]/g, '').trim().split(':');
        let hour = parseInt(parts[0], 10);
        if (isNaN(hour)) return null;
        if (isPM && hour < 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        return hour;
    };

    const standardSlots = [
        { label: '1st', time: '8:00 to 09:00 am', startHour: 8, endHour: 9 },
        { label: '2nd', time: '9:00 to 10:00 am', startHour: 9, endHour: 10 },
        { label: '3rd', time: '10:00 to 11:00 am', startHour: 10, endHour: 11 },
        { label: '4th', time: '11:00 to 12:00 pm', startHour: 11, endHour: 12 },
        { label: '5th', time: '01:00 to 02:00 pm', startHour: 13, endHour: 14 },
        { label: '6th', time: '02:00 to 03:00 pm', startHour: 14, endHour: 15 },
        { label: '7th', time: '03:00 to 04:00 pm', startHour: 15, endHour: 16 },
        { label: '8th', time: '04:00 to 05:00 pm', startHour: 16, endHour: 17 },
    ];

    const getSlotStudents = (slotIndex) => {
        if (!students) return [];
        return students.filter(student => {
            if (!student.batch) return false;
            const bName = student.batch.toLowerCase();
            
            const batchObj = batches?.find(b => b.name === student.batch);
            const startHour = batchObj ? parseStartHour(batchObj.startTime) : parseStartHour(student.batch);
            
            if (startHour !== null) {
                if (slotIndex === 0) return startHour === 8;
                if (slotIndex === 1) return startHour === 9;
                if (slotIndex === 2) return startHour === 10;
                if (slotIndex === 3) return startHour === 11;
                if (slotIndex === 4) return startHour === 12 || startHour === 13 || startHour === 1;
                if (slotIndex === 5) return startHour === 14 || startHour === 2;
                if (slotIndex === 6) return startHour === 15 || startHour === 3;
                if (slotIndex === 7) return startHour === 16 || startHour === 4;
            }
            
            if (slotIndex === 0) return bName.includes('8:00') || bName.includes('08:00');
            if (slotIndex === 1) return bName.includes('9:00') || bName.includes('09:00');
            if (slotIndex === 2) return bName.includes('10:00');
            if (slotIndex === 3) return bName.includes('11:00');
            if (slotIndex === 4) return bName.includes('12:00') || bName.includes('1:00') || bName.includes('01:00');
            if (slotIndex === 5) return bName.includes('2:00') || bName.includes('02:00');
            if (slotIndex === 6) return bName.includes('3:00') || bName.includes('03:00');
            if (slotIndex === 7) return bName.includes('4:00') || bName.includes('04:00');
            
            return false;
        });
    };

    const getHeaderDateString = () => {
        const dateVal = filters.startDate || filters.endDate || new Date();
        return moment(dateVal).format('MMMM - YYYY');
    };

    const totalCount = standardSlots.reduce((acc, _, idx) => acc + getSlotStudents(idx).length, 0);

    const renderBatchTable = (slotIndex) => {
        const slot = standardSlots[slotIndex];
        const slotStudents = getSlotStudents(slotIndex);
        
        const rows = [];
        for (let i = 0; i < 6; i++) {
            rows.push(slotStudents[i] || null);
        }
        
        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.2px solid #000', fontSize: '7.5px', fontFamily: 'Arial, sans-serif', color: '#000', tableLayout: 'fixed' }}>
                <thead>
                    <tr style={{ backgroundColor: '#d2543e', color: '#fff', height: '6mm', borderBottom: '1.2px solid #000' }}>
                        <th style={{ width: '8%', borderRight: '1px solid #000', fontWeight: 'bold', fontSize: '7.5px', textAlign: 'center', padding: 0 }}>{slot.label}</th>
                        <th style={{ width: '12%', borderRight: '1px solid #000', fontWeight: 'bold', fontSize: '7.5px', textAlign: 'center', padding: 0 }}>Reg</th>
                        <th style={{ width: '40%', borderRight: '1px solid #000', fontWeight: 'bold', fontSize: '7.5px', textAlign: 'center', padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.time}</th>
                        <th style={{ width: '23%', borderRight: '1px solid #000', fontWeight: 'bold', fontSize: '7.5px', textAlign: 'center', padding: 0 }}>MOBILE</th>
                        <th style={{ width: '17%', fontWeight: 'bold', fontSize: '7.5px', textAlign: 'center', padding: 0 }}>COURSES</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((student, idx) => {
                        const parentMobile = student?.mobileParent || student?.contactParent || '-';
                        const homeMobile = student?.contactHome || '-';
                        const studentMobile = student?.mobileStudent || student?.contactStudent || '-';
                        
                        return (
                            <tr key={idx} style={{ height: '8.8mm', borderBottom: idx < 5 ? '1px solid #000' : 'none' }}>
                                <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 'bold', padding: 0 }}>{idx + 1}</td>
                                <td style={{ borderRight: '1px solid #000', textAlign: 'center', fontWeight: 'bold', padding: 0 }}>
                                    {student?.regNo || ''}
                                </td>
                                <td style={{ borderRight: '1px solid #000', paddingLeft: '4px', fontWeight: 'bold', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                    {student ? `${student.firstName} ${student.lastName}`.substring(0, 18) : ''}
                                </td>
                                <td style={{ borderRight: '1px solid #000', padding: 0 }}>
                                    <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none', margin: 0, padding: 0 }}>
                                        <tbody>
                                            <tr style={{ height: '2.9mm' }}>
                                                <td style={{ width: '20%', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6px', padding: 0 }}>G</td>
                                                <td style={{ borderBottom: '1px solid #000', paddingLeft: '2px', fontSize: '6.5px', fontWeight: '600', padding: 0, textAlign: 'left' }}>{parentMobile}</td>
                                            </tr>
                                            <tr style={{ height: '2.9mm' }}>
                                                <td style={{ width: '20%', borderRight: '1px solid #000', borderBottom: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6px', padding: 0 }}>H</td>
                                                <td style={{ borderBottom: '1px solid #000', paddingLeft: '2px', fontSize: '6.5px', fontWeight: '600', padding: 0, textAlign: 'left' }}>{homeMobile}</td>
                                            </tr>
                                            <tr style={{ height: '2.9mm' }}>
                                                <td style={{ width: '20%', borderRight: '1px solid #000', textAlign: 'center', fontWeight: 'bold', fontSize: '6px', padding: 0 }}>S</td>
                                                <td style={{ paddingLeft: '2px', fontSize: '6.5px', fontWeight: '600', padding: 0, textAlign: 'left' }}>{studentMobile}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td style={{ paddingLeft: '4px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '7px', textAlign: 'left' }}>
                                    {student?.course?.shortName || student?.course?.name || ''}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    if (studentsLoading || batchesLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Generating Report Data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">From Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">To Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Course</label>
                        <select name="courseFilter" value={filters.courseFilter} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none">
                            <option value="">All Courses</option>
                            {courses && courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    {user?.role === 'Super Admin' && (
                        <div>
                            <label className="text-sm font-semibold text-gray-600 mb-1 block">Branch</label>
                            <select name="branchId" value={filters.branchId} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none">
                                <option value="">All Branches</option>
                                {branches && branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <StudentSearch 
                            label="Student Name"
                            placeholder="Search by name..."
                            onSelect={handleStudentSelect}
                            displayField="name"
                            additionalFilters={{ isRegistered: 'true', branchId: filters.branchId }}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Batch</label>
                        <select name="batch" value={filters.batch} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none">
                            <option value="All">All Batches</option>
                            {batches && batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-600 mb-1 block">Reference By (Employee)</label>
                        <select name="reference" value={filters.reference} onChange={handleFilterChange} className="w-full border rounded p-2 focus:ring-2 focus:ring-primary outline-none">
                            <option value="">All Employees</option>
                            {employees && employees.map(emp => (
                                <option key={emp._id} value={emp.name}>{emp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={handleReset} className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 border border-gray-300 font-medium transition flex items-center gap-1">
                        <RefreshCw size={16} /> Reset
                    </button>
                    <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow transition flex items-center gap-2">
                        {studentsLoading ? 'Loading...' : <><Search size={18} /> Show Report</>}
                    </button>
                    <button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded font-bold shadow transition flex items-center gap-2">
                        <Printer size={18} /> Print Report
                    </button>
                </div>
            </div>

            {showReport && (
                <div className="preview-scroll-wrapper border border-slate-200 rounded-xl p-4 bg-slate-50 overflow-auto flex justify-center mb-8 print:border-0 print:p-0 print:bg-white print:overflow-visible">
                    <div 
                        ref={componentRef} 
                        className="print-container bg-white"
                        style={{ 
                            width: '210mm', 
                            height: '297mm', 
                            padding: '4mm 6mm', 
                            boxSizing: 'border-box', 
                            position: 'relative', 
                            backgroundColor: '#fff',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }}
                    >
                        {/* Top Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2mm' }}>
                            {/* Logo */}
                            <div style={{ width: '22%' }}>
                                <img src={logo} alt="Smart Institute Logo" style={{ height: '14mm', width: 'auto', objectFit: 'contain' }} />
                            </div>

                            {/* Month and Year */}
                            <div style={{ width: '40%', textAlign: 'center' }}>
                                <div style={{ fontSize: '6mm', fontWeight: '900', color: '#1e3a8a', fontFamily: 'Arial, sans-serif' }}>
                                    {getHeaderDateString()}
                                </div>
                            </div>

                            {/* Branch Address & Contacts */}
                            <div style={{ width: '38%', textAlign: 'right', fontFamily: 'Arial, sans-serif', color: '#000', fontSize: '7px', lineHeight: '1.2' }}>
                                <div style={{ fontWeight: '900', fontSize: '9px', color: '#1e3a8a' }}>{headerBranch.name || 'Godadra Branch'}</div>
                                <div>{headerBranch.address || 'H.O.: 1st & 2nd Floor, 30, kober Nagar,'}</div>
                                <div>Opp. Haba baijnath Mandir, Aas-pass Circle, Godadra,</div>
                                <div>Surat, Gujarat (INDIA)</div>
                                <div style={{ fontWeight: 'bold' }}>
                                    Ph. No.: {headerBranch.phone || '96017 49300'} Mob.: {headerBranch.mobile || '+91 98988 30409'}
                                </div>
                            </div>
                        </div>

                        {/* Green & Orange Banner */}
                        <div style={{ display: 'flex', width: '100%', marginBottom: '3mm', height: '8mm', boxSizing: 'border-box' }}>
                            <div style={{ 
                                width: '85%', 
                                backgroundColor: '#2b8258', 
                                color: '#000', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '4.5mm', 
                                fontWeight: '900', 
                                fontFamily: 'Arial, sans-serif',
                                letterSpacing: '1px',
                                border: '1.5px solid #000',
                                borderRight: 'none'
                            }}>
                                BATCH WISE REGISTER {moment(filters.startDate || filters.endDate || new Date()).format('YYYY')}
                            </div>
                            <div style={{ 
                                width: '15%', 
                                backgroundColor: '#ec9b1c', 
                                color: '#000', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '5mm', 
                                fontWeight: '900', 
                                fontFamily: 'Arial, sans-serif',
                                border: '1.5px solid #000'
                            }}>
                                {totalCount}
                            </div>
                        </div>

                        {/* Double-Column Grid of Batch Tables */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3mm', width: '100%', boxSizing: 'border-box' }}>
                            
                            {/* Left Column (Slots 0, 2, 4, 6) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3mm' }}>
                                {renderBatchTable(0)}
                                {renderBatchTable(2)}
                                {renderBatchTable(4)}
                                {renderBatchTable(6)}
                            </div>

                            {/* Right Column (Slots 1, 3, 5, 7) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3mm' }}>
                                {renderBatchTable(1)}
                                {renderBatchTable(3)}
                                {renderBatchTable(5)}
                                {renderBatchTable(7)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print, .print\\:hidden { display: none !important; }
                    .preview-scroll-wrapper {
                        padding: 0 !important;
                        border: 0 !important;
                        background: none !important;
                        overflow: visible !important;
                    }
                    .print-container { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 4mm 6mm !important;
                        margin: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        page-break-after: avoid;
                        page-break-before: avoid;
                    }
                    body { background: white !important; }
                    @page { 
                        size: A4 portrait;
                        margin: 0; 
                    }
                }
            `}} />
        </div>
    );
};

export default BatchWiseRegister;
