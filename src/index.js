import express from "express"

const app = express()

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("hello to my websocket project")
})

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`server is running on port http://localhost:${PORT}`)
})