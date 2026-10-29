# Backlog de Implementação — Aplicação de Previsão do Tempo

As tarefas estão ordenadas por dependência. T-01 e T-02 podem ocorrer em paralelo. Cada tarefa tem escopo principal, critérios verificáveis, arquivos prováveis, tipo e rastreabilidade com a especificação.

## Entrega 1 — Pré-requisitos e Fundação

### T-01 — Validar acesso e condições da Open-Meteo
- **Descrição:** verificar acesso direto do navegador, CORS, cobertura, limites, atribuição e termos para distribuição pública.
- **Critérios de aceite:** do domínio/origem aprovada, Geocoding e Forecast retornam HTTP 2xx sem erro CORS; `docs/operations/open-meteo-validation.md` registra URLs, data, resultado de CORS e parecer sobre cobertura, limites, termos e atribuição. Sem parecer de conformidade, T-35 permanece bloqueada.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `docs/operations/open-meteo-validation.md`.
- **Tipo:** Infra.
- **Spec:** RF-01, RF-03, RF-04; RNF-04, RNF-05; conformidade da fonte.

### T-02 — Criar pontos de entrada React/Vite
- **Descrição:** criar o ponto de entrada e uma composição mínima da aplicação.
- **Critérios de aceite:** `pnpm dev` abre a aplicação e `pnpm build` conclui sem erro de compilação.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra.
- **Spec:** plataforma web; RNF-01, RNF-06.

### T-03 — Configurar estilos-base do MVP
- **Descrição:** preparar Tailwind e os estilos globais com o tema dark glassmorphism do projeto.
- **Critérios de aceite:** estilos globais são importados e as classes Tailwind geram CSS no build; sem estilos de componentes nesta tarefa.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tailwind.config.js`, `src/styles/index.css`.
- **Tipo:** UI.
- **Spec:** RNF-01, RNF-02.

### T-04 — Preparar setup de testes
- **Descrição:** configurar o setup compartilhado de Vitest e Testing Library.
- **Critérios de aceite:** `pnpm test -- tests/unit/setup.test.ts` passa e valida que Vitest carrega o setup compartilhado sem API externa.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/setup.ts`, `tests/unit/setup.test.ts`.
- **Tipo:** Infra.
- **Spec:** estratégia de testes; RNF-03.

### T-05 — Definir contratos TypeScript do domínio
- **Descrição:** criar `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `WeatherError`, `SearchState` e `WeatherState`.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `WeatherError`, `SearchState` e `WeatherState` têm os campos e estados do plano; campos externos opcionais são `null`; não há `any`; `pnpm build` passa.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Spec:** RF-01–RF-08.

## Entrega 2 — Funções Puras

### T-06 — Implementar conversão de temperatura
- **Descrição:** criar função pura de Celsius para a unidade de apresentação.
- **Critérios de aceite:** testes unitários confirmam `0 °C → 32 °F`, `100 °C → 212 °F`, conversão inversa desses valores e `null → null`; entradas Celsius permanecem inalteradas.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.
- **Spec:** RF-05, RF-06; AC-05.1–AC-05.3, AC-06.1.

### T-07 — Mapear códigos meteorológicos WMO
- **Descrição:** mapear códigos atuais e diários para rótulos pt-BR.
- **Critérios de aceite:** a função mapeia `0` para “Céu limpo”, `61` para “Chuva fraca” e códigos sem mapeamento para “Condição indisponível”; atende códigos atuais e diários.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.
- **Spec:** RF-07; AC-07.2; RNF-08.

### T-08 — Formatar datas e horários locais
- **Descrição:** criar funções puras que formatam datas/horários em pt-BR no fuso da cidade.
- **Critérios de aceite:** com fuso `America/Sao_Paulo`, `2026-10-29` é exibido como `29/10/2026`; horário `2026-10-29T13:15` permanece no dia local esperado; teste de virada de dia usa instante UTC fixo; a função não acessa rede ou estado global.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.
- **Spec:** RF-03, RF-04, RF-07; AC-03.1, AC-04.1; RNF-08.

### T-09 — Testar conversão de unidade
- **Descrição:** testar isoladamente a conversão Celsius/Fahrenheit.
- **Critérios de aceite:** Vitest confirma `0 °C → 32 °F`, `100 °C → 212 °F`, conversão inversa, Celsius sem alteração e `null → null`; não acessa DOM ou rede.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.
- **Spec:** AC-05.1–AC-05.3, AC-06.1.

### T-10 — Testar códigos e formatação pt-BR
- **Descrição:** testar mapeamento WMO e formatação de datas/horários como funções puras.
- **Critérios de aceite:** Vitest confirma os mapeamentos WMO de T-07 e, com relógio/fuso fixos, a data `2026-10-29` como `29/10/2026`, a virada do dia e fim de mês; sem DOM ou rede.
- **Dependências:** T-07, T-08.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`, `tests/unit/format.test.ts`.
- **Tipo:** Test.
- **Spec:** AC-03.1, AC-04.1, AC-07.2, RNF-08.

