/**
 * LearnAPI level definitions and curriculum catalog.
 * Professional interactive curriculum for FastAPI, plumber, and OpenAPI.
 *
 * Each level defines:
 *   id, track, language, name, objective, learning, fieldNotes, hint, golf,
 *   startCode, solutionCode, goal, startDialog, fa (Persian translations)
 */

import { FA_DIALOGS } from './i18n/fa-dialogs.js';
import { DE_DIALOGS } from './i18n/de-dialogs.js';
import { DE_LEVELS } from './i18n/de-levels.js';

/** @typedef {import('./engine.js').HttpMethod} HttpMethod */

/**
 * @typedef {Object} Level
 * @property {string} id
 * @property {string} track
 * @property {'python'|'r'|'http'|'openapi'} language
 * @property {string} name
 * @property {string} objective
 * @property {string[]} learning
 * @property {string[]} fieldNotes
 * @property {string} hint
 * @property {number} golf
 * @property {string} startCode
 * @property {string} solutionCode
 * @property {{ endpoints?: {method: string, path: string, status?: number}[], calls?: {method: string, path: string, body?: object, headers?: Record<string, string>, expectStatus: number, expectBody?: object}[], codeContains?: string[], openapiHas?: string[] }} goal
 * @property {object[]} startDialog
 * @property {string} [editorLabel]
 * @property {{ name?: string, objective?: string, hint?: string, learning?: string[], fieldNotes?: string[] }} [fa]
 * @property {{ name?: string, objective?: string, hint?: string, learning?: string[], fieldNotes?: string[] }} [de]
 */

