const student = require("../repository/studentRepository");
const course = require("../repository/courseRepository");
const winston = require("winston");
const express = require("express");

const app = express();


const courseRepository = course.Course;
const studentRepository = student.Student;

const logger = winston.createLogger({
    level:'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports:[
        new winston.transports.File({filename:"error.log", level: "error"}),
        new winston.transports.File({filename: "combined.log"}),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});


const getStudent = app.get("/api/students", async(req, res)=>{
    try{
        const studentFound = await studentRepository.find().sort({createdAt: -1});
        logger.info(`Retrieved ${student.length} student successfully`);
        res.json(studentFound);
    }
    catch(error){
        logger.error('Error fetching students: ', error);
        res.status(500).json({message: error.message})
    }
})

const createStudent = app.post("/api/students", async(req,res)=>{
    try{
        const studentCreated = new studentRepository(req.body);
        const savedStudent = await studentCreated.save();
        logger.info("New Student created: ",{
            studentId : savedStudent._id,
            name: savedStudent.name,
            course : savedStudent.course,
        })
        res.status(201).json(savedStudent);
    }catch(error){
        logger.error("Error creating student", error);
        res.status(400).json({message: error.message})
    }
});

const updateStudent = app.put("/api/students/:id", async(req, res)=>{
    try{
        const studentUpdated = await studentRepository.findByIdAndUpdate(req.params.id, req.body,{
            new : true,
        });
        if(!student){
            logger.warn("course not found for update",{
                courseId: req.params.id
                });
            return res.status(404).json({message: "course not found" });
        }
        logger.warn("Student updated successfully", {
            studentId : studentUpdated._id,
            name : studentUpdated.name,
            course: studentUpdated.course,
        })
        res.json(student)
    }catch(error){
        logger.error("Error updating student", error);
        res.status(404).json({message: error.message });
    }
});

const deleteStudent = app.delete("/api/students/:id", async(req, res)=>{
    try{
        const studentDeleted = await studentRepository.findByIdAndDelete(req.params.id);
        if(!studentDeleted){
            logger.warn('student not found for deletion', {
                studentId : req.params._id,
            })
            return res.status(404).json({message: 'Student not found'});
        }
        logger.info("Student deleted successfully",{
            studentId: studentDeleted._id,
            name: studentDeleted.name,
            course: studentDeleted.course
    })
    res.json({message: "Student deleted succesfully"})
    }catch(error){
        logger.error("Error deleting student", error);
        res.status(500).json({message: error.message})
    }
})

const FindStudents = app.get("/api/students/search", async(req, res)=>{
    try{
        const searchTerm = req.query._id;
        logger.info("Student search initiated", {searchTerm});


        const students = await studentRepository.find({
            $or:[
                {name: {$regex: searchTerm, $options: "i"}},
                {course: {$regex: searchTerm, $options: "i"}},
                {email: {$regex: searchTerm, $options: "i"}},
            ]
        });

        logger.info("student search", {
            searchTerm,
            resultsCount: students.length,
        })
        res.json(students);
    }catch(error){
        logger.error("Error Searching students: ", error);
        res.status(500).json({message: error.message})
    }
});

const getStudentById = app.get('/api/students/:id', async(req, res)=>{
    try{
        const studentFound = await studentRepository.findById(req.params.id);
        logger.info("student found successfully", {
            studentId : studentFound._id,
            name: studentFound.name,
            course: studentFound.course
        })
        if(!studentFound)
            return res.status(404).json({message: 'student not found'});
        res.json(studentFound)
    }catch(error){

    }
})


module.exports = {getStudent, createStudent, updateStudent, deleteStudent, FindStudents, getStudentById}