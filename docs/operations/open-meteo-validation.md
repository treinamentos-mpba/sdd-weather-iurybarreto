# Validação Open-Meteo — T-01

**Data da verificação:** 2026-10-29 (UTC)  
**Status:** bloqueada para conclusão; evidências técnicas parciais registradas.

## Origem e CORS

- **Remoto:** `https://github.com/treinamentos-mpba/sdd-weather-iurybarreto`
- **Origem de Pages esperada pelo workflow:** `https://treinamentos-mpba.github.io`
- **Aplicação:** `https://treinamentos-mpba.github.io/sdd-weather-iurybarreto/app/`
- **Resultado da página:** HTTP 404. Não há página publicada disponível para executar a verificação no contexto real do app.
- **Navegador local:** não disponível no ambiente. Playwright também não pôde ser carregado porque o pacote não está instalado neste workspace.

Foram feitas requisições GET com o cabeçalho `Origin: https://treinamentos-mpba.github.io`. Os dois endpoints retornaram HTTP 200 e `Access-Control-Allow-Origin: *`:

| Endpoint | Resultado observado |
| --- | --- |
| `https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo&count=1&language=pt&format=json` | HTTP 200, JSON com resultado para São Paulo e cabeçalhos CORS `*`, métodos GET/OPTIONS. |
| `https://api.open-meteo.com/v1/forecast?latitude=-23.55&longitude=-46.63&current=temperature_2m%2Cweather_code&daily=temperature_2m_min%2Ctemperature_2m_max%2Cweather_code&forecast_days=5&timezone=auto&temperature_unit=celsius` | HTTP 200, JSON com `current`, `daily`, timezone `America/Sao_Paulo`, cinco datas e cabeçalhos CORS `*`. |

**Conclusão técnica:** os cabeçalhos das respostas permitem requisições cross-origin GET para qualquer origem. Isso é evidência favorável, mas não substitui um teste de `fetch` em navegador a partir da página publicada. CORS em navegador permanece **não verificado**.

## Termos, limites e atribuição

Páginas oficiais consultadas em 2026-10-29:

- [Termos de uso Open-Meteo](https://open-meteo.com/en/terms), HTTP 200.
- [Planos e preços Open-Meteo](https://open-meteo.com/en/pricing), HTTP 200.
- [Documentação da API](https://open-meteo.com/en/docs), HTTP 200.

O conteúdo consultado informa que:

- O acesso gratuito é para uso **não comercial** e exige atribuição sob CC BY 4.0.
- Os limites publicados para o acesso gratuito incluem até 10.000 chamadas/dia, 5.000/hora e 600/minuto; o serviço gratuito não oferece garantia de disponibilidade.
- Uso comercial requer licença/plano comercial e acesso ao endpoint de cliente com API key.

Como o produto foi solicitado por uma empresa, a classificação do uso e a permissão de distribuição precisam de confirmação formal de jurídico/compliance. Este registro não constitui interpretação nem aprovação legal.

## Próximas ações e decisão

1. Jurídico/compliance deve confirmar se o uso planejado se enquadra nos termos não comerciais ou requer licença comercial, incluindo atribuição e limites.
2. Se uso comercial for necessário, definir plano/licença e revisar a arquitetura para proteger a API key; não embutir a chave em código público do navegador.
3. Após publicar a aplicação em Pages ou homologação, executar um `fetch` real no navegador a partir dessa origem e registrar o resultado CORS.

**Gate:** T-01 permanece **bloqueada** até a aprovação de jurídico/compliance e a verificação CORS em navegador. A resposta HTTP e o cabeçalho CORS foram confirmados por linha de comando, mas não são suficientes para marcar a tarefa como concluída.