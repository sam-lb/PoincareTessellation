


// function simplify(word, p, q) {
//     word = word.replaceAll("caca", "").replaceAll("acac", ""); // (r3r2)^2 = 1
//     word = word.replaceAll("cb".repeat(q), "").replaceAll("bc".repeat(q), ""); // (r2r3)^q = 1
//     word = word.replaceAll("ab".repeat(p), "").replaceAll("ba".repeat(p), ""); // (r2r1)^p = 1
//     while (word.length > 1) { // r1^2 = r2^2 = r3^2 = 1
//         let first = word[0], second = word[1];
//         if (first === second) {
//             word = first.concat(word.slice(2, word.length));
//         } else {
//             break;
//         }
//     }
//     return word;
// }

function simplify(word, p, q) {
    word = word.replaceAll("caca", "").replaceAll("acac", ""); // (r3r2)^2 = 1
    word = word.replaceAll("f".repeat(q), "");
    word = word.replaceAll("r".repeat(p), "");
    while (word.length > 1) { // r1^2 = r2^2 = r3^2 = 1
        let first = word[0], second = word[1];
        if ((first === "c" || first === "a") && first === second) {
            word = first.concat(word.slice(2, word.length));
        } else {
            break;
        }
    }
    return word;
}

function generateWords(maxLength, chars, p=5, q=5) {
    const results = {1: chars.split("")};
    for (let k=2; k<=maxLength; k++) {
        results[k] = [];
        for (let chr of chars) {
            for (let word of results[k-1].slice()) {
                const newWord = chr.concat(word);
                const reduced = simplify(newWord, p, q);
                if (reduced.length == newWord.length) {
                    results[k].push(newWord);                    
                }
            }
        }
    }

    let totalWords = 0;
    for (let i=1; i<=maxLength; i++) {
        totalWords += results[i].length;
    }
    return {
        numWords: totalWords,
        words: results
    };
}