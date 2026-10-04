/**
 * German intro-dialog copy per level. Code, commands and HTTP terms stay
 * in English inside the text. Each entry becomes: ModalAlert (intro),
 * optional ApiDemo (demo), then the goal list.
 */

export const DE_DIALOGS = {
  'http-01': {
    intro: [
      '## Endpoints',
      'Eine API stellt **Endpoints** bereit: adressierbare Operationen auf einem Server. Jeder Endpoint verbindet eine HTTP-Methode mit einem Pfad.',
      'In FastAPI wird dies mit einem Dekorator registriert: `@app.get("/")` verarbeitet `GET /`.',
      'Die Funktion unter dem Dekorator wird bei Eintreffen eines Requests ausgeführt und liefert JSON zurück.',
    ],
    demo: {
      before: 'Registriere `GET /` und beobachte, wie der Knoten auf der API-Oberfläche erscheint.',
      after: '`GET /` ist live. Rufe den Endpoint aus der Konsole auf: `call GET /` ',
      command: 'call GET /',
    },
  },
  'http-02': {
    intro: [
      '## HTTP-Methoden',
      '`GET` liest Daten. `POST` erstellt Ressourcen. `PUT`/`PATCH` modifizieren sie. `DELETE` löscht.',
      'Ein Pfad mit verschiedenen Methoden repräsentiert unterschiedliche Endpoints. Verwende `@app.post(..., status_code=201)` für den Erstellungsstatus.',
    ],
  },
  'fastapi-01': {
    intro: [
      '## Pfad-Parameter',
      'Teile des Pfads in geschweiften Klammern sind **Pfad-Parameter**: `/users/{user_id}` matched `/users/42` mit `user_id=42`.',
      'Deklariere den Typ in der Funktionssignatur. FastAPI validiert automatisch: Für `int` wird der Wert `ada` mit **422 Unprocessable Entity** abgewiesen.',
      'Nach dem Kompilieren testen: `call GET /users/ada`.',
    ],
  },
  'fastapi-02': {
    intro: [
      '## Query-Parameter',
      'Alles nach dem Fragezeichen `?` gehört zum Query-String: `GET /search?q=ada&limit=2`.',
      'In FastAPI werden Funktionsargumente, die nicht im Pfad vorkommen, automatisch als Query-Parameter interpretiert. Standardwerte machen sie optional.',
      'Drücke `run` und teste `call GET /search?q=ada&limit=2`, um das Parsing zu beobachten.',
    ],
  },
  'fastapi-03': {
    intro: [
      '## Request-Body',
      'Schreibende Operationen erwarten oft einen **JSON-Body**. FastAPI validiert diesen mithilfe eines Pydantic-`BaseModel`.',
      'Das OpenAPI-Dokument deklariert anschließend `components.schemas.User` — genau das, was Swagger UI anzeigt.',
      'Senden: `call POST /users body={"name":"ada","age":36}`.',
    ],
  },
  'fastapi-04': {
    intro: [
      '## Statuscodes',
      '200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Validation Error',
      'Nutze präzise Statuscodes, um dem Client das Ergebnis mitzuteilen. Ein erfolgreiches `DELETE` liefert typischerweise **204** ohne Body zurück.',
    ],
  },
  'fastapi-05': {
    intro: [
      '## CRUD-Ressourcen',
      'Eine Ressource ist mehr als ein einzelner Pfad. **C**reate via `POST`, **R**ead via `GET`, **U**pdate via `PUT`, **D**elete via `DELETE`.',
      'Derselbe Pfad `/notes/{note_id}` dient zum Lesen, Bearbeiten und Löschen; der Collection-Pfad `/notes` zum Auflisten und Erstellen.',
      'So werden produktive REST-APIs strukturiert.',
    ],
  },
  'fastapi-06': {
    intro: [
      '## Fehler als Teil des API-Contracts',
      'Eine nicht gefundene Ressource ist ein **404** — kein interner Stack-Trace und kein stummes `200` mit `null`.',
      'In FastAPI wird dies mit `raise HTTPException(status_code=404, detail="...")` ausgelöst.',
      'OpenAPI listet 404 unter `responses` auf; Clients und Swagger UI können sich darauf verlassen.',
      'Nach Run ausführen: `call GET /items/99`.',
    ],
  },
  'fastapi-07': {
    intro: [
      '## Dependency Injection (Depends)',
      'Ein Handler sollte DB-Sessions oder Konfigurationen nicht manuell instanziieren. **Dependencies** sind modulare Provider, die FastAPI automatisch injiziert.',
      '```\ndef get_settings():\n    return {"app_name": "LearnAPI"}\n\n@app.get("/info")\ndef info(settings: dict = Depends(get_settings)):\n    return {"app": settings["app_name"]}\n```',
      'Das ist das Rückgrat moderner FastAPI-Architekturen für Authentifizierung, Datenbanken und Configs.',
    ],
  },
  'fastapi-08': {
    intro: [
      '## Authentifizierung als Contract',
      'API-Keys werden häufig als **HTTP-Header** übergeben. FastAPI deklariert sie via `Header(...)`, und OpenAPI publiziert `securitySchemes`.',
      'Swagger UI zeigt dafür ein Schloss-Symbol an: Kein Zierelement, sondern ein valider Contract zur Codegenerierung.',
      'Ohne Header antwortet der Server mit **401**. Mit `headers={"X-API-Key":"secret"}` ist der Zugriff autorisiert.',
    ],
  },
  'fastapi-09': {
    intro: [
      '## response_model',
      'Was eine Funktion intern erzeugt, unterscheidet sich oft von dem, was sie **garantiert**. `response_model=UserOut` sichert die öffentliche Struktur ab.',
      'In FastAPI filtert dies auch vertrauliche interne Felder heraus. Clients verlassen sich auf dieses Schema.',
      'Prüfe nach dem Ausführen `components.schemas.UserOut` in OpenAPI.',
    ],
  },
  'plumber-01': {
    intro: [
      '## Plumber-Dekoratoren (R)',
      'Plumber verwandelt R-Funktionen mittels **roxygen2-Kommentaren** in HTTP-Endpoints.',
      '```\n#* @get /\nfunction() list(hello = "world")\n```',
      'Der Kommentar `#* @get /` bindet die nachfolgende Funktion an `GET /`. Eine zurückgegebene `list()` wird automatisch zu JSON serialisiert.',
    ],
  },
  'plumber-02': {
    intro: [
      '## Pfad-Parameter in Plumber',
      'Spitze Klammern definieren Pfad-Parameter: `#* @get /users/<id>` matched `/users/7`.',
      'Deklariere sie mit `#* @param id:int` und nimm `id` in die Funktionsargumente auf.',
      'Dies ist das R-Äquivalent zu FastAPI `/users/{user_id}`.',
    ],
  },
  'plumber-03': {
    intro: [
      '## Request-Body in Plumber',
      'Für `POST` nimmt die Funktion das `req`-Objekt entgegen und liest `req$postBody` (JSON-String). Geparsed wird mit `jsonlite::fromJSON`.',
      'Den Statuscode steuerst du mit `#* @status 201`; das Äquivalent zu FastAPIs `status_code=201`.',
      'Testen: `call POST /users body={"name":"ada"}`.',
    ],
  },
  'openapi-01': {
    intro: [
      '## OpenAPI / Swagger',
      'Jede FastAPI-Anwendung generiert automatisch ein **OpenAPI**-Dokument: `info`, `paths` und `components`.',
      'Swagger UI ist lediglich ein *Renderer* dieser Spezifikation. Tags gruppieren Operationen und summaries beschreiben sie.',
      'Drücke **Run**, öffne den OpenAPI-Tab und nutze `openapi` in der Konsole.',
    ],
  },
  'openapi-02': {
    intro: [
      '## components.schemas',
      'Benannte Modelle bilden den Contract, aus dem Client-SDKs generiert werden.',
      'Ein `BaseModel`, das als Body dient, wird zu `#/components/schemas/Item` und im `requestBody` referenziert.',
      'Nach `run` findest du genau dieses Schema im OpenAPI-Panel wieder.',
    ],
  },
  'compare-01': {
    intro: [
      '## Ein Contract, zwei Runtimes',
      'Der OpenAPI-Contract ist technologieunabhängig. FastAPI und Plumber publizieren identische Pfade, Methoden und Schemas.',
      'Hier implementierst du die FastAPI-Seite. Vergleiche im nächsten Level die Plumber-Annotationen mit den Python-Dekoratoren.',
      '```\n#* @get /health\nfunction() list(status = "ok")\n```',
    ],
  },
  'compare-02': {
    intro: [
      '## Das Plumber-Gegenstück',
      'Dieselben zwei Endpoints, geschrieben in R. Roxygen2-Kommentare ersetzen Python-Dekoratoren, und `list()` ersetzt Dictionaries.',
      'Die resultierende OpenAPI-Spezifikation ist nahezu identisch — Clients bemerken keinen Unterschied in der Backend-Technologie.',
    ],
  },
};
