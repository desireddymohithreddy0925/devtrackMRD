import os
import glob

replacements = {
    "actions/checkout@v7": "actions/checkout@v4",
    "codecov/codecov-action@v7": "codecov/codecov-action@v4",
    "actions/upload-artifact@v7": "actions/upload-artifact@v4",
    "actions/labeler@v6": "actions/labeler@v5",
    "actions/github-script@v9": "actions/github-script@v7",
    "actions/stale@v10": "actions/stale@v9",
    "pnpm/action-setup@v6": "pnpm/action-setup@v4",
    "actions/setup-node@v6": "actions/setup-node@v4",
    "version: 11": "version: 9"
}

files = glob.glob(".github/workflows/*.yml")
for f in files:
    with open(f, "r") as file:
        content = file.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if content != new_content:
        with open(f, "w") as file:
            file.write(new_content)
        print(f"Updated {f}")
