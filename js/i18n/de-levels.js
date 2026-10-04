/**
 * German level metadata catalog: name, objective, hint, learning, fieldNotes.
 * Technical German used by professional engineers.
 */

export const DE_LEVELS = {
  'http-01': {
    name: 'Was ist ein Endpoint?',
    objective: 'Veröffentliche die Root-URL deines Webdienstes und liefere eine valide JSON-Payload aus.',
    hint: 'Definiere eine GET-Route auf `/`, die ein kleines JSON-Objekt zurückgibt.',
    learning: [
      'Ein Endpoint verbindet eine HTTP-Methode (Verb) mit einem adressierbaren Pfadbezeichner.',
      'FastAPI registriert Routing-Hooks über Dekoratoren wie @app.get("/").',
      'Zurückgegebene Python-Dictionaries werden automatisch in RFC 8259-konforme JSON-Objekte serialisiert.',
    ],
    fieldNotes: [
      'Kubernetes-Liveness- und Readiness-Probes prüfen typischerweise Root- oder /healthz-Endpoints.',
      'Gib immer strukturierte Dictionary-Objekte anstelle nackter JSON-Arrays zurück, um Abwärtskompatibilität zu wahren.',
      'Halte Root-Handler nicht-blockierend: Vermeide synchrone Datei-I/O oder schwere Berechnungen in Einstiegsrouten.',
    ],
  },
  'http-02': {
    name: 'HTTP-Methoden',
    objective: 'Unterscheide zwischen sicherem Lesen (GET) und zustandsveränderndem Erstellen (POST).',
    hint: 'Füge `@app.post("/items")` hinzu, das Status 201 und das erstellte Item zurückgibt.',
    learning: [
      'GET-Requests müssen sicher (safe) und idempotent sein und dürfen den Serverzustand nicht mutieren.',
      'POST erstellt eine neue Ressource und antwortet nach HTTP-Standard mit 201 Created.',
      'Derselbe Pfad mit unterschiedlichen HTTP-Methoden repräsentiert zwei völlig unabhängige Operationen.',
    ],
    fieldNotes: [
      'Verwende niemals GET für Datenmutationen; dies bricht Browser-Caches und HTTP-Proxys.',
      'Eine 201-Antwort sollte idealerweise einen Location-Header mit der URI der neuen Ressource enthalten.',
      'In verteilten Systemen verhindern Idempotency-Keys versehentliche Duplikate bei wiederholten POSTs.',
    ],
  },
  'fastapi-01': {
    name: 'Pfad-Parameter',
    objective: 'Extrahiere dynamische Variablen aus dem URL-Pfad mit automatisierter Typvalidierung.',
    hint: 'Verwende `{user_id}` im Pfad und deklariere `user_id: int` in der Funktionssignatur.',
    learning: [
      'Pfadsegmente in geschweiften Klammern {param} matchen dynamische Segmente der URI.',
      'Typ-Annotationen in Python steuern FastAPIs automatisches Type-Casting und Parsing.',
      'Ungültige Eingaben lösen sofort strukturierte 422 Unprocessable Entity Validierungsfehler aus.',
    ],
    fieldNotes: [
      'Nutze für Identifier in Pfaden stets integers oder UUIDs, um Injection-Angriffe zu minimieren.',
      'Halte Pfade hierarchisch und ressourcenorientiert (z. B. /orgs/{org_id}/teams/{team_id}).',
      'FastAPI validiert Typen vor dem Betreten des Handlers; dein Code empfängt garantierte Datentypen.',
    ],
  },
  'fastapi-02': {
    name: 'Query-Parameter',
    objective: 'Implementiere flexible Filter-, Such- und Paginierungs-Contracts über Query-Strings.',
    hint: 'Optionale Query-Parameter erhalten Standardwerte, z. B. `limit: int = 10`.',
    learning: [
      'Funktionsargumente, die nicht im Pfad vorkommen, werden automatisch als Query-Parameter interpretiert.',
      'Standardwerte machen Parameter optional; Argumente ohne Default sind Pflichtfelder.',
      'Typhinweise konvertieren Query-Strings automatisch in native Python-Typen wie int, bool oder float.',
    ],
    fieldNotes: [
      'Setze immer ein oberes Limit für Paginierungs-Parameter, um Denial-of-Service zu verhindern.',
      'Filter, Sortierung und Suche gehören in den Query-String, nicht in den Pfad.',
      'Nutze Pydantics Field() oder Query(), um Validierungsregeln wie Mindestlängen durchzusetzen.',
    ],
  },
  'fastapi-03': {
    name: 'Request-Body',
    objective: 'Empfange und validiere strukturierte JSON-Payloads mittels Pydantic-Modellen.',
    hint: 'Erstelle ein Pydantic-Modell und nimm es als `user: User` im Funktionskopf entgegen.',
    learning: [
      'Pydantic-Modelle leiten sich von BaseModel ab und definieren das strikte Typschema eingehender Daten.',
      'FastAPI parst den Request-Body, validiert alle Felder und mappt sie in Modellinstanzen.',
      'OpenAPI registriert das Modell automatisch unter components.schemas für interaktive Dokumentation.',
    ],
    fieldNotes: [
      'Trenne Eingangsmodelle (Create) strikt von internen Datenbankmodellen (ORM-Entities).',
      'Verwende Pydantic-Validatoren (@field_validator) für Geschäftsregeln und Domänenlogik.',
      'Schütze Endpoints vor übergroßen Payloads durch Proxy-Konfigurationen (z. B. Nginx client_max_body_size).',
    ],
  },
  'fastapi-04': {
    name: 'Delete und Statuscodes',
    objective: 'Beherrsche standardkonforme Lösch-Semantik mit leeren 204 No Content Antworten.',
    hint: 'Gib bei DELETE ein leeres Objekt mit `status_code=204` zurück.',
    learning: [
      'DELETE-Operationen entfernen Ressourcen dauerhaft oder markieren sie als gelöscht (Soft Delete).',
      'Status 204 No Content signalisiert Erfolg ohne nachfolgenden Response-Body.',
      'Dekoratoren steuern den Standard-Erfolgsstatus über das Argument status_code.',
    ],
    fieldNotes: [
      'Viele HTTP-Clients werfen Fehler, wenn ein 204-Response einen Body enthält; halte ihn zwingend leer.',
      'DELETE sollte idempotent sein: Mehrmaliges Löschen derselben ID sollte nicht mit 500 crashen.',
      'In Produktions-APIs ist Soft Deleting mit deleted_at-Timestamps üblich, um Audits zu gewährleisten.',
    ],
  },
  'fastapi-05': {
    name: 'CRUD auf einer Ressource',
    objective: 'Orchestriere vollständige Create-, Read-, Update- und Delete-Zyklen auf einer Ressource.',
    hint: 'Ein Pfad `/notes/{note_id}` mit GET, PUT, DELETE — plus POST auf `/notes` zum Erstellen.',
    learning: [
      'RESTful APIs organisieren Ressourcen unter konsistenten Kollektions- und Elementpfaden.',
      'POST /collection erstellt; GET, PUT, DELETE auf /collection/{id} verwalten das Einzelelement.',
      'PUT ersetzt die gesamte Ressource; PATCH aktualisiert Teilfelder selektiv.',
    ],
    fieldNotes: [
      'Halte URL-Konventionen im gesamten Projekt konsistent: Plural für Ressourcen (/notes statt /note).',
      'Dokumentiere idempotente Methoden sauber; PUT muss bei wiederholter Ausführung stabil bleiben.',
      'Gruppiere CRUD-Routen in realen Projekten mit APIRouter in modulare Controller-Dateien.',
    ],
  },
  'fastapi-06': {
    name: 'HTTPException für fehlende Ressourcen',
    objective: 'Unterbrich fehlerhafte Ausführungen und liefere semantische HTTP-Fehlerantworten.',
    hint: 'Wirf `HTTPException(status_code=404)` wenn `item_id == 99`.',
    learning: [
      'HTTPException bricht die Request-Pipeline kontrolliert ab und verhindert Server-Crashes.',
      'Status 404 signalisiert eindeutig, dass eine angeforderte Entität nicht existiert.',
      'Fehlerresponses enthalten ein strukturiertes JSON-Objekt mit einem aussagekräftigen "detail"-Schlüssel.',
    ],
    fieldNotes: [
      'Gib niemals interne Tracebacks oder SQL-Fehler an den Client weiter; nutze generische 4xx/5xx-Fehler.',
      'FastAPI erlaubt benutzerdefinierte Exception-Handler zur Vereinheitlichung aller Fehlerformate.',
      'Logge 404-Fehler mit Bedacht; sie sind oft normales Client-Verhalten und keine kritischen Systemfehler.',
    ],
  },
  'fastapi-07': {
    name: 'Dependency Injection',
    objective: 'Entkopple geteilte Ressourcen, Konfigurationen und Datenbanksessions via Dependency Injection.',
    hint: 'Definiere `get_settings()`, das ein Dict liefert, und nutze `Depends(get_settings)` im Handler.',
    learning: [
      'FastAPIs Depends() löst Abhängigkeiten hierarchisch vor dem Aufruf der Handler-Funktion auf.',
      'Dependencies eignen sich ideal für Datenbankverbindungen, Authentifizierung und Settings.',
      'In Unit-Tests lassen sich Abhängigkeiten über app.dependency_overrides trivial austauschen.',
    ],
    fieldNotes: [
      'Verwende yield-Dependencies für Datenbank-Sessions, um sauberes Schließen und Rollbacks zu garantieren.',
      'Halte Dependency-Provider schlank und idempotent; vermeide schwere Berechnungen im Injection-Pfad.',
      'Zentralisiere Umgebungsvariablen in pydantic-settings und injiziere sie konsistent über Depends.',
    ],
  },
  'fastapi-08': {
    name: 'API-Key-Authentifizierung',
    objective: 'Schütze administrative und sensible Endpoints über HTTP-Header-Sicherheitsverträge.',
    hint: 'Verwende `api_key: str = Header(...)` und weise Anfragen ohne Schlüssel mit 401 ab.',
    learning: [
      'HTTP-Header transportieren Metadaten wie Token, API-Keys und Content-Type-Informationen.',
      'Header(...) bindet Request-Header an Variablen und deklariert sie in der OpenAPI-Spezifikation.',
      'Fehlende oder ungültige Credentials erfordern Status 401 Unauthorized mit WWW-Authenticate-Header.',
    ],
    fieldNotes: [
      'Übertrage sensible Tokens niemals im Query-String; URLs landen in Server-Logs und Browser-Verläufen.',
      'Nutze in Produktion sichere String-Vergleiche (secrets.compare_digest), um Timing-Angriffe zu verhindern.',
      'Integriere FastAPIs Security-Utilities (APIKeyHeader, OAuth2PasswordBearer) für vollständige Swagger-UI-Integration.',
    ],
  },
  'fastapi-09': {
    name: 'response_model',
    objective: 'Filtere und serialisiere ausgehende Payloads über dedizierte Output-Schemas.',
    hint: 'Deklariere `class UserOut(BaseModel)` und setze `response_model=UserOut` an der Route.',
    learning: [
      'response_model definiert den formalen Ausgabevertrag einer Route in FastAPI und OpenAPI.',
      'FastAPI filtert Attribute heraus, die nicht im response_model deklariert sind (z. B. gehashte Passwörter).',
      'Es transformiert ORM-Objekte und Dictionaries automatisch in das gewünschte Ziel-JSON-Format.',
    ],
    fieldNotes: [
      'Verwende niemals dein DB-Modell direkt als Output; erstelle immer dedizierte Read-Schemas.',
      'response_model verhindert Datenlecks durch versehentlich exponierte interne Felder.',
      'Nutze response_model_exclude_unset, um optionale Standardwerte nicht unnötig zu übertragen.',
    ],
  },
  'plumber-01': {
    name: 'Deine erste Plumber-Route',
    objective: 'Exponiere R-Analytik- und Modellfunktionen über HTTP mittels Roxygen-Kommentaren.',
    hint: 'Nutze `#* @get /` über `function() list(hello = "world")`.',
    learning: [
      'Plumber verwandelt bestehenden R-Code durch spezielle `#*`-Dekorator-Kommentare in Web-APIs.',
      'R-Listen (`list()`) werden standardmäßig durch jsonlite in JSON-Objekte konvertiert.',
      'Plumber-Services eignen sich hervorragend für Data-Science- und Statistik-Microservices.',
    ],
    fieldNotes: [
      'Lade schwere R-Modelle und RDS-Dateien beim Serverstart global, nicht innerhalb jedes Handlers.',
      'R ist standardmäßig Single-Threaded; nutze Promises oder Hintergrund-Worker für lange Rechnungen.',
      'Setze Plumber-APIs in Docker-Containern hinter Nginx oder Traefik ein, um Requests zu balancieren.',
    ],
  },
  'plumber-02': {
    name: 'Pfad-Parameter in Plumber',
    objective: 'Empfange typisierte URL-Parameter in R-Handlern mit expliziten Typ-Annotationen.',
    hint: 'Schreibe `#* @get /users/<id>` und `#* @param id:int`, und nimm `id` in die Funktionsargumente auf.',
    learning: [
      'Spitze Klammern `<param>` definieren variable Pfadsegmente in Plumber-Routen.',
      'Das Tag `@param name:type` steuert die Typkonvertierung von String in Integer oder Numeric.',
      'R-Handler empfangen die typisierten Parameter direkt als benannte Argumente der Funktion.',
    ],
    fieldNotes: [
      'Validiere konvertierte Parameter auf NA; R gibt NA zurück, wenn die Typkonvertierung fehlschlägt.',
      'Verwende klare Parameternamen und halte die Konventionen synchron mit FastAPI-Gegenstücken.',
      'Plumber dokumentiert typisierte Parameter automatisch in der generierten Swagger-UI.',
    ],
  },
  'plumber-03': {
    name: 'POST-Body in Plumber',
    objective: 'Parse und validiere eingehende JSON-Request-Bodies in R-Microservices.',
    hint: 'Lies `req$postBody` und liefere `list(id = 1, name = body$name)` mit Status 201 zurück.',
    learning: [
      'Plumber übergibt das native Request-Objekt, wenn `req` in der Funktionssignatur deklariert ist.',
      '`req$postBody` enthält die rohen JSON-Bytes; jsonlite::fromJSON deserialisiert sie in R-Objekte.',
      'Das Tag `#* @status 201` setzt den HTTP-Antwortstatuscode standardkonform auf Created.',
    ],
    fieldNotes: [
      'Kapsele jsonlite::fromJSON in tryCatch, um ungültiges JSON mit einem sauberen 400-Fehler abzufangen.',
      'Überprüfe erforderliche Listenelemente explizit, bevor du sie in Berechnungen oder Modellen nutzt.',
      'Nutze Serializer-Filter (@serializer unboxedJSON), wenn skalare Werte nicht als Arrays ausgegeben werden sollen.',
    ],
  },
  'openapi-01': {
    name: 'Die OpenAPI-Map verstehen',
    objective: 'Erkunde und strukturiere den maschinenlesbaren OpenAPI 3.0 API-Contract.',
    hint: 'Führe den Startcode aus und öffne das OpenAPI-Panel — teste dann `openapi` in der Konsole.',
    learning: [
      'OpenAPI 3.0 ist der weltweite Industriestandard für RESTful-API-Spezifikationen.',
      'Die Spezifikation gliedert sich in Metadaten (info), Routen (paths) und wiederverwendbare Komponenten.',
      'Dokumentierte APIs ermöglichen automatische Codegenerierung für Client-SDKs und interaktive Testportale.',
    ],
    fieldNotes: [
      'Nutze OpenAPI-Tags und Summarys gewissenhaft; sie strukturieren die Entwicklerdokumentation.',
      'Validiere OpenAPI-Specs in CI/CD-Pipelines, um Breaking Changes frühzeitig zu erkennen.',
      'Ein maschinenlesbarer Vertrag ist die Basis für API-Gateways, Mock-Server und automatisierte Vertragstests.',
    ],
  },
  'openapi-02': {
    name: 'Schemas in Components',
    objective: 'Verankere wiederverwendbare Domänenschemas unter components.schemas in der OpenAPI-Registry.',
    hint: 'Ein Pydantic-Modell namens `Item` wird zu `components.schemas.Item`.',
    learning: [
      'components.schemas verhindert Redundanz, indem Modellstrukturen zentral referenziert werden ($ref).',
      'Pydantic-Klassennamen und Feldtypen definieren direkt die JSON-Schema-Eigenschaften.',
      'SDK-Generatoren erzeugen aus diesen Definitionen native TypeScript-, Java- oder Python-Klassen.',
    ],
    fieldNotes: [
      'Benenne Schemas nach Domänenbegriffen, nicht nach Controller-Namen (z. B. User statt CreateUserRequest).',
      'Dokumentiere Feldbeschreibungen und Validierungsbereiche direkt im Schema via Field(description=...).',
      'Vermeide zirkuläre Modellreferenzen; sie führen bei vielen Codegeneratoren zu Laufzeitproblemen.',
    ],
  },
  'compare-01': {
    name: 'Gleiche API, zwei Stacks',
    objective: 'Implementiere betriebliche Health- und Observability-Endpoints über unterschiedliche Stacks.',
    hint: 'Implementiere `GET /health` und `GET /metrics` zuerst in FastAPI; die Lösung zeigt das Plumber-Pendant.',
    learning: [
      'Der OpenAPI-Contract abstrahiert die zugrunde liegende Programmiersprache vollständig.',
      'FastAPI und Plumber können exakt denselben HTTP-Vertrag für Monitoring-Tools erfüllen.',
      'Operations-Endpoints wie /health und /metrics sind Standardanforderungen in Container-Umgebungen.',
    ],
    fieldNotes: [
      'Healthchecks müssen extrem performant sein; vermeide schwere Abfragen in Liveness-Probes.',
      'Tiefere Abhängigkeitsprüfungen (z. B. Datenbankverbindung) gehören in separate /ready-Endpoints.',
      'Ein einheitlicher Schnittstellenvertrag ermöglicht den schmerzlosen Technologiewechsel zwischen Python und R.',
    ],
  },
  'compare-02': {
    name: 'Das Plumber-Pendant',
    objective: 'Implementiere denselben Observability-Vertrag unter Verwendung von R-Annotationen.',
    hint: 'Spiegle die FastAPI-Ops-API mit `#* @get /health` und `#* @get /metrics`.',
    learning: [
      'Roxygen-Annotationen in R erfüllen exakt die gleiche Funktion wie Python-Dekoratoren.',
      'Die generierte OpenAPI-Spezifikation ist zwischen beiden Implementierungen austauschbar.',
      'Clients und Monitoring-Systeme bemerken keinen Unterschied in der Backend-Implementierung.',
    ],
    fieldNotes: [
      'Plumber eignet sich perfekt, um bestehende R-Modelle ohne Python-Rewrite in Microservice-Meshes zu integrieren.',
      'Achte auf identische Schlüsselnamen in JSON-Rückgaben (status = "ok"), um Client-Kompatibilität zu sichern.',
      'Kombiniere Python-APIs für Gateway-Dienste mit spezialisierten Plumber-Containern für komplexe Statistik.',
    ],
  },
};
