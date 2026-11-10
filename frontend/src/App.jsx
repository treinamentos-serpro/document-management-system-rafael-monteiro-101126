import { useEffect, useState } from 'react';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from './services/documentService.js';
import './App.css';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    listDocuments()
      .then((items) => {
        if (active) setDocuments(items);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function chooseFile(file) {
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    if (!selectedFile) return;

    const form = event.currentTarget;
    setIsUploading(true);
    setError('');
    try {
      await uploadDocument(selectedFile);
      setSelectedFile(null);
      form.reset();
      setDocuments(await listDocuments());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setError('');
    try {
      await downloadDocument(document.id, document.originalName);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingId(null);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">arquivo<span>local</span></span>
        </a>
        <div className="topbar-status">
          <span className="status-dot" />
          Armazenamento local
        </div>
      </header>

      <main className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <p className="eyebrow">ESPAÇO DE TRABALHO / DOCUMENTOS</p>
          <div className="heading-row">
            <div>
              <h1 id="page-title">Seus documentos</h1>
              <p className="heading-copy">Arquivos reunidos em um só lugar.</p>
            </div>
            <div className="document-total" aria-live="polite">
              <strong>{documents.length.toString().padStart(2, '0')}</strong>
              <span>{documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
            </div>
          </div>
        </section>

        <section className="upload-section" aria-labelledby="upload-title">
          <div className="section-heading">
            <div>
              <span className="section-index">01</span>
              <h2 id="upload-title">Adicionar arquivo</h2>
            </div>
            <span className="section-note">Um arquivo por envio</span>
          </div>

          <form onSubmit={handleUpload}>
            <label
              className={`drop-zone${isDragging ? ' is-dragging' : ''}${selectedFile ? ' has-file' : ''}`}
              htmlFor="document-file"
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
              }}
              onDrop={handleDrop}
            >
              <input
                id="document-file"
                name="file"
                type="file"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              <span className="upload-symbol" aria-hidden="true">+</span>
              <span className="drop-copy">
                <strong>{selectedFile ? selectedFile.name : 'Escolha um arquivo'}</strong>
                <span>{selectedFile ? formatBytes(selectedFile.size) : 'ou arraste e solte aqui'}</span>
              </span>
              <span className="browse-action">Procurar</span>
            </label>

            <div className="upload-actions">
              <span className="upload-hint">Os arquivos são armazenados neste servidor.</span>
              <button className="primary-button" type="submit" disabled={!selectedFile || isUploading}>
                {isUploading ? 'Enviando...' : 'Enviar arquivo'}
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div className="error-message" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Fechar mensagem">×</button>
          </div>
        )}

        <section className="documents-section" aria-labelledby="documents-title">
          <div className="section-heading documents-heading">
            <div>
              <span className="section-index">02</span>
              <h2 id="documents-title">Biblioteca</h2>
            </div>
            <span className="section-note">Mais recentes primeiro</span>
          </div>

          {isLoading ? (
            <p className="list-message" role="status">Carregando documentos...</p>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">—</span>
              <p>Nenhum documento enviado.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Adicionado em</th>
                    <th scope="col">Tamanho</th>
                    <th scope="col"><span className="visually-hidden">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id}>
                      <td data-label="Nome">
                        <span className="file-mark" aria-hidden="true">DOC</span>
                        <span className="file-name" title={document.originalName}>{document.originalName}</span>
                      </td>
                      <td data-label="Adicionado em">{formatDate(document.uploadedAt)}</td>
                      <td data-label="Tamanho">{formatBytes(document.size)}</td>
                      <td className="row-action">
                        <button
                          className="download-button"
                          type="button"
                          onClick={() => handleDownload(document)}
                          disabled={downloadingId === document.id}
                          aria-label={`Baixar ${document.originalName}`}
                        >
                          {downloadingId === document.id ? 'Baixando...' : 'Baixar'}
                          {downloadingId !== document.id && <span aria-hidden="true">↓</span>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="workspace-footer">
          <span>DMS</span>
          <span>Seus arquivos permanecem no armazenamento local.</span>
        </footer>
      </main>
    </div>
  );
}
