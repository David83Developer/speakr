import dotenv from 'dotenv';
import { Server } from 'socket.io'
import http from 'http'

import { getSocket, eventEmitter } from './helpers/socket'
import { getClientCallHistory, getPanelByQueue, getPanelHistory } from './models/CallsHistory';

dotenv.config()

const port: number | undefined = Number(process.env.PORT)
const client: string | undefined = process.env.CLIENT_URL

const server = http.createServer()
const io = new Server(server, {
    cors: {
        origin: client,
        methods: ["GET", "POST"]
    }
})

getSocket()

io.on('connection', async (socket: any) => {
    
    socket.on('client', async(client: any)=> {
        const clientData = JSON.parse(client)
        console.info(`Cliente conectado: ${clientData.name} | Id: ${clientData.id}`)
        const response = await getClientCallHistory(clientData.id, clientData.name)
        const panel = await getPanelHistory(clientData.id)
        if (response) {

        const emptyArray: any = []

        const data = {
            callsHistory: response,
            panelContent: panel
        }

        socket.emit('getCalls', JSON.stringify(data));
    }

    })

    socket.on('disconnect', () => {
        console.info("Cliente desconectado")
    })

})


eventEmitter.on('newCall', async(event) => {
    const data = JSON.parse(event)
    const queue = data.content.queue

    const emptyArray: any = []
    const newPanel = await getPanelByQueue(queue)

    const newEvent = {
        contType: data.contType,
        event: data.event,
        content: data.content,
        panelContent: newPanel 
    }

    io.emit(queue, JSON.stringify(newEvent))
})

eventEmitter.on('getCalls', (event) => {

    io.emit('getCalls', event)
})


server.listen(port)




