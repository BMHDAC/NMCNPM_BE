const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const EmployeeDB = {
    employees:require('../model/employees.json'),
    setEmployees : function(data) {this.employees=data}
}
const fsPromises = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
const { user, pwd, role } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
    

    const checkRole = (role ==="EMPLOYEE")

    if(!checkRole) {
        const duplicate = usersDB.users.find(person => person.username === user);
    if (duplicate) return res.sendStatus(409); //Conflict 
    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        const newUser = {
            "username": user,
            "password": hashedPwd,
            "role":"USER"
        };
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        console.log(usersDB.users);
        res.status(201).json({ 'success': `New user ${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
    } else {
        const duplicate = EmployeeDB.employees.find(person => person.username === user);
        if (duplicate) return res.sendStatus(409); //Conflict 
        try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        const newEmployee = {
            "username": user,
            "password" : hashedPwd,
            "role": role
        };
        EmployeeDB.setEmployees([...EmployeeDB.employees, newEmployee]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'employees.json'),
            JSON.stringify(EmployeeDB.employees)
        );
        console.log(EmployeeDB.employees);
        res.status(201).json({ 'success': `New employee ${user} created!` });
        } catch (err) {
            res.status(500).json({ 'message': err.message });
        }
    }
    
}

module.exports = { handleNewUser };