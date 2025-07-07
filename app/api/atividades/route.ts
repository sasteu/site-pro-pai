import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Função para LISTAR todas as atividades (método GET)
export async function GET() {
  try {
    const atividades = await prisma.atividade.findMany({
      orderBy: {
        categoria: 'asc', // Ordena por categoria
      },
    });
    return NextResponse.json(atividades);
  } catch (error) {
    console.error("Erro ao listar atividades:", error);
    return NextResponse.json(
      { error: 'Não foi possível buscar as atividades.' },
      { status: 500 }
    );
  }
}