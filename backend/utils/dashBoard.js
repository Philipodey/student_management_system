const student = require("../repository/studentRepository");
const course = require("../repository/courseRepository");
const express = require("express");
const winston = require("winston");
const app = express();


const studentRepository = student.Student;
const courseRepository = course.Course;

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


const dashBoard = app.get('/api/dashboard/stats', async(req, res)=>{
    try{
        const stats = await getDashBoardStats();
        logger.info('Dashboard statistics retrieved successfully', stats);
        res.json(stats);
    }catch(error){
        logger.status(500).json({message: error.message})
    }
})

const getDashBoardStats = async()=>{
        const totalStudents = await studentRepository.countDocuments();
        const activeStudents = await studentRepository.countDocuments({active: "active"});
        const totalCourses = await courseRepository.countDocuments();
        const activeCourses = await courseRepository.countDocuments({status:"inactive"});
        const graduates = await studentRepository.countDocuments({status: "inactive"});
        const courseCounts = await studentRepository.aggregate([
            {$group :{_id: '$course', count: {$num: 1}}}
        ]) ;

        return {
            totalStudents,
            activeStudents,
            totalCourses,
            activeCourses,
            graduates,
            courseCounts,
            successRate: totalStudents > 0 ? Math.round((graduates/totalStudents)*100) : 0
        }
}

module.exports.dashBoard = dashBoard