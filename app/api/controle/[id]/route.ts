import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// O método PATCH é usado para atualizações parciais
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const controleId = parseInt(params.id, 10);
  
  try {
    const controleAtualizado = await prisma.controleMensal.update({
      where: { id: controleId },
      data: {
        status: 'Concluído', // Muda o status
        dataConclusao: new Date(), // Registra a data da conclusão
      },
    });
    return NextResponse.json(controleAtualizado);
  } catch (error) {
    console.error(`Erro ao atualizar controle ${controleId}:`, error);
    return NextResponse.json({ error: 'Não foi possível atualizar o status.' }, { status: 500 });
  }
}