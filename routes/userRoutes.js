import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

//use jsonwebtoken for authorization between json objects
dotenv.config()

const router = express.Router()

const jwtSecretKey = process.env.JWT_SECRET_KEY


/**
 * POST /api/chats
 * @description Create a new user
 */
router.post('/register' , async(req, res, next) => {
    const {username, password} = req.body
    try {
        //asign the token first
        const createdUser = await User.create({username, password})
        jwt.sign({userId:createdUser._id}, jwtSecretKey, {}, 
            (err, token) => {
                if(err) throw err
                res.cookie('token', token).status(201).json('User Created')
            }
        )
    } catch (error) {
        if(error) throw error
        res.status(500).json('error')
    }
})

export default router