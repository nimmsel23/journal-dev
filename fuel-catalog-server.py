#!/usr/bin/env python3
import asyncio
import json
import os
import yaml
from pathlib import Path
from aiohttp import web

# Resolve paths
BASE_DIR = Path(__file__).resolve().parent
NUTRITION_MEALS_DIR = BASE_DIR / "catalogs" / "nutrition" / "meals"
SUPPLEMENTS_CATALOG_PATH_YAML = BASE_DIR / "catalogs" / "supplements" / "catalog.yaml"
SUPPLEMENTS_CATALOG_PATH_JSON = BASE_DIR / "catalogs" / "supplements" / "catalog.json"

async def get_nutrition_meals(request):
    """List all nutrition meals or get a specific one."""
    meal_id = request.match_info.get('meal_id')
    
    if meal_id:
        # Try YAML first
        for ext in [".yaml", ".yml", ".json"]:
            file_path = NUTRITION_MEALS_DIR / f"{meal_id}{ext}"
            if file_path.exists():
                with open(file_path, 'r') as f:
                    if ext == ".json":
                        return web.json_response(json.load(f))
                    else:
                        return web.json_response(yaml.safe_load(f))
        return web.HTTPNotFound(text=f"Meal {meal_id} not found")
    
    # List all meals (support .json, .yaml, .yml)
    meals = [f.stem for f in NUTRITION_MEALS_DIR.glob("*") if f.suffix in [".json", ".yaml", ".yml"]]
    # Unique meals by stem
    meals = sorted(list(set(meals)))
    return web.json_response({"meals": meals})

async def get_supplements_catalog(request):
    """Get the supplements catalog."""
    if SUPPLEMENTS_CATALOG_PATH_YAML.exists():
        with open(SUPPLEMENTS_CATALOG_PATH_YAML, 'r') as f:
            return web.json_response(yaml.safe_load(f))
    if SUPPLEMENTS_CATALOG_PATH_JSON.exists():
        with open(SUPPLEMENTS_CATALOG_PATH_JSON, 'r') as f:
            return web.json_response(json.load(f))
    return web.HTTPNotFound(text="Supplements catalog not found")

async def init_app():
    app = web.Application()
    app.router.add_get('/catalogs/nutrition', get_nutrition_meals)
    app.router.add_get('/catalogs/nutrition/{meal_id}', get_nutrition_meals)
    app.router.add_get('/catalogs/supplements', get_supplements_catalog)
    return app

if __name__ == '__main__':
    app = asyncio.run(init_app())
    web.run_app(app, port=9050)
