p5.disableFriendlyErrors = true;
let lastMouseX, lastMouseY, runningTime, plot;
const EPSILON = 0.000001;

const words = {"1": ["a", "b", "c"], "2": ["ab", "ac", "ba", "bc", "ca", "cb"], "3": ["aba", "abc", "aca", "acb", "bab", "bac", "bca", "bcb", "cab", "cac", "cba", "cbc"], "4": ["abab", "abac", "abca", "abcb", "acab", "acac", "acba", "acbc", "baba", "babc", "baca", "bacb", "bcab", "bcac", "bcba", "bcbc", "caba", "cabc", "caca", "cacb", "cbab", "cbac", "cbca", "cbcb"], "5": ["ababa", "ababc", "abaca", "abacb", "abcab", "abcac", "abcba", "abcbc", "acaba", "acabc", "acaca", "acacb", "acbab", "acbac", "acbca", "acbcb", "babab", "babac", "babca", "babcb", "bacab", "bacac", "bacba", "bacbc", "bcaba", "bcabc", "bcaca", "bcacb", "bcbab", "bcbac", "bcbca", "bcbcb", "cabab", "cabac", "cabca", "cabcb", "cacab", "cacac", "cacba", "cacbc", "cbaba", "cbabc", "cbaca", "cbacb", "cbcab", "cbcac", "cbcba", "cbcbc"], "6": ["ababab", "ababac", "ababca", "ababcb", "abacab", "abacac", "abacba", "abacbc", "abcaba", "abcabc", "abcaca", "abcacb", "abcbab", "abcbac", "abcbca", "abcbcb", "acabab", "acabac", "acabca", "acabcb", "acacab", "acacac", "acacba", "acacbc", "acbaba", "acbabc", "acbaca", "acbacb", "acbcab", "acbcac", "acbcba", "acbcbc", "bababa", "bababc", "babaca", "babacb", "babcab", "babcac", "babcba", "babcbc", "bacaba", "bacabc", "bacaca", "bacacb", "bacbab", "bacbac", "bacbca", "bacbcb", "bcabab", "bcabac", "bcabca", "bcabcb", "bcacab", "bcacac", "bcacba", "bcacbc", "bcbaba", "bcbabc", "bcbaca", "bcbacb", "bcbcab", "bcbcac", "bcbcba", "bcbcbc", "cababa", "cababc", "cabaca", "cabacb", "cabcab", "cabcac", "cabcba", "cabcbc", "cacaba", "cacabc", "cacaca", "cacacb", "cacbab", "cacbac", "cacbca", "cacbcb", "cbabab", "cbabac", "cbabca", "cbabcb", "cbacab", "cbacac", "cbacba", "cbacbc", "cbcaba", "cbcabc", "cbcaca", "cbcacb", "cbcbab", "cbcbac", "cbcbca", "cbcbcb"], "7": ["abababa", "abababc", "ababaca", "ababacb", "ababcab", "ababcac", "ababcba", "ababcbc", "abacaba", "abacabc", "abacaca", "abacacb", "abacbab", "abacbac", "abacbca", "abacbcb", "abcabab", "abcabac", "abcabca", "abcabcb", "abcacab", "abcacac", "abcacba", "abcacbc", "abcbaba", "abcbabc", "abcbaca", "abcbacb", "abcbcab", "abcbcac", "abcbcba", "abcbcbc", "acababa", "acababc", "acabaca", "acabacb", "acabcab", "acabcac", "acabcba", "acabcbc", "acacaba", "acacabc", "acacaca", "acacacb", "acacbab", "acacbac", "acacbca", "acacbcb", "acbabab", "acbabac", "acbabca", "acbabcb", "acbacab", "acbacac", "acbacba", "acbacbc", "acbcaba", "acbcabc", "acbcaca", "acbcacb", "acbcbab", "acbcbac", "acbcbca", "acbcbcb", "bababab", "bababac", "bababca", "bababcb", "babacab", "babacac", "babacba", "babacbc", "babcaba", "babcabc", "babcaca", "babcacb", "babcbab", "babcbac", "babcbca", "babcbcb", "bacabab", "bacabac", "bacabca", "bacabcb", "bacacab", "bacacac", "bacacba", "bacacbc", "bacbaba", "bacbabc", "bacbaca", "bacbacb", "bacbcab", "bacbcac", "bacbcba", "bacbcbc", "bcababa", "bcababc", "bcabaca", "bcabacb", "bcabcab", "bcabcac", "bcabcba", "bcabcbc", "bcacaba", "bcacabc", "bcacaca", "bcacacb", "bcacbab", "bcacbac", "bcacbca", "bcacbcb", "bcbabab", "bcbabac", "bcbabca", "bcbabcb", "bcbacab", "bcbacac", "bcbacba", "bcbacbc", "bcbcaba", "bcbcabc", "bcbcaca", "bcbcacb", "bcbcbab", "bcbcbac", "bcbcbca", "bcbcbcb", "cababab", "cababac", "cababca", "cababcb", "cabacab", "cabacac", "cabacba", "cabacbc", "cabcaba", "cabcabc", "cabcaca", "cabcacb", "cabcbab", "cabcbac", "cabcbca", "cabcbcb", "cacabab", "cacabac", "cacabca", "cacabcb", "cacacab", "cacacac", "cacacba", "cacacbc", "cacbaba", "cacbabc", "cacbaca", "cacbacb", "cacbcab", "cacbcac", "cacbcba", "cacbcbc", "cbababa", "cbababc", "cbabaca", "cbabacb", "cbabcab", "cbabcac", "cbabcba", "cbabcbc", "cbacaba", "cbacabc", "cbacaca", "cbacacb", "cbacbab", "cbacbac", "cbacbca", "cbacbcb", "cbcabab", "cbcabac", "cbcabca", "cbcabcb", "cbcacab", "cbcacac", "cbcacba", "cbcacbc", "cbcbaba", "cbcbabc", "cbcbaca", "cbcbacb", "cbcbcab", "cbcbcac", "cbcbcba", "cbcbcbc"], "8": ["abababab", "abababac", "abababca", "abababcb", "ababacab", "ababacac", "ababacba", "ababacbc", "ababcaba", "ababcabc", "ababcaca", "ababcacb", "ababcbab", "ababcbac", "ababcbca", "ababcbcb", "abacabab", "abacabac", "abacabca", "abacabcb", "abacacab", "abacacac", "abacacba", "abacacbc", "abacbaba", "abacbabc", "abacbaca", "abacbacb", "abacbcab", "abacbcac", "abacbcba", "abacbcbc", "abcababa", "abcababc", "abcabaca", "abcabacb", "abcabcab", "abcabcac", "abcabcba", "abcabcbc", "abcacaba", "abcacabc", "abcacaca", "abcacacb", "abcacbab", "abcacbac", "abcacbca", "abcacbcb", "abcbabab", "abcbabac", "abcbabca", "abcbabcb", "abcbacab", "abcbacac", "abcbacba", "abcbacbc", "abcbcaba", "abcbcabc", "abcbcaca", "abcbcacb", "abcbcbab", "abcbcbac", "abcbcbca", "abcbcbcb", "acababab", "acababac", "acababca", "acababcb", "acabacab", "acabacac", "acabacba", "acabacbc", "acabcaba", "acabcabc", "acabcaca", "acabcacb", "acabcbab", "acabcbac", "acabcbca", "acabcbcb", "acacabab", "acacabac", "acacabca", "acacabcb", "acacacab", "acacacac", "acacacba", "acacacbc", "acacbaba", "acacbabc", "acacbaca", "acacbacb", "acacbcab", "acacbcac", "acacbcba", "acacbcbc", "acbababa", "acbababc", "acbabaca", "acbabacb", "acbabcab", "acbabcac", "acbabcba", "acbabcbc", "acbacaba", "acbacabc", "acbacaca", "acbacacb", "acbacbab", "acbacbac", "acbacbca", "acbacbcb", "acbcabab", "acbcabac", "acbcabca", "acbcabcb", "acbcacab", "acbcacac", "acbcacba", "acbcacbc", "acbcbaba", "acbcbabc", "acbcbaca", "acbcbacb", "acbcbcab", "acbcbcac", "acbcbcba", "acbcbcbc", "babababa", "babababc", "bababaca", "bababacb", "bababcab", "bababcac", "bababcba", "bababcbc", "babacaba", "babacabc", "babacaca", "babacacb", "babacbab", "babacbac", "babacbca", "babacbcb", "babcabab", "babcabac", "babcabca", "babcabcb", "babcacab", "babcacac", "babcacba", "babcacbc", "babcbaba", "babcbabc", "babcbaca", "babcbacb", "babcbcab", "babcbcac", "babcbcba", "babcbcbc", "bacababa", "bacababc", "bacabaca", "bacabacb", "bacabcab", "bacabcac", "bacabcba", "bacabcbc", "bacacaba", "bacacabc", "bacacaca", "bacacacb", "bacacbab", "bacacbac", "bacacbca", "bacacbcb", "bacbabab", "bacbabac", "bacbabca", "bacbabcb", "bacbacab", "bacbacac", "bacbacba", "bacbacbc", "bacbcaba", "bacbcabc", "bacbcaca", "bacbcacb", "bacbcbab", "bacbcbac", "bacbcbca", "bacbcbcb", "bcababab", "bcababac", "bcababca", "bcababcb", "bcabacab", "bcabacac", "bcabacba", "bcabacbc", "bcabcaba", "bcabcabc", "bcabcaca", "bcabcacb", "bcabcbab", "bcabcbac", "bcabcbca", "bcabcbcb", "bcacabab", "bcacabac", "bcacabca", "bcacabcb", "bcacacab", "bcacacac", "bcacacba", "bcacacbc", "bcacbaba", "bcacbabc", "bcacbaca", "bcacbacb", "bcacbcab", "bcacbcac", "bcacbcba", "bcacbcbc", "bcbababa", "bcbababc", "bcbabaca", "bcbabacb", "bcbabcab", "bcbabcac", "bcbabcba", "bcbabcbc", "bcbacaba", "bcbacabc", "bcbacaca", "bcbacacb", "bcbacbab", "bcbacbac", "bcbacbca", "bcbacbcb", "bcbcabab", "bcbcabac", "bcbcabca", "bcbcabcb", "bcbcacab", "bcbcacac", "bcbcacba", "bcbcacbc", "bcbcbaba", "bcbcbabc", "bcbcbaca", "bcbcbacb", "bcbcbcab", "bcbcbcac", "bcbcbcba", "bcbcbcbc", "cabababa", "cabababc", "cababaca", "cababacb", "cababcab", "cababcac", "cababcba", "cababcbc", "cabacaba", "cabacabc", "cabacaca", "cabacacb", "cabacbab", "cabacbac", "cabacbca", "cabacbcb", "cabcabab", "cabcabac", "cabcabca", "cabcabcb", "cabcacab", "cabcacac", "cabcacba", "cabcacbc", "cabcbaba", "cabcbabc", "cabcbaca", "cabcbacb", "cabcbcab", "cabcbcac", "cabcbcba", "cabcbcbc", "cacababa", "cacababc", "cacabaca", "cacabacb", "cacabcab", "cacabcac", "cacabcba", "cacabcbc", "cacacaba", "cacacabc", "cacacaca", "cacacacb", "cacacbab", "cacacbac", "cacacbca", "cacacbcb", "cacbabab", "cacbabac", "cacbabca", "cacbabcb", "cacbacab", "cacbacac", "cacbacba", "cacbacbc", "cacbcaba", "cacbcabc", "cacbcaca", "cacbcacb", "cacbcbab", "cacbcbac", "cacbcbca", "cacbcbcb", "cbababab", "cbababac", "cbababca", "cbababcb", "cbabacab", "cbabacac", "cbabacba", "cbabacbc", "cbabcaba", "cbabcabc", "cbabcaca", "cbabcacb", "cbabcbab", "cbabcbac", "cbabcbca", "cbabcbcb", "cbacabab", "cbacabac", "cbacabca", "cbacabcb", "cbacacab", "cbacacac", "cbacacba", "cbacacbc", "cbacbaba", "cbacbabc", "cbacbaca", "cbacbacb", "cbacbcab", "cbacbcac", "cbacbcba", "cbacbcbc", "cbcababa", "cbcababc", "cbcabaca", "cbcabacb", "cbcabcab", "cbcabcac", "cbcabcba", "cbcabcbc", "cbcacaba", "cbcacabc", "cbcacaca", "cbcacacb", "cbcacbab", "cbcacbac", "cbcacbca", "cbcacbcb", "cbcbabab", "cbcbabac", "cbcbabca", "cbcbabcb", "cbcbacab", "cbcbacac", "cbcbacba", "cbcbacbc", "cbcbcaba", "cbcbcabc", "cbcbcaca", "cbcbcacb", "cbcbcbab", "cbcbcbac", "cbcbcbca", "cbcbcbcb"], "9": ["ababababa", "ababababc", "abababaca", "abababacb", "abababcab", "abababcac", "abababcba", "abababcbc", "ababacaba", "ababacabc", "ababacaca", "ababacacb", "ababacbab", "ababacbac", "ababacbca", "ababacbcb", "ababcabab", "ababcabac", "ababcabca", "ababcabcb", "ababcacab", "ababcacac", "ababcacba", "ababcacbc", "ababcbaba", "ababcbabc", "ababcbaca", "ababcbacb", "ababcbcab", "ababcbcac", "ababcbcba", "ababcbcbc", "abacababa", "abacababc", "abacabaca", "abacabacb", "abacabcab", "abacabcac", "abacabcba", "abacabcbc", "abacacaba", "abacacabc", "abacacaca", "abacacacb", "abacacbab", "abacacbac", "abacacbca", "abacacbcb", "abacbabab", "abacbabac", "abacbabca", "abacbabcb", "abacbacab", "abacbacac", "abacbacba", "abacbacbc", "abacbcaba", "abacbcabc", "abacbcaca", "abacbcacb", "abacbcbab", "abacbcbac", "abacbcbca", "abacbcbcb", "abcababab", "abcababac", "abcababca", "abcababcb", "abcabacab", "abcabacac", "abcabacba", "abcabacbc", "abcabcaba", "abcabcabc", "abcabcaca", "abcabcacb", "abcabcbab", "abcabcbac", "abcabcbca", "abcabcbcb", "abcacabab", "abcacabac", "abcacabca", "abcacabcb", "abcacacab", "abcacacac", "abcacacba", "abcacacbc", "abcacbaba", "abcacbabc", "abcacbaca", "abcacbacb", "abcacbcab", "abcacbcac", "abcacbcba", "abcacbcbc", "abcbababa", "abcbababc", "abcbabaca", "abcbabacb", "abcbabcab", "abcbabcac", "abcbabcba", "abcbabcbc", "abcbacaba", "abcbacabc", "abcbacaca", "abcbacacb", "abcbacbab", "abcbacbac", "abcbacbca", "abcbacbcb", "abcbcabab", "abcbcabac", "abcbcabca", "abcbcabcb", "abcbcacab", "abcbcacac", "abcbcacba", "abcbcacbc", "abcbcbaba", "abcbcbabc", "abcbcbaca", "abcbcbacb", "abcbcbcab", "abcbcbcac", "abcbcbcba", "abcbcbcbc", "acabababa", "acabababc", "acababaca", "acababacb", "acababcab", "acababcac", "acababcba", "acababcbc", "acabacaba", "acabacabc", "acabacaca", "acabacacb", "acabacbab", "acabacbac", "acabacbca", "acabacbcb", "acabcabab", "acabcabac", "acabcabca", "acabcabcb", "acabcacab", "acabcacac", "acabcacba", "acabcacbc", "acabcbaba", "acabcbabc", "acabcbaca", "acabcbacb", "acabcbcab", "acabcbcac", "acabcbcba", "acabcbcbc", "acacababa", "acacababc", "acacabaca", "acacabacb", "acacabcab", "acacabcac", "acacabcba", "acacabcbc", "acacacaba", "acacacabc", "acacacaca", "acacacacb", "acacacbab", "acacacbac", "acacacbca", "acacacbcb", "acacbabab", "acacbabac", "acacbabca", "acacbabcb", "acacbacab", "acacbacac", "acacbacba", "acacbacbc", "acacbcaba", "acacbcabc", "acacbcaca", "acacbcacb", "acacbcbab", "acacbcbac", "acacbcbca", "acacbcbcb", "acbababab", "acbababac", "acbababca", "acbababcb", "acbabacab", "acbabacac", "acbabacba", "acbabacbc", "acbabcaba", "acbabcabc", "acbabcaca", "acbabcacb", "acbabcbab", "acbabcbac", "acbabcbca", "acbabcbcb", "acbacabab", "acbacabac", "acbacabca", "acbacabcb", "acbacacab", "acbacacac", "acbacacba", "acbacacbc", "acbacbaba", "acbacbabc", "acbacbaca", "acbacbacb", "acbacbcab", "acbacbcac", "acbacbcba", "acbacbcbc", "acbcababa", "acbcababc", "acbcabaca", "acbcabacb", "acbcabcab", "acbcabcac", "acbcabcba", "acbcabcbc", "acbcacaba", "acbcacabc", "acbcacaca", "acbcacacb", "acbcacbab", "acbcacbac", "acbcacbca", "acbcacbcb", "acbcbabab", "acbcbabac", "acbcbabca", "acbcbabcb", "acbcbacab", "acbcbacac", "acbcbacba", "acbcbacbc", "acbcbcaba", "acbcbcabc", "acbcbcaca", "acbcbcacb", "acbcbcbab", "acbcbcbac", "acbcbcbca", "acbcbcbcb", "babababab", "babababac", "babababca", "babababcb", "bababacab", "bababacac", "bababacba", "bababacbc", "bababcaba", "bababcabc", "bababcaca", "bababcacb", "bababcbab", "bababcbac", "bababcbca", "bababcbcb", "babacabab", "babacabac", "babacabca", "babacabcb", "babacacab", "babacacac", "babacacba", "babacacbc", "babacbaba", "babacbabc", "babacbaca", "babacbacb", "babacbcab", "babacbcac", "babacbcba", "babacbcbc", "babcababa", "babcababc", "babcabaca", "babcabacb", "babcabcab", "babcabcac", "babcabcba", "babcabcbc", "babcacaba", "babcacabc", "babcacaca", "babcacacb", "babcacbab", "babcacbac", "babcacbca", "babcacbcb", "babcbabab", "babcbabac", "babcbabca", "babcbabcb", "babcbacab", "babcbacac", "babcbacba", "babcbacbc", "babcbcaba", "babcbcabc", "babcbcaca", "babcbcacb", "babcbcbab", "babcbcbac", "babcbcbca", "babcbcbcb", "bacababab", "bacababac", "bacababca", "bacababcb", "bacabacab", "bacabacac", "bacabacba", "bacabacbc", "bacabcaba", "bacabcabc", "bacabcaca", "bacabcacb", "bacabcbab", "bacabcbac", "bacabcbca", "bacabcbcb", "bacacabab", "bacacabac", "bacacabca", "bacacabcb", "bacacacab", "bacacacac", "bacacacba", "bacacacbc", "bacacbaba", "bacacbabc", "bacacbaca", "bacacbacb", "bacacbcab", "bacacbcac", "bacacbcba", "bacacbcbc", "bacbababa", "bacbababc", "bacbabaca", "bacbabacb", "bacbabcab", "bacbabcac", "bacbabcba", "bacbabcbc", "bacbacaba", "bacbacabc", "bacbacaca", "bacbacacb", "bacbacbab", "bacbacbac", "bacbacbca", "bacbacbcb", "bacbcabab", "bacbcabac", "bacbcabca", "bacbcabcb", "bacbcacab", "bacbcacac", "bacbcacba", "bacbcacbc", "bacbcbaba", "bacbcbabc", "bacbcbaca", "bacbcbacb", "bacbcbcab", "bacbcbcac", "bacbcbcba", "bacbcbcbc", "bcabababa", "bcabababc", "bcababaca", "bcababacb", "bcababcab", "bcababcac", "bcababcba", "bcababcbc", "bcabacaba", "bcabacabc", "bcabacaca", "bcabacacb", "bcabacbab", "bcabacbac", "bcabacbca", "bcabacbcb", "bcabcabab", "bcabcabac", "bcabcabca", "bcabcabcb", "bcabcacab", "bcabcacac", "bcabcacba", "bcabcacbc", "bcabcbaba", "bcabcbabc", "bcabcbaca", "bcabcbacb", "bcabcbcab", "bcabcbcac", "bcabcbcba", "bcabcbcbc", "bcacababa", "bcacababc", "bcacabaca", "bcacabacb", "bcacabcab", "bcacabcac", "bcacabcba", "bcacabcbc", "bcacacaba", "bcacacabc", "bcacacaca", "bcacacacb", "bcacacbab", "bcacacbac", "bcacacbca", "bcacacbcb", "bcacbabab", "bcacbabac", "bcacbabca", "bcacbabcb", "bcacbacab", "bcacbacac", "bcacbacba", "bcacbacbc", "bcacbcaba", "bcacbcabc", "bcacbcaca", "bcacbcacb", "bcacbcbab", "bcacbcbac", "bcacbcbca", "bcacbcbcb", "bcbababab", "bcbababac", "bcbababca", "bcbababcb", "bcbabacab", "bcbabacac", "bcbabacba", "bcbabacbc", "bcbabcaba", "bcbabcabc", "bcbabcaca", "bcbabcacb", "bcbabcbab", "bcbabcbac", "bcbabcbca", "bcbabcbcb", "bcbacabab", "bcbacabac", "bcbacabca", "bcbacabcb", "bcbacacab", "bcbacacac", "bcbacacba", "bcbacacbc", "bcbacbaba", "bcbacbabc", "bcbacbaca", "bcbacbacb", "bcbacbcab", "bcbacbcac", "bcbacbcba", "bcbacbcbc", "bcbcababa", "bcbcababc", "bcbcabaca", "bcbcabacb", "bcbcabcab", "bcbcabcac", "bcbcabcba", "bcbcabcbc", "bcbcacaba", "bcbcacabc", "bcbcacaca", "bcbcacacb", "bcbcacbab", "bcbcacbac", "bcbcacbca", "bcbcacbcb", "bcbcbabab", "bcbcbabac", "bcbcbabca", "bcbcbabcb", "bcbcbacab", "bcbcbacac", "bcbcbacba", "bcbcbacbc", "bcbcbcaba", "bcbcbcabc", "bcbcbcaca", "bcbcbcacb", "bcbcbcbab", "bcbcbcbac", "bcbcbcbca", "bcbcbcbcb", "cabababab", "cabababac", "cabababca", "cabababcb", "cababacab", "cababacac", "cababacba", "cababacbc", "cababcaba", "cababcabc", "cababcaca", "cababcacb", "cababcbab", "cababcbac", "cababcbca", "cababcbcb", "cabacabab", "cabacabac", "cabacabca", "cabacabcb", "cabacacab", "cabacacac", "cabacacba", "cabacacbc", "cabacbaba", "cabacbabc", "cabacbaca", "cabacbacb", "cabacbcab", "cabacbcac", "cabacbcba", "cabacbcbc", "cabcababa", "cabcababc", "cabcabaca", "cabcabacb", "cabcabcab", "cabcabcac", "cabcabcba", "cabcabcbc", "cabcacaba", "cabcacabc", "cabcacaca", "cabcacacb", "cabcacbab", "cabcacbac", "cabcacbca", "cabcacbcb", "cabcbabab", "cabcbabac", "cabcbabca", "cabcbabcb", "cabcbacab", "cabcbacac", "cabcbacba", "cabcbacbc", "cabcbcaba", "cabcbcabc", "cabcbcaca", "cabcbcacb", "cabcbcbab", "cabcbcbac", "cabcbcbca", "cabcbcbcb", "cacababab", "cacababac", "cacababca", "cacababcb", "cacabacab", "cacabacac", "cacabacba", "cacabacbc", "cacabcaba", "cacabcabc", "cacabcaca", "cacabcacb", "cacabcbab", "cacabcbac", "cacabcbca", "cacabcbcb", "cacacabab", "cacacabac", "cacacabca", "cacacabcb", "cacacacab", "cacacacac", "cacacacba", "cacacacbc", "cacacbaba", "cacacbabc", "cacacbaca", "cacacbacb", "cacacbcab", "cacacbcac", "cacacbcba", "cacacbcbc", "cacbababa", "cacbababc", "cacbabaca", "cacbabacb", "cacbabcab", "cacbabcac", "cacbabcba", "cacbabcbc", "cacbacaba", "cacbacabc", "cacbacaca", "cacbacacb", "cacbacbab", "cacbacbac", "cacbacbca", "cacbacbcb", "cacbcabab", "cacbcabac", "cacbcabca", "cacbcabcb", "cacbcacab", "cacbcacac", "cacbcacba", "cacbcacbc", "cacbcbaba", "cacbcbabc", "cacbcbaca", "cacbcbacb", "cacbcbcab", "cacbcbcac", "cacbcbcba", "cacbcbcbc", "cbabababa", "cbabababc", "cbababaca", "cbababacb", "cbababcab", "cbababcac", "cbababcba", "cbababcbc", "cbabacaba", "cbabacabc", "cbabacaca", "cbabacacb", "cbabacbab", "cbabacbac", "cbabacbca", "cbabacbcb", "cbabcabab", "cbabcabac", "cbabcabca", "cbabcabcb", "cbabcacab", "cbabcacac", "cbabcacba", "cbabcacbc", "cbabcbaba", "cbabcbabc", "cbabcbaca", "cbabcbacb", "cbabcbcab", "cbabcbcac", "cbabcbcba", "cbabcbcbc", "cbacababa", "cbacababc", "cbacabaca", "cbacabacb", "cbacabcab", "cbacabcac", "cbacabcba", "cbacabcbc", "cbacacaba", "cbacacabc", "cbacacaca", "cbacacacb", "cbacacbab", "cbacacbac", "cbacacbca", "cbacacbcb", "cbacbabab", "cbacbabac", "cbacbabca", "cbacbabcb", "cbacbacab", "cbacbacac", "cbacbacba", "cbacbacbc", "cbacbcaba", "cbacbcabc", "cbacbcaca", "cbacbcacb", "cbacbcbab", "cbacbcbac", "cbacbcbca", "cbacbcbcb", "cbcababab", "cbcababac", "cbcababca", "cbcababcb", "cbcabacab", "cbcabacac", "cbcabacba", "cbcabacbc", "cbcabcaba", "cbcabcabc", "cbcabcaca", "cbcabcacb", "cbcabcbab", "cbcabcbac", "cbcabcbca", "cbcabcbcb", "cbcacabab", "cbcacabac", "cbcacabca", "cbcacabcb", "cbcacacab", "cbcacacac", "cbcacacba", "cbcacacbc", "cbcacbaba", "cbcacbabc", "cbcacbaca", "cbcacbacb", "cbcacbcab", "cbcacbcac", "cbcacbcba", "cbcacbcbc", "cbcbababa", "cbcbababc", "cbcbabaca", "cbcbabacb", "cbcbabcab", "cbcbabcac", "cbcbabcba", "cbcbabcbc", "cbcbacaba", "cbcbacabc", "cbcbacaca", "cbcbacacb", "cbcbacbab", "cbcbacbac", "cbcbacbca", "cbcbacbcb", "cbcbcabab", "cbcbcabac", "cbcbcabca", "cbcbcabcb", "cbcbcacab", "cbcbcacac", "cbcbcacba", "cbcbcacbc", "cbcbcbaba", "cbcbcbabc", "cbcbcbaca", "cbcbcbacb", "cbcbcbcab", "cbcbcbcac", "cbcbcbcba", "cbcbcbcbc"], "10": ["ababababab", "ababababac", "ababababca", "ababababcb", "abababacab", "abababacac", "abababacba", "abababacbc", "abababcaba", "abababcabc", "abababcaca", "abababcacb", "abababcbab", "abababcbac", "abababcbca", "abababcbcb", "ababacabab", "ababacabac", "ababacabca", "ababacabcb", "ababacacab", "ababacacac", "ababacacba", "ababacacbc", "ababacbaba", "ababacbabc", "ababacbaca", "ababacbacb", "ababacbcab", "ababacbcac", "ababacbcba", "ababacbcbc", "ababcababa", "ababcababc", "ababcabaca", "ababcabacb", "ababcabcab", "ababcabcac", "ababcabcba", "ababcabcbc", "ababcacaba", "ababcacabc", "ababcacaca", "ababcacacb", "ababcacbab", "ababcacbac", "ababcacbca", "ababcacbcb", "ababcbabab", "ababcbabac", "ababcbabca", "ababcbabcb", "ababcbacab", "ababcbacac", "ababcbacba", "ababcbacbc", "ababcbcaba", "ababcbcabc", "ababcbcaca", "ababcbcacb", "ababcbcbab", "ababcbcbac", "ababcbcbca", "ababcbcbcb", "abacababab", "abacababac", "abacababca", "abacababcb", "abacabacab", "abacabacac", "abacabacba", "abacabacbc", "abacabcaba", "abacabcabc", "abacabcaca", "abacabcacb", "abacabcbab", "abacabcbac", "abacabcbca", "abacabcbcb", "abacacabab", "abacacabac", "abacacabca", "abacacabcb", "abacacacab", "abacacacac", "abacacacba", "abacacacbc", "abacacbaba", "abacacbabc", "abacacbaca", "abacacbacb", "abacacbcab", "abacacbcac", "abacacbcba", "abacacbcbc", "abacbababa", "abacbababc", "abacbabaca", "abacbabacb", "abacbabcab", "abacbabcac", "abacbabcba", "abacbabcbc", "abacbacaba", "abacbacabc", "abacbacaca", "abacbacacb", "abacbacbab", "abacbacbac", "abacbacbca", "abacbacbcb", "abacbcabab", "abacbcabac", "abacbcabca", "abacbcabcb", "abacbcacab", "abacbcacac", "abacbcacba", "abacbcacbc", "abacbcbaba", "abacbcbabc", "abacbcbaca", "abacbcbacb", "abacbcbcab", "abacbcbcac", "abacbcbcba", "abacbcbcbc", "abcabababa", "abcabababc", "abcababaca", "abcababacb", "abcababcab", "abcababcac", "abcababcba", "abcababcbc", "abcabacaba", "abcabacabc", "abcabacaca", "abcabacacb", "abcabacbab", "abcabacbac", "abcabacbca", "abcabacbcb", "abcabcabab", "abcabcabac", "abcabcabca", "abcabcabcb", "abcabcacab", "abcabcacac", "abcabcacba", "abcabcacbc", "abcabcbaba", "abcabcbabc", "abcabcbaca", "abcabcbacb", "abcabcbcab", "abcabcbcac", "abcabcbcba", "abcabcbcbc", "abcacababa", "abcacababc", "abcacabaca", "abcacabacb", "abcacabcab", "abcacabcac", "abcacabcba", "abcacabcbc", "abcacacaba", "abcacacabc", "abcacacaca", "abcacacacb", "abcacacbab", "abcacacbac", "abcacacbca", "abcacacbcb", "abcacbabab", "abcacbabac", "abcacbabca", "abcacbabcb", "abcacbacab", "abcacbacac", "abcacbacba", "abcacbacbc", "abcacbcaba", "abcacbcabc", "abcacbcaca", "abcacbcacb", "abcacbcbab", "abcacbcbac", "abcacbcbca", "abcacbcbcb", "abcbababab", "abcbababac", "abcbababca", "abcbababcb", "abcbabacab", "abcbabacac", "abcbabacba", "abcbabacbc", "abcbabcaba", "abcbabcabc", "abcbabcaca", "abcbabcacb", "abcbabcbab", "abcbabcbac", "abcbabcbca", "abcbabcbcb", "abcbacabab", "abcbacabac", "abcbacabca", "abcbacabcb", "abcbacacab", "abcbacacac", "abcbacacba", "abcbacacbc", "abcbacbaba", "abcbacbabc", "abcbacbaca", "abcbacbacb", "abcbacbcab", "abcbacbcac", "abcbacbcba", "abcbacbcbc", "abcbcababa", "abcbcababc", "abcbcabaca", "abcbcabacb", "abcbcabcab", "abcbcabcac", "abcbcabcba", "abcbcabcbc", "abcbcacaba", "abcbcacabc", "abcbcacaca", "abcbcacacb", "abcbcacbab", "abcbcacbac", "abcbcacbca", "abcbcacbcb", "abcbcbabab", "abcbcbabac", "abcbcbabca", "abcbcbabcb", "abcbcbacab", "abcbcbacac", "abcbcbacba", "abcbcbacbc", "abcbcbcaba", "abcbcbcabc", "abcbcbcaca", "abcbcbcacb", "abcbcbcbab", "abcbcbcbac", "abcbcbcbca", "abcbcbcbcb", "acabababab", "acabababac", "acabababca", "acabababcb", "acababacab", "acababacac", "acababacba", "acababacbc", "acababcaba", "acababcabc", "acababcaca", "acababcacb", "acababcbab", "acababcbac", "acababcbca", "acababcbcb", "acabacabab", "acabacabac", "acabacabca", "acabacabcb", "acabacacab", "acabacacac", "acabacacba", "acabacacbc", "acabacbaba", "acabacbabc", "acabacbaca", "acabacbacb", "acabacbcab", "acabacbcac", "acabacbcba", "acabacbcbc", "acabcababa", "acabcababc", "acabcabaca", "acabcabacb", "acabcabcab", "acabcabcac", "acabcabcba", "acabcabcbc", "acabcacaba", "acabcacabc", "acabcacaca", "acabcacacb", "acabcacbab", "acabcacbac", "acabcacbca", "acabcacbcb", "acabcbabab", "acabcbabac", "acabcbabca", "acabcbabcb", "acabcbacab", "acabcbacac", "acabcbacba", "acabcbacbc", "acabcbcaba", "acabcbcabc", "acabcbcaca", "acabcbcacb", "acabcbcbab", "acabcbcbac", "acabcbcbca", "acabcbcbcb", "acacababab", "acacababac", "acacababca", "acacababcb", "acacabacab", "acacabacac", "acacabacba", "acacabacbc", "acacabcaba", "acacabcabc", "acacabcaca", "acacabcacb", "acacabcbab", "acacabcbac", "acacabcbca", "acacabcbcb", "acacacabab", "acacacabac", "acacacabca", "acacacabcb", "acacacacab", "acacacacac", "acacacacba", "acacacacbc", "acacacbaba", "acacacbabc", "acacacbaca", "acacacbacb", "acacacbcab", "acacacbcac", "acacacbcba", "acacacbcbc", "acacbababa", "acacbababc", "acacbabaca", "acacbabacb", "acacbabcab", "acacbabcac", "acacbabcba", "acacbabcbc", "acacbacaba", "acacbacabc", "acacbacaca", "acacbacacb", "acacbacbab", "acacbacbac", "acacbacbca", "acacbacbcb", "acacbcabab", "acacbcabac", "acacbcabca", "acacbcabcb", "acacbcacab", "acacbcacac", "acacbcacba", "acacbcacbc", "acacbcbaba", "acacbcbabc", "acacbcbaca", "acacbcbacb", "acacbcbcab", "acacbcbcac", "acacbcbcba", "acacbcbcbc", "acbabababa", "acbabababc", "acbababaca", "acbababacb", "acbababcab", "acbababcac", "acbababcba", "acbababcbc", "acbabacaba", "acbabacabc", "acbabacaca", "acbabacacb", "acbabacbab", "acbabacbac", "acbabacbca", "acbabacbcb", "acbabcabab", "acbabcabac", "acbabcabca", "acbabcabcb", "acbabcacab", "acbabcacac", "acbabcacba", "acbabcacbc", "acbabcbaba", "acbabcbabc", "acbabcbaca", "acbabcbacb", "acbabcbcab", "acbabcbcac", "acbabcbcba", "acbabcbcbc", "acbacababa", "acbacababc", "acbacabaca", "acbacabacb", "acbacabcab", "acbacabcac", "acbacabcba", "acbacabcbc", "acbacacaba", "acbacacabc", "acbacacaca", "acbacacacb", "acbacacbab", "acbacacbac", "acbacacbca", "acbacacbcb", "acbacbabab", "acbacbabac", "acbacbabca", "acbacbabcb", "acbacbacab", "acbacbacac", "acbacbacba", "acbacbacbc", "acbacbcaba", "acbacbcabc", "acbacbcaca", "acbacbcacb", "acbacbcbab", "acbacbcbac", "acbacbcbca", "acbacbcbcb", "acbcababab", "acbcababac", "acbcababca", "acbcababcb", "acbcabacab", "acbcabacac", "acbcabacba", "acbcabacbc", "acbcabcaba", "acbcabcabc", "acbcabcaca", "acbcabcacb", "acbcabcbab", "acbcabcbac", "acbcabcbca", "acbcabcbcb", "acbcacabab", "acbcacabac", "acbcacabca", "acbcacabcb", "acbcacacab", "acbcacacac", "acbcacacba", "acbcacacbc", "acbcacbaba", "acbcacbabc", "acbcacbaca", "acbcacbacb", "acbcacbcab", "acbcacbcac", "acbcacbcba", "acbcacbcbc", "acbcbababa", "acbcbababc", "acbcbabaca", "acbcbabacb", "acbcbabcab", "acbcbabcac", "acbcbabcba", "acbcbabcbc", "acbcbacaba", "acbcbacabc", "acbcbacaca", "acbcbacacb", "acbcbacbab", "acbcbacbac", "acbcbacbca", "acbcbacbcb", "acbcbcabab", "acbcbcabac", "acbcbcabca", "acbcbcabcb", "acbcbcacab", "acbcbcacac", "acbcbcacba", "acbcbcacbc", "acbcbcbaba", "acbcbcbabc", "acbcbcbaca", "acbcbcbacb", "acbcbcbcab", "acbcbcbcac", "acbcbcbcba", "acbcbcbcbc", "bababababa", "bababababc", "babababaca", "babababacb", "babababcab", "babababcac", "babababcba", "babababcbc", "bababacaba", "bababacabc", "bababacaca", "bababacacb", "bababacbab", "bababacbac", "bababacbca", "bababacbcb", "bababcabab", "bababcabac", "bababcabca", "bababcabcb", "bababcacab", "bababcacac", "bababcacba", "bababcacbc", "bababcbaba", "bababcbabc", "bababcbaca", "bababcbacb", "bababcbcab", "bababcbcac", "bababcbcba", "bababcbcbc", "babacababa", "babacababc", "babacabaca", "babacabacb", "babacabcab", "babacabcac", "babacabcba", "babacabcbc", "babacacaba", "babacacabc", "babacacaca", "babacacacb", "babacacbab", "babacacbac", "babacacbca", "babacacbcb", "babacbabab", "babacbabac", "babacbabca", "babacbabcb", "babacbacab", "babacbacac", "babacbacba", "babacbacbc", "babacbcaba", "babacbcabc", "babacbcaca", "babacbcacb", "babacbcbab", "babacbcbac", "babacbcbca", "babacbcbcb", "babcababab", "babcababac", "babcababca", "babcababcb", "babcabacab", "babcabacac", "babcabacba", "babcabacbc", "babcabcaba", "babcabcabc", "babcabcaca", "babcabcacb", "babcabcbab", "babcabcbac", "babcabcbca", "babcabcbcb", "babcacabab", "babcacabac", "babcacabca", "babcacabcb", "babcacacab", "babcacacac", "babcacacba", "babcacacbc", "babcacbaba", "babcacbabc", "babcacbaca", "babcacbacb", "babcacbcab", "babcacbcac", "babcacbcba", "babcacbcbc", "babcbababa", "babcbababc", "babcbabaca", "babcbabacb", "babcbabcab", "babcbabcac", "babcbabcba", "babcbabcbc", "babcbacaba", "babcbacabc", "babcbacaca", "babcbacacb", "babcbacbab", "babcbacbac", "babcbacbca", "babcbacbcb", "babcbcabab", "babcbcabac", "babcbcabca", "babcbcabcb", "babcbcacab", "babcbcacac", "babcbcacba", "babcbcacbc", "babcbcbaba", "babcbcbabc", "babcbcbaca", "babcbcbacb", "babcbcbcab", "babcbcbcac", "babcbcbcba", "babcbcbcbc", "bacabababa", "bacabababc", "bacababaca", "bacababacb", "bacababcab", "bacababcac", "bacababcba", "bacababcbc", "bacabacaba", "bacabacabc", "bacabacaca", "bacabacacb", "bacabacbab", "bacabacbac", "bacabacbca", "bacabacbcb", "bacabcabab", "bacabcabac", "bacabcabca", "bacabcabcb", "bacabcacab", "bacabcacac", "bacabcacba", "bacabcacbc", "bacabcbaba", "bacabcbabc", "bacabcbaca", "bacabcbacb", "bacabcbcab", "bacabcbcac", "bacabcbcba", "bacabcbcbc", "bacacababa", "bacacababc", "bacacabaca", "bacacabacb", "bacacabcab", "bacacabcac", "bacacabcba", "bacacabcbc", "bacacacaba", "bacacacabc", "bacacacaca", "bacacacacb", "bacacacbab", "bacacacbac", "bacacacbca", "bacacacbcb", "bacacbabab", "bacacbabac", "bacacbabca", "bacacbabcb", "bacacbacab", "bacacbacac", "bacacbacba", "bacacbacbc", "bacacbcaba", "bacacbcabc", "bacacbcaca", "bacacbcacb", "bacacbcbab", "bacacbcbac", "bacacbcbca", "bacacbcbcb", "bacbababab", "bacbababac", "bacbababca", "bacbababcb", "bacbabacab", "bacbabacac", "bacbabacba", "bacbabacbc", "bacbabcaba", "bacbabcabc", "bacbabcaca", "bacbabcacb", "bacbabcbab", "bacbabcbac", "bacbabcbca", "bacbabcbcb", "bacbacabab", "bacbacabac", "bacbacabca", "bacbacabcb", "bacbacacab", "bacbacacac", "bacbacacba", "bacbacacbc", "bacbacbaba", "bacbacbabc", "bacbacbaca", "bacbacbacb", "bacbacbcab", "bacbacbcac", "bacbacbcba", "bacbacbcbc", "bacbcababa", "bacbcababc", "bacbcabaca", "bacbcabacb", "bacbcabcab", "bacbcabcac", "bacbcabcba", "bacbcabcbc", "bacbcacaba", "bacbcacabc", "bacbcacaca", "bacbcacacb", "bacbcacbab", "bacbcacbac", "bacbcacbca", "bacbcacbcb", "bacbcbabab", "bacbcbabac", "bacbcbabca", "bacbcbabcb", "bacbcbacab", "bacbcbacac", "bacbcbacba", "bacbcbacbc", "bacbcbcaba", "bacbcbcabc", "bacbcbcaca", "bacbcbcacb", "bacbcbcbab", "bacbcbcbac", "bacbcbcbca", "bacbcbcbcb", "bcabababab", "bcabababac", "bcabababca", "bcabababcb", "bcababacab", "bcababacac", "bcababacba", "bcababacbc", "bcababcaba", "bcababcabc", "bcababcaca", "bcababcacb", "bcababcbab", "bcababcbac", "bcababcbca", "bcababcbcb", "bcabacabab", "bcabacabac", "bcabacabca", "bcabacabcb", "bcabacacab", "bcabacacac", "bcabacacba", "bcabacacbc", "bcabacbaba", "bcabacbabc", "bcabacbaca", "bcabacbacb", "bcabacbcab", "bcabacbcac", "bcabacbcba", "bcabacbcbc", "bcabcababa", "bcabcababc", "bcabcabaca", "bcabcabacb", "bcabcabcab", "bcabcabcac", "bcabcabcba", "bcabcabcbc", "bcabcacaba", "bcabcacabc", "bcabcacaca", "bcabcacacb", "bcabcacbab", "bcabcacbac", "bcabcacbca", "bcabcacbcb", "bcabcbabab", "bcabcbabac", "bcabcbabca", "bcabcbabcb", "bcabcbacab", "bcabcbacac", "bcabcbacba", "bcabcbacbc", "bcabcbcaba", "bcabcbcabc", "bcabcbcaca", "bcabcbcacb", "bcabcbcbab", "bcabcbcbac", "bcabcbcbca", "bcabcbcbcb", "bcacababab", "bcacababac", "bcacababca", "bcacababcb", "bcacabacab", "bcacabacac", "bcacabacba", "bcacabacbc", "bcacabcaba", "bcacabcabc", "bcacabcaca", "bcacabcacb", "bcacabcbab", "bcacabcbac", "bcacabcbca", "bcacabcbcb", "bcacacabab", "bcacacabac", "bcacacabca", "bcacacabcb", "bcacacacab", "bcacacacac", "bcacacacba", "bcacacacbc", "bcacacbaba", "bcacacbabc", "bcacacbaca", "bcacacbacb", "bcacacbcab", "bcacacbcac", "bcacacbcba", "bcacacbcbc", "bcacbababa", "bcacbababc", "bcacbabaca", "bcacbabacb", "bcacbabcab", "bcacbabcac", "bcacbabcba", "bcacbabcbc", "bcacbacaba", "bcacbacabc", "bcacbacaca", "bcacbacacb", "bcacbacbab", "bcacbacbac", "bcacbacbca", "bcacbacbcb", "bcacbcabab", "bcacbcabac", "bcacbcabca", "bcacbcabcb", "bcacbcacab", "bcacbcacac", "bcacbcacba", "bcacbcacbc", "bcacbcbaba", "bcacbcbabc", "bcacbcbaca", "bcacbcbacb", "bcacbcbcab", "bcacbcbcac", "bcacbcbcba", "bcacbcbcbc", "bcbabababa", "bcbabababc", "bcbababaca", "bcbababacb", "bcbababcab", "bcbababcac", "bcbababcba", "bcbababcbc", "bcbabacaba", "bcbabacabc", "bcbabacaca", "bcbabacacb", "bcbabacbab", "bcbabacbac", "bcbabacbca", "bcbabacbcb", "bcbabcabab", "bcbabcabac", "bcbabcabca", "bcbabcabcb", "bcbabcacab", "bcbabcacac", "bcbabcacba", "bcbabcacbc", "bcbabcbaba", "bcbabcbabc", "bcbabcbaca", "bcbabcbacb", "bcbabcbcab", "bcbabcbcac", "bcbabcbcba", "bcbabcbcbc", "bcbacababa", "bcbacababc", "bcbacabaca", "bcbacabacb", "bcbacabcab", "bcbacabcac", "bcbacabcba", "bcbacabcbc", "bcbacacaba", "bcbacacabc", "bcbacacaca", "bcbacacacb", "bcbacacbab", "bcbacacbac", "bcbacacbca", "bcbacacbcb", "bcbacbabab", "bcbacbabac", "bcbacbabca", "bcbacbabcb", "bcbacbacab", "bcbacbacac", "bcbacbacba", "bcbacbacbc", "bcbacbcaba", "bcbacbcabc", "bcbacbcaca", "bcbacbcacb", "bcbacbcbab", "bcbacbcbac", "bcbacbcbca", "bcbacbcbcb", "bcbcababab", "bcbcababac", "bcbcababca", "bcbcababcb", "bcbcabacab", "bcbcabacac", "bcbcabacba", "bcbcabacbc", "bcbcabcaba", "bcbcabcabc", "bcbcabcaca", "bcbcabcacb", "bcbcabcbab", "bcbcabcbac", "bcbcabcbca", "bcbcabcbcb", "bcbcacabab", "bcbcacabac", "bcbcacabca", "bcbcacabcb", "bcbcacacab", "bcbcacacac", "bcbcacacba", "bcbcacacbc", "bcbcacbaba", "bcbcacbabc", "bcbcacbaca", "bcbcacbacb", "bcbcacbcab", "bcbcacbcac", "bcbcacbcba", "bcbcacbcbc", "bcbcbababa", "bcbcbababc", "bcbcbabaca", "bcbcbabacb", "bcbcbabcab", "bcbcbabcac", "bcbcbabcba", "bcbcbabcbc", "bcbcbacaba", "bcbcbacabc", "bcbcbacaca", "bcbcbacacb", "bcbcbacbab", "bcbcbacbac", "bcbcbacbca", "bcbcbacbcb", "bcbcbcabab", "bcbcbcabac", "bcbcbcabca", "bcbcbcabcb", "bcbcbcacab", "bcbcbcacac", "bcbcbcacba", "bcbcbcacbc", "bcbcbcbaba", "bcbcbcbabc", "bcbcbcbaca", "bcbcbcbacb", "bcbcbcbcab", "bcbcbcbcac", "bcbcbcbcba", "bcbcbcbcbc", "cababababa", "cababababc", "cabababaca", "cabababacb", "cabababcab", "cabababcac", "cabababcba", "cabababcbc", "cababacaba", "cababacabc", "cababacaca", "cababacacb", "cababacbab", "cababacbac", "cababacbca", "cababacbcb", "cababcabab", "cababcabac", "cababcabca", "cababcabcb", "cababcacab", "cababcacac", "cababcacba", "cababcacbc", "cababcbaba", "cababcbabc", "cababcbaca", "cababcbacb", "cababcbcab", "cababcbcac", "cababcbcba", "cababcbcbc", "cabacababa", "cabacababc", "cabacabaca", "cabacabacb", "cabacabcab", "cabacabcac", "cabacabcba", "cabacabcbc", "cabacacaba", "cabacacabc", "cabacacaca", "cabacacacb", "cabacacbab", "cabacacbac", "cabacacbca", "cabacacbcb", "cabacbabab", "cabacbabac", "cabacbabca", "cabacbabcb", "cabacbacab", "cabacbacac", "cabacbacba", "cabacbacbc", "cabacbcaba", "cabacbcabc", "cabacbcaca", "cabacbcacb", "cabacbcbab", "cabacbcbac", "cabacbcbca", "cabacbcbcb", "cabcababab", "cabcababac", "cabcababca", "cabcababcb", "cabcabacab", "cabcabacac", "cabcabacba", "cabcabacbc", "cabcabcaba", "cabcabcabc", "cabcabcaca", "cabcabcacb", "cabcabcbab", "cabcabcbac", "cabcabcbca", "cabcabcbcb", "cabcacabab", "cabcacabac", "cabcacabca", "cabcacabcb", "cabcacacab", "cabcacacac", "cabcacacba", "cabcacacbc", "cabcacbaba", "cabcacbabc", "cabcacbaca", "cabcacbacb", "cabcacbcab", "cabcacbcac", "cabcacbcba", "cabcacbcbc", "cabcbababa", "cabcbababc", "cabcbabaca", "cabcbabacb", "cabcbabcab", "cabcbabcac", "cabcbabcba", "cabcbabcbc", "cabcbacaba", "cabcbacabc", "cabcbacaca", "cabcbacacb", "cabcbacbab", "cabcbacbac", "cabcbacbca", "cabcbacbcb", "cabcbcabab", "cabcbcabac", "cabcbcabca", "cabcbcabcb", "cabcbcacab", "cabcbcacac", "cabcbcacba", "cabcbcacbc", "cabcbcbaba", "cabcbcbabc", "cabcbcbaca", "cabcbcbacb", "cabcbcbcab", "cabcbcbcac", "cabcbcbcba", "cabcbcbcbc", "cacabababa", "cacabababc", "cacababaca", "cacababacb", "cacababcab", "cacababcac", "cacababcba", "cacababcbc", "cacabacaba", "cacabacabc", "cacabacaca", "cacabacacb", "cacabacbab", "cacabacbac", "cacabacbca", "cacabacbcb", "cacabcabab", "cacabcabac", "cacabcabca", "cacabcabcb", "cacabcacab", "cacabcacac", "cacabcacba", "cacabcacbc", "cacabcbaba", "cacabcbabc", "cacabcbaca", "cacabcbacb", "cacabcbcab", "cacabcbcac", "cacabcbcba", "cacabcbcbc", "cacacababa", "cacacababc", "cacacabaca", "cacacabacb", "cacacabcab", "cacacabcac", "cacacabcba", "cacacabcbc", "cacacacaba", "cacacacabc", "cacacacaca", "cacacacacb", "cacacacbab", "cacacacbac", "cacacacbca", "cacacacbcb", "cacacbabab", "cacacbabac", "cacacbabca", "cacacbabcb", "cacacbacab", "cacacbacac", "cacacbacba", "cacacbacbc", "cacacbcaba", "cacacbcabc", "cacacbcaca", "cacacbcacb", "cacacbcbab", "cacacbcbac", "cacacbcbca", "cacacbcbcb", "cacbababab", "cacbababac", "cacbababca", "cacbababcb", "cacbabacab", "cacbabacac", "cacbabacba", "cacbabacbc", "cacbabcaba", "cacbabcabc", "cacbabcaca", "cacbabcacb", "cacbabcbab", "cacbabcbac", "cacbabcbca", "cacbabcbcb", "cacbacabab", "cacbacabac", "cacbacabca", "cacbacabcb", "cacbacacab", "cacbacacac", "cacbacacba", "cacbacacbc", "cacbacbaba", "cacbacbabc", "cacbacbaca", "cacbacbacb", "cacbacbcab", "cacbacbcac", "cacbacbcba", "cacbacbcbc", "cacbcababa", "cacbcababc", "cacbcabaca", "cacbcabacb", "cacbcabcab", "cacbcabcac", "cacbcabcba", "cacbcabcbc", "cacbcacaba", "cacbcacabc", "cacbcacaca", "cacbcacacb", "cacbcacbab", "cacbcacbac", "cacbcacbca", "cacbcacbcb", "cacbcbabab", "cacbcbabac", "cacbcbabca", "cacbcbabcb", "cacbcbacab", "cacbcbacac", "cacbcbacba", "cacbcbacbc", "cacbcbcaba", "cacbcbcabc", "cacbcbcaca", "cacbcbcacb", "cacbcbcbab", "cacbcbcbac", "cacbcbcbca", "cacbcbcbcb", "cbabababab", "cbabababac", "cbabababca", "cbabababcb", "cbababacab", "cbababacac", "cbababacba", "cbababacbc", "cbababcaba", "cbababcabc", "cbababcaca", "cbababcacb", "cbababcbab", "cbababcbac", "cbababcbca", "cbababcbcb", "cbabacabab", "cbabacabac", "cbabacabca", "cbabacabcb", "cbabacacab", "cbabacacac", "cbabacacba", "cbabacacbc", "cbabacbaba", "cbabacbabc", "cbabacbaca", "cbabacbacb", "cbabacbcab", "cbabacbcac", "cbabacbcba", "cbabacbcbc", "cbabcababa", "cbabcababc", "cbabcabaca", "cbabcabacb", "cbabcabcab", "cbabcabcac", "cbabcabcba", "cbabcabcbc", "cbabcacaba", "cbabcacabc", "cbabcacaca", "cbabcacacb", "cbabcacbab", "cbabcacbac", "cbabcacbca", "cbabcacbcb", "cbabcbabab", "cbabcbabac", "cbabcbabca", "cbabcbabcb", "cbabcbacab", "cbabcbacac", "cbabcbacba", "cbabcbacbc", "cbabcbcaba", "cbabcbcabc", "cbabcbcaca", "cbabcbcacb", "cbabcbcbab", "cbabcbcbac", "cbabcbcbca", "cbabcbcbcb", "cbacababab", "cbacababac", "cbacababca", "cbacababcb", "cbacabacab", "cbacabacac", "cbacabacba", "cbacabacbc", "cbacabcaba", "cbacabcabc", "cbacabcaca", "cbacabcacb", "cbacabcbab", "cbacabcbac", "cbacabcbca", "cbacabcbcb", "cbacacabab", "cbacacabac", "cbacacabca", "cbacacabcb", "cbacacacab", "cbacacacac", "cbacacacba", "cbacacacbc", "cbacacbaba", "cbacacbabc", "cbacacbaca", "cbacacbacb", "cbacacbcab", "cbacacbcac", "cbacacbcba", "cbacacbcbc", "cbacbababa", "cbacbababc", "cbacbabaca", "cbacbabacb", "cbacbabcab", "cbacbabcac", "cbacbabcba", "cbacbabcbc", "cbacbacaba", "cbacbacabc", "cbacbacaca", "cbacbacacb", "cbacbacbab", "cbacbacbac", "cbacbacbca", "cbacbacbcb", "cbacbcabab", "cbacbcabac", "cbacbcabca", "cbacbcabcb", "cbacbcacab", "cbacbcacac", "cbacbcacba", "cbacbcacbc", "cbacbcbaba", "cbacbcbabc", "cbacbcbaca", "cbacbcbacb", "cbacbcbcab", "cbacbcbcac", "cbacbcbcba", "cbacbcbcbc", "cbcabababa", "cbcabababc", "cbcababaca", "cbcababacb", "cbcababcab", "cbcababcac", "cbcababcba", "cbcababcbc", "cbcabacaba", "cbcabacabc", "cbcabacaca", "cbcabacacb", "cbcabacbab", "cbcabacbac", "cbcabacbca", "cbcabacbcb", "cbcabcabab", "cbcabcabac", "cbcabcabca", "cbcabcabcb", "cbcabcacab", "cbcabcacac", "cbcabcacba", "cbcabcacbc", "cbcabcbaba", "cbcabcbabc", "cbcabcbaca", "cbcabcbacb", "cbcabcbcab", "cbcabcbcac", "cbcabcbcba", "cbcabcbcbc", "cbcacababa", "cbcacababc", "cbcacabaca", "cbcacabacb", "cbcacabcab", "cbcacabcac", "cbcacabcba", "cbcacabcbc", "cbcacacaba", "cbcacacabc", "cbcacacaca", "cbcacacacb", "cbcacacbab", "cbcacacbac", "cbcacacbca", "cbcacacbcb", "cbcacbabab", "cbcacbabac", "cbcacbabca", "cbcacbabcb", "cbcacbacab", "cbcacbacac", "cbcacbacba", "cbcacbacbc", "cbcacbcaba", "cbcacbcabc", "cbcacbcaca", "cbcacbcacb", "cbcacbcbab", "cbcacbcbac", "cbcacbcbca", "cbcacbcbcb", "cbcbababab", "cbcbababac", "cbcbababca", "cbcbababcb", "cbcbabacab", "cbcbabacac", "cbcbabacba", "cbcbabacbc", "cbcbabcaba", "cbcbabcabc", "cbcbabcaca", "cbcbabcacb", "cbcbabcbab", "cbcbabcbac", "cbcbabcbca", "cbcbabcbcb", "cbcbacabab", "cbcbacabac", "cbcbacabca", "cbcbacabcb", "cbcbacacab", "cbcbacacac", "cbcbacacba", "cbcbacacbc", "cbcbacbaba", "cbcbacbabc", "cbcbacbaca", "cbcbacbacb", "cbcbacbcab", "cbcbacbcac", "cbcbacbcba", "cbcbacbcbc", "cbcbcababa", "cbcbcababc", "cbcbcabaca", "cbcbcabacb", "cbcbcabcab", "cbcbcabcac", "cbcbcabcba", "cbcbcabcbc", "cbcbcacaba", "cbcbcacabc", "cbcbcacaca", "cbcbcacacb", "cbcbcacbab", "cbcbcacbac", "cbcbcacbca", "cbcbcacbcb", "cbcbcbabab", "cbcbcbabac", "cbcbcbabca", "cbcbcbabcb", "cbcbcbacab", "cbcbcbacac", "cbcbcbacba", "cbcbcbacbc", "cbcbcbcaba", "cbcbcbcabc", "cbcbcbcaca", "cbcbcbcacb", "cbcbcbcbab", "cbcbcbcbac", "cbcbcbcbca", "cbcbcbcbcb"]};

