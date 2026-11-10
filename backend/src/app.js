// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

app.use(express.json());

// Endpoint de verificação de saúde.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', documentRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const isMulterError = error.name === 'MulterError';
  const status = error.statusCode || (isMulterError
    ? error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    : 500);
  const code = error.code || (isMulterError ? 'UPLOAD_ERROR' : 'INTERNAL_ERROR');
  const message = status === 500 ? 'Ocorreu um erro interno.' : error.message;

  res.status(status).json({ error: { code, message } });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`DMS backend ouvindo em ${HOST}:${PORT}`);
  });
}

module.exports = app;
