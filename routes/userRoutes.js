import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
//import bcrypt to hash passwords
import bcrypt from 'bcryptjs'

//use jsonwebtoken for authorization between json objects
dotenv.config()

const router = express.Router()

const jwtSecretKey = process.env.JWT_SECRET_KEY

/**
 * GET /profile
 * @description Retrieve authenticated user's profile data by verifying the JWT token in cookies.
 * @returns {Object} User data (e.g., userId and username) if the token is valid.
 * @returns {String} "No token Found" if the token is missing.
 * @throws {Error} If the token is invalid or verification fails.
 */
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

router.post('/login', async(req, res) => {
    const{username, password} = req.body;
    const foundUser = await User.findOne({username})
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