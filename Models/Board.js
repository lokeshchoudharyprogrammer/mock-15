
const mongoose = require('mongoose');


 const Board = mongoose.model('Board', {
    name: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

exports.module = { Board }