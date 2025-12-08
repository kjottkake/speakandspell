trials = [
    ["a", "b", "c"],
    ["d", "e", "f", "g"],
    ["h", "i", "j"]
]

max_len = 4
for xs in trials:
    if len(xs) == max_len:
        xs.pop()

print(trials)