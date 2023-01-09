import mongoose from "mongoose";
const ModelSchema=mongoose.Schema({
    channelName:String,
    conversation:[
        {
            message:String,
            timestamp:String,
            user:{
                uid:String,
                email:String,
                photo:String,
                displayName:String
            }
        }
    ]
})
export default mongoose.model('conversations',ModelSchema);