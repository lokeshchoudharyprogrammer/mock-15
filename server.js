const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
    res.send("<h1>Welcome to my server </h1>")
})


// Model's of the Site 😊

const User = mongoose.model('User', {
    email: String,
    password: String,
});

const Board = mongoose.model('Board', {
    name: String,
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const Task = mongoose.model('Task', {
    title: String,
    description: String,
    status: { type: String, enum: ['Todo', 'Doing', 'Done'], default: 'Todo' },
    subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subtask' }],
});

const Subtask = mongoose.model('Subtask', {
    title: String,
    isCompleted: Boolean,
});


// all Resquest Of the site 😊

app.post('/signup', async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ ms: 'already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = new User({
            email,
            password: hashedPassword,
        });

        await user.save();

        res.json({ msg: 'success' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed' });
    }
});

app.post('/login', async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'shhhh');

        res.json({ msg: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to log in' });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, 'shhhh');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};

app.get('/boards', async (req, res) => {
    console.log(req.body)
    try {
        const boards = await Board.find({}).populate({
            path: 'tasks',
            populate: {
                path: 'subtasks',
            },
        });

        res.json(boards);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch boards' });
    }
});

app.post('/boards', async (req, res) => {
    try {
        const { name } = req.body;

        const board = new Board({ name });
        await board.save();

        res.json({ msg: 'Board created successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed to create board' });
    }
});

app.get('/boards/:boardId', async (req, res) => {
    try {
        const { boardId } = req.params;

        const board = await Board.findById(boardId).populate({
            path: 'tasks',
            populate: {
                path: 'subtasks',
            },
        });

        if (!board) {
            return res.status(404).json({ msg: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to fetch board' });
    }
});

app.post('/boards/:boardId/tasks', async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title, description, subtasks, status } = req.body;

        const task = new Task({ title, description, status });

        const createdSubtasks = await Subtask.create(subtasks);

        task.subtasks = createdSubtasks;
        await task.save();

        const board = await Board.findById(boardId);
        board.tasks.push(task);
        await board.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ msg: 'Failed to create task' });
    }
});




app.put('/boards/:boardId/tasks/:taskId', async (req, res) => {
    try {
        const { boardId, taskId } = req.params;
        const updateFields = req.body;

        const task = await Task.findByIdAndUpdate(taskId, updateFields, {
            new: true,
        });

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        res.json({ msg: 'successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed' });
    }
});

app.delete('/boards/:boardId/tasks/:taskId', async (req, res) => {
    try {
        const { boardId, taskId } = req.params;

        await Task.findByIdAndDelete(taskId);

        await Board.findByIdAndUpdate(boardId, { $pull: { tasks: taskId } });

        res.json({ msg: 'deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Failed' });
    }
});

app.put('/boards/:boardId/tasks/:taskId/subtasks/:subtaskId',

    async (req, res) => {
        try {
            const { subtaskId } = req.params;
            const { isCompleted } = req.body;

            const subtask = await Subtask.findByIdAndUpdate(
                subtaskId,
                { isCompleted },
                { new: true }
            );

            if (!subtask) {
                return res.status(404).json({ msg: 'Subtask not found' });
            }

            res.json({ msg: 'successfully' });
        } catch (error) {
            res.status(500).json({ msg: 'Failed' });
        }
    }
);

app.delete(
    '/boards/:boardId/tasks/:taskId/subtasks/:subtaskId',

    async (req, res) => {
        try {
            const { subtaskId } = req.params;

            await Subtask.findByIdAndDelete(subtaskId);

            res.json({ msg: ' deleted successfully' });
        } catch (error) {
            res.status(500).json({ msg: 'fail' });
        }
    }
);

app.listen(3400, () => {
    try {

        mongoose.connect('mongodb+srv://lokesh:lokeshcz@cluster0.dsoakmx.mongodb.net/kanban_board?retryWrites=true&w=majority')
        console.log("Done")
    } catch (error) {

    }
    console.log('Server is running on port 3400');
});
