'use client';

import React, { useState, useEffect } from 'react';

// Tipos de dados
type Empresa = { id: number; nome: string; cnpj: string; };
type Atividade = { id: number; nome: string; categoria: string; };

// Função ajudante para formatar CNPJ
function formatarCNPJ(cnpj: string) {
  if (!cnpj) return '';
  const apenasNumeros = cnpj.replace(/\D/g, '');
  if (apenasNumeros.length !== 14) return cnpj;
  return apenasNumeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export default function EmpresasPage() {
  // --- ESTADOS DO COMPONENTE ---
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [atividadesDisponiveis, setAtividadesDisponiveis] = useState<Atividade[]>([]);
  const [atividadesSelecionadas, setAtividadesSelecionadas] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresaParaEditar, setEmpresaParaEditar] = useState<Empresa | null>(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [cnpjEditado, setCnpjEditado] = useState('');
  const [atividadesEditadas, setAtividadesEditadas] = useState<Record<number, boolean>>({});

  // --- FUNÇÃO COMPLETA PARA BUSCAR DADOS ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resEmpresas, resAtividades] = await Promise.all([
        fetch('/api/empresas'),
        fetch('/api/atividades'),
      ]);
      if (!resEmpresas.ok || !resAtividades.ok) throw new Error('Falha ao buscar dados.');
      const dataEmpresas = await resEmpresas.json();
      const dataAtividades = await resAtividades.json();
      setEmpresas(dataEmpresas);
      setAtividadesDisponiveis(dataAtividades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleCheckboxChange = (atividadeId: number) => {
    setAtividadesSelecionadas(prevState => ({ ...prevState, [atividadeId]: !prevState[atividadeId] }));
  };

  // --- FUNÇÃO COMPLETA PARA CRIAR EMPRESA ---
  const handleSubmitCriacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const idsSelecionados = Object.keys(atividadesSelecionadas).filter(id => atividadesSelecionadas[Number(id)]).map(Number);
    if (idsSelecionados.length === 0) {
      setError("Selecione pelo menos uma atividade para a empresa.");
      return;
    }
    try {
      const response = await fetch('/api/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cnpj, atividadeIds: idsSelecionados }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao cadastrar empresa.');
      }
      setNome('');
      setCnpj('');
      setAtividadesSelecionadas({});
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    }
  };

  // --- FUNÇÃO COMPLETA PARA EXCLUIR EMPRESA ---
  const handleExcluir = async (empresaId: number) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`/api/empresas/${empresaId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Falha ao excluir empresa.');
        fetchData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocorreu um erro.');
      }
    }
  };

  // --- FUNÇÕES COMPLETAS PARA EDITAR EMPRESA ---
  const handleAbrirModalEdicao = async (empresa: Empresa) => {
    setEmpresaParaEditar(empresa);
    setNomeEditado(empresa.nome);
    setCnpjEditado(formatarCNPJ(empresa.cnpj));
    try {
      const response = await fetch(`/api/empresas/${empresa.id}/atividades`);
      const idsAtuais: number[] = await response.json();
      const checkboxesIniciais: Record<number, boolean> = {};
      atividadesDisponiveis.forEach(atividade => {
        checkboxesIniciais[atividade.id] = idsAtuais.includes(atividade.id);
      });
      setAtividadesEditadas(checkboxesIniciais);
    } catch (err) {
      alert("Não foi possível carregar as atividades desta empresa.");
    }
  };
  
  const handleCheckboxChangeEdicao = (atividadeId: number) => {
    setAtividadesEditadas(prevState => ({ ...prevState, [atividadeId]: !prevState[atividadeId] }));
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaParaEditar) return;
    const idsSelecionados = Object.keys(atividadesEditadas).filter(id => atividadesEditadas[Number(id)]).map(Number);
    try {
      const response = await fetch(`/api/empresas/${empresaParaEditar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nomeEditado, cnpj: cnpjEditado, atividadeIds: idsSelecionados }),
      });
      if (!response.ok) throw new Error('Falha ao salvar alterações.');
      setEmpresaParaEditar(null);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ocorreu um erro.');
    }
  };

  // --- JSX (PARTE VISUAL COMPLETA) ---
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Gestão de Empresas</h1>

      {/* Formulário de Cadastro */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Cadastrar Nova Empresa</h2>
        <form onSubmit={handleSubmitCriacao}>
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-300 mb-2">Nome da Empresa</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-4">
            <label htmlFor="cnpj" className="block text-gray-300 mb-2">CNPJ</label>
            <input type="text" id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Atividades da Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
              {atividadesDisponiveis.map(atividade => (
                <label key={atividade.id} className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={!!atividadesSelecionadas[atividade.id]} onChange={() => handleCheckboxChange(atividade.id)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500" />
                  <span className="text-white">{atividade.nome} <span className="text-xs text-gray-400">({atividade.categoria})</span></span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Cadastrar Empresa</button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

      {/* Lista de Empresas Cadastradas */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-white">Empresas Cadastradas</h2>
        {isLoading ? (<p className="text-gray-400">Carregando...</p>) : (
          <ul className="space-y-4">
            {empresas.map((empresa) => (
              <li key={empresa.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold text-white">{empresa.nome}</p>
                  <p className="text-sm text-gray-400">{formatarCNPJ(empresa.cnpj)}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleAbrirModalEdicao(empresa)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm">Editar</button>
                  <button onClick={() => handleExcluir(empresa.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">Excluir</button>
                </div>
              </li>
            ))}
             {empresas.length === 0 && !isLoading && (<p className="text-gray-400">Nenhuma empresa cadastrada ainda.</p>)}
          </ul>
        )}
      </div>

      {/* Modal de Edição */}
      {empresaParaEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-white">Editar Empresa</h2>
            <form onSubmit={handleSalvarEdicao}>
              <div className="mb-4">
                <label htmlFor="edit-nome" className="block text-gray-300 mb-2">Nome da Empresa</label>
                <input id="edit-nome" type="text" value={nomeEditado} onChange={(e) => setNomeEditado(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              </div>
              <div className="mb-4">
                <label htmlFor="edit-cnpj" className="block text-gray-300 mb-2">CNPJ</label>
                <input id="edit-cnpj" type="text" value={cnpjEditado} onChange={(e) => setCnpjEditado(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white" required />
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Atividades da Empresa</h3>
                <div className="max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
                  {atividadesDisponiveis.map(atividade => (
                    <label key={atividade.id} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" checked={!!atividadesEditadas[atividade.id]} onChange={() => handleCheckboxChangeEdicao(atividade.id)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500" />
                      <span className="text-white">{atividade.nome}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => setEmpresaParaEditar(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}