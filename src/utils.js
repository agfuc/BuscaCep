export const API_URL = 'https://viacep.com.br/ws';

export const aplicarMascara = (valor) => {
  const apenasNumeros = valor.replace(/\D/g, '');
  if (apenasNumeros.length <= 5) return apenasNumeros;
  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
};