/** @type {Level[]} */
export const LEVELS = [
  // ── HTTP ──────────────────────────────────────────────
  {
    id: 'http-01',
    track: 'http',
    language: 'python',
    name: 'What is an endpoint?',
    objective: 'Expose the root URL of your web service and deliver a valid JSON payload.',
    learning: [
      'An endpoint pairs an HTTP method (verb) with an addressable path identifier.',
      'FastAPI registers routing hooks via decorators like @app.get("/").',
      'Returned Python dictionaries are automatically serialized into RFC 8259 JSON objects.',
    ],
    fieldNotes: [
      'Kubernetes liveness and readiness probes frequently query root or /healthz endpoints.',
      'Always return dictionary objects rather than bare JSON arrays to preserve forward compatibility.',
      'Keep root handlers non-blocking: avoid synchronous file I/O or heavy computations in entry routes.',
    ],
    hint: 'Define one GET route on `/` that returns a small JSON object.',
    golf: 2,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

# Add a GET endpoint on "/"
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/")
def read_root():
    return {"hello": "world"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/' }],
      calls: [{ method: 'GET', path: '/', expectStatus: 200 }],
      codeContains: ['@app.get', 'return'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Endpoints',
          'An API exposes **endpoints** — addressable operations on a server. Each endpoint pairs an HTTP method with a path.',
          'FastAPI registers them with a decorator: `@app.get("/")` handles `GET /`.',
          'The function under the decorator runs when a request arrives and returns JSON.',
        ],
      },
      {
        type: 'ApiDemo',
        beforeMarkdowns: ['Register `GET /` and watch the surface pick up the node.'],
        afterMarkdowns: ['`GET /` is live. Call it from the console: `call GET /`'],
        command: 'call GET /',
      },
      {
        type: 'ModalAlert',
        markdowns: ['Close this dialog, define the endpoint, press **Run**, then `call GET /`.'],
      },
      {
        type: 'GoalList',
      },
    ],
    fa: {
      name: 'اندپوینت چیست؟',
      objective: 'تعریف آدرس ریشه سرویس وب و ارسال پاسخ معتبر با ساختار استاندارد JSON.',
      hint: 'یک مسیر GET روی `/` تعریف کنید که یک شیء کوچک JSON برگرداند.',
      learning: [
        'اندپوینت حاصل جفت‌شدن یک متد HTTP (فعل) با یک مسیر آدرس‌پذیر است.',
        'فریم‌ورک FastAPI با دکوراتورهایی نظیر @app.get("/") مسیرها را به توابع متصل می‌کند.',
        'لایه سریالایزر پایتون دیکشنری‌های خروجی را طبق استاندارد RFC 8259 به JSON تبدیل می‌نماید.',
      ],
      fieldNotes: [
        'پروب‌های سلامت کوبرنتیز معمولاً مسیرهای ریشه یا /healthz را مداوم پایش می‌کنند.',
        'در پاسخ‌های API از بازگرداندن آرایه خام در ریشه پرهیز کنید؛ همیشه شیء کلید-مقدار برگردانید.',
        'اندپوینت‌های پایه را سبک نگه دارید؛ از کوئری‌های سنگین دیتابیس در ریشه خودداری کنید.',
      ],
    },
  },
  {
    id: 'http-02',
    track: 'http',
    language: 'python',
    name: 'HTTP methods',
    objective: 'Distinguish between safe reading and state-mutating creation using HTTP verbs.',
    learning: [
      'GET requests must be safe and idempotent — they must not mutate server state.',
      'POST creates a new resource and typically responds with HTTP 201 Created.',
      'The same path with different HTTP methods represents completely separate operations.',
    ],
    fieldNotes: [
      'Never use GET for state changes (e.g. /items/delete?id=1 breaks web caches and violates RFC 7231).',
      'HTTP 201 should ideally include a Location header pointing to the newly minted resource.',
      'In distributed systems, always pair state-mutating POST requests with idempotency keys to protect against retries.',
    ],
    hint: 'Add `@app.post("/items")` that returns 201 and the created item.',
    golf: 3,
    editorLabel: 'server.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/items")
def list_items():
    return {"items": []}

# Add POST /items with status_code=201
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Hello API")

@app.get("/items")
def list_items():
    return {"items": []}

@app.post("/items", status_code=201)
def create_item():
    return {"id": 1, "name": "widget"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/items' },
        { method: 'POST', path: '/items', status: 201 },
      ],
      calls: [{ method: 'POST', path: '/items', expectStatus: 201 }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Methods',
          '`GET` reads. `POST` creates. `PUT`/`PATCH` update. `DELETE` removes.',
          'Same path, different methods = different endpoints. FastAPI lets you stack decorators or use `@app.post(..., status_code=201)` for the create status.',
        ],
      },
      {
        type: 'GoalList',
      },
    ],
    fa: {
      name: 'متدهای پروتکل HTTP',
      objective: 'تفکیک عملیات خواندن امن (GET) از ایجاد منبع و تغییر وضعیت سرور (POST).',
      hint: 'مسیر `@app.post("/items")` را با `status_code=201` اضافه کنید.',
      learning: [
        'درخواست‌های GET باید امن (Safe) و تکرارپذیر (Idempotent) باشند و وضعیت سرور را تغییر ندهند.',
        'متد POST یک منبع جدید می‌سازد و بر اساس استاندارد با وضعیت 201 Created پاسخ می‌دهد.',
        'یک مسیر مشترک با متدهای متفاوت نشان‌دهنده دو عملیات کاملاً مستقل است.',
      ],
      fieldNotes: [
        'هرگز برای تغییرات داده از GET استفاده نکنید؛ این کار کش‌های شبکه و پراکسی‌ها را به هم می‌ریزد.',
        'پاسخ 201 بهتر است هدر Location حاوی آدرس منبع جدید ساخته‌شده را به همراه داشته باشد.',
        'در سرویس‌های توزیع‌شده، برای جلوگیری از ثبت تکراری POST از کلیدهای Idempotency استفاده کنید.',
      ],
    },
  },

  // ── FastAPI ───────────────────────────────────────────
  {
    id: 'fastapi-01',
    track: 'fastapi',
    language: 'python',
    name: 'Path parameters',
    objective: 'Extract dynamic variables from the URL path with automated type validation.',
    learning: [
      'Path segments in curly braces {param} match dynamic segments of the URI.',
      'Type annotations enforce boundaries; invalid types trigger an immediate 422 Unprocessable Entity.',
      'Path parameters are inherently required parts of the resource address identifier.',
    ],
    fieldNotes: [
      'Use UUIDs or non-sequential identifiers in public APIs to prevent resource enumeration attacks.',
      'FastAPI generates RFC 7807-compatible error details explaining exactly which segment failed.',
      'Never perform access control solely based on path parameter parsing; defer to dependency auth guards.',
    ],
    hint: 'Use `{user_id}` in the path and take `user_id: int` in the function.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/users")
def list_users():
    return {"users": []}

# GET /users/{user_id} → {"id": user_id, "name": "ada"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/users")
def list_users():
    return {"users": []}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/{user_id}' },
      ],
      calls: [
        { method: 'GET', path: '/users/42', expectStatus: 200, expectBody: { id: 42 } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Path parameters',
          'A path segment in braces is a **path parameter**: `/users/{user_id}` matches `/users/42` with `user_id=42`.',
          'Declare it in the function signature with a type. FastAPI validates it — `int` rejects `ada` with **422**.',
          'Try `call GET /users/ada` after you implement the route.',
        ],
      },
      {
        type: 'GoalList',
      },
    ],
    fa: {
      name: 'پارامترهای مسیر (Path Parameters)',
      objective: 'استخراج متغیرهای پویا از آدرس URL با اعتبارسنجی خودکار نوع داده.',
      hint: 'در مسیر از `{user_id}` استفاده کرده و در امضای تابع `user_id: int` را قرار دهید.',
      learning: [
        'بخش‌های درون آکولاد {param} در آدرس با قطعات پویای URL کلاینت تطبیق داده می‌شوند.',
        'تایپ‌هینت‌های پایتون اعتبارسنجی را اجباری کرده و در صورت عدم تطابق خطای 422 بازمی‌گردانند.',
        'پارامترهای مسیر هویت ذاتی منبع هستند و همیشه باید اجباری (Required) در نظر گرفته شوند.',
      ],
      fieldNotes: [
        'در APIهای عمومی به جای اعداد افزایشی از UUID استفاده کنید تا ریسک حملات حدس منبع (Enumeration) مهار شود.',
        'خطای 422 تولیدشده توسط FastAPI به کلاینت دقیقاً اعلام می‌کند کدام قطعه مسیر فاقد تایپ معتبر است.',
        'اعتبارسنجی سطح دسترسی کاربر به شناسه را در گیت‌های احراز هویت انجام دهید نه در منطق مسیر.',
      ],
    },
  },
  {
    id: 'fastapi-02',
    track: 'fastapi',
    language: 'python',
    name: 'Query parameters',
    objective: 'Implement flexible filtering, search, and pagination contracts using query strings.',
    learning: [
      'Function arguments not included in the URL path automatically become query parameters.',
      'Default values designate parameters as optional; absence of a default makes them required.',
      'Query strings follow the standard RFC 3986 format (?q=value&limit=10).',
    ],
    fieldNotes: [
      'Always enforce hard limits on pagination parameters (e.g. limit <= 100) to protect database memory and IOPS.',
      'Query parameters are intended for filtering and paging; never transmit credentials or secrets in query strings.',
      'Avoid unindexed search filters that cause catastrophic full table scans in relational databases.',
    ],
    hint: 'Optional query args have defaults: `limit: int = 10`.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/search")
def search():
    return {"q": None, "limit": 10}

# Accept query params: q: str, limit: int = 10
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Users API")

@app.get("/search")
def search(q: str = "", limit: int = 10):
    return {"q": q, "limit": limit}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/search' }],
      calls: [
        {
          method: 'GET',
          path: '/search?q=ada&limit=2',
          expectStatus: 200,
          expectBody: { q: 'ada', limit: 2 },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Query parameters',
          'Anything after `?` is the query string: `GET /search?q=ada&limit=2`.',
          'In FastAPI, non-path function args become query parameters. A default makes them optional.',
          'After `run`, call `call GET /search?q=ada&limit=2` and watch the pipeline bind values.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'پارامترهای کوئری (Query Parameters)',
      objective: 'پیاده‌سازی قراردادهای فیلترینگ، جستجو و صفحه‌بندی با استفاده از Query String.',
      hint: 'پارامترهای اختیاری دارای مقدار پیش‌فرض هستند: `limit: int = 10`.',
      learning: [
        'آرگومان‌های تابعی که در قالب مسیر آدرس نیامده باشند، خودکار به عنوان Query Param تلقی می‌شوند.',
        'اختصاص مقدار پیش‌فرض پارامتر را اختیاری می‌کند؛ در غیر این صورت حضور آن اجباری است.',
        'رشته کوئری طبق استاندارد با علامت ? شروع شده و جفت‌های کلید-مقدار را تفکیک می‌کند.',
      ],
      fieldNotes: [
        'برای پارامترهای صفحه‌بندی همیشه سقف سخت (مثل limit <= 100) بگذارید تا مصرف رم و دیتابیس منفجر نشود.',
        'پارامترهای کوئری مخصوص فیلتر و جستجو هستند؛ هرگز توکن‌های محرمانه را در کوئری ارسال نکنید.',
        'فیلترهایی که روی ستون‌های فاقد ایندکس دیتابیس اعمال می‌شوند، باعث افت شدید پرفورمنس سرور خواهند شد.',
      ],
    },
  },
  {
    id: 'fastapi-03',
    track: 'fastapi',
    language: 'python',
    name: 'Request body',
    objective: 'Receive and validate structured JSON payloads using Pydantic schema models.',
    learning: [
      'Pydantic models declare strict shape, typing, and validation rules for inbound JSON bodies.',
      'FastAPI automatically deserializes and maps JSON payloads into model class instances.',
      'The model is automatically published in OpenAPI components.schemas.',
    ],
    fieldNotes: [
      'Always separate Input schemas from Database ORM models to avoid mass-assignment vulnerabilities.',
      'Use strict validation constraints (e.g. min_length, regex) directly on Pydantic fields.',
      'Clients transmitting malformed JSON or mismatched types receive clear, granular 422 error structures.',
    ],
    hint: 'Create a Pydantic model and accept it as `user: User`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

# Define User(BaseModel) with name: str, age: int = 0
# POST /users → 201 with {"id": 1, "name": user.name}

`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users API")

class User(BaseModel):
    name: str
    age: int = 0

@app.post("/users", status_code=201)
def create_user(user: User):
    return {"id": 1, "name": user.name, "age": user.age}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/users', status: 201 }],
      calls: [
        {
          method: 'POST',
          path: '/users',
          body: { name: 'ada', age: 36 },
          expectStatus: 201,
          expectBody: { name: 'ada' },
        },
      ],
      codeContains: ['BaseModel', 'class User'],
      openapiHas: ['components.schemas.User'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Request body',
          'Creates carry a **JSON body**. FastAPI validates it with a Pydantic `BaseModel`.',
          'The OpenAPI document then advertises `components.schemas.User` — that is what Swagger UI shows.',
          'Send: `call POST /users body={"name":"ada","age":36}"',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'بدنه درخواست با مدل Pydantic',
      objective: 'دریافت و اعتبارسنجی بسته‌های ساختاریافته JSON با مدل‌های شیء‌گرای Pydantic.',
      hint: 'یک مدل Pydantic تعریف کرده و در تابع به صورت `user: User` دریافت کنید.',
      learning: [
        'مدل‌های Pydantic ساختار دقیق، نوع داده‌ها و قواعد اعتبارسنجی را برای JSON ورودی تضمین می‌کنند.',
        'فریم‌ورک FastAPI داده خام ورودی را تبدیل به نمونه آبجکت معتبر پایتون می‌نماید.',
        'تعریف مدل بلافاصله اسکیما را در بخش components.schemas سند OpenAPI منتشر می‌سازد.',
      ],
      fieldNotes: [
        'همیشه مدل ورودی کلاینت را از مدل‌های دیتابیس (ORM) جدا کنید تا از رخنه Mass Assignment جلوگیری شود.',
        'قواعد اعتبارسنجی دقیق (طول حداقل، الگوی ایمیل و ...) را مستقیماً روی فیلدهای Pydantic اعمال نمایید.',
        'در صورت ارسال فیلدهای ناصحیح توسط کلاینت، سرور خودکار آرایه خطای جزئی 422 تولید می‌کند.',
      ],
    },
  },
  {
    id: 'fastapi-04',
    track: 'fastapi',
    language: 'python',
    name: 'Delete and status codes',
    objective: 'Master standard HTTP deletion semantics with empty 204 No Content responses.',
    learning: [
      'DELETE operations indicate permanent or logical removal of a target resource.',
      'HTTP 204 No Content signals complete success while explicitly forbidding a response payload.',
      'Decorators configure the expected baseline status via status_code=204.',
    ],
    fieldNotes: [
      'RFC 7231 forbids returning a message body with HTTP 204; clients drop response bodies on 204.',
      'In enterprise systems, DELETE is often a soft-delete (setting an is_deleted timestamp flag).',
      'Make DELETE idempotent: deleting a non-existent item should return 204 or 404 consistently.',
    ],
    hint: 'Return an empty object with `status_code=204` on DELETE.',
    golf: 2,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Notes API")

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}

