/**
 * German intro-dialog lessons per level.
 * Code, commands and technical terms are kept in standard English.
 * Multi-slide lessons covering architecture, internals, and code patterns.
 */

export const DE_DIALOGS = {
  'http-01': {
    intro: [
      '## Was ist ein Endpoint in HTTP?',
      'Ein **Endpoint** ist ein adressierbarer Vorgang auf einem Server. Nach RFC 9110 verbindet er eine HTTP-Methode mit einem URI-Pfad.',
      'In FastAPI wird dies mit einem Dekorator registriert: `@app.get("/")` verarbeitet `GET /`.',
      'Die Funktion unter dem Dekorator läuft bei Anfragen und liefert ein JSON-Dictionary zurück.',
    ],
    slides: [
      [
        '## Was ist ein Endpoint in HTTP?',
        'Ein **Endpoint** ist das Eingangstor für Client-Anfragen. Jeder HTTP-Aufruf startet mit einer Request-Line: `METHOD /path HTTP/1.1`.',
        'Clients kennen keine internen Python-Details; sie kommunizieren ausschließlich über den definierten Schnittstellenvertrag.',
      ],
      [
        '## Interna: Wie der Server den Request verarbeitet',
        '1. Der **ASGI-Server** (Uvicorn) empfängt TCP-Pakete und baut den Connection-Scope auf.\n' +
        '2. Der **Starlette-Router** gleicht den Pfad mit der Routing-Tabelle ab und wählt die registrierte Handler-Funktion.\n' +
        '3. Der Rückgabewert wird von `jsonable_encoder` in UTF-8 JSON mit `Content-Type: application/json` serialisiert.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere den Dekorator und die Handler-Funktion im Editor:\n\n' +
        '```python\n' +
        '@app.get("/")\n' +
        'def read_root():\n' +
        '    return {"hello": "world"}\n' +
        '```\n\n' +
        'Klicke auf **Run** und teste danach in der Konsole mit `call GET /`.',
      ],
    ],
    demo: {
      before: 'Registriere `GET /` und beobachte die API-Oberfläche.',
      after: '`GET /` ist live. Rufe es in der Konsole auf: `call GET /`',
      command: 'call GET /',
    },
  },

  'http-02': {
    intro: [
      '## HTTP-Methoden: Sicheres Lesen vs. Datenmutation',
      '`GET` liest. Nach RFC 9110 muss es sicher (Safe) und idempotent sein und darf den Serverzustand nicht verändern.',
      '`POST` erstellt Ressourcen und antwortet typischerweise mit dem Statuscode **201 Created**.',
      'Gleicher Pfad mit unterschiedlichen Methoden = zwei völlig eigenständige Endpoints.',
    ],
    slides: [
      [
        '## HTTP-Methoden: Sicheres Lesen vs. Datenmutation',
        'HTTP-Verben steuern die Semantik von Operationen:\n' +
        '• **GET**: Sicheres Abrufen ohne Seiteneffekte (Cache-fähig).\n' +
        '• **POST**: Erstellen neuer Entitäten (weder Safe noch Idempotent).\n' +
        '• **PUT/PATCH**: Aktualisierung von Daten.\n' +
        '• **DELETE**: Löschen von Ressourcen.',
      ],
      [
        '## Interna: Warum Status 201 Created?',
        'Status 200 OK sagt nichts darüber aus, ob eine neue Ressource persistiert wurde.\n\n' +
        'Status **201 Created** bestätigt explizit die Zuweisung einer neuen Entität. In FastAPI konfigurierst du dies über `status_code=201`.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere die POST-Route mit Status 201:\n\n' +
        '```python\n' +
        '@app.post("/items", status_code=201)\n' +
        'def create_item():\n' +
        '    return {"id": 1, "name": "widget"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-01': {
    intro: [
      '## Dynamische Pfad-Parameter',
      'Ein Pfadsegment in geschweiften Klammern ist ein **Pfad-Parameter**: `/users/{user_id}` matched z. B. `/users/42`.',
      'Mit Typannotation (`user_id: int`) validiert FastAPI automatisch. Ungültige Typen wie `ada` werden mit **422** abgewiesen.',
    ],
    slides: [
      [
        '## Dynamische Pfad-Parameter',
        'In RESTful APIs werden einzelne Ressourcen über hierarchische Pfadbezeichner adressiert: `/users/{user_id}`.\n\n' +
        'Pfad-Parameter bestimmen die Identität der Ressource und sind immer zwingend erforderlich.',
      ],
      [
        '## Interna: Type-Casting und 422-Validierung',
        'FastAPI inspiziert die Funktionssignatur beim Start mit `inspect.signature`.\n\n' +
        'Bei einer Anfrage wandelt das Framework den String in einen Integer um. Schlägt die Konvertierung fehl, wird die Funktion gar nicht erst aufgerufen, sondern sofort ein RFC 7807 422 Fehler zurückgegeben.',
      ],
      [
        '## Standard-Codemuster',
        'Füge den Pfadparameter mit Typdeklaration ein:\n\n' +
        '```python\n' +
        '@app.get("/users/{user_id}")\n' +
        'def get_user(user_id: int):\n' +
        '    return {"id": user_id, "name": "ada"}\n' +
        '```\n\n' +
        'Teste in der Konsole: `call GET /users/42`',
      ],
    ],
  },

  'fastapi-02': {
    intro: [
      '## Filter und Paginierung mit Query-Parametern',
      'Alles nach `?` ist der Query-String: `GET /search?q=ada&limit=2`.',
      'Nicht im Pfad enthaltene Funktionsargumente werden in FastAPI automatisch zu Query-Parametern. Ein Default macht sie optional.',
    ],
    slides: [
      [
        '## Filter und Paginierung mit Query-Parametern',
        'Während Pfad-Parameter Ressourcen *identifizieren*, steuern Query-Parameter deren *Präsentation*: Paginierung, Sortierung und Suche.\n\n' +
        'RFC 3986 definiert den Standard mit `?` und `&`.',
      ],
      [
        '## Interna: Optionale vs. erforderliche Parameter',
        'Hat ein Parameter einen Standardwert (`limit: int = 10`), ist er optional.\n\n' +
        'Fehlt der Default (`q: str`), ist der Query-Parameter verpflichtend. Fehlt er im Request, antwortet FastAPI automatisch mit 422.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere die Query-Parameter mit Defaultwerten:\n\n' +
        '```python\n' +
        '@app.get("/search")\n' +
        'def search(q: str = "", limit: int = 10):\n' +
        '    return {"q": q, "limit": limit}\n' +
        '```\n\n' +
        'Teste: `call GET /search?q=ada&limit=2`',
      ],
    ],
  },

  'fastapi-03': {
    intro: [
      '## Request-Body mit Pydantic BaseModel',
      'POST-Requests übertragen strukturierte Daten im **JSON-Body**. FastAPI validiert diese über Pydantic `BaseModel` Klassen.',
      'Das Schema wird automatisch in OpenAPI unter `components.schemas.User` publiziert und treibt Swagger UI an.',
    ],
    slides: [
      [
        '## Request-Body mit Pydantic BaseModel',
        'Eingehende Nutzdaten müssen auf Vollständigkeit und Typkorrektheit geprüft werden, bevor sie verarbeitet werden dürfen.',
      ],
      [
        '## Interna: Deserialisierung und Validierungs-Pipeline',
        '1. Der Server liest den Request-Stream und parst JSON.\n' +
        '2. Pydantic validiert jedes Feld gegen deklarierte Typen.\n' +
        '3. Bei Erfolg erhält deine Funktion ein typisiertes Objekt; bei Fehlern erzeugt FastAPI eine detaillierte 422-Meldung mit Fehlerposition.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere das Modell und die Route:\n\n' +
        '```python\n' +
        'class User(BaseModel):\n' +
        '    name: str\n' +
        '    age: int = 0\n\n' +
        '@app.post("/users", status_code=201)\n' +
        'def create_user(user: User):\n' +
        '    return {"id": 1, "name": user.name, "age": user.age}\n' +
        '```',
      ],
    ],
  },

  'fastapi-04': {
    intro: [
      '## Statuscodes und Löschen mit 204 No Content',
      'Semantische Statuscodes informieren Clients präzise: 200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Validation Error.',
      'Ein erfolgreiches `DELETE` ohne Rückgabedaten antwortet nach HTTP-Standard mit **204** und leerem Body.',
    ],
    slides: [
      [
        '## Statuscodes und Löschen mit 204 No Content',
        'Klare Statuscodes bilden das Rückgrat stabiler API-Schnittstellen. Das Zurückgeben falscher Codes bricht Client-Bibliotheken.',
      ],
      [
        '## Interna: RFC 9110 No-Content Semantik',
        'Gemäß RFC 9110 §15.3.5 darf eine 204-Antwort keinen Body enthalten. HTTP-Clients und Browser verwerfen eventuelle Bytes.\n\n' +
        'In FastAPI wird dies über `status_code=204` deklariert.',
      ],
      [
        '## Standard-Codemuster',
        'Implementiere die DELETE-Route mit Status 204:\n\n' +
        '```python\n' +
        '@app.delete("/notes/{note_id}", status_code=204)\n' +
        'def delete_note(note_id: int):\n' +
        '    return {}\n' +
        '```',
      ],
    ],
  },

  'fastapi-05': {
    intro: [
      '## Vollständiges CRUD-Muster auf REST-Ressourcen',
      'Ressourcen-Architektur: **C**reate `POST` · **R**ead `GET` · **U**pdate `PUT` · **D**elete `DELETE`.',
      'Kollektionen liegen unter `/notes`; einzelne Ressourcen unter `/notes/{note_id}`.',
    ],
    slides: [
      [
        '## Vollständiges CRUD-Muster auf REST-Ressourcen',
        'REST strukturiert APIs um Substantive (`/notes`). Das HTTP-Verb bestimmt die auszuführende Aktion.',
      ],
      [
        '## Interna: PUT vs. PATCH',
        '• **PUT** ersetzt die komplette Ressourcendarstellung und muss idempotent sein.\n' +
        '• **PATCH** modifiziert selektiv einzelne Felder der Ressource.',
      ],
      [
        '## Standard-Codemuster',
        'Implementiere die 4 Operationen:\n\n' +
        '```python\n' +
        '@app.post("/notes", status_code=201)\n' +
        'def create_note(): return {"id": 1, "title": "hello"}\n\n' +
        '@app.put("/notes/{note_id}")\n' +
        'def update_note(note_id: int): return {"id": note_id, "title": "updated"}\n\n' +
        '@app.delete("/notes/{note_id}", status_code=204)\n' +
        'def delete_note(note_id: int): return {}\n' +
        '```',
      ],
    ],
  },

  'fastapi-06': {
    intro: [
      '## Fehlerbehandlung mit HTTPException',
      'Eine fehlende Ressource erfordert **404**, keinen 500-Crash und kein stummes `200` mit `null`.',
      'FastAPI signalisiert Fehler mit `raise HTTPException(status_code=404, detail="...")`.',
    ],
    slides: [
      [
        '## Fehlerbehandlung mit HTTPException',
        'Sauberes Exception-Handling verhindert Informationslecks und liefert standardisierte Fehlerformate an Clients.',
      ],
      [
        '## Interna: Starlette Exception-Middleware',
        'Das Werfen von `HTTPException` stoppt den Handler. Starlettes Exception-Handler fängt den Fehler ab und erzeugt den JSON-Envelope `{"detail": "..."}` mit dem entsprechenden HTTP-Status.',
      ],
      [
        '## Standard-Codemuster',
        'Prüfe die Bedingung und wirf die Exception:\n\n' +
        '```python\n' +
        'if item_id == 99:\n' +
        '    raise HTTPException(status_code=404, detail="Item not found")\n' +
        '```\n\n' +
        'Teste in der Konsole: `call GET /items/99`',
      ],
    ],
  },

  'fastapi-07': {
    intro: [
      '## Dependency Injection mit Depends',
      'Handler sollten Konfigurationen oder Datenbank-Sessions nicht selbst erzeugen. **Dependencies** sind wiederverwendbare Provider, die FastAPI injiziert.',
      'Das Rückgrat jeder produktiven FastAPI-App: Auth, Datenbanken und Settings nutzen `Depends`.',
    ],
    slides: [
      [
        '## Dependency Injection mit Depends',
        'Dependency Injection implementiert das Prinzip der **Inversion of Control (IoC)**. Komponenten werden lose gekoppelt und zentral verwaltet.',
      ],
      [
        '## Interna: Auflösung des Dependency-Graphen',
        'FastAPI modelliert Abhängigkeiten als gerichteten azyklischen Graphen (DAG). Werden Sub-Dependencies mehrfach benötigt, cacht das Framework Ergebnisse pro Request.\n\n' +
        'Generator-Funktionen mit `yield` erlauben sauberes Öffnen und Schließen von Datenbank-Transaktionen.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere den Provider und injiziere ihn:\n\n' +
        '```python\n' +
        'def get_settings():\n' +
        '    return {"app_name": "LearnAPI", "debug": False}\n\n' +
        '@app.get("/info")\n' +
        'def info(settings: dict = Depends(get_settings)):\n' +
        '    return {"app": settings["app_name"], "debug": settings["debug"]}\n' +
        '```',
      ],
    ],
  },

  'fastapi-08': {
    intro: [
      '## Header-Validierung und API-Key Authentifizierung',
      'Mit `Header(...)` werden HTTP-Header abgefragt. Fehlt ein Pflicht-Header, wird die Anfrage mit **401** oder **422** abgewiesen.',
      'Sicherheitsanforderungen werden automatisch in OpenAPI `components.securitySchemes` dokumentiert.',
    ],
    slides: [
      [
        '## Header-Validierung und API-Key Authentifizierung',
        'HTTP-Header transportieren Authentifizierungsinformationen wie Tokens und API-Schlüssel außerhalb der sichtbaren URL.',
      ],
      [
        '## Interna: Case-Insensitive Header und Timing-Schutz',
        'Nach RFC 7230 sind Header-Namen unabhängig von Groß-/Kleinschreibung. FastAPI konvertiert `api_key` zu `api-key`.\n\n' +
        'In Produktion sollten geheime Tokens immer mit `secrets.compare_digest` verglichen werden, um Timing-Angriffe auszuschließen.',
      ],
      [
        '## Standard-Codemuster',
        'Deklariere den Header-Parameter:\n\n' +
        '```python\n' +
        '@app.get("/admin")\n' +
        'def admin(api_key: str = Header(...)):\n' +
        '    return {"ok": True, "who": "admin"}\n' +
        '```\n\n' +
        'Teste: `call GET /admin headers={"api-key":"secret"}`',
      ],
    ],
  },

  'fastapi-09': {
    intro: [
      '## Datenfilterung mit response_model',
      'Das `response_model` definiert den Ausgabevertrag und filtert vertrauliche Daten (wie Passwort-Hashes) vor der Auslieferung heraus.',
      'Es dokumentiert außerdem die 200 OK Response-Struktur in der OpenAPI-Spezifikation.',
    ],
    slides: [
      [
        '## Datenfilterung mit response_model',
        'Ein häufiges Sicherheitsrisiko ist das versehentliche Durchreichen interner Datenbankfelder an den Client. Das `response_model` fungiert als Output-Filter.',
      ],
      [
        '## Interna: Filterung und Schema-Generierung',
        'Selbst wenn dein Handler ein Dictionary mit internen Feldern liefert, serialisiert FastAPI nur die im `response_model` deklarierten Eigenschaften.\n\n' +
        'Gleichzeitig wird der OpenAPI-Response-Zweig für Status 200 automatisch erzeugt.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere das Output-Modell und binde es an die Route:\n\n' +
        '```python\n' +
        'class UserOut(BaseModel):\n' +
        '    id: int\n' +
        '    name: str\n\n' +
        '@app.get("/users/{user_id}", response_model=UserOut)\n' +
        'def get_user(user_id: int):\n' +
        '    return {"id": user_id, "name": "ada", "hashed_password": "secret"}\n' +
        '```',
      ],
    ],
  },

  'plumber-01': {
    intro: [
      '## Webdienste in R mit Plumber',
      'Das Plumber-Paket wandelt native R-Funktionen über spezielle Kommentare `#* @get /` in HTTP-Endpoints um.',
      'Listen-Rückgaben in R werden über das `jsonlite` Paket automatisch in JSON konvertiert.',
    ],
    slides: [
      [
        '## Webdienste in R mit Plumber',
        'In Data-Science- und Statistik-Projekten ermöglicht Plumber die direkte Bereitstellung von R-Modellen als Web-API.',
      ],
      [
        '## Interna: Kommentar-Parser und Router',
        'Plumber analysiert die roxygen2-Kommentare und erstellt ein `PlumberRouter`-Objekt, das Funktionsabschlüsse (Closures) an HTTP-Routen bindet.',
      ],
      [
        '## Standard-Codemuster',
        'Schreibe den Kommentar und die Handler-Funktion:\n\n' +
        '```r\n' +
        '#* @get /\n' +
        'function() list(hello = "world")\n' +
        '```',
      ],
    ],
  },

  'plumber-02': {
    intro: [
      '## Pfad-Parameter in Plumber',
      'Spitze Klammern markieren Pfad-Parameter: `#* @get /users/<id>` matched z. B. `/users/7`.',
      'Der Kommentar `#* @param id:int` deklariert den Typ, der als Funktionsargument übergeben wird.',
    ],
    slides: [
      [
        '## Pfad-Parameter in Plumber',
        'Wie in Python-Frameworks können auch in R Pfadvariablen zur Adressierung von Einzelressourcen genutzt werden.',
      ],
      [
        '## Interna: Typkonvertierung in R',
        'URI-Segmente kommen als Zeichenketten an. Die Umwandlung mit `as.integer(id)` stellt sicher, dass in JSON Zahlenwerte statt Strings erzeugt werden.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere den parametrisierten Endpunkt:\n\n' +
        '```r\n' +
        '#* @get /users/<id>\n' +
        '#* @param id:int\n' +
        'function(id) list(id = as.integer(id), name = "ada")\n' +
        '```',
      ],
    ],
  },

  'plumber-03': {
    intro: [
      '## POST-Body und Response-Steuerung in Plumber',
      'Über die speziellen Parameter `req` und `res` steuert Plumber den Request- und Response-Lebenszyklus.',
      'Die Payload liegt in `req$postBody`; der Statuscode wird über `res$status <- 201` gesetzt.',
    ],
    slides: [
      [
        '## POST-Body und Response-Steuerung in Plumber',
        'Beim Erstellen von Ressourcen sendet der Client JSON im Request-Body. Plumber stellt diesen bereit und erlaubt volle Kontrolle über Header und Status.',
      ],
      [
        '## Interna: Das Response-Objekt und Serializer',
        'Mit `res$status <- 201` wird der HTTP-Status gesetzt. Die Annotation `#* @serializer json` stellt die korrekte JSON-Auslieferung sicher.',
      ],
      [
        '## Standard-Codemuster',
        'Implementiere die POST-Route mit Status 201:\n\n' +
        '```r\n' +
        '#* @post /users\n' +
        '#* @serializer json\n' +
        'function(req, res) {\n' +
        '  res$status <- 201\n' +
        '  list(id = 1, name = req$postBody$name)\n' +
        '}\n' +
        '```',
      ],
    ],
  },

  'openapi-01': {
    intro: [
      '## Metadaten in OpenAPI 3.0',
      'OpenAPI ist die maschinenlesbare Spezifikation deiner API. Mit `tags` und `summary` gruppierst und dokumentierst du deine Endpoints.',
      'Swagger UI und Redoc rendern diese Daten als interaktives Entwicklerportal.',
    ],
    slides: [
      [
        '## Metadaten in OpenAPI 3.0',
        'Klare Dokumentation ist essenziell für die Zusammenarbeit. OpenAPI 3.0 bietet ein plattformunabhängiges Format zur exakten Schnittstellenbeschreibung.',
      ],
      [
        '## Interna: Schemakompilierung in FastAPI',
        'Dekorator-Parameter wie `tags=["pets"]` und `summary="..."` fließen direkt in das generierte OpenAPI-JSON ein.',
      ],
      [
        '## Standard-Codemuster',
        'Ergänze die Metadaten in den Routen:\n\n' +
        '```python\n' +
        '@app.get("/pets", tags=["pets"], summary="List pets")\n' +
        'def list_pets():\n' +
        '    return [{"name": "fido"}]\n\n' +
        '@app.post("/pets", status_code=201, tags=["pets"], summary="Create pet")\n' +
        'def create_pet():\n' +
        '    return {"name": "fido"}\n' +
        '```',
      ],
    ],
  },

  'openapi-02': {
    intro: [
      '## Request-Schemas unter components.schemas',
      'Pydantic-Modelle werden automatisch in JSON-Schemas unter `components.schemas` übersetzt.',
      'Routen referenzieren das Schema über `$ref`, sodass Frontend-Clients Typdefinitionen direkt ableiten können.',
    ],
    slides: [
      [
        '## Request-Schemas unter components.schemas',
        'Im Contract-First Design werden Datenstrukturen zentral definiert, um Redundanzen und Versionskonflikte zu vermeiden.',
      ],
      [
        '## Interna: Referenzierung mit $ref',
        'Anstatt Schemas an jedem Endpoint zu duplizieren, verweist die OpenAPI-Spezifikation per `$ref: "#/components/schemas/Item"` auf die zentrale Definition.',
      ],
      [
        '## Standard-Codemuster',
        'Definiere das Modell und die Route:\n\n' +
        '```python\n' +
        'class Item(BaseModel):\n' +
        '    name: str\n\n' +
        '@app.post("/items", status_code=201)\n' +
        'def create_item(item: Item):\n' +
        '    return {"name": item.name}\n' +
        '```',
      ],
    ],
  },

  'compare-01': {
    intro: [
      '## Betriebs-Endpoints in FastAPI',
      'Cloud-Infrastrukturen und Kubernetes benötigen dedizierte Endpoints wie `/health` und `/metrics` zur Container-Steuerung.',
      'Die Trennung von Business- und Ops-Routen entkoppelt Überwachungstraffic von Anwendungsdaten.',
    ],
    slides: [
      [
        '## Betriebs-Endpoints in FastAPI',
        'Observability erfordert standardisierte Prüf-Endpoints für Liveness (Läuft der Container?) und Readiness (Bereit für Anfragen?).',
      ],
      [
        '## Interna: Kubernetes Container-Probes',
        'Kubernetes pollt diese Pfade regelmäßig. Schlägt ein Check fehl, wird der Container automatisch isoliert oder neu gestartet.',
      ],
      [
        '## Standard-Codemuster',
        'Implementiere die Ops-Endpoints:\n\n' +
        '```python\n' +
        '@app.get("/health")\n' +
        'def health():\n' +
        '    return {"status": "ok"}\n\n' +
        '@app.get("/metrics")\n' +
        'def metrics():\n' +
        '    return {"status": "ok"}\n' +
        '```',
      ],
    ],
  },

  'compare-02': {
    intro: [
      '## Betriebs-Endpoints in R: Sprachunabhängigkeit',
      'Die Implementierung derselben `/health` und `/metrics` Endpoints in R beweist die Sprachunabhängigkeit von HTTP-APIs.',
      'Clients und Monitoring-Tools erhalten unabhängig von der internen Sprache exakt dasselbe Protokollverhalten.',
    ],
    slides: [
      [
        '## Betriebs-Endpoints in R: Sprachunabhängigkeit',
        'APIs definieren Verträge. Ob dahinter Python mit FastAPI oder R mit Plumber läuft, ist für den Aufrufer irrelevant.',
      ],
      [
        '## Interna: Einheitliches Monitoring in Polyglot-Umgebungen',
        'Monitoring-Systeme wie Prometheus erfassen standardisierte `/metrics`-Endpoints sprachübergreifend in einem zentralen Dashboard.',
      ],
      [
        '## Standard-Codemuster',
        'Implementiere die Endpoints in R:\n\n' +
        '```r\n' +
        '#* @get /health\n' +
        'function() {\n' +
        '  list(status = "ok")\n' +
        '}\n\n' +
        '#* @get /metrics\n' +
        'function() {\n' +
        '  list(status = "ok")\n' +
        '}\n' +
        '```',
      ],
    ],
  },

  'http-03': {
    intro: [
      '## HTTP-Caching und bedingte Anfragen (ETag & 304)',
      'HTTP nutzt Entity-Tags (**ETag**), um Netzwerkübertragungen und Serverlast zu minimieren.',
      'Sendet der Client im Folgeaufruf den Header `If-None-Match` mit dem aktuellen ETag, antwortet der Server schlank mit **304 Not Modified** ohne Body.',
    ],
    slides: [
      [
        '## Cache-Validierung mit ETag',
        'Der Server liefert im Antwort-Header einen ETag-Hash der Ressource mit. Bei Folgeanfragen prüft der Client mit `If-None-Match`, ob sich der Inhalt geändert hat.',
      ],
      [
        '## Interna: 304 Not Modified ohne Payload',
        'Stimmt der Hash überein, sendet der Server Status 304 ohne Datenkörper. Das spart Bandbreite und schont die Datenbank.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'from fastapi import FastAPI, Header, HTTPException\n\n' +
        'app = FastAPI(title="Caching API")\n\n' +
        '@app.get("/items")\n' +
        'def get_items(if_none_match: str = Header(None, alias="If-None-Match")):\n' +
        '    if if_none_match == "etag-v1":\n' +
        '        raise HTTPException(status_code=304, detail="Not Modified")\n' +
        '    return {"items": ["alpha", "beta"], "etag": "etag-v1"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-10': {
    intro: [
      '## Paginierung (Pagination) und Envelope-Muster',
      'Das Ausliefern unbeschränkter Datensätze gefährdet die Stabilität. Paginierung mit `limit` und `offset` begrenzt die Datenmenge.',
      'Das Envelope-Muster kapselt Datensätze in `items` zusammen mit Metadaten wie `total`, `limit` und `offset`.',
    ],
    slides: [
      [
        '## Warum Paginierung unerlässlich ist',
        'Wachsende Datenbanken verlangen planbaren Ressourcenverbrauch. Unpaginierte Endpoints führen unweigerlich zu Speicherüberläufen.',
      ],
      [
        '## Struktur des Response-Envelopes',
        'Statt roher JSON-Arrays liefert der Endpoint ein Objekt mit Metadaten zurück:\n\n' +
        '```json\n' +
        '{\n' +
        '  "items": [...],\n' +
        '  "total": 100,\n' +
        '  "limit": 10,\n' +
        '  "offset": 0\n' +
        '}\n' +
        '```',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        '@app.get("/products")\n' +
        'def list_products(limit: int = 10, offset: int = 0):\n' +
        '    return {"items": ["item1", "item2"], "total": 100, "limit": limit, "offset": offset}\n' +
        '```',
      ],
    ],
  },

  'fastapi-11': {
    intro: [
      '## Authentifizierung mit Bearer Token (RFC 6750)',
      'In modernen APIs übermittelt der Client nach dem Login ein Zugriffstoken im Header `Authorization: Bearer <token>`.',
      'Der Server validiert das Token; bei ungültigen Angaben wird die Anfrage mit **401 Unauthorized** abgewiesen.',
    ],
    slides: [
      [
        '## Der Authorization Header und das Bearer-Schema',
        'Gemäß RFC 6750 wird das Token mit dem Präfix `Bearer ` im Authorization-Header übergeben.',
      ],
      [
        '## Interna: Sicherheitsprüfungen',
        'FastAPI extrahiert den Header und prüft die Gültigkeit, um die Identität des Aufrufers festzustellen.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        '@app.get("/profile")\n' +
        'def get_profile(authorization: str = Header(...)):\n' +
        '    if authorization != "Bearer secret-token-123":\n' +
        '        raise HTTPException(status_code=401, detail="Invalid token")\n' +
        '    return {"user": "alice", "role": "admin"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-12': {
    intro: [
      '## Rollenbasierte Autorisierung (RBAC) & 403 Forbidden',
      'Die Unterscheidung zwischen Authentifizierung (Wer bist du?) und Autorisierung (Was darfst du?) ist ein Grundpfeiler moderner Sicherheit.',
      'Verfügt ein authentifizierter Nutzer nicht über die erforderliche Rolle, antwortet der Server mit **403 Forbidden**.',
    ],
    slides: [
      [
        '## Unterschied zwischen 401 und 403',
        '• **401 Unauthorized**: Der Aufrufer ist unauthentifiziert oder das Token fehlt/ist ungültig.\n' +
        '• **403 Forbidden**: Der Aufrufer ist bekannt, hat aber keine Berechtigung für diesen Zugriff.',
      ],
      [
        '## Autorisierungs-Guards',
        'Rollen oder Scopes werden geprüft, bevor administrativer Code ausgeführt werden darf.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        '@app.get("/admin/audit")\n' +
        'def audit_logs(x_role: str = Header("user", alias="X-Role")):\n' +
        '    if x_role != "admin":\n' +
        '        raise HTTPException(status_code=403, detail="Forbidden")\n' +
        '    return {"audit": "access_granted", "status": "ok"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-13': {
    intro: [
      '## Rate Limiting & 429 Too Many Requests',
      'Um Server vor Überlastung oder Endlosschleifen zu schützen, werden Kontingente pro Zeiteinheit festgelegt.',
      'Wird das Limit überschritten, antwortet der Server mit **429 Too Many Requests**.',
    ],
    slides: [
      [
        '## Schutz nach RFC 6585',
        'Status 429 signalisiert dem Client, dass das Ratenlimit erreicht wurde und er warten muss.',
      ],
      [
        '## Telemetriedaten zur Quotensteuerung',
        'Server senden Header wie `X-Rate-Limit` oder `Retry-After`, um Clients über Wartezeiten zu informieren.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        '@app.get("/compute")\n' +
        'def compute(x_rate_limit: int = Header(10, alias="X-Rate-Limit")):\n' +
        '    if x_rate_limit <= 0:\n' +
        '        raise HTTPException(status_code=429, detail="Too Many Requests")\n' +
        '    return {"result": 42, "remaining": x_rate_limit}\n' +
        '```',
      ],
    ],
  },

  'plumber-04': {
    intro: [
      '## Plumber Filter & Middleware in R (#* @filter)',
      'Filter in Plumber erlauben das Abfangen und Modifizieren eingehender Anfragen vor Erreichen der Routen-Handler.',
      'Der Aufruf von `forward()` reicht die Kontrolle an das nächste Glied in der Verarbeitungskette weiter.',
    ],
    slides: [
      [
        '## Middleware-Konzept in Plumber',
        'Das Tag `#* @filter` ermöglicht zentrales Logging, CORS-Header und Sicherheitsprüfungen in R.',
      ],
      [
        '## Weiterleitung mit forward()',
        'Ist eine Anfrage valide, übergibt `forward()` die Ausführung an die zuständigen Endpoints.',
      ],
      [
        '## Standard-Codemuster',
        '```r\n' +
        'library(plumber)\n\n' +
        '#* @filter logger\n' +
        'function(req) {\n' +
        '  forward()\n' +
        '}\n\n' +
        '#* @get /data\n' +
        '#* @serializer json\n' +
        'function() {\n' +
        '  list(status = "ok", processed = TRUE)\n' +
        '}\n' +
        '```',
      ],
    ],
  },

  'openapi-03': {
    intro: [
      '## Fehlerverträge in OpenAPI / Swagger dokumentieren',
      'Ein vollständiger OpenAPI-Vertrag dokumentiert neben Erfolgsantworten auch clientseitige Fehlerszenarien wie 404 Not Found.',
      'FastAPI übernimmt `HTTPException`-Statuscodes automatisch in die Dokumentationsstruktur.',
    ],
    slides: [
      [
        '## Verträge für Fehlerfälle',
        'Client-Entwickler müssen wissen, welche Fehlerstatuscodes und Payloads bei ungültigen Anfragen zu erwarten sind.',
      ],
      [
        '## Abbildung in der Swagger responses Map',
        'Die explizite Definition macht Fehlerzustände in Swagger UI und automatisierten Validierungstools sichtbar.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'from fastapi import FastAPI, HTTPException\n\n' +
        'app = FastAPI(title="Store API")\n\n' +
        '@app.get("/orders/{order_id}")\n' +
        'def get_order(order_id: int):\n' +
        '    if order_id == 0:\n' +
        '        raise HTTPException(status_code=404, detail="Order not found")\n' +
        '    return {"order_id": order_id, "status": "shipped"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-14': {
    intro: [
      '## Erweiterte Modellvalidierung mit Pydantic Field',
      'Grundtypen wie `str` oder `float` prüfen lediglich den Typ. Enterprise-APIs erfordern jedoch Beschränkungen wie Mindestlängen oder positive Zahlen.',
      'Pydantic `Field(...)` erzwingt diese Domänenregeln automatisch vor Ausführung des Handlers.',
    ],
    slides: [
      [
        '## Deklaration von Validierungsregeln',
        'Parameter wie `min_length` und `gt` (greater than) weisen ungültige Eingaben sofort an der API-Grenze ab, bevor sie die Datenbank erreichen.',
      ],
      [
        '## JSON-Schema-Kompilierung und 422-Fehler',
        'FastAPI übernimmt Field-Regeln in die OpenAPI-Metadaten. Bei Nichteinhaltung wird HTTP 422 mit exakten Fehlerhinweisen zurückgegeben.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'class Product(BaseModel):\n' +
        '    name: str = Field(..., min_length=2)\n' +
        '    price: float = Field(gt=0)\n' +
        '    tag: str = "general"\n\n' +
        '@app.post("/products", status_code=201)\n' +
        'def create_product(product: Product):\n' +
        '    return {"name": product.name, "price": product.price, "tag": product.tag}\n' +
        '```',
      ],
    ],
  },

  'fastapi-15': {
    intro: [
      '## Partielle Ressourcenmodifikation: PUT vs. PATCH',
      'Während PUT eine Ressource vollständig überschreibt, ändert HTTP PATCH (RFC 5789) nur die übermittelten Felder.',
      'Dies verhindert Race Conditions und Datenverlust bei gleichzeitigen Bearbeitungen.',
    ],
    slides: [
      [
        '## Vollständiger Ersatz vs. Delta-Mutation',
        'PUT ist idempotent und ersetzt die gesamte Entität. PATCH wendet inkrementelle Delta-Aktualisierungen an.',
      ],
      [
        '## Netzwerkoptimierung & Concurrency',
        'Clients senden bei PATCH nur modifizierte Attribute. Das reduziert Bandbreite und schützt unbeteiligte Felder vor versehentlichem Überschreiben.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'class ItemPatch(BaseModel):\n' +
        '    title: str = "patched_title"\n\n' +
        '@app.patch("/items/{item_id}")\n' +
        'def patch_item(item_id: int, item: ItemPatch):\n' +
        '    return {"id": item_id, "title": item.title, "mode": "partial"}\n' +
        '```',
      ],
    ],
  },

  'fastapi-16': {
    intro: [
      '## Wiederverwendbare Sicherheits-Guards mit Depends',
      'Authentifizierungsprüfungen in jedem einzelnen Endpoint erzeugen Redundanz und Sicherheitsrisiken.',
      'Mit `Depends` werden Sicherheitsüberprüfungen in eigenständige, wiederverwendbare Guards ausgelagert.',
    ],
    slides: [
      [
        '## Entkoppelte Authentifizierungsschicht',
        'Dependency-Provider prüfen Request-Header (z. B. Authorization) und werfen bei ungültigen Tokens sofort einen 401-Fehler.',
      ],
      [
        '## Ausführungsreihenfolge im Dependency-Graph',
        'Der Handler wird erst ausgeführt, wenn alle Abhängigkeiten erfolgreich aufgelöst und validiert wurden.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'def get_current_user(token: str = Header(..., alias="Authorization")):\n' +
        '    if token != "Bearer secret-123":\n' +
        '        raise HTTPException(status_code=401, detail="Unauthorized")\n' +
        '    return {"username": "alice", "role": "admin"}\n\n' +
        '@app.get("/me")\n' +
        'def read_me(current_user: dict = Depends(get_current_user)):\n' +
        '    return {"user": current_user.username, "role": current_user.role}\n' +
        '```',
      ],
    ],
  },

  'fastapi-17': {
    intro: [
      '## Modulare Architektur mit APIRouter',
      'Mit wachsender Anzahl von Endpoints wird eine einzige Serverdatei unübersichtlich. `APIRouter` strukturiert Backends in Domänenmodule.',
      'Jeder Router verwaltet eigene Pfad-Präfixe und Swagger-Tags.',
    ],
    slides: [
      [
        '## Trennung fachlicher Domänen',
        'Teile Routen in separate Module (users, orders, billing) auf und binde sie mit `include_router` in die Hauptanwendung ein.',
      ],
      [
        '## Automatische Präfix- und Tag-Vererbung',
        'Routen im Router benötigen kein wiederholtes Präfix und werden in Swagger UI übersichtlich gruppiert dargestellt.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'router = APIRouter(prefix="/users", tags=["users"])\n\n' +
        '@router.get("/")\n' +
        'def list_users():\n' +
        '    return {"users": ["alice", "bob"]}\n\n' +
        '@router.get("/{user_id}")\n' +
        'def get_user(user_id: int):\n' +
        '    return {"id": user_id, "name": "alice"}\n\n' +
        'app.include_router(router)\n' +
        '```',
      ],
    ],
  },

  'fastapi-18': {
    intro: [
      '## Cross-Origin Resource Sharing mit CORSMiddleware',
      'Webbrowser blockieren aus Sicherheitsgründen standardmäßig API-Anfragen zwischen unterschiedlichen Domains.',
      'Über `CORSMiddleware` teilt das Backend dem Browser mit, welche Frontend-Clients Zugriff erhalten.',
    ],
    slides: [
      [
        '## Same-Origin Policy (SOP)',
        'React- oder Vue-Apps, die auf anderen Ports oder Domains laufen, können ohne CORS-Header keine API-Daten abrufen.',
      ],
      [
        '## Preflight-OPTIONS-Prüfungen',
        'Vor komplexen Anfragen sendet der Browser einen OPTIONS-Request, um erlaubte HTTP-Methoden und Header abzufragen.',
      ],
      [
        '## Standard-Codemuster',
        '```python\n' +
        'app.add_middleware(\n' +
        '    CORSMiddleware,\n' +
        '    allow_origins=["*"],\n' +
        '    allow_methods=["*"],\n' +
        '    allow_headers=["*"],\n' +
        ')\n\n' +
        '@app.get("/data")\n' +
        'def get_data():\n' +
        '    return {"cors": "enabled"}\n' +
        '```',
      ],
    ],
  },

  'plumber-05': {
    intro: [
      '## Model Serving & Vorhersage-Pipelines in R',
      'R ist hervorragend für Statistik und Data Science geeignet. Plumber verwandelt trainierte Modelle in einsatzbereite Microservices.',
      'Scoring-Endpoints nutzen in der Regel HTTP POST zur Übermittlung von Merkmalsdaten.',
    ],
    slides: [
      [
        '## Machine-Learning-Scoring in Produktion',
        'Modelle verbleiben im Arbeitsspeicher und berechnen Vorhersagen in Millisekunden über `predict()`.',
      ],
      [
        '## Standardisierte JSON-Serialisierung',
        'Die Annotation `#* @serializer json` gewährleistet, dass R-Objekte als sauberes JSON an Clients ausgeliefert werden.',
      ],
      [
        '## Standard-Codemuster',
        '```r\n' +
        '#* @post /predict\n' +
        '#* @serializer json\n' +
        'function(req) {\n' +
        '  list(prediction = 85.5, status = "scored")\n' +
        '}\n' +
        '```',
      ],
    ],
  },
};

