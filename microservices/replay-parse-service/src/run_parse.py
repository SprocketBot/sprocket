import os
import sys
import json
import logging

# Set environment to development to pick up our config
os.environ["ENV"] = "development"
os.environ["CONFIG_DIR"] = "../config"

# Add current directory to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import parser

def main():
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    replay_path = "../17A7C1084017DFA7DBE66D9C66D81CBD.replay"
    
    if not os.path.exists(replay_path):
        print(f"Error: Replay file not found at {replay_path}")
        return

    print(f"Parsing replay: {replay_path}")
    
    try:
        result = parser.parse(replay_path, lambda msg: print(f"Progress: {msg}"))
        print("\nParsing successful!")
        print(f"Keys in result: {list(result.keys())}")
        
        # Print some basic stats to verify
        if 'gameMetadata' in result:
            print(f"Game Metadata: {result['gameMetadata']}")
            
    except Exception as e:
        print(f"Error parsing replay: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()