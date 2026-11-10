import DownloadButton from './DownloadButton.jsx';
import { formatBytes, formatDate } from '../utils/format.js';

export default function DocumentList({ documents, isLoading, onDownload, onError }) {
  if (isLoading) {
    return <p className="list-message" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-mark" aria-hidden="true">—</span>
        <p>Nenhum documento enviado.</p>
      </div>
    );
  }

  return (
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
                <DownloadButton
                  document={document}
                  onDownload={onDownload}
                  onError={onError}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}