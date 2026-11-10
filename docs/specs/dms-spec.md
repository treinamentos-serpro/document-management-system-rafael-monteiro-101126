# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem documentos, mantendo os arquivos no filesystem local da aplicação e seus metadados em memória.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos documentos do usuário.
- Download de um documento pelo identificador.
- Registro dos metadados essenciais de cada documento.
- Armazenamento dos arquivos em `backend/storage`, usando Multer com `diskStorage`.
- Integração do frontend React com a API via proxy `/api` do Vite.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, exclusão ou edição de documentos.
- Persistência dos metadados em banco de dados.
- Autenticação e autorização completas.
- Busca avançada, compartilhamento e organização por pastas.
- Recuperação automática dos metadados após reiniciar o processo.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um arquivo por requisição `multipart/form-data`. |
| RF-02 | O sistema deve rejeitar o envio quando o arquivo estiver ausente ou exceder o limite configurado. |
| RF-03 | O sistema deve gravar o arquivo enviado no filesystem local, em `backend/storage`, usando Multer com `diskStorage`. |
| RF-04 | O sistema deve gerar um identificador único e um nome interno de armazenamento que não dependam do nome enviado pelo usuário. |
| RF-05 | O sistema deve registrar os metadados do documento em memória após o arquivo ser gravado com sucesso. |
| RF-06 | O sistema deve listar os metadados dos documentos associados ao usuário atual. |
| RF-07 | O sistema deve permitir baixar um documento existente pelo identificador. |
| RF-08 | O sistema deve retornar `404` quando o identificador solicitado não existir ou não pertencer ao usuário atual. |
| RF-09 | O frontend deve permitir selecionar, enviar, listar e baixar documentos, apresentando estados de carregamento e mensagens de erro. |
| RF-10 | O nome original do arquivo deve ser preservado nos metadados e usado como nome sugerido no download. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem permanecer exclusivamente no filesystem local da aplicação, em `backend/storage`. |
| RNF-02 | O upload deve usar Multer configurado com `diskStorage`; não usar armazenamento em memória para o conteúdo nem provedores externos. |
| RNF-03 | Os metadados devem permanecer em memória nesta fase e podem ser perdidos ao reiniciar o backend. |
| RNF-04 | Porta, diretório de armazenamento e limite de upload devem ser configuráveis por variáveis de ambiente, com padrões documentados. |
| RNF-05 | O nome original não deve compor o caminho físico de armazenamento. |
| RNF-06 | Erros de entrada devem receber respostas HTTP consistentes, sem expor caminhos internos. |
| RNF-07 | O backend deve seguir o fluxo de dependências `routes -> controllers -> services -> repositories`. |
| RNF-08 | A solução deve reutilizar as dependências existentes e os testes do runner nativo `node:test`. |

## 5. Modelo de dados

### Documento

| Campo | Tipo | Exposição | Descrição |
| --- | --- | --- | --- |
| `id` | string | API | Identificador único do documento, preferencialmente UUID. |
| `originalName` | string | API | Nome original fornecido no upload, usado para exibição e download. |
| `size` | number | API | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | API | Data e hora do upload em ISO 8601, UTC. |
| `owner` | string | API | Identificador do usuário associado ao documento. |
| `storageName` | string | Interno | Nome gerado pelo servidor para localizar o arquivo no diretório local; não deve ser exposto. |

O caminho físico é resolvido pelo backend a partir do diretório de armazenamento configurado e do `storageName`. O backend não aceita do cliente um caminho de arquivo.

### Identidade do usuário

A especificação não define autenticação. Nesta fase, `owner` é configurado no backend por `DMS_DEFAULT_OWNER`, cujo padrão é `local-user`. Essa identidade serve ao MVP local e não representa controle de acesso seguro nem autenticação de múltiplos usuários.

Por isso, o backend escuta em `127.0.0.1` por padrão. Alterar `HOST` para uma interface de rede não adiciona autenticação: só exponha o serviço em uma rede confiável e atrás de uma camada que aplique controle de acesso.

## 6. Contratos de API

As rotas do backend permanecem sem o prefixo `/api`. No desenvolvimento, o Vite encaminha `/api/*` ao backend e remove esse prefixo antes de encaminhar a requisição.

Formato padrão de erro:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Descrição legível do erro."
  }
}
```

### `POST /upload`

Envia um arquivo por `multipart/form-data`, no campo obrigatório `file`. Responde `201 Created` com:

```json
{
  "id": "uuid",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-11-10T12:00:00.000Z",
  "owner": "local-user"
}
```

Erros: `400` para arquivo ausente ou multipart inválido; `413` para arquivo acima do limite; `500` para falha interna ao gravar arquivo ou metadados. O limite padrão é 10 MiB e pode ser definido por `MAX_UPLOAD_SIZE`. Se o registro dos metadados falhar, o backend tenta remover o arquivo gravado.

### `GET /documents`

Lista os metadados dos documentos associados ao usuário atual. Responde `200 OK` com um array, sem `storageName`. Sem documentos, retorna `[]`.

### `GET /documents/:id/download`

Retorna o conteúdo binário do documento com `Content-Disposition` contendo o nome original tratado para uso seguro em cabeçalhos. Responde `404 Not Found` se o documento não existir, não pertencer ao usuário atual ou o arquivo não estiver disponível.

## 7. Decisões arquiteturais

### Backend

- `routes/`: registra endpoints e conecta middlewares e controllers.
- `controllers/`: interpreta a entrada HTTP e monta as respostas.
- `services/`: concentra as regras de negócio de upload, listagem e download.
- `repositories/`: mantém metadados em memória e resolve o armazenamento local.
- Multer com `diskStorage` grava os arquivos em `backend/storage` por padrão; `STORAGE_DIR` permite configurar outro diretório local.
- O identificador e o nome físico são gerados no backend; o nome original fica nos metadados.
- A API não expõe caminhos físicos.

### Frontend

- Componentes funcionais React, organizados nas pastas existentes `components/`, `pages/` e `services/` conforme a evolução do produto.
- A comunicação com o backend usa `fetch` através do prefixo `/api`.
- A interface apresenta estados de carregamento, vazio e erro, além das ações de upload e download.

### Configuração e limitações

- Variáveis: `HOST` (padrão `127.0.0.1`), `PORT` (padrão `3000`), `STORAGE_DIR` (padrão `backend/storage`), `MAX_UPLOAD_SIZE` (padrão `10485760` bytes) e `DMS_DEFAULT_OWNER` (padrão `local-user`).
- O diretório de armazenamento recebe permissões `0700` e cada arquivo enviado recebe `0600`; mantenha `STORAGE_DIR` em um filesystem local com permissões POSIX compatíveis.
- Metadados em memória são voláteis. Após reiniciar o backend, arquivos podem continuar no disco sem registros correspondentes.
- A ausência de autenticação é uma limitação explícita desta fase.

## 8. Plano de execução

1. Preparar configuração de armazenamento e rotas, preservando a divisão `routes -> controllers -> services -> repositories`.
2. Implementar upload com Multer `diskStorage`, identificador interno, validação de arquivo, metadados em memória e tratamento de falhas.
3. Implementar listagem e download por identificador, sem expor nomes internos de armazenamento ou caminhos locais.
4. Construir a interface React de seleção, upload, listagem e download, integrada pelo proxy `/api` do Vite.
5. Validar o fluxo integrado com testes HTTP do backend e build de produção do frontend; documentar configurações e limitações.