function sortCounterclockwise(points) {
	// this can likely be simplified to checking whether the difference of the args is
	// greater / less than pi but the goal now is to get it working.
	const cent = Euclid.centroid(points);
	const f = (A, B) => {
		const originA = A.sub(cent), originB = B.sub(cent);
		const reverseAngle = -originA.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = originB.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	}
	return points.slice().sort(f);
}

function sortPolygonsCC(polygons) {
	const f = (p1, p2) => {
		const A = p1.euclideanCentroid;
		const B = p2.euclideanCentroid;
		const reverseAngle = -A.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = B.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	}
	return polygons.slice().sort(f);
}

function oddlySpecificSortingFunction(poly) {
	let indices = [];
	for (let i=0; i<poly.vertices.length; i++) {
		indices[i] = i;
	}
	const newVerts = [];
	const newOuter = [];
	indices = indices.sort((i1, i2) => {
		const A = poly.get(i1).sub(poly.euclideanCentroid);
		const B = poly.get(i2).sub(poly.euclideanCentroid);
		const reverseAngle = -A.arg();
		// transform so A is on the positive x axis (arg 0)
		const B2 = B.rotate(reverseAngle);
		return B2.arg() <= Math.PI;
	});
	for (let j=0; j<indices.length; j++) {
		newVerts[j] = poly.get(indices[j]);
		newOuter[j] = poly.get(indices[j]);
	}
	return {
		verts: newOuter,
		outer: newOuter
	};
}

