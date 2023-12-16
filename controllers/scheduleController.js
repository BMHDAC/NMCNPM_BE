const schedulesDB = {
    schedules : require('../model/schedules.json'),
    setSchedules: function (data) {this.schedules = data}
}
const usersDB = {
    users : require('../model/users.json'),
    setUsers : function (data) {this.users=data}
}
const employeesDB = {
    employees : require('../model/employees.json'),
    setEmployees : function (data) {this.employees=data}
}
const path = require('path')
const jwt = require('jsonwebtoken')
const { secondsInHour } = require('date-fns')
const fsPromises = require('fs').promises


const createSchedule = async(req,res) => {
    let {date, user, employee} = req.body
    if(!date||!user) return res.status(400).json({'message':'No information provided'})
    const foundUser = usersDB.users.find(person=>person.username= user)

    const foundSchedule = schedulesDB.schedules.find(sch => sch.date=== date && sch.user===user)
    if(foundSchedule) return res.status(403).json({'message':'already created'})

    if(!foundUser) {
        return res.status(404).json({'message':"User does not exsist"})
    } 
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    

    if(decoded.UserInfo.role==="USER" ) {
        return res.status(404).json({'message':"You are user and have no authorization to createSchedule"})
    }
    if(decoded.UserInfo.role==="EMPLOYEE") employee = decoded.UserInfo.username
    const foundEmp = employeesDB.employees.find(emp=> emp.username===employee)
    if(!foundEmp) return res.status(404).json({'message':"Not found"})

    foundUser.assist= foundEmp.username
    foundEmp.patient = foundUser.username

    const data = { 
        "date":date,
        "employee":employee,
        "user":user,
        "pending":false
    }
    schedulesDB.setSchedules([...schedulesDB.schedules,data])    
    await fsPromises.writeFile(
        path.join(__dirname,'..','model','schedules.json'),
        JSON.stringify(schedulesDB.schedules)
    )

    const filteredUsers = usersDB.users.filter(usr=> usr.username !== foundUser.username)
    const filteredEmp = employeesDB.employees.filter(emp=> emp.username !== foundEmp.username)
    usersDB.setUsers([...filteredUsers,foundUser])
    employeesDB.setEmployees([...filteredEmp,foundEmp])
    await fsPromises.writeFile(
        path.join(__dirname,'..','model','users.json'),
        JSON.stringify(usersDB.users)
    )

    await fsPromises.writeFile(
        path.join(__dirname,'..','model','employees.json'),
        JSON.stringify(employeesDB.employees)
    )

    res.status(200).json({'message':`Schedule for user ${foundUser.username} and ${foundEmp.username} has been created`})

}
 
const getOwnSchedule = async (req,res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    if(!decoded.UserInfo.role) return res.status(401).json({"message":"You are not authorized"})
    if(!decoded.UserInfo.username) return res.status(401).json({"message":"No account record"})

    const username = decoded.UserInfo.username
    const role =decoded.UserInfo.role
    let foundUsers
    let foundSchedule

    if(role === "EMPLOYEE") {
        foundUsers = employeesDB.employees.find(person =>person.username = username)
        foundSchedule = schedulesDB.schedules.find(sch=> sch.employee = foundUsers.username)
    } else {
        foundUsers = usersDB.users.find(person => person.username = username)
        foundSchedule = schedulesDB.schedules.find(sch=> sch.user = foundUsers.username)
    }

    if(!foundUsers||!foundSchedule) {
        return res.status(404).json({'message':"No schedule or user found"})
    }

    return res.status(200).json({foundSchedule})

}

const updateSchedule = async(req,res) => {
    let {date,user,employee,pending} = req.body
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    if(!decoded.UserInfo.role) return res.status(401).json({"message":"You are not authorized"})
    if(!decoded.UserInfo.username) return res.status(401).json({"message":"No account record"})

    const username = decoded.UserInfo.username
    const role = decoded.UserInfo.role
    if(role==="USER"){
        user= username
        pending = true
        if(!employee) return res.status(404).json({'message':'Not found'})
    } else {
        employee = username
        pending= false
        if(!username) return res.status(404).json({'message':'Not found'})
    }

    const foundSchedule = schedulesDB.schedules.find(sch => sch.user===user && sch.employee===employee)
    if(!foundSchedule) return res.status(404).json({'message':'Schedule not found'})

    if(date) foundSchedule.date =date
    foundSchedule.pending = pending

    const filteredArray = schedulesDB.schedules.filter(sch => sch.user!==user && sch.employee!==employee)
    const newArray = [...filteredArray,foundSchedule]
    schedulesDB.setSchedules(newArray)

    await fsPromises.writeFile(
        path.join(__dirname,'..','model','schedules.json'),
        JSON.stringify(schedulesDB.schedules)
    )
    return res.status(200).json({"message":`Schedule for user ${user} updated`})

}

const deleteSchedule = async (req,res) => {
    let {employee,user} = req.body
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    if(!decoded.UserInfo.role) return res.status(401).json({"message":"You are not authorized"})
    if(!decoded.UserInfo.username) return res.status(401).json({"message":"No account record"})
    
    const role = decoded.UserInfo.role
    if(role==="USER") return res.status(401).json({"message":"You dont have access"})

    if(role!== "ADMIN") {
        employee = decoded.UserInfo.username
        const foundAuth = employeesDB.employees.find(emp => emp.username = decoded.UserInfo.username)
        if(!foundAuth) return res.status(404).json({'message':'Not found'})
    } 
        

    const foundSchedule = schedulesDB.schedules.find(sch=>sch.employee===employee && sch.user===user)
    if(!foundSchedule) return res.status(404).json({'message':'Schedule not found!'})
    const filteredArray = schedulesDB.schedules.filter(sch => sch.employee !== foundSchedule.employee)
    schedulesDB.setSchedules([...filteredArray])
    await fsPromises.writeFile(
        path.join(__dirname,'..','model','schedules.json'),
        JSON.stringify(schedulesDB.schedules)
    )
    return res.status(200).json({'message':`Schedule for ${user} and ${employee} deleted`})
}

const getPendingChangeSchedule = async(req,res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    let decoded
    try {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        console.log(error)
        return res.status(404).json({'message':"Corupted cookies, try logging in again"})
    }
    const role = decoded.UserInfo.role
    if(role==="USER") return res.status(401).json({"message":"You dont have access"})
    if(role!== "ADMIN") {
        const foundAuth = employeesDB.employees.find(emp => emp.username = decoded.UserInfo.username)
        if(!foundAuth) return res.status(404).json({'message':'Not found'})
        const filteredArray = schedulesDB.schedules.filter(sch => sch.pending === true && sch.employee === foundAuth.username)
        return res.json({filteredArray})
    }
    const filteredArray = schedulesDB.schedules.filter(sch=> sch.pending === true)
    return res.json({filteredArray})
    
    
}

module.exports = {createSchedule,getOwnSchedule, updateSchedule, deleteSchedule,getPendingChangeSchedule}