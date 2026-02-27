export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Erro desconhecido';

  const message = error.message || error.error?.message || String(error);

  if (message.includes('401') || message.includes('Unauthorized')) {
    return 'Email ou senha incorretos.';
  }
  if (message.includes('403') || message.includes('Forbidden')) {
    return 'Acesso negado. Contacte o administrador.';
  }
  if (message.includes('404') || message.includes('Not Found')) {
    return 'Serviço não encontrado. Contacte o administrador.';
  }
  if (message.includes('500') || message.includes('Server Error')) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }
  if (message.includes('network') || message.includes('Failed to fetch')) {
    return 'Erro de conexão. Verifique sua internet.';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'Tempo limite excedido. Tente novamente.';
  }
  if (message.includes('email') && message.includes('exist')) {
    return 'Email não encontrado.';
  }
  if (message.includes('password') && message.includes('incorrect')) {
    return 'Senha incorreta.';
  }
  if (message.includes('already exists') || message.includes('duplicate')) {
    return 'Este email já está cadastrado.';
  }

  return message;
}