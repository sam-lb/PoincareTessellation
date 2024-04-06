from pyperclip import copy
import json


def simplify(word):
    while len(word) > 1:
        first, second = word[:2]
        if first == second:
            word = first + word[2:]
        else:
            break
    return word


def generate_words(max_length, chars="abc"):
    if (max_length > 10):
        raise Exception("nah")
    
    last_layer = list(chars)
    results = list(chars)
    for k in range(2, max_length + 1):
        layer = []
        for char in chars:
            for word in last_layer:
                new_word = char + word
                reduced = simplify(new_word)
                if (len(reduced) == len(new_word)):
                    results.append(reduced)
                    layer.append(reduced)
        last_layer = layer[:]
    
    return len(results), results

def make_json(words):
    result = dict()
    for word in words:
        length = len(word)
        if result.get(length):
            result[length].append(word)
        else:
            result[length] = [word]
    print(result)
    for i in range(1, 6):
        print(len(result[i]))
    return json.dumps(result)

# https://oeis.org/A068156
if __name__ == "__main__":
    length, words = generate_words(5)
    print(length)
    if (length < 10000):
        print(words)
        copy(make_json(words))