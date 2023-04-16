const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors')

const fnUsuarios = require('./funcoes/usuario');
const usuarios = new fnUsuarios();

const app = express();
const router = express.Router();

app.use(session({
  secret: 'griffincode',
  resave: false,
  cookie: {
    expires: 1000 * 60 * 24 * 30 * 60,
  },
  saveUninitialized: false
}));

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'paginas')));

router.get('/', (req, res, next) => {
  res.redirect('/login')
});

(async () => {
  try {
    const banco = require('./banco');
    await banco.authenticate();
    await banco.sync();
  } catch (err) {
    console.error(err)
  }
})()

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './login.html'))
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, './registro.html'))
});

app.get('/home', (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, 'paginas/home/index.html'))
  }
});

// Funçoes
app.get('/users', async (req, res) => {
  res.send(await usuarios.buscarTodos())
})


app.post('/auth/login', async (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const senha = req.body.senha;

  if (email, senha) {
    const validado = await usuarios.validar(email, senha);
    console.log(validado != null)

    if (validado) {
      console.log("Validado!")
      req.session.loggedIn = true;
      req.session.email = email;
      res.redirect('/home');

    } else {
      console.log('Usuário ou senha incorretos!')
      res.send('Usuário ou senha incorretos!').status(403);
    }

  } else {
    console.log('Coloque um email!')
    res.send('Coloque um email e uma senha!').status(401);
    res.end();
  }
});
app.post('/auth/registro', async (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const senha = req.body.senha;
  const nome = req.body.nome;

  if (!nome || !email || !senha) {
    console.log("Valores nulos")
  } else {

    const jaExiste = await usuarios.buscar(email);

    console.log(jaExiste)

    if (!jaExiste) {
      if (email, senha, nome) {
        await usuarios.criarUsuario(nome, email, senha);

        req.session.loggedin = true;
        req.session.username = email;

        res.redirect('/home');

      } else {
        res.send('Erro no servidor!').status(403);
        res.end();
      }
    } else {
      res.send('Usuário já existe').status(405);
      res.end();
    }
  }
});


const porta = 8000;

app.listen(porta, () => {
  console.log(`[Rodando]: localhost:${porta}`);
});