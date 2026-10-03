# Resumo do EnergyApp

## Propósito

App móvel (React Native/Expo) de **monitoramento inteligente de consumo de energia elétrica residencial**, integrado a um dispositivo **ESP32** via Bluetooth BLE. O backend é acessado via REST API e WebSocket em `energy-app-backend-nqub.onrender.com`.

---

## Navegação

```
Root (_layout.tsx)
├── stacks/auth/login.tsx       → Tela de login
├── stacks/auth/register.tsx    → Cadastro com validação de senha e endereço
├── stacks/BLEScreen.tsx        → Tela BLE legada (substituída pelo modal)
└── tabs/
    ├── home.tsx                → Painel principal
    ├── analisty.tsx            → Gráficos de teste (dados mockados)
    ├── devices.tsx             → Gestão de equipamentos domésticos
    └── profile.tsx             → Perfil, tema e configurações BLE
```

---

## Telas

| Tela | O que faz |
|------|-----------|
| **Home** | Exibe medidor digital (kWh), custo mensal, e gráfico de consumo com dados em tempo real via WebSocket |
| **Analisty** | Gráfico de barras com filtro Dia/Semana/Mês/Ano — dados mockados para testes |
| **Devices** | Lista, filtra (ligado/desligado), adiciona e remove equipamentos domésticos via API |
| **Profile** | Nome/e-mail do usuário, toggle de tema claro/escuro, conexão BLE com ESP32, logout |
| **Login** | Autenticação JWT com validação de e-mail/senha |
| **Register** | Cadastro completo com força de senha, endereço e aceite de termos |

---

## Componentes Principais

- **`EnergyMeter`** — Medidor digital estilo eletromecânico com fonte "Digital 7", animação suave de incremento e LED pulsante ao receber pulso WebSocket
- **`GraphicMeter`** — Gráfico de barras com filtros Dia/Mês/Ano, navegação por período e dados reais da API
- **`EnergyBarChart`** — Gráfico de barras puro usando `react-native-gifted-charts` com tooltips ao toque
- **`ModalBLEConnection`** — Modal completo de configuração BLE: escaneia ESP32, envia SSID+senha via BLE (Base64), parseia respostas JSON do device
- **`PulseWebSocketLed`** — Componente invisível que mantém o WebSocket aberto e dispara callbacks a cada pulso recebido
- **`GlobalCard`** — Card reutilizável de métricas (custo, consumo, pico, média)
- **`Header`** — Barra superior com logo "EnergyPro" e ícone de perfil

---

## Serviços (API)

- **`api.ts`** — Axios com interceptor que injeta JWT Bearer automaticamente e trata expiração (401)
- **`auth.ts`** — Login, registro, logout, leitura de usuário via `AsyncStorage`
- **`devices.ts`** — CRUD de equipamentos domésticos por `userId`
- **`energyReport.ts`** — Hierarquia de dados: Anos → Meses → Dias → Horas
- **`notificationsService.ts`** — Arquivo vazio, ainda não implementado

---

## Contextos

| Contexto | Responsabilidade |
|---|---|
| `AuthContext` | Usuário autenticado, login/logout/register |
| `PulseCounterContext` | Contagem de pulsos WebSocket (1 pulso = 0,1 kWh) |
| `ThemeContext` | Tema claro/escuro com toggle em tempo real |

---

## Funcionalidades-Chave

- **BLE** (`react-native-ble-plx`): configura o ESP32 com credenciais Wi-Fi via Bluetooth
- **WebSocket** em tempo real: cada pulso do ESP32 anima o medidor e re-busca dados
- **Gráficos** (`react-native-gifted-charts`): barras e linha com tooltips interativos
- **JWT** armazenado em `AsyncStorage`, injetado automaticamente em todas as requisições
- **Tema dinâmico**: claro (`#2563EB` azul) / escuro (`#00FF87` verde neon)

---

## Tema (`constants/theme.ts`)

| Token | Claro | Escuro |
|-------|-------|--------|
| `background` | `#FFFFFF` | `#0F172A` |
| `card` | `#FFFFFF` | `#1E293B` |
| `primary` | `#2563EB` | `#00FF87` |
| `text` | `#1F2937` | `#FFFFFF` |
| `error` | `#EF4444` | `#EF4444` |
| `success` | `#10B981` | `#10B981` |

---

## Protocolo BLE (ESP32)

- Biblioteca: `react-native-ble-plx`
- Comunicação codificada em **Base64**
- UUIDs: `SERVICE_UUID`, `MESSAGE_UUID`, `BOX_UUID`
- Resposta do ESP32: JSON com `cmd: 1` (erro) ou `cmd: 2` (Wi-Fi conectado com sucesso)
- Ao receber `cmd: 2`, o modal fecha automaticamente e o ESP32 começa a enviar pulsos ao backend via Wi-Fi
