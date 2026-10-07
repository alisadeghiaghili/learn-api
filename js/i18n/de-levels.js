/**
 * German level metadata catalog: name, objective, hint, learning, fieldNotes.
 * Technical German used by professional software engineers.
 * Complete 0 to 90+/100 mastery covering architecture, internals, and production notes.
 */

export const DE_LEVELS = {
  'http-01': {
    name: 'Was ist ein Endpoint?',
    objective: 'Veröffentliche die Root-URL deines Webdienstes und liefere eine valide JSON-Payload unter Einhaltung des ASGI-Lebenszyklus aus.',
    hint: 'Definiere den Dekorator `@app.get("/")` mit einer Handler-Funktion, die ein Dictionary wie `{"hello": "world"}` zurückgibt.',
    learning: [
      'Ein Endpoint verbindet eine HTTP-Methode mit einem URI-Pfad gemäß RFC 9110 Request-Line Spezifikation.',
      'Interna: Der ASGI-Server (Uvicorn) empfängt den TCP-Socket; der Starlette-Router gleicht den Pfad mit der Routing-Tabelle ab.',
      'Zurückgegebene Dictionaries werden von `jsonable_encoder` in UTF-8 JSON-Bytes mit `Content-Type: application/json` serialisiert.',
    ],
    fieldNotes: [
      'Kubernetes-Liveness- und Readiness-Probes prüfen typischerweise Root- oder /healthz-Endpoints zur Container-Überwachung.',
      'Gib immer strukturierte Dictionary-Objekte anstelle nackter JSON-Arrays zurück, um Vorwärtskompatibilität zu sichern.',
      'Halte Einstiegs-Handler nicht-blockierend: Vermeide synchrone Datei-I/O oder schwere Datenbankabfragen ohne async/Threadpools.',
    ],
  },
  'http-02': {
    name: 'HTTP-Methoden',
    objective: 'Unterscheide zwischen sicherem Lesen (GET) und zustandsveränderndem Erstellen (POST) mit Status 201 Created.',
    hint: 'Implementiere `@app.post("/items", status_code=201)` mit Rückgabe des neu erstellten Dictionarys.',
    learning: [
      'GET-Requests müssen sicher (Safe) und idempotent sein (RFC 9110 §9.2.1) und dürfen den Serverzustand nicht mutieren.',
      'Interna: POST ist weder sicher noch idempotent; jeder Request kann eine neue Entität in der Datenbank erzeugen.',
      'Status 201 Created bestätigt die Ressourcenerstellung und sollte idealerweise einen Location-Header mit der neuen URI bereitstellen.',
    ],
    fieldNotes: [
      'Verwende niemals GET für Datenmutationen (z. B. /items/delete?id=1); dies bricht Caches, Proxys und Webcrawler.',
      'Nutze in verteilten Systemen Idempotency-Keys für POST-Requests, um Duplikate bei Netzwerk-Retries zu verhindern.',
      'Ressourcen-URIs (/items) identifizieren Entitäten; HTTP-Verben (GET, POST) definieren die jeweiligen Operationen.',
    ],
  },
  'fastapi-01': {
    name: 'Pfad-Parameter',
    objective: 'Extrahiere dynamische Variablen aus dem URL-Pfad mit automatisierter Typvalidierung und RFC 7807 Fehlerstruktur.',
    hint: 'Verwende `{user_id}` im Routenpfad und deklariere `user_id: int` in den Parametern der Handler-Funktion.',
    learning: [
      'Segmente in geschweiften Klammern `{param}` repräsentieren dynamische Bezeichner einer hierarchischen REST-Ressource.',
      'Interna: FastAPI kompiliert Pfade beim Start zu regulären Ausdrücken und nutzt Typannotationen für automatisches Casting.',
      'Schlägt die Typkonvertierung fehl (z. B. "ada" statt int), bricht FastAPI sofort mit Status 422 Unprocessable Entity ab.',
    ],
    fieldNotes: [
      'Verwende in öffentlichen APIs UUIDs statt sequentieller Ganzzahlen, um Objektaufzählungsangriffe (BOLA/IDOR) abzuwehren.',
      'Führe Autorisierungsprüfungen für Ressourcen niemals im Pfad-Parsing durch; nutze Dependency-Guards.',
      'Pfad-Parameter sind obligatorisch; optionale Filter sollten als Query-Parameter modelliert werden.',
    ],
  },
  'fastapi-02': {
    name: 'Query-Parameter',
    objective: 'Implementiere flexible Filter-, Such- und Paginierungsverträge über standardisierte Query-Strings.',
    hint: 'Ergänze Funktionsparameter mit Standardwerten: `q: str = ""` und `limit: int = 10` in `@app.get("/search")`.',
    learning: [
      'Funktionsargumente außerhalb des URL-Pfads werden automatisch als Query-Parameter (RFC 3986 `?key=val`) extrahiert.',
      'Interna: Starlette parst den Query-String; FastAPI konvertiert Strings in native Python-Typen (int, bool, float).',
      'Ein Standardwert (`limit = 10`) macht den Parameter optional; das Fehlen eines Defaults macht ihn zum Pflichtfeld.',
    ],
    fieldNotes: [
      'Setze bei Paginierung immer ein hartes Limit (z. B. `Query(le=100)`), um Server-RAM und Datenbanken vor Überlastung zu schützen.',
      'Query-Strings landen in Server-Access-Logs und Browser-Verläufen; übermittle niemals Tokens oder Passwörter in der Query.',
      'Stelle sicher, dass Datenbankindizes die Filterspalten abdecken, um teure Full-Table-Scans in Produktion zu vermeiden.',
    ],
  },
  'fastapi-03': {
    name: 'Request-Body mit Pydantic',
    objective: 'Empfange und validiere strukturierte JSON-Payloads mit objektorientierten Pydantic BaseModel Schemas.',
    hint: 'Definiere `class User(BaseModel):` mit `name: str` und `age: int = 0`, und nimm `user: User` in POST /users entgegen.',
    learning: [
      'Request-Bodies für Erstellungs- und Update-Operationen werden über Pydantic-Klassen mit Typprüfung validiert.',
      'Interna: ASGI liest den Byte-Stream, parst JSON und instanziiert das Modell mit strenger Feldvalidierung.',
      'Das Schema wird automatisch in OpenAPI `components.schemas` publiziert und treibt interaktive Swagger-UIs an.',
    ],
    fieldNotes: [
      'Trenne Input-DTOs von Datenbank-ORM-Modellen, um gefährliche Mass-Assignment-Schwachstellen auszuschließen.',
      'Definiere Validierungsregeln (z. B. min_length, regex) direkt am Pydantic-Feld mit `Field(...)`.',
      'Granulare 422-Validierungsfehler liefern Clients exakte Fehlerpfade (`loc: ["body", "age"]`) zur schnellen Fehlerbehebung.',
    ],
  },
  'fastapi-04': {
    name: 'Statuscodes und 204 No Content',
    objective: 'Beherrsche standardkonforme Löschsemantik ohne Rückgabe-Payload mit HTTP 204 No Content.',
    hint: 'Implementiere `@app.delete("/notes/{note_id}", status_code=204)` mit Rückgabe eines leeren Dictionarys `{}`.',
    learning: [
      'Das HTTP DELETE-Verb signalisiert die permanente oder logische Entfernung der adressierten Ressource.',
      'Interna: RFC 9110 §15.3.5 verbietet einen Message-Body bei Status 204; Server und HTTP-Clients verwerfen Payloads.',
      'Statuscodes steuern Client-Zustände: 200 liefert Daten, 201 bestätigt Erstellung, 204 bestätigt Löschung ohne Payload.',
    ],
    fieldNotes: [
      'Verwende in Unternehmensanwendungen Soft-Deletes (`deleted_at` Timestamp), um Revisionssicherheit und Wiederherstellung zu gewährleisten.',
      'Gestalte DELETE-Operationen idempotent: Mehrfaches Löschen derselben Ressource sollte stabil 204 oder 404 liefern.',
      'Lösche abhängige Fremdschlüssel-Datensätze innerhalb von Datenbanktransaktionen kaskadierend oder bereinige Referenzen.',
    ],
  },
  'fastapi-05': {
    name: 'Vollständiges CRUD-Muster',
    objective: 'Strukturiere den kompletten Create-, Read-, Update- und Delete-Zyklus auf einer einheitlichen REST-Ressource.',
    hint: 'Implementiere alle 4 Methoden: POST `/notes` (201), GET `/notes/{note_id}`, PUT `/notes/{note_id}` und DELETE `/notes/{note_id}` (204).',
    learning: [
      'RESTful Design gruppiert Operationen um Ressourcenkollektionen (`/notes`) und Einzelressourcen (`/notes/{id}`).',
      'Interna: PUT ersetzt die vollständige Ressourcendarstellung; PATCH dient der partiellen Feldmodifikation.',
      'Präzises Methoden-Routing stellt sicher, dass dieselbe URI je nach HTTP-Verb isolierte Server-Logiken ausführt.',
    ],
    fieldNotes: [
      'Verwende für Routen Plural-Substantive (`/notes`, `/users`) und niemals Verben (`/createNote` verletzt REST-Prinzipien).',
      'Gewährleiste Idempotenz für PUT: Wiederholtes Senden desselben Payloads muss zu demselben Zustand führen.',
      'Kapsle mehrstufige Änderungen in atomaren Datenbanktransaktionen mit automatischem Rollback bei Fehlern.',
    ],
  },
  'fastapi-06': {
    name: 'Fehlerbehandlung mit HTTPException',
    objective: 'Stoppe ungültige Anfragen sicher und liefere semantische Fehlerantworten mit Status 404 Not Found aus.',
    hint: 'Füge vor dem Return ein: `if item_id == 99: raise HTTPException(status_code=404, detail="Item not found")`.',
    learning: [
      'Das Werfen von HTTPException bricht die Handler-Ausführung sofort ab und aktiviert Starlettes Error-Middleware.',
      'Interna: Das Framework serialisiert die Fehler-Payload standardisiert mit `{"detail": "..."}` und dem HTTP-Status.',
      'Statuscodes informieren über Fehlerursachen: 404 für nicht gefunden, 400 für ungültige Parameter, 403 für fehlende Rechte.',
    ],
    fieldNotes: [
      'Lass niemals rohe Python-Tracebacks oder Datenbankfehler an Clients durchsickern; logge intern und gib bereinigte Fehler zurück.',
      'Standardisiere Fehlerstrukturen über alle Microservices hinweg, damit Frontend-Clients Fehler einheitlich parsen können.',
      'Dokumentiere potenzielle Fehler-Statuscodes in OpenAPI-Responses oder Docstrings für transparente API-Verträge.',
    ],
  },
  'fastapi-07': {
    name: 'Dependency Injection mit Depends',
    objective: 'Entkoppele Konfigurationen, Datenbank-Sessions und Shared Services durch Inversion of Control (IoC).',
    hint: 'Deklariere in `@app.get("/info")` den Parameter `settings: dict = Depends(get_settings)` zur Injection.',
    learning: [
      'Dependency Injection (DI) löst wiederverwendbare Provider auf, bevor der Request-Handler betreten wird.',
      'Interna: FastAPI löst Abhängigkeiten als gerichteten azyklischen Graphen (DAG) auf und cacht Ergebnisse pro Request.',
      'Generator-Dependencies mit `yield` fungieren als Context Manager für sauberes Ressourcen-Cleanup (Datenbank-Sessions).',
    ],
    fieldNotes: [
      'Verwende `yield` in Datenbank-Dependencies für garantiertes Session-Closing und automatisches Commit/Rollback.',
      'Nutze `app.dependency_overrides` in Unittests, um Datenbanken oder externe Schnittstellen ohne globale Mocks zu testen.',
      'Halte Dependencies entkoppelt und modular, um wiederverwendbare Auth-, Caching- und Logging-Pipelines zu bilden.',
    ],
  },
  'fastapi-08': {
    name: 'API-Key Authentifizierung',
    objective: 'Sichere Endpoints durch Auswertung von HTTP-Headern ab und weise unberechtigte Anfragen mit Status 401 ab.',
    hint: 'Deklariere `api_key: str = Header(...)` in der Signatur von `@app.get("/admin")` als Pflicht-Header.',
    learning: [
      'Der Parameter `Header(...)` extrahiert Request-Header; fehlende Pflicht-Header lösen automatisch Validierungsfehler aus.',
      'Interna: RFC 7230 definiert Headernamen als case-insensitiv; FastAPI mappt snake_case (`api_key`) automatisch auf kebab-case.',
      'Deklarierte Security-Parameter füllen automatisch OpenAPI `components.securitySchemes` für Swagger-Authorisierungsdialoge.',
    ],
    fieldNotes: [
      'Nutze für Secret-Vergleiche stets zeitinvariante String-Vergleiche (`secrets.compare_digest`), um Timing-Angriffe zu blockieren.',
      'Folge HTTP-Standards: Nutze `Authorization: Bearer <token>` oder `X-API-Key` statt proprietärer Headernamen.',
      'Erzwinge TLS (HTTPS), damit Header-Credentials im öffentlichen Netzwerk niemals im Klartext übertragen werden.',
    ],
  },
  'fastapi-09': {
    name: 'Response-Modell und Datenfilterung',
    objective: 'Schütze vertrauliche Daten und erzwinge Output-Filterung über die response_model Deklaration.',
    hint: 'Setze `response_model=UserOut` im `@app.get` Dekorator und definiere `class UserOut(BaseModel):`.',
    learning: [
      'Das `response_model` definiert den Vertrag für ausgehende Daten und fungiert als Sicherheitsfilter.',
      'Interna: FastAPI filtert das zurückgegebene Objekt durch das Schema und entfernt sensible Felder (wie Passwort-Hashes).',
      'Generiert automatisch das 200 OK Response-Schema in OpenAPI unter `paths.{path}.responses.200`.',
    ],
    fieldNotes: [
      'Gib niemals rohe ORM-Datenbankobjekte ohne Response-DTO zurück, um unabsichtliche Datenlecks zu verhindern.',
      'Trenne `UserCreate` (Eingabe) und `UserOut` (Ausgabe) strikt, um saubere Schnittstellengrenzen zu wahren.',
      'Nutze `response_model_exclude_unset=True`, um ungesetzte Standardwerte aus Payloads zu entfernen und Bandbreite zu sparen.',
    ],
  },
  'plumber-01': {
    name: 'Webdienste in R mit Plumber',
    objective: 'Erstelle HTTP-Endpoints in R unter Verwendung von roxygen2-Kommentar-Metaprogrammierung.',
    hint: 'Setze den Kommentar `#* @get /` über die Funktion `function() list(hello = "world")`.',
    learning: [
      'Das Plumber-Paket parst spezielle `#* @get /` Kommentare und bindet native R-Funktionen an HTTP-Routen.',
      'Interna: Plumber instanziiert ein PlumberRouter-Objekt, das R-Closures in isolierten Umgebungen auswertet.',
      'Output-Serialisierung: Benannte R-Listen werden über `jsonlite` automatisch in valide JSON-Strings konvertiert.',
    ],
    fieldNotes: [
      'R ist single-threaded; rechenintensive Jobs müssen in Worker-Prozesse ausgelagert werden, um den Server nicht zu blockieren.',
      'Verwende benannte Listen (`list(key = value)`), um konsistente JSON-Dictionary-Objekte zu garantieren.',
      'Deploye Plumber-APIs in Docker-Containern hinter Reverse-Proxys für horizontale Skalierbarkeit.',
    ],
  },
  'plumber-02': {
    name: 'Pfad-Parameter in Plumber',
    objective: 'Lies dynamische URI-Segmente in R über spitze Klammern `<param>` aus und typisiere Eingaben.',
    hint: 'Nutze `#* @get /users/<id>` und `#* @param id:int` und wandle im Body mit `as.integer(id)` um.',
    learning: [
      'In Plumber kennzeichnen spitze Klammern `<id>` dynamische Pfadsegmente in Kommentar-Routen.',
      'Interna: Pfadsegmente werden als Character-Strings übergeben; `#* @param id:int` deklariert den Zieltyp.',
      'Der Aufruf `as.integer(id)` stellt sicher, dass in JSON numerische Literale statt Strings erzeugt werden.',
    ],
    fieldNotes: [
      'Validiere Pfadparameter am Anfang der Funktion und setze `res$status <- 400` bei ungültigen Eingaben.',
      'Verhindere SQL-Injection: Füge Pfadvariablen niemals unmaskiert in Datenbankabfragen ein; nutze parametrisierte Queries.',
      'Die Syntax `<id>` in Plumber und `{id}` in FastAPI erfüllen auf HTTP-Ebene identische Funktionen.',
    ],
  },
  'plumber-03': {
    name: 'POST-Payload und Status in Plumber',
    objective: 'Verarbeite eingehende POST-JSON-Daten über das req-Objekt und steuere Statuscodes über res.',
    hint: 'Deklariere Funktionsargumente `(req, res)`, setze `res$status <- 201` und lies `req$postBody$name`.',
    learning: [
      'Plumber übergibt Request- und Response-Objekte über die speziellen Funktionsargumente `req` und `res`.',
      'Interna: Gepipte JSON-Daten stehen im Request-Objekt als R-Liste unter `req$postBody` bereit.',
      'Der HTTP-Statuscode wird über `res$status <- 201` gesetzt; `#* @serializer json` erzwingt JSON-Encoding.',
    ],
    fieldNotes: [
      'Prüfe `req$postBody` sorgfältig auf Vollständigkeit, da R ohne Validierungsbibliotheken keine Typprüfung erzwingt.',
      'Setze bei Erstellungs-Operationen immer explizit den Status 201 Created.',
      'Begrenze maximale Payload-Größen am Reverse-Proxy (z. B. Nginx client_max_body_size) gegen DoS-Angriffe.',
    ],
  },
  'openapi-01': {
    name: 'Metadaten in OpenAPI 3.0',
    objective: 'Bereichere maschinenlesbare OpenAPI-Spezifikationen mit Kategorisierungs-Tags und präzisen Zusammenfassungen.',
    hint: 'Ergänze `tags=["pets"]` und `summary="..."` in den Dekoratoren der GET- und POST-Routen.',
    learning: [
      'OpenAPI 3.0 ist ein standardisierter Vertrag, der alle Endpoints, Parameter und Schnittstellen dokumentiert.',
      'Interna: FastAPI kompiliert Dekorator-Metadaten (`tags`, `summary`) direkt in das OpenAPI-Root-Schema.',
      'Swagger UI und Redoc konsumieren diese Spezifikation dynamisch für interaktive API-Dokumentation.',
    ],
    fieldNotes: [
      'Strukturiere komplexe APIs mit logischen Tags, damit Frontend-Teams Endpoints schnell auffinden.',
      'Pflege präzise Zusammenfassungen und Docstrings; unklare Schnittstellen treiben Supportkosten in die Höhe.',
      'Integriere OpenAPI-Schema-Validierungen in CI/CD-Pipelines, um Breaking Changes frühzeitig zu erkennen.',
    ],
  },
  'openapi-02': {
    name: 'Request-Schemas in OpenAPI',
    objective: 'Publiziere Pydantic-Modelle als standardisierte JSON-Schemas im components.schemas Zweig.',
    hint: 'Definiere `class Item(BaseModel):` mit `name: str` und nutze `item: Item` in `@app.post("/items")`.',
    learning: [
      'Pydantic-Modelle werden automatisch in standardkonforme JSON-Schema-Objekte unter `components.schemas` übersetzt.',
      'Interna: Operationen referenzieren das Schema über `$ref: "#/components/schemas/Item"` im requestBody.',
      'Contract-First Prinzip: Ermöglicht automatische TypeScript-Codegenerierung für Frontend-Entwickler.',
    ],
    fieldNotes: [
      'Nutze Codegeneratoren (OpenAPI Generator, Orval), um API-Clients direkt aus der Spezifikation zu bauen.',
      'Achte auf Abwärtskompatibilität: Lösche keine Felder in publizierten Schemas, sondern depriciere sie schrittweise.',
      'Ergänze Beispielwerte über Pydantics `json_schema_extra` für realitätsnahe Swagger-Dokumentation.',
    ],
  },
  'compare-01': {
    name: 'Ops-Endpoints in FastAPI',
    objective: 'Implementiere standardisierte Betriebs-Endpoints `/health` und `/metrics` für Cloud- und Kubernetes-Umgebungen.',
    hint: 'Definiere `@app.get("/health")` und `@app.get("/metrics")`, die beide `{"status": "ok"}` zurückgeben.',
    learning: [
      'Observability erfordert dedizierte Endpoints: `/health` für Liveness und `/metrics` für Telemetriedaten.',
      'Interna: Container-Orchestratoren wie Kubernetes prüfen diese Pfade zyklisch für Pod-Lifecycle-Entscheidungen.',
      'Die Trennung von Business- und Ops-Routen schützt Datenbanken vor unnötiger Last durch Monitoring-Tools.',
    ],
    fieldNotes: [
      'Unterscheide Liveness (läuft Prozess?) von Readiness (ist Datenbank verbunden und bereit für Traffic?).',
      'Halte Health-Checks extrem schlank und schnell; langsame Checks führen bei hoher Last zu Container-Kaskaden-Restarts.',
      'Schütze interne `/metrics` Pfade vor öffentlichem Zugriff über Ingress-Regeln oder interne Netzwerkrichtlinien.',
    ],
  },
  'compare-02': {
    name: 'Ops-Endpoints in Plumber',
    objective: 'Implementiere dieselben Monitoring-Verträge in R und verifiziere die Sprachunabhängigkeit von HTTP-APIs.',
    hint: 'Definiere `#* @get /health` und `#* @get /metrics` in der R-Datei mit Rückgabe von `list(status = "ok")`.',
    learning: [
      'Polyglotte Systemarchitektur: HTTP-Schnittstellenverträge sind völlig unabhängig von der Programmiersprache.',
      'Interna: Ob Starlette in Python oder Plumber in R – das Protokoll-Wire-Format mit Status 200 und JSON ist identisch.',
      'Standardisierte Verträge ermöglichen einheitliche Prometheus- und Grafana-Dashboards über alle Services hinweg.',
    ],
    fieldNotes: [
      'Halte Status- und Metrik-Formate im gesamten Unternehmen über alle Sprachen und Frameworks konsistent.',
      'In Data-Science-Architekturen können Plumber-Serving-Pods nahtlos neben Python-Gateways betrieben werden.',
      'Schreibe automatisierte Blackbox-Integrationstests, die das HTTP-Verhalten anstelle interner Sprach-Mocks testen.',
    ],
  },
  'http-03': {
    name: 'Caching & Bedingte Anfragen (ETag & 304)',
    objective: 'Nutze Cache-Validierung mit ETag und If-None-Match Headern und antworte bei aktuellem Cache mit 304 Not Modified.',
    hint: 'Definiere `@app.get("/items")` mit `if_none_match: str = Header(None, alias="If-None-Match")`. Wirf bei Übereinstimmung mit "etag-v1" 304 Not Modified.',
    learning: [
      'RFC 9111 HTTP Caching reduziert Serverlast und Bandbreite durch Entity Tags (ETags) drastisch.',
      'Interna: Sendet der Client einen passenden `If-None-Match` Header, antwortet der Server mit 304 ohne Body.',
      'Bedingte Anfragen schützen Datenbanken vor überflüssigen Abfragen und Serialisierungskosten.',
    ],
    fieldNotes: [
      'Verwende Strong ETags (kryptografische Hashes) oder Weak ETags (W/) je nach Konsistenzanforderung.',
      'Kombiniere ETags mit `Cache-Control` Anweisungen (max-age, must-revalidate) für CDNs und Browser.',
      'Antworten mit Status 304 dürfen gemäß RFC 9110 keinen Nachrichtenkörper enthalten.',
    ],
  },
  'fastapi-10': {
    name: 'Paginierung & Envelope-Muster',
    objective: 'Implementiere Standard-Paginierung mit limit und offset sowie eine strukturierte Envelope-Antwort.',
    hint: 'Definiere `@app.get("/products")` mit `limit: int = 10` und `offset: int = 0` und gib ein Dict mit items, total, limit und offset zurück.',
    learning: [
      'Unbegrenzte Listen können Microservices überlasten; Paginierung mit limit und offset schützt den Speicher.',
      'Das Envelope-Muster kapselt Datensätze in `items` neben Metadaten (`total`, `limit`, `offset`) für Erweiterbarkeit.',
      'Interna: FastAPI bindet Abfrageparameter-Standardwerte typsicher und fehlertolerant.',
    ],
    fieldNotes: [
      'Für Millionen Datensätze empfiehlt sich Cursor-Paginierung (Keyset) statt teurem SQL OFFSET.',
      'Setze immer eine harte Obergrenze für limit (z. B. max 100) via `Query(le=100)` gegen DoS-Angriffe.',
      'Standard-Paginierungs-Envelopes erleichtern Frontend-Tabellen die konsistente Seitennavigation.',
    ],
  },
  'fastapi-11': {
    name: 'Bearer Token Authentifizierung',
    objective: 'Schütze Endpoints durch Validierung von Bearer Tokens im HTTP Authorization Header gemäß RFC 6750.',
    hint: 'Lies `authorization: str = Header(...)` aus und wirf bei Abweichung von "Bearer secret-token-123" einen 401 Unauthorized Fehler.',
    learning: [
      'RFC 6750 definiert das Bearer Token Schema: Clients übermitteln Tokens via `Authorization: Bearer <token>`.',
      'Interna: FastAPI extrahiert den Header, validiert die Signatur und stellt die authentifizierte Identität bereit.',
      'Ungültige oder fehlende Tokens führen sofort zum Abbruch mit Status 401 Unauthorized.',
    ],
    fieldNotes: [
      'Übertrage Bearer Tokens niemals über unverschlüsseltes HTTP; HTTPS mit TLS ist zwingend erforderlich.',
      'Signiere Tokens asymmetrisch (RS256/EdDSA) mit kurzen Ablaufzeiten und separaten Refresh Tokens.',
      'Vermeide detaillierte interne Fehlermeldungen in 401-Antworten zur Vermeidung von Informationslecks.',
    ],
  },
  'fastapi-12': {
    name: 'Rollenbasierte Autorisierung (RBAC) & 403',
    objective: 'Erzwinge Zugriffskontrollen: Trenne Authentifizierung von Autorisierung und antworte bei fehlenden Rechten mit 403 Forbidden.',
    hint: 'Lies in `@app.get("/admin/audit")` den Header `x_role: str = Header("user", alias="X-Role")` aus; wirf 403, wenn x_role nicht "admin" ist.',
    learning: [
      'Authentifizierung (Wer bist du?) ist strikt von Autorisierung (Was darfst du tun?) getrennt.',
      'Status 401 bedeutet unauthentifiziert; Status 403 Forbidden signalisiert fehlende Berechtigungen.',
      'Interna: Sicherheits-Guards prüfen Rollen-Claims vor Ausführung administrativer Handler-Logik.',
    ],
    fieldNotes: [
      'Befolge das Prinzip der minimalen Rechtevergabe (Least Privilege): Standardmäßig verbieten, explizit erlauben.',
      'In Multi-Tenant SaaS muss neben der Rolle auch die Mandantenzugehörigkeit geprüft werden (BOLA-Schutz).',
      'Protokolliere abgewiesene 403-Ereignisse in Sicherheits-Audit-Logs zur Erkennung von Angriffsversuchen.',
    ],
  },
  'fastapi-13': {
    name: 'Rate Limiting & 429 Too Many Requests',
    objective: 'Schütze API-Kapazitäten vor Überlastung durch Quotenprüfung und Status 429 Too Many Requests.',
    hint: 'Lies `x_rate_limit: int = Header(10, alias="X-Rate-Limit")` aus und wirf bei Werten kleiner oder gleich 0 einen 429 Fehler.',
    learning: [
      'RFC 6585 definiert Status 429 Too Many Requests zum Schutz vor Denial-of-Service und Endlosschleifen.',
      'Interna: Server erfassen Restkontingente pro IP oder API-Key mittels Token-Bucket in Redis oder Memory.',
      'Produktions-APIs senden Telemetrie-Header wie `X-RateLimit-Remaining` und `Retry-After` mit.',
    ],
    fieldNotes: [
      'Stufe Rate-Limits ab: Anonymer Traffic erhält strikte Grenzen, registrierte Kunden höhere Kontingente.',
      'Sende bei 429 immer einen `Retry-After` Header, damit SDKs automatisches Backoff durchführen können.',
      'Platziere Rate-Limiting vorzugsweise am API Gateway (Cloudflare/Nginx), um Backend-Worker zu entlasten.',
    ],
  },
  'plumber-04': {
    name: 'Plumber Filter & Pipeline-Hooks in R',
    objective: 'Fange HTTP-Anfragen in R mit `#* @filter` ab und leite den Kontext via `forward()` an nachgelagerte Handler weiter.',
    hint: 'Definiere in R `#* @filter logger` mit `function(req) { forward() }` gefolgt von Route `#* @get /data`.',
    learning: [
      'Plumber-Filter (`#* @filter`) fangen eingehende Anfragen vor den eigentlichen Routen-Handlern ab.',
      'Interna: Die Funktion `forward()` reicht die Ausführungskontrolle in der Pipeline weiter.',
      'Filter ermöglichen Logging, Ausführungszeitmessung, CORS-Header und Sicherheits-Guards in R.',
    ],
    fieldNotes: [
      'Halte Filter schnell und nicht-blockierend, um die Single-Threaded Event Loop von R nicht auszubremsen.',
      'Hänge Nachverfolgungsdaten (Request IDs, Timestamps) direkt an das `req` Objekt an.',
      'Kombiniere Filter in Produktion mit globalem Error-Handling (`pr_set_error`) gegen Stacktrace-Leaks.',
    ],
  },
  'openapi-03': {
    name: 'Fehlerverträge in OpenAPI dokumentieren',
    objective: 'Dokumentiere Client-Fehler (z. B. 404 Not Found) explizit im OpenAPI-Vertrag über strukturierte Fehlerbehandlung.',
    hint: 'Implementiere `@app.get("/orders/{order_id}")`; wirf bei `order_id == 0` Status 404 mit detail="Order not found".',
    learning: [
      'Vollständige OpenAPI-Verträge dokumentieren neben 200 OK auch Fehlercodes (404, 400, 422).',
      'Interna: FastAPI analysiert `HTTPException`-Statuscodes und integriert sie in die OpenAPI Responses Map.',
      'Explizite Fehlerdokumentation ermöglicht automatisierten Contract-Tests (z. B. Schemathesis) das Prüfen von Grenzfällen.',
    ],
    fieldNotes: [
      'Halte Fehlerantworten microservice-weit gemäß RFC 7807 (Problem Details) einheitlich.',
      'Nutze Contract-Testing in CI/CD, um Diskrepanzen zwischen Spezifikation und Implementierung zu verhindern.',
      'Präzise Fehlerverträge beschleunigen die Frontend-Integration und senken Supportanfragen signifikant.',
    ],
  },
};

