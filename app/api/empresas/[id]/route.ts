// 1. Importações necessárias que estavam faltando
import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

// 2. Inicialização do Prisma Client que estava faltando
const prisma = new PrismaClient();

// --- FUNÇÃO PARA EXCLUIR UMA EMPRESA (DELETE) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);

    await prisma.empresa.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Empresa excluída com sucesso' }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir empresa:", error);
    return NextResponse.json({ error: 'Não foi possível excluir a empresa.' }, { status: 500 });
  }
}

// --- FUNÇÃO PARA EDITAR UMA EMPRESA (PATCH) ---
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const empresaId = parseInt(params.id, 10);
    const { nome, cnpj, atividadeIds } = await request.json();

    const cnpjApenasNumeros = cnpj.replace(/\D/g, '');
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const controlesAtuais = await prisma.controleMensal.findMany({
      where: { empresaId, mes: mesAtual, ano: anoAtual },
    });
    const idsAtuais = controlesAtuais.map(c => c.atividadeId);
    
    const idsParaAdicionar = atividadeIds.filter((id: number) => !idsAtuais.includes(id));
    const idsParaRemover = idsAtuais.filter((id: number) => !atividadeIds.includes(id));

    const operacoes = [];

    operacoes.push(prisma.empresa.update({
      where: { id: empresaId },
      data: { nome, cnpj: cnpjApenasNumeros },
    }));

    if (idsParaAdicionar.length > 0) {
      operacoes.push(prisma.controleMensal.createMany({
        data: idsParaAdicionar.map((id: number) => ({
          empresaId,
          atividadeId: id,
          mes: mesAtual,
          ano: anoAtual,
          status: 'Pendente'
        })),
      }));
    }

    if (idsParaRemover.length > 0) {
      operacoes.push(prisma.controleMensal.deleteMany({
        where: {
          empresaId,
          mes: mesAtual,
          ano: anoAtual,
          atividadeId: { in: idsParaRemover },
        },
      }));
    }
    
    await prisma.$transaction(operacoes);

    return NextResponse.json({ message: "Empresa atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao editar empresa:", error);
    return NextResponse.json({ error: 'Não foi possível editar a empresa.' }, { status: 500 });
  }
}