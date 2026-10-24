/**
 * UUIDs do serviço BLE usado pela tela legada (app/ble/index.tsx).
 *
 * ATENÇÃO: o SERVICE_UUID é igual ao do modal, mas as CHARACTERISTICS são
 * DIFERENTES. Isso indica um firmware antigo. Não unifique com esp32Uuids.ts
 * sem confirmar o firmware do dispositivo — a troca quebra a conexão.
 */

export const LEGACY_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const LEGACY_MESSAGE_UUID = '6d68efe5-04b6-4a85-abc4-c2670b7bf7fd';
export const LEGACY_BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';

/** Nome exato exigido pela tela legada para conectar. */
export const LEGACY_DEVICE_NAME = 'BLEExample';

/** Duração do scan BLE antes de parar automaticamente (ms). */
export const LEGACY_SCAN_TIMEOUT_MS = 5000;

/** Identificadores de transação da tela legada. */
export const LEGACY_TRANSACTIONS = {
  message: 'messagetransaction',
  box: 'boxtransaction',
} as const;