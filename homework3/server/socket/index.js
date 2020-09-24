const users = {}; // все пользователи чата
const messagesHistory = {};

module.exports = (socket) => {
    const socketId = socket.id

    socket.on('users:connect', function (data) {
        const user = {
            ...data,
            socketId,
            activeRoom: null
        }
        users[socketId] = user
        socket.emit('users:list', Object.values(users))
        socket.broadcast.emit('users:add', Object.values(user))
    })

    socket.on('message:add', function (data) {
        socket.emit('message:add', data)
        socket.broadcast.to(data.roomId).emit('message:add', data)
        addToHistory(data)
        console.log(messagesHistory)
    })

    socket.on('message:history', function (data) {
        socket.emit('message:history', getHistory(data))
        console.log(messagesHistory)
    })

    socket.on('disconnect', function (data) {
        delete users[socketId]
        socket.broadcast.emit('users:leave', socketId)
    })
}

const addToHistory = (data) => {
    const senderId = data.senderId
    const recipientId = data.recipientId
    if (!messagesHistory[senderId]) {
        messagesHistory[senderId] = {}
    }
    if (!messagesHistory[senderId][recipientId]) {
        messagesHistory[senderId][recipientId] = []
    }
    messagesHistory[senderId][recipientId].push({
        text: data.text,
        roomId: data.roomId
    })
}
const getHistory = (data) => {
    const senderId = data.userId
    const recipientId = data.recipientId
    if (messagesHistory[senderId] && messagesHistory[senderId][recipientId]) {
        return messagesHistory[senderId][recipientId].map(message => {
            return {
                senderId: senderId,
                recipientId: recipientId,
                text: message.text,
                roomId: message.roomId
            }
        })
    } else {
        return []
    }
}