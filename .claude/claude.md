# energy-app-front

> Documento gerado a partir de leitura direta do código. Toda afirmação aqui foi verificada no repositório.
> Para o panorama funcional do app, ver `docs/resumo.md`.

## Visão Geral

Aplicativo móvel **React Native (Expo)** em TypeScript para gerenciamento de consumo de
energia residencial. Backend é **externo** (hospedado em Render); este repositório contém
**apenas o frontend**.

## Arquitetura

Organização por features. Regra central:

- **`app/`** — apenas roteamento e composição de tela. Nenhuma regra de negócio, nenhum
  acesso a API, nenhum componente de feature.
- **`src/modules/<feature>/`** — código exclusivo da feature, agrupado por papel
  (`api/`, `components/`, `context/`, `hooks/`, `styles/`, `constants/`).
- **`src/shared/`** — código transversal reutilizado por 2+ features
  (`api/`, `components/`, `storage/`, `theme/`).

Features que não existem no código não devem ser criadas por convenção de pasta.
Pastas ociosas são removidas, não pré-criadas.

### Estrutura atual

```
app/
├── _layout.tsx                 # Providers globais (Auth, PulseCounter, Theme)
├── index.tsx                   # Redirect inicial por estado de autenticação
├── (auth)/                     # Route group — URLs: /login, /register
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/                     # Route group — URLs: /home, /devices, /analytics, /profile
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── devices.tsx
│   ├── analytics.tsx
│   └── profile.tsx
└── ble/
    └── index.tsx               # URL: /ble  (implementação BLE legada, ver abaixo)

src/
├── modules/
│   ├── auth/
│   │   ├── api/auth.api.ts
│   │   ├── context/AuthContext.tsx
│   │   └── hooks/useAuth.ts
│   ├── ble/
│   │   ├── components/ModalBLEConnection.tsx   # implementação BLE ATIVA
│   │   └── constants/
│   │       ├── esp32Uuids.ts                   # UUIDs da implementação ativa
│   │       └── legacyEsp32Uuids.ts             # UUIDs da implementação legada
│   ├── devices/
│   │   ├── api/devices.api.ts
│   │   ├── components/ModalAddDevice.tsx
│   │   └── styles/deviceStyles.ts
│   ├── energy/
│   │   ├── api/energyReport.api.ts
│   │   ├── components/{EnergyMeter,GraphicMeter,EnergyBarChart,PulseWebSocketLed}.tsx
│   │   ├── context/PulseCounterContext.tsx
│   │   ├── hooks/useEnergyData.ts
│   │   └── styles/{homeStyles,graphicMeterStyles}.ts
│   └── profile/
│       └── styles/profileStyles.ts
└── shared/
    ├── api/http-client.ts       # axios + interceptor de token
    ├── components/{GlobalCard,Header,ModalGlobal,SafeScreen}.tsx
    ├── storage/storage.ts      # abstração sobre AsyncStorage
    └── theme/{ThemeContext.tsx,theme.ts}
```

### Aliases de importação

`tsconfig.json` define `"@/*": ["./src/*"]`. Use sempre alias para código fora da própria
pasta, evitando caminhos relativos longos. Dentro de um mesmo módulo, caminho relativo
é preferível para código irmão.

```
❌ import { useTheme } from "../../shared/theme/ThemeContext";
✅ import { useTheme } from "@/shared/theme/ThemeContext";
```

## Rotas

Route groups **não** aparecem na URL. Nomes de arquivo dentro de `(tabs)`/`(auth)`
correspondem à URL sem o prefixo do grupo.

| Arquivo              | URL          |
| -------------------- | ------------ |
| `app/index.tsx`      | `/`          |
| `app/(auth)/login`   | `/login`     |
| `app/(auth)/register`| `/register`  |
| `app/(tabs)/home`    | `/home`      |
| `app/(tabs)/devices` | `/devices`   |
| `app/(tabs)/analytics` | `/analytics` |
| `app/(tabs)/profile` | `/profile`   |
| `app/ble/index`      | `/ble`       |

`Tabs.Screen name=` deve bater exatamente com o nome do arquivo.

## Fluxo de Autenticação

1. `login`/`register` em `auth.api.ts` chamam o backend e gravam o usuário em
   `storage` sob a chave `@energyapp:currentUser`.
2. O interceptor de `http-client.ts` injeta `Authorization: Bearer <token>` em toda
   requisição, exceto em rotas de login/registro.
3. Em resposta **401**, o interceptor remove a chave de autenticação do storage.
4. `AuthContext` expõe o estado via `useAuthContext()`; `useAuth()` é o hook de
   consumo padrão para outras features.

> O formato do token (JWT ou outro) **não foi verificado** — não há código do backend
> neste repositório. Não assumir.

