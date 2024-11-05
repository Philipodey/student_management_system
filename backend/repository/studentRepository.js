const mongoose = require("mongoose");
const student = require("../models/student")

const studentSchema = student.studentSchema;
const Student = mongoose.model("Student", studentSchema);

module.exports.Student = Student