
import os

file_path = 'frontend/src/App.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '// ============================================' in line and 'DYNAMIC COMPONENT HELPERS' in lines[lines.index(line)+1 if lines.index(line)+1 < len(lines) else 0]:
        new_lines.append(line)
        new_lines.append(lines[lines.index(line)+1])
        new_lines.append(lines[lines.index(line)+2])
        skip = True
        continue
    
    if '// Featured properties for second slider' in line:
        skip = False
        
    if not skip:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("App.js cleaned up.")
