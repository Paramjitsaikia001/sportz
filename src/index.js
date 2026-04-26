import express from "express"
import MatchRouter from "./routes/matches.routes.js"
import http from 'http'
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { commentaryRouter } from "./routes/commentary.route.js";



const PORT=Number(process.env.PORT || 8000);
const HOST=process.env.HOST || '0.0.0.0';

const app = express()
const server = http.createServer(app)

app.use(express.json())

app.get("/",(req,res)=>{
    res.send("hello to my websocket project")
})
// IMPORTANT: In your main server file (e.g., server.js), add:

app.set("trust proxy", true);
app.use(securityMiddleware())

app.use("/matches",MatchRouter)
app.use("/matches/:id/commentary",commentaryRouter)


const {broadcastMatchCreated} = attachWebSocketServer(server)

app.locals.broadcastMatchCreated=broadcastMatchCreated





server.listen(PORT,HOST,()=>{
    const baseUrl = HOST==="0.0.0.0"?`http://localhost:${PORT}` :`http://${HOST}:${PORT}`

    console.log(`Server is running on ${baseUrl}`);

    console.log(`WebSocket Server is running on ${baseUrl.replace("http","ws")}/ws`);
    
})