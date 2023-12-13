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

    }


    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });
     let foundUser = usersDB.users.find(person => person.username === user);
         foundUser = employeesDB.employees.find(person => person.username==='user')
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "roles": roles
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
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = { ...foundUser, refreshToken };
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };