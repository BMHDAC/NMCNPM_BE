const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}

const employeesDB = {
    employees : require('../model/employees.json'),
    setEmployees : function (data) {this.employees=data}
}
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');


const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;

    if (user ===process.env.ADMIN_USERNAME && pwd ===process.env.ADMIN_PASSWORD) {
        const accessToken = jwt.sign (
            {
                "UserInfo" : {
                    "username":process.env.ADMIN_USERNAME,
                    "role":"ADMIN"
                }
            },  
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'1d'}
        );
        const refreshToken = jwt.sign(
            { "username": process.env.ADMIN_USERNAME },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken});
        return 

    }


    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
     let foundUser = usersDB.users.find(person => person.username === user) || employeesDB.employees.find(person => person.username=== user);
    if (!foundUser) return res.status(400).json({'message': "No user found"}); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const role = Object.values(foundUser.role);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "role": role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        // Saving refreshToken with current user
        if(role ==="USER"){
            const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
            const currentUser = { ...foundUser, refreshToken };
            usersDB.setUsers([...otherUsers, currentUser]);
            await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users))
        } else {
            const otherEmployee = employeesDB.employees.filter(person => person.username !== foundUser.username);
            const currentEmployee = { ...foundUser, refreshToken };
            employeesDB.setEmployees([...otherEmployee, currentEmployee]);
            await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'employees.json'),
            JSON.stringify(employeesDB.employees))
        } 
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
        res.status(400).json({'message':'Wrong password'});
    }
}

const handleNewUser = async (req, res) => {
    const { user, pwd, role } = req.body;
        if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
        
    
        const checkRole = (role ==="EMPLOYEE")
    
        if(!checkRole) {
            const duplicate = usersDB.users.find(person => person.username === user);
            const duplicate2 = employeesDB.employees.find(person => person.username ===user)
            if (duplicate || duplicate2) return res.sendStatus(409); //Conflict 
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
            const duplicate = usersDB.users.find(person => person.username === user);
            const duplicate2 = employeesDB.employees.find(person => person.username ===user)
            if (duplicate || duplicate2) return res.sendStatus(409); //Conflict 
            try {
            //encrypt the password
            const hashedPwd = await bcrypt.hash(pwd, 10);
            //store the new user
            const newEmployee = {
                "username": user,
                "password" : hashedPwd,
                "role": role
            };
            employeesDB.setEmployees([...employeesDB.employees, newEmployee]);
            await fsPromises.writeFile(
                path.join(__dirname, '..', 'model', 'employees.json'),
                JSON.stringify(employeesDB.employees)
            );
            console.log(employeesDB.employees);
            res.status(201).json({ 'success': `New employee ${user} created!` });
            } catch (err) {
                res.status(500).json({ 'message': err.message });
            }
        }
        
}


const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = { ...foundUser, refreshToken: '' };
    usersDB.setUsers([...otherUsers, currentUser]);
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    );

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

module.exports = { handleLogin, handleNewUser, handleLogout };