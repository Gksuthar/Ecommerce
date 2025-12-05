import express from 'express'
import { addToMyListController,removeToMyListController,getToMyListController } from '../Controllers/myList.controller.js'
const MyListRouter = express.Router()
import auth from '../middleware/auth.js'
MyListRouter.post('/addToMyList',auth,addToMyListController)
MyListRouter.delete('/removeToMyList/:id',auth,removeToMyListController)
MyListRouter.get('/getMyList',auth,getToMyListController)

export default MyListRouter