import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

// Import Assets
import frame from '../../../assets/FRAME.png';
import smartThump from '../../../assets/SMARTTHUMP.png';
import aisdc from '../../../assets/aISDC.png';
import dac from '../../../assets/dac.png';
import foundation from '../../../assets/fOUNDATION.png';
import logo2 from '../../../assets/logo2.png';
import markshettkl from '../../../assets/marksheetrhen.png';

const ExamResultPrint = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'Marksheet';

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = `${import.meta.env.VITE_API_URL}/master/exam-result/`;

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await axios.get(API_URL + id, { withCredentials: true });
                setResult(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch exam result", error);
                setLoading(false);
            }
        };
        fetchResult();
    }, [id]);

    // Translate numbers to words (e.g. 66 -> "SIX SIX")
    const numberToWords = (num) => {
        if (num === '-' || num === undefined || num === null || num === '') return '';
        let str = num.toString();
        if (str.length === 1 && !isNaN(num)) {
            str = '0' + str;
        }
        const words = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
        return str.split('').map(digit => {
            const parsed = parseInt(digit);
            return isNaN(parsed) ? digit : words[parsed];
        }).join(' ');
    };

    // Full english translation of grand totals
    const fullNumberToWords = (num) => {
        if (!num || isNaN(num)) return '';
        if (num === 0) return 'ZERO';
        const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
        const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

        const convertLessThanOneThousand = (n) => {
            if (n < 20) return ones[n];
            const tempTens = tens[Math.floor(n / 10)];
            const tempOnes = ones[n % 10];
            const separator = (tempTens && tempOnes) ? " " : "";
            if (n < 100) return tempTens + separator + tempOnes;

            const hundred = ones[Math.floor(n / 100)] + " HUNDRED";
            const remainder = n % 100;
            if (remainder > 0) {
                return hundred + " " + convertLessThanOneThousand(remainder);
            }
            return hundred;
        };

        return convertLessThanOneThousand(num);
    };

    const getDaySuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    // Calculate subject-wise grade dynamically matching overall criteria
    const getSubjectGrade = (obtained, max) => {
        if (obtained === '-' || !max || isNaN(obtained)) return '-';
        const pct = max > 0 ? (obtained / max) * 100 : 0;
        if (pct >= 80) return 'DISTINCTION';
        if (pct >= 60) return 'FIRST';
        if (pct >= 50) return 'SECOND';
        if (pct >= 34) return 'THIRD';
        return 'FAIL';
    };

    // Helper to determine max marks based on subject name or table index
    const getMaxMarks = (name, index) => {
        const n = (name || '').toUpperCase();
        if (n.includes('PROJECT') || n.includes('DESCIPLINE') || n.includes('DISCIPLINE') || index === 5 || index === 6) {
            return 50;
        }
        return 100;
    };

    // Helper to get matching subject details (name + subtext) based on input
    const getSubjectDetails = (name, index) => {
        const n = (name || '').toUpperCase();

        const defaults = [
            { name: 'BASIC (I)', subtext: 'Os-XP/Windows7, Dos, Word, Excel, Powerpoint' },
            { name: 'H.T.M.L. (II)', subtext: 'Hyper Text Markup Language' },
            { name: 'TALLY (III)', subtext: 'Tally.9, Tally ERP.9' },
            { name: 'DESKTOP PUBLISHING- D.T.P. (IV)', subtext: 'Photoshop Cs3, Corel Draw, Pagemaker' },
            { name: 'INTERNET & SEMINAR (V)', subtext: 'Internet & Seminar' },
            { name: 'PROJECT', subtext: '' },
            { name: 'DESCIPLINE', subtext: '' }
        ];

        // Match common roman numerals/indicators
        if (n === '(I)' || n === 'I') return defaults[0];
        if (n === '(II)' || n === 'II') return defaults[1];
        if (n === '(III)' || n === 'III') return defaults[2];
        if (n === '(IV)' || n === 'IV') return defaults[3];
        if (n === '(V)' || n === 'V') return defaults[4];
        if (n === 'PROJECT') return defaults[5];
        if (n === 'DESCIPLINE' || n === 'DISCIPLINE') return defaults[6];

        // Intelligent keywords match
        let matchedName = n;
        let matchedSubtext = '';
        if (n.includes('BASIC')) { matchedName = 'BASIC (I)'; matchedSubtext = defaults[0].subtext; }
        else if (n.includes('HTML') || n.includes('MARKUP') || n.includes('H.T.M.L')) { matchedName = 'H.T.M.L. (II)'; matchedSubtext = defaults[1].subtext; }
        else if (n.includes('TALLY')) { matchedName = 'TALLY (III)'; matchedSubtext = defaults[2].subtext; }
        else if (n.includes('DESKTOP') || n.includes('DTP') || n.includes('PUBLISHING')) { matchedName = 'DESKTOP PUBLISHING- D.T.P. (IV)'; matchedSubtext = defaults[3].subtext; }
        else if (n.includes('INTERNET') || n.includes('SEMINAR')) { matchedName = 'INTERNET & SEMINAR (V)'; matchedSubtext = defaults[4].subtext; }
        else if (n.includes('PROJECT')) { matchedName = 'PROJECT'; matchedSubtext = ''; }
        else if (n.includes('DESCIPLINE') || n.includes('DISCIPLINE')) { matchedName = 'DESCIPLINE'; matchedSubtext = ''; }
        else {
            if (index >= 0 && index < defaults.length) {
                return defaults[index];
            }
        }
        return { name: matchedName, subtext: matchedSubtext };
    };

    const formatMark = (val) => {
        if (val === '-' || val === undefined || val === null || val === '') return '';
        return val;
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-semibold">Loading result data...</div>;
    if (!result) return <div className="p-10 text-center text-red-500 font-bold">Result not found</div>;

    const student = result.student;
    const exam = result.exam;
    const course = result.course;
    const subjects = exam?.timeTable || [];
    const issueDate = moment(result.createdAt);

    // Render actual student marks only
    const marksData = result.subjectMarks || [];

    const studentPrefix = student?.gender?.toLowerCase() === 'female' ? 'MISS.' : 'MR.';
    const fatherPrefix = 'SHRI';

    return (
        <div className="bg-slate-500 min-h-screen py-10 print:py-0 print:bg-white flex flex-col items-center font-sans text-slate-900">
            {/* --- Web Print Control Bar --- */}
            <div className="fixed top-5 right-5 print:hidden flex gap-2 z-[100]">
                <button
                    onClick={() => window.print()}
                    className="bg-[#1565C0] text-white px-8 py-2.5 rounded-full font-extrabold shadow-lg hover:scale-105 transition-transform"
                >
                    🖨️ Print {type}
                </button>
            </div>

            {/* --- A4 Print Sheet --- */}
            <div className="sheet bg-white w-[210mm] h-[297mm] relative overflow-hidden print:w-[210mm] print:h-[297mm] print:m-0 print:shadow-none shadow-2xl box-border">

                {type === 'Marksheet' ? (
                    <>
                        {/* Background pre-printed template image */}
                        <img src={markshettkl} alt="Marksheet Template Background" className="bg-img" />

                        {/* Content Container Flow positioned inside the golden frame backdrop */}
                        <div style={{ position: 'absolute', top: '70.8mm', left: '17.5mm', width: '175.5mm', display: 'flex', flexDirection: 'column', zIndex: 10, boxSizing: 'border-box' }}>
                            
                            {/* Register No on its own line, floated to the right */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '1.5mm', fontFamily: 'Arial, sans-serif', color: '#000' }}>
                                <div style={{ fontSize: '3.8mm', fontWeight: '900', textAlign: 'right', paddingRight: '2mm', whiteSpace: 'nowrap' }}>
                                    Reg. No. {student?.regNo || '398/SUR'}
                                </div>
                            </div>

                            {/* Candidate Details Grid below Register No */}
                            <div style={{ width: '100%', marginBottom: '4mm', fontFamily: 'Arial, sans-serif', color: '#000' }}>
                                <table style={{ borderCollapse: 'collapse', border: 'none', textAlign: 'left', width: '100%', background: 'transparent' }}>
                                    <tbody>
                                        <tr style={{ height: '5.2mm' }}>
                                            <td style={{ width: '22%', border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>CANDIDATE NAME</td>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>: {studentPrefix} {student?.firstName} {student?.middleName} {student?.lastName}</td>
                                        </tr>
                                        <tr style={{ height: '5.2mm' }}>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>FATHER NAME</td>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>: {fatherPrefix} {student?.fatherName || student?.middleName}</td>
                                        </tr>
                                        <tr style={{ height: '5.2mm' }}>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>COURSE</td>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>: {course?.name} ({course?.shortName || 'N/A'})</td>
                                        </tr>
                                        <tr style={{ height: '5.2mm' }}>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>DURATION</td>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>: {course?.duration || '12'} {course?.durationType || 'MONTH'}</td>
                                        </tr>
                                        <tr style={{ height: '5.2mm' }}>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>CENTRE</td>
                                            <td style={{ border: 'none', fontWeight: '900', padding: 0, fontSize: '3.5mm' }}>: {course?.centerName || 'GODADARA, SURAT'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Center Align STATEMENT OF MARKS heading with custom spacing and underline */}
                            <div style={{ width: '100%', textAlign: 'center', fontSize: '5mm', fontWeight: '900', color: '#000', letterSpacing: '0.8px', fontFamily: 'Arial, sans-serif', marginTop: '4mm', marginBottom: '3.5mm', textDecoration: 'underline' }}>
                                STATEMENT OF MARKS
                            </div>

                            {/* MAIN MARKS TABLE (Native two-row header with rowspan/colspan to ensure perfect vertical borders) */}
                            <div className="tbl-wrap" style={{ position: 'relative', top: 'auto', left: 'auto', width: '100%', zIndex: 10 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ height: '6.5mm' }}>
                                            <th rowSpan="2" style={{ width: '8%', border: '1px solid #000', fontWeight: '900', fontSize: '8.8px' }}>NO.</th>
                                            <th rowSpan="2" style={{ width: '30%', border: '1px solid #000', fontWeight: '900', fontSize: '8.8px' }}>NAME OF THE SUBJECT</th>
                                            <th rowSpan="2" style={{ width: '8%', border: '1px solid #000', fontWeight: '900', fontSize: '8.8px' }}>MAX.<br />MARKS</th>
                                            <th colSpan="3" style={{ width: '27%', border: '1px solid #000', fontWeight: '900', fontSize: '9px', padding: '2px 0' }}>OBTAINED MARKS</th>
                                            <th rowSpan="2" style={{ width: '17%', border: '1px solid #000', fontWeight: '900', fontSize: '8.8px' }}>OBTAINED<br />MARKS IN WORD</th>
                                            <th rowSpan="2" style={{ width: '10%', border: '1px solid #000', fontWeight: '900', fontSize: '8.8px' }}>SUBJECT<br />WISE GRADE</th>
                                        </tr>
                                        <tr style={{ height: '6mm' }}>
                                            <th style={{ width: '9%', border: '1px solid #000', fontWeight: '900', fontSize: '8px', padding: '2px 0' }}>THEORY</th>
                                            <th style={{ width: '9%', border: '1px solid #000', fontWeight: '900', fontSize: '8px', padding: '2px 0' }}>PRACTICAL</th>
                                            <th style={{ width: '9%', border: '1px solid #000', fontWeight: '900', fontSize: '8px', padding: '2px 0' }}>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marksData.map((subj, index) => {
                                            const subjectName = subj.subject?.name || subj.subjectName || subj.name || '';
                                            const harms = subjectName !== '---' && subjectName !== '';
                                            const totalVal = harms ? (subj.total !== '-' ? subj.total : (Number(subj.theory) || 0) + (Number(subj.practical) || 0)) : '';
                                            const maxMarksVal = harms ? (subj.maxMarks || getMaxMarks(subjectName, index)) : '';
                                            const gradeVal = harms ? getSubjectGrade(totalVal, maxMarksVal) : '';
                                            const wordsVal = harms ? numberToWords(totalVal) : '';

                                            // Resolve full subject name and subtexts intelligently
                                            const subjectDetails = getSubjectDetails(subjectName, index);
                                            const displaySubjectName = harms ? subjectDetails.name : '';
                                            const displaySubtext = harms ? subjectDetails.subtext : '';

                                            return (
                                                <tr key={index} style={{ height: '11mm' }}>
                                                    <td style={{ border: '1px solid #000' }}>{harms ? index + 1 : ''}</td>
                                                    <td style={{ border: '1px solid #000', textAlign: 'center', padding: '2px 4px' }}>
                                                        {harms ? (
                                                            <>
                                                                <div className="sname">{displaySubjectName}</div>
                                                                {displaySubtext && <div className="ssub">{displaySubtext}</div>}
                                                            </>
                                                        ) : ''}
                                                    </td>
                                                    <td style={{ border: '1px solid #000' }}>{harms ? maxMarksVal : ''}</td>
                                                    <td style={{ border: '1px solid #000' }}>{harms ? formatMark(subj.theory) : ''}</td>
                                                    <td style={{ border: '1px solid #000' }}>{harms ? formatMark(subj.practical) : ''}</td>
                                                    <td style={{ border: '1px solid #000' }}>{harms ? formatMark(totalVal) : ''}</td>
                                                    <td style={{ border: '1px solid #000', textTransform: 'uppercase' }}>{harms ? wordsVal : ''}</td>
                                                    <td style={{ border: '1px solid #000', textTransform: 'uppercase' }}>{harms ? gradeVal : ''}</td>
                                                </tr>
                                            );
                                        })}

                                        {/* Grand Total */}
                                        <tr className="gtotal">
                                            <td colSpan="3" style={{ textAlign: 'left', paddingLeft: '8px', fontSize: '9px', fontWeight: '900', border: '1px solid #000', whiteSpace: 'nowrap' }}>
                                                GRAND TOTAL OF MARKS OBTAINED OUT OF
                                            </td>
                                            <td colSpan="3" style={{ fontSize: '11px', fontWeight: '900', textAlign: 'center', border: '1px solid #000' }}>
                                                {result.marksObtained || '483'} / {result.totalMarks || '600'}
                                            </td>
                                            <td colSpan="2" style={{ textAlign: 'right', paddingRight: '8px', fontSize: '9.5px', fontWeight: '900', textTransform: 'uppercase', border: '1px solid #000' }}>
                                                {fullNumberToWords(result.marksObtained || 483)} ONLY
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Spacing spacer */}
                            <div style={{ height: '7mm' }}></div>

                            {/* BOTTOM SUMMARY TABLE positioned immediately below the main marks table */}
                            <div className="bot-wrap" style={{ position: 'relative', top: 'auto', left: 'auto', width: '143mm', zIndex: 10 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ height: '9mm' }}>
                                            <th style={{ width: '22%', border: '1px solid #000', fontWeight: '900', fontSize: '8px' }}>MONTH &amp; YEAR<br />OF EXAM</th>
                                            <th style={{ width: '18%', border: '1px solid #000', fontWeight: '900', fontSize: '8px' }}>SR.NO. OF<br />STATEMENT</th>
                                            <th style={{ width: '28%', border: '1px solid #000', fontWeight: '900', fontSize: '8px' }}>TOTAL PRESENTS (%)</th>
                                            <th style={{ width: '16%', border: '1px solid #000', fontWeight: '900', fontSize: '8px' }}>PERCENTAGE (%)</th>
                                            <th style={{ width: '16%', border: '1px solid #000', fontWeight: '900', fontSize: '8px' }}>GRADE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ height: '10mm' }}>
                                            <td style={{ border: '1px solid #000', fontWeight: '900', fontSize: '9px' }}>{exam?.examName || 'JANUARY - 2019'}</td>
                                            <td className="td-blue" style={{ border: '1px solid #000', fontWeight: '900', fontSize: '9px', color: '#1565C0' }}>{result.somNumber || 'SOM-G0035'}</td>
                                            <td style={{ border: '1px solid #000', fontWeight: '900', fontSize: '9px' }}>{result.totalPresentsText || 'DAYS 275 OUT OF 307 (89.50)'}</td>
                                            <td style={{ border: '1px solid #000', fontWeight: '900', fontSize: '9px' }}>{result.percentage || '66.20'}</td>
                                            <td style={{ border: '1px solid #000', fontWeight: '900', fontSize: '10px' }}>{result.grade || 'DISTINCTION'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Date of issue and CSR number positioned dynamically in the fluid blank area with zero overlap */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8mm', width: '100%', fontFamily: 'Arial, sans-serif', color: '#000' }}>
                                <div style={{ fontSize: '3.6mm', fontWeight: '900' }}>
                                    Date of issue : {issueDate.isValid() ? issueDate.format('DD MMMM YYYY') : '15 May 2019'}
                                </div>
                                <div style={{ fontSize: '3.6mm', fontWeight: '900', color: '#135CB3', marginRight: '35mm' }}>
                                    CSR. NO.: {result.csrNumber || 'SOM-G0035'}
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    /* ============================================================= */
                    /* ======================= CERTIFICATE VIEW ===================== */
                    /* ============================================================= */
                    <div className="relative z-10 h-full w-full px-[18mm] py-[20mm] flex flex-col justify-between box-border">
                        {/* 1. Yellow/Gold Background Frame */}
                        <img src={frame} alt="Gold Frame" className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" />

                        {/* 2. Watermark Background Logo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                            <img src={logo2} alt="Watermark" className="w-[480px] h-[480px] object-contain rotate-[-12deg]" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col justify-between h-full">
                            <div className="pt-2 px-2 flex flex-col items-center w-full">
                                <div className="w-full flex justify-between items-start mb-2">
                                    <div className="flex-grow"></div>
                                    <div className="flex flex-col items-end">
                                        <div className="w-28 h-32 border-2 border-[#D4AF37] p-1 mb-1 bg-white shadow-sm">
                                            {student?.studentPhoto ? (
                                                <img src={student.studentPhoto.startsWith('http') ? student.studentPhoto : `${import.meta.env.VITE_IMAGE_URL}/${student.studentPhoto}`} alt="Student" className="w-full h-full object-cover" />
                                            ) : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold">PHOTO</div>}
                                        </div>
                                        <p className="font-bold text-[11px] font-sans uppercase">Reg. No. {student?.regNo}</p>
                                    </div>
                                </div>

                                <h1 className="text-6xl font-serif text-[#1A237E] mb-6 tracking-wide" style={{ fontFamily: "'Times New Roman', serif" }}>Certificate</h1>

                                <div className="text-center space-y-3 font-serif italic text-lg text-gray-800 leading-relaxed w-full">
                                    <p className="text-xl not-italic font-bold text-gray-500 mb-4">This credential is awarded to</p>

                                    <p className="text-3xl not-italic font-black text-slate-900 mb-4 tracking-wide" style={{ fontFamily: "'Times New Roman', serif" }}>
                                        {student?.firstName} {student?.middleName} {student?.lastName}
                                    </p>

                                    <p className="px-8 leading-loose text-slate-800">
                                        D/o Shri {student?.fatherName || student?.middleName} On the {issueDate.date()}{getDaySuffix(issueDate.date())} day of the month {issueDate.format('MMMM')} <br />
                                        In the year {fullNumberToWords(issueDate.year())} for successfully completed a <br />
                                        {course?.duration || '12'} Months course in
                                    </p>

                                    <p className="text-2xl not-italic font-black text-black underline decoration-double decoration-gray-400 underline-offset-8 uppercase tracking-wide mt-2">
                                        {course?.name} ({course?.shortName || 'N/A'})
                                    </p>

                                    <p className="mt-4">
                                        With {result.grade || 'DISTINCTION'} from our Godadara Surat Center
                                    </p>
                                </div>

                                {/* Subjects List */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-1.5 mt-8 text-[14px] font-serif italic text-gray-700 w-full max-w-xl px-4">
                                    {subjects.length > 0 ? subjects.map((subj, i) => (
                                        <div key={i} className="tracking-wide">{i + 1}- {subj.subject?.name || 'Subject ' + (i + 1)}</div>
                                    )) : (
                                        <>
                                            <div>1- Basic</div>
                                            <div>2- Desktop Publishing</div>
                                            <div>3- Financial Accounting</div>
                                            <div>4- Programming in C, C++</div>
                                            <div>5- Internet & Seminar</div>
                                        </>
                                    )}
                                </div>

                                <div className="w-full mt-10 pl-6 space-y-1 font-bold text-[12.5px] font-sans text-slate-800">
                                    <p>Certificate No.: {result.certificateNumber || result._id?.slice(-4).toUpperCase()}</p>
                                    <p>Date of issue : {issueDate.format('DD MMMM YYYY')}</p>
                                </div>
                            </div>

                            {/* Signatures & Accreditation Logos block for Certificate */}
                            <div className="flex justify-between items-end px-2 mt-8 font-sans w-full">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="flex gap-3 items-center mb-1 bg-white p-0.5 rounded-sm">
                                        <img src={foundation} alt="Foundation Logo" className="h-9 w-auto object-contain" />
                                        <img src={aisdc} alt="AISDC Logo" className="h-9 w-auto object-contain" />
                                        <img src={dac} alt="DAC Logo" className="h-9 w-auto object-contain" />
                                    </div>
                                    <div className="text-center w-40 border-t border-black pt-1 text-[9.5px] font-black text-slate-900 uppercase tracking-wide">
                                        Centre Seal & Signature
                                    </div>
                                </div>

                                <div className="text-center w-40 border-t border-black pt-1 text-[9.5px] font-black text-slate-900 uppercase tracking-wide">
                                    Managing Director
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Custom Print Style overrides to strip page margins & load Montserrat/Playfair fonts */}
            <style type="text/css">
                {`
                    .sheet {
                        width: 210mm;
                        height: 297mm;
                        background: #fff;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0 8px 40px rgba(0,0,0,.4);
                    }
                    .bg-img {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        object-fit: fill;
                        z-index: 0;
                    }
                    .ov {
                        position: absolute;
                        z-index: 10;
                        font-family: Arial, sans-serif;
                        font-weight: 900;
                        color: #000;
                        line-height: 1.2;
                    }
                    .tbl-wrap {
                        z-index: 10;
                        width: 175.5mm;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: Arial, sans-serif;
                        font-size: 9.5px;
                        font-weight: 700;
                        text-align: center;
                        background: transparent;
                    }
                    table th, table td {
                        border: 1px solid #000;
                        padding: 2px 2px;
                        background: transparent;
                    }
                    table thead th {
                        font-size: 8.8px;
                        font-weight: 900;
                        color: #111;
                    }
                    .th-obtained {
                        border-bottom: 1px solid #000;
                        padding: 2px 0;
                        font-size: 9px;
                        font-weight: 900;
                    }
                    .sub-cols {
                        display: flex;
                        border-top: 1px solid #000;
                    }
                    .sub-col {
                        flex: 1;
                        padding: 2px 0;
                        font-size: 8px;
                        font-weight: 900;
                        border-right: 1px solid #000;
                    }
                    .sub-col:last-child { border-right: none; }
                    tbody tr { height: 11mm; }
                    .sname { font-size: 10px; font-weight: 900; text-transform: uppercase; line-height: 1.3; }
                    .ssub { font-size: 7px; font-weight: 600; color: #555; font-style: italic; margin-top: 1px; }
                    .gtotal td {
                        font-weight: 900!important;
                        font-size: 10px!important;
                        border-top: 1.5px solid #000;
                    }
                    .bot-wrap {
                        z-index: 10;
                        width: 143mm;
                    }
                    .bot-wrap table th { font-size: 8px; font-weight: 900; color: #111; }
                    .bot-wrap table td { font-size: 9px; font-weight: 900; }
                    .td-blue { color: #1565C0!important; }
                    .ov-date { top: 238.2mm; left: 42mm; font-size: 3.3mm; }
                    .ov-reg { top: 70.8mm; right: 18mm; font-size: 3.8mm; }
                    .ov-cname { top: 70.8mm; left: 60mm; font-size: 3.6mm; }
                    .ov-fname { top: 76.3mm; left: 60mm; font-size: 3.6mm; }
                    .ov-course { top: 81.8mm; left: 60mm; font-size: 3.6mm; max-width: 130mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .ov-dur { top: 87.3mm; left: 60mm; font-size: 3.6mm; }
                    .ov-centre { top: 92.8mm; left: 60mm; font-size: 3.6mm; }
                    .ov-csr { top: 246.2mm; right: 18mm; font-size: 3.3mm; color: #135CB3; }

                    @media print {
                        @page { 
                            size: A4 portrait; 
                            margin: 0; 
                        }
                        body {
                            background: #fff;
                            padding: 0;
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important;
                        }
                        .sheet {
                            box-shadow: none;
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default ExamResultPrint;