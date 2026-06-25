import os
import json
import yaml
from pathlib import Path

def convert_json_to_yaml():
    base_dir = Path("/home/alpha/fuel-dev/catalogs/nutrition/meals")
    if not base_dir.exists():
        print(f"Directory {base_dir} not found.")
        return

    for json_file in base_dir.glob("*.json"):
        yaml_file = json_file.with_suffix(".yaml")
        
        # Skip if yaml already exists to avoid overwriting manual changes during migration
        if yaml_file.exists():
            print(f"Skipping {json_file.name}, {yaml_file.name} already exists.")
            continue
            
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            with open(yaml_file, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, allow_unicode=True, sort_keys=False, indent=2)
            
            print(f"Converted {json_file.name} -> {yaml_file.name}")
        except Exception as e:
            print(f"Error converting {json_file.name}: {e}")

if __name__ == "__main__":
    convert_json_to_yaml()
