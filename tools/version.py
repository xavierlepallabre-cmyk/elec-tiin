"""Met à jour le numéro de cache du service worker à partir du contenu des fichiers.

Usage, depuis le dossier du projet :  python tools/version.py
Les tablettes proposent ensuite « Mettre à jour » à la prochaine ouverture avec connexion.
"""
import hashlib, pathlib, re

racine = pathlib.Path(__file__).resolve().parent.parent
sw = racine / "sw.js"
texte = sw.read_text(encoding="utf-8")
fichiers = re.findall(r"'\./([^']*)'", texte.split("const ASSETS=")[1].split("];")[0])
h = hashlib.sha256()
for f in sorted(x for x in fichiers if x):
    p = racine / f
    if not p.exists():
        raise SystemExit(f"Fichier listé dans sw.js mais absent : {f}")
    h.update(f.encode()); h.update(p.read_bytes())
h.update((racine / "index.html").read_bytes())
version = "elec-tiin-" + h.hexdigest()[:10]
nouveau = re.sub(r"const CACHE='[^']*';", f"const CACHE='{version}';", texte)
sw.write_text(nouveau, encoding="utf-8")
print("Cache :", version)
