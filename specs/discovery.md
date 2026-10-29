# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação para consulta de informações meteorológicas. Os usuários precisam encontrar cidades, consultar o clima atual e visualizar a previsão dos próximos cinco dias. A interface também deve permitir alternar entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

O briefing define as capacidades principais, mas ainda não detalha a origem dos dados meteorológicos, o comportamento da busca ou quais informações devem compor cada consulta. Os limites numéricos propostos nesta análise são pontos de partida para validação com o negócio, não compromissos já aprovados.

## Personas Propostas

Estas personas são hipóteses para orientar discovery e design; não foram validadas por pesquisa com usuários. As métricas sugeridas devem ser calibradas após entrevistas e testes de usabilidade.

### 1. Marina — organiza a rotina diária

- **Objetivo principal:** consultar as condições do tempo para decidir como se preparar para o dia e planejar os próximos dias.
- **Contexto de uso:** principalmente no celular, em uma consulta rápida pela manhã; pode usar desktop para planejar a semana.
- **Métrica de sucesso para a persona:** encontrar a cidade correta e entender o clima atual e a previsão de cinco dias sem repetir a busca. Pode ser medida pela taxa de conclusão da tarefa e pelo tempo até encontrar essas informações.

### 2. Rafael — planeja uma viagem curta

- **Objetivo principal:** verificar a previsão para a cidade de destino e comparar os dias previstos com o período da viagem.
- **Contexto de uso:** desktop durante o planejamento; celular para consultar novamente antes ou durante o deslocamento.
- **Métrica de sucesso para a persona:** localizar o destino correto e identificar a previsão dos dias relevantes sem confundir datas ou localidade. Pode ser medida pela taxa de acerto em tarefas de busca e interpretação da previsão.

### 3. Joana — coordena atividades ao ar livre

- **Objetivo principal:** consultar as condições atuais e a previsão da cidade onde a atividade ocorrerá para decidir como organizar a agenda.
- **Contexto de uso:** celular, muitas vezes com pouco tempo e possivelmente em uma rede móvel; seleciona a cidade pela busca, sem pressupor localização por GPS.
- **Métrica de sucesso para a persona:** obter as informações da cidade pretendida em uma única consulta e sentir que são suficientes para tomar a decisão. Pode ser medida pela conclusão da tarefa em dispositivo móvel e por uma avaliação de confiança após a consulta.

## Revisão da Classificação

A classificação considera se o item especifica uma capacidade/comportamento do produto (funcional) ou uma qualidade/condição de operação (não-funcional). Alguns itens podem envolver as duas dimensões; a tabela aponta a classificação predominante e eventuais ajustes.

| Item atual | Classificação | Avaliação |
| --- | --- | --- |
| RF-01 — Buscar cidades | Funcional | Correto: define uma ação disponível ao usuário. |
| RF-02 — Exibir clima atual | Funcional | Correto: define informação que o sistema deve apresentar. |
| RF-03 — Exibir previsão de cinco dias | Funcional | Correto: define informação que o sistema deve apresentar. |
| RF-04 — Alternar unidade de temperatura | Funcional | Correto: define uma interação e mudança de apresentação. |
| RF-05 — Usar em dispositivos móveis | Não-funcional | Classificado incorretamente como funcional; descreve compatibilidade e responsividade. |
| RNF-01 — Responsividade | Não-funcional | Correto, mas precisa de dimensões e critérios verificáveis. |
| RNF-02 — Usabilidade móvel | Não-funcional | Correto como qualidade de uso, porém se sobrepõe à responsividade e precisa de critérios mais objetivos. |
| RNF-03 — Clareza da unidade | Funcional | Classificado incorretamente como não-funcional na forma atual: exigir que a unidade seja exibida é um comportamento observável. A qualidade de ser fácil de perceber é usabilidade. |
| RNF-04 — Clareza dos dados | Não-funcional | É uma qualidade de usabilidade, mas “compreensível” é subjetivo e precisa de critérios de aceitação. |

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade e selecione o local desejado para consultar o clima.
- **RF-02 — Exibir clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Exibir previsão:** apresentar a previsão do tempo para os cinco dias seguintes à consulta.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar a exibição da temperatura entre Celsius e Fahrenheit.
- **RF-05 — Identificar a unidade:** exibir junto a cada temperatura sua unidade (°C ou °F), conforme a opção selecionada.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve funcionar em larguras de viewport de 320 px a 1440 px, sem rolagem horizontal na experiência principal. Validar a faixa com os dispositivos suportados pelo produto.
- **RNF-02 — Usabilidade móvel:** busca, seleção de cidade, consulta e alternância de unidade devem poder ser realizadas por toque em telas móveis; validar tamanho mínimo dos alvos interativos conforme a diretriz de acessibilidade escolhida.
- **RNF-03 — Compreensibilidade:** clima atual e previsão devem identificar claramente a cidade, o período e as condições apresentadas. Validar este critério em teste de usabilidade; “compreensível” isoladamente não é mensurável.
- **RNF-04 — Desempenho:** como meta inicial, 95% das buscas devem apresentar os dados meteorológicos ou uma mensagem de falha em até 2 segundos, sob condições de rede e disponibilidade do provedor acordadas. Medir separadamente o tempo do serviço externo.
- **RNF-05 — Acessibilidade:** atender ao nível AA das WCAG 2.2, incluindo navegação por teclado, foco visível, nomes acessíveis para controles e contraste adequado. Confirmar a versão-alvo com o negócio.
- **RNF-06 — Disponibilidade:** como meta inicial, manter a aplicação disponível em pelo menos 99,5% do mês, excluindo manutenção programada acordada. Indisponibilidade do provedor externo deve ser monitorada separadamente e tratada sem travar a interface.
- **RNF-07 — Compatibilidade:** suportar as versões atuais e imediatamente anteriores dos navegadores desktop e móveis definidos pelo produto; a matriz de navegadores permanece a confirmar.