# DELETE /notes/{note_id} → 204
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Notes API")

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id}

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    return {}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/notes/{note_id}' },
        { method: 'DELETE', path: '/notes/{note_id}', status: 204 },
      ],
      calls: [{ method: 'DELETE', path: '/notes/7', expectStatus: 204 }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Status codes',
          '200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Validation Error',
          'Tell clients what happened with the status code. `DELETE` that succeeds is often **204** with an empty body.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'کدهای وضعیت و حذف با 204',
      objective: 'پیاده‌سازی عملیات حذف منبع طبق استاندارد HTTP با پاسخ خالی 204 No Content.',
      hint: 'اندپوینت `@app.delete("/notes/{note_id}", status_code=204)` را تعریف کنید.',
      learning: [
        'متد DELETE نمایانگر حذف فیزیکی یا منطقی یک منبع معین در سرور است.',
        'کد وضعیت 204 No Content نشان‌دهنده موفقیت کامل عملیات بدون بازگرداندن هرگونه بدنه است.',
        'تنظیم کد وضعیت پایه از طریق پارامتر status_code در دکوراتور انجام می‌شود.',
      ],
      fieldNotes: [
        'استاندارد RFC 7231 قرار دادن بدنه در پاسخ 204 را منع کرده و کلاینت‌ها محتوای آن را نادیده می‌گیرند.',
        'در سیستم‌های مقیاس بالا، حذف معمولاً Soft-delete (تغییر وضعیت یا ثبت زمان حذف) است.',
        'عملیات حذف باید با رفتار یکنواخت طراحی شود تا کلاینت دچار سردرگمی نشود.',
      ],
    },
  },
  {
    id: 'fastapi-05',
    track: 'fastapi',
    language: 'python',
    name: 'CRUD on one resource',
    objective: 'Orchestrate complete Create, Read, Update, Delete cycles on a uniform resource.',
    learning: [
      'RESTful architecture organizes capabilities around clear noun-based collections (e.g. /notes).',
      'PUT replaces an entire resource; PATCH applies partial modifications.',
      'CRUD operations maintain strict alignment with standard HTTP verb conventions.',
    ],
    fieldNotes: [
      'Maintain plural nouns for resource collections (/notes, /users), avoiding verbs in URL paths.',
      'Ensure PUT operations are idempotent: executing the same PUT multiple times produces the same state.',
      'Combine atomic database transactions when updates trigger side-effects like audit logging.',
    ],
    hint: 'One path `/notes/{note_id}` with GET, PUT, DELETE — plus POST /notes to create.',
    golf: 5,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Notes")

@app.get("/notes")
def list_notes():
    return {"notes": []}

# POST /notes → 201
# GET /notes/{note_id}
# PUT /notes/{note_id}
# DELETE /notes/{note_id} → 204
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Notes")

@app.get("/notes")
def list_notes():
    return {"notes": []}

@app.post("/notes", status_code=201)
def create_note():
    return {"id": 1, "title": "hello"}

@app.get("/notes/{note_id}")
def get_note(note_id: int):
    return {"id": note_id, "title": "hello"}

@app.put("/notes/{note_id}")
def update_note(note_id: int):
    return {"id": note_id, "title": "updated"}

@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int):
    return {}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/notes' },
        { method: 'POST', path: '/notes', status: 201 },
        { method: 'GET', path: '/notes/{note_id}' },
        { method: 'PUT', path: '/notes/{note_id}' },
        { method: 'DELETE', path: '/notes/{note_id}', status: 204 },
      ],
      calls: [
        { method: 'POST', path: '/notes', expectStatus: 201 },
        { method: 'GET', path: '/notes/3', expectStatus: 200, expectBody: { id: 3 } },
        { method: 'PUT', path: '/notes/3', expectStatus: 200 },
        { method: 'DELETE', path: '/notes/3', expectStatus: 204 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## CRUD',
          'A resource is not a single route. **C**reate `POST` · **R**ead `GET` · **U**pdate `PUT` · **D**elete `DELETE`.',
          'Same path `/notes/{note_id}` for read/update/delete; collection path `/notes` for list/create.',
          'This is the shape every service tutorial builds toward — including FastAPI projects with SQLAlchemy.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'الگوی کامل CRUD',
      objective: 'پیاده‌سازی چرخه کامل ساخت، خواندن، ویرایش و حذف منابع روی روت‌های استاندارد.',
      hint: 'تمامی متدهای GET, POST, PUT, DELETE را روی منبع `/notes` پیاده‌سازی نمایید.',
      learning: [
        'معماری REST قابلیت‌های سیستم را حول نام منابع (مانند /notes) سازماندهی می‌کند نه افعال.',
        'متد PUT برای جایگزینی کامل داده استفاده می‌شود در حالی که PATCH برای ویرایش جزئی است.',
        'چرخه CRUD تطابق یک‌به‌یک و دقیق با متدهای استاندارد پروتکل HTTP دارد.',
      ],
      fieldNotes: [
        'نام مسیر منابع را همیشه به صورت جمع (/notes, /users) انتخاب کرده و از درج فعل در مسیر بپرهیزید.',
        'از تکرارپذیری (Idempotency) متد PUT مطمئن شوید؛ اجرای مکرر آن باید وضعیت یکسانی رقم بزند.',
        'عملیات چندمرحله‌ای را درون ترنزکشن اتمیک دیتابیس قرار دهید تا ناهماهنگی داده رخ ندهد.',
      ],
    },
  },
  {
    id: 'fastapi-06',
    track: 'fastapi',
    language: 'python',
    name: 'HTTPException for missing resources',
    objective: 'Halt invalid execution and return clear, semantic HTTP error responses.',
    learning: [
      'Raising HTTPException immediately aborts the handler execution and builds an error response.',
      'Status codes must reflect the error context: 404 for missing items, 400 for malformed parameters.',
      'FastAPI serializes the error into a clean JSON structure with a detail field.',
    ],
    fieldNotes: [
      'Never allow unhandled database exceptions or internal stack traces to leak to the client.',
      'Adopt consistent error schema envelopes so frontend and mobile SDKs can parse errors predictably.',
      'Log the raw internal tracebacks on the server while returning sanitized messages to callers.',
    ],
    hint: 'Raise `HTTPException(status_code=404)` when `item_id == 99`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    return {"id": item_id}

# When item_id == 99, raise HTTPException 404
`,
    solutionCode: `from fastapi import FastAPI, HTTPException

app = FastAPI(title="Store")

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id == 99:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/items/{item_id}' }],
      calls: [
        { method: 'GET', path: '/items/1', expectStatus: 200, expectBody: { id: 1 } },
        { method: 'GET', path: '/items/99', expectStatus: 404 },
      ],
      codeContains: ['HTTPException', 'status_code=404'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Errors are part of the contract',
          'A missing resource is **404**, not a stack trace and not a silent `200` with `null`.',
          'FastAPI signals this with `raise HTTPException(status_code=404, detail="...")`.',
          'OpenAPI will list 404 under `responses` — that is what clients and Swagger UI show.',
          'Try `call GET /items/99` after Run.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'مدیریت خطا با HTTPException',
      objective: 'قطع اجرای نامعتبر و بازگرداندن پاسخ‌های خطای معنایی استاندارد به کلاینت.',
      hint: 'در صورت نیافتن منبع، استثنای `HTTPException(status_code=404, detail="...")` پرتاب کنید.',
      learning: [
        'پرتاب HTTPException بلافاصله اجرای تابع را متوقف کرده و پاسخ خطای ساختاریافته تولید می‌کند.',
        'کد وضعیت باید بازتاب‌دهنده ریشه خطا باشد: 404 برای فقدان داده، 400 برای ورودی نامعتبر.',
        'خروجی خطا توسط فریم‌ورک به فرمت استاندارد و قابل پیش‌بینی JSON تبدیل می‌گردد.',
      ],
      fieldNotes: [
        'هرگز نگذارید خطاهای خام پایتون و Stack Trace به بیرون درز کند؛ این یک ریسک امنیتی جدی است.',
        'طرح کلی خطاهای سیستم را یکنواخت نگه دارید تا کلاینت‌ها و فرانت‌اند بتوانند پیام‌ها را تمیز پارس کنند.',
        'جزییات فنی و لاگ کامل را در سرور ثبت نمایید اما پیام بازگشتی به کاربر را بهداشتی و خلاصه کنید.',
      ],
    },
  },
  {
    id: 'fastapi-07',
    track: 'fastapi',
    language: 'python',
    name: 'Dependency injection',
    objective: 'Decouple shared resources, settings, and database sessions with Dependency Injection.',
    learning: [
      'FastAPI Depends resolves hierarchical, reusable providers before entering the handler.',
      'Dependencies eliminate global mutable state and promote clean architectural boundaries.',
      'Providers can easily be mocked or swapped during unit and integration testing.',
    ],
    fieldNotes: [
      'Use dependencies for database session lifecycles (yielding sessions with automatic commit/rollback).',
      'Keep dependencies side-effect free outside their explicit resource management contract.',
      'Combine nested dependencies to create powerful composable security and validation pipelines.',
    ],
    hint: 'Define `get_settings()` returning a dict, then `Depends(get_settings)` in the handler.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Depends

app = FastAPI(title="Config")

def get_settings():
    return {"app_name": "LearnAPI", "debug": False}

@app.get("/info")
def info():
    return {"app": "unknown"}

# Inject settings via Depends(get_settings)
`,
    solutionCode: `from fastapi import FastAPI, Depends

app = FastAPI(title="Config")

def get_settings():
    return {"app_name": "LearnAPI", "debug": False}

@app.get("/info")
def info(settings: dict = Depends(get_settings)):
    return {"app": settings["app_name"], "debug": settings["debug"]}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/info' }],
      calls: [{ method: 'GET', path: '/info', expectStatus: 200, expectBody: { app: 'LearnAPI' } }],
      codeContains: ['Depends', 'get_settings'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Depends',
          'Handlers should not open DB sessions or parse config by hand. **Dependencies** are callable providers FastAPI injects.',
          '```\ndef get_settings():\n    return {"app_name": "LearnAPI"}\n\n@app.get("/info")\ndef info(settings: dict = Depends(get_settings)):\n    return {"app": settings["app_name"]}\n```',
          'This is the backbone of production FastAPI apps — auth, DB, and settings all ride on `Depends`.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'تزریق وابستگی با Depends',
      objective: 'جداسازی منابع مشترک، تنظیمات و سشن‌های دیتابیس با تزریق وابستگی (DI).',
      hint: 'تابع تامین‌کننده را تعریف کرده و در ورودی هندلر با `Depends(get_settings)` تزریق کنید.',
      learning: [
        'قابلیت Depends وابستگی‌های سلسله‌مراتبی و چندبارمصرف را پیش از ورود به تابع اجرا و حل می‌کند.',
        'تزریق وابستگی متغیرهای سراسری (Global State) را حذف کرده و مرزهای معماری تمیز می‌سازد.',
        'وابستگی‌ها امکان تست‌پذیری بالا فراهم می‌کنند و در تست‌ها به راحتی Mock یا جایگزین می‌شوند.',
      ],
      fieldNotes: [
        'از Depends برای چرخه حیات اتصالات دیتابیس با الگوی yield جهت commit/rollback خودکار بهره ببرید.',
        'وابستگی‌ها را تک‌مسئولیتی طراحی کنید تا زنجیره تزریق شفاف و بدون Side-effect پنهان باقی بماند.',
        'با ترکیب چند وابستگی تو در تو می‌توان پایپ‌لاین‌های اعتبارسنجی و احراز هویت قدرتمند خلق کرد.',
      ],
    },
  },
  {
    id: 'fastapi-08',
    track: 'fastapi',
    language: 'python',
    name: 'API key auth',
    objective: 'Protect administrative and sensitive endpoints using HTTP header authentication contracts.',
    learning: [
      'The Header(...) parameter extracts metadata from incoming HTTP request headers.',
      'Missing mandatory headers automatically trigger an unauthenticated 401 or 422 rejection.',
      'Header requirements are automatically codified into OpenAPI components.securitySchemes.',
    ],
    fieldNotes: [
      'Always use standard header names: Authorization: Bearer <token> or X-API-Key.',
      'HTTP header names are case-insensitive according to RFC 7230; frameworks normalize them.',
      'Never expose administrative routes without constant-time string comparison for secret keys to prevent timing attacks.',
    ],
    hint: 'Take `api_key: str = Header(...)` and reject with 401 when it is missing.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI, Header

app = FastAPI(title="Secure API")

@app.get("/public")
def public():
    return {"ok": True}

# GET /admin requires header X-API-Key
`,
    solutionCode: `from fastapi import FastAPI, Header

app = FastAPI(title="Secure API")

@app.get("/public")
def public():
    return {"ok": True}

@app.get("/admin")
def admin(api_key: str = Header(...)):
    return {"ok": True, "who": "admin"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/public' },
        { method: 'GET', path: '/admin' },
      ],
      calls: [
        { method: 'GET', path: '/public', expectStatus: 200 },
        { method: 'GET', path: '/admin', expectStatus: 401 },
        {
          method: 'GET',
          path: '/admin',
          headers: { 'X-API-Key': 'secret' },
          expectStatus: 200,
          expectBody: { who: 'admin' },
        },
      ],
      codeContains: ['Header'],
      openapiHas: ['components.securitySchemes.apiKeyAuth'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## Auth as a contract',
          'API keys are just **headers**. FastAPI declares them with `Header(...)`; OpenAPI advertises `securitySchemes`.',
          'Swagger UI then shows a lock — that is not decoration, it is the contract clients generate against.',
          'Without the header the mock returns **401**. With `headers={"X-API-Key":"secret"}` the route answers.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'هدرهای امنیتی و کلید API',
      objective: 'محافظت از اندپوینت‌های حساس و مدیریتی با احراز هویت مبتنی بر هدرهای HTTP.',
      hint: 'هدر اجباری را با `api_key: str = Header(...)` تعریف کنید.',
      learning: [
        'ابزار Header(...) متادیتای ارسالی در هدرهای پروتکل HTTP را استخراج و اعتبارسنجی می‌کند.',
        'عدم ارسال هدرهای اجباری خودکار منجر به ممانعت از ورود با خطای ۴۰۱ یا ۴۲۲ می‌شود.',
        'هدرهای امنیتی خودکار در بخش components.securitySchemes سند OpenAPI ثبت می‌گردند.',
      ],
      fieldNotes: [
        'از هدرهای استاندارد نظیر Authorization: Bearer <token> یا X-API-Key برای احراز هویت استفاده کنید.',
        'طبق استاندارد RFC 7230 نام هدرها به بزرگی و کوچکی حروف حساس نیستند و فریم‌ورک آن‌ها را نرمال می‌کند.',
        'مقایسه کلیدهای امنیتی را با توابع Constant-time انجام دهید تا از حملات کانال جانبی (Timing Attack) پیشگیری شود.',
      ],
    },
  },
  {
    id: 'fastapi-09',
    track: 'fastapi',
    language: 'python',
    name: 'response_model',
    objective: 'Filter and serialize outgoing payloads through dedicated output schemas.',
    learning: [
      'The response_model argument filters outbound data against a strict whitelist schema.',
      'Internal database fields (e.g. password hashes, internal IDs) are pruned before serialization.',
      'OpenAPI accurately documents the exact response schema for client generators.',
    ],
    fieldNotes: [
      'Failing to use response models is a primary source of catastrophic security data leaks.',
      'Separate UserCreate (input), UserInDB (internal/ORM), and UserOut (public output).',
      'Response models significantly improve API client SDK generation by establishing strict return types.',
    ],
    hint: 'Declare `class UserOut(BaseModel)` and `response_model=UserOut` on the route.',
    golf: 4,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users")

class UserOut(BaseModel):
    id: int
    name: str

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada", "password": "leaked"}

# Use response_model=UserOut so the password leaves the contract
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Users")

class UserOut(BaseModel):
    id: int
    name: str

@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int):
    return {"id": user_id, "name": "ada", "password": "leaked"}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/users/{user_id}' }],
      codeContains: ['response_model', 'UserOut'],
      openapiHas: ['components.schemas.UserOut', 'paths./users/{user_id}.get.responses'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## response_model',
          'What you return and what you **promise** are not the same. `response_model=UserOut` documents the public shape.',
          'In real FastAPI it also filters extra fields. Here the important lesson is the OpenAPI schema clients trust.',
          'Look at `components.schemas.UserOut` after Run.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'مدل پاسخ و جلوگیری از نشت داده',
      objective: 'فیلتر و امن‌سازی محموله خروجی از طریق اسکیمای اختصاصی `response_model`.',
      hint: 'در دکوراتور `response_model=UserOut` را قرار داده و مدل آن را تعریف نمایید.',
      learning: [
        'ویژگی response_model داده‌های خروجی را با یک فهرست سفید (Whitelist) فیلتر می‌کند.',
        'فیلدهای حساس دیتابیس مانند هش پسورد پیش از ارسال به کلاینت از محموله حذف می‌گردند.',
        'سند OpenAPI مشخصات دقیق داده خروجی را برای برنامه‌نویسان کلاینت مستند می‌سازد.',
      ],
      fieldNotes: [
        'عدم استفاده از Response Model عامل اصلی نشت ناخواسته اطلاعات حساس کاربران در سازمان‌هاست.',
        'همواره سه مدل تفکیک‌شده داشته باشید: UserCreate (ورودی)، UserInDB (داخلی) و UserOut (خروجی).',
        'وجود مدل پاسخ یکپارچه، خروجی ابزارهای تولید SDK برای کلاینت‌ها (مثل TypeScript/Dart) را بی‌نقص می‌کند.',
      ],
    },
  },

  // ── plumber ───────────────────────────────────────────
  {
    id: 'plumber-01',
    track: 'plumber',
    language: 'r',
    name: 'Your first plumber route',
    objective: 'Expose R analytics and model serving functions over HTTP using roxygen comments.',
    learning: [
      'Plumber converts standard R functions into web endpoints using special #* comments.',
      'The #* @get / annotation designates a GET handler on the specified path.',
      'R list() return values are cleanly serialized into standard JSON by the json serializer.',
    ],
    fieldNotes: [
      'R is single-threaded; production plumber microservices should run multiple workers behind NGINX or Traefik.',
      'Always set explicit serializers (e.g. #* @serializer json) to avoid unexpected binary or unboxed returns.',
      'Plumber is an exceptional tool for deploying R-trained forecasting, survival, and statistical models.',
    ],
    hint: 'Use `#* @get /` above `function() list(hello = "world")`.',
    golf: 2,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Hello API
#* @get /

`,
    solutionCode: `library(plumber)

#* @apiTitle Hello API
#* @get /
#* @serializer json
function() {
  list(hello = "world")
}
`,
    goal: {
      endpoints: [{ method: 'GET', path: '/' }],
      calls: [{ method: 'GET', path: '/', expectStatus: 200, expectBody: { hello: 'world' } }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber annotations',
          'plumber turns R functions into HTTP endpoints with **roxygen-style comments**.',
          '```\n#* @get /\nfunction() list(hello = "world")\n```',
          'The comment `#* @get /` binds the next function to `GET /`. Return a `list()` — it serializes to JSON.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'نخستین روت در Plumber',
      objective: 'سرو توابع تحلیلی و آماری زبان R روی بستر HTTP با کامنت‌های تفسیری Roxygen.',
      hint: 'عبارت `#* @get /` را بالای تابع `function() list(hello = "world")` بنویسید.',
      learning: [
        'پکیج Plumber توابع زبان R را با کامنت‌های ویژه #* به اندپوینت‌های وب تبدیل می‌کند.',
        'کامنت تفسیری #* @get / تابع بعدی را به متد GET روی مسیر ریشه متصل می‌نماید.',
        'خروجی‌های ساختار list() در زبان R توسط سریالایزر به شکل JSON استاندارد ارسال می‌شوند.',
      ],
      fieldNotes: [
        'پروسه زبان R تک‌ترد است؛ در پروداکشن برای Plumber باید ورکرها را پشت NGINX یا کانتینر Scale کرد.',
        'همیشه سریالایزر را با #* @serializer json تصریح کنید تا از تبدیل‌های ناخواسته جلوگیری شود.',
        'پکیج Plumber گزینه‌ای بسیار قدرتمند برای سرو خروجی مدل‌های یادگیری ماشین و آماری در R است.',
      ],
    },
  },
  {
    id: 'plumber-02',
    track: 'plumber',
    language: 'r',
    name: 'Path params in plumber',
    objective: 'Receive typed URL parameters in R handlers with explicit type annotations.',
    learning: [
      'Angle brackets mark dynamic path parameters: #* @get /users/<id>.',
      'The #* @param id:int annotation documents and verifies parameter types.',
      'Plumber maps path variables directly into the R function argument list.',
    ],
    fieldNotes: [
      'R treats numbers as floating-point doubles by default; cast integer IDs explicitly when necessary.',
      'Validate that client IDs do not point to missing vector indices in R data structures.',
      'Use proper error handlers to prevent unhandled R warnings or stops from crashing the process.',
    ],
    hint: 'Annotate `#* @get /users/<id>` and `#* @param id:int`, then use `id` in the function args.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Users API
#* @get /users
function() {
  list(users = list())
}

#* @get /users/<id>
#* @param id:int

`,
    solutionCode: `library(plumber)

#* @apiTitle Users API
#* @get /users
function() {
  list(users = list())
}

#* @get /users/<id>
#* @param id:int
function(id) {
  list(id = id, name = "ada")
}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/users' },
        { method: 'GET', path: '/users/{id}' },
      ],
      calls: [{ method: 'GET', path: '/users/7', expectStatus: 200, expectBody: { id: 7 } }],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber path parameters',
          'Angle brackets mark a path parameter: `#* @get /users/<id>` matches `/users/7`.',
          'Declare it with `#* @param id:int` and list `id` in the function signature so the value is injected.',
          'This is the R twin of FastAPI’s `/users/{user_id}`.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'پارامترهای مسیر در Plumber',
      objective: 'دریافت متغیرهای مسیر در توابع R همراه با اعتبارسنجی نوع پارامتر.',
      hint: 'از `#* @get /users/<id>` و `#* @param id:int` استفاده کرده و `id` را به عنوان ورودی تابع بگیرید.',
      learning: [
        'در فریم‌ورک Plumber از علامت‌های <id> برای معرفی پارامترهای مسیر استفاده می‌شود.',
        'کامنت #* @param id:int نوع پارامتر را برای مستندات و اعتبارسنجی مشخص می‌کند.',
        'فریم‌ورک Plumber متغیرهای مسیر را مستقیماً به پارامترهای تابع R متصل می‌سازد.',
      ],
      fieldNotes: [
        'زبان R اعداد را به طور پیش‌فرض دابل (Double) در نظر می‌گیرد؛ در صورت نیاز تبدیل صریح به عدد صحیح انجام دهید.',
        'همیشه اعتبارسنجی کنید که شناسه درخواستی کلاینت خارج از بازه ایندکس ساختار داده‌های R نباشد.',
        'از بلوک‌های tryCatch در R برای جلوگیری از توقف پروسه وب‌سرور استفاده نمایید.',
      ],
    },
  },
  {
    id: 'plumber-03',
    track: 'plumber',
    language: 'r',
    name: 'POST body in plumber',
    objective: 'Parse and validate inbound JSON request bodies in R microservices.',
    learning: [
      'POST handlers capture request context via the req argument.',
      'The raw body string is located in req$postBody and parsed via jsonlite::fromJSON.',
      'The #* @status 201 annotation declares the HTTP response status code.',
    ],
    fieldNotes: [
      'jsonlite::fromJSON simplifies dataframes by default; set simplifyVector = FALSE for nested structures.',
      'Sanitize all inbound string fields to prevent script injection in R Markdown reporting pipelines.',
      'Return consistent JSON error lists when the incoming body fails parsing or schema validation.',
    ],
    hint: 'Read `req$postBody` and return `list(id = 1, name = body$name)` with status 201.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Users API
#* @post /users
#* @serializer json

# Create a user from the JSON body, status 201
`,
    solutionCode: `library(plumber)

#* @apiTitle Users API
#* @post /users
#* @status 201
#* @serializer json
function(req) {
  body <- jsonlite::fromJSON(req$postBody)
  list(id = 1, name = body$name)
}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/users', status: 201 }],
      calls: [
        {
          method: 'POST',
          path: '/users',
          body: { name: 'ada' },
          expectStatus: 201,
          expectBody: { name: 'ada' },
        },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber request body',
          'For `POST`, take `req` and read `req$postBody` (JSON string). Parse it with `jsonlite::fromJSON`.',
          'Set the status with `#* @status 201` — the R twin of FastAPI’s `status_code=201`.',
          'Try: `call POST /users body={"name":"ada"}"',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'بدنه درخواست POST در Plumber',
      objective: 'دریافت و پارس بسته‌های JSON ورودی در میکروسرویس‌های تحلیل داده با زبان R.',
      hint: 'متغیر `req$postBody` را خوانده و با وضعیت 201 پاسخ دهید.',
      learning: [
        'توابع POST در Plumber شیء کانتکست درخواست را با آرگومان req دریافت می‌کنند.',
        'رشته خام JSON در req$postBody قرار دارد و توسط پکیج jsonlite پارس می‌گردد.',
        'کامنت تفسیری #* @status 201 کد وضعیت پروتکل HTTP را مشخص می‌نماید.',
      ],
      fieldNotes: [
        'متد fromJSON به طور پیش‌فرض بردارها را ساده‌سازی می‌کند؛ برای ساختارهای پیچیده از simplifyVector = FALSE بهره ببرید.',
        'ورودی‌های متنی را پیش از پاس دادن به پایپ‌لاین‌های گزارش‌گیری R بهداشتی‌سازی کنید.',
        'در صورت خطای نحوی در JSON ورودی، لیست خطای مناسب با وضعیت ۴۰۰ برگردانید.',
      ],
    },
  },

  // ── OpenAPI / Swagger ─────────────────────────────────
  {
    id: 'openapi-01',
    track: 'openapi',
    language: 'openapi',
    name: 'Read the OpenAPI map',
    objective: 'Explore and structure the machine-readable OpenAPI 3.0 API contract.',
    learning: [
      'OpenAPI 3.0 documents establish a single source of truth for endpoints, models, and docs.',
      'Tags visually cluster related operations; summaries provide high-level endpoint descriptions.',
      'Documentation UI engines like Swagger UI and Redoc render directly from this specification.',
    ],
    fieldNotes: [
      'Integrate OpenAPI JSON specs into CI/CD to detect breaking API changes before deployments.',
      'Client generation tools (openapi-generator, orval) compile client SDKs directly from this document.',
      'Always version your API paths (/api/v1/...) to prevent contract breakage across client releases.',
    ],
    hint: 'Run the starter code and open the OpenAPI panel — then `openapi` in the console.',
    golf: 1,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore Mini", version="1.0.0")

@app.get("/pets", tags=["pets"], summary="List pets")
def list_pets():
    return {"pets": []}

@app.post("/pets", tags=["pets"], status_code=201)
def create_pet():
    return {"id": 1, "name": "rex"}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Petstore Mini", version="1.0.0")

@app.get("/pets", tags=["pets"], summary="List pets")
def list_pets():
    return {"pets": []}

@app.post("/pets", tags=["pets"], status_code=201)
def create_pet():
    return {"id": 1, "name": "rex"}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/pets' },
        { method: 'POST', path: '/pets', status: 201 },
      ],
      openapiHas: ['paths./pets.get', 'paths./pets.post', 'info.title'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## OpenAPI / Swagger',
          'Every FastAPI app can emit an **OpenAPI** document: `info`, `paths`, `components`.',
          'Swagger UI is a *renderer* of that document. Tags group operations; summaries label them.',
          'Press **Run**, inspect the OpenAPI panel, and type `openapi` to dump the JSON.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'قرارداد OpenAPI و Swagger',
      objective: 'آشنایی و سازماندهی مستندات تعاملی استاندارد OpenAPI 3.0 برای اندپوینت‌ها.',
      hint: 'کد را اجرا کرده و تب OpenAPI یا دستور `openapi` را در کنسول بررسی کنید.',
      learning: [
        'مشخصات OpenAPI 3.0 منبع واحد حقیقت (Single Source of Truth) برای مستندات و کلاینت‌هاست.',
        'برچسب‌های tags اندپوینت‌های مرتبط را دسته‌بندی کرده و summaries توضیحات عملیات را ثبت می‌کند.',
        'رابط‌های کاربری تعاملی مثل Swagger UI و Redoc مستقیماً بر اساس این سند رندر می‌شوند.',
      ],
      fieldNotes: [
        'سند OpenAPI را در CI/CD قرار دهید تا تغییرات شکست‌دهنده (Breaking Changes) قبل از دیپلوی کشف شوند.',
        'ابزارهای تولید خودکار SDK بر اساس همین سند کدهای TypeScript و کلاینت موبایل را کامپایل می‌کنند.',
        'مسیرهای سرویس خود را همیشه با پیشوند نسخه (/api/v1/...) طراحی کنید تا ارتقا بدون اختلال انجام شود.',
      ],
    },
  },
  {
    id: 'openapi-02',
    track: 'openapi',
    language: 'python',
    name: 'Schemas land in components',
    objective: 'Codify reusable domain schemas under components.schemas in the OpenAPI registry.',
    learning: [
      'Pydantic models are registered globally under #/components/schemas/<ModelName>.',
      'Path operations reference schemas using JSON Pointers ($ref) to prevent schema duplication.',
      'Field types, defaults, and descriptions are fully surfaced in the generated documentation.',
    ],
    fieldNotes: [
      'Reusing components.schemas guarantees consistent domain terminology across backend and frontend teams.',
      'Keep model names unique and descriptive; avoiding ambiguous names like Data or Info.',
      'Annotate fields with Field(description="...") to provide contextual help in Swagger docs.',
    ],
    hint: 'A Pydantic model named `Item` becomes `components.schemas.Item`.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

# class Item(BaseModel): name: str, price: float
# POST /items with body model Item
`,
    solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Store")

class Item(BaseModel):
    name: str
    price: float

@app.post("/items", status_code=201)
def create_item(item: Item):
    return {"id": 1, "name": item.name, "price": item.price}
`,
    goal: {
      endpoints: [{ method: 'POST', path: '/items', status: 201 }],
      openapiHas: ['components.schemas.Item', 'paths./items.post.requestBody'],
      codeContains: ['class Item', 'BaseModel'],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## components.schemas',
          'Named models are the contract clients generate against.',
          'A `BaseModel` used as a body becomes `#/components/schemas/Item`, referenced from `requestBody`.',
          'That is exactly what `schemas` in the OpenAPI panel shows after `run`.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'رجیستری مدل‌ها در components.schemas',
      objective: 'ثبت و بازاستفاده مدل‌های دامنه در بخش components.schemas سند استاندارد OpenAPI.',
      hint: 'مدل `Item` از جنس BaseModel را بسازید تا در `components.schemas.Item` قرار گیرد.',
      learning: [
        'مدل‌های نام‌گذاری‌شده Pydantic به صورت سراسری در #/components/schemas رجیستر می‌شوند.',
        'عملیات مسیر با استفاده از پوینترهای $ref به مدل‌ها ارجاع می‌دهند تا تکرار اسکیما حذف شود.',
        'انواع فیلدها و پیش‌فرض‌ها به طور شفاف در مشخصات منتشرشده قابل مشاهده است.',
      ],
      fieldNotes: [
        'ثبت متمرکز مدل‌ها هماهنگی بی‌نقصی میان تیم‌های بک‌اند و فرانت‌اند برای مدل‌های داده ایجاد می‌کند.',
        'نام مدل‌ها را شفاف و اختصاصی انتخاب کنید و از اسامی مبهم مانند Data یا Info بپرهیزید.',
        'از دستور Field(description="...") برای غنی‌سازی توضیحات فیلدها در Swagger استفاده کنید.',
      ],
    },
  },

  // ── Compare ───────────────────────────────────────────
  {
    id: 'compare-01',
    track: 'compare',
    language: 'python',
    name: 'Same API, two stacks',
    objective: 'Implement operational health and observability endpoints across distinct technology stacks.',
    learning: [
      'The OpenAPI interface contract is completely independent of the underlying backend language.',
      'Health checks provide essential telemetry for orchestrators like Kubernetes and Docker Swarm.',
      'FastAPI and plumber can produce identical API surfaces and HTTP contracts.',
    ],
    fieldNotes: [
      'Separate liveness (/healthz - process is alive) from readiness (/ready - database connections alive).',
      'Keep metrics endpoints protected or restricted to private internal monitoring VPC networks.',
      'Adhere to standardized metric payload formats like Prometheus or OpenTelemetry.',
    ],
    hint: 'Implement `GET /health` and `GET /metrics` in FastAPI first; the solution shows the plumber twin.',
    golf: 3,
    editorLabel: 'main.py',
    startCode: `from fastapi import FastAPI

app = FastAPI(title="Ops API")

# GET /health  → {"status": "ok"}
# GET /metrics → {"cpu": 0.12, "mem": 0.44}
`,
    solutionCode: `from fastapi import FastAPI

app = FastAPI(title="Ops API")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metrics")
def metrics():
    return {"cpu": 0.12, "mem": 0.44}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
        { method: 'GET', path: '/metrics', expectStatus: 200 },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## One contract, two runtimes',
          'The OpenAPI contract is language-agnostic. FastAPI and plumber both emit paths, methods, params, and schemas.',
          'This level is the FastAPI side. After you solve it, switch the editor to the plumber twin below and compare annotation vs decorator.',
          '```\n#* @get /health\nfunction() list(status = "ok")\n```',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'یک قرارداد API، دو استک فنی',
      objective: 'پیاده‌سازی اندپوینت‌های سلامت و مانیتورینگ برای دو محیط فنی متفاوت با قراردادی واحد.',
      hint: 'اندپوینت‌های `GET /health` و `GET /metrics` را پیاده‌سازی کنید.',
      learning: [
        'قرارداد رابط کاربری OpenAPI کاملاً مستقل از زبان برنامه‌نویسی سمت بک‌اند عمل می‌کند.',
        'اندپوینت‌های سلامت تلمتری حیاتی برای ارکستریتورهایی نظیر Kubernetes فراهم می‌سازند.',
        'فریم‌ورک‌های پایتون و R می‌توانند رفتار شبکه و پاسخ‌های کاملاً یکسانی به کلاینت ارائه دهند.',
      ],
      fieldNotes: [
        'پروب Liveness (زنده بودن پروسه سرور) را از Readiness (سالم بودن اتصال دیتابیس) تفکیک کنید.',
        'اندپوینت‌های متریک را در شبکه داخلی محدود کنید تا متادیتای سیستم در اینترنت عمومی افشا نشود.',
        'از قالب‌های متریک استاندارد صنعتی نظیر Prometheus و OpenTelemetry پیروی نمایید.',
      ],
    },
  },
  {
    id: 'compare-02',
    track: 'compare',
    language: 'r',
    name: 'The plumber twin',
    objective: 'Implement the identical observability contract using R annotations.',
    learning: [
      'Plumber replicates the exact same HTTP signatures and telemetry schemas as FastAPI.',
      'R-based data science microservices integrate natively with standard production monitoring tools.',
      'Clients consume the API without any coupling to the backend runtime implementation.',
    ],
    fieldNotes: [
      'Verify that numeric precision in R responses matches client consumer expectations.',
      'Deploy R microservices with health checks to enable zero-downtime rolling updates in Kubernetes.',
      'Containerize Plumber apps using multi-stage Docker builds to keep container image sizes minimal.',
    ],
    hint: 'Mirror the FastAPI ops API with `#* @get /health` and `#* @get /metrics`.',
    golf: 3,
    editorLabel: 'plumber.R',
    startCode: `library(plumber)

#* @apiTitle Ops API
#* @get /health

#* @get /metrics

`,
    solutionCode: `library(plumber)

#* @apiTitle Ops API
#* @get /health
#* @serializer json
function() {
  list(status = "ok")
}

#* @get /metrics
#* @serializer json
function() {
  list(cpu = 0.12, mem = 0.44)
}
`,
    goal: {
      endpoints: [
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/metrics' },
      ],
      calls: [
        { method: 'GET', path: '/health', expectStatus: 200, expectBody: { status: 'ok' } },
      ],
    },
    startDialog: [
      {
        type: 'ModalAlert',
        markdowns: [
          '## plumber twin',
          'Same two endpoints, R style. Annotation comments replace decorators; `list()` replaces a dict return.',
          'Notice the OpenAPI map is nearly identical — clients cannot tell the runtime apart.',
        ],
      },
      { type: 'GoalList' },
    ],
    fa: {
      name: 'همتای R در Plumber',
      objective: 'پیاده‌سازی قرارداد سلامت یکپارچه در زبان R با استفاده از انوتیشن‌های Plumber.',
      hint: 'دقیقاً همان رفتار اندپوینت‌های سلامت را با `#* @get /health` و `#* @get /metrics` پیاده‌سازی کنید.',
      learning: [
        'پکیج Plumber همان امضاهای HTTP و اسکیمای خروجی پایتون را با ظرافت تولید می‌کند.',
        'میکروسرویس‌های R به راحتی با ابزارهای استاندارد مانیتورینگ سازمان یکپارچه می‌شوند.',
        'کلاینت‌ها بدون وابستگی به زبان بک‌اند، خدمات مورد نیاز خود را به طور یکنواخت دریافت می‌نمایند.',
      ],
      fieldNotes: [
        'دقت اعشاری در خروجی اعداد R را متناسب با نیاز مصرف‌کننده کلاینت بررسی و تنظیم کنید.',
        'اپ‌های Plumber را به همراه اندپوینت‌های سلامت کانتینریزه کنید تا امکان Rolling Update مهیا گردد.',
        'برای سبک ماندن ایمیج داکر در پروداکشن از Multi-stage Docker Builds استفاده نمایید.',
      ],
    },
  },
];

