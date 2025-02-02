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

    const updateData: { status: string; showOnPanel: boolean; holdTime?: string } = {
      status: status,
      showOnPanel: show
    }

    const response = await prisma.callsHistory.update({
      
      data: updateData,
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