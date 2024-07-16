import prisma from './db'

import callType from '../types/call'
import { Prisma } from '@prisma/client'

//===============================================================//

/**
 * Adiciona a chamada no banco de dados.
 * 
 * @param call (A chamada que é recebida do outro servidor)
 */
export const setCallsHistory = async (call: callType) => {

  const callHistory = {
    status: call.status,
    queue: call.queue,
    extension: call.exten,
    uniqueId: call.uniqueid,
    linkId: call.linkedid,
    phoneNumber: call.phoneNumber,
    showOnPanel: call.showOnPanel
  }

  try {
    const response = await prisma.callsHistory.create({
      data: callHistory
    })

    if (response) {
      console.log("Chamada adicionada no banco de dados.")
      return
    } else {
      console.warn("não foi possível adicionar a chamada")
      return null
    }

  } catch (error) {
    console.error(`Erro ao adicionar a chamada: ${error}`)
  }

}

//================================================================//


/**
 * Função para atualizar as informações da chamada.
 * 
 * @param status (Novo status da chamada)
 * @param show (Váriavel para mostrar na tabela ou não)
 * @param linkedid (id da chamada)
 * @returns A chamada atualizada
 */
export const updateStatus = async (linkedid: string, status: string, show: boolean) => {

  try {
    const response = await prisma.callsHistory.update({
      data: {
        status: status,
        showOnPanel: show
      },
      where: {
        linkId: linkedid
      }
    })

    if (response) {
      console.log('Chamada atualizada no banco de dados.')
      return response
    } else {
      console.warn("Não foi possível atualizar a chamada. Provavelmente essa chamada não foi adicionada no momento da ligação")
      return null
    }

  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError){
      console.error('Essa chamada não existe no banco')
    }else {
      console.error(`Erro ao atualizar chamada: ${error}`)
    }
  }

}

//===============================================================//


/**
 * Retorna a primeira chamada que associar com o parâmetro
 * 
 * @param call (A chamada que é recebida do outro servidor)
 */
export const getOneCallHistory = async (queueStatus: string) => {

  try {

    const response = await prisma.callsHistory.findFirst({
      where: {
        queue: queueStatus,
        NOT: {
          OR: [
            { status: "Abandonado" },
            { status: "Chamando" },
            {status: "Encerrado"}
          ]
        }
      }
    })

    if (response) {
      return response
    } else {
      console.warn("Não foi possível encontrar a chamada.")
      return null
    }

  } catch (error) {
    console.error(`Erro ao encontrar a chamada: ${error}`)
  }

}

//===============================================================//

/**
 * Função para encontrar uma chamada de acordo com o Link Id da chamada
 * 
 * @param linkedid (id da chamada)
 * @returns 
 */
export const getThisCall = async (linkedid: string) => {

  try {

    const response = await prisma.callsHistory.findUnique({
      where: {
        linkId: linkedid
      }
    })

    if (response) {
      return response
    } else {
      return null
    }

  } catch (error) {
    console.error(`Erro ao encontrar a chamada: ${error}`)
  }

}

//===============================================================//

/**
 * Retorna todas as chamadas que devem ser mostradas no painel.
 * 
 * @param queue (A fila)
 */
export const setOnPanel = async () => {

  try {

    const response = await prisma.callsHistory.findMany({
      where: {
        showOnPanel: true,
      }
    })

    if (response) {
      return response
    } else {
      console.info("Sem chamadas para visualizar")
    }

  } catch (error) {
    console.error(`Erro ao encontrar chamadas ativas da fila : ${error}`)
    return error
  }

}

//===============================================================//

/**
 * Retorna todas as chamadas que devem ser mostradas no painel de acordo com o Id.
 * 
 * @param id (Id do cliente)
 */
export const getPanelHistory = async (id: number) => {

  try {

    const clients = await prisma.queues.findMany({
      where: {
        clientId: id
      }
    });

    if (!clients || clients.length === 0) {
      console.warn("Sem clientes com esse Id.")
      return []
    }

    const calls: any[] = [];

    for (const client of clients) {
      const newCall = await prisma.callsHistory.findMany({
        where: {
          queue: client.code,
          showOnPanel: true
        }
      });

      if (!newCall || newCall.length === 0) {
        console.warn(`Sem chamadas para o cliente com código ${client.code}.`);
      }

      calls.push(...newCall)
    }

    console.log("Os registros do painel foram carregados");
    return calls

  } catch (error) {

    console.error(`Erro ao encontrar chamadas ativas da fila : ${error}`);

  }
}


//===============================================================//

/**
 * Retorna todas as chamadas que devem ser mostradas no painel de acordo com a fila.
 * 
 * @param id (Fila do cliente)
 */
export const getPanelByQueue = async (queue: string) => {

  try {

    const response = await prisma.callsHistory.findMany({
      where: {
        queue: queue,
        showOnPanel: true
      }
    })

    if (response) {
      console.log(`Chamada adicionada na tabela da fila ${queue}`)
      return response
    } else {
      console.info("Sem chamadas para visualizar")
    }

  } catch (error) {
    console.error(`Erro ao encontrar chamadas ativas da fila : ${error}`)
    return error
  }

}

//===============================================================//

/**
 * Retorna as chamadas do banco.
 */
export const getCallsHistory = async() => {

  try {

    const allCalls = await prisma.callsHistory.findMany()

    if (allCalls) {
      return allCalls
    } else {
      console.warn("Não foi possível buscar chamadas ou elas não existem.")
      return null
    }

  } catch (error) {
    console.error(`Erro ao buscar chamadas: ${error}`)
  }

}
//===============================================================//

/**
 * Retorna o histórico de chamadas de acordo com a fila do cliente
 * 
 * @param id (O id do cliente)
 * @param client (O nome do cliente)
 * @returns (O histórico)
 */
export const getClientCallHistory = async (id: number, client: string) => {

  try {

    const clients = await prisma.queues.findMany({
      where: {
        clientId: id
      }
    })

    if (!clients || clients.length === 0) {
      console.warn("Sem clientes com esse Id.")
      return null
    }

    const calls: any[] = [];

    for (const client of clients) {
      const newCall = await prisma.callsHistory.findMany({
        where: {
          queue: client.code
        }
      })

      if (!newCall || newCall.length === 0) {
        console.warn(`Sem chamadas para o cliente com código ${client.code}.`)
        continue;
      }

      calls.push(...newCall)
    }

    if (calls.length > 0) {
      calls.forEach((call: any) => {
        console.info(`Todas as chamadas da fila ${call.queue} foram retornadas para ${client}`)
      });
      return calls
    } else {
      console.warn("Não foi possível buscar chamadas ou elas não existem.")
      return null
    }

  } catch (error) {

    console.error(`Erro ao buscar chamadas da fila: ${error}`)
    return null

  }
};