/**
 * Sequence catalog for tracks and level groups.
 */
export const SEQUENCES = [
  {
    id: 'http',
    name: 'HTTP Basics',
    about: 'Endpoints, methods, and the request pipeline',
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    about: 'Decorators, path/query params, bodies, status codes',
  },
  {
    id: 'plumber',
    name: 'plumber (R)',
    about: 'Annotations, path params, JSON bodies',
  },
  {
    id: 'openapi',
    name: 'OpenAPI / Swagger',
    about: 'The contract Swagger UI renders',
  },
  {
    id: 'compare',
    name: 'Compare',
    about: 'One API surface, two stacks',
  },
];

export const TRACKS = ['http', 'fastapi', 'plumber', 'openapi', 'compare'];

/**
 * Default sandbox starter.
 */
export const SANDBOX = {
  id: 'sandbox',
  track: 'http',
  language: 'python',
  name: 'Sandbox',
  objective: 'Free play. Experiment with custom endpoints, Pydantic models, and request flows.',
  learning: [
    'Write any FastAPI Python code and compile it into the mock server.',
    'Test endpoints with `call GET /path` or send JSON payloads.',
    'Inspect live Swagger 3.0 document generation under the OpenAPI panel.',
  ],
  fieldNotes: [
    'Use sandbox mode to draft prototypes before codifying them into level challenges.',
    'Explore route collisions: FastAPI matches routes in order of declaration.',
    'Test validation errors: pass strings to integer path parameters to witness 422 rejections.',
  ],
  hint: 'Free play. `help` for commands.',
  golf: 0,
  editorLabel: 'server.py',
  startCode: `from fastapi import FastAPI

app = FastAPI(title="Sandbox API", version="0.1.0")

@app.get("/")
def root():
    return {"app": "sandbox"}

@app.get("/users")
def list_users():
    return {"users": []}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"id": user_id, "name": "ada"}

@app.post("/users", status_code=201)
def create_user():
    return {"id": 1, "name": "guest"}
`,
  solutionCode: '',
  goal: {},
  startDialog: [],
  fa: {
    name: 'حالت سندباکس',
    objective: 'آزمایش و کدنویسی آزاد. تعریف اندپوینت‌ها، مدل‌های Pydantic و بررسی جریان درخواست‌ها.',
    hint: 'محیط آزاد. برای مشاهده فرامین `help` را تایپ کنید.',
    learning: [
      'کدهای دلخواه FastAPI را بنویسید و در سرور شبیه‌ساز کامپایل کنید.',
      'اندپوینت‌ها را با دستوراتی مانند `call GET /users` یا ارسال بدنه تست نمایید.',
      'مشخصات زنده Swagger 3.0 را در تب OpenAPI بررسی کنید.',
    ],
    fieldNotes: [
      'از سندباکس برای آزمایش پروتوتایپ‌های جدید پیش از حل مراحل چالش استفاده کنید.',
      'توالی تعریف روت‌ها را ارزیابی کنید: در فریم‌ورک‌ها اولویت با اولین مسیر منطبق است.',
      'رفتارهای اعتبارسنجی را بیازمایید: ارسال رشته به پارامتر عددی برای مشاهده خطای ۴۲۲.',
    ],
  },
};