function linspace(min, max, n) {
	/* Returns n equally spaced values between min and max (including endpoints) */
	const result = [];
	const range = max - min;
	for (let i=0; i<n; i++) {
		result.push(min + range * i / (n-1));
	}
	return result;
}

function heaviside(x) {
	/* Computes the Heaviside step function of x */
	return (x < 0) ? 0 : 1;
}

function roundTo(x, places) {
	/* Rounds x to the specified number of places after the decimal */
	return Math.round(x * Math.pow(10, places)) / Math.pow(10, places);
}

function toPolyList(pollies) {
	const result = [];
	let temp_result = "\\left[";
	let total = 0;
	for (let p of pollies) {
		total += 1; // for the separating I
		if (total + p.vertices.length >= 10000) {
			result.push(temp_result.slice(0,-1) + "\\right]");
			total = p.vertices.length;
			temp_result = "\\left[" + p.toLatex();
		} else {
			temp_result += p.toLatex();
			total += p.vertices.length;
		}
		temp_result += ",I,";
	}
	result.push(temp_result.slice(0,-1) + "\\right]");
	for (let res of result) {
		console.log(res);
	}
}

class InputHandler {

	static handlePQ() {
		const p = parseInt(document.getElementById("polygon-p").value);
		const q = parseInt(document.getElementById("polygon-q").value);
		document.getElementById("polygon-p-display").innerHTML = p + "";
		document.getElementById("polygon-q-display").innerHTML = q + "";
		plot.setPQ(p, q);
	}

