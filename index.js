import express from 'express'
import dotenv from 'dotenv'
import { connect } from './db/connect.js'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import {WebSocketServer} from 'ws'



dotenv.config()
connect()

// const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
    credentials:true,
    origin: process.env.CLIENT_URL,
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
//Cookie Parser
app.use(cookieParser())

//ROUTES
app.use('', userRouter)

app.get("/test", (req, res) => {
    res.json("Test ok")
})


const server = app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

//use WebsocketServer from websocket library
const wss = new WebSocketServer({server})

wss.on('connection', (connection, req) => {
    // console.log('Connected')
    // connection.send('Hello')
    // console.log(req.headers)
    const cookies = req.headers.cookie
    if(cookies){
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='))
        // console.log(tokenCookieString)
        if(tokenCookieString){
            const token = tokenCookieString.split('=')[1]
            console.log(token)
        }
    }
})

