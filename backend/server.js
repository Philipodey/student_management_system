const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const winston = require("winston");
const {getCourses, getCourse, deleteCourse, updateCourse, createCourse}
 = require("./controller/courseController") 
const student = require("./models/student");
const course = require("./models/course");
const {getStudent, createStudent, updateStudent, deleteStudent, FindStudents, getStudentById} = 
require("./controller/studentController")
const dashBoard = require("./utils/dashBoard")
// const formatUptime = require("./backend/utils/formatUptime")


const studentSchema = student.studentSchema;
const courseSchema = course.courseSchema;

const courseController = require("./controller/courseController")

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/student-management ",
    {
        useNewUrlParser: true,
        useUnifiedTopology:true,
    }
)
.then(()=>console.log("Connected to MongoDB"))
.catch((err)=>console.error("Mongo connection error", err));


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

app.use(
    morgan(":method:url :status :response-time ms - :res[content-length]")
)


// Custom API logger Middleware
const apiLogger = (req, res, next)=>{
    const start = Date.now();
    res.on("finish", ()=>{
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration : `${duration}ms`,
            params: req.params,
            query: req.query,
            body: req.method !== "GET" ? req.body: undefined
        })
    })
    next();
}
app.use(apiLogger);

// Error Handling Middleware
app.use((err, req, res, next)=>{
logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined
})
    res.status(500).json({message: "Internal server error"})
});



// const Student = mongoose.model("Student", studentSchema);


// const Course = mongoose.model("Course", courseSchema);

// Course Routes

// app.get("/api/courses", async (req, res)=>{
//     try{
//         const courses = await Course.find().sort({name:1});
//         logger.info(`Retrieved ${courses.length} courses successfully`);
//         res.json(courses);
//     }catch(error){
//         logger.error("Error fetching courses:", error);
//         res.status(500).json({message: error.message})
//     }
// })

// app.post("/api/courses", async(req, res)=>{
//     try{
//         const course = new Course(req.body);
//         const savedCourse = await course.saved();
//         logger.info("New course created", {
//             courseId : savedCourse._id,
//             name : savedCourse.name,
//         });
//         res.status(500).json(savedCourse)
//     }catch(error){
//         logger.error("Error creating course: ", error);
//         res.status(400).json({message: error.message });
//     }
// });

// app.put("/api/courses/:id", async(req, res)=>{
//     try{
//         const course = await Course.findByIdAndUpdate(req.params.id, req.body,{
//             new : true,
//         });
//         if(!course){
//             logger.warn("course not found for update",{courseId: req.params.id});
//             return res.status(404).json({message: "course not found" });
//         }
//     }catch(error){
//         logger.error("Error updating course", error);
//         res.status(404).json({message: error.message });
//     }
// });


// app.delete("api/courses/:id", async(req, res)=>{
//     try{
//         const enrolledStudent = await Student.countDocuments({
//             course: req.params.id,
//         });
//         if(enrolledStudent > 0){
//             logger.warn("Attempted to delete course with enrolled students: ",{
//                 courseId : req.params.id,
//                 enrolledStudent,
//             });
//             return res
//             .status(400)
//             .json({message: "Cannot delete course with enrolled students"})
//         }
//         const course = await course.findByIdAndDelete(req.params.id);
//         if(!course){
//             logger.warn("Course not found for deletion",{
//                 courseId : req.params.id,
//             });
//             return res.status(404).json({message: "Course not found "});
//         }
//         logger.info("Course deleted successfully",{
//             courseId : course._id,
//             name : course.name
//         });
//         res.json({ message: "Course deleted successfully" });
//     }catch(error){
//         logger.error("Error deleting course", error);
//         res.status(500).json({message: "Error deleting message"})
//     }
// })


// app.get("/api/courses/:id",async(req, res)=>{
//     try{
//         const course = await Course.findById(req.params.id);
//         if(!course){
//             logger.warn("Course not found: ", {
//                 courseId : req.params.id,
//             });
//             return res.status(404).json({ message : "Course not found" });
//         }
//         res.json(course);
//     }catch(error){
//         logger.error("Error fetching course: ",error)
//         res.status(500).json({messAGE: error.message })
//     }
// });

router.get("/api/courses", getCourses);
router.post("/api/courses", createCourse);
router.put("/api/courses/:id", updateCourse);
router.delete("/api/courses/:id", deleteCourse);
router.get("/api/courses/:id", getCourse);


router.get("/api/students", getStudent);
router.post("/api/students", createStudent);
router.put("/api/students/:id", updateStudent);
router.delete("/api/students/:id", deleteStudent);
router.get("/api/students/search", FindStudents);
router.get('/api/students/:id', getStudentById)

router.get('/api/dashboard/stats', dashBoard.dashBoard);

// Basic health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Detailed health check endpoint
app.get("/health/detailed", async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : "Disconnected";
        
        const systemInfo = {
            memory: {
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                unit: 'MB'
            },
            uptime: {
                seconds: Math.round(process.uptime()),
                formatted: formatUptime(process.uptime())
            },
            nodeVersion: process.version,
            platform: process.platform
        };

        const healthCheck = {
            status: 'UP',
            timestamp: new Date(),
            database: {
                status: dbStatus,
                name: 'MongoDb',
                host: mongoose.connection.host,
            },
            system: systemInfo,
            environment: process.env.NODE_ENV || 'development'
        };
        res.status(200).json(healthCheck);
    } catch (error) {
        res.status(500).json({
            status: 'DOWN',
            timestamp: new Date(),
            error: error.message
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Utility function to format uptime
function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

module.exports = app;
