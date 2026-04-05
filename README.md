
# attention-is-all-you-need-js v7

Versão v7 do laboratório visual de transformers em JavaScript.

## O que mudou na v7
- sampling real para `top-k` e `top-p`
- controle de `seed` para reprodução
- exemplos de prompt por idioma
- player com autoplay
- comparação entre probabilidade global e probabilidade renormalizada dentro do pool candidato
- métricas de latência por passo e média do trace

## Observação
Este pacote foi preparado no ambiente da conversa, mas o build final não foi validado aqui com `npm run build`, porque as dependências não estavam instaladas no container.
