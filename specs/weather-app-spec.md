# Especificação de Produto — Aplicação de Previsão do Tempo

## Visão Geral (Overview)

O Weather App permite que uma pessoa pesquise uma cidade, consulte suas condições meteorológicas atuais e veja a previsão de cinco dias. A interface é destinada ao público pt-BR, funciona em dispositivos móveis e permite alternar a temperatura entre Celsius e Fahrenheit.

### Decisões confirmadas

- Fonte meteorológica: Open-Meteo, sem API key.
- Busca mundial; resultados mostram cidade, região/estado e país quando disponíveis, e sempre exigem seleção explícita.
- Clima atual: temperatura, condição, horário da observação, umidade relativa (%), vento (km/h), precipitação da última hora (mm) e pressão à superfície (hPa). Previsão: resumo diário de hoje e dos quatro dias seguintes, com mínima, máxima, condição e probabilidade máxima de precipitação (%) por dia; sem previsão horária.
- Datas da previsão usam o fuso local da cidade selecionada.
- Unidade: Celsius por padrão, com alternância para Fahrenheit somente nas temperaturas; a escolha não persiste após recarregar a página.
- Atualização ocorre ao selecionar a cidade ou por ação manual. Não há atualização automática nem cache de dados meteorológicos no MVP; timeout de 10 segundos, sem repetição automática e com nova tentativa manual.
- Idioma da interface, mensagens, datas, números e condições meteorológicas: pt-BR. Código de condição desconhecido é exibido como “Condição indisponível”.
- Plataforma do primeiro lançamento: aplicação web responsiva; aplicativos nativos ficam fora do escopo.
- Sem autenticação, histórico, persistência de dados de usuário no servidor ou telemetria de produto; métricas operacionais são agregadas e não armazenam consultas.
- Metas: tarefas principais sem rolagem horizontal em 320, 375, 768, 1024 e 1440 px; WCAG 2.2 AA; versões atual e anterior de Chrome, Edge, Firefox e Safari em computadores, Safari no iOS e Chrome no Android.
- Desempenho: p95 de consultas meteorológicas bem-sucedidas em até 2 segundos. Disponibilidade da aplicação web: 99,5% ao mês; disponibilidade do provedor é medida separadamente.
- Validação de usabilidade: ao menos 8 de 10 participantes representativos concluem busca, consulta atual e previsão sem ajuda em até 90 segundos.

As personas de rotina diária, planejamento de viagem e coordenação de atividades ao ar livre são hipóteses ainda não validadas com pesquisa.

## Requisitos Funcionais (Functional Requirements)

- **RF-01 — Pesquisar cidades:** a pessoa deve poder enviar um nome de cidade não vazio e receber os locais correspondentes retornados pela busca de Open-Meteo. A consulta deve preservar nomes com acentos, espaços, hífens e apóstrofos; entradas vazias não geram requisição.
- **RF-02 — Selecionar cidade:** a pessoa deve selecionar um local antes da consulta meteorológica. Cada resultado deve usar o identificador ou as coordenadas retornadas pelo serviço; quando houver mais de um resultado, o app não deve selecionar um deles silenciosamente. O contexto geográfico disponível deve ser exibido para ajudar a desambiguar.
- **RF-03 — Consultar clima atual:** após a seleção, a pessoa deve visualizar temperatura, condição, horário da observação, umidade relativa (%), velocidade do vento (km/h), precipitação da última hora (mm) e pressão à superfície (hPa), todos associados à localização escolhida; pode solicitar atualização manual.
- **RF-04 — Consultar previsão de cinco dias:** após a seleção, a pessoa deve visualizar um resumo diário para hoje e os quatro dias seguintes no fuso local da cidade, com temperatura mínima, máxima, condição meteorológica e probabilidade máxima de precipitação (%) em cada data.
- **RF-05 — Alternar unidade de temperatura:** a pessoa deve poder alternar entre Celsius e Fahrenheit para todas as temperaturas exibidas; Celsius é o padrão. A preferência vale durante a sessão e não é salva após recarregar a página.
- **RF-06 — Identificar a unidade:** toda temperatura exibida deve indicar explicitamente °C ou °F, de acordo com a unidade selecionada.
- **RF-07 — Apresentar conteúdo em pt-BR:** textos, rótulos, mensagens, datas, números e descrições meteorológicas devem ser apresentados em português do Brasil. Códigos meteorológicos desconhecidos devem ser identificados como “Condição indisponível”.
- **RF-08 — Comunicar estados da consulta:** a interface deve distinguir carregamento, ausência de resultados, falha, timeout e resposta parcial. Solicitações expiram após 10 segundos, sem repetição automática; a pessoa pode tentar novamente. Respostas de cidades anteriormente selecionadas não podem substituir os dados da seleção atual.