As metas de desempenho, disponibilidade, faixa de viewport e matriz de navegadores são sugestões iniciais. Precisam ser validadas considerando orçamento, provedor meteorológico, público e dispositivos suportados.

## Riscos

As probabilidades são estimativas iniciais de discovery, considerando que o provedor, o público e vários critérios ainda não foram definidos.

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- |
| Técnico / fornecedor | O provedor meteorológico pode ter cobertura insuficiente, limites de uso, custo, licença ou atribuição incompatíveis com o produto. | Alta | Alto: pode inviabilizar a cobertura, elevar custos ou exigir troca da integração após o desenvolvimento. | Comparar provedores antes de fechar a arquitetura; validar cobertura, termos, limites, SLA e custos com uma prova de conceito; manter o acesso ao provedor isolado em um serviço. |
| Técnico / disponibilidade | Falhas, lentidão, limites de requisição ou dados incompletos do provedor podem impedir consultas. | Média | Alto: o usuário pode não conseguir obter clima atual ou previsão. | Definir timeout, tratamento de erro e limites de retentativa; monitorar falhas e latência; considerar cache com horário explícito e uma interface degradada que não apresente dados vencidos como atuais. |
| Produto / busca | Uma cidade homônima ou resultado incorreto pode ser selecionado. | Média | Alto: o usuário recebe informações de outro local e pode perder confiança no produto. | Exibir contexto suficiente (região/estado e país), exigir seleção quando houver ambiguidade e testar nomes duplicados, acentos e variações de entrada. |
| Produto / previsão | “Cinco dias” pode ser interpretado de formas diferentes, inclusive quanto ao dia atual, granularidade e fuso horário. | Alta | Alto: a previsão pode parecer incorreta ou não atender à necessidade, mesmo que os dados da API estejam corretos. | Aprovar a definição de período e granularidade antes da implementação; usar o fuso local da cidade; documentar o comportamento e cobri-lo com testes de datas e limites de dia. |
| Técnico / unidades | Conversão ou rótulos incorretos podem misturar Celsius, Fahrenheit ou outras unidades. | Média | Alto: valores meteorológicos ficam enganosos. | Definir o escopo do seletor e unidade padrão; manter valores internos em uma unidade canônica; centralizar conversões e cobrir valores de limite e arredondamento com testes. |
| Técnico / desempenho | Chamadas externas e redes móveis lentas podem exceder as metas de resposta. | Média | Alto: usuários abandonam a busca ou percebem o app como indisponível. | Medir separadamente latência do app e do provedor em dispositivos/redes representativos; definir orçamento de desempenho; apresentar estado de carregamento e aplicar cache quando compatível com a atualidade dos dados. |
| Técnico / experiência | A interface pode falhar em telas pequenas, navegadores não suportados ou fluxos de teclado/leitor de tela. | Média | Alto: parte dos usuários pode não concluir tarefas, e o app pode não atender às metas de acessibilidade. | Confirmar matriz de dispositivos e padrão de acessibilidade; testar fluxos principais em viewports móveis, navegadores-alvo, teclado e leitor de tela; incluir verificações automatizadas e revisão manual. |
| Técnico / privacidade e segurança | Localização, histórico, credenciais ou dependências podem expor dados ou segredos, especialmente se recursos adicionais forem adotados. | Baixa | Alto: pode causar exposição de dados, incidentes ou obrigações legais e de resposta. | Não coletar localização ou histórico sem necessidade e consentimento; não embutir segredos de servidor no cliente; revisar dependências e políticas de retenção antes de adicionar esses recursos. |
| Produto / escopo | Recursos não solicitados, como GPS, favoritos, login, alertas ou modo offline, podem ser assumidos como parte do MVP. | Alta | Médio a alto: o escopo e o custo crescem, e as funções centrais podem atrasar. | Delimitar o MVP por critérios de aceite; manter recursos não confirmados fora do escopo até aprovação explícita e priorização pelo responsável de produto. |
| Produto / adequação | Campos exibidos, público ou fluxo de busca podem não corresponder ao uso real, pois o briefing não define personas nem métricas de sucesso. | Média | Alto: o app pode ser entregue corretamente e ainda assim não resolver a necessidade do usuário. | Validar hipóteses com usuários representativos; prototipar o fluxo; escolher métricas de sucesso e critérios de aceite antes de comprometer o escopo. |
| Produto / confiança | Uma previsão pode ser interpretada como garantia ou alerta oficial, embora fonte, precisão e responsabilidade não estejam definidos. | Média | Alto: decisões do usuário podem se basear em informação mal interpretada, com risco reputacional e potencial responsabilidade. | Definir fonte e atribuição; mostrar período/atualização e limitações relevantes; não apresentar alertas como oficiais sem fonte e aprovação apropriadas. |
| Técnico / operação | Hospedagem, monitoramento e responsabilidade por disponibilidade ainda não têm dono definido. | Média | Médio a alto: falhas podem passar despercebidas e não haver resposta operacional clara. | Definir equipe responsável, hospedagem, monitoramento, alertas, processo de incidentes e como medir a disponibilidade do app separada da dependência externa. |

