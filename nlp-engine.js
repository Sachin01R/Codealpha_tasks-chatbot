/**
 * NLPEngine Class
 * 
 * This class handles the core AI logic:
 * 1. Preprocessing: Cleaning and tokenizing text.
 * 2. Vectorization: Converting text into word frequency vectors.
 * 3. Similarity: Calculating Cosine Similarity between two strings.
 */
class NLPEngine {
    constructor() {
        // Common English stop words to filter out (they don't add much meaning)
        this.stopWords = new Set([
            'is', 'the', 'a', 'an', 'are', 'do', 'does', 'how', 'what', 'where', 
            'can', 'i', 'my', 'you', 'to', 'in', 'of', 'for', 'with', 'on', 'at', 'it'
        ]);
    }

    /**
     * Preprocesses the text for comparison.
     * Steps: Lowercase -> Remove Punctuation -> Tokenize -> Filter Stop Words
     */
    preprocess(text) {
        if (!text) return [];

        return text
            .toLowerCase()                                   // 1. Convert to lowercase
            .replace(/[^\w\s]/g, '')                        // 2. Remove punctuation using Regex
            .split(/\s+/)                                   // 3. Tokenize (split into words)
            .filter(word => 
                word.length > 1 &&                          // 4. Remove single letters
                !this.stopWords.has(word)                   // 5. Remove stop words
            );
    }

    /**
     * Calculates Cosine Similarity between two strings.
     * Range: 0 (No similarity) to 1 (Exact match)
     */
    calculateSimilarity(str1, str2) {
        const tokens1 = this.preprocess(str1);
        const tokens2 = this.preprocess(str2);

        // If either is empty after preprocessing, similarity is 0
        if (tokens1.length === 0 || tokens2.length === 0) return 0;

        // Create a unique set of all words from both strings
        const combinedUniqueWords = Array.from(new Set([...tokens1, ...tokens2]));

        // Create frequency vectors
        const vector1 = this.getFrequencyVector(tokens1, combinedUniqueWords);
        const vector2 = this.getFrequencyVector(tokens2, combinedUniqueWords);

        // Calculate Cosine Similarity Formula: (A dot B) / (||A|| * ||B||)
        const dotProduct = vector1.reduce((sum, val, i) => sum + (val * vector2[i]), 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + (val * val), 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + (val * val), 0));

        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        
        return dotProduct / (magnitude1 * magnitude2);
    }

    /**
     * Helper to create a frequency vector based on a global word set
     */
    getFrequencyVector(tokens, combinedUniqueWords) {
        return combinedUniqueWords.map(word => {
            return tokens.filter(t => t === word).length;
        });
    }

    /**
     * Finds the best matching FAQ from the knowledge base
     */
    findBestMatch(userQuery, faqDatabase) {
        let bestMatch = null;
        let highestScore = 0;
        const minimumThreshold = 0.35; // Similarity must be at least 35%

        // Loop through every question in our database
        faqDatabase.forEach(item => {
            const score = this.calculateSimilarity(userQuery, item.question);
            
            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        });

        // Return the best match if it's good enough, otherwise return null
        if (highestScore >= minimumThreshold) {
            return {
                ...bestMatch,
                confidence: highestScore
            };
        }

        return null;
    }
}