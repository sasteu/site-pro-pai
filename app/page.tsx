'use client';

import React, { useState, useEffect, useMemo } from 'react';

// Definindo os tipos de dados que esperamos da nossa API
interface Atividade {
  id: number;
  nome: string;
  diaLimite: number;
  categoria: string;
}

interface Controle {
  id: number;
  status: string;
  atividade: Atividade;
}

interface EmpresaDashboard {
  id: number;
  nome: string;
  controles: Controle[];
}

export default function DashboardPage() {
  const [data, setData] = useState<EmpresaDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar o mês e ano exibidos
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Função para buscar os dados do dashboard
  const fetchDashboardData = async (mes: number, ano: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?mes=${mes}&ano=${ano}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do dashboard.');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os dados quando a página carrega ou quando a data muda
  useEffect(() => {
    const mes = dataSelecionada.getMonth() + 1;
    const ano = dataSelecionada.getFullYear();
    fetchDashboardData(mes, ano);
  }, [dataSelecionada]);

  // Função para "dar o check" em uma atividade
  const handleMarcarComoConcluido = async (controleId: number) => {
    // Otimistamente, atualiza a UI antes mesmo da resposta da API
    setData(currentData => 
      currentData.map(empresa => ({
        ...empresa,
        controles: empresa.controles.map(controle => 
          controle.id === controleId ? { ...controle, status: 'Concluído' } : controle
        ),
      }))
    );

    try {
      await fetch(`/api/controle/${controleId}`, { method: 'PATCH' });
      // Se quiséssemos, poderíamos re-buscar os dados aqui, mas a UI já foi atualizada.
    } catch (error) {
      // Se der erro, desfaz a mudança na UI e mostra o erro
      alert('Não foi possível salvar a alteração.');
      const mes = dataSelecionada.getMonth() + 1;
      const ano = dataSelecionada.getFullYear();
      fetchDashboardData(mes, ano);
    }
  };
  
  // Funções para mudar o mês
  const mesAnterior = () => {
    setDataSelecionada(new Date(dataSelecionada.setMonth(dataSelecionada.getMonth() - 1)));
  };
  
  const proximoMes = () => {
    setDataSelecionada(new Date(dataSelecionada.setMonth(dataSelecionada.getMonth() + 1)));
  };

  // Agrupa os controles por categoria para cada empresa
  const empresasComControlesAgrupados = useMemo(() => {
    return data.map(empresa => ({
      ...empresa,
      controlesAgrupados: empresa.controles.reduce((acc, controle) => {
        const categoria = controle.atividade.categoria;
        if (!acc[categoria]) {
          acc[categoria] = [];
        }
        acc[categoria].push(controle);
        return acc;
      }, {} as Record<string, Controle[]>),
    }));
  }, [data]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Seletor de Mês */}
      <div className="flex items-center justify-center mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
        <button onClick={mesAnterior} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l-lg">
          &lt; Anterior
        </button>
        <h1 className="text-2xl font-bold text-white text-center w-64">
          {dataSelecionada.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </h1>
        <button onClick={proximoMes} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg">
          Próximo &gt;
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-400">Carregando...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {empresasComControlesAgrupados.map(empresa => (
          <div key={empresa.id} className="bg-gray-800 rounded-lg shadow-lg p-5">
            <h2 className="text-xl font-bold text-white border-b border-gray-700 pb-2 mb-4">{empresa.nome}</h2>
            {Object.entries(empresa.controlesAgrupados).map(([categoria, controles]) => (
              <div key={categoria} className="mb-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">{categoria}</h3>
                <ul className="space-y-2">
                  {controles.map(controle => (
                    <li key={controle.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                      <span className={`flex-1 ${controle.status === 'Concluído' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {controle.atividade.nome} (v. {controle.atividade.diaLimite})
                      </span>
                      <input
                        type="checkbox"
                        checked={controle.status === 'Concluído'}
                        onChange={() => handleMarcarComoConcluido(controle.id)}
                        disabled={controle.status === 'Concluído'}
                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-green-500 focus:ring-green-500 disabled:opacity-50"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}