## Perguntas em Aberto

As perguntas abaixo cobrem lacunas que podem alterar escopo, arquitetura, custo, experiência ou critérios de aceite. O briefing não confirma respostas para elas; decisões tomadas sem alinhamento devem ser tratadas como suposições, não como requisitos aprovados.

| Área | Pergunta em aberto | Impacto de seguir sem resposta |
| --- | --- | --- |
| Público e objetivo | Quem são os usuários prioritários e em que contexto consultam o clima (planejamento diário, viagem, atividade ao ar livre ou outro)? | A equipe pode otimizar a experiência para o público errado e priorizar informações inadequadas. |
| Sucesso do produto | Como será medido o sucesso do app (por exemplo, consultas concluídas, retorno de usuários ou satisfação)? | Não haverá critério para priorizar decisões, avaliar o lançamento ou saber se o produto atende ao negócio. |
| Plataforma e escopo | “Aplicação” significa um web app responsivo ou também são necessários aplicativos nativos? Quais plataformas entram no primeiro lançamento? | Pode haver divergência de escopo, estimativa, tecnologia e custo de entrega. |
| Busca de cidades | A busca deve aceitar nomes parciais, erros de digitação, acentos e nomes em vários idiomas? Deve sugerir resultados enquanto o usuário digita? | A busca pode parecer quebrada para entradas comuns, retornar resultados inesperados ou exigir retrabalho na interação e integração de geocodificação. |
| Desambiguação | Como diferenciar cidades homônimas (por exemplo, mostrar estado/região e país) e qual local selecionar quando há vários resultados? | O usuário pode consultar a previsão da cidade errada sem perceber. |
| Escopo geográfico | Quais países, regiões, idiomas de nomes de lugares e sistemas de coordenadas precisam ser suportados? | O provedor escolhido pode não cobrir o público ou a busca pode falhar para locais relevantes. |
| Clima atual | Quais campos são obrigatórios (por exemplo, temperatura, condição, sensação térmica, umidade, vento e precipitação)? | O resultado pode ser tecnicamente correto, mas insuficiente para a necessidade do usuário; também afeta o provedor e o layout. |
| Atualidade dos dados | Com que frequência os dados devem ser atualizados? É necessário mostrar horário da última atualização e permitir atualização manual? | Dados antigos podem ser apresentados como atuais, reduzindo confiança e levando a decisões com informação desatualizada. |
| Previsão de cinco dias | A previsão inclui hoje e os quatro dias seguintes; qual fuso horário define “hoje” para a cidade selecionada? | A decisão sobre a contagem está fechada, mas sem um fuso definido usuários em regiões diferentes podem ver datas deslocadas. |
| Granularidade da previsão | A previsão deve ser diária, horária ou ambas? Quais campos e períodos devem aparecer? | A equipe pode entregar um formato que não atende ao uso esperado, com impacto em API, densidade da interface e desempenho. |
| Fuso horário | As datas e os períodos devem seguir o fuso horário da cidade selecionada? Como tratar mudanças de horário e locais próximos a limites de fuso? | Dias da previsão e horários podem aparecer deslocados ou em ordem confusa. |
| Unidades | Celsius é o padrão inicial; o seletor muda apenas a temperatura ou também outras medidas, como vento e precipitação? | O padrão inicial está definido, mas o escopo do seletor ainda pode resultar em medidas misturadas ou inconsistentes. |
| Persistência de preferência | A unidade selecionada deve ser lembrada entre visitas ou dispositivos? A preferência deve seguir o idioma/localidade? | A experiência pode surpreender o usuário, e a equipe pode implementar persistência ou estado que depois precise ser alterado. |
| Localização e personalização | GPS, cidade padrão, cidades favoritas, histórico ou consulta de várias cidades são necessários no primeiro lançamento? | Se incluídos por suposição, aumentam escopo e tratamento de privacidade; se esperados mas omitidos, o produto pode parecer incompleto. |
| Estados de interface | O que deve ocorrer antes da primeira busca e em carregamento, entrada inválida, nenhum resultado, erro do provedor ou limite de requisições? | Estados essenciais ficam indefinidos, causando telas sem orientação e comportamentos inconsistentes. |
| Rede e modo degradado | Deve haver cache, suporte offline ou exibição de dados anteriores quando a rede ou o provedor falhar? Como identificar dados em cache? | O app pode ficar inutilizável em redes instáveis ou exibir dados vencidos como se fossem atuais. |
| Provedor e contrato de dados | Open-Meteo foi escolhido sem API key; sua cobertura, atualização, limites de uso, licença, atribuição e disponibilidade atendem ao produto? | A escolha do provedor está fechada, mas condições incompatíveis ainda podem causar lacunas de cobertura, custos ou retrabalho. |
| Desempenho | A meta inicial de resposta em até 2 segundos no percentil 95 é aceitável? Em quais redes, dispositivos e condições do provedor deve ser medida? | Sem condições de medição acordadas, a meta não pode ser verificada; uma dependência externa lenta pode inviabilizá-la. |
| Disponibilidade | A meta inicial de 99,5% ao mês é adequada? Ela se aplica ao app, ao serviço de dados ou à experiência completa? Como manutenção é contabilizada? | A equipe pode assumir um SLA não aprovado e medir disponibilidade de forma incompatível com a expectativa do negócio. |
| Falhas externas | Que mensagem e alternativa são aceitáveis quando o provedor está indisponível, limita requisições ou retorna dados incompletos? | Não haverá comportamento consistente durante falhas; a indisponibilidade externa pode bloquear toda a experiência. |
| Responsividade | Quais larguras, orientações e tamanhos de tela devem ser suportados? A faixa inicial de 320 px a 1440 px atende aos dispositivos do público? | Conteúdo ou controles podem não caber nos dispositivos reais; a meta de responsividade fica sem um conjunto de validação acordado. |
| Acessibilidade | WCAG 2.2 nível AA é a referência aprovada? Há requisitos específicos para teclado, leitor de tela, contraste, zoom e movimento reduzido? | Pessoas com deficiência podem não conseguir completar tarefas; conformidade e critérios de teste permanecem incertos. |
| Compatibilidade | Quais navegadores, versões, sistemas operacionais e dispositivos fazem parte da matriz de suporte? | Pode haver falhas em ambientes usados pelo público ou esforço excessivo para suportar plataformas que não são prioritárias. |
| Idioma e localização | A UI será pt-BR; quais convenções de data, número, nomes de condições e nomes de cidades devem ser usadas? Há necessidade de outros idiomas no futuro? | O idioma da interface está definido, mas convenções inconsistentes ainda podem confundir datas e dados; suporte tardio a novos idiomas pode exigir retrabalho. |
| Privacidade e contas | Login e persistência no servidor estão descartados; preferências podem ser salvas no dispositivo? GPS, histórico ou outros dados pessoais entram no escopo? | A decisão reduz coleta e armazenamento no servidor, mas persistência local e recursos de localização ainda podem criar riscos de privacidade se forem adicionados sem regras. |
| Segurança | Existem políticas corporativas para dependências, proteção de chaves de API, cabeçalhos, conteúdo externo ou revisão de segurança? | Segredos podem ser expostos, dependências podem violar políticas ou riscos de segurança podem ser descobertos tarde. |
| Conteúdo e responsabilidade | O app é apenas informativo? Deve exibir atribuição, avisos de precisão ou alertas oficiais de risco meteorológico? | Usuários podem interpretar a previsão como alerta oficial ou informação garantida; obrigações legais e de confiança podem ser ignoradas. |
| Identidade e design | Há marca, design system, conteúdo editorial ou padrões corporativos que devem ser seguidos? | A interface pode precisar de reformulação para atender à identidade e às aprovações internas. |
| Lançamento e operação | Onde o app será hospedado, quem o operará e quais requisitos existem para monitoramento, logs, suporte e manutenção? | Disponibilidade, custos, observabilidade e responsabilidade operacional podem ficar sem dono ou incompatíveis com o ambiente corporativo. |
| Critérios de aceite | Quem aprova a entrega e quais cenários demonstram que busca, clima atual, previsão, unidades e uso móvel foram concluídos corretamente? | “Pronto” torna-se subjetivo; produto, desenvolvimento e QA podem discordar sobre o que foi entregue. |

