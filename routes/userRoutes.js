import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

//use jsonwebtoken for authorization between json objects
dotenv.config()

const router = express.Router()

const jwtSecretKey = process.env.JWT_SECRET_KEY

router.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if(token){
        jwt.verify(token, jwtSecretKey, {}, (error, userData) => {
            if(error) throw error;
            res.json(userData)
        })
    } else {
        res.status(401).json("No token Found.")
    }
})

/**
 * POST /api/chats
 * @description Create a new user
 */
router.post('/register' , async(req, res, next) => {
    const {username, password} = req.body
    try {
        //asign the token first
        const createdUser = await User.create({username, password})
        jwt.sign({userId:createdUser._id, username}, jwtSecretKey, {}, 
            (err, token) => {
                if(err) throw err
                res.cookie('token', token, {sameSite: 'none', secure:true}).status(201).json({
                    id: createdUser._id,
                })
            }
        )
    } catch (error) {
        if(error) throw error
        res.status(500).json('error')
    }
})

export default router