const usersDB = { 
    users : require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const jwt = require('jsonwebtoken')
require('dotenv').config
const bcrypt = require('bcrypt')

const asyncHandler = require('express-async-handler')

const updateUsers = asyncHandler(async(req,res) => {
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
    const foundUser = usersDB.users.find(person => person.username = decoded.userInfo.username)

    if(!foundUser) return res.status(401).json({"message":"No user found"})
    
    if(req.password) {
        const hashedPwd = await bcrypt.hash(req.password,10)
        foundUser.password=hashedPwd
    }
    

    if(req.fullname) foundUser.fullname=fullname
    if(req.phone) foundUser.phone = phone

    const filteredArray = usersDB.users.filter(person => person.username !== decoded.userInfo.username)
    const newArray = [...filteredArray,foundUser]
    usersDB.setUsers(newArray)
    res.json(usersDB.users)
} )

const deleteUsers = (req, res) => {
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

    if(decoded.UserInfo.role !== "ADMIN") return res.status(401).json({'message':"You are not admin"})

    const foundUser = usersDB.users.find(person=> person.username === req.body.username)

    if(!foundUser) return res.status(404).json({'message':"User not found"})
    const filteredArray = usersDB.users.filter(person => person.username!==req.body.username)
    usersDB.setUsers([...filteredArray])
    res.status(201).json({"message":"succesfully delete user"})
}

const getAllUser = (req,res) => {
    return res.json(usersDB.users)

}

module.exports ={deleteUsers,updateUsers,getAllUser}