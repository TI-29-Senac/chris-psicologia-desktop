/**
 * @typedef {Object} ElectronAPI
 * @property {(dados: any) => Promise<any>} cadastrarUsuario
 * @property {() => Promise<any[]>} listarUsuarios
 * @property {(id: number|string) => Promise<any>} buscarUsuarioPorId
 * @property {(dados: any) => Promise<any>} editarUsuario
 * @property {(id: number|string) => Promise<any>} excluirUsuario
 * * @property {(dados: any) => Promise<any>} processarPagamento
 * @property {() => Promise<any>} listarPagamentos
 * * @property {() => Promise<{pacientes: any[], profissionais: any[]}>} getDadosFormulario
 * @property {(dados: any) => Promise<any>} cadastrarAgendamento
 * @property {() => Promise<any[]>} listarAgendamentos
 * @property {(id: number|string) => Promise<any>} removerAgendamento
 * @property {(id: number|string) => Promise<any>} buscarAgendamentoPorId
 * @property {(dados: any) => Promise<any>} editarAgendamento
 * @property {(id: number|string) => Promise<any>} cancelarAgendamento
 */

/**
 * @type {Window & { electronAPI: ElectronAPI }}
 */
const w = window;