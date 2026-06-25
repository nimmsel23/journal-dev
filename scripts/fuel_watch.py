import time
import yaml
import json
import os
import sys
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
WATCH_DIR = "/home/alpha/fuel-dev/catalogs/nutrition/meals"
# We could trigger the existing JS sync or implement Python-based Firestore push here.
# For now, let's focus on detecting changes and potentially triggering a sync.

class CatalogHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".yaml"):
            print(f"📝 Change detected in YAML: {os.path.basename(event.src_path)}")
            self.sync_to_cloud(event.src_path)

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".yaml"):
            print(f"✨ New YAML created: {os.path.basename(event.src_path)}")
            self.sync_to_cloud(event.src_path)

    def sync_to_cloud(self, file_path):
        print(f"🚀 Triggering Cloud Sync for {os.path.basename(file_path)}...")
        # Strategy: Since firestore-sync.mjs already has the logic to bundle everything,
        # the most robust way is to trigger 'npm run sync:push'.
        # However, for catalog-only, we could eventually optimize this in Python.
        os.system(f"cd /home/alpha/fuel-dev && npm run sync:push > /dev/null 2>&1 &")
        print("✅ Sync triggered in background.")

if __name__ == "__main__":
    print(f"🔍 Monitoring {WATCH_DIR} for changes...")
    event_handler = CatalogHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIR, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
