/**
 * Tokenizes a string by converting it to lowercase and extracting all words,
 * including words with international and special characters (like accents and umlauts).
 *
 * @param text - The raw input string (e.g., a search query or document text)
 * @returns An array of normalized, lowercase words
 */
export const tokenize = (text: string): string[] => {
    if (!text) return [];

    // Define what counts as a "word". This regular expression matches 
    // continuous sequences of one or more valid word characters:
    //   - \w : Standard Latin characters, numbers, and underscore (a-z, A-Z, 0-9, _)
    //   - \u00A0-\uD7FF : Most alphabets (Latin with accents, Greek, Cyrillic, Arabic, Hebrew, CJK, etc.)
    //   - \uF900-\uFDCF, \uFDF0-\uFFEF : Additional specialized Unicode ranges
    // Normalize weird delimiters like 'x' used in 'PUBLICATIONxINxGER...'
    // Look for 'x' between uppercase characters and replace it with a space.
    const normalizedText = text.replace(/(?<=[A-Z])x(?=[A-Z])/g, ' ');

    const INTERNATIONAL_WORD_REGEX = /[\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/g;

    const lowercasedText = normalizedText.toLowerCase()
    const extractedWords = lowercasedText.match(INTERNATIONAL_WORD_REGEX);

    return extractedWords || [];
};