## Entrega 3 — Serviços Open-Meteo

### T-11 — Implementar geocodificação
- **Descrição:** buscar cidades com `fetch` e `URLSearchParams`, normalizando para `City`.
- **Critérios de aceite:** request contém `name`, `count=10`, `language=pt`, `format=json`; fixture com `São José-dos-Campos` chega codificado e é decodificado sem perda; `id/name/admin1/country/latitude/longitude` mapeiam para `City`; `admin1` ou `country` ausentes viram `null`; `results: []` retorna lista vazia e não chama Forecast.
- **Dependências:** T-01, T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Spec:** RF-01, RF-02; AC-01.1–AC-01.4, AC-02.1–AC-02.3.

### T-12 — Implementar consulta de clima e previsão
- **Descrição:** adicionar Forecast ao serviço e normalizar para `WeatherData`.
- **Critérios de aceite:** request inclui `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `precipitation`, `surface_pressure` e `weather_code` em `current`; inclui mínima, máxima, `precipitation_probability_max` e `weather_code` em `daily`; define Celsius, km/h, mm, `forecast_days=5` e `timezone=auto`; fixture normaliza métricas atuais e cinco `ForecastDay` no fuso local; ausências viram `null`.
- **Dependências:** T-01, T-05, T-07, T-08, T-11.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.
- **Spec:** RF-03, RF-04; AC-03.1–AC-03.2, AC-04.1–AC-04.2.

### T-13 — Testar serviços com `fetch` simulado
- **Descrição:** testar Geocoding e Forecast sem chamar Open-Meteo.
- **Critérios de aceite:** mocks verificam os parâmetros de T-12 e mapeiam umidade, vento, precipitação e pressão para `CurrentWeather`, além de probabilidade diária para cada `ForecastDay`; cobrem payload parcial, vazio, HTTP 429/5xx, rede, resposta inválida, timeout e cancelamento.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.
- **Spec:** AC-01.1–AC-01.4, AC-03.1, AC-04.1–AC-04.2, AC-08.2–AC-08.4.

## Entrega 4 — Componentes de Interface

### T-14 — Criar estados visuais da consulta
- **Descrição:** apresentar carregamento, vazio, erro e parcial em pt-BR.
- **Critérios de aceite:** para `loading`, renderiza indicação de carregamento; para `empty`, informa que não houve resultados; para `error`, mostra mensagem pt-BR e ação de retry; para `partial`, mostra dados disponíveis e “Indisponível” nos ausentes. Estados são distinguíveis por texto e semântica acessível.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `src/components/states/WeatherStatus.tsx`.
- **Tipo:** UI.
- **Spec:** RF-08; AC-01.3, AC-08.1–AC-08.4.

### T-15 — Criar o campo de busca
- **Descrição:** permitir digitar e enviar cidade com validação de campo vazio.
- **Critérios de aceite:** clicar em buscar ou pressionar Enter envia exatamente o valor digitado; vazio/só espaços não chama `onSearch`; input tem label acessível e pode ser operado por teclado.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.
- **Spec:** RF-01; AC-01.1, AC-01.2, AC-01.4.

### T-16 — Criar resultados e seleção de cidades
- **Descrição:** exibir resultados e exigir seleção explícita.
- **Critérios de aceite:** fixture com duas cidades homônimas exibe região/país distintos quando fornecidos; nenhuma aparece selecionada inicialmente; selecionar uma emite exatamente aquele `City`; antes da seleção, `onSelect` não dispara.
- **Dependências:** T-05, T-15.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI.
- **Spec:** RF-02; AC-02.1–AC-02.3.

### T-17 — Criar apresentação do clima atual
- **Descrição:** mostrar hero climático, ícone WMO, condição, horário e métricas atuais.
- **Critérios de aceite:** para props controladas, renderiza temperatura grande na unidade atual, condição/ícone mapeados por `lib/weatherCodes`, horário local, umidade (%), vento (km/h), precipitação da última hora (mm) e pressão à superfície (hPa); campos `null` exibem “Indisponível”; callback de atualizar dispara uma vez.
- **Dependências:** T-05–T-08.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.
- **Spec:** RF-03, RF-06; AC-03.1–AC-03.2, AC-06.1.

### T-18 — Criar ForecastList e ForecastCard
- **Descrição:** mostrar hoje e os quatro dias seguintes em uma lista de cartões diários.
- **Critérios de aceite:** para fixture com cinco `ForecastDay`, `ForecastList` renderiza cinco `ForecastCard` ordenados; cada cartão mostra rótulo do dia de `lib/format`, ícone WMO, máxima/mínima na unidade atual e probabilidade máxima de precipitação (%); `null` aparece como “Indisponível”; grid usa `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`.
- **Dependências:** T-05–T-08.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI.
- **Spec:** RF-04, RF-06; AC-04.1–AC-04.2, AC-06.1.

### T-19 — Criar o controle de unidade
- **Descrição:** alternar temperaturas entre Celsius e Fahrenheit durante a sessão.
- **Critérios de aceite:** renderização inicial seleciona Celsius; alternar para Fahrenheit atualiza a unidade emitida sem mutar o valor em Celsius; ao desmontar/remontar o controle, a unidade inicial é Celsius; seleção opera por teclado.
- **Dependências:** T-05, T-06.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.
- **Spec:** RF-05, RF-06; AC-05.1–AC-05.3, AC-06.1.

### T-20 — Testar busca e seleção
- **Descrição:** testar `SearchBar` e `CityResults`.
- **Critérios de aceite:** Testing Library confirma que vazio não chama `onSearch`; `São José-dos-Campos` chega intacto ao callback; resultados homônimos mantêm contexto distinto; selecionar um item chama `onSelect` uma vez com o `City` correspondente.
- **Dependências:** T-15, T-16.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/CityResults.test.tsx`.
- **Tipo:** Test.
- **Spec:** AC-01.1–AC-01.4, AC-02.1–AC-02.3.