## Histórias de Usuário (User Stories)

- **US-01 — Encontrar o local correto:** Como Marina, quero pesquisar uma cidade e selecionar o local correspondente para consultar o clima da cidade certa. **Requisitos:** RF-01 e RF-02.
- **US-02 — Consultar as condições atuais:** Como Marina, quero ver e atualizar manualmente o clima atual da cidade selecionada para decidir como me preparar para o dia. **Requisito:** RF-03.
- **US-03 — Planejar uma viagem curta:** Como Rafael, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar uma viagem que ocorra dentro desse período. **Requisito:** RF-04.
- **US-04 — Usar a unidade preferida:** Como Joana, quero alternar entre Celsius e Fahrenheit para interpretar rapidamente as temperaturas durante o planejamento das minhas atividades. **Requisito:** RF-05.
- **US-05 — Identificar a unidade exibida:** Como Marina, quero ver °C ou °F junto de cada temperatura para não interpretar o valor na unidade errada. **Requisito:** RF-06.
- **US-06 — Consultar em português:** Como Rafael, quero encontrar controles e informações em pt-BR para entender o produto durante o planejamento da viagem. **Requisito:** RF-07.
- **US-07 — Entender o estado da consulta:** Como Joana, quero receber uma indicação quando a consulta estiver carregando, não encontrar resultados ou falhar para saber o que aconteceu e poder tentar novamente. **Requisito:** RF-08.

## Matriz de Rastreabilidade

| User Story | Critérios de Aceite | Requisitos Não Funcionais relevantes |
| --- | --- | --- |
| US-01 — Encontrar o local correto | AC-01.1–AC-01.4; AC-02.1–AC-02.3 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-06, RNF-07, RNF-08 |
| US-02 — Consultar as condições atuais | AC-03.1–AC-03.2 | RNF-01, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08 |
| US-03 — Planejar uma viagem curta | AC-04.1–AC-04.2 | RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08 |
| US-04 — Usar a unidade preferida | AC-05.1–AC-05.3 | RNF-01, RNF-02, RNF-03, RNF-06, RNF-07 |
| US-05 — Identificar a unidade exibida | AC-06.1 | RNF-01, RNF-03, RNF-08 |
| US-06 — Consultar em português | AC-07.1–AC-07.2 | RNF-03, RNF-08 |
| US-07 — Entender o estado da consulta | AC-01.3, AC-08.1–AC-08.5 | RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07, RNF-08 |

## Critérios de Aceite (Acceptance Criteria)

Cada requisito funcional está coberto por um ou mais cenários. Os termos Given, When e Then identificam, respectivamente, o contexto inicial, a ação e o resultado observável. Os critérios de previsão usam relógio fixo e fuso conhecido no conjunto de teste.

- **AC-01.1 (RF-01)**
	- **Given:** o campo de busca está disponível e contém um nome de cidade com resultados conhecidos na resposta de teste.
	- **When:** a pessoa envia a busca.
	- **Then:** a interface exibe os locais retornados para essa consulta.
