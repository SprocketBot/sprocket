#!/usr/bin/env python3
"""
Script to apply the dual import pattern to TypeORM entity files.
This converts imports like:
  import { SomeEntity } from '../internal';
To:
  import { SomeEntity } from '../path/entity.entity';
  import type { SomeEntity as SomeEntityType } from '../path/entity.entity';
And updates property types from 'SomeEntity' to 'SomeEntityType'.
"""

import re
import sys
from pathlib import Path

def fix_entity_file(filepath):
    """Apply dual import pattern to a single entity file."""
    content = filepath.read_text()
    original = content
    
    # Pattern to find imports from '../internal'
    internal_import_pattern = r"import \{ ([A-Z]\w+Entity) \} from '\.\./internal';"
    
    matches = list(re.finditer(internal_import_pattern, content))
    if not matches:
        return False  # No changes needed
    
    print(f"Processing {filepath}...")
    
    replacements = []
    for match in matches:
        entity_name = match.group(1)
        entity_type_name = f"{entity_name}Type"
        
        # Convert entity name to file path (e.g., GameEntity -> game/game.entity)
        # Simple heuristic: remove 'Entity' suffix, convert to snake_case
        base_name = entity_name.replace('Entity', '')
        snake_case = re.sub(r'([A-Z])', r'_\1', base_name).lower().lstrip('_')
        entity_path = f"../{snake_case}/{snake_case}.entity"
        
        # Create dual import
        dual_import = f"""import {{ {entity_name} }} from '{entity_path}';
import type {{ {entity_name} as {entity_type_name} }} from '{entity_path}';"""
        
        replacements.append((match.group(0), dual_import, entity_name, entity_type_name))
    
    # Apply import replacements
    for old, new, entity_name, entity_type_name in replacements:
        content = content.replace(old, new, 1)
        
        # Replace property types (but NOT in decorators)
        # This is tricky - we need to replace ': EntityName' but not '() => EntityName'
        # Simple approach: replace in property declarations
        content = re.sub(
            rf'(\s+[a-z]\w*:\s*){entity_name}(\[\])?;',
            rf'\1{entity_type_name}\2;',
            content
        )
    
    if content != original:
        filepath.write_text(content)
        print(f"  ✓ Fixed {len(replacements)} imports")
        return True
    
    return False

def main():
    # Find all entity files
    db_path = Path("core/src/db")
    entity_files = list(db_path.rglob("*.entity.ts"))
    
    fixed_count = 0
    for filepath in entity_files:
        if fix_entity_file(filepath):
            fixed_count += 1
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