	static handleStartingAngle() {
		const startingAngle = parseFloat(document.getElementById("starting-angle").value);
		document.getElementById("starting-angle-display").innerHTML = startingAngle.toFixed(2);
		plot.setStartingAngle(startingAngle);
	}

	static handleModelSelect() {
		const model = document.getElementById("model-select").value;
		plot.setModel(model);
	}

	static handleRecenter() {
		plot.setTessellationCenter(complex(0, 0));
	}

	static handlePolygonStyling() {
		const showOutlines = document.getElementById("stroke-toggle").checked;
		const showFill = document.getElementById("fill-toggle").checked;
		plot.setPolygonStyle(showOutlines, showFill);
	}

}



class Euclid {

	/*
	Collection of Euclidean geometry functions
	*/

	static lineIntersection(p1, v1, p2, v2) {
		/*
		Computes the intersection of the lines p1 + v1 * t and p2 + v2 * t.
		Returns null if the lines do not intersect.
		*/
		const x1 = p1.re, y1 = p1.im;
		const x2 = p1.re + v1.re, y2 = p1.im + v1.im;
		const x3 = p2.re, y3 = p2.im;
		const x4 = p2.re + v2.re, y4 = p2.im + v2.im;

		const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (denom == 0) return null;

		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
		return p1.add(v1.scale(t));
	}