- **AC-01.2 (RF-01)**
	- **Given:** o campo de busca contém apenas espaços em branco.
	- **When:** a pessoa tenta enviar a busca.
	- **Then:** a interface solicita um nome de cidade e não envia uma consulta ao serviço de geocodificação.
- **AC-01.3 (RF-01, RF-08)**
	- **Given:** a pessoa pesquisa uma cidade inexistente ou não coberta pelo serviço, e a geocodificação responde com uma lista vazia.
	- **When:** a busca termina.
	- **Then:** a interface informa que não encontrou a cidade, não inicia uma consulta meteorológica e permite corrigir ou refazer a busca.
- **AC-01.4 (RF-01)**
	- **Given:** o campo contém um nome válido com acento, espaço, hífen ou apóstrofo, como “São José-dos-Campos”.
	- **When:** a pessoa envia a busca.
	- **Then:** a consulta é enviada com o valor codificado corretamente, sem remover esses caracteres, e a interface exibe o nome retornado pelo serviço sem interpretá-lo como marcação.
- **AC-02.1 (RF-02)**
	- **Given:** os resultados contêm duas cidades com o mesmo nome e identificadores ou coordenadas diferentes.
	- **When:** a pessoa seleciona um dos resultados.
	- **Then:** a consulta meteorológica usa o identificador ou as coordenadas do resultado selecionado, e a tela identifica esse local.
- **AC-02.2 (RF-02)**
	- **Given:** o resultado selecionado inclui região/estado ou país.
	- **When:** os resultados da busca são exibidos.
	- **Then:** essas informações aparecem junto ao nome da cidade.
- **AC-02.3 (RF-02)**
	- **Given:** a busca retorna um ou mais locais e nenhum foi selecionado.
	- **When:** os resultados são exibidos.
	- **Then:** nenhum local é marcado como selecionado e nenhuma consulta meteorológica é iniciada.
- **AC-03.1 (RF-03)**
	- **Given:** a resposta atual de teste contém temperatura, condição, horário, umidade, velocidade do vento, precipitação e pressão para a cidade selecionada.
	- **When:** a consulta meteorológica termina com sucesso.
	- **Then:** a tela mostra nome da cidade, temperatura/unidade, condição e horário no fuso local, além de umidade em %, vento em km/h, precipitação da última hora em mm e pressão à superfície em hPa.
- **AC-03.2 (RF-03)**
	- **Given:** uma cidade está selecionada e há dados atuais exibidos.
	- **When:** a pessoa solicita atualização manual.
	- **Then:** a aplicação consulta novamente a mesma cidade e substitui os dados e o horário da observação pelos valores da nova resposta.
- **AC-04.1 (RF-04)**
	- **Given:** o relógio do teste está fixado no fuso local da cidade selecionada e a resposta contém dados diários para hoje e os quatro dias seguintes.
	- **When:** a consulta de previsão termina com sucesso.
	- **Then:** a interface exibe exatamente cinco datas consecutivas, começando no dia corrente da cidade e seguindo até quatro dias depois, em ordem cronológica.
- **AC-04.2 (RF-04)**
	- **Given:** a resposta de teste contém mínima, máxima, condição e probabilidade máxima de precipitação para cada uma das cinco datas.
	- **When:** a previsão é exibida.
	- **Then:** cada cartão diário mostra mínima, máxima, condição e probabilidade de precipitação em %, correspondentes à resposta; não são exibidos períodos horários.
- **AC-05.1 (RF-05)**
	- **Given:** a aplicação é aberta ou recarregada após uso anterior em Fahrenheit.
	- **When:** uma temperatura é exibida.
	- **Then:** o valor é apresentado em Celsius.
- **AC-05.2 (RF-05)**
	- **Given:** a resposta de teste contém temperaturas de 0 °C e 100 °C.
	- **When:** a pessoa seleciona Fahrenheit.
	- **Then:** todas as temperaturas atuais e diárias correspondentes são exibidas como 32 °F e 212 °F, sem alterar a cidade selecionada.
