import express from 'express'
import dotenv from 'dotenv'
import { connect } from './db/connect.js'


dotenv.config()
connect()

// const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000

app.get("/test", (req, res) => {
    res.json("Test ok")
})

app.post("/register" , (req, res) => {

})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