	static midpoint(p1, p2) {
		/*
		Computes the midpoint of p1 and p2
		*/
		return p1.add(p2).scale(0.5);
	}

	static circleCenter(p1, p2, p3) {
		/*
		Computes the center of the circle passing through the three points p1, p2, p3
		*/
		return Euclid.lineIntersection(Euclid.midpoint(p1, p2), p2.sub(p1).perp(),
										Euclid.midpoint(p2, p3), p3.sub(p2).perp());
	}

	static centroid(P) {
		/*
		Computes the centroid of the points in P
		*/
		let xTotal = 0, yTotal = 0;
		for (let point of P) {
			xTotal += point.re;
			yTotal += point.im;
		}
		return complex(xTotal / P.length, yTotal / P.length);
	}

	static distance(p1, p2) {
		/*
		Computes the distance between p1 and p2
		*/
		return p2.sub(p1).norm();
	}

	static project(p1, p2) {
		return p2.scale(p1.dot(p2) / p2.normSq());
	}

}


class Complex {

	/*
	Class for representing complex numbers of the form a + bi
	*/

	static HASH_REALLENGTH = 11; // half the length of the hash of a single complex number
	static HASH_WEIGHT = 1265055685;
	static HASH_OFFSET = 81913;

	constructor(real, imaginary) {
		this.re = real;
		this.im = imaginary;
	}

