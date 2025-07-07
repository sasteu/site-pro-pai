import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Retorna os IDs de todas as atividades de uma empresa para o mês atual
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const empresaId = parseInt(params.id, 10);
    const hoje = new Date();
    const mes = hoje.getMonth() + 1;
    const ano = hoje.getFullYear();

    const controles = await prisma.controleMensal.findMany({
      where: { empresaId, mes, ano },
      select: {
        atividadeId: true, // Seleciona apenas o ID da atividade
      },
    });

    // Extrai apenas os números dos IDs para um array simples: [1, 3, 5]
    const atividadeIds = controles.map(c => c.atividadeId);

    return NextResponse.json(atividadeIds);
  } catch (error) {
    console.error("Erro ao buscar atividades da empresa:", error);
    return NextResponse.json({ error: 'Não foi possível buscar as atividades.' }, { status: 500 });
  }
}