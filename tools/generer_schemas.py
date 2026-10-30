"""Génère les schémas des cours (cours/svg/*.svg) à partir des descriptions de cours/*.js.

Usage, depuis le dossier du projet :
    python -m http.server 8000          (dans un premier terminal)
    python tools/generer_schemas.py     (dans un second terminal)

Le script s'arrête sans rien écrire si le validateur dessin–logique ou les états attendus
signalent une erreur.
"""
import asyncio, os, pathlib, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("ELEC_URL", "http://localhost:8000/")
SORTIE = pathlib.Path(__file__).resolve().parent.parent / "cours" / "svg"

async def main():
    async with async_playwright() as p:
        nav = await p.chromium.launch()
        pg = await nav.new_page()
        erreurs_page = []
        pg.on("pageerror", lambda e: erreurs_page.append(str(e)))
        await pg.goto(BASE + "cours/generer.html")
        await pg.wait_for_function("window.genererSchemasCours")
        await pg.evaluate("document.fonts.ready")
        r = await pg.evaluate("window.genererSchemasCours()")
        await nav.close()
    for b in r["bilan"]:
        print("  " + b)
    erreurs = erreurs_page + r["erreurs"]
    if erreurs:
        print("\nERREURS — aucun fichier écrit :")
        for e in erreurs:
            print("  - " + e)
        sys.exit(1)
    SORTIE.mkdir(parents=True, exist_ok=True)
    for f in r["fichiers"]:
        (SORTIE / f["nom"]).write_text(f["svg"], encoding="utf-8")
    print(f"\n{len(r['fichiers'])} fichiers écrits dans {SORTIE}")

asyncio.run(main())
