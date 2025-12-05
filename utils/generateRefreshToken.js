import jwt from 'jsonwebtoken'
import UserModel from '../models/user.js'

const generatedAccessToken = async(userId)=>{
    const refreshToken = await jwt.sign({id:userId},process.env.REFRESH_TOKEN_SECRET,{expiresIn : '7d'})
    await UserModel.updateOne({_id : userId},{refresh_token:refreshToken})
    return refreshToken

}
export default generatedAccessToken