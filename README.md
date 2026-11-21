# Gestão de Foco (Pomodoro)

Aplicação web moderna de temporizador de foco e gerenciamento de tarefas de estudo baseada na técnica Pomodoro. Desenvolvida para proporcionar alta precisão temporal, ciclos customizados e persistência automática no navegador.

---

## Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- Gerenciador de pacotes **npm** (incluso no Node.js)

### Passo a Passo

1. **Clonar ou acessar a pasta do projeto:**
   ```bash
   cd pomodoro
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação será iniciada localmente (geralmente em `http://localhost:5173`). Abra o endereço indicado no seu navegador.

4. **Gerar a versão de produção (Build):**
   ```bash
   npm run build
   ```
   Os artefatos otimizados serão compilados na pasta `dist/`.

5. **Visualizar o build de produção localmente:**
   ```bash
   npm run preview
   ```

---

## Decisões Técnicas Adotadas pela Equipe

### 1. Arquitetura em Camadas e Separação de Responsabilidades (SoC)
O projeto adota uma estrutura modular inspirada em *Clean Architecture*, garantindo que as regras de negócio sejam agnósticas a frameworks de interface:

- **`src/domain/` (Núcleo de Domínio):** Contém a lógica de negócio pura, incluindo o motor de transição de ciclos Pomodoro (`motorCiclos.ts`) e o algoritmo de ordenação de tarefas (`ordenacaoTarefas.ts`). Não possui dependência do React ou do DOM.
- **`src/storage/` (Persistência Local):** Isola todas as operações de leitura, escrita e tratamento de integridade no `localStorage` sob as chaves padronizadas (`pomodoro.presets`, `pomodoro.tarefas` e `pomodoro.sessaoAtiva`).
- **`src/types/` (Camada de Tipagem):** Espelha estritamente o modelo conceitual de dados do sistema com TypeScript, garantindo segurança de tipos em tempo de compilação.
- **`src/utils/` (Utilitários Puros):** Concentra validadores de entrada (VR-01 a VR-08), formatadores de data/tempo e módulo de áudio nativo.
- **`src/components/` (Interface do Usuário):** Componentes React funcionais divididos por contexto funcional (`temporizador/`, `tarefas/`, `presets/` e `comum/`).

---

### 2. Precisão Temporal Baseada em Timestamps Absolutos
Em vez de depender de contadores de intervalo (`setInterval`/`setTimeout`) que sofrem *throttling* ou congelamento quando abas ficam em segundo plano ou o navegador é fechado:
- A aplicação utiliza **timestamps absolutos em milissegundos** (`inicioFaseEm`, `fimFasePrevistoEm`, `pausadaEm`).
- O algoritmo `recalcularSessaoAposInatividade` recalcula matematicamente o avanço sequencial das fases transcorridas enquanto o navegador esteve fechado (RN-07 e RN-08), garantindo que nenhum progresso de estudo seja perdido.
- Durante a execução em tempo real, o cronômetro sincroniza a interface com o relógio do sistema a cada 200 ms (RNF-03).

---

### 3. Snapshot Imutável da Sessão Ativa (RN-05)
Ao iniciar uma sessão de estudo, o sistema captura um **snapshot imutável** dos parâmetros do preset selecionado. Dessa forma, qualquer criação, edição ou exclusão posterior de presets na interface não interfere na sessão em andamento.

---

### 4. Áudio Sintetizado Nativo via Web Audio API
Para atender à emissão de alertas sonoros (RF-14 e RNF-10) sem introduzir dependências de arquivos de áudio externos (que poderiam falhar por rede ou cache offline):
- Os alertas são sintetizados diretamente pelo navegador através de osciladores senoidais com frequências harmônicas (Lá 440 Hz e Mi 659.25 Hz).
- Para contornar as políticas de *autoplay* dos navegadores modernos (R-01), o contexto de áudio é inicializado e destravado no primeiro clique do usuário nos botões de ação.

---

### 5. Isolamento de Modais com React Portals
Para evitar armadilhas de *Stacking Context* do CSS — em que elementos com `position: sticky` ou transformações gráficas na coluna lateral poderiam sobrepor caixas de diálogo:
- Todos os modais (`FormTarefaModal`, `FormPresetModal` e `ModalConfirmacao`) utilizam `createPortal(..., document.body)`, montando-se diretamente na raiz do documento.
- Acompanhados de ciclo de foco por teclado (*Focus Trap* com tecla `Tab`) e fechamento via `Escape` (RNF-07).

---

### 6. Design System e Experiência do Usuário (UI/UX)
- **Tipografia:** Uso da fonte *Plus Jakarta Sans* para a interface e *JetBrains Mono* com numerais tabulares (`tabular-nums`) para o relógio digital, evitando variações de largura durante a contagem dos segundos.
- **Feedback Cromático por Fase:** O display e o fundo da tela adaptam dinamicamente sua aura de cor de acordo com a fase ativa:
  - **Foco:** Carmesim/Rose (`#f43f5e`)
  - **Pausa Curta:** Azul/Ciano (`#38bdf8`)
  - **Pausa Longa:** Verde/Esmeralda (`#34d399`)
- **Acessibilidade:** Suporte completo a navegação por teclado (`:focus-visible`), contraste adequado e atributos semânticos ARIA (`role="progressbar"`, `role="alertdialog"`, `aria-live="polite"`).

---

## Regras de Negócio Implementadas

- **RN-01:** Presets em uso por sessão ativa não podem ser editados nem excluídos.
- **RN-02:** Ao selecionar outro preset, a sessão ativa em andamento é encerrada automaticamente antes da troca.
- **RN-03:** Pular uma fase de foco ou de pausa não incrementa a contagem de ciclos (o avanço de ciclo exige conclusão do tempo integral).
- **RN-04:** Reiniciar ciclos zera a contagem para 1 e retorna ao primeiro ciclo de foco, preservando o preset ativo.
- **RN-05:** Sessão ativa utiliza snapshot imutável dos parâmetros do preset de origem.
- **RN-06:** Sessões pausadas retornam pausadas ao reabrir o navegador, sem avanço automático.
- **RN-07 / RN-08:** Fases vencidas com navegador fechado são recalculadas por timestamps.
- **RN-09:** Tarefas são totalmente desacopladas do temporizador.
- **RN-10:** A ordenação do painel de tarefas é estritamente fixa:
  1. Prioridade decrescente: **Alta** ➔ **Média** ➔ **Baixa**
  2. Estado na ordem: **A fazer** ➔ **Em execução** ➔ **Concluída** ➔ **Cancelada** ➔ **Backlog**
- **RN-11 / RF-20:** Confirmação explícita obrigatória em todas as operações de exclusão ou descarte.
- **RN-12:** Novas tarefas assumem estado `backlog` e prioridade `media` como valores padrão.
- **RN-13:** Emissão de som audível e transição automática ao término de cada fase.

---

## Stack Tecnológica

- **Linguagem:** TypeScript 5.6
- **Biblioteca de UI:** React 18
- **Build Tool:** Vite 5
- **Armazenamento:** Web Storage API (`localStorage`)
- **Áudio:** Web Audio API nativa