Itens como GPS, favoritos, histórico, modo offline e alertas não são requisitos confirmados pelo briefing; login e persistência no servidor foram explicitamente descartados. As demais funcionalidades continuam fora do escopo até aprovação, e persistência local de preferências ainda precisa de decisão.

## Decisões

| Decisão | Justificativa | Perguntas em aberto resolvidas |
| --- | --- | --- |
| **Fonte de dados: Open-Meteo, sem API key.** | Evita exigir uma chave de API para a integração inicial e simplifica a configuração do produto. | Fecha a escolha do provedor e a necessidade de chave. Permanecem em aberto a adequação da cobertura, atualização, limites de uso, licença, atribuição e disponibilidade para o produto. |
| **Previsão de cinco dias: hoje + quatro dias.** | Define de forma direta a janela de cinco dias incluindo o dia corrente. | Resolve se o dia atual conta e a quantidade de dias seguintes. Ainda é necessário definir qual fuso horário determina “hoje” e a granularidade da previsão. |
| **Unidade padrão: Celsius.** | Estabelece um padrão inicial coerente com a experiência pt-BR esperada. | Resolve a unidade exibida inicialmente. Não define se a alternância afeta apenas temperatura ou também outras medidas, nem se a preferência fica salva no dispositivo. |
| **Sem autenticação e sem persistência de servidor.** | Mantém o acesso direto e evita criar contas ou armazenar dados de usuários no servidor para o escopo atual. | Resolve a necessidade de login e de persistir dados de usuário no servidor. Não decide se preferências serão salvas localmente nem autoriza presumir GPS ou histórico. |
| **Idioma da UI: pt-BR.** | Alinha textos e controles da interface ao idioma definido para o público inicial. | Resolve o idioma principal da interface. Convenções de data/número, localização de dados meteorológicos e eventual suporte futuro a outros idiomas permanecem em aberto. |

## Suposições

- A busca é feita pelo nome da cidade; localização automática por GPS não é requisito confirmado.
- O usuário seleciona uma cidade antes de consultar as informações meteorológicas.
- A aplicação usa Open-Meteo sem API key; cobertura, termos de uso e limites ainda precisam ser validados.
- A previsão inclui o dia corrente e os quatro dias seguintes; o fuso horário que define o dia corrente ainda precisa ser definido.
- Celsius é a unidade inicial, e a alternância entre Celsius e Fahrenheit afeta a apresentação das temperaturas sem alterar a cidade consultada.
- A UI será apresentada em pt-BR; formatos regionais e eventual suporte a outros idiomas ainda precisam ser definidos.
- Não haverá autenticação nem persistência de dados no servidor; eventual persistência local de preferências ainda precisa ser definida.
- “Usar em dispositivos móveis” implica uma interface responsiva com acesso às funcionalidades principais; não implica, por si só, a criação de um aplicativo nativo.
- Requisitos de uso offline e atualização automática não foram estabelecidos pelo briefing.