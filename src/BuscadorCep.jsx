import { useState, useEffect } from 'react';
import './BuscadorCep.css';

function BuscadorCEP() {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(null);
  const [erro, setErro] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [copiado, setCopiado] = useState(false);
  const [tema, setTema] = useState('light');

  // Aplica o tema no <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  const toggleTema = () => setTema((t) => (t === 'light' ? 'dark' : 'light'));

  const aplicarMascara = (valor) => {
    const nums = valor.replace(/\D/g, '');
    if (nums.length <= 5) return nums;
    return `${nums.slice(0, 5)}-${nums.slice(5, 8)}`;
  };

  const handleInputChange = (e) => {
    setCep(aplicarMascara(e.target.value));
  };

  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      buscarCEP(cepLimpo);
    } else {
      setEndereco(null);
      setErro(false);
    }
  }, [cep]);

  const buscarCEP = async (cepParaBuscar) => {
    setCarregando(true);
    setErro(false);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepParaBuscar}/json/`);
      const data = await response.json();
      if (data.erro) {
        setErro(true);
        setEndereco(null);
      } else {
        setEndereco(data);
        setHistorico((anterior) => {
          const semDuplicata = anterior.filter((item) => item.cep !== data.cep);
          return [data, ...semDuplicata].slice(0, 5);
        });
      }
    } catch (error) {
      console.error('Erro ao buscar o CEP:', error);
      setErro(true);
      setEndereco(null);
    } finally {
      setCarregando(false);
    }
  };

  const copiarEndereco = () => {
    if (!endereco) return;
    const texto = `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const buscarDoHistorico = (cepDoHistorico) => {
    setCep(aplicarMascara(cepDoHistorico.replace('-', '')));
  };

  return (
    <>
      {/* Botão toggle dark/light */}
      <button className="theme-toggle" onClick={toggleTema} aria-label="Alternar tema">
        {tema === 'light' ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Escuro
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Claro
          </>
        )}
      </button>

      <div className="buscador-container">
        <h1 className="title">Buscador de <span>CEP</span></h1>
        <p className="subtitle">Digite o CEP para encontrar o endereço automaticamente</p>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ex: 01001-000"
            value={cep}
            onChange={handleInputChange}
            className="input-cep"
            maxLength="9"
          />
        </div>

        <div className="resultado-container">
          {carregando && <p className="status carregando">Buscando endereço...</p>}

          {erro && !carregando && (
            <p className="erro">CEP não encontrado ou inválido.</p>
          )}

          {endereco && !carregando && (
            <div className="card-endereco">
              <p><strong>Logradouro</strong>{endereco.logradouro}</p>
              <p><strong>Bairro</strong>{endereco.bairro}</p>
              <p><strong>Cidade / UF</strong>{endereco.localidade} — {endereco.uf}</p>
              {endereco.complemento && (
                <p><strong>Complemento</strong>{endereco.complemento}</p>
              )}
              <button
                className={`btn-copiar${copiado ? ' copiado' : ''}`}
                onClick={copiarEndereco}
              >
                {copiado ? '✓ Copiado!' : '⎘ Copiar endereço'}
              </button>
            </div>
          )}
        </div>

        {historico.length > 0 && (
          <div className="historico-container">
            <h2 className="historico-titulo">Buscas recentes</h2>
            <ul className="historico-lista">
              {historico.map((item) => (
                <li
                  key={item.cep}
                  className="historico-item"
                  onClick={() => buscarDoHistorico(item.cep)}
                >
                  <span className="historico-cep">{item.cep}</span>
                  <span className="historico-local">{item.localidade} — {item.uf}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

export default BuscadorCEP;
