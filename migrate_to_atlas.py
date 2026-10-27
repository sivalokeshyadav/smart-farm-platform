"""
Script to migrate local MongoDB (smart_farmer_pilot) to MongoDB Atlas (Cloud)
Usage:
  python migrate_to_atlas.py "mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_farmer_pilot"
"""

import sys
from pymongo import MongoClient

def migrate(atlas_uri: str):
    print("Connecting to local MongoDB (localhost:27017)...")
    local_client = MongoClient("mongodb://localhost:27017")
    local_db = local_client["smart_farmer_pilot"]

    print(f"Connecting to MongoDB Atlas...")
    atlas_client = MongoClient(atlas_uri)
    atlas_db = atlas_client["smart_farmer_pilot"]

    collections = local_db.list_collection_names()
    print(f"Found {len(collections)} collections to migrate.")

    for col_name in collections:
        if col_name.startswith("system."):
            continue
        local_col = local_db[col_name]
        atlas_col = atlas_db[col_name]

        docs = list(local_col.find({}))
        if not docs:
            print(f" - {col_name}: 0 docs (skipped)")
            continue

        atlas_col.delete_many({})
        atlas_col.insert_many(docs)
        print(f" - {col_name}: successfully migrated {len(docs)} documents")

    print("\n✅ Migration complete! All users, bookings, godowns, and profiles now persist in MongoDB Atlas.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Please provide your MongoDB Atlas connection string.")
        print("Example: python migrate_to_atlas.py \"mongodb+srv://admin:pass@cluster0.mongodb.net/smart_farmer_pilot\"")
        sys.exit(1)
    migrate(sys.argv[1])
