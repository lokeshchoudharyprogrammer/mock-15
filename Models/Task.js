const mongoose = require('mongoose');


const Task = mongoose.model('Task', {
    title: String,
    description: String,
    status: { type: String, enum: ['Todo', 'Doing', 'Done'], default: 'Todo' },
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtask' }],
});



exports.module = { Task }