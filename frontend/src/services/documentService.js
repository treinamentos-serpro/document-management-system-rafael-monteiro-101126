async function request(path, options) {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.';
    try {
      const body = await response.json();
      message = body.error?.message || message;
    } catch {
      // Mantém a mensagem padrão para respostas sem JSON.
    }
    throw new Error(message);
  }
  return response;
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await request('/upload', { method: 'POST', body: formData });
  return response.json();
}

export async function downloadDocument(id, originalName) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  const file = await response.blob();
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = originalName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}