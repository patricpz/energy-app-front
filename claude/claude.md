# energy-app-front - Análise do Projeto

## Visão Geral

Um aplicativo móvel **React Native (Expo)** para gerenciamento de energia residencial com backend próprio, desenvolvido em TypeScript. O aplicativo permite monitoramento de consumo de energia, cadastro de dispositivos elétricos, visualização de relatórios e integração com dispositivos ESP32 via BLE.

## Características Principais

- **Autenticação**: Login/cadastro com token JWT armazenado em AsyncStorage
- **Gerenciamento de Dispositivos**: Cadastro, edição e exclusão de equipamentos residenciais
- **Monitoramento de Energia**: Gráficos de consumo diário/mensal/ano com métricas de custo
- **Conexão BLE**: Integração real com dispositivos ESP32 para leitura de dados
- **Interface Dinâmica**: Suporte a temas claro/escuro com material design
- **Navegação**: File-based routing com Expo Router e tabs bottom

## Arquitetura

### Camadas

1. **Interface do Usuário** (React Native)
   - Componentes reutilizáveis em `app/components/`
   - Contextos de estado (`AuthContext`, `ThemeContext`)
   - Hooks personalizados (`useAuth`, `useEnergyData`)

2. **Camada de Serviços**
   - `api/`: Cliente axios com interceptors de autenticação
   - `auth.ts`: Funções de login, logout, registro e gerenciamento de token
   - `devices.ts`: CRUD de equipamentos elétricos
   - `energyReport.ts`: Relatórios de consumo agrupados por ano/mês/dia

3. **Camada de Navegação**
   - Tabs: Home, Devices, Profile
   - Stacks: Autenticação, BLEScreen

## Tecnologias Utilizadas

### Frontend
- **Framework**: Expo ~54.0.22
- **React**: 19.1.0
- **React Native**: 0.81.5
- **React Navigation**: 7.x (tabs e stack)
- **Expo Router**: Roteamento baseado em arquivos
- **Bibliotecas de UI**: phosphor-react-native, lucide-react-native
- **Gráficos**: react-native-gifted-charts, react-native-svg
- **RTL**: react-native-dotenv para variáveis de ambiente
- **Persistência**: @react-native-async-storage/async-storage
- **BLE**: react-native-ble-plx

### Backend
- **Express**: Servidor Node.js
- **Render.com**: Hospedagem em produção
- **Banco de dados**: Supostamente MongoDB (inferred da estrutura de dados)

### Ferramentas de Desenvolvimento
- **TypeScript**: 5.9.2
- **ESLint**: 9.25.0 com config expo
- **Metro**: Emballamento do React Native
- **Concurrently**: Execução do servidor e frontend juntos

## Estrutura de Pastas

```
app/
├── _layout.tsx              # Layout principal (tabs)
├── index.tsx                # Tela de splash/entrada
├── tabs/                    # Tabs principais
│   ├── home.tsx            # Dashboard com métricas
│   ├── devices.tsx         # Lista de dispositivos
│   ├── profile.tsx         # Perfil do usuário
│   └── analisty.tsx         # Relatórios/analistas
├── stacks/                  # Autenticação e BLE
│   ├── auth/               # Stack de autenticação
│   └── BLEScreen.tsx       # Tela de conexão BLE
├── services/                # Camada de API
│   ├── api.ts               # Cliente HTTP
│   ├── auth.ts              # Funções de auth
│   ├── devices.ts           # API de dispositivos
│   ├── energyReport.ts      # API de relatórios
│   └── notificationsService.ts # Service de notificações
├── context/                 # Contextos de estado global
│   ├── AuthContext.tsx     # Estado de autenticação
│   ├── PulseCounterContext.tsx # Contexto de pulso
│   └── ThemeContext.tsx     # Gerenciamento de tema
├── hooks/                   # Hooks personalizados
│   ├── useAuth.ts           # Hook de autenticação
│   └── useEnergyData.ts     # Hook de dados de energia
├── components/              # Componentes reutilizáveis
└── constants/               # Constantes e tipagens
```

## Fluxo de Autenticação

1. Usuário faz login/registro no backend Express
2. Token JWT e dados do usuário são armazenados em AsyncStorage
3. Interceptor adiciona automaticamente `Bearer token` em requests
4. Token é removido automaticamente em caso de 401
5. `AuthProvider` mantém estado de autenticação global

## Fluxo de Conexão BLE

1. BLEScreen escaneia por dispositivos próximos
2. Conecta ao ESP32 com UUIDs específicos de serviço e características
3. Lê valores iniciais (mensagem e boxvalue) via `readCharacteristicForService`
4. Monitora características com `monitorCharacteristicForService` para receber atualizações em tempo real
5. Envia dados para ESP32 usando `writeCharacteristicWithResponseForDevice`

## Recursos Especiais

### Energy Meter
- Mostra nível de pulso e valor em kWh
- Atualiza via WebSocket (PulseWebSocketLed)
- Formatação dinâmica para valores pequenos (<1kWh)

### ModalAddDevice
- Formulário para cadastrar equipamentos
- Validação de nome, modelo e consumo

### ModalBLEConnection
- Interface para gerenciar conexão BLE no perfil

## Arquivos de Configuração

### package.json
- Script `dev` usa `concurrently` para rodar frontend (Expo) e backend (Express)
- Scripts padrão do Expo para Android, iOS e web

### app.json
- Configuração do Expo com ID do EAS
- Configuração específica para Android/iOS
- UUIDs de plugin para BLE e splash screen

### .env (inferred)
- URL do backend (`https://energy-app-backend-nqub.onrender.com/api`)

## Tópicos de Interesse/Ameaças

### Força
- Boa separação de concerns
- Tratamento robusto de erros com mensagens amigáveis
- Suporte offline (dados locais + flag de conexão)

### Risco/Trabalho
1. **Explosão de Vercel**: Dependência excessiva de componentes/módulos pode aumentar bundle
2. **`server.js` desacoplado**: Uso do concurrently não é padrão Expo, pode causar problemas em builds EAS
3. **API URL hardcoded**: Sem fallback para desenvolvimento local
4. **Dados estáticos no profile**: Nome, email e telefone são fallbacks estáticos
5. **Tipagem 'any'**: Uso de cast `(monthData as any)` em vários locais
6. **Falta de testes**: Sem cobertura de testes para os services
7. **Sem CI/CD**: Apenas configuração para EAS, sem workflow de CI

## Oportunidades de Melhoria

1. **Configuração Multi-environment**: Separar URLs de API por ambiente (dev/prod)
2. **Testes**: Adicionar testes unitários para services e hooks
3. **Type Safety**: Refatorar uso de `any` para tipos mais específicos
4. **Performance**: Configurar tree-shaking e lazy loading
5. **Documentação**: Adicionar documentação para uso do BLE com ESP32
6. **Logs**: Implementar logging estruturado (Sentry, etc.)
7. **Validação de Schema**: Adicionar schema validation para respostas da API

## Comando de Execução

```bash
# Desenvolvimento (frontend + backend juntos)
npm run dev

# Apenas frontend
npx expo start

# Apenas backend
npm run server

# Android
npm run android

# iOS
npm run ios

# Web
npm run web

# Resetar projeto
npm run reset-project
```

## Considerações Finais

Este é um aplicativo React Native bem estruturado, mas com espaço para evoluir em termos de configuração de ambiente, testes e type safety. A integração BLE é um destaque, mostrando capacidade de trabalhar com hardware real via Bluetooth Low Energy.