	conj() {
		/* Computes the complex conjugate */
		return new Complex(this.re, -this.im);
	}

	norm() {
		/* Computes the norm (modulus), as a real number */
		return Math.sqrt(this.re * this.re + this.im * this.im);
	}

	normSq() {
		/* Computes the square of the norm (modulus), as a real number */
		return this.re * this.re + this.im * this.im;
	}

	arg() {
		/*
		Computes the angle (argument), as a real number measured in radians
		0 <= arg(z) < 2 * pi
		*/
		return (Math.atan2(this.im, this.re) + 2 * Math.PI) % (2 * Math.PI);
	}

	unit() {
		/* Computes a unit modulus complex number in the direction of this complex number */
		return this.scale(1 / this.norm());
	}

	scale(k) {
		/* Scales each component by the real constant k */
		return new Complex(this.re * k, this.im * k);
	}

	add(z) {
		/* Computes the sum of this complex number and z */
		return new Complex(this.re + z.re, this.im + z.im);
	}

	sub(z) {
		/* Computes the difference of this complex number and z */
		return new Complex(this.re - z.re, this.im - z.im);	
	}

	mult(z) {
		/* Computes the product of this complex number and z */
		return new Complex(this.re * z.re - this.im * z.im, this.re * z.im + this.im * z.re);
	}

	inv() {
		/* Computes the reciprocal (inverse) */
		return this.conj().scale(1 / this.normSq());
	}

	div(z) {
		/* Computes the quotient of this complex number and z */
		return this.mult(z.inv());
	}

	perp() {
		/* Computes an orthogonal complex number of the same magnitude */
		return new Complex(-this.im, this.re);
	}

	sqrt() {
		/* Computes the principal branch of the square root */
		const normSqrt = Math.sqrt(this.norm());
		const halfArg = 0.5 * this.arg();
		return new Complex(normSqrt * Math.cos(halfArg), normSqrt * Math.sin(halfArg));
	}

	square() {
		/* Computes the square */
		return new Complex(this.re * this.re - this.im * this.im, 2 * this.re * this.im);
	}

	exp() {
		/* Computes the exponential function of this complex number */
		const mag = Math.exp(this.re);
		return new Complex(mag * Math.cos(this.im), mag * Math.sin(this.im));
	}

	ln() {
		/* Computes the principal branch of the natural log */
		return new Complex(Math.log(this.norm()), this.arg());
	}

	acos() {
		/* Computes the principal branch of the inverse cosine */
		this.add(this.square().sub(new Complex(1, 0)).sqrt()).ln().div(complex(0, 1));
	}

	rotate(angle) {
		/* Computes this complex number rotated by angle radians */
		return this.mult((new Complex(0, angle)).exp());
	}

	dot(z) {
		/* Computes the Euclidean dot product of the coefficients of this complex number and z */
		return this.re * z.re + this.im * z.im;
	}

	angleTo(z) {
		/* Computes the angle between this complex number and z */
		/*
		acos u*v/uv = uvcos(t)
		*/
		return Math.acos(this.dot(z) / (this.norm() * z.norm()));
	}

	toString() {
		/* Returns the string representation of the complex number as an ordered pair (re(z), im(z)) */
		return `(${this.re},${this.im})`;
	}

	toLatex() {
		/* Returns latex representation of the complex number */
		const rx = roundTo(this.re, 3), ry = roundTo(this.im, 3);
		return `\\left(${rx},${ry}\\right)`
	}

	equals(z) {
		/* Returns true iff z equals this complex number, exactly */
		return (this.re == z.re && this.im == z.im);
	}

	equalsEps(z) {
		/*
		Returns true iff z equals this complex number, within numerical tolerance EPSILON
		For floating point rounding purposes
		*/
		return (Math.abs(this.re - z.re) < EPSILON && Math.abs(this.im - z.im) < EPSILON);
	}

