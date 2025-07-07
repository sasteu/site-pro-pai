import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mes = parseInt(searchParams.get('mes') || '0', 10);
  const ano = parseInt(searchParams.get('ano') || '0', 10);

  if (!mes || !ano) {
    return NextResponse.json({ error: 'Mês e ano são obrigatórios.' }, { status: 400 });
  }

  try {
    // 1. Busca todas as empresas
    const empresas = await prisma.empresa.findMany({
      orderBy: { nome: 'asc' },
    });

    // 2. Busca todos os controles mensais para o mês/ano especificado
    const controlesDoMes = await prisma.controleMensal.findMany({
      where: { mes, ano },
      include: { atividade: true }, // Inclui os dados da atividade (nome, diaLimite, etc.)
    });

    // 3. Monta a estrutura de dados final para o dashboard
    const dashboardData = empresas.map(empresa => {
      // Para cada empresa, filtra apenas os seus controles
      const controlesDaEmpresa = controlesDoMes.filter(c => c.empresaId === empresa.id);
      
      return {
        ...empresa, // id, nome, cnpj da empresa
        controles: controlesDaEmpresa, // a lista de atividades com status para aquele mês
      };
    });

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json({ error: 'Não foi possível buscar os dados do dashboard.' }, { status: 500 });
  }
}