### T-21 — Testar estados visuais
- **Descrição:** testar o componente de status de consulta.
- **Critérios de aceite:** fixtures `loading`, `empty`, `error` e `partial` renderizam mensagens diferentes em pt-BR; erro expõe ação de retry acessível; campo nulo renderiza “Indisponível”.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/WeatherStatus.test.tsx`.
- **Tipo:** Test.
- **Spec:** AC-08.1–AC-08.4.

### T-22 — Testar apresentações de clima e previsão
- **Descrição:** testar `CurrentWeather`, `ForecastList` e `ForecastCard` com props determinísticas.
- **Critérios de aceite:** fixture confirma temperatura/unidade, umidade (%), vento (km/h), precipitação atual (mm) e pressão (hPa); previsão contém cinco cartões ordenados com rótulo de dia, ícone, máxima/mínima e probabilidade máxima de chuva (%); valores nulos mostram “Indisponível”; código desconhecido usa fallback pt-BR.
- **Dependências:** T-17, T-18.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test.
- **Spec:** AC-03.1–AC-03.2, AC-04.1–AC-04.2, AC-06.1.

### T-23 — Testar o controle de unidade
- **Descrição:** testar alternância e reinicialização de unidade.
- **Critérios de aceite:** o controle emite `fahrenheit` após seleção e `celsius` ao voltar; começa em Celsius após remontagem; chamada de rede não faz parte deste teste isolado e é verificada em T-27.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.
- **Spec:** AC-05.1–AC-05.3, AC-06.1.

## Entrega 5 — Estado e Composição

### T-24 — Implementar `useWeather`
- **Descrição:** orquestrar busca, seleção, consulta, atualização manual, estados e cancelamento.
- **Critérios de aceite:** busca faz `idle→loading→success`, `empty` ou `error`; Forecast faz `idle→loading→success`, `partial` ou `error`; 10 segundos produzem timeout; somente retry manual repete chamada; seleção B impede resposta atrasada de A atualizar o estado.
- **Dependências:** T-05, T-11, T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.
- **Spec:** RF-01–RF-08; AC-01.3, AC-03.2, AC-08.1–AC-08.5.

### T-25 — Testar `useWeather`
- **Descrição:** testar transições do hook com serviços simulados.
- **Critérios de aceite:** testes com serviço simulado verificam cada transição declarada em `SearchState` e `WeatherState`; relógio controlado dispara timeout aos 10 s; retry/refresh incrementam chamadas uma vez; resposta atrasada da cidade A não substitui B.
- **Dependências:** T-24.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.
- **Spec:** AC-01.3, AC-03.2, AC-08.1–AC-08.5.

### T-26 — Compor a tela principal
- **Descrição:** conectar os componentes ao hook e aplicar layout responsivo.
- **Critérios de aceite:** busca, seleção e consulta completa podem ser executadas pela aplicação; componentes recebem dados/handlers e não chamam API; loading/empty/error/partial/success aparecem conforme fixtures; alternar unidade não aumenta chamadas Forecast.
- **Dependências:** T-02, T-03, T-14–T-19, T-24.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.
- **Spec:** RF-01–RF-08; RNF-01–RNF-03, RNF-08.

## Entrega 6 — Testes Integrados e Compatibilidade

### T-27 — Testar fluxos E2E principais
- **Descrição:** cobrir jornadas US-01 a US-07 com respostas interceptadas.
- **Critérios de aceite:** Playwright intercepta ambos os endpoints; fixture do fluxo feliz mostra cidade, clima atual e cinco dias; lista vazia não chama Forecast; falha/timeout exibe retry; atualização manual faz uma chamada Forecast; alternar unidade não aumenta chamadas; resposta atrasada da cidade A não substitui B; nenhuma chamada chega à API real.
- **Dependências:** T-26.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Spec:** US-01–US-07; RF-01–RF-08.

### T-28 — Validar viewports responsivos
- **Descrição:** verificar os fluxos principais em mobile, tablet e desktop.
- **Critérios de aceite:** Playwright executa busca, seleção e consulta do clima em viewports de 320 e 375 px; o fluxo também é verificado em 768, 1024 e 1440 px; nenhuma largura tem rolagem horizontal e as ações mobile funcionam por toque.
- **Dependências:** T-26, T-27.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`.
- **Tipo:** Test.
- **Spec:** RNF-01, RNF-02.

