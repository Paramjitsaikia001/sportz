import express from "express"
import MatchRouter from "./routes/matches.routes.js"
const app = express()

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("hello to my websocket project")
})

app.use("/matches",MatchRouter)

const PORT=8000;

app.listen(PORT,()=>{
    console.log(`server is running on port http://localhost:${PORT}`)
})