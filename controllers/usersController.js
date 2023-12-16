const usersDB = { 
    users : require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const jwt = require('jsonwebtoken')
require('dotenv').config
const bcrypt = require('bcrypt')
const fsPromises = require('fs').promises
const path = require('path')

const asyncHandler = require('express-async-handler')

const updateUsers = asyncHandler(async(req,res) => {
    const {username, password, fullname,phone} = req.body
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
    if(decoded.UserInfo.role ==="USER" ) return res.status(400).json({'message':"no access"})
    const foundUser = usersDB.users.find(person => person.username = username)

    if(!foundUser) return res.status(401).json({"message":"No user found"})
    
    if(password) {
        const hashedPwd = await bcrypt.hash(password,10)
        foundUser.password=hashedPwd
    }
    

    if(fullname) foundUser.fullname=fullname
    if(phone) foundUser.phone = phone

    const filteredArray = usersDB.users.filter(person => person.username !== username)
    const newArray = [...filteredArray,foundUser]
    usersDB.setUsers(newArray)
    await fsPromises.writeFile(
        path.join(__dirname,'..','model', 'users.json'),
        JSON.stringify(usersDB.users)
    )
    res.json(usersDB.users)
} )

const deleteUsers = asyncHandler(async(req, res) => {
    const {username} = req.body
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

    if(decoded.UserInfo.role === "USER") return res.status(401).json({'message':"You are not admin"})
    if(decoded.UserInfo.role === "EMPLOYEE") return res.status(401).json({'message':"You are not admin"})

    const foundUser = usersDB.users.find(person=> person.username === username)

    if(!foundUser) return res.status(404).json({'message':"User not found"})
    const filteredArray = usersDB.users.filter(person => person.username!==username)
    usersDB.setUsers([...filteredArray])
    await fsPromises.writeFile(
        path.join(__dirname,'..','model','users.json'),
        JSON.stringify(usersDB.users)
    )
    res.status(201).json({"message":`User ${username} deleted`})
})

const getAllUser = (req,res) => {
    return res.json(usersDB.users)

}

module.exports ={deleteUsers,updateUsers,getAllUser}