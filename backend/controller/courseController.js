
const course = require("../repository/courseRepository")
const student = require("../repository/studentRepository")
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



const getCourses = app.get("/api/courses", async (req, res)=>{
    try{
        const courses = await courseRepository.find().sort({name:1});
        logger.info(`Retrieved ${courses.length} courses successfully`);
        res.json(courses);
    }catch(error){
        logger.error("Error fetching courses:", error);
        res.status(500).json({message: error.message})
    }
});

const createCourse =  app.post("/api/courses", async(req, res)=>{
    try{
        const courseCreated = new courseRepository(req.body);
        const savedCourse = await courseCreated.save();
        logger.info("New course created", {
            courseId : savedCourse._id,
            name : savedCourse.name,
        });
        res.status(201).json(savedCourse)
    }catch(error){
        logger.error("Error creating course: ", error);
        res.status(400).json({message: error.message });
    }
});

const updateCourse = app.put("/api/courses/:id", async(req, res)=>{
    try{
        const courseUpdated = await courseRepository.findByIdAndUpdate(req.params.id, req.body,{
            new : true,
        });
        if(!course){
            logger.warn("course not found for update",{courseId: req.params.id});
            return res.status(404).json({message: "course not found" });
        }
        res.status(201).json({message : "course updated successfully"})
    }catch(error){
        logger.error("Error updating course", error);
        res.status(404).json({message: error.message });
    }
});


const deleteCourse = app.delete("api/courses/:id", async(req, res)=>{
    try{
        const enrolledStudent = await studentRepository.countDocuments({
            course: req.params.id,
        });
        if(enrolledStudent > 0){
            logger.warn("Attempted to delete course with enrolled students: ",{
                courseId : req.params.id,
                enrolledStudent,
            });
            return res
            .status(400)
            .json({message: "Cannot delete course with enrolled students"})
        }
        const courseDeleted = await courseRepository.findByIdAndDelete(req.params.id);
        if(!courseDeleted){
            logger.warn("Course not found for deletion",{
                courseId : req.params.id,
            });
            return res.status(404).json({message: "Course not found "});
        }
        logger.info("Course deleted successfully",{
            courseId : courseDeleted._id,
            name : courseDeleted.name
        });
        res.json({ message: "Course deleted successfully" });
    }catch(error){
        logger.error("Error deleting course", error);
        res.status(500).json({message: "Error deleting message"})
    }
})


const getCourse = app.get("/api/courses/:id",async(req, res)=>{
    try{
        const courseFound = await courseRepository.findById(req.params.id);
        if(!course){
            logger.warn("Course not found: ", {
                courseId : req.params.id,
            });
            return res.status(404).json({ message : "Course not found" });
        }
        res.json(courseFound);
    }catch(error){
        logger.error("Error fetching course: ",error)
        res.status(500).json({message: error.message })
    }
});


module.exports = {getCourses, getCourse, deleteCourse, updateCourse, createCourse}