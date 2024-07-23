import io from 'socket.io-client'

import dotenv from 'dotenv';

import { getThisCall, setCallsHistory, updateStatus } from '../models/CallsHistory';
import callType from '../types/call';

dotenv.config();

const url = "http://apimonitor.speakr.com.br:3001"

/**
 * Essa função acessa o servidor que fornece as chamadas de acordo com o evento.
 * 
 * QueueCallerJoin = É quando inicia uma chamada.
 * 
 * QueueCallerAbandon = É quando uma chamada é abandonada antes do agente se conectar.
 * 
 * AgentConnect = É quando uma chamada é atendida.
 * 
 * QueueMemberStatus = Retorna os status da chamada. É utilizado para verificar se a chamada foi encerrada
 * 
 * @returns Os dados da chamada
 */
const getSocket = () => {

  const socket = io(`${url}`, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 30, 
    reconnectionDelay: 5000,  
    reconnectionDelayMax: 10000, 
    randomizationFactor: 0.5
  });

  setInterval(() => {
    socket.emit('ping');
    console.log('Atualizando servidor');
  }, 15000);

  socket.on('connect', async () => {
    console.log(" ")
    console.info("+-----------------+")
    console.info(`| SERVIDOR ONLINE |`)
    console.info("+-----------------+")
    console.log(" ")
  })

  socket.onAny(async (...args) => {

    if (args.length == 1) {
      const event = args[0];
      console.log("Evento não esperado:")
      console.log(event)
      return null
    }

    const queue = args[0];
    const event = args[1];

    if (event.event == "Hangup") {

      if (event.cause == '26'){
        return
      }

      try {

        const callToClose = await getThisCall(event.linkedid)

        if (!callToClose){
          return 
        }

        console.info('---------------------------------------')
        console.info(`Evento de: ${event.event}.`)
        console.info('---------------------------------------')

        if (callToClose?.status == "Abandonado" ){
          console.warn(`A chamda de id ${callToClose.linkId} já foi abandonada na fila ${callToClose.queue}.`)
          return
        }

        if (callToClose?.status == "Chamando"){
          console.warn(`A chamada de id ${callToClose.linkId} ainda está aguardando na fila ${callToClose.queue}.`)
          return
        }

        await updateStatus(event.linkedid, "Encerrado", false)
        const response = await getThisCall(event.linkedid)
        if (response) {

          return response

        } 

      } catch (error) {

        console.error(`Erro: ${error}`)

      }

      return
    }

    if (event.event == "QueueMemberStatus") {
      return null
    }

    if (event.event == "QueueMember"){
      return null
    }

    if(event.event == "QueueParams"){
      return null
    }

    if(event.event == "QueueCallerLeave") {
      return null
    }

    console.info('---------------------------------------')
    console.info(`Evento de ${event.event} na fila ${queue}.`)
    console.info('---------------------------------------')

    if (event.event == "QueueCallerJoin") {


      const call: callType = {
        status: "Chamando",
        queue: event.queue,
        uniqueid: event.uniqueid,
        linkedid: event.linkedid,
        phoneNumber: event?.calleridnum,
        exten: event.exten,
        showOnPanel: true
      }

      try {

        await setCallsHistory(call)
        const response = await getThisCall(call.linkedid)

        if (response) {

          return response

        } else {
          console.warn("Sem retorno do banco de dados.")
        }

      } catch (error) {

        console.error(`Erro: ${error}`)

      }

    } else if (event.event == "QueueCallerAbandon") {

      try {

        await updateStatus(event.linkedid, "Abandonado", false)
        const response = await getThisCall(event.linkedid)

        if (response) {

          return response

        } else {
          console.warn("Sem retorno do banco de dados.")
        }

      } catch (error) {

        console.error(`Erro: ${error}`)

      }

    } else if (event.event == "AgentConnect") {


      try {

        await updateStatus(event.linkedid, "Atendido", true)
        const response = await getThisCall(event.linkedid)
        if (response) {

          return response

        } else {
          console.warn("Sem retorno do banco de dados.")
        }

      } catch (error) {

        console.error(`Erro: ${error}`)

      }

    }

  })

  socket.on('reconnect_attempt', () => {
    console.info('tentativa de reconexão')
  })
  socket.on('reconnect_failed', () => {
    console.warn('falha ao tentar reconectar.')
  })
  socket.on('connect_error', (erro) => {
    console.error(`Erro de conexão: ${erro}`);
  })
  socket.on('error', (erro) => {
    console.error(`Erro no socket: ${erro}`)
  });
  socket.on('disconnect', (motivo) => {
    console.warn(`desconectado por: ${motivo}`)
    console.info('---------------------------------------')
  })

  return socket

}

export { getSocket }