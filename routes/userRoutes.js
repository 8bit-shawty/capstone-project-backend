import express from 'express'
import User from '../models/User.js'
import Message from '../models/Message.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
//import bcrypt to hash passwords
import bcrypt from 'bcryptjs'

import {WebSocketServer} from 'ws'

//use jsonwebtoken for authorization between json objects
dotenv.config()

const router = express.Router()

const jwtSecretKey = process.env.JWT_SECRET_KEY
//Generate a random salt for the hashed password
const bcryptSalt = bcrypt.genSaltSync(10)

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
}); 

router.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Verify token and extract user data
        const userData = await new Promise((resolve, reject) => {
            jwt.verify(token, jwtSecretKey, {}, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            });
        });

        const ourUserId = userData.userId;
        // console.log({userId, ourUserId})

        // Query messages
        const messages = await Message.find({
            sender: { $in: [userId, ourUserId] },
            recipient: { $in: [userId, ourUserId] },
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.get('/users', async(req, res) => {
    const users = await User.find({}, {'_id': true, username: true})
    res.json(users)
})

router.post('/login', async(req, res) => {
    const{username, password} = req.body;
    const foundUser = await User.findOne({username})
    if(foundUser){
        const passwordOk = bcrypt.compareSync(password, foundUser.password)
        if(passwordOk){
            jwt.sign({userId:foundUser._id, username}, jwtSecretKey, {}, (error, token) => {
                res.cookie('token', token, {sameSite: 'none', secure:true}).json({
                    id: foundUser._id,
                })
            })
        }
    }
})

/**
 * POST /api/chats
 * @description Create a new user
 */
router.post('/register' , async(req, res, next) => {
    const {username, password} = req.body
    try {
        //create the hashedPassoword
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
        //asign the token first
        const createdUser = await User.create({
            username: username, 
            password: hashedPassword
        })
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

//use WebsocketServer from websocket library
export default(server) => {
    const wss = new WebSocketServer({server})
    
    wss.on('connection', (connection, req) => {
        // console.log('Connected')
        // connection.send('Hello')
        // console.log(req.headers)

        //read username and id from the cookie 
        const cookies = req.headers.cookie
        if(cookies){
            const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='))
            // console.log(tokenCookieString)
            if(tokenCookieString){
                const token = tokenCookieString.split('=')[1]
                // console.log(token)
                if(token){
                    jwt.verify(token, jwtSecretKey, {}, (error, userData) => {
                        if (error) throw error;
                        // console.log(userData)
                        const{userId, username} = userData;
                        connection.userId = userId
                        connection.username = username
                    })  
                }
            }
        }

        connection.on('message', async(message) =>{
            const messageData = JSON.parse(message.toString())
            const {recipient, text} = messageData
            // console.log(messageData)

            if(recipient && text) {
                //Save our message
                const messageDocument = await Message.create({
                    sender:connection.userId,
                    recipient,
                    text,
                });
                [...wss.clients]
                    .filter(c => c.userId === recipient)
                    .forEach(c => c.send(JSON.stringify({
                        text, 
                        sender: connection.userId,
                        recipient,
                        _id: messageDocument._id,
                    })))
            }
        });
        //we want to see all of the clients that are online
        //we have to turn these client objects into an array
        //then we map through to see who is online
        // console.log([...wss.clients].map(connection => connection.username))
        //I also want to notify everyone about online users when someone connects
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({userId: c.userId, username:c.username}))
            }))
        })
    })
    return router
}



