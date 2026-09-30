import os
import shutil
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "_site"
ROUTES = {
    "/": "index.html",
    "/generator": "generator/index.html",
    "/concepts": "concepts/index.html",
    "/algorithm": "algorithm/index.html",
    "/test-cases": "test-cases/index.html",
    "/history": "history/index.html",
    "/conclusion": "conclusion/index.html",
}


def main():
    sys.path.insert(0, str(ROOT))
    from app import app

    repository = os.environ.get("GITHUB_REPOSITORY", "")
    configured_base_path = os.environ.get("PAGES_BASE_PATH")
    base_path = configured_base_path or (f"/{repository.rsplit('/', 1)[-1]}" if repository else "")
    base_path = f"/{base_path.strip('/')}" if base_path.strip("/") else ""

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)
    OUTPUT_DIR.mkdir(parents=True)

    client = app.test_client()
    for route, relative_output in ROUTES.items():
        response = client.get(route, environ_overrides={"SCRIPT_NAME": base_path})
        if response.status_code >= 400:
            raise RuntimeError(f"Failed to render route {route}: HTTP {response.status_code}")
        content = response.get_data(as_text=True)

        api_script = f'<script src="{base_path}/static/js/api.js"></script>'
        static_mode = f"<script>window.PINGALA_STATIC = true;</script>{api_script}"
        if api_script not in content:
            raise RuntimeError(f"Could not find API script in rendered page: {route}")
        content = content.replace(api_script, static_mode, 1)

        for page_route in ROUTES:
            if page_route != "/":
                content = content.replace(
                    f'href="{base_path}{page_route}"',
                    f'href="{base_path}{page_route}/"',
                )

        destination = OUTPUT_DIR / relative_output
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(content, encoding="utf-8")

    shutil.copytree(ROOT / "static", OUTPUT_DIR / "static")
    print(f"Built {len(ROUTES)} GitHub Pages routes in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()