import express from 'express'
import { setUserAddress } from '../Controllers/address.controller.js'
import Auth from '../middleware/auth.js'
const addressRouter = express.Router()
// import { setUserAddress } from "../Controllers/address.controller.js";  // Incorrect (wrong folder name or extension)

addressRouter.post('/addAddress',Auth,setUserAddress)

export default addressRouter