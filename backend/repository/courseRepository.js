const mongoose = require("mongoose");
const course = require("../models/course");

const courseSchema = course.courseSchema;
const Course = mongoose.model("Course", courseSchema);


module.exports = Course;