"""Tests de non-régression d'Élec TIIN dans un vrai navigateur (Playwright + Chromium).

Usage, depuis le dossier du projet :
    python -m http.server 8000          (dans un premier terminal)
    python tests/test_app.py            (dans un second terminal)
Option : python tests/test_app.py --captures   enregistre des captures dans tests/captures/
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("ELEC_URL", "http://localhost:8000/")
CAPTURES = "--captures" in sys.argv
resultats = []

def verifie(cond, nom):
    resultats.append((bool(cond), nom))
    print(("  OK  " if cond else "  ÉCHEC ") + nom)

async def etat(pg):
    return (await pg.inner_text("#etat")).strip().lower()

async def appui(pg, texte, duree=150):
    b = pg.locator(".bp", has_text=texte).first
    await b.hover()
    await pg.mouse.down(); await pg.wait_for_timeout(duree); await pg.mouse.up()
    await pg.wait_for_timeout(150)

async def capture(pg, nom):
    if CAPTURES:
        os.makedirs("tests/captures", exist_ok=True)
        await pg.screenshot(path=f"tests/captures/{nom}.png", full_page=True)

async def main():
    async with async_playwright() as p:
        nav = await p.chromium.launch()
        pg = await nav.new_page(viewport={"width": 1280, "height": 860})
        erreurs = []
        pg.on("pageerror", lambda e: erreurs.append(str(e)))
        pg.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)

        print("Atelier")
        await pg.goto(BASE + "#/atelier"); await pg.wait_for_timeout(600)
        verifie(await pg.locator(".carte[href]").count() == 3, "trois schémas dans l'Atelier")
        await capture(pg, "atelier")

        print("Démarrage direct un sens")
        await pg.goto(BASE + "#/atelier/direct-un-sens"); await pg.wait_for_timeout(400)
        verifie("arrêt" in await etat(pg), "à l'arrêt au départ")
        await appui(pg, "S2 Marche")
        verifie("marche" in await etat(pg), "S2 démarre le moteur et l'auto-maintien le garde en marche")
        await capture(pg, "direct-marche")
        await appui(pg, "S1 Arrêt")
        verifie("arrêt" in await etat(pg), "S1 arrête le moteur")
        await pg.locator(".app-btn", has_text="Q3").click(); await pg.wait_for_timeout(100)
        await appui(pg, "S2 Marche")
        verifie("arrêt" in await etat(pg), "sans Q3, la commande est hors tension")
        await pg.locator(".app-btn", has_text="Q3").click(); await pg.wait_for_timeout(100)
        await appui(pg, "S2 Marche")
        await pg.locator("button", has_text="Surcharge moteur").click(); await pg.wait_for_timeout(150)
        verifie("défaut" in await etat(pg), "la surcharge fait déclencher Q1")
        await pg.locator(".app-btn", has_text="Q1").click(); await pg.wait_for_timeout(100)
        verifie("arrêt" in await etat(pg), "Q1 se réarme, le moteur reste à l'arrêt")

        print("Deux sens de marche")
        await pg.goto(BASE + "#/atelier/deux-sens"); await pg.wait_for_timeout(400)
        await appui(pg, "S2 Sens 1")
        verifie("sens 1" in await etat(pg), "S2 : marche sens 1")
        await appui(pg, "S3 Sens 2")
        verifie("sens 1" in await etat(pg), "verrouillage : S3 sans effet en sens 1")
        await appui(pg, "S1 Arrêt"); await appui(pg, "S3 Sens 2")
        verifie("sens 2" in await etat(pg), "S3 après l'arrêt : marche sens 2")
        await capture(pg, "deux-sens")
        await pg.locator("button", has_text="Surcharge moteur").click(); await pg.wait_for_timeout(150)
        verifie("défaut" in await etat(pg), "F1 déclenche sur surcharge")
        verifie(await pg.locator(".voyant.allume").count() == 2, "voyants H3 (surcharge) et H4 (sous tension) allumés")
        await pg.locator(".app-btn", has_text="AU").click(); await pg.wait_for_timeout(100)
        await pg.locator(".app-btn", has_text="F1").click(); await pg.wait_for_timeout(100)
        await appui(pg, "S2 Sens 1")
        verifie("sens" not in await etat(pg), "arrêt d'urgence enfoncé : pas de démarrage")

        print("Étoile-triangle")
        await pg.goto(BASE + "#/atelier/etoile-triangle"); await pg.wait_for_timeout(400)
        await appui(pg, "S2 Marche")
        verifie("étoile" in await etat(pg), "démarrage en étoile")
        await capture(pg, "etoile")
        await pg.wait_for_timeout(5600)
        verifie("triangle" in await etat(pg), "passage en triangle après la temporisation")
        await capture(pg, "triangle")
        await appui(pg, "S1 Arrêt")
        verifie("arrêt" in await etat(pg), "S1 arrête le moteur")

        print("Symboles")
        await pg.goto(BASE + "#/symboles"); await pg.wait_for_timeout(500)
        nb = await pg.locator(".fiche").count()
        verifie(nb >= 20, f"imagier complet ({nb} symboles)")
        await capture(pg, "symboles")
        await pg.goto(BASE + "#/symboles/jeu"); await pg.wait_for_timeout(300)
        for _ in range(10):
            await pg.locator(".choix button").first.click()
            await pg.locator(".suite").click()
        verifie(await pg.locator(".bilan").count() == 1, "série de dix questions jusqu'au bilan")

        print("Défis")
        async def defi(n, pieces):
            await pg.goto(BASE + f"#/defis/{n}"); await pg.wait_for_timeout(400)
            for lettre, titre in pieces:
                await pg.locator(f'.emplacements button[data-l="{lettre}"]').click()
                await pg.locator(".piece", has_text=titre).first.click()
            await pg.locator("#tester").click()
            await pg.locator("#verdict:not([hidden])").wait_for(timeout=30000)
            return (await pg.inner_text("#verdict")).lower()
        await pg.goto(BASE + "#/defis"); await pg.wait_for_timeout(300)
        verifie(await pg.locator(".niveau").count() == 5, "cinq défis proposés")
        v = await defi(1, [("A", "Contact NO de KM1")])
        verifie("réussi" in v, "défi 1 réussi avec le contact NO de KM1")
        await capture(pg, "defi-1-reussi")
        v = await defi(1, [("A", "Contact NF de KM1")])
        verifie("pompage" in v, "défi 1 : un contact NF de KM1 fait battre le contacteur")
        v = await defi(1, [("A", "Second contact NO de S2")])
        verifie("relâche" in v, "défi 1 : un contact de S2 ne maintient pas")
        v = await defi(2, [("A", "Bouton-poussoir NF"), ("B", "Disjoncteur-moteur")])
        verifie("réussi" in v, "défi 2 réussi avec S1 NF et le disjoncteur-moteur")
        v = await defi(2, [("A", "Bouton-poussoir NF"), ("B", "Sectionneur")])
        verifie("grillé" in v, "défi 2 : avec un sectionneur, la surcharge grille le moteur")
        await capture(pg, "defi-2-grille")
        v = await defi(2, [("A", "Bouton-poussoir NO"), ("B", "Disjoncteur-moteur")])
        verifie("ne démarre pas" in v, "défi 2 : un arrêt NO empêche tout démarrage")
        v = await defi(3, [("A", "Bouton-poussoir NF"), ("B", "Bouton-poussoir NF"), ("C", "Contact NO de KM1")])
        verifie("tout seul" in v, "défi 3 : une marche NF démarre le moteur toute seule")
        v = await defi(3, [("A", "Bouton-poussoir NO"), ("B", "Bouton-poussoir NF"), ("C", "Contact NO de KM1")])
        verifie("réussi" in v, "défi 3 réussi")
        v = await defi(4, [("A", "Contact NF de KM2"), ("B", "Contact NF de KM1")])
        verifie("réussi" in v, "défi 4 réussi avec les deux contacts NF de verrouillage")
        v = await defi(4, [("A", "Simple fil"), ("B", "Contact NF de KM1")])
        verifie("court-circuit" in v, "défi 4 : sans verrouillage, S2 en sens 2 provoque un court-circuit")
        await capture(pg, "defi-4-court-circuit")
        v = await defi(4, [("A", "Contact NO de KM2"), ("B", "Contact NF de KM1")])
        verifie("ne démarre pas en sens 1" in v, "défi 4 : un contact NO bloque le sens 1")
        v = await defi(5, [("A", "Contact temporisé NF de KM2"), ("B", "Contact temporisé NO de KM2")])
        verifie("réussi" in v, "défi 5 réussi : passage étoile puis triangle")
        v = await defi(5, [("A", "Contact NF instantané de KM2"), ("B", "Contact temporisé NO de KM2")])
        verifie("ne démarre pas en étoile" in v, "défi 5 : un NF instantané supprime l'étoile")
        v = await defi(5, [("A", "Contact temporisé NF de KM2"), ("B", "Contact temporisé NF de KM2")])
        verifie("triangle" in v and "réussi" not in v, "défi 5 : un temporisé NF empêche le triangle")
        await capture(pg, "defi-5")

        print("Consignation")
        async def k(key):
            await pg.locator(f'[data-k="{key}"]').first.click(); await pg.wait_for_timeout(60)
        async def dernier():
            return (await pg.inner_text("#journal")).split("\n")[0].lower()
        await pg.goto(BASE + "#/consignation"); await pg.wait_for_timeout(300)
        verifie(await pg.locator(".niveau").count() == 4, "quatre activités de consignation")
        await pg.goto(BASE + "#/consignation/guidee"); await pg.wait_for_timeout(400)
        await k("man:Q1")
        verifie("pompe p1" in await dernier(), "guidée : Q1 refusé, ce n'est pas l'ouvrage")
        await k("man:Q2"); await k("cad:Q2")
        verifie("deuxième source" in await dernier(), "guidée : condamner avant d'ouvrir Q3 est refusé")
        await k("man:Q3"); await k("cad:Q2"); await k("cad:Q3"); await k("ident")
        await k("vat:test")
        verifie("hors service" in await dernier(), "guidée : le test révèle un VAT en panne")
        await k("vat:mesure")
        verifie("teste le vat" in await dernier(), "guidée : mesure refusée sans VAT testé")
        for key in ["vat:piles", "vat:test", "vat:mesure", "vat:test", "malt", "att:B2"]:
            await k(key)
        verifie("consigné" in await etat(pg), "guidée : M2 consigné et à la terre")
        await capture(pg, "consignation-guidee")
        await k("travaux"); await pg.wait_for_timeout(5800)
        j = (await pg.inner_text("#journal")).lower()
        verifie("cadenas l'en empêche" in j and "reste hors tension" in j, "guidée : cadenas et Q3 consigné protègent pendant les travaux")
        await k("avis"); await k("cad:Q2")
        verifie("d'abord la malt-cc" in await dernier(), "guidée : la MALT-CC se retire avant les cadenas")
        for key in ["malt", "cad:Q2", "cad:Q3", "man:Q2", "man:Q3"]:
            await k(key)
        verifie("terminée" in (await pg.inner_text("#consigne")).lower(), "guidée : procédure complète jusqu'à la remise en service")

        await pg.goto(BASE + "#/consignation/erreurs"); await pg.wait_for_timeout(400)
        for key in ["man:Q2", "vat:mesure", "att:B2"]:
            await k(key)
        await k("travaux"); await pg.wait_for_timeout(6000)
        b = (await pg.inner_text("#docs")).lower()
        verifie("accident" in b, "erreurs : Q2 seul sans cadenas, l'électricien est électrisé")
        await capture(pg, "consignation-erreurs")
        await pg.locator("#recommencer").click(); await pg.wait_for_timeout(200)
        for key in ["man:Q2", "man:Q3", "cad:Q2", "vat:test", "vat:piles", "vat:test", "vat:mesure", "vat:test", "malt", "att:B2"]:
            await k(key)
        await k("travaux"); await pg.wait_for_timeout(6000)
        b = (await pg.inner_text("#docs")).lower()
        verifie("grâce à la malt-cc" in b, "erreurs : Q3 non condamné, la MALT-CC sauve l'équipe")
        await pg.locator("#recommencer").click(); await pg.wait_for_timeout(200)
        await k("malt")
        verifie("arc électrique" in await dernier(), "erreurs : MALT-CC posée sous tension, arc électrique")

        await pg.goto(BASE + "#/consignation/roles"); await pg.wait_for_timeout(300)
        for _ in range(7):
            await pg.locator("#quiz .choix button").first.click()
            await pg.locator("#quiz .suite").click()
        verifie(await pg.locator("#quiz .bilan").count() == 1, "quiz des rôles jusqu'au bilan")
        await pg.goto(BASE + "#/consignation/fluides"); await pg.wait_for_timeout(300)
        await pg.click("#fuite")
        v0 = (await pg.inner_text("#verdictFl")).lower()
        await pg.click('[data-n="R1"]')
        v1 = (await pg.inner_text("#verdictFl")).lower()
        verifie("atteint la zone" in v0 and "reste hors pression" in v1, "fluides : la purge intermédiaire protège en cas de fuite")

        print("Largeur téléphone (360 px)")
        await pg.set_viewport_size({"width": 360, "height": 780})
        for route in ["#/atelier", "#/atelier/direct-un-sens", "#/atelier/deux-sens", "#/atelier/etoile-triangle", "#/symboles", "#/symboles/jeu", "#/defis", "#/defis/2", "#/defis/4", "#/defis/5", "#/consignation", "#/consignation/guidee", "#/consignation/erreurs", "#/consignation/roles", "#/consignation/fluides", "#/infos"]:
            await pg.goto(BASE + route); await pg.wait_for_timeout(300)
            deborde = await pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            verifie(not deborde, f"pas de défilement horizontal sur {route}")

        verifie(not erreurs, "aucune erreur JavaScript" + (" : " + " | ".join(erreurs[:3]) if erreurs else ""))
        await nav.close()

    echecs = [n for ok, n in resultats if not ok]
    print(f"\n{len(resultats) - len(echecs)} vérifications réussies sur {len(resultats)}.")
    sys.exit(1 if echecs else 0)

asyncio.run(main())
