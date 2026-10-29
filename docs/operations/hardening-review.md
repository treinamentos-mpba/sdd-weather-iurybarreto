# Hardening — Auditoria e Verificação

Data: 29/10/2026. Escopo: P9.1–P9.6, usando a [spec](../../specs/weather-app-spec.md), o [plano](../../plans/weather-app-plan.md) e o [backlog](../../tasks/weather-app-tasks.md).

## Auditoria de Acessibilidade

Achados da inspeção estática, em ordem de severidade. Não equivalem a uma certificação WCAG 2.2 AA.

| Severidade | Problema identificado | Correção mínima aplicada |
| --- | --- | --- |
| Média | Texto branco no hover da busca com contraste de 3,51:1, abaixo de 4,5:1. | Hover com `accent-700` (5,80:1); normal com `accent-600` (4,58:1). Cálculo de luminância relativa, não inspeção visual de todos os estados. |
| Média | Contorno do input com `white/10` pouco distinguível do fundo. | Borda `white/50`, mantendo label e indicador de foco. |
| Média | Resultados assíncronos sem destino de foco; não havia indicação `aria-busy`. | Foco programático na região de resultados após sucesso, vazio ou erro; foco visível e `aria-busy` na região e na busca. Anúncio de loading em status persistente fora da região ocupada. |
| Média | Campos indisponíveis e nomes longos podiam ultrapassar cartões estreitos. | `min-w-0` e quebra de palavras em cartões/células e nomes. Verificação visual ainda pendente. |
| Baixa | Espaços impediam envio, mas não tinham explicação associada ao campo. | Mensagem pt-BR associada por `aria-describedby`, `aria-invalid` e validação nativa para vazio. |

Semântica já presente e preservada: busca nomeada, label do input, grupo de unidade com `aria-pressed`, seleção por setas, status de loading/vazio, erro com `role="alert"`, botão de retry, skip link e ícones decorativos ocultos de tecnologias assistivas. Foco de botões/input usa ring/outline; animação do spinner respeita movimento reduzido.

Unitários verificam nomes acessíveis, setas, Enter, foco após consulta, `aria-busy`, status e alertas. O roteiro E2E cobre skip link, Tab/Shift+Tab, envio, seleção e troca de unidade por teclado, mas não foi possível executá-lo neste ambiente. Leitor de tela, contraste completo, zoom e foco em navegadores reais ainda exigem revisão manual.

## Resiliência

- Seleção automática do primeiro resultado removida: inclusive um resultado único exige escolha explícita (AC-02.3).
- Timeout de 10 segundos engloba fetch e leitura do JSON, aborta a requisição, limpa o timer e não repete automaticamente. Testes usam relógio controlado, inclusive corpo JSON pendente.
- Erros HTTP não expõem status/corpo técnico na UI; JSON malformado é resposta inválida, não falha de rede.
- Retry repete a última busca ou apenas o Forecast da cidade selecionada. Offline é simulado por rejeição de fetch/service e por `route.abort('internetdisconnected')` no E2E.
- Respostas de seleções anteriores continuam descartadas pelo identificador de requisição; dados antigos são removidos durante uma nova operação.

## Campos Externos e Fallbacks

| Campo Open-Meteo | Tratamento |
| --- | --- |
| `results` ausente, `null` ou `[]` | Lista vazia, mensagem de ausência de resultados, sem Forecast. |
| `id`, `name`, `latitude`, `longitude` | Campos obrigatórios validados; identificador/coordenadas não finitos, coordenadas fora dos limites ou nome vazio geram erro recuperável. |
| `admin1`, `country` | Ausentes/nulos viram `null` e são omitidos do contexto geográfico. Nomes são renderizados como texto React, não HTML. |
| `timezone` ausente | `null`, resposta parcial; não se presume o fuso UTC para a cidade. |
| `current` ausente/nulo/sem dados utilizáveis | Mantém previsão válida e informa “Clima atual indisponível”. |
| `temperature_2m`, `relative_humidity_2m`, `wind_speed_10m`, `precipitation`, `surface_pressure` | Ausentes, nulos, tipos incorretos ou não finitos viram `null`; UI mostra “Indisponível”. |
| `current.time` | Horário ausente ou não formatável mostra “Horário indisponível”. Datas civis não dependem do fuso do navegador; instantes com offset usam o fuso da cidade quando disponível. |
| `weather_code` atual/diário | Ausente vira `null`; desconhecido usa “Condição indisponível” e ícone de fallback. |
| `daily` ou `daily.time` sem calendário utilizável | Mantém clima atual válido e informa “Previsão indisponível”. |
| `daily.time` incompleto | Cinco datas consecutivas a partir da referência válida; nenhuma leitura de valores de outro índice para um dia faltante. |
| `temperature_2m_min`, `temperature_2m_max`, `precipitation_probability_max` diários | Arrays/células ausentes, nulos ou não finitos viram `null`, com fallback por campo. |
| Nenhuma seção utilizável | Erro amigável com nova tentativa manual. |

