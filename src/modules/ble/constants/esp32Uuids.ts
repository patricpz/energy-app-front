/**
 * UUIDs do serviço BLE usado pelo ModalBLEConnection (tela ativa).
 *
 * Firmware do ESP32 pareado com este app.
 * Protocolo: Base64 + JSON com campo `cmd`.
 */

export const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const MESSAGE_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
export const BOX_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a9';

/** Nomes anunciados pelo dispositivo que o app tenta conectar automaticamente. */
export const TARGET_DEVICE_NAMES = ['BLEExample', 'ESP'];

/** Identificadores de transação usados no cancelamento de monitor/desconexão. */
export const TRANSACTIONS = {
  message: 'messagetransaction',
  box: 'boxtransaction',
} as const;

/** Códigos de comando do protocolo JSON trocado com o ESP32. */
export const esp32Commands = {
  error: 1,
  wifiConnected: 2,
  wifiList: 4,
  wifiConnect: 5,
  message: 13,
} as const;

/** Duração do scan BLE antes de parar automaticamente (ms). */
export const SCAN_TIMEOUT_MS = 10000;