const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
var bodyParser = require('body-parser');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use(bodyParser());
app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  
  res.render('room2', { roomId: req.params.room })

  
})

app.post('/joinroom', function(req, res){
  res.redirect(`/${req.body.id}`)
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
// app.get('/joinmeet', function(req, res){
//   res.render('room2', { roomId: req.params.room })
// })
 app.get('/craeteroom/new', function(req, res){
  res.redirect(`/${uuidV4()}`)
 })
var usernames = []
io.on('connection', socket => {

  socket.on('join-room', (roomId, userId) => {
    socket.on('name', username =>{
      usernames.push(username);
      socket.emit('users', usernames);
    })
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage',message) 
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030)
