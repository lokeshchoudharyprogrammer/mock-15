
const mongoose = require('mongoose');


const Subtask = mongoose.model('Subtask', {
    title: String,
    isCompleted: Boolean,
});
exports.module = { Subtask }