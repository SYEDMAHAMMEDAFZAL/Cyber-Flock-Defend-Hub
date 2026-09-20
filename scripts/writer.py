import sys

def main():
    mode = sys.argv[1] # "w" or "a"
    target = sys.argv[2]
    content = sys.stdin.read()
    with open(target, mode, encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote {len(content)} chars to {target}")

if __name__ == "__main__":
    main()
