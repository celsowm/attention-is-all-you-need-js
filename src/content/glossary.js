export function getGlossary(locale) {
  const dictionaries = {
    'pt-BR': [
      {
        term: 'Token',
        short: 'Uma “peça” de texto que o modelo usa (não é necessariamente uma palavra).',
        detail: 'Tokenizers quebram o texto em subpartes para mapear para ids. Espaços podem virar parte do token.',
      },
      {
        term: 'ID do token',
        short: 'Número que representa um token no vocabulário do modelo.',
        detail: 'O modelo opera em ids; o vocabulário pode ter dezenas de milhares de ids.',
      },
      {
        term: 'Logit',
        short: 'Score bruto (antes do softmax) para cada id do vocabulário.',
        detail: 'Softmax transforma logits em probabilidades. Diferenças pequenas em logits podem virar grandes diferenças em probabilidade.',
      },
      {
        term: 'Probabilidade',
        short: 'Chance (pós-softmax) do próximo token ser um id específico.',
        detail: 'Aqui mostramos a probabilidade no vocabulário inteiro.',
      },
      {
        term: 'Hidden state',
        short: 'Representação interna (vetor) por token ao final das camadas.',
        detail: 'Não é embedding puro: é um estado contextualizado que muda com o contexto e as camadas.',
      },
      {
        term: 'Self-attention',
        short: 'Mecanismo que mistura informação do contexto para atualizar cada token.',
        detail: 'Um token distribui pesos sobre tokens de origem. Heads diferentes podem focar padrões diferentes.',
      },
      {
        term: 'Greedy decoding',
        short: 'Escolhe sempre o token de maior probabilidade/logit.',
        detail: 'É determinístico e simples, mas pode reduzir diversidade. Sampling muda o comportamento.',
      },
    ],
    en: [
      {
        term: 'Token',
        short: 'A piece of text used by the model, not necessarily a full word.',
        detail: 'Tokenizers split text into smaller units and map them to ids. Spaces may be part of the token.',
      },
      {
        term: 'Token ID',
        short: 'A number representing a token inside the model vocabulary.',
        detail: 'The model operates on ids; the vocabulary may contain tens of thousands of them.',
      },
      {
        term: 'Logit',
        short: 'A raw score before softmax for each vocabulary id.',
        detail: 'Softmax converts logits into probabilities. Small logit gaps can become large probability gaps.',
      },
      {
        term: 'Probability',
        short: 'The post-softmax chance of a specific next token id.',
        detail: 'Here we show the probability across the full vocabulary.',
      },
      {
        term: 'Hidden state',
        short: 'An internal vector representation for each token after the layers.',
        detail: 'It is not a pure embedding; it is a contextual state that changes with context and depth.',
      },
      {
        term: 'Self-attention',
        short: 'The mechanism that mixes context information to update each token.',
        detail: 'A token spreads weights over source tokens. Different heads can focus on different patterns.',
      },
      {
        term: 'Greedy decoding',
        short: 'Always picks the highest-probability or highest-logit token.',
        detail: 'It is deterministic and simple, but may reduce diversity. Sampling changes the behavior.',
      },
    ],
    es: [
      {
        term: 'Token',
        short: 'Una pieza de texto usada por el modelo, no necesariamente una palabra completa.',
        detail: 'Los tokenizers dividen el texto en unidades menores y las mapean a ids. Los espacios pueden formar parte del token.',
      },
      {
        term: 'ID del token',
        short: 'Número que representa un token dentro del vocabulario del modelo.',
        detail: 'El modelo opera sobre ids; el vocabulario puede tener decenas de miles.',
      },
      {
        term: 'Logit',
        short: 'Puntaje bruto antes de softmax para cada id del vocabulario.',
        detail: 'Softmax convierte logits en probabilidades. Diferencias pequeñas pueden producir brechas grandes en probabilidad.',
      },
      {
        term: 'Probabilidad',
        short: 'Probabilidad post-softmax de un id concreto como siguiente token.',
        detail: 'Aquí mostramos la probabilidad sobre todo el vocabulario.',
      },
      {
        term: 'Hidden state',
        short: 'Representación vectorial interna de cada token después de las capas.',
        detail: 'No es un embedding puro; es un estado contextualizado que cambia con el contexto y la profundidad.',
      },
      {
        term: 'Self-attention',
        short: 'Mecanismo que mezcla información del contexto para actualizar cada token.',
        detail: 'Un token reparte pesos sobre tokens de origen. Distintas heads pueden enfocarse en patrones distintos.',
      },
      {
        term: 'Greedy decoding',
        short: 'Siempre elige el token con mayor probabilidad o logit.',
        detail: 'Es determinista y simple, pero puede reducir diversidad. Sampling cambia el comportamiento.',
      },
    ],
  };

  return dictionaries[locale] ?? dictionaries.en;
}
