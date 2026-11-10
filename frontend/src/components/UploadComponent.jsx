import { useState } from 'react';
import { formatBytes } from '../utils/format.js';

export default function UploadComponent({ onUpload, onError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function chooseFile(file) {
    if (file) {
      setSelectedFile(file);
      onError('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile) return;

    const form = event.currentTarget;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      form.reset();
    } catch (error) {
      onError(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  return (
    <form onSubmit={handleSubmit}>
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
  );
}