## BLE — duas implementações coexistem

Isto é intencional e **não deve ser unificado sem decisão explícita**:

| Implementação                     | Local                                     | Uso               |
| --------------------------------- | ----------------------------------------- | ----------------- |
| **Ativa** (feature `ble`)         | `src/modules/ble/components/ModalBLEConnection.tsx` | Modal no Perfil |
| **Legada**                        | `app/ble/index.tsx`                       | Rota `/ble`       |

Cada uma tem seu próprio conjunto de UUIDs em `constants/`. Os valores **não** são
intercambiáveis — não unificar, não "simplificar", não reaproveitar.

Comandos ESP32 e nomes de transação também estão em `constants/esp32Uuids.ts`;
não reintroduzir literais mágicos no meio do código.

## Comandos

```bash
npx expo start          # dev server
npx tsc --noEmit        # typecheck  (não há script dedicado)
npm run lint            # ESLint (config expo)
npx expo-doctor         # saúde das dependências
```

```bash
npm run android
npm run ios
npm run web
```

### Scripts que não funcionam

- `npm run dev` → depende de `server.js`, que **não existe** neste repositório.
- `npm run server` → idem (`node server.js`).
- `express` está em `dependencies` mas não é importado por nenhum arquivo.

## Fatos e Armadilhas Verificadas

1. **API URL é hardcoded** em `src/shared/api/http-client.ts`
   (`https://energy-app-backend-nqub.onrender.com/api`). O `.env` contém `API_URL`
   e é versionado, **mas é inerte**: `react-native-dotenv` está instalado e o
   `env` é carregado no Metro, porém o plugin **não** está configurado no
   `babel.config.js`. Não assuma que `process.env` funciona.
2. **WebSocket do pulso** também tem URL hardcoded, em
   `energy/components/PulseWebSocketLed.tsx`.
3. **`analytics.tsx` usa dados mockados** (hardcoded), sem chamada de API. Não é
   um relatório real.
4. **`profile.tsx` exibe dados estáticos** de nome/e-mail/telefone com fallback, não
   os do usuário autenticado.
5. **"Esqueceu sua senha?"** em `login.tsx` é um `TouchableOpacity` sem handler —
   não há fluxo de recuperação de senha.
6. **`EnergyBarChart.tsx` é órfão** — existe em `src/modules/energy/components/`
   mas nenhum arquivo o importa. Foi movido junto com o resto da feature; se for
   realmente descartado, confirmar antes de remover.
7. **`expo-doctor` reporta 2 falhas pré-existentes**, ambas alheias à arquitetura:
   `react-native-network-info` não testado na New Architecture, e patches de versão
   do SDK Expo desatualizados. Não são regressões.
8. **Lint**: 0 erros, ~31 warnings (variáveis não usadas, `exhaustive-deps`) —
   todos pré-existentes. Baseline é "0 erros", não "0 warnings".
9. **`.expo/types/router.d.ts`** é cache gerado e gitignored. Depois de criar,
   renomear ou remover rotas, ele precisa ser regenerado (`npx expo start`) ou o
   typecheck falha com rotas obsoletas. Um dev server antigo rodando reescreve esse
   cache com a tabela de rotas desatualizada — reinicie-o após mexer nas rotas.
10. **`server.js` não existe**; ver "Scripts que não funcionam".

## Observações de Código

- Uso de `any` e casts em vários pontos (ex.: `(monthData as any)`).
- Sem testes automatizados e sem CI.
- A tela BLE legada mantém `LogBox.ignoreAllLogs()`, mascarando logs do app.
- `Analytics`/`Alerts`: `app/tabs/alerts.md` era um componente React dentro de um
  arquivo `.md`, não importado por nada — foi removido como código morto.

## Regras para Contributions

1. Código de feature vai em `src/modules/<feature>/`, não em `app/`.
2. `app/` só contém rotas, layouts e composição.
3. Código usado por 2+ features vai em `src/shared/`; por exatamente 1, fica no módulo.
4. `shared/` não importa de `modules/`. A dependência aponta no sentido contrário.
5. Não criar pastas vazias, barrels ou abstrações "por padrão" — só quando houver uso.
6. Imports entre features de business podem criar dependência circular; extraia para
   `shared/` ou para um novo módulo.
7. Prefira o alias `@/` a caminhos relativos longos.
8. Não introduzir nova biblioteca de estado, HTTP ou UI sem necessidade concreta.
9. Ao mover/renomear rota, atualizar: nome do arquivo, `Tabs.Screen name=`, todos os
   `router.push/replace` e o cache em `.expo/types`.
10. Ao final, rodar `npx tsc --noEmit`, `npm run lint` e `npx expo-doctor`.