	static realHash(x) {
		/*
		helper function for hash(). Returns a (non-unique) has representing the real number x
		*/
		x = (x + Complex.HASH_OFFSET) * Complex.HASH_WEIGHT; // ensure e.g. 12 and 120 get different hashes
		let repr = x.toFixed(Complex.HASH_REALLENGTH); // ensure the hash is at at least the required length
		// keep decimal point, if applicable, as an extra measure to distinguish e.g. 12.5 and 1.25. i.e. do not do repr.replace(".", "")
		return repr.slice(0, Complex.HASH_REALLENGTH); // cut the hash to the required length
	}

	hash() {
		/*
		Returns a string hash representing the complex number
		This hash is by no means unique, but it should be sufficient for the purposes of this program.
		It is very unlikely that two distinct complex numbers return the same hash during execution.
		If a hash collision occurs, the program will still produce correct output, but it may experience
		performance hits.

		Obviously, it is not possible to construct an injection from C to the set of fixed length strings
		with a countable (finite) character set, so this is as good as one can expect from a hash function
		*/
		// compute the hashes of the real and complex parts as real numbers
		let re = Complex.realHash(this.re), im = Complex.realHash(this.im);

		// interleave the hashes of the real and imaginary parts
		// let result = "";
		// for (let i=0; i < re.length; i++) {
		// 	result += re[i];
		// 	result += im[i];
		// }
		// return result;

		// concatenate the hashes of the real and imaginary parts
		return re + im;
	}

}


function complex(real, imaginary) {
	/* instantiate a Complex without new keyword */
	return new Complex(real, imaginary);
}


class Poincare {

	/* Collection of functions for computations in the poincare disk model of the hyperbolic plane */

	static translatePToOrigin(z, P) {
		/*
		Computes a mobius transformation on z that takes P to 0 and preserves the unit disk
		*/
		return z.sub(P).div(complex(1, 0).sub(P.conj().mult(z)));
	}

	static translateOriginToP(z, P) {
		/*
		Computes a mobius transformation on z taking 0 to P and preserves the unit disk
		(inverse of translatePToOrigin) */
		return z.add(P).div(complex(1, 0).add(P.conj().mult(z)));
	}

	static segment(t, A, B) {
		/*
		Evaluates a parameterization of the geodesic segment between A and B at time t.
		segment(0, A, B) = A.
		segment(1, A, B) = B.
		*/
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).scale(t), A);
	}

	static line(t, A, B) {
		/*
		Evaluates a parameterization of the geodesic through A and B at time t.
		line(0, A, B) = start of line (beginning point on circle at infinity)
		line(1, A, B) = end of line (terminal point on circle at infinity)
		Note that line(0, A, B) and line(1, A, B) are not actually points on the geodesic.
		*/
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).unit().scale(2 * t - 1), A);	
	}

	static regPolyDist(p, q) {
		/*
		Computes the (Euclidean) distance to vertices of a regular p-gon with interior
		angle 2*pi/q (for (p, q) tessellation).
		Note: (p-2) * (q-2) must be greater than 4
		*/
		if ((p-2) * (q-2) <= 4) {
			console.error(`Error: cannot compute regular polygon distance for p=${p}, q=${q}`);
			return;
		}

		const tan1 = Math.tan(Math.PI / 2 - Math.PI / q);
		const tan2 = Math.tan(Math.PI / p);
		return Math.sqrt((tan1 - tan2) / (tan1 + tan2));
	}

	// static polygon(T, verts) {
	// 	/*
	// 	Evaluates a parameterization of the hyperbolic polygon with given vertices at
	// 	the times in list T.
	// 	let n be the number of vertices.
	// 	polygon(0, verts) = first vertex
	// 	polygon(1 / n, verts) = second vertex
	// 	polygon(2 / n, verts) = third vertex
	// 	...
	// 	polygon(1, verts) = first vertex
	// 	*/
	// 	if (verts.length < 2) {
	// 		console.error("Error: cannot draw polygon with fewer than 2 points");
	// 		return;
	// 	}

	// 	const result = [];
	// 	const n = verts.length;
	// 	verts = verts.slice();
	// 	verts.push(verts[0]);
	// 	let endpoint1, endpoint2, index, proportion, t;
	// 	for (let i=0; i<T.length; i++) {
	// 		t = T[i];
	// 		if (t != 1) {
	// 			index = Math.floor(n * t); // floor(t / (1/n))
	// 			proportion = n * (t % (1 / n));
	// 			// console.log(index, n, t);
	// 			result.push(Poincare.segment(proportion, verts[index], verts[index + 1]));
	// 		} else {
	// 			result.push(verts[0]);
	// 		}
	// 	}
	// 	return result;
	// }

	static polygon(N, verts) {
		// make a hyperbolic polygon with as close to N points as possible while guaranteeing all corners
		if (verts.length < 2) {
			console.error("Error: can't draw polygon with less than 2 points")
		}
		const result = [];
		const nPerSide = Math.ceil(N / verts.length);
		
		verts = verts.slice();
		verts.push(verts[0]);
		for (let i=0; i<verts.length-1; i++) {
			const space = linspace(0, 1, nPerSide);
			for (let value of space) {
				result.push(Poincare.segment(value, verts[i], verts[i+1]));
			}
		}
		return result;
	}

	static rotate(z, P, angle) {
		/* Computes the hyperbolic rotation of z about P by angle radians */
		return Poincare.translateOriginToP(Poincare.translatePToOrigin(z, P, true).rotate(angle), P, true);
	}

	static rotateMultiple(Z, P, angle) {
		/* Computes the hyperbolic rotation of all the points in Z about P by angle radians */
		const result = [];
		for (let vert of Z) {
			result.push(this.rotate(vert, P, angle));
		}
		return result;
	}

	static unitCircleInvert(z) {
		/* Computes the inversion of z through the unit circle */
		return z.conj().inv();
	}

	static circleInvert(z, r, P) {
		/* Computes the inversion of z through the circle of radius r centered at P */
		return P.add(complex(r * r, 0).div(z.sub(P).conj()));
	}

	static reflect(z, p1, p2) {
		/* Computes the inversion of z through the geodesic passing through p1 and p2 */
		const center = Euclid.circleCenter(p1, p2, Poincare.unitCircleInvert(p1));

		if (center == null || center.norm() > 1000) {
			// the points are presumably on a radial line through the origin
			return p1.add(Euclid.project(z.sub(p1), p2.sub(p1))).scale(2).sub(z);
		}
		return Poincare.circleInvert(z, Euclid.distance(p1, center), center);
	}

	static reflectMultiple(Z, p1, p2) {
		/* Computes the inversion of all points in Z through the geodesic passing through p1 and p2 */
		const result = [];
		for (let vert of Z) {
			result.push(this.reflect(vert, p1, p2));
		}
		return result;
	}

	static inverseCayley(z) {
		/*
		Inverse of the Cayley transform (map from upper half plane to unit disk)
		See https://en.wikipedia.org/wiki/Cayley_transform#Complex_homography
		and https://www.desmos.com/calculator/ucug6yw6bh
		*/
		const one = complex(1, 0);
		return one.add(z).div(one.sub(z)).mult(complex(0, 1));
	}

	static toKleinDisk(z) {
		/*
		Take a point z in the Poincaré disk to the Klein disk
		(Inverse stereographic projection to hemisphere then orthogonal projection to disk)
		*/
		const denom = 0.5 * (1 + z.normSq());
		return complex(z.re / denom, z.im / denom);
	}

	static hypDistance(z1, z2) {
		/*
		Given two points, compute the hyperbolic distance between them according to the Poincare metric
		*/
		const z = z1.sub(z2);
		const euclideanDistanceToOrigin = z.norm();
		return Math.log((1 + euclideanDistanceToOrigin) / (1 - euclideanDistanceToOrigin));
	}

}


class HyperbolicPolygon {

	constructor(vertices, initiallyOuter=false, chicken=false) {
		// this.vertices = sortCounterclockwise(vertices.slice());
		this.vertices = vertices.slice();
		this.outer = [];
		for (let i=0; i<this.vertices.length; i++) {
			this.outer[i] = initiallyOuter;
		}
		this.length = this.vertices.length;
		this.chicken = chicken;

		this.euclideanCentroid = Euclid.centroid(this.vertices);
	}

	setOuter(i) {
		this.outer[i] = true;
	}

	get(i) {
		return this.vertices[i];
	}

	isOuter(i) {
		return this.outer[i];
	}

	hash() {
		/*
		Returns the hash of the euclidean centroid of this polygon
		*/
		return this.euclideanCentroid.hash();
	}

	toLatex() {
		let result = ""
		for (let vert of this.vertices) {
			result += vert.toLatex();
			result += ",";
		}
		return result.slice(0,-1)
	}

	invert() {
		const arr = [];
		if (this.euclideanCentroid.norm() < 0.01) return null;
		for (let vert of this.vertices) {
			arr.push(Poincare.unitCircleInvert(vert));
		}
		return new HyperbolicPolygon(arr);
	}

}


class Plot {

	constructor(diskSize=0.8, p=5, q=4, tessellationCenter=null, maxSamplesPerEdge=350) {
		this.setDiskSize(diskSize);
		this.setPQ(p, q);
		this.setStartingAngle(0);
		if (tessellationCenter == null) {
			this.setTessellationCenter(complex(0, 0));
		} else {
			this.setTessellationCenter(tessellationCenter);
		}
		this.setModel("poincare-disk");

		this.polygons = [];
		this.polysGenerated = false;
		this.maxSamplesPerEdge = maxSamplesPerEdge;

		this.showOutlines = true;
		this.showFill = true;

		this.needsUpdate = true;
		this.drawIndex = 0;
	}

