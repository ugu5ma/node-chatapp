const path = require('path')
const http= require ('http')
const express = require('express')
const socketio = require ('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
const Filter = require('bad-words')
const { generatedMessage, generatedLocMessage} = require ('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

app.use(express.static(publicDirectoryPath))

//let count = 0

io.on('connection', (socket) => {

    console.log('New WebSocket Connection')

    
    socket.on('join', ( options, callback ) => { 
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
           return callback(error) 
        }


        socket.join(user.room)


        socket.emit('message', generatedMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatedMessage('Admin', `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('Bad word detected')
            
        }

        io.to(user.room).emit('message', generatedMessage(user.username, message))
        callback('delivered')
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locMessage', generatedLocMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    }) 


    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generatedMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
       
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}! `)
})

