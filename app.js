let express = require("express");
let app = express();
let server = require("http").createServer(app);
let ent = require("ent");
let io = require("socket.io").listen(server);
let uniqid = require("uniqid");

let todolist = [];

app
  .use(express.static(__dirname + "/assets"))
  .get("/todo", function(req, res) {
    res.render("todo.ejs");
  })
  /* On redirige vers la todolist si la page demandée n'est pas trouvée */
  .use(function(req, res, next) {
    res.redirect("/todo");
  });

io.sockets.on("connection", socket => {
  socket.emit("update_lists", todolist);

  socket.on("envoi_item", msg => {
    let newItem = { id: uniqid.process(), msg: ent.encode(msg) };
    todolist.push(newItem);
    socket.emit("receive_item", {
      msg: ent.encode(msg),
      index: newItem.id
    });
    socket.broadcast.emit("receive_item", {
      msg: ent.encode(msg),
      index: newItem.id
    });
  });

  socket.on("delete_item", index => {
    todolist = todolist.filter(item => {
      return item.id != index;
    });
    socket.broadcast.emit("update_lists", todolist);
  });

  socket.on("update_item", ({ text, index }) => {
    let itemToUpdate = todolist.find(item => {
      return item.id == index;
    });
    if (itemToUpdate) itemToUpdate.msg = ent.encode(text);

    socket.broadcast.emit("update_lists", todolist);
    socket.emit("update_lists", todolist);
  });
});

server.listen(8080);
