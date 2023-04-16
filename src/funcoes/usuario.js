const usuarios = require('../models/usuario');

class FuncoesUsuario {
  async buscar(email) {
    return await usuarios.findOne({where: { email }});
  }
  async buscarTodos() {
    return await usuarios.findAll();
  }
  async validar(email, senha) {
    return await usuarios.findOne({where: { email, senha }});
  }
  async criarUsuario(nome, email, senha) {
    return await usuarios.create({nome, email, senha});;
  }
}


module.exports = FuncoesUsuario;