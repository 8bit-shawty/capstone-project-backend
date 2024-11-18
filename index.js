import express from 'express'
import dotenv from 'dotenv'


dotenv.config()

// const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000

app.get("/test", (req, res) => {
    res.json("Test ok")
})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