- **AC-05.3 (RF-05)**
	- **Given:** os mesmos valores estão sendo exibidos em Fahrenheit.
	- **When:** a pessoa seleciona Celsius.
	- **Then:** os valores voltam a ser exibidos como 0 °C e 100 °C.
- **AC-06.1 (RF-06)**
	- **Given:** a interface exibe temperaturas no clima atual e na previsão.
	- **When:** os dados são renderizados ou a pessoa alterna a unidade.
	- **Then:** toda temperatura visível inclui °C ou °F, e o símbolo corresponde à unidade selecionada.
- **AC-07.1 (RF-07)**
	- **Given:** qualquer tela ou estado da aplicação está visível.
	- **When:** a interface é renderizada.
	- **Then:** todos os textos e mensagens do produto estão em pt-BR e o idioma declarado no documento da página é `pt-BR`.
- **AC-07.2 (RF-07)**
	- **Given:** o serviço meteorológico retorna um código de condição sem rótulo conhecido.
	- **When:** a condição é exibida.
	- **Then:** a interface mostra “Condição indisponível” em pt-BR e não exibe o código bruto.
- **AC-08.1 (RF-08)**
	- **Given:** uma busca ou consulta meteorológica está pendente no serviço de teste.
	- **When:** a pessoa envia a consulta e aguarda a resposta.
	- **Then:** a interface exibe um estado de carregamento até a resposta ser resolvida.
- **AC-08.2 (RF-08)**
	- **Given:** o serviço de busca ou meteorologia responde com erro ou falha de rede.
	- **When:** a consulta termina sem sucesso.
	- **Then:** a interface encerra o carregamento, exibe uma mensagem de erro em pt-BR sem detalhes técnicos brutos, mantém a busca disponível para nova tentativa e não apresenta dados antigos como atuais.
- **AC-08.3 (RF-08)**
	- **Given:** uma busca ou consulta meteorológica permanece pendente.
	- **When:** 10 segundos se passam sem resposta.
	- **Then:** o carregamento termina, uma mensagem de erro recuperável é exibida, nenhuma nova solicitação é enviada automaticamente e a pessoa pode tentar novamente; uma resposta tardia não substitui o estado atual.
- **AC-08.4 (RF-08)**
	- **Given:** a resposta meteorológica contém dados válidos para apenas parte dos campos ou seções solicitados.
	- **When:** a interface exibe o resultado.
	- **Then:** os dados válidos são exibidos; cada campo ausente mostra “Indisponível”, sem ser substituído por zero ou por dados antigos; uma seção válida permanece visível mesmo que outra esteja incompleta.
- **AC-08.5 (RF-08)**
	- **Given:** há uma consulta pendente para a cidade A e a pessoa seleciona a cidade B antes da resposta de A chegar.
	- **When:** a resposta de A chega depois da seleção de B.
	- **Then:** os dados de A não são exibidos; a cidade selecionada continua sendo B e a interface mostra os dados de B ou seu estado de carregamento.

## Requisitos Não Funcionais (Non-Functional Requirements)