for (const level of LEVELS) {
  level.de = DE_LEVELS[level.id];
}

/**
 * Localize level based on requested language.
 *
 * @param {Level} level
 * @param {'en'|'fa'|'de'} [lang='en']
 * @returns {Level}
 */
export function getLocalizedLevel(level, lang = 'en') {
  if (lang === 'fa' && level.fa) {
    const dlg = FA_DIALOGS[level.id];
    /** @type {object[]} */
    let startDialog = level.startDialog;
    if (dlg) {
      startDialog = [{ type: 'ModalAlert', markdowns: dlg.intro }];
      if (dlg.demo) {
        startDialog.push({
          type: 'ApiDemo',
          beforeMarkdowns: [dlg.demo.before],
          afterMarkdowns: [dlg.demo.after],
          command: dlg.demo.command,
        });
      }
      startDialog.push({ type: 'GoalList' });
    }
    return {
      ...level,
      name: level.fa.name || level.name,
      objective: level.fa.objective || level.objective,
      hint: level.fa.hint || level.hint,
      learning: level.fa.learning || level.learning,
      fieldNotes: level.fa.fieldNotes || level.fieldNotes,
      startDialog,
    };
  }

  if (lang === 'de' && level.de) {
    const dlg = DE_DIALOGS[level.id];
    /** @type {object[]} */
    let startDialog = level.startDialog;
    if (dlg) {
      startDialog = [{ type: 'ModalAlert', markdowns: dlg.intro }];
      if (dlg.demo) {
        startDialog.push({
          type: 'ApiDemo',
          beforeMarkdowns: [dlg.demo.before],
          afterMarkdowns: [dlg.demo.after],
          command: dlg.demo.command,
        });
      }
      startDialog.push({ type: 'GoalList' });
    }
    return {
      ...level,
      name: level.de.name || level.name,
      objective: level.de.objective || level.objective,
      hint: level.de.hint || level.hint,
      learning: level.de.learning || level.learning,
      fieldNotes: level.de.fieldNotes || level.fieldNotes,
      startDialog,
    };
  }

  return level;
}

