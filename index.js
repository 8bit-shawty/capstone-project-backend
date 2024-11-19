import express from 'express'
import dotenv from 'dotenv'
import { connect } from './db/connect.js'
import cors from 'cors'
import userRouter from './routes/userRoutes.js'


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

//ROUTES
app.use('', userRouter)

app.get("/test", (req, res) => {
    res.json("Test ok")
})


app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

