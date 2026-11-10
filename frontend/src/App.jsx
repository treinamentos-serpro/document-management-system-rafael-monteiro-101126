import { useEffect, useState } from 'react';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from './services/documentService.js';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  async function handleUpload(file) {
    setError('');
    await uploadDocument(file);
    setDocuments(await listDocuments());
  }

  async function handleDownload(document) {
    setError('');
    await downloadDocument(document.id, document.originalName);
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

          <UploadComponent onUpload={handleUpload} onError={setError} />
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

          <DocumentList
            documents={documents}
            isLoading={isLoading}
            onDownload={handleDownload}
            onError={setError}
          />
        </section>

        <footer className="workspace-footer">
          <span>DMS</span>
          <span>Seus arquivos permanecem no armazenamento local.</span>
        </footer>
      </main>
    </div>
  );
}
