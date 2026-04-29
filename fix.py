import re
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

fixed = content.replace('<span className={status-badge }>', '                <span className={status-badge }>')
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(fixed)
