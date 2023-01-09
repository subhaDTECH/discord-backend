import express from "express";
import mongoose from "mongoose";
import Conversations from "./dbModel.js";
import cors from "cors";
import Pusher from "pusher"
const app=express();
const port=process.env.PORT || 5000;

const pusher = new Pusher({
    appId: "1218609",
    key: "90188229a21cc6e13176",
    secret: "288af875fb506f288121",
    cluster: "ap2",
    useTLS: true
  });
  //mideelware 
//middleware 
app.use(express.json())
app.use(cors())




// 
//connection to database
const dbURL="mongodb+srv://admin:JDaMmONxeeYJ642Z@cluster0.zbwog.mongodb.net/discordDatabase?retryWrites=true&w=majority"
mongoose.connect(dbURL,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    
}).then((result)=>{
    console.log("dataBase connect")
}).catch((e)=>console.log(e))

mongoose.connection.once('open',()=>{
  const changeStream= mongoose.connection.collection('conversations').watch()
  changeStream.on('change',(change)=>{
      if(change.operationType==="insert"){
        pusher.trigger("channel", "newChannel", {
            'change':change
          });
      }else if(change.operationType==='update'){
        pusher.trigger("message", "newMessage", {
            'change':change
          });
      }else{
          throw new Error("pusher trigger error")
      }
  })

})

// routing 
app.get('/',(req,res)=>{
    res.send("HIIII")
})
app.post('/new/channel',(req,res)=>{
    const ChannelData=req.body;
    Conversations.create(ChannelData,(err,data)=>{
        if(err){
            res.status(400).send(err)
        }else{
            res.status(201).send(data)
        }
    })

})

app.get('/get/channelList',(req,res)=>{
    Conversations.find((error,data)=>{
        if(error){
            res.status(500).send(error)
        }else{
            let channels=[];
            data.map((channel)=>{
                const channelInfo={
                    id:channel._id,
                    name:channel.channelName
                }
                channels.push(channelInfo);
             })
            
             res.status(200).send(channels)

        }
    })
})


app.post('/new/message',(req,res)=>{
    console.log('hlofff')
   Conversations.update(
       {_id:req.query.id},
       {$push:{conversation:req.body}},
       (error,data)=>{
           if(error){
               res.status(400).send(error)
           }else{
               res.status(201).send(data)
           }
       }
   )
})

app.get('/get/messages',(req,res)=>{
    Conversations.find({_id:req.query.id},(error,data)=>{
        if(error){
            res.status(500).send(error)
        }else{
            // data.sort((b,a)=>{
            //     return a.timestamp-b.timestamp;
            // })
            res.status(201).send(data)
            console.log(data[0].conversation)
        }
    })

})

app.listen(port,()=>{
    console.log("server run on port 5000")
})
// dgP9RrszcCffgbbp