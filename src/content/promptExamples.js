
export const PROMPT_EXAMPLES = {
  'pt-BR': [
    'A capital do Brasil é',
    'Alice deu um livro para Bob. Depois ela',
    'Era uma vez uma floresta onde',
  ],
  en: [
    'The capital of France is',
    'Alice gave Bob a book. Then she',
    'Once upon a time in a distant city,',
  ],
  es: [
    'La capital de Francia es',
    'Alicia le dio un libro a Bob. Luego ella',
    'Había una vez un bosque donde',
  ],
  fr: [
    'La capitale de la France est',
    'Alice a donné un livre à Bob. Ensuite elle',
    'Il était une fois une ville où',
  ],
  de: [
    'Die Hauptstadt von Frankreich ist',
    'Alice gab Bob ein Buch. Dann hat sie',
    'Es war einmal eine Stadt, in der',
  ],
};

export function getPromptExamples(locale) {
  return PROMPT_EXAMPLES[locale] ?? PROMPT_EXAMPLES.en;
}
