const SHA256 = require('crypto-js/sha256');
const randomstring = require("randomstring");
const express = require("express");
const cookieParser = require('cookie-parser');
const redis = require("redis");
const sessions = require('express-session');
/*const RedisServer = require('redis-server');

// Simply pass the port that you want a Redis server to listen on.
const rserver = new RedisServer(6379);

rserver.open((err) => {
    if (err === null) {
        // You may now connect a client to the Redis
        // server bound to port 6379.
    }
});
*/
const RedisStore = require("connect-redis")(sessions);
const mongoose = require("mongoose");
const { ReadStream } = require("fs");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const user = 'guakia';
const password = 'Hlso1985';
const dbname = 'tv';
const uri = `mongodb+srv://${user}:${password}@cluster0.cqrlr.mongodb.net/${dbname}?retryWrites=true&w=majority`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Base de datos conectada'))
    .catch(e => console.log(e))
    //Schema
const Schema = mongoose.Schema;

const canalSchema = new Schema({
    index: Number,
    canal: { type: String, unique: true },
    propiedad: String,
    usuario: String,
    password: String
})
const Canal = mongoose.model('Canal', canalSchema);
module.exports = Canal;
const client = redis.createClient({

});


// ioredis
//const Redis = require("ioredis")
app.set('trust proxy', 1);
var session;
app.use(cookieParser());
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(sessions({
    cookie: {
        secure: true,
        maxAge: 60000
    },
    store: new RedisStore({ client: client }),
    secret: randomstring.generate(),
    saveUninitialized: true,
    cookie: {},
    resave: false
}));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.get('/', (req, res) => {
    session = req.session;
    if (session.canal) {
        res.render("home", { canal: session.canal });
    } else
        res.render("index");
});


app.get("/log", (req, res) => {
    res.render("login");
});
app.get("/politicas", (req, res) => {
    res.render("politicas");
});
app.get("/reg", (req, res) => {
    res.render("registro");
});

app.post("/registro", (req, res) => {
    const query = Canal.findOne({ canal: req.body.canal });
    query.then(function(doc) {
        // use doc
        if (doc !== null) {
            console.log('ya existe');
            res.set('Content-Type', 'text/html');
            res.send(`<meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            body {
                overflow: hidden;
            }
                p{
                    font-size:50px;
                    text-align:center;
                color:silver;}
                div {
                background-image: radial-gradient(silver, black);
                width: 100%;
                height: 100%;
                margin-top: -20px;
                margin-left: -20px;
                padding-bottom: 200%;
                padding-top: 10%;
                padding-left: 0;
                padding-right: 30%;
            }
            a {
                font-size: 40px;
                color: white;
                text-decoration: none;
            }
            
            a:hover {
                font-size: 50px;
                color: silver;
                text-decoration: none;
            }
            </style>
            <div><p>Ya existe un canal con este nombre intente otro nombre <a href="/reg">Tratar otro nombre</a></p></div>`);

        } else {
            console.log('no existe');
            const query2 = Canal.findOne({}).sort({ index: -1 });
            query2.then(function(doc) {
                var ind = doc.index;
                var pass = SHA256(req.body.pass).toString();
                var CanalNuevo = new Canal({ index: ind + 1, canal: req.body.canal, propiedad: req.body.propiedad, usuario: req.body.user, password: pass });
                CanalNuevo.save(function(err, Canal) {
                    if (err) return console.error(err);
                    //console.log(block.hash);
                    console.log(CanalNuevo.index);
                    //res.redirect('/cobrar');
                    res.set('Content-Type', 'text/html');
                    res.send(`<meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                    body {
                        overflow: hidden;
                    }
                        p{
                            font-size:50px;
                            text-align:center;
                        color:silver;}
                        div {
                        background-image: radial-gradient(silver, black);
                        width: 100%;
                        height: 100%;
                        margin-top: -20px;
                        margin-left: -20px;
                        padding-bottom: 200%;
                        padding-top: 10%;
                        padding-left: 0;
                        padding-right: 30%;
                    }
                    a {
                        font-size: 40px;
                        color: white;
                        text-decoration: none;
                    }
                    
                    a:hover {
                        font-size: 50px;
                        color: silver;
                        text-decoration: none;
                    }
                    </style>
                   <div><p>Canal creado con exito <a href="/log">Continuar</a></p></div>`);

                });
            });
        }
    });


});
app.get("/view", (req, res) => {
    res.render("view");
});
app.post('/login', (req, res) => {
    Canal.findOne({ canal: req.body.canal }).then(function(doc) {
        // use doc
        if (doc !== null) {
            var pass = SHA256(req.body.pass).toString();
            if (req.body.user == doc.usuario && pass == doc.password) {
                session = req.session;
                session.canal = req.body.canal;
                res.send(`<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                body {
                    overflow: hidden;
                }
                    p{
                        font-size:50px;
                        text-align:center;
                    color:silver;}
                    div {
                    background-image: radial-gradient(silver, black);
                    width: 100%;
                    height: 100%;
                    margin-top: -20px;
                    margin-left: -20px;
                    padding-bottom: 200%;
                    padding-top: 10%;
                    padding-left: 0;
                    padding-right: 30%;
                }
                a {
                    font-size: 40px;
                    color: white;
                    text-decoration: none;
                }
                
                a:hover {
                    font-size: 50px;
                    color: silver;
                    text-decoration: none;
                }
                </style>
                <div><p>Bienvenido <a href=\'/'>Continuar</a></p></div>`);
            } else {
                res.send(`<meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                body {
                    overflow: hidden;
                }
                    p{
                        font-size:50px;
                        text-align:center;
                    color:silver;}
                    div {
                    background-image: radial-gradient(silver, black);
                    width: 100%;
                    height: 100%;
                    margin-top: -20px;
                    margin-left: -20px;
                    padding-bottom: 200%;
                    padding-top: 10%;
                    padding-left: 0;
                    padding-right: 30%;
                }
                a {
                    font-size: 40px;
                    color: white;
                    text-decoration: none;
                }
                
                a:hover {
                    font-size: 50px;
                    color: silver;
                    text-decoration: none;
                }
                </style>
                <div><p>Usuario y/o password es incorrecto <a href=\'/log'>Tratar otra vez</a></p></div>`);
            }
        } else {
            res.send(`<meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            body {
                overflow: hidden;
            }
                p{
                    font-size:50px;
                    text-align:center;
                color:silver;}
                div {
                background-image: radial-gradient(silver, black);
                width: 100%;
                height: 100%;
                margin-top: -20px;
                margin-left: -20px;
                padding-bottom: 200%;
                padding-top: 10%;
                padding-left: 0;
                padding-right: 30%;
            }
            a {
                font-size: 40px;
                color: white;
                text-decoration: none;
            }
            
            a:hover {
                font-size: 50px;
                color: silver;
                text-decoration: none;
            }
            </style>
            <div><p>Canal no existe desea crear un <a href=\'/reg'>Canal nuevo?</a></p></div>`);
        }
    });

});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
//process.kill(process.pid, 'SIGTERM')
server.listen(process.env.PORT || 8080, () => {
    console.log("Server run");
});

io.on("connection", (socket) => {
    //console.log("user: " + socket.id);
    /*socket.on("texto", (data) => {
        socket.broadcast.emit("texto", data)
    });*/
    socket.on("streaming", (stream, name) => {
        socket.broadcast.emit("streaming", stream, name);
        //console.log(stream + ' - ' + name);
    });
    socket.on("efecto", (codigo, codigo2, enombre) => {
        socket.broadcast.emit("efecto", codigo, codigo2, enombre);
        //console.log(codigo2);
    });

});