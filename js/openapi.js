/**
 * OpenAPI 3.0 document generation from parsed FastAPI / plumber routes.
 *
 * Args:
 *   parsed — ParsedApp from engine.parseSource
 *
 * Returns:
 *   OpenAPI 3.0.3 JavaScript object
 */

/**
 * @param {import('./engine.js').ParsedApp} parsed
 * @returns {object}
 */
export function generateOpenAPI(parsed) {
  /** @type {Record<string, object>} */
  const paths = {};

  for (const route of parsed.routes) {
    const key = route.path;
    if (!paths[key]) paths[key] = {};
    const opId = route.handlerName || `${route.method.toLowerCase()}_${key.replace(/\W+/g, '_')}`;

    /** @type {object[]} */
    const parameters = [];
    for (const [name, type] of Object.entries(route.params)) {
      parameters.push({
        name,
        in: 'path',
        required: true,
        schema: { type: openApiType(type) },
      });
    }
    for (const [name, meta] of Object.entries(route.query)) {
      parameters.push({
        name,
        in: 'query',
        required: !!meta.required,
        schema: { type: openApiType(meta.type) },
      });
    }
    for (const [name, meta] of Object.entries(route.headers || {})) {
      parameters.push({
        name: meta.alias || name.replace(/_/g, '-'),
        in: 'header',
        required: !!meta.required,
        schema: { type: openApiType(meta.type || 'str') },
      });
    }

    /** @type {object} */
    const responses = {
      [String(route.status)]: {
        description: route.status >= 200 && route.status < 300 ? 'Successful response' : 'Error',
        content: {
          'application/json': {
            schema: route.responseModel
              ? { $ref: `#/components/schemas/${route.responseModel}` }
              : { type: 'object' },
          },
        },
      },
    };
    for (const rule of route.raises || []) {
      responses[String(rule.status)] = {
        description: rule.detail || 'Error',
        content: { 'application/json': { schema: { type: 'object' } } },
      };
    }

    const security = Object.keys(route.headers || {}).some((h) =>
      /api[_-]?key|token|authorization/i.test(h)
    )
      ? [{ apiKeyAuth: [] }]
      : undefined;

    if (route.method !== 'GET' && route.method !== 'DELETE') {
      const schemaRef = route.bodyModel && parsed.models[route.bodyModel]
        ? { $ref: `#/components/schemas/${route.bodyModel}` }
        : { type: 'object' };
      paths[key][route.method.toLowerCase()] = {
        operationId: opId,
        summary: route.summary || route.handlerName,
        tags: route.tag ? [route.tag] : undefined,
        parameters: parameters.length ? parameters : undefined,
        security,
        requestBody: {
          required: !!(route.body && route.body.required),
          content: {
            'application/json': { schema: schemaRef },
          },
        },
        responses,
      };
      continue;
    }

    paths[key][route.method.toLowerCase()] = {
      operationId: opId,
      summary: route.summary || route.handlerName,
      tags: route.tag ? [route.tag] : undefined,
      parameters: parameters.length ? parameters : undefined,
      security,
      responses,
    };
  }

  /** @type {Record<string, object>} */
  const schemas = {};
  for (const [name, fields] of Object.entries(parsed.models)) {
    /** @type {Record<string, object>} */
    const props = {};
    /** @type {string[]} */
    const required = [];
    for (const [fname, meta] of Object.entries(fields)) {
      props[fname] = { type: openApiType(meta.type) };
      if (meta.example !== undefined) props[fname].example = meta.example;
      if (meta.required) required.push(fname);
    }
    schemas[name] = {
      type: 'object',
      properties: props,
      required: required.length ? required : undefined,
    };
  }

  const needsApiKey = parsed.routes.some((r) =>
    Object.keys(r.headers || {}).some((h) => /api[_-]?key|token/i.test(h))
  );

  const components = {};
  if (Object.keys(schemas).length) components.schemas = schemas;
  if (needsApiKey) {
    components.securitySchemes = {
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    };
  }

  return {
    openapi: '3.0.3',
    info: {
      title: parsed.title,
      version: parsed.version,
    },
    paths,
    components: Object.keys(components).length ? components : undefined,
  };
}

/**
 * Map Python / R type names to OpenAPI types.
 *
 * @param {string} type
 * @returns {string}
 */
function openApiType(type) {
  const t = (type || 'string').toLowerCase();
  if (['int', 'integer', 'long'].includes(t)) return 'integer';
  if (['float', 'double', 'number', 'numeric'].includes(t)) return 'number';
  if (['bool', 'boolean'].includes(t)) return 'boolean';
  if (['array', 'list'].includes(t)) return 'array';
  if (['object', 'json', 'dict'].includes(t)) return 'object';
  return 'string';
}

/**
 * Check that a JSON pointer-ish key path exists in the document.
 * `openapiHas: "paths./users.get"` → true if paths['/users'].get exists.
 *
 * @param {object} doc
 * @param {string} dotted
 * @returns {boolean}
 */
export function openApiHas(doc, dotted) {
  const parts = dotted.split('.');
  let cur = doc;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return false;
    if (!(part in cur)) return false;
    cur = cur[part];
  }
  return cur !== undefined;
}
