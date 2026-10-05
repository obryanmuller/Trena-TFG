export async function api(path, method = 'GET', body) {
  const response = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => {
    throw new Error('O servidor está indisponível. Aguarde um momento e tente novamente.');
  });

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível concluir a operação.');
  }

  return data;
}