	setDiskSize(diskSize) {
		this.diskSize = diskSize;
		this.maxSquareSize = min(width, height);
		this.halfMaxSquare = this.maxSquareSize / 2;
		this.diskPixelSize = this.maxSquareSize * this.diskSize;

		this.xOffset = width / 2 - this.halfMaxSquare;
		this.yOffset = height / 2 - this.halfMaxSquare;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setPQ(p, q) {
		this.p = p;
		this.q = q;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setStartingAngle(angle) {
		this.startingAngle = angle;
		this.polysGenerated = false;
		this.needsUpdate = true;
	}

	setTessellationCenter(tessellationCenter) {
		this.tessellationCenter = tessellationCenter;
		this.needsUpdate = true;
	}

	setModel(model) {
		this.model = model;
		this.needsUpdate = true;
	}

	setPolygonStyle(outlines, fill) {
		this.showOutlines = outlines;
		this.showFill = fill;
		this.needsUpdate = true;
	}

	onResize() {
		this.setDiskSize(this.diskSize);
		this.needsUpdate = true;
	}

	recenter(z) {
		return Poincare.translateOriginToP(z, this.tessellationCenter);
	}

	coordinateTransform(z) {
		/* Convert from Cartesian space to pixel space */
		if (this.model === "half-plane") {
			z = Poincare.inverseCayley(z);
		} else if (this.model === "klein-disk") {
			z = Poincare.toKleinDisk(z);
		}
		return complex(this.xOffset + this.halfMaxSquare * (1 + z.re * this.diskSize),
						this.yOffset + this.halfMaxSquare * (1 - z.im * this.diskSize));
	}

	reverseCoordinateTransform(p) {
		/* Convert from pixel space to Cartesian space */
		return complex(((p.re - this.xOffset) / this.halfMaxSquare - 1) / this.diskSize,
						(1 - (p.im - this.yOffset) / this.halfMaxSquare) / this.diskSize);
	}

	drawHyperbolicPolygon(verts, N, t=255) {
		/*
		draw a hyperbolic polygon through the vertices in the list verts.
		N defines how many points to sample (the resolution of the polygon)
		*/
		// const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(N, verts);

		push();

		if (this.showOutlines) {
			strokeWeight(1);
		} else {
			noStroke();
		}

		if (this.showFill) {
			let d;
			const cent = Euclid.centroid(verts);
			if (cent.norm() > 0.99) {
				d = 1;
			} else {
				d = Math.min(10, Poincare.hypDistance(cent, complex(0, 0))) / 10;
			}
			const shade = Math.floor(100 + 128 * d);
			fill(0, shade, 255-shade);
			
			// if (cent.norm() < 0.1) {
			// 	fill(255, 0, 0);
			// } else if (cent.norm() < 0.9) {
			// 	fill(0, 255, 0);
			// } else if (cent.norm() < 1) {
			// 	fill(0,0,255);
			// }
			// else {
			// 	return;
			// 	fill(0, 0, 0);
			// }
			
			// fill(t,0,0,50);
		} else {
			noFill();
		}

		beginShape();
		let transformedPoint;
		for (let point of polyData) {
			transformedPoint = this.coordinateTransform(this.recenter(point));
			vertex(transformedPoint.re, transformedPoint.im);
		}
		endShape(CLOSE);
		// endShape();
		pop();
	}

	drawPQTessellation() {
		if (!this.polysGenerated) {
			this.generatePQTessellation(this.p, this.q);
		}

		let count = 0;
		// for (let i=0; i<this.drawIndex; i++) {
		for (let i=0; i<this.polygons.length; i++) {
			const poly = this.polygons[i];
			const res = this.calculateResolution(poly);
			if (res > 2) {
				// const h = i/this.polygons.length * 255;
				const h = poly.chicken ? 255 : 0;
				this.drawHyperbolicPolygon(poly.vertices, res, h);
				// fill(0);
				// const cent = this.coordinateTransform(this.recenter(poly.euclideanCentroid));
				// text(i+"", cent.re,cent.im);
				// if (i == 1) {
				// 	const v1 = this.coordinateTransform(this.recenter(poly.get(0)));
				// 	const v2 = this.coordinateTransform(this.recenter(poly.get(1)));
				// 	fill(255,0,0);
				// 	circle(v1.re,v1.im, 10);
				// 	fill(0,0,255);
				// 	circle(v2.re,v2.im,10);

				// }
				count++;
			}
		}
		// console.log(count, this.polygons.length, roundTo(count / this.polygons.length * 100, 4));
	}

	drawTrianglulatedPolygon(p, q, N=100) {
		let angle, vertices = [];
		const d = Poincare.regPolyDist(p, q);
		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}
		const euclideanCentroid = Euclid.centroid(vertices);
		// this.drawHyperbolicPolygon(vertices, 100);

		/*
		draw a hyperbolic polygon through the vertices in the list verts.
		N defines how many points to sample (the resolution of the polygon)
		*/
		const T = linspace(0, 1, N);
		const polyData = Poincare.polygon(T, vertices);

		push();
		strokeWeight(1);
		fill(0, 128, 128);
		noFill();

		beginShape();
		let transformedPoint, transformedPoints = [];
		for (let point of polyData) {
			transformedPoint = this.coordinateTransform(this.recenter(point));
			vertex(transformedPoint.re, transformedPoint.im);
			transformedPoints.push(transformedPoint);
		}
		transformedPoints.push(transformedPoints[0]);
		endShape(CLOSE);

		// noFill();
		let counter = 0;
		const transformedCent = this.coordinateTransform(this.recenter(euclideanCentroid));
		for (let i=0; i<transformedPoints.length-1; i++) {
			beginShape();
			// console.log(transformedCent);
			vertex(transformedPoints[i].re, transformedPoints[i].im);
			vertex(transformedCent.re, transformedCent.im);
			vertex(transformedPoints[i + 1].re, transformedPoints[i + 1].im);
			endShape(CLOSE);
			counter++;
		}
		// console.log(counter);
		pop();
	}

	generatePQTessellation(p, q, numLayers=null, coverage=0.986) {
		let angle, vertices = [];
		const d = Poincare.regPolyDist(p, q);
		this.polygons = [];

		if (numLayers === null) {
			const hypDistToOrigin = Math.log((1 + d) / (1 - d));
			const hypDistForCoverage = Math.log((1 + coverage) / (1 - coverage));
			numLayers = Math.ceil(hypDistForCoverage / hypDistToOrigin);
			console.log(d, numLayers, Math.log((1 + d) / (1 - d)));
		}

		for (let i=0; i<p; i++) {
			angle = 2 * i * PI / p + this.startingAngle;
			vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
		}

		const initialPoly = new HyperbolicPolygon(vertices, true);
		const centroidTable = new Map();
		let lastPollies = [initialPoly];
		this.polygons.push(initialPoly);
		centroidTable.set(initialPoly.hash(), 1);
		for (let layer=1; layer<numLayers; layer++) { // for each additional layer past layer 0:
			const newPollies = [];
			for (let poly of lastPollies) { // for each polygon in the last layer:
				for (let i=0; i<poly.length; i++) { // for each vertex of the polygon:
					const index1 = i, index2 = (i + 1) % poly.length;


					// const specIndex = (layer % 2 == 1) ? (Math.min(index1, index2) - 1 + p) % p : (Math.max(index1, index2) + 1 + p) % p;
					// const specIndex = (layer % 2 == 1) ? (index1 - 1 + p) % p : (index2 + 1 + p) % p;
					const specIndex = (layer % 2 == 1) ? (index1 - layer +1 + p) % p : (index2 + layer - 1 + p) % p;

					// const specIndex1 = (Math.min(index1, index2) - 1 + p) % p;
					// const specIndex2 = (Math.max(index1, index2) + 1 + p) % p;
					if (poly.isOuter(index1) && poly.isOuter(index2)) {
						// these two vertices form a reflection edge into the next layer; reflect
						const v1 = poly.get(index1);
						const v2 = poly.get(index2);
						let newPoly = new HyperbolicPolygon(Poincare.reflectMultiple(poly.vertices, v1, v2), false, false);
						let hash = newPoly.hash();

						for (let j=0; j<newPoly.length; j++) {
							if (j !== index1 && j !== index2) {
								newPoly.setOuter(j);
							}
						}

						// add the reflected polygon to the new layer

						if ((centroidTable.get(hash) === undefined) && poly.isOuter(specIndex)) {
						// if (poly.get(specIndex).norm() > poly.euclideanCentroid.norm()) {
						// if (true) {
						// if (poly.isOuter(specIndex1) && poly.isOuter(specIndex2)) {
							// const result = oddlySpecificSortingFunction(newPoly);
							// newPoly.vertices = result.verts;
							// newPoly.outer = result.outer;
							newPollies.push(newPoly);
							this.polygons.push(newPoly);

							// const inverted = newPoly.invert();
							// if (inverted !== null) this.polygons.push(inverted);

							centroidTable.set(hash, 1);
							// console.log(this.polygons.length, specIndex, index1, index2, layer, "drawn");
						} else {
							// console.log("XX", specIndex, index1, index2, layer, "ignored");
						}

						/*
						do the rotations corresponding to one of the vertices of the reflection edge
						we choose as convention the vertex with the highest argument (reflection edges
						are never both on the same radius of the disk - reflecting about a radius remains
						in the same layer)
						*/
						const rotationVertex = sortCounterclockwise([v1, v2])[layer % 2];
						const rotationIndex = (rotationVertex.equals(v1) ? index1 : index2);
						const rotationAngle = (2 * Math.PI) / q;
						for (let k=0; k<q-3; k++) {
							newPoly = new HyperbolicPolygon(Poincare.rotateMultiple(newPoly.vertices, rotationVertex, rotationAngle), false, true);
							hash = newPoly.hash();
							if (centroidTable.get(hash) === undefined) {
								for (let l=0; l<newPoly.length; l++) {
									if (l != rotationIndex) newPoly.setOuter(l);
								}
								// add the rotated polygon to the new layer
								// const result = oddlySpecificSortingFunction(newPoly);
								// newPoly.vertices = result.verts;
								// newPoly.outer = result.outer;
								
								newPollies.push(newPoly);
								this.polygons.push(newPoly);

								// const inverted = newPoly.invert();
								// if (inverted !== null) this.polygons.push(inverted);

								centroidTable.set(newPoly.hash(), 1);
							}
						}
					}
				}
			}
			// advance to next layer
			// lastPollies = sortPolygonsCC(newPollies.slice());
			lastPollies = newPollies.slice();
		}

		this.polysGenerated = true;
	}

	calculateResolution(poly) {
		/*
		Given a polygon, this calculates an estimate for the minimum resolution (samples per edge)
		at which the polygon can be drawn (apparently) faithfully to the screen given its size in
		pixel space
		*/
		const roughSize = Euclid.distance(this.recenter(poly.euclideanCentroid),
										this.recenter(poly.vertices[0]));
		return Math.max(3, Math.floor(this.maxSamplesPerEdge * roughSize * poly.length));
	}

	draw() {
		background(255);
		noFill();
		if (this.model == "poincare-disk") {
			stroke(0);
			strokeWeight(1);
			circle(width / 2, height / 2, this.diskPixelSize);
		}

		// this.drawTrianglulatedPolygon(this.p, this.q);
		this.drawPQTessellation();
		fill(255);
		const tessellationCenter = this.coordinateTransform(this.tessellationCenter);
		circle(tessellationCenter.re, tessellationCenter.im, 10);
	}

	update() {
		if (this.needsUpdate) {
			this.draw();
			this.drawIndex = (this.drawIndex + .025) % this.polygons.length;
			this.needsUpdate = true;
		}
	}

}





function setup() {
	const canvas = createCanvas(windowWidth*.7, windowHeight);
	canvas.parent("canvas-div");
	document.getElementById("gui-div").style.height = windowHeight.toString() + "px";

	lastMouseX = mouseX;
	lastMouseY = mouseY;
	runningTime = 0;

	plot = new Plot();
	InputHandler.handlePQ();
	InputHandler.handleStartingAngle();
	InputHandler.handleModelSelect();
	InputHandler.handlePolygonStyling();

	// test();
}

function test() {

	z1 = complex(0, 1);
	z2 = complex(3, -2);

	console.log(z1+"");
	console.log(z1.conj()+"");
	console.log(z1.norm()+"");

	console.log(z2+"");
	console.log(z2.conj()+"");
	console.log(z2.norm()+"");

}

function windowResized() {
  resizeCanvas(windowWidth * 0.7, windowHeight);
  document.getElementById("gui-div").style.height = windowHeight.toString() + "px";
  plot.onResize();
}

function mouseDragged() {
	if ((0 <= mouseX && mouseX <= width) && (0 <= mouseY && mouseY <= height)) {
		lastMouseX = mouseX;
		lastMouseY = mouseY;
		let cartMouse = plot.reverseCoordinateTransform(complex(mouseX, mouseY));
		cartMouse = (cartMouse.normSq() <= 0.9025) ? cartMouse : cartMouse.unit().scale(0.95);
		plot.setTessellationCenter(cartMouse);
	}
}

function mousePressed() {
	if ((0 <= mouseX && mouseX <= width) && (0 <= mouseY && mouseY <= height)) {
		lastMouseX = mouseX;
		lastMouseY = mouseY;
		let cartMouse = plot.reverseCoordinateTransform(complex(mouseX, mouseY));
		cartMouse = (cartMouse.normSq() <= 0.9025) ? cartMouse : cartMouse.unit().scale(0.95);
		plot.setTessellationCenter(cartMouse);
	}
	// console.log(plot.reverseCoordinateTransform(complex(mouseX, mouseY)) + "");
}

function mouseReleased() {
	lastMouseX = 0;
	lastMouseY = 0;
}

function draw() {
	plot.update();
	runningTime += 1/frameRate();
}