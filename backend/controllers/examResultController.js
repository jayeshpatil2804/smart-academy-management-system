const asyncHandler = require('express-async-handler');
const ExamResult = require('../models/ExamResult');
const Student = require('../models/Student');
const Counter = require('../models/Counter');
const ExamSchedule = require('../models/ExamSchedule');

// @desc    Get Exam Results with Filters
// @route   GET /api/master/exam-result
const getExamResults = asyncHandler(async (req, res) => {
    const { examId, batch, regNo, studentName, courseId, examName } = req.query;

    let query = { isDeleted: false };

    if (examId) query.exam = examId;
    if (courseId) query.course = courseId;
    if (examName) {
        const schedules = await ExamSchedule.find({ examName: { $regex: examName, $options: 'i' } }).select('_id');
        query.exam = { $in: schedules.map(s => s._id) };
    }
    if (batch) query.batch = { $regex: batch, $options: 'i' };
    if (req.query.studentId) query.student = req.query.studentId;
    
    // Filter by Student details (requires looking up students first)
    if (regNo || studentName) {
        let studentQuery = {};
        if (regNo) studentQuery.regNo = { $regex: regNo, $options: 'i' };
        if (studentName) {
            studentQuery.$or = [
                { firstName: { $regex: studentName, $options: 'i' } },
                { lastName: { $regex: studentName, $options: 'i' } }
            ];
        }
        const students = await Student.find(studentQuery).select('_id');
        query.student = { $in: students };
    }

    const results = await ExamResult.find(query)
        .populate('student', 'firstName lastName regNo enrollmentNo mobileStudent studentPhoto')
        .populate('course', 'name')
        .populate('exam', 'examName')
        .sort({ createdAt: -1 });

    res.json(results);
});

// @desc    Create Exam Result
// @route   POST /api/master/exam-result
const createExamResult = asyncHandler(async (req, res) => {
    const { studentId, examId, somNumber, csrNumber, subjectMarks, grade, isActive } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        res.status(404); throw new Error('Student not found');
    }

    // Auto-generate SOM and CSR if not provided
    let finalSom = somNumber;
    let finalCsr = csrNumber;

    if (!finalSom) {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'examResultSeq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        finalSom = `SOM-G${counter.seq.toString().padStart(5, '0')}`;
    }

    if (!finalCsr || finalCsr.startsWith('SOM-')) {
        if (finalSom.startsWith('SOM-')) {
            finalCsr = finalSom.replace('SOM-', 'CSR-');
        } else {
            finalCsr = `CSR-${finalSom}`;
        }
    }

    // Calculate totals from subjects
    const marksObtained = subjectMarks.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const totalMarks = subjectMarks.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);

    const result = await ExamResult.create({
        student: studentId,
        exam: examId,
        course: student.course,
        batch: student.batch,
        somNumber: finalSom,
        csrNumber: finalCsr,
        subjectMarks: subjectMarks.map(s => ({
            subject: s.subjectId,
            theory: s.theory,
            practical: s.practical,
            total: s.total
        })),
        marksObtained,
        totalMarks,
        grade,
        isActive
    });

    const populated = await ExamResult.findById(result._id)
        .populate('student', 'firstName lastName regNo enrollmentNo')
        .populate('course', 'name')
        .populate('exam', 'examName')
        .populate('subjectMarks.subject', 'name');

    res.status(201).json(populated);
});

// @desc    Update Exam Result
// @route   PUT /api/master/exam-result/:id
const updateExamResult = asyncHandler(async (req, res) => {
    const result = await ExamResult.findById(req.params.id);
    if (result) {
        let finalSom = req.body.somNumber || result.somNumber;
        let finalCsr = req.body.csrNumber || result.csrNumber;

        // Auto-correct to CSR- prefix if empty or starting with SOM-
        if (!finalCsr || finalCsr.startsWith('SOM-')) {
            if (finalSom.startsWith('SOM-')) {
                finalCsr = finalSom.replace('SOM-', 'CSR-');
            } else {
                finalCsr = `CSR-${finalSom}`;
            }
        }

        result.somNumber = finalSom;
        result.csrNumber = finalCsr;
        result.grade = req.body.grade || result.grade;
        result.isActive = req.body.isActive !== undefined ? req.body.isActive : result.isActive;

        if (req.body.subjectMarks) {
            result.subjectMarks = req.body.subjectMarks.map(s => ({
                subject: s.subjectId || s.subject,
                theory: s.theory,
                practical: s.practical,
                total: s.total
            }));
            result.marksObtained = result.subjectMarks.reduce((sum, s) => sum + Number(s.total || 0), 0);
            result.totalMarks = req.body.subjectMarks.reduce((sum, s) => sum + Number(s.maxMarks || 100), 0);
        }

        const updated = await result.save();
        const populated = await ExamResult.findById(updated._id)
             .populate('student', 'firstName lastName regNo enrollmentNo')
             .populate('course', 'name')
             .populate('exam', 'examName')
             .populate('subjectMarks.subject', 'name');
             
        res.json(populated);
    } else {
        res.status(404); throw new Error('Result not found');
    }
});

// @desc    Delete Exam Result (Soft Delete)
// @route   DELETE /api/master/exam-result/:id
const deleteExamResult = asyncHandler(async (req, res) => {
    const result = await ExamResult.findById(req.params.id);
    if (result) {
        result.isDeleted = true;
        await result.save();
        res.json({ message: 'Result deleted successfully', id: req.params.id });
    } else {
        res.status(404); throw new Error('Result not found');
    }
});

// @desc    Get Single Exam Result
// @route   GET /api/master/exam-result/:id
const getExamResultById = asyncHandler(async (req, res) => {
    const result = await ExamResult.findById(req.params.id)
        .populate('student', 'firstName middleName lastName regNo enrollmentNo mobileStudent studentPhoto dob aadharCard address city state pincode batch')
        .populate('course', 'name duration durationType shortName')
        .populate('subjectMarks.subject', 'name')
        .populate({
            path: 'exam',
            select: 'examName timeTable',
            populate: {
                path: 'timeTable.subject',
                select: 'name'
            }
        });
    
    if (result) {
        res.json(result);
    } else {
        res.status(404); throw new Error('Result not found');
    }
});

// @desc    Get Next Available SOM and CSR Numbers
// @route   GET /api/master/exam-result/next-numbers
const getNextResultNumbers = asyncHandler(async (req, res) => {
    let counter = await Counter.findById('examResultSeq');
    if (!counter) {
        const count = await ExamResult.countDocuments();
        counter = await Counter.create({ _id: 'examResultSeq', seq: count });
    }
    const nextSeq = counter.seq + 1;
    const nextSom = `SOM-G${nextSeq.toString().padStart(5, '0')}`;
    res.json({
        somNumber: nextSom,
        csrNumber: nextSom.startsWith('SOM-') ? nextSom.replace('SOM-', 'CSR-') : `CSR-${nextSom}`
    });
});

module.exports = { getExamResults, createExamResult, updateExamResult, deleteExamResult, getExamResultById, getNextResultNumbers };