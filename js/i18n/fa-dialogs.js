/**
 * Persian intro-dialog copy per level. Code, commands and HTTP terms stay
 * in English inside the text. Each entry becomes: ModalAlert (intro),
 * optional ApiDemo (demo), then the goal list.
 */

export const FA_DIALOGS = {
  'http-01': {
    intro: [
      '## اندپوینت',
      'یک API چند **اندپوینت** دارد: عملیات‌هایی که روی سرور آدرس‌پذیرند. هر اندپوینت یک متد HTTP را با یک مسیر جفت می‌کند.',
      'در FastAPI با دکوراتور ثبت می‌شود: `@app.get("/")` درخواست `GET /` را می‌گیرد.',
      'تابع زیر دکوراتور وقتی درخواست برسد اجرا می‌شود و JSON برمی‌گرداند.',
    ],
    demo: {
      before: '`GET /` را ثبت کنید و ببینید گره‌اش در سطح API ظاهر می‌شود.',
      after: '`GET /` فعال است. از کنسول صدایش بزنید: `call GET /`',
      command: 'call GET /',
    },
  },
  'http-02': {
    intro: [
      '## متدها',
      '`GET` می‌خواند. `POST` می‌سازد. `PUT`/`PATCH` ویرایش می‌کنند. `DELETE` حذف می‌کند.',
      'یک مسیر با متدهای متفاوت یعنی اندپوینت‌های متفاوت. برای وضعیت ساخت از `@app.post(..., status_code=201)` استفاده کنید.',
    ],
  },
  'fastapi-01': {
    intro: [
      '## پارامترهای مسیر',
      'بخشی از مسیر که در آکولاد باشد **پارامتر مسیر** است: `/users/{user_id}` با `/users/42` جور می‌شود و `user_id=42`.',
      'آن را در امضای تابع با نوع اعلام کنید. FastAPI اعتبارسنجی می‌کند: برای `int` مقدار `ada` با **422** رد می‌شود.',
      'بعد از پیاده‌سازی `call GET /users/ada` را امتحان کنید.',
    ],
  },
  'fastapi-02': {
    intro: [
      '## پارامترهای کوئری',
      'هر چیز بعد از `?` رشته‌ی کوئری است: `GET /search?q=ada&limit=2`.',
      'در FastAPI آرگومان‌هایی از تابع که در مسیر نیستند پارامتر کوئری می‌شوند. مقدار پیش‌فرض آن‌ها را اختیاری می‌کند.',
      'بعد از `run` دستور `call GET /search?q=ada&limit=2` را بزنید و بسته شدن مقدارها را ببینید.',
    ],
  },
  'fastapi-03': {
    intro: [
      '## بدنه‌ی درخواست',
      'درخواست‌های ساخت یک **بدنه‌ی JSON** دارند. FastAPI آن را با یک `BaseModel` از Pydantic اعتبارسنجی می‌کند.',
      'سند OpenAPI بعد از آن `components.schemas.User` را اعلام می‌کند؛ همان چیزی که Swagger UI نشان می‌دهد.',
      'ارسال: `call POST /users body={"name":"ada","age":36}`',
    ],
  },
  'fastapi-04': {
    intro: [
      '## کدهای وضعیت',
      '200 OK · 201 Created · 204 No Content · 404 Not Found · 422 Validation Error',
      'با کد وضعیت به کلاینت بگویید چه شد. یک `DELETE` موفق معمولاً **204** با بدنه‌ی خالی است.',
    ],
  },
  'fastapi-05': {
    intro: [
      '## CRUD',
      'یک منبع فقط یک مسیر نیست. **C**reate با `POST` · **R**ead با `GET` · **U**pdate با `PUT` · **D**elete با `DELETE`.',
      'مسیر یکسان `/notes/{note_id}` برای خواندن، ویرایش و حذف؛ مسیر مجموعه `/notes` برای فهرست و ساخت.',
      'این همان شکلی است که هر سرویس واقعی، از جمله پروژه‌های FastAPI با SQLAlchemy، به آن می‌رسد.',
    ],
  },
  'fastapi-06': {
    intro: [
      '## خطا بخشی از قرارداد است',
      'منبع گم‌شده **404** است؛ نه Stack Trace و نه یک `200` ساکت با `null`.',
      'FastAPI با `raise HTTPException(status_code=404, detail="...")` این را اعلام می‌کند.',
      'OpenAPI مقدار 404 را زیر `responses` فهرست می‌کند؛ همان چیزی که کلاینت‌ها و Swagger UI می‌بینند.',
      'بعد از Run دستور `call GET /items/99` را امتحان کنید.',
    ],
  },
  'fastapi-07': {
    intro: [
      '## Depends',
      'هندلر نباید خودش سشن دیتابیس باز کند یا تنظیمات را دستی بخواند. **وابستگی‌ها** تامین‌کننده‌هایی هستند که FastAPI تزریق می‌کند.',
      '```\ndef get_settings():\n    return {"app_name": "LearnAPI"}\n\n@app.get("/info")\ndef info(settings: dict = Depends(get_settings)):\n    return {"app": settings["app_name"]}\n```',
      'این ستون فقرات اپ‌های FastAPI در تولید است: احراز هویت، دیتابیس و تنظیمات همه روی `Depends` سوارند.',
    ],
  },
  'fastapi-08': {
    intro: [
      '## احراز هویت به‌عنوان قرارداد',
      'کلیدهای API فقط **هدر** هستند. FastAPI آن‌ها را با `Header(...)` اعلام می‌کند و OpenAPI `securitySchemes` را منتشر می‌کند.',
      'Swagger UI یک قفل نشان می‌دهد؛ تزئین نیست، قراردادی است که کلاینت‌ها از آن کد تولید می‌کنند.',
      'بدون هدر شبیه‌ساز **401** می‌دهد. با `headers={"X-API-Key":"secret"}` مسیر جواب می‌دهد.',
    ],
  },
  'fastapi-09': {
    intro: [
      '## response_model',
      'چیزی که برمی‌گردانید با چیزی که **تعهد** می‌کنید یکی نیست. `response_model=UserOut` شکل عمومی را مستند می‌کند.',
      'در FastAPI واقعی فیلدهای اضافه را هم فیلتر می‌کند. اینجا درس مهم اسکیمای OpenAPI است که کلاینت‌ها به آن تکیه می‌کنند.',
      'بعد از Run به `components.schemas.UserOut` نگاه کنید.',
    ],
  },
  'plumber-01': {
    intro: [
      '## انوتیشن‌های plumber',
      'plumber با **کامنت‌های سبک roxygen** تابع‌های R را به اندپوینت HTTP تبدیل می‌کند.',
      '```\n#* @get /\nfunction() list(hello = "world")\n```',
      'کامنت `#* @get /` تابع بعدی را به `GET /` می‌بندد. یک `list()` برگردانید؛ به JSON تبدیل می‌شود.',
    ],
  },
  'plumber-02': {
    intro: [
      '## پارامترهای مسیر در plumber',
      'علامت‌های کوچک‌تر و بزرگ‌تر پارامتر مسیر را نشان می‌دهند: `#* @get /users/<id>` با `/users/7` جور می‌شود.',
      'آن را با `#* @param id:int` اعلام کنید و `id` را در امضای تابع بیاورید تا مقدار تزریق شود.',
      'این همتای R برای `/users/{user_id}` در FastAPI است.',
    ],
  },
  'plumber-03': {
    intro: [
      '## بدنه‌ی درخواست در plumber',
      'برای `POST` آرگومان `req` را بگیرید و `req$postBody` (رشته‌ی JSON) را بخوانید. با `jsonlite::fromJSON` پارسش کنید.',
      'وضعیت را با `#* @status 201` تعیین کنید؛ همتای `status_code=201` در FastAPI.',
      'امتحان: `call POST /users body={"name":"ada"}`',
    ],
  },
  'openapi-01': {
    intro: [
      '## OpenAPI / Swagger',
      'هر اپ FastAPI می‌تواند یک سند **OpenAPI** تولید کند: `info`، `paths` و `components`.',
      'Swagger UI فقط یک *رندرکننده*‌ی همین سند است. تگ‌ها عملیات را گروه می‌کنند و summary برچسب می‌زند.',
      '**Run** را بزنید، پنل OpenAPI را ببینید و با `openapi` JSON را چاپ کنید.',
    ],
  },
  'openapi-02': {
    intro: [
      '## components.schemas',
      'مدل‌های نام‌دار قراردادی هستند که کلاینت‌ها از آن کد تولید می‌کنند.',
      'یک `BaseModel` که به‌عنوان بدنه استفاده شود به `#/components/schemas/Item` تبدیل می‌شود و از `requestBody` به آن ارجاع داده می‌شود.',
      'بعد از `run` دقیقاً همین را در بخش `schemas` پنل OpenAPI می‌بینید.',
    ],
  },
  'compare-01': {
    intro: [
      '## یک قرارداد، دو زمان‌اجرا',
      'قرارداد OpenAPI به زبان وابسته نیست. FastAPI و plumber هر دو مسیر، متد، پارامتر و اسکیما منتشر می‌کنند.',
      'این مرحله سمت FastAPI است. بعد از حل آن، همتای plumber را در مرحله‌ی بعد بنویسید و انوتیشن را با دکوراتور مقایسه کنید.',
      '```\n#* @get /health\nfunction() list(status = "ok")\n```',
    ],
  },
  'compare-02': {
    intro: [
      '## همتای plumber',
      'همان دو اندپوینت، به سبک R. کامنت‌های انوتیشن جای دکوراتور را می‌گیرند و `list()` جای دیکشنری برگشتی.',
      'ببینید نقشه‌ی OpenAPI تقریباً یکی است؛ کلاینت‌ها نمی‌توانند زمان‌اجرا را تشخیص دهند.',
    ],
  },
};
