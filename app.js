// Task1: initiate app and run server at 3000

const express = require('express');
const mongoose = require('mongoose');
const path=require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Keep the original static-file line.
app.use(express.static(path.join(__dirname+'/dist/FrontEnd')));
// Serve the provided frontend directory (the folder name is Frontend).
app.use(express.static(path.join(__dirname, 'dist', 'Frontend')));

// Task2: create mongoDB connection
// Set MONGODB_URI in your environment to your MongoDB Atlas connection string.
const mongoURI = process.env.MONGODB_URI || 'PASTE_YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE';

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err.message));

// Employee collection/schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, required: true }
}, { collection: 'employeelist', versionKey: false });

const Employee = mongoose.model('Employee', employeeSchema);

//Task 2 : write api with error handling and appropriate api mentioned in the TODO below


//TODO: get data from db  using api '/api/employeelist'
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve employees', error: err.message });
    }
});


//TODO: get single data from db  using api '/api/employeelist/:id'
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Failed to retrieve employee', error: err.message });
    }
});


//TODO: send data from db using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;
        const employee = await Employee.create({ name, location, position, salary });
        res.status(201).json(employee);
    } catch (err) {
        const status = err.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ message: 'Failed to add employee', error: err.message });
    }
});


//TODO: delete a employee data from db by using api '/api/employeelist/:id'
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ message: 'Employee deleted successfully', employee });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete employee', error: err.message });
    }
});


//TODO: Update  a employee data from db by using api '/api/employeelist'
//Request body format:{name:'',location:'',position:'',salary:''}
// Accept the employee id as _id or id in the request body.
app.put('/api/employeelist', async (req, res) => {
    try {
        const id = req.body._id || req.body.id;
        if (!id || !mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: 'A valid employee _id is required in the request body' });
        }

        const updates = {};
        for (const field of ['name', 'location', 'position', 'salary']) {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        }

        const employee = await Employee.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json(employee);
    } catch (err) {
        const status = err.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ message: 'Failed to update employee', error: err.message });
    }
});

//! dont delete this code. it connects the front end file.
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