### T-29 — Configurar e testar matriz de navegadores
- **Descrição:** configurar projetos Playwright e executar fluxos nos navegadores aprovados.
- **Critérios de aceite:** CI executa os fluxos smoke em Chromium, Firefox e WebKit; Safari no iOS e Chrome no Android são testados em dispositivos reais ou serviço de dispositivos aprovado; registrar navegador, versão, dispositivo, resultado e evidência da execução.
- **Dependências:** T-26, T-27.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.
- **Spec:** RNF-06.

### T-30 — Validar acessibilidade dos fluxos
- **Descrição:** verificar teclado, foco, nomes acessíveis e leitura das telas principais.
- **Critérios de aceite:** busca, seleção, unidade, erro e previsão funcionam por teclado; leitor de tela anuncia rótulos/estados; achados ficam documentados.
- **Dependências:** T-26, T-27.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`, `docs/operations/accessibility-checklist.md`.
- **Tipo:** Test.
- **Spec:** RNF-03; AC-07.1.

## Entrega 7 — Operação e Liberação

### T-31 — Definir medição operacional e privacidade
- **Descrição:** escolher a fonte de métricas e documentar SLI de p95, disponibilidade e taxa de sucesso do provedor.
- **Critérios de aceite:** `docs/operations/monitoring.md` define cálculo e janela de 30 dias para p95 ≤ 2 s e disponibilidade ≥ 99,5%, manutenção excluída, saúde do app versus sucesso do provedor, responsável e limiar de alerta; proíbe texto de busca e identificadores nos eventos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `docs/operations/monitoring.md`.
- **Tipo:** Infra.
- **Spec:** RNF-04, RNF-05, RNF-07.

### T-32 — Configurar monitoramento agregado
- **Descrição:** configurar verificação de disponibilidade e coleta agregada conforme T-31.
- **Critérios de aceite:** uma verificação sintética calcula disponibilidade da página; eventos agregados permitem calcular p95 de consultas bem-sucedidas e falhas do provedor separadamente; amostra de eventos não contém consulta, coordenadas exatas ou identificador; painel/relatório mostra ambos os SLI.
- **Dependências:** T-26, T-31.
- **Arquivos prováveis:** `.github/workflows/availability.yml`, `docs/operations/monitoring.md`.
- **Tipo:** Infra.
- **Spec:** RNF-04, RNF-05, RNF-07.

### T-33 — Executar validação de usabilidade
- **Descrição:** conduzir teste moderado com participantes representativos.
- **Critérios de aceite:** 10 participantes cobrindo os contextos das três personas executam busca, consulta atual e leitura da previsão; ao menos 8 concluem sem ajuda em até 90 segundos cada; registrar conclusão/tempo e bloqueios sem coletar dados pessoais desnecessários.
- **Dependências:** T-27, T-30.
- **Arquivos prováveis:** `docs/research/usability-test.md`.
- **Tipo:** Test.
- **Spec:** RNF-09; US-01–US-03.

### T-34 — Executar gates automatizados
- **Descrição:** executar lint, build, testes unitários e E2E no estado final.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam; resultados ficam registrados.
- **Dependências:** T-09, T-10, T-13, T-20–T-23, T-25, T-27–T-30.
- **Arquivos prováveis:** `.github/workflows/ci.yml`.
- **Tipo:** Test.
- **Spec:** RF-01–RF-08; RNF-03, RNF-06.

### T-35 — Aprovar prontidão para distribuição
- **Descrição:** consolidar os gates técnicos, operacionais e de conformidade antes da publicação.
- **Critérios de aceite:** T-01 e T-28–T-34 concluídas; termos/limites/atribuição Open-Meteo aprovados; nenhum aceite obrigatório pendente.
- **Dependências:** T-01, T-28–T-34.
- **Arquivos prováveis:** `docs/release/go-no-go.md`.
- **Tipo:** Infra.
- **Spec:** RNF-01–RNF-09; conformidade da fonte.

## Rastreabilidade com a Especificação

| Tarefa | Requisitos e critérios relacionados |
| --- | --- |
| T-01 | RF-01, RF-03, RF-04; RNF-04, RNF-05; conformidade da fonte. |
| T-02 | Plataforma web; RNF-01, RNF-06. |
| T-03 | RNF-01, RNF-02. |
| T-04 | Estratégia de testes; RNF-03. |
| T-05 | RF-01–RF-08; contratos de domínio. |
| T-06 | RF-05, RF-06; AC-05.1–AC-05.3, AC-06.1. |
| T-07 | RF-07; AC-07.2; RNF-08. |
| T-08 | RF-03, RF-04, RF-07; AC-03.1, AC-04.1; RNF-08. |
| T-09 | AC-05.1–AC-05.3, AC-06.1, AC-07.2. |
| T-10 | AC-03.1, AC-04.1, RNF-08. |
| T-11 | RF-01; AC-01.1–AC-01.4. |
| T-12 | RF-03, RF-04; AC-03.1–AC-03.2, AC-04.1–AC-04.2; métricas Open-Meteo atuais e diárias. |
| T-13 | RF-01, RF-03, RF-04, RF-08; AC-01.1–AC-01.4, AC-03.1, AC-04.1–AC-04.2, AC-08.2–AC-08.4. |
| T-14 | RF-08; AC-01.3, AC-08.1–AC-08.4. |
| T-15 | RF-01; AC-01.1, AC-01.2, AC-01.4. |
| T-16 | RF-02; AC-02.1–AC-02.3. |
| T-17 | RF-03, RF-06; AC-03.1–AC-03.2, AC-06.1. |
| T-18 | RF-04, RF-06; AC-04.1–AC-04.2, AC-06.1; probabilidade de precipitação diária. |
| T-19 | RF-05, RF-06; AC-05.1–AC-05.3, AC-06.1. |
| T-20 | RF-01, RF-02; AC-01.1–AC-01.4, AC-02.1–AC-02.3. |
| T-21 | RF-08; AC-08.1–AC-08.4. |
| T-22 | RF-03–RF-06; AC-03.1–AC-03.2, AC-04.1–AC-04.2, AC-06.1; métricas atuais e probabilidade diária. |
| T-23 | RF-05, RF-06; AC-05.1–AC-05.3, AC-06.1. |
| T-24 | RF-01–RF-08; AC-01.3, AC-03.2, AC-08.1–AC-08.5. |
| T-25 | RF-08; AC-01.3, AC-08.1–AC-08.5. |
| T-26 | RF-01–RF-08; RNF-01–RNF-03, RNF-08. |
| T-27 | US-01–US-07; RF-01–RF-08. |
| T-28 | RNF-01, RNF-02. |
| T-29 | RNF-06. |
| T-30 | RNF-03; AC-07.1. |
| T-31 | RNF-04, RNF-05, RNF-07. |
| T-32 | RNF-04, RNF-05, RNF-07. |
| T-33 | RNF-09; US-01–US-03. |
| T-34 | RF-01–RF-08; RNF-03, RNF-06. |
| T-35 | RNF-01–RNF-09; conformidade da fonte. |

## Prioridade e Tamanho

**Prioridade:** P0 é necessário para obter o MVP utilizável ou desbloquear sua integração; P1 é hardening obrigatório antes da publicação; P2 seria opcional/pós-lançamento. Não há tarefas P2 neste backlog porque todas as tarefas listadas atendem a requisitos aprovados ou gates de lançamento.

**Tamanho relativo:** P é uma mudança local e de baixa complexidade; M envolve algumas peças relacionadas ou uma integração limitada; G atravessa camadas, plataformas ou vários resultados e deve ser dividida antes de ser atribuída a uma pessoa.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | M |
| T-03 | P0 | M |
| T-04 | P0 | M |
| T-05 | P0 | P |
| T-06 | P0 | P |
| T-07 | P0 | P |
| T-08 | P0 | P |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | P |
| T-15 | P0 | P |
| T-16 | P0 | P |
| T-17 | P0 | P |
| T-18 | P0 | P |
| T-19 | P0 | P |
| T-20 | P0 | M |
| T-21 | P0 | P |
| T-22 | P0 | M |
| T-23 | P0 | P |
| T-24 | P0 | G |
| T-25 | P0 | M |
| T-26 | P0 | G |
| T-27 | P1 | G |
| T-28 | P0 | M |
| T-29 | P1 | G |
| T-30 | P1 | M |
| T-31 | P1 | M |
| T-32 | P1 | G |
| T-33 | P1 | M |
| T-34 | P1 | M |
| T-35 | P1 | P |

T-24, T-26, T-27, T-29 e T-32 são candidatas a desdobramento adicional antes de execução: abrangem múltiplos estados, fluxos, plataformas ou configuração operacional.

## Sequência de Entrega em Fatias Verticais

1. **Fundação:** T-02 a T-05; executar T-01 em paralelo como gate para a integração externa.
2. **Busca visível:** T-11, T-14 a T-16 e T-20, mais uma parte de T-24 para busca/seleção e uma parte de T-26 para compor resultados. Entrega visível: enviar cidade e selecionar o local, inclusive vazio/erro.
3. **Clima atual:** T-12, T-17, T-22 e a parte de T-24/T-26 que liga Forecast ao estado e à tela. Entrega visível: clima atual, horário local e atualização manual.
4. **Previsão e unidades:** T-06 a T-10 quando ainda pendentes, T-18, T-19 e T-23. Entrega visível: cinco resumos diários e alternância °C/°F sem nova chamada.
5. **Estados completos e fluxo integrado:** T-13, T-21, T-25 e T-27; validar vazio, erro, timeout, parcial e respostas fora de ordem.
6. **Hardening e publicação:** T-28 a T-35; fechar responsividade, compatibilidade, acessibilidade, métricas, usabilidade, CI e conformidade do provedor.

Para a segunda fatia produzir algo visível sem esperar pelo Forecast, desdobrar T-24 em estado de busca e estado de clima, e T-26 em composição da busca e composição meteorológica. Manter a dependência Forecast fora da primeira fatia.

## Cobertura por Requisito Funcional

| Requisito funcional | Tarefas de implementação | Tarefas de teste/verificação |
| --- | --- | --- |
| RF-01 — Pesquisar cidades | T-11, T-15, T-24 | T-13, T-20, T-27 |
| RF-02 — Selecionar cidade | T-11, T-16, T-24 | T-13, T-20, T-27 |
| RF-03 — Consultar clima atual | T-12, T-17, T-24 | T-13, T-22, T-25, T-27 |
| RF-04 — Consultar previsão de cinco dias | T-12, T-18, T-24 | T-13, T-22, T-25, T-27 |
| RF-05 — Alternar unidade de temperatura | T-06, T-19, T-26 | T-09, T-23, T-27 |
| RF-06 — Identificar a unidade | T-17, T-18, T-19 | T-22, T-23, T-27 |
| RF-07 — Apresentar conteúdo em pt-BR | T-07, T-08, T-14 | T-10, T-21, T-27 |
| RF-08 — Comunicar estados da consulta | T-14, T-24 | T-13, T-21, T-25, T-27 |