Precipitação desconhecida **não vira zero**: isso contrariaria o AC-08.4. O teste anterior que exigia zero foi alinhado à spec. Formatadores também recusam valores não finitos, sem deixar `NaN`, `Infinity` ou `undefined` como dados na UI.

## Edge Cases e Rastreabilidade

| Critérios | Evidência automatizada |
| --- | --- |
| AC-01.1–AC-01.4 | Busca, vazio/espaços, Enter, codificação, acentos/hífen/apóstrofo, geocoding sem `results` e texto sem interpretação HTML: SearchBar, service, CityResults e App. E2E complementares preparados. |
| AC-02.1–AC-02.3 | Contexto de cidades homônimas, callback da localização correta e ausência de seleção/Forecast antes da escolha: CityResults e hook. E2E verifica coordenadas escolhidas. |
| AC-03.1–AC-03.2 | Métricas/unidades e refresh substituindo temperatura/horário sem repetir geocoding: CurrentWeather, service e App. |
| AC-04.1–AC-04.2 | Cinco dias, virada de mês, arrays parciais sem deslocamento, temperaturas e probabilidade: service, format e ForecastList. |
| AC-05.1–AC-05.3, AC-06.1 | Conversões, unidade/símbolo, mudança durante loading, remontagem em Celsius e controle acessível. E2E verifica todas as temperaturas e ausência de refetch por troca de unidade. |
| AC-07.1–AC-07.2 | HTML declara `pt-BR`; formatadores e fallback WMO testados. E2E verifica idioma e condição desconhecida. |
| AC-08.1–AC-08.5 | Loading, erro, retry por operação, timeout, resposta parcial e resposta antiga fora de ordem: estados, service, hook e App. |

Lacunas anteriores tratadas nesta etapa: leitura do corpo travada, HTTP 5xx, retry após offline, seção meteorológica ausente, calendário diário incompleto, datas inválidas/fuso do host, temperaturas não finitas, mudança de unidade durante loading e remontagem sem persistência. Os testes existentes de vazio/espaços e caracteres foram preservados e ampliados.

## Performance e UX

- Reutilização de `Intl.NumberFormat` nos formatadores de temperatura e métricas evita reinstanciar esses objetos a cada campo/render.
- Sem `memo`/`useMemo` indiscriminados: há apenas cinco cartões e não foi demonstrado gargalo de renderização.
- Foco nos resultados, busy state, validação associada e hover sem afetar controles desabilitados foram aplicados sem mudar o fluxo de rede por unidade.
- Bundle JavaScript do build: 216,41 kB; 68,21 kB gzip. Essa medida não comprova o p95 de consultas da aplicação.

## Resultado dos Gates

| Verificação | Resultado |
| --- | --- |
| `pnpm lint` | Passou, sem avisos. |
| `pnpm build` | Passou, incluindo TypeScript strict. |
| `pnpm test` | 80 testes passaram em 12 arquivos. |
| Testes de format/CurrentWeather com `TZ=America/Los_Angeles` | 19 passaram. |
| Diagnósticos do editor | Sem erros em código/testes. |
| `pnpm exec playwright test --list` | 34 execuções descobertas: 17 cenários em Chromium e mobile/WebKit. |
| Execução Playwright | Bloqueada no lançamento por `libnspr4.so` ausente; nenhuma asserção de navegador foi validada. |

## Pendências Para Aprovação

**Não é possível confirmar todos os critérios de aceite nesta etapa.** Cobertura escrita/descoberta não equivale a E2E aprovado. As larguras 320/375/768/1024/1440 e o roteiro de teclado estão preparados, mas sua execução e revisão visual seguem pendentes.

Em um terminal com permissão administrativa, instalar as dependências Linux e executar novamente:

```sh
pnpm exec playwright install-deps chromium webkit
pnpm test:e2e
```

Também faltam avaliação manual WCAG/leitor de tela, matriz de navegadores suportados, medições reais de desempenho/disponibilidade e validação de usabilidade. O parecer jurídico/CORS de distribuição continua registrado separadamente na [validação Open-Meteo](open-meteo-validation.md). Esses itens impedem declarar conformidade completa com os RNFs ou liberação para produção.