- **RNF-01 — Responsividade:** as tarefas principais devem funcionar sem rolagem horizontal em larguras de 320, 375, 768, 1024 e 1440 px.
- **RNF-02 — Usabilidade móvel:** busca, seleção de cidade, consulta e alternância de unidade devem ser concluíveis por toque nos dispositivos suportados; nenhum controle necessário depende exclusivamente de ponteiro ou teclado físico.
- **RNF-03 — Acessibilidade:** conformidade WCAG 2.2 nível AA nos fluxos principais, verificada por teclado e leitor de tela, foco visível, nomes acessíveis e contraste; combinar verificações automatizadas com revisão manual.
- **RNF-04 — Desempenho:** p95 das consultas meteorológicas bem-sucedidas ≤ 2 segundos, do envio da busca até os dados estarem visíveis, calculado em janela móvel de 30 dias nos navegadores suportados. Medir latência e falhas do provedor separadamente; respostas com erro não contam como consultas bem-sucedidas. Usar métricas operacionais agregadas sem registrar texto de busca ou identificador de usuário.
- **RNF-05 — Disponibilidade:** disponibilidade da aplicação web ≥ 99,5% por mês, excluindo manutenção aprovada. A aplicação está disponível quando a página principal carrega e permite enviar uma busca. Medir separadamente a taxa de consultas meteorológicas bem-sucedidas e a disponibilidade do Open-Meteo.
- **RNF-06 — Compatibilidade:** suportar a versão atual e a anterior dos principais navegadores em computadores: Chrome, Edge, Firefox e Safari; em dispositivos móveis: Safari no iOS e Chrome no Android. Validar os fluxos principais em cada ambiente antes do lançamento.
- **RNF-07 — Privacidade:** não exigir conta, não manter histórico de buscas, não registrar o texto pesquisado em telemetria de produto e não persistir dados de usuário no servidor. Métricas operacionais são agregadas e não identificam usuários; a localidade é enviada à Open-Meteo para fornecer os dados solicitados.
- **RNF-08 — Idioma:** textos, mensagens, datas, números e descrições meteorológicas devem seguir pt-BR. Condições conhecidas devem ter rótulos pt-BR; um código meteorológico desconhecido deve resultar em “Condição indisponível”, nunca em código bruto.
- **RNF-09 — Validação de usabilidade:** em um teste com 10 participantes representativos, pelo menos 8 devem concluir busca, consulta do clima atual e leitura da previsão sem ajuda em até 90 segundos por participante.

## Casos Extremos (Edge Cases)

| Caso | Comportamento esperado |
| --- | --- |
| Geocodificação sem resultados | Tratar uma resposta bem-sucedida com lista vazia como ausência de correspondências, inclusive para cidade inexistente ou não coberta. Informar que nenhum local foi encontrado, sugerir conferir a grafia e permitir nova busca. Não afirmar que a cidade não existe em termos absolutos nem iniciar consulta meteorológica sem uma localização selecionada. |
| Input vazio ou só com espaços | Não enviar requisição de geocodificação; solicitar que a pessoa informe uma cidade e manter o campo disponível para correção. |
| Caracteres especiais | Preservar caracteres válidos em nomes de lugares, incluindo acentos, espaços, hífens e apóstrofos, ao pesquisar. Codificar a consulta de forma segura; não interpretar a entrada como marcação ou código. Se não houver correspondência, exibir o estado de ausência de resultados. |
| Falha de API | Em falha de rede, resposta de erro ou limite de requisições, apresentar mensagem em pt-BR, encerrar o carregamento e permitir nova tentativa. Não mostrar a resposta técnica bruta nem apresentar dados de uma consulta anterior como resultado atual. |
| Timeout | Após 10 segundos sem resposta, encerrar o carregamento, apresentar erro recuperável, não repetir automaticamente e permitir nova tentativa manual. Ignorar respostas tardias da tentativa expirada. |
| Resposta parcial | Exibir os campos e seções que chegaram com dados válidos; identificar os campos ausentes como indisponíveis, sem substituí-los por zero ou por dados antigos. Se apenas clima atual ou previsão estiver indisponível, manter visível a outra seção válida e explicar a indisponibilidade da seção faltante. |
| Resposta fora de ordem | Se uma consulta da cidade anterior terminar depois que outra cidade foi selecionada, ignorar a resposta antiga e manter visíveis apenas os dados da seleção mais recente. |

Outros casos a cobrir nos testes incluem mudança de fuso/data, conversão de temperaturas extremas e mudança de unidade durante o carregamento.

## Premissas (Assumptions)

- A busca mundial e a previsão dependem da cobertura e disponibilidade oferecidas pela Open-Meteo; validar termos, limites e atribuição antes da distribuição pública.
- As personas são hipóteses; a validação de usabilidade usa participantes representativos antes do lançamento.
- A disponibilidade da interface e o sucesso das consultas meteorológicas são métricas separadas; falha do provedor não é contabilizada como indisponibilidade da aplicação.
- A topologia da integração será definida no plano técnico, mantendo o comportamento de produto independente dessa decisão.

## Riscos (Risks)

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Termos, limites, cobertura ou atribuição da Open-Meteo são incompatíveis com a distribuição pública. | Média | Alto: pode impedir o lançamento ou exigir mudança do provedor. | Validar os termos e limites com responsável jurídico/compliance antes da publicação; manter a integração isolada para permitir substituição. |
| Erro na conversão de fuso ou na mudança de dia produz datas incorretas na previsão. | Média | Alto: reduz confiança e pode invalidar os critérios de aceite. | Usar o fuso local retornado para a cidade e testar data corrente, virada do dia, fim de mês e transições de horário. |
| Busca ambígua seleciona a cidade errada. | Média | Alto: apresenta dados de outro local sem atender à intenção do usuário. | Exibir contexto geográfico disponível, nunca selecionar silenciosamente resultados múltiplos e testar cidades homônimas e nomes alternativos. |
| Falha ou lentidão do provedor impede consulta. | Média | Alto: o usuário não obtém clima atual ou previsão. | Aplicar timeout de 10 segundos, mensagem recuperável e nova tentativa manual; monitorar latência e taxa de sucesso do provedor. |
| Personas não validadas não representam as necessidades prioritárias. | Média | Alto: o produto pode cumprir requisitos e ainda não resolver a necessidade principal. | Validar os fluxos com participantes representativos e aplicar o critério aprovado de 8 em 10 concluírem as tarefas em até 90 segundos. |
| A aplicação não atinge as metas aprovadas de desempenho, disponibilidade ou acessibilidade. | Média | Alto: pode impedir o lançamento ou excluir usuários. | Testar contra os perfis e critérios definidos antes do lançamento; acompanhar p95, disponibilidade e defeitos de acessibilidade em métricas operacionais. |
| Dados meteorológicos são confundidos com alerta oficial ou garantia. | Baixa | Alto: pode levar a decisões inadequadas e afetar a confiança no produto. | Definir atribuição e avisos apropriados; não oferecer alertas oficiais sem fonte e aprovação específicas. |

## Fora do Escopo (Out of Scope)

- Aplicativos nativos para iOS ou Android no primeiro lançamento.
- Autenticação, contas de usuário ou persistência de dados no servidor.
- Localização automática por GPS.
- Favoritos, histórico de buscas, múltiplas cidades salvas ou sincronização entre dispositivos.
- Alertas meteorológicos, notificações push ou recomendações automatizadas.
- Previsão horária, previsões além de hoje e dos quatro dias seguintes ou métricas além do conjunto aprovado de clima atual (temperatura, condição, horário, umidade, vento, precipitação e pressão) e resumo diário (mínima, máxima, condição e probabilidade de precipitação).
- Atualização meteorológica automática, armazenamento temporário de respostas e modo offline.
- Persistência local da unidade selecionada e telemetria de produto/histórico de consultas.
- Idiomas da interface além de pt-BR no lançamento.

## Perguntas em Aberto (Open Questions)

As decisões de produto e as metas do MVP foram aprovadas. Resta um bloqueio externo antes da distribuição pública:

- **Conformidade da fonte:** responsável jurídico/compliance deve confirmar que os termos, limites, cobertura e requisitos de atribuição da Open-Meteo permitem o uso e a distribuição planejados.

A topologia da integração (chamada direta ao provedor ou serviço intermediário) é uma decisão do plano técnico, não uma pergunta de produto. Registrar no plano como decisão arquitetural, considerando CORS, limites, observabilidade e o requisito de não persistir dados de usuário no servidor.