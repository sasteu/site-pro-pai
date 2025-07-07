import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Função para CRIAR uma empresa
export async function POST(request: Request) {
  try {
    const { nome, cnpj, atividadeIds } = await request.json();
    if (!nome || !cnpj || !atividadeIds || atividadeIds.length === 0) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const cnpjApenasNumeros = cnpj.replace(/\D/g, '');
    const novaEmpresa = await prisma.empresa.create({
      data: { nome, cnpj: cnpjApenasNumeros },
    });

    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const controlesParaCriar = atividadeIds.map((id: number) => ({
      empresaId: novaEmpresa.id,
      atividadeId: id,
      mes: mesAtual,
      ano: anoAtual,
      status: 'Pendente',
    }));

    await prisma.controleMensal.createMany({ data: controlesParaCriar });

    return NextResponse.json(novaEmpresa, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Este CNPJ já está cadastrado.' }, { status: 409 });
    }
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json({ error: 'Não foi possível cadastrar a empresa.' }, { status: 500 });
  }
}

// Função para LISTAR as empresas
export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { nome: 'asc' },
    });
    return NextResponse.json(empresas);
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json({ error: 'Não foi possível buscar as empresas.' }, { status: 500 });
  }
}