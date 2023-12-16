const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const adminDB = {
    admin : require('../model/admin.json'),
    setAdmin : function (data){this.admin=data}
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
    const { username, password } = req.body;

    if (username ===process.env.ADMIN_USERNAME && password ===process.env.ADMIN_PASSWORD) {
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
        adminDB.setAdmin({refreshToken})
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'admin.json'),
            JSON.stringify(adminDB.admin))

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.json({ accessToken});
        

    }


    if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });
     let foundUser = usersDB.users.find(person => person.username === username) || employeesDB.employees.find(person => person.username=== username);
    if (!foundUser) return res.status(400).json({'message': "No user found"}); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const role = foundUser.role
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "role": role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
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
       return res.json({ accessToken });
    } else {
       return res.status(400).json({'message':'Wrong password'});
    }
}

const handleNewUser = async (req, res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    if(decoded.UserInfo.role !== "ADMIN") return res.status(401).json({"message":"You are not admin"})
    const { username, password,fullname,ID,phone, role } = req.body;
        if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });
        
    
        const checkRole = (role ==="EMPLOYEE")
    
        if(!checkRole) {
            const duplicate = usersDB.users.find(person => person.username === username);
            const duplicate2 = employeesDB.employees.find(person => person.username ===username)
            if (duplicate || duplicate2) return res.sendStatus(409); //Conflict 
            try {
            //encrypt the password
            const hashedPwd = await bcrypt.hash(password, 10);
            //store the new user
            const newUser = {
                "username": username,
                "password": hashedPwd,
                "fullname":fullname,
                "ID":ID,
                "phone":phone,
                "assist": null,
                "role":"USER",
                "refreshToken":''
            };
            usersDB.setUsers([...usersDB.users, newUser]);
            await fsPromises.writeFile(
                path.join(__dirname, '..', 'model', 'users.json'),
                JSON.stringify(usersDB.users)
            );
            console.log(usersDB.users);
            return res.status(201).json({ 'success': `New user ${username} created!` });
            } catch (err) {
            return res.status(500).json({ 'message': err.message });
            } 
        } else {
            const duplicate = usersDB.users.find(person => person.username === username);
            const duplicate2 = employeesDB.employees.find(person => person.username ===username)
            if (duplicate || duplicate2) return res.sendStatus(409); //Conflict 
            try {
            //encrypt the password
            const hashedPwd = await bcrypt.hash(password, 10);
            //store the new user
            const newEmployee = {
                "username": username,
                "password" : hashedPwd,
                "fullname":fullname,
                "ID":ID,
                "phone":phone,
                "patient":null,
                "role": role,
                "refreshToken" :''
            };
            employeesDB.setEmployees([...employeesDB.employees, newEmployee]);
            await fsPromises.writeFile(
                path.join(__dirname, '..', 'model', 'employees.json'),
                JSON.stringify(employeesDB.employees)
            );
            console.log(employeesDB.employees);
            return res.status(201).json({ 'success': `New employee ${username} created!` });
            } catch (err) {
            return res.status(500).json({ 'message': err.message });
            }
        }
        
}


const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(200); //No content
    const refreshToken = cookies.jwt;

    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        console.log(decoded.UserInfo.role)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    if(decoded.UserInfo.role ==="ADMIN") {
        adminDB.setAdmin({})
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'admin.json'),
            JSON.stringify(adminDB.admin))
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        res.sendStatus(204)
    } else if(decoded.UserInfo.role==="USER") {
        const foundUser = usersDB.users.find(person=>person.refreshToken===refreshToken)
        if(!foundUser) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            return res.sendStatus(204);
        }
        const otherUsers = usersDB.users.filter(person => person.refreshToken!== foundUser.refreshToken)
        const currentUser ={...foundUser,refreshToken:''}
        usersDB.setUsers([...otherUsers,currentUser])
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    } else {
        const foundEmp = employeesDB.employees.find(person=>person.refreshToken===refreshToken)
        if(!foundEmp) {
            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
            return res.sendStatus(204);
        }
        const otherEmp = employeesDB.employees.filter(person => person.refreshToken!== foundEmp.refreshToken)
        const currentEmp ={...foundEmp,refreshToken:''}
        employeesDB.setEmployees([...otherEmp,currentEmp])
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'employees.json'),
            JSON.stringify(employeesDB.employees)
        );
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.sendStatus(204);
    }
    
}

module.exports = { handleLogin, handleNewUser, handleLogout };