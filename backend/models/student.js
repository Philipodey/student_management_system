const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type:String,
        require:true
    },
    email:{
        type: String,
        required: true,
    },
    course:{
        type: String,
        required: true
    },
    enrolmentDate:{
        type: Date,
        required: true,
    },
    status:{
        type: String,
        enum :['active', 'Inactive'],
        default: "active"
    },
},{
    timestamps: true,
})


module.exports.studentSchema = studentSchema;