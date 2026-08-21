window.__ModuleLoader__.load({
	id: "dsh-doudizhu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = /* @__PURE__ */ new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodVoid = /*@__PURE__*/ $constructor("$ZodVoid", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "void",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isPlainObject(input)) {
					payload.issues.push({
						expected: "record",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				const values = def.keyType._zod.values;
				if (values) {
					payload.value = {};
					const recordKeys = /* @__PURE__ */ new Set();
					for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
						recordKeys.add(typeof key === "number" ? key.toString() : key);
						const keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (keyResult.issues.length) {
							payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const outKey = keyResult.value;
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}
					}
					let unrecognized;
					for (const key in input) if (!recordKeys.has(key)) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					}
					if (unrecognized && unrecognized.length > 0) payload.issues.push({
						code: "unrecognized_keys",
						input,
						inst,
						keys: unrecognized
					});
				} else {
					payload.value = {};
					for (const key of Reflect.ownKeys(input)) {
						if (key === "__proto__") continue;
						if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
						let keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
							const retryResult = def.keyType._zod.run({
								value: Number(key),
								issues: []
							}, ctx);
							if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
							if (retryResult.issues.length === 0) keyResult = retryResult;
						}
						if (keyResult.issues.length) {
							if (def.mode === "loose") payload.value[key] = input[key];
							else payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "innerType", () => {
				const d = def;
				if (!d._cachedInner) d._cachedInner = def.getter();
				return d._cachedInner;
			});
			defineLazy(inst._zod, "pattern", () => inst._zod.innerType?._zod?.pattern);
			defineLazy(inst._zod, "propValues", () => inst._zod.innerType?._zod?.propValues);
			defineLazy(inst._zod, "optin", () => inst._zod.innerType?._zod?.optin ?? void 0);
			defineLazy(inst._zod, "optout", () => inst._zod.innerType?._zod?.optout ?? void 0);
			inst._zod.parse = (payload, ctx) => {
				return inst._zod.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _void$1(Class, params) {
			return new Class({
				type: "void",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const undefinedProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
		};
		const voidProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") {
				if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
				else vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const recordProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			const keyType = def.keyType;
			const patterns = keyType._zod.bag?.patterns;
			if (def.mode === "loose" && patterns && patterns.size > 0) {
				const valueSchema = process(def.valueType, ctx, {
					...params,
					path: [
						...params.path,
						"patternProperties",
						"*"
					]
				});
				json.patternProperties = {};
				for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
			} else {
				if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
					...params,
					path: [...params.path, "propertyNames"]
				});
				json.additionalProperties = process(def.valueType, ctx, {
					...params,
					path: [...params.path, "additionalProperties"]
				});
			}
			const keyValues = keyType._zod.values;
			if (keyValues) {
				const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
				if (validKeyValues.length > 0) json.required = validKeyValues;
			}
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const lazyProcessor = (schema, ctx, _json, params) => {
			const innerType = schema._zod.innerType;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodVoid = /*@__PURE__*/ $constructor("ZodVoid", (inst, def) => {
			$ZodVoid.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => voidProcessor(inst, ctx, json, params);
		});
		function _void(params) {
			return /* @__PURE__ */ _void$1(ZodVoid, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
			$ZodRecord.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
		});
		function record$1(keyType, valueType, params) {
			if (!valueType || !valueType._zod) return new ZodRecord({
				type: "record",
				keyType: string(),
				valueType: keyType,
				...normalizeParams(valueType)
			});
			return new ZodRecord({
				type: "record",
				keyType,
				valueType,
				...normalizeParams(params)
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
			$ZodLazy.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => lazyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.getter();
		});
		function lazy(getter) {
			return new ZodLazy({
				type: "lazy",
				getter
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region generated/typert.remote-client.js
		const JsonValueRemoteCodec$schema = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema)),
			record$1(string(), lazy(() => JsonValueRemoteCodec$schema))
		]);
		const JsonValueRemoteCodec$schema2 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema2)),
			record$1(string(), lazy(() => JsonValueRemoteCodec$schema2))
		]);
		const JsonValueRemoteCodec$schema3 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema3)),
			record$1(string(), lazy(() => JsonValueRemoteCodec$schema3))
		]);
		const JsonValueRemoteCodec$schema4 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema4)),
			record$1(string(), lazy(() => JsonValueRemoteCodec$schema4))
		]);
		const JsonValueRemoteCodec$schema5 = union([
			literal(null),
			string(),
			number(),
			literal(false),
			literal(true),
			array(lazy(() => JsonValueRemoteCodec$schema5)),
			record$1(string(), lazy(() => JsonValueRemoteCodec$schema5))
		]);
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_parameter_1$schema = object({ "strategyPrompt": string().readonly() });
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_result$schema = object({
			"memberId": string().readonly(),
			"role": union([literal("coordinator"), literal("participant")]).readonly(),
			"connection": union([
				literal("connecting"),
				literal("connected"),
				literal("reconnecting"),
				literal("disconnected")
			]).readonly(),
			"room": object({
				"id": string().readonly(),
				"code": string().readonly(),
				"revision": number().readonly(),
				"phase": union([
					literal("running"),
					literal("lobby"),
					literal("locked"),
					literal("finished")
				]).readonly(),
				"coordinatorId": string().readonly(),
				"maxMembers": number().readonly(),
				"members": array(object({
					"id": string().readonly(),
					"seat": number().readonly(),
					"ready": boolean().readonly(),
					"connected": boolean().readonly(),
					"promptHash": string().readonly().optional()
				})).readonly(),
				"result": string().readonly().optional()
			}).readonly(),
			"strategyPrompt": string().readonly(),
			"joinUrls": array(string()).readonly(),
			"gameSessionId": string().readonly().optional(),
			"gameSessionState": union([
				literal("starting"),
				literal("failed"),
				literal("absent"),
				literal("ready")
			]).readonly(),
			"game": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema))
			]).readonly().optional(),
			"privateGame": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema))
			]).readonly().optional(),
			"error": string().readonly().optional()
		});
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_parameter_1$schema = object({
			"url": string().readonly(),
			"code": string().readonly(),
			"strategyPrompt": string().readonly()
		});
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_result$schema = object({
			"memberId": string().readonly(),
			"role": union([literal("coordinator"), literal("participant")]).readonly(),
			"connection": union([
				literal("connecting"),
				literal("connected"),
				literal("reconnecting"),
				literal("disconnected")
			]).readonly(),
			"room": object({
				"id": string().readonly(),
				"code": string().readonly(),
				"revision": number().readonly(),
				"phase": union([
					literal("running"),
					literal("lobby"),
					literal("locked"),
					literal("finished")
				]).readonly(),
				"coordinatorId": string().readonly(),
				"maxMembers": number().readonly(),
				"members": array(object({
					"id": string().readonly(),
					"seat": number().readonly(),
					"ready": boolean().readonly(),
					"connected": boolean().readonly(),
					"promptHash": string().readonly().optional()
				})).readonly(),
				"result": string().readonly().optional()
			}).readonly(),
			"strategyPrompt": string().readonly(),
			"joinUrls": array(string()).readonly(),
			"gameSessionId": string().readonly().optional(),
			"gameSessionState": union([
				literal("starting"),
				literal("failed"),
				literal("absent"),
				literal("ready")
			]).readonly(),
			"game": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema2)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema2))
			]).readonly().optional(),
			"privateGame": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema2)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema2))
			]).readonly().optional(),
			"error": string().readonly().optional()
		});
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_leave_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_leave_result$schema = _void();
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_parameter_1$schema = boolean();
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_result$schema = object({
			"memberId": string().readonly(),
			"role": union([literal("coordinator"), literal("participant")]).readonly(),
			"connection": union([
				literal("connecting"),
				literal("connected"),
				literal("reconnecting"),
				literal("disconnected")
			]).readonly(),
			"room": object({
				"id": string().readonly(),
				"code": string().readonly(),
				"revision": number().readonly(),
				"phase": union([
					literal("running"),
					literal("lobby"),
					literal("locked"),
					literal("finished")
				]).readonly(),
				"coordinatorId": string().readonly(),
				"maxMembers": number().readonly(),
				"members": array(object({
					"id": string().readonly(),
					"seat": number().readonly(),
					"ready": boolean().readonly(),
					"connected": boolean().readonly(),
					"promptHash": string().readonly().optional()
				})).readonly(),
				"result": string().readonly().optional()
			}).readonly(),
			"strategyPrompt": string().readonly(),
			"joinUrls": array(string()).readonly(),
			"gameSessionId": string().readonly().optional(),
			"gameSessionState": union([
				literal("starting"),
				literal("failed"),
				literal("absent"),
				literal("ready")
			]).readonly(),
			"game": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema5)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema5))
			]).readonly().optional(),
			"privateGame": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema5)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema5))
			]).readonly().optional(),
			"error": string().readonly().optional()
		});
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_status_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_status_result$schema = union([_undefined(), object({
			"memberId": string().readonly(),
			"role": union([literal("coordinator"), literal("participant")]).readonly(),
			"connection": union([
				literal("connecting"),
				literal("connected"),
				literal("reconnecting"),
				literal("disconnected")
			]).readonly(),
			"room": object({
				"id": string().readonly(),
				"code": string().readonly(),
				"revision": number().readonly(),
				"phase": union([
					literal("running"),
					literal("lobby"),
					literal("locked"),
					literal("finished")
				]).readonly(),
				"coordinatorId": string().readonly(),
				"maxMembers": number().readonly(),
				"members": array(object({
					"id": string().readonly(),
					"seat": number().readonly(),
					"ready": boolean().readonly(),
					"connected": boolean().readonly(),
					"promptHash": string().readonly().optional()
				})).readonly(),
				"result": string().readonly().optional()
			}).readonly(),
			"strategyPrompt": string().readonly(),
			"joinUrls": array(string()).readonly(),
			"gameSessionId": string().readonly().optional(),
			"gameSessionState": union([
				literal("starting"),
				literal("failed"),
				literal("absent"),
				literal("ready")
			]).readonly(),
			"game": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema3)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema3))
			]).readonly().optional(),
			"privateGame": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema3)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema3))
			]).readonly().optional(),
			"error": string().readonly().optional()
		})]);
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_parameter_0$schema = intersection(string(), unknown());
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_parameter_1$schema = string();
		const _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_result$schema = object({
			"memberId": string().readonly(),
			"role": union([literal("coordinator"), literal("participant")]).readonly(),
			"connection": union([
				literal("connecting"),
				literal("connected"),
				literal("reconnecting"),
				literal("disconnected")
			]).readonly(),
			"room": object({
				"id": string().readonly(),
				"code": string().readonly(),
				"revision": number().readonly(),
				"phase": union([
					literal("running"),
					literal("lobby"),
					literal("locked"),
					literal("finished")
				]).readonly(),
				"coordinatorId": string().readonly(),
				"maxMembers": number().readonly(),
				"members": array(object({
					"id": string().readonly(),
					"seat": number().readonly(),
					"ready": boolean().readonly(),
					"connected": boolean().readonly(),
					"promptHash": string().readonly().optional()
				})).readonly(),
				"result": string().readonly().optional()
			}).readonly(),
			"strategyPrompt": string().readonly(),
			"joinUrls": array(string()).readonly(),
			"gameSessionId": string().readonly().optional(),
			"gameSessionState": union([
				literal("starting"),
				literal("failed"),
				literal("absent"),
				literal("ready")
			]).readonly(),
			"game": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema4)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema4))
			]).readonly().optional(),
			"privateGame": union([
				literal(null),
				string(),
				number(),
				literal(false),
				literal(true),
				array(lazy(() => JsonValueRemoteCodec$schema4)),
				record$1(string(), lazy(() => JsonValueRemoteCodec$schema4))
			]).readonly().optional(),
			"error": string().readonly().optional()
		});
		const TYPERT_REMOTE = {
			package: "dsh-doudizhu",
			descriptors: [
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/host",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "host",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_parameter_0$schema
						}
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-doudizhu/transport/client#HostLanRoomRequest",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport/client#LanRoomParticipantView",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_host_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 149,
						"column": 9
					}
				},
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/join",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "join",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_parameter_0$schema
						}
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-doudizhu/transport/client#JoinLanRoomControlRequest",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport/client#LanRoomParticipantView",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_join_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 199,
						"column": 9
					}
				},
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/leave",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "leave",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_leave_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport#lanRoomTransport/leave:result",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_leave_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 329,
						"column": 9
					}
				},
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/setReady",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "setReady",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_parameter_0$schema
						}
					}, {
						name: "ready",
						wire: "ready",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-doudizhu/transport#lanRoomTransport/setReady:ready",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport/client#LanRoomParticipantView",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_setReady_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 310,
						"column": 9
					}
				},
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/status",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "status",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_status_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport#lanRoomTransport/status:result",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_status_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 275,
						"column": 3
					}
				},
				{
					id: "dsh-doudizhu/transport#lanRoomTransport/updatePrompt",
					service: "lanRoomTransport",
					namespace: "lanRoomTransport",
					method: "updatePrompt",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_parameter_0$schema
						}
					}, {
						name: "strategyPrompt",
						wire: "strategyPrompt",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "dsh-doudizhu/transport#lanRoomTransport/updatePrompt:strategyPrompt",
							schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "dsh-doudizhu/transport/client#LanRoomParticipantView",
						schema: _deepseek_ai_dsh_experimental_lan_room_ws_lanRoomTransport_updatePrompt_result$schema
					},
					sourceLocation: {
						"file": "src/transport/control.ts",
						"line": 287,
						"column": 9
					}
				}
			]
		};
		//#endregion
		//#region src/client/controller.ts
		/** React-free browser controller for the local LAN room Remote namespace. */
		const INITIAL_STATE = {
			status: "loading",
			participant: void 0,
			pending: false,
			error: void 0
		};
		/** Polls the local Host projection and serializes user mutations. */
		var LanGameClient = class {
			sessionId;
			remote;
			/** Stable observable state source consumed by the conversation-view hook. */
			store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(INITIAL_STATE);
			timer;
			refreshing;
			fingerprint = "";
			generation = 0;
			/** @param sessionId - visible foreground Session owning the game participant. @param remote - mounted Host Remote namespace. */
			constructor(sessionId, remote) {
				this.sessionId = sessionId;
				this.remote = remote;
			}
			/**
			* Start polling immediately and every 750 ms.
			* @returns disposer that stops polling.
			*/
			start() {
				this.refresh();
				this.timer ??= setInterval(() => {
					this.refresh();
				}, 750);
				return () => {
					if (this.timer !== void 0) clearInterval(this.timer);
					this.timer = void 0;
				};
			}
			/**
			* Create a coordinator room.
			* @param strategyPrompt - local pre-game strategy.
			* @returns after Host settlement.
			*/
			host(strategyPrompt) {
				return this.mutate(() => this.remote.host(this.sessionId, { strategyPrompt }));
			}
			/**
			* Join a coordinator room.
			* @param request - coordinator URL, code, and strategy.
			* @returns after Host settlement.
			*/
			join(request) {
				return this.mutate(() => this.remote.join(this.sessionId, request));
			}
			/**
			* Save the editable lobby Prompt.
			* @param strategyPrompt - replacement strategy.
			* @returns after Host settlement.
			*/
			updatePrompt(strategyPrompt) {
				return this.mutate(() => this.remote.updatePrompt(this.sessionId, strategyPrompt));
			}
			/**
			* Change readiness.
			* @param ready - requested state.
			* @returns after Host settlement.
			*/
			setReady(ready) {
				return this.mutate(() => this.remote.setReady(this.sessionId, ready));
			}
			/** Leave the current lobby. @returns after Host settlement. */
			leave() {
				return this.mutate(async () => {
					const result = await this.remote.leave(this.sessionId);
					if (!result.ok) return result;
					return {
						ok: true,
						value: void 0
					};
				}, true);
			}
			refresh() {
				if (this.refreshing !== void 0) return this.refreshing;
				const generation = this.generation;
				this.refreshing = this.remote.status(this.sessionId).then((result) => {
					if (generation !== this.generation) return;
					if (!result.ok) {
						this.publish({
							...this.store.getSnapshot(),
							status: "idle",
							error: failure(result)
						});
						return;
					}
					this.publish(result.value === void 0 ? {
						status: "idle",
						participant: void 0,
						pending: this.store.getSnapshot().pending,
						error: void 0
					} : {
						status: "room",
						participant: result.value,
						pending: this.store.getSnapshot().pending,
						error: void 0
					});
				}).catch((error) => {
					if (generation !== this.generation) return;
					this.publish({
						...this.store.getSnapshot(),
						status: "idle",
						error: messageOf(error)
					});
				}).finally(() => {
					this.refreshing = void 0;
				});
				return this.refreshing;
			}
			async mutate(operation, leave = false) {
				if (this.store.getSnapshot().pending) return;
				this.generation += 1;
				this.publish({
					...this.store.getSnapshot(),
					pending: true,
					error: void 0
				});
				try {
					const result = await operation();
					if (!result.ok) this.publish({
						...this.store.getSnapshot(),
						pending: false,
						error: failure(result)
					});
					else if (leave) this.publish({
						status: "idle",
						participant: void 0,
						pending: false,
						error: void 0
					});
					else if (result.value !== void 0) this.publish({
						status: "room",
						participant: result.value,
						pending: false,
						error: void 0
					});
				} catch (error) {
					this.publish({
						...this.store.getSnapshot(),
						pending: false,
						error: messageOf(error)
					});
				}
			}
			publish(next) {
				const fingerprint = JSON.stringify(next);
				if (fingerprint === this.fingerprint) return;
				this.fingerprint = fingerprint;
				this.store.set(next);
			}
		};
		function failure(result) {
			return `${result.error.message} (${result.error.code})`;
		}
		function messageOf(error) {
			return error instanceof Error ? error.message : String(error);
		}
		//#endregion
		//#region src/client/game-view.ts
		/**
		* Parse one public game JSON payload.
		* @param value - Host Remote game payload.
		* @returns usable DouDizhu snapshot, or undefined for absent, foreign, or malformed data.
		*/
		function doudizhuTableSnapshot(value) {
			if (!record(value) || value.game !== "doudizhu" || typeof value.status !== "string") return void 0;
			if (value.status === "failed") return typeof value.error === "string" ? value : void 0;
			if (value.status !== "running" && value.status !== "round-finished" && value.status !== "finished" || !record(value.state)) return void 0;
			const state = value.state;
			if (typeof state.version !== "number" || typeof state.phase !== "string" || !threeNumbers(state.cardCounts)) return void 0;
			if (typeof value.round !== "number" || typeof value.totalRounds !== "number" || !threeNumbers(value.totalScores)) return void 0;
			if (value.deal !== void 0 && typeof value.deal !== "number") return void 0;
			if (value.decisionSeat !== void 0 && !seat(value.decisionSeat)) return void 0;
			if (value.decisionOutcomes !== void 0 && (!Array.isArray(value.decisionOutcomes) || !value.decisionOutcomes.every(decisionOutcome))) return void 0;
			return value;
		}
		/**
		* Parse one seat-private game JSON payload.
		* @param value - Host Remote private-game payload.
		* @returns usable local private view, or undefined before the first addressed decision.
		*/
		function doudizhuPrivateSnapshot(value) {
			if (!record(value) || typeof value.version !== "number" || typeof value.phase !== "string") return void 0;
			if (!Array.isArray(value.yourCards) || !value.yourCards.every((card) => typeof card === "string")) return void 0;
			if (!threeNumbers(value.cardCounts) || !Array.isArray(value.legalActions)) return void 0;
			return value;
		}
		function record(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function threeNumbers(value) {
			return Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "number");
		}
		function seat(value) {
			return value === 0 || value === 1 || value === 2;
		}
		function decisionOutcome(value) {
			if (!record(value)) return false;
			if (typeof value.historyIndex !== "number" || typeof value.afterStateVersion !== "number" || !seat(value.seat)) return false;
			if (value.source !== "agent" && value.source !== "fallback") return false;
			if (value.fallbackReason === void 0) return true;
			return typeof value.fallbackReason === "string" && [
				"timeout",
				"disconnected",
				"invalid-response",
				"transport-error"
			].includes(value.fallbackReason);
		}
		//#endregion
		//#region src/client/card-assets.generated.ts
		/** Generated from the CC0 Kenney Playing Cards Pack. Do not edit by hand. */
		const KENNEY_CARD_IMAGES = {
			"C2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACDSURBVDjL7dMxDoAgDAVQ4x2dPYqeB4YegaO4w2xMSAQHCsOvppg4+jdeaNNAOgw9MS3lPC6Zc64FcgvDPnFmhqNe2Cp4B2AIgBASQsQePmtNBYjB7iA5DULQQJREej3HD8oTfvEvAroGi0aDbAESYYlDiFrTZB8HE0so1hQXWay6kgs3vU7JOZ5/RQAAAABJRU5ErkJggg==",
			"C3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACGSURBVDjL3ZNBCoAgEEWlO7buKHUeW3gEj9I+1xEIaZCjwfxoDFz1dz7882cWX6ka6aL07sZIOqYEYhGBrScNBPb8YclgtQxow4DhIFgJgAWGQiws9gSuoFfgnATA4s3nPVqAP90CsS1uAVC1WJgZ8JoDzy1WAmCBoRB7LwYlhJryIkPVBZ0AWU2dUS0m7QAAAABJRU5ErkJggg==",
			"C4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAAB2SURBVDjLY2AgBqyCAwifqf4/FPxtgAj8hwOowNdQKIiHCnyHKbgPE1i/nmSBVQQF/pMh8J+wAFDPL7wCv4A8oHPxCGBo+bf6//9X+0lzx6jAf/xBSIV4wRQgzmG/yBBYRVDgF8kCCIdhZEKMbIqekTGyOgEAAIAdTIrYBaS5AAAAAElFTkSuQmCC",
			"C5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACPSURBVDjLvZNBCoAwDASLf/TsU/Q99ZAn9Cne7VmEgI2C1UNXmwrFvWVIlqVljSmRvXXOTS9R23ACuRXB0kZ1EazXwnQBSxogOHHaiaim4AHBHsBhwlnAx0SUA3ASRpHZfctRBQSnAe81ACdMf0RPAD5hhX9BUBYs2AQwANE2wENYNbWvwaCEUNO0yFB1RTvVwEmhGjvOPgAAAABJRU5ErkJggg==",
			"C6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACMSURBVDjL3ZMxCoAwDEXFOzp7FD1PHHoEj+LuLkLAxoJthXxpFDr5tz5+mp/hN80bUdb1bgeJOsYLSFYEWxfVR7Anw5LAOitAGjixHOT0iLMcsBaCPYDwCRcBh1fYXQAw4ieREOZTjhrgR7fg2gq3IHgXzE8KMGnAlsNrIGw5YO0dDEoINdVFhqobOgGu9EhhuDu0BgAAAABJRU5ErkJggg==",
			"C7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACPSURBVDjLxdM7CoAwDAbg4h2dPYqepw45Qo/ibmcRAjYW+hAT6AME/60fLUkKUaolOiech5liriUA5UQ4xpgpwpkubAk01IA4OA5oOFA3UAP4ulgE9CeAEognbiXazausM6wPAdbWQDxB+GWW/k/uB1n2g1kkNDYG3eA4oOHAq6CuwdOYWEKxpnyRxapXcgMZWkiihzY6fAAAAABJRU5ErkJggg==",
			"C8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACYSURBVDjLxZNNCoAgEIWjO7buKHUeXXgEj9I+1xEMpAnaD/PCcSH0dvPhm3kDTtfVSN1KdT+FrGNOINzKYBuyxgz268FygdUyoAwDxkgWAGBRYg8I9gFiEyoCilWcXQBg8TqEGOY91luWA4BzEgALmV924WOb7MIAjm2wC4K6D+M1A6Q4IMmCPUhqCpYnGBwhnCk/ZDh1QSdTkUW+YxzMGAAAAABJRU5ErkJggg==",
			"C9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAAChSURBVDjLzZNBCsJADEWLd3Tdo+h5poscYY7ivrMWIWDSwU4r/V8aFRf+XR7JzCOQrnsnac1cH07ecj/PwNc0cD229A3clobLAsYMIAkAkahjROBhB31LYi9AfUR3gdaq6u4AGrHBvcr8gYdl8LAMHqX4dqSU7YhYBg+VDz0YhPvgFf5gH194PGIDACXgYUdCoFEHffsUoyOkM8VDplMPMgGYJ0RWbhMa2gAAAABJRU5ErkJggg==",
			"C10": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACnSURBVDjLrZPBCoMwEETFf+y5n2K/Z4Xu3YP5lN7ruRQC3a1glGZGjBXnlkd2dzJkq2qPZNF0rhtP+twm4IsSeF2Srgm85wuPGagAuEsA0J8AsCmNJWMrQN3jJojjSXULuFrISqy18AzZ2GEAHwiwh2vUv32AdWvdwUcpDy45kgdY58cV8+AIsceBPBjs+zASc2DSAehPANiUxv4YoyWkNcVFplUv6Au4bD5XFxsnhwAAAABJRU5ErkJggg==",
			"CJ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADWSURBVDjLtdMxDoMwDABA+rN+wmKieQVLJcp/QBVTJ1TxCj7RoUxeQOAWElBsF+jQesvJIQ6xg+CbgCXs+lCRi+FogZZw0GYuCgfdnNDMgGZam3WgCRD3wNtiJujDBcCIY+tUgCqMHmPhuQfNkGVV58HznZKXfsYILGP8RrkF6pSfQNV0AwPsU8OgTpKQAwAHDGu+5RbFJwb3KL4wKIhaBleA83bGP66//9f1Q6mnlI+tTqGPHeQ1nQUE0XRe46LNING4W+C2mHWQhakhVGMqB1mN+k68AKCzCN0AyL2+AAAAAElFTkSuQmCC",
			"CQ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADUSURBVDjLrdPBDoIwDABQ/DN/otlJ9xVe9X/gwMl4IIav4Kp3D3JqTCBsMhjL2ioQY297Kd3G2iRZExBiXG9K68NsR7AhPDSpj9xDOyXUE1SnYa0DgGagB0BcguiT3QCd4kWjbTmIg9mHO3gWQW3StGwjePYpWRFnOCAZrkYxB2KXnyBvKJTXoyFwQX0jcEa9pwBAAQE0gbuqXvMZfUeY+aIi4y/XZ7D81+VDiafkjy12sR87CBUHYL2OhwBo17V2BMiLjtCprwcTQyjGlA+yGPWFeAOrtAYS2UHTYAAAAABJRU5ErkJggg==",
			"CK": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADhSURBVDjLrZMxDoMwDEXpzXqJiAlyCtShA/cJQyfUgYFTIKb2AJVaJi9FkBIISRxHUFX9m5++Y4PtKPpGzGiJD7XUGo8LkEYavIXWRYN+NXQr4O0ccwtiDyRcxQAGsDwISMoQ+4+SshaQxuRDNV44oBuFqHsHvCZLUbkOBZBDvVFtAVLlF1ALMSJw7fo7AuXznGLHkGMHZAlH4BY3p20AjOGUaSNwHyVj6bbjH5/vg/2/TgdFRukPm1SRwQ1qwQONBc2yuJkBMDsGZteSBwFJcR6FcFnbGDlCcqb+IZNT39EHElcHrFg0oroAAAAASUVORK5CYII=",
			"CA": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAABsSURBVDjLY2AgBqyCAwifqf4/FPxtgAj8hwOowNdQKIiHCnyHKbgPE3i1H01g1Xo0gfUEBVatp9wMDIcNd4F/+wkJvH5NSABDy6/1IzpMQSHwi6DAKoICpJvxbzVOh2FkQoxsip6RMbI6AQAAsDpPyO2r8FAAAAAASUVORK5CYII=",
			"D2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAACNSURBVEjH7dXBCYAwDIVhwQkCnUAcQHCClOw/k70ota39pRUv+q5+mBBoMgwPZS0k/j7OlsUvMbBCzmDKkoCshk+BiqsDEQFgAEwJUA/JD1qaJICDugvUATg6uQAq+zhaAZbgJl8Y1A8+Bf53ESfso04QlmYdhKUJJRwB621SqcnCoPCo0Vmkw4qnuScb7OMwAVFV82oAAAAASUVORK5CYII=",
			"D3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAACNSURBVEjH7ZXLCYAwEEQDVrCQCsQCBCtI2P5rMhcl5vfEiBcz1zyY2V3IGPOStoLi92nRTH6NAS3oCsyZEiDz8CngxLYBEQFAAVBnOwG0wJA4Ji7qLnDOUgPOqBXAyZH1KYAWHPKDRY1bjFv89hbhP2oD4UcDQAEIs3QCaIEhcczCorDUqBapWLGae7QDEBkuNnj7vxAAAAAASUVORK5CYII=",
			"D4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAAB5SURBVEjHY2CgEjDGApDlmVVcMICTAbICFywAVYESBkBTgGGHE7oCQRdBmisQpFSBiwsdFLhQQQHUEkFcChwFRVzgFDYF0KCAUGQpIGgFQUfSI6BGFYwoBaP5Ak2BIB0UCApSqsCF5gqwBBTBSo1QtUioYiVYNVMCANYQLDititKkAAAAAElFTkSuQmCC",
			"D5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACbSURBVEjH7ZVbCoAgEEWjHQQtINrCuAHR/a+pwBDz0Qkn+ojujx8evHd0ZIbhIa0Vpfvj7AvZJQV8RWdgKpQBhYfNARHRAmxhlBbeq0NSBryoW8CRQlqACzHCUgOOQsLSBaAFhnzjot4BnAEgtk0DcLFvegG04JAfeIv/X2TA3jfXgCBAFngCZtjP0IZki6IKHGo0Fmmw4mjWaANSqCjElGioaAAAAABJRU5ErkJggg==",
			"D6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACOSURBVEjHY2CgElDCApDlmURcMICjArICFywAVYEgBkBTgGGHI7oCZ2MT/AqMCSogZAVhE4yNCVlhTKEJBL1JMKCIUgB1hTEuBVBnQChsCqAegVBkKSBoBUFH0iOgRuNiNC5GclwAnYFfAdAjBBS4GFNogjMhBS4ulJpA0JtYAopgpUaoWiRUsRKsmikBAIndKBo9k+XzAAAAAElFTkSuQmCC",
			"D7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACZSURBVEjH7ZVvCoAgDMWjGwQdILrCvIBs9z9Tkhamkwf+IYjel33wJ3Nvk01TJ+2K4vN5lUx2iwFR9ASWTAmQ5bApQESNgAgCGAFkECDDAekBhCxUAthX6oMGBLd9qAJgCvjI87oBPtxTUQCYrqbWAjAFeORnejF6aP9/8UIvaDjACHBOAABV4dxuBBSj4FJDaxEtVriaW3QAuWwn+Ngo3rMAAAAASUVORK5CYII=",
			"D8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACcSURBVEjH7ZXLCYAwEETFDgQLEFuYNCBu/zUpGkXN54nJ0bnk4JOZzEK2aSppjOj6ve0t0DRcAYvoDnSBHkDgMT2BWS4PSALAVGjBGcgCQ6IFFvUK8CmUAnyM/YgB/iL78QlACwy5/e6gh7PwBDDraPwrgBYQ8p/FP4vqs6j1gKwx8sB6EQBMhRacgSwwJFpEisKlRmuRFiuu5hItTt8mgolLiLMAAAAASUVORK5CYII=",
			"D9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACgSURBVEjH7ZXLCYAwEETFDgQLEFuYNCDZ/mtSNIiamCfGkzqXPeSxn2HDVtVD6hPavtetRRq6LWAJ7YEm0gGIagxHwMvlAUkAmAozeALMSjPgmGjUJSB0oTMgtLGEFBC8WsItAEtgkx/ywTvwYd2rE2BaPJf1YQayPkjgg3f/PrzkX6ya2sgDQoBKcAaJSqgwA46ZMAqPGp1FOqx4mks0AmuMJbZV2o9PAAAAAElFTkSuQmCC",
			"D10": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAAChSURBVEjH7ZXLDYAgEESJHZhYgLGFoQED/dckBI3KZ8cgCRfmwsGnOztsXKUaacvo+XxabKJ9fQI2ozcwJ4qApMYeA7CADBhAy4A2/QFmkrVJg/oEnDVQAkxwGY4cgGAzHFWA/7YLq1zCu/NvQ2jzjrMOYCWoyTY5iFHTyxrzMOah8Txcci4hAT5OGXA/xO4AM0nbzAZFlxpbi2yx0tX8RwdZ0CPam9Ej/wAAAABJRU5ErkJggg==",
			"DJ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOTVdmx9fs////rKJmDQAAAAF0Uk5TAEDm2GYAAADeSURBVEjH1ZVbDgMhCEUn3QEJC2i6hWEDRPa/pjKPdnREbzr2o70fxsQTEESYpi/pESg/v4lVSvccsEAlMFc6AZWPVAFE2TEBQIlrwDKAiAaByAUZuCQVUQRhulWQB5goS0eaJQZ2xrcNIO02RFoWXkDTwvsKVwEYxU8AsmRT1k0MeBko+9IE/MmVfekAq7jjwk1Qx4XXnbIXdBvQBeA2MG/V1kmUbnccsPAHzz1e1fjjwK+HPi+Kwj7oMHEjNdAnyy5I/S5HBvrkJaB0Ec4LAwBIFBxqaCyiwQpH84ieiw4Y9mWhryMAAAAASUVORK5CYII=",
			"DQ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOTVdmx9fs////rKJmDQAAAAF0Uk5TAEDm2GYAAADaSURBVEjHzZVhDsMgCIWb3YDEAyy7wryAkfufabR1qwry0rose79M+YJAEZblS3oYqu23yEr5XgNsqAWeSh2g7sg9kChUZtIAER12oTXAFSD0JGBekehEkHaaAICFkk9HmaMNFEaOAyAXHzGOPLyBoYdPCFcBmMWPAGYPkAKkkLfDAAjSS5wcgFaAPGDTGOAd4CGQmIK0ZrjuofTdRJDQw5/8bheY72r8cODTQ48XZcEnJgwZU64D9JzkZgoG8of52vvunLwEtFegIBNK0ygUXGpoLaLFClfzjF6p5RbWlK5uggAAAABJRU5ErkJggg==",
			"DK": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOTVdmx9fs////rKJmDQAAAAF0Uk5TAEDm2GYAAADkSURBVEjHzZUBCsMgDEXLbvAhBxi7wrxA0PufabHtVq3RT9sx9ilF2kc0+k2m6Ut6OCr/30JqFO8lkBzVwLPRDmjmiHsASWX7DQ/ABiikBRRFAKAFIAcAOgVdJE/TAehG2adtm4MPrIwNO0BcY4TQi/AGuhE+SzgL0Cx+AYTZu/OgA5gLUtABgKhir0GEfOaDCOYZZGd1ATUv2iPngWx3Uxrsw+K2QZqz4vkI/3DcDLjuan5x6NVjl5dlQQtIUeQkYQzAA6oqKC2gdSH1Ki0OAGwKukiaprdRtKmxtsgaK23NV/QC00gXgJPEkAQAAAAASUVORK5CYII=",
			"DA": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAAB6SURBVEjHY2CgEjDGApDlmVVcMICTAbICFywAVYESBkBTgGGHE7oCR0ER/AoEBQUJKHChWIGg4IC7gWBAjSoYegocRQgogKcrHAocBWHZg1wFBK0g7MjR2Bx+CoDlEaUKBClWQHs3AGsXkgOKYKVGqFokVLESrJopAQDZjzHMet8tHQAAAABJRU5ErkJggg==",
			"H2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAACaSURBVEjH7ZXRDYAgDERJnKBJJzAOYOIEJd1/JvmRIGBPAf+4X17ocWmpc4N0VJSeL5sW8nsKaEV3YC2UAUUNnwNCbANEBAAFgAoCkIfsghaTCIBBvQSEhU2AopVWQIjsEhof+wRcHv/LYQIT+NZyqGlh2w+YLDS8w4IKTjqB8GnaQPg0QQlGgPaaFGSyEhRcamgtosUKV3OPTlkvLmnVoAuuAAAAAElFTkSuQmCC",
			"H3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAACcSURBVEjH7ZVRCoAgEESDTrDgCaIDBJ1gY+9/pvxJTM0XadBH8+uDnRnFHYZOWguKz8fZMm1LDFhBZ2DKlADZjC0FVFwdEBEADABT1wjgCDSJMbGom4C6I8wFIMHrU0BF6iMstHEFhMJf6+ELwH8XHwIwJhWFVXe4TXow3Yry/1Ed8FYBMAB8lEYAR6BJjFkoCpcarUVarLiaW7QDCwor0sbmRkgAAAAASUVORK5CYII=",
			"H4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACMSURBVEjH7ZVRCoAgEESlGwQdILrCdgFx7n+mCrcwXVhq1S/nZz58Ig67jHOVtAlKz6cFhfyaAhD0BuZCGVC84XOAQM0BsgJABwB2gKOIJgDh/On+2B8AnFU0CQjXzdvEX3AS1C6HAQzg08ipQ6uNfY3NUpa3alDUASCyAmgOCEGppabVolasajVbdAC3vSkIC/HuBQAAAABJRU5ErkJggg==",
			"H5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACwSURBVEjH3ZXRCYAwDETFDQQHEFdIF5Bk/5kUU0u10RNTQbyffPTRXNKUNE0ljYby87aXQtOQA2JoD3SFDkCRYzoCROQFcIrgTCHiNok8wEbdAUh9ajAAptVHDE8AiZVqsADWSjWYVcRW0Xt9+AjAgcMlQGlungKcBuvMZJrMM2Dz+Oe3QCMHhxaNfY2fBT5v1UYtPq4BggBKAW+AHpY7vCZxiqIKuNTQWkSLFa5mj2bLTSdw/ZNoeAAAAABJRU5ErkJggg==",
			"H6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACfSURBVEjH7ZXBCYAwDEXFDQQHEFeIC0iz/0yKzUHb0Ce2ggf/JYc+kv7fQrqukWZH5/N+1EzrdAbU0RUYMiVANmNNgSBLGRAEaAR3EKERUtkBbWJQdwC7ZywOEOTIwsoTQM1pLB5gTmNxXVhU8l4OXwD+t/gQQDYxKIq6xWvCh2ka1O60DOz3BEClskMgQLW2A9p0gsKlRmuRFiuu5hpt3TYmgs6VTdYAAAAASUVORK5CYII=",
			"H7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAACtSURBVEjH3ZVBCoQwDEVlbiB4gMEr/F5AkvufaQrRUm2mH2zrwr/Jwgc1L4FMU6esTvLvn0WLbN8cUCdnYC5yAYo3tisAoBFQZYAwAIEBOhzQDgDsGSsOIFFmSOUOoPs4rHiAmEwrbhe7ClTalCCh6gFpLe4CAtSf0LR4/4DjH989i9FL+wTA2qSimOoe0yQL01cUhgPCgCiCAKyLKLMRcETRo8bOIjus9DS35AeyaSYcpGuQuAAAAABJRU5ErkJggg==",
			"H8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAAC8SURBVEjH3ZXBCcMwDEVDNyhkgNIV5AWCtP9MNdg1aazohdin6qJDHvyvLxMty6R6O7X//litq+21B8ypX+DZ1QHoNLYjoJJiQEQAMBmUYA8kgSZRAoO6AlSfpTmAZp+ptTuA1UlL84A6aWnuFDUqCcbUpCnMQVridwEViSWs7fQM+Hr8713EY14JCqOesM34wdCYGBRFPWOb8GBs5g8kTxoD2ScAJoMS7IEk0CRKOEHhUaOzSIcVT/NIfQBw/CRiWNJhagAAAABJRU5ErkJggg==",
			"H9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAAC2SURBVEjH7ZXdCcMwDIRDNwh0gNIVzgsEa/+ZGmFhElvoip0+FHIvevCHfk4GLctFejs6vj+e0ml7HQFxdAbWTg3Q1dhaICPFAAACCCYzZAaIzGagY1KjvgHMihIcYG9T+7AwAoiZWYIH2KQluFOYVbh9yCmn0AfUvzsGQEcISmh3QNCkptce8UMnybIu+A/0y9FlsXX/iQ9V+6QxAAqwEjwDwEpgMgMd0zGKHjV2Ftlhpad5Rh+LbSNS/EijkQAAAABJRU5ErkJggg==",
			"H10": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAAx9fsTVdm9SxO////wsviNgAAAAF0Uk5TAEDm2GYAAADKSURBVEjHxZXdDYRACITNdXCJBVxsgW3ALP3XdODP6rnAGG+N88KDY4DPMXRdIw2G9s9fPVcaP3sDG/o1vCsdDFWP8WggJooNmSjFhpSfN6Ah0ZoQ1BmDdOFSDINMqWMu5YpB1phbkNNC3k1KK088zC2UBS2jOmsSrbgcw8bb4zB1iDjojPdy4FIcDlzKPXmALeCQaM1ziYpQw4+FPzcODIocDG0bDnGiwM/bIg+rlEVkUN6xQWg9bkBDwjVNUPCoobOIDis8zf/oC2V1ITL9H2ZqAAAAAElFTkSuQmCC",
			"HJ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOTVdmx9fs////rKJmDQAAAAF0Uk5TAEDm2GYAAADvSURBVEjH1ZXRDcMwCESjboDEAFVXiBdAZv+ZipM0pTXmlKYf7X1Z8hPYGB/T9CXdAvn9S9FO9eoBDfQKzJ3egC5H7QCifVNYOAXI1AN6ABAiToGWrgPIA8IB4A4ZXlOIQR1gobQ+y1xiYGNsOQDqFqOUUYQHMIywH+FTAN7iJ4DSqlmWRQxYS1gnkA4Be3JraOIEWMRJCgtBSQrrO2Hr+DEgDeAxMK/dlhRK1jOeiPAHz32+q/HHgV8PfV50Cz3gMBLaoHobDIxUnImZJ6Ze3SwzsEHngxFA3kkxEHh1GyIpgAoFhxoai2iwwtF8Rnf3/xdeDK+deAAAAABJRU5ErkJggg==",
			"HQ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAATVdm9SxOx9fs////oR1HPAAAAAF0Uk5TAEDm2GYAAADmSURBVEjHzZXrDcIwDIRhA1jB8gZkAsf7z0QCpU3rx6ktQtyvqPnkOo5zvly+pLujcf9a1KjeRkAdrYGH0QYw/6hbQIjnTWFhAxDRDLQ1WUB3AELEKdBC2CRJBkBY0ySDYwIAFqp9WspcfGBi2jIA6hSjlCjCBwgjzCkcBeApfgSoZkArQG/GGgPcW0USgDpAGfBSDOgb0BAQJW6tyccjTH13IkkY4U+uOwXOdzV+OPDpoceLTqE7HMazwQ1gjbRb3wKwA4wu13vfsUFOAVrZPQScJPsQGeyedxcKDjU0FtFghaP5jJ4twxXGqamrjgAAAABJRU5ErkJggg==",
			"HK": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAATVdm9SxOx9fs////oR1HPAAAAAF0Uk5TAEDm2GYAAADwSURBVEjHzZUNDoMgDIXdDbYrNNxgnKD0/mdaIagIpW/RxawxBuXLg0J/luVH9jKsnX9EGSw9W0AMOwLvwTpgWCP1AAmHdZIDBwOgDSC1EWASH9gFhPXDBVRC3CXyft1NQjdNAB6U/tqPOdpAZXQ4AVLViHGmsAJThW0LZwHoxR1ALLFbBhNAw0QiOwAlDvpyFPKdOwoaM5QjawowU9AnnAdKQpCzRI07z81i6bzCP1w3Aq5HNU4cmHooeZEXsIAcahj5AFlAW8M0eEeA2jpplGLuarFRihsJa4kWMDeZm8jXbloHBZsaaouoscLWfMU+Dg8WPUFuUdAAAAAASUVORK5CYII=",
			"HA": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOx9fsTVdm////rK0NyQAAAAF0Uk5TAEDm2GYAAAB/SURBVEjHY2CgEjDGApDlmVVcMICTAbICFywAVYESBkBTgGGHE7oCR0ER/AoEBQUJKHChWIGg4IC7gWBAjSoYcgocRRxF8CoQhCcschU4Cgrit8IFnnRxKYC5cTQ2R5ACYHlEqQJBihXQ3g3A2oXkgCJYqRGqFglVrASrZkoAAGhDMQBKjXZWAAAAAElFTkSuQmCC",
			"S2": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACFSURBVDjL5dMxDoAgDAVQ4h2dPYqeBwaOwFHc2Y1JE4sDheFXU+Lq33iRnwZT50bie+p5Wovk2iqUHoFjliwCZ/tgb5ATgI8AEYERCDtysUoVqMGegBMARYAcLLA7Pgz2c1BPqB7Z/i92x9Bg5C0oAYAjXkkIZJVyeB1MLaFaU1xktepGbrqaTZ1wlG+6AAAAAElFTkSuQmCC",
			"S3": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACHSURBVDjL5ZM7DoAgEESJd7T2KHoeKDgCR7GnNyYkgol8NDMmS2ydjhd2drYYpXqkm/J7mFPRsWSQmgrYxqKpgL1+WCvwDoC2ACyC6CRAI2RKaynYG7gWPUGwALyRgOzxIdjPb6G1FEy+RfboChYNgKARBBxxEqARMqW1dzAqIdUUi0xVF3QCQq5L2zH+jJcAAAAASUVORK5CYII=",
			"S4": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAAB9SURBVDjLY2AgBqyCAwifqf4/FPxtgAj8hwOowNdQKIiHCnyHKbgPE1i/nmSBVQQF/pMh8J+wAFDPL2SBf6v//3+1H0ng16r//4GOwSNA2Iz/ZDhsZAtgBiF6IBOOF8JmEOmwX2QIrCIo8ItkAYTDMDIhRjZFz8gYWZ0AAABDvkqMFl4SYwAAAABJRU5ErkJggg==",
			"S5": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACWSURBVDjLvZNBDoMwDAQRf+y5T6HvMYc8IU/hzh0hWWq2SASEvKWLOHRvGdmbjSM3zRXZrvXcdqh6v1aAXRVMj6pnBfNWMGzAkgKJWrJqgTQlDwr2BSwmfgSlB8Z8AG7ActUPoD1wI9gdUHIAngIYewW0xz/ewiOMQ9b/oj0uBisWgBOAqiAPuDS102C0hLSmcZFp1YU+WNlHDb3GOhMAAAAASUVORK5CYII=",
			"S6": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACNSURBVDjL5ZO7DYAwDEQRO1IzCszjFBmBUejpEZIlckSK+chGGNFyXZ4u9rm4qnojOlTedQfR2heAQwLmRtQKWHbDuINpUIA0iPAcFPWX6DnMWhPsBuQhfAUpAHnQCZiAvOoB+DPwIdi/b7FrdTD/Fn/Gy2ApKMCkAXuOpAHYc5i1ZzBTQlNTXWRTdUcbS+5FZM73JRsAAAAASUVORK5CYII=",
			"S7": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACQSURBVDjLvdNBCoAgEAXQ6I6tO0qdxxYewaO0bx/BQP4EteILjW76Ox8yMwrTdTUxd+K5n5ByzhFwJ8E+pIwJjnxhzWCsBmDwDOIY0AyogNBX3uAXYHMvEAOE+T9ArwF4R3OIJdgWDdQaP72l/ZPboWzLg+lv0WvUDmabwTOIY+AuYjR4BiuWsFhTXuRi1ZVcOflFD2qyySgAAAAASUVORK5CYII=",
			"S8": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACdSURBVDjLvZNBDoMwEANR/9hzn0LfsznkCTyFO/cKaSXiRiJAtUY1J3zLKOt4pbjrrsh2redHj6blvQLsauDzbHo1MG8Xxg1MQwCWA8hZjRCgEZMeFOwEVBP/BSUB1egAbkB96g/QHkAZQg7PAUxJAelx0y4UnYLpXZQHPxuD6V20B659mJICcIvA1Qh7uDKlkSMYlZBqGotMVRf6AnNoQZWPRAxEAAAAAElFTkSuQmCC",
			"S9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACkSURBVDjLxZPBCgIxDEQX/9Gzn6Lfkx7yCf0U772LELBjcbu7diIbD4Jz62M6nQYyTd9IVs3nwxldj8sMsKqD27Hr1MF9MVwXUDIBUQKqkaMwQOhwz7piH0ALsXdQE9CCNmACtHY7IM74W4+aqYcp9SgJ45WSxita8xBqYrrfw3+fi8XziDPiefyix0s1ETAHEDqEgUUO9+xWzC2hW1NeZLfqgZ7oyD/ES+SYngAAAABJRU5ErkJggg==",
			"S10": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAACgSURBVDjLrZMxCoAwDEXFOzp7FD1PBLM72KO4u4tQsFGwSv0R08G/+dDXn2KKIid053wuG4nZ2hPInQiWKqaOYL1emC7ABKAnB2D8AaBUHauKvQAW8SkIncjsEuAPK/EXEA4OHJ4fjkPZQQ8EpiOnhzWLfR/6E5TaPfT4OJx9H7Yjp4c1i+T9MOSfINAAYPwBoFQdmxRTS6jWFBdZrbqRHcKLOS+Wz8APAAAAAElFTkSuQmCC",
			"SJ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADYSURBVDjLtZNBDoJADEXxZl6iYYU9BRsT5D4Qw8oVMZyCS7iQ1WwgUIUZcNoquNC/m5dPp0N/g+AbwSJ73lXkNOwtoEUOtJlT4UA3G5oZGJzOKEAfLoAmYGALeDVQ1gAU19apAKoxuo2N5x5ohiyrOg/cn5a89B0jYI6xRrkG1C0/AVXTDQyYPkUG6iQJOQDgwIQ1/+QSxQcGrlF8YqAgahk4AxzXHf94/vZf14NSo5TDVrfQ2wT5wSWRUxs6Y15Ztw4SOV0DrgbKGvixMbWEak3lIqtV39ADmwAG3+XBufMAAAAASUVORK5CYII=",
			"SQ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADYSURBVDjLrZMxDsIwDEXLzbiElQlyCla4Tzt0QgwV6im6ws5AJwupVZM2TRolNqQI8Tc/fX2ntZ1l3wi8bL2ptZPaWqC9HOhyp9KBfjG0C2hOcy09AGnqQXggZ4CwBoKMHc2woWFbCtjD9MM8vAhAq/K87gPwnCxFFToMiBwmo0oB1uUnUHYxqK9HFYELylsEzij3MQCIAQLICNxF80o7po1Q6VDm+MvnE7D+1/mg2CjpsFkX/XaDUFAAZNfx4AFaB5I9TQGXASRjEB8fxo6QnSk9ZHbqKxoBpgEEFF80WoIAAAAASUVORK5CYII=",
			"SK": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAADnSURBVDjLrZM9DoMwDIXpzXqJiAlyCtShA/cJQyfUgYFTIKb2AJVapixFkBISgh1HUFV9Wz49/4DtKPpGzMm8D7WyGo8GKCcL3sLqYkG/GLoF8HZ+8xXE+j3EDiRcA8kcYHkQgBwmBOQwSWnZFZDG1EM3XgDQjULUPQCvyVJU0KEBcugc1RYgVX4BtRAjAteuvyNQPs8pdgw5dsgs4Qjc4ua0DSRjOGTaCNxHyVi67fjH5/tg/6/TQZFR+sMmVVRwg1rpgWYFjVnczAE5OwawyTwIQIjJAZLKcNm1MXKE5Ez9QyanvqMPDKQFrrT+yZsAAAAASUVORK5CYII=",
			"SA": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAAx9fsTVdm////BpFu1QAAAAF0Uk5TAEDm2GYAAABtSURBVDjLY2AgBqyCAwifqf4/FPxtgAj8hwOowNdQKIiHCnyHKbgPE3i1H01g1Xo0gfUEBVatp9wMDIcNd4F/+9EEfq1HE3i1mpAAYTNGXCD/+kVQYBVBAdLN+Lcap8MwMiFGNkXPyBhZnQAAAG+yTzINZpkZAAAAAElFTkSuQmCC",
			"joker-small": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdmx9fs////Bp4FEQAAAAF0Uk5TAEDm2GYAAAC+SURBVDjLtdMxDoMwDAVQerNewmKinII590kGpk4MOQWXCFKZWECJ24gAia02RWr/xpNFHIyL4pvAnvX5ojHEXVfAPQFmGdIGWLaCcYNJ5MCeh4oCUOhpH6wxNL5xFcHopNRLBI9XieriCg9JhX9H9wnYKT8BPbcugbuwtxgGW/ZiiKECaBKoAaYEEABjMArAJKcoRALZin9cP//V+aDYKOmw2Slv/qCSgAUKDQVxHuocHI2xJWRrSheZrXomT7qCD8zzWH6oAAAAAElFTkSuQmCC",
			"joker-big": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABABAMAAABYR2ztAAAABGdBTUEAALGPC/xhBQAAAA9QTFRFAAAA9SxOTVdmx9fs////rKJmDQAAAAF0Uk5TAEDm2GYAAADESURBVEjH1dULCsIwDAbg4Q0COYB4BXuBktz/TKZubtMm/dE40DBGYR99pOk6TV+KixP776eiXch5D9SJZ3Dt4gV0Y0gHiLOgHg4IAjTJSigPMFEqW5qLDxZjzQDI0kcpUQ8PEPawTuFTAFfxE8BeVs1zwwdtyyuFwKqK2J7W8gFVsmCKgTagMdAZhEPY8hqQQR7uhTcE6R7+YLvzVY0PDjx66PCiVbz1hyEeA6tNABgCPRxQFjiJgpcauhbRxQqv5kzcAIyzHs4QE0aKAAAAAElFTkSuQmCC"
		};
		//#endregion
		//#region src/client/table-motion.ts
		/** Snapshot-diffed motion events for the DouDizhu table. */
		const MAX_QUEUED_ACTIONS = 4;
		const MAX_QUEUED_EVENTS = 12;
		/**
		* Derive presentation events from two committed snapshots.
		* Replaced/non-prefix histories are treated as hydration, never replayed.
		*
		* @param previous - Previously committed playable snapshot.
		* @param current - Newly committed playable snapshot.
		* @returns Presentation events needed to animate the transition.
		*/
		function diffTableMotion(previous, current) {
			const events = [];
			const previousDeal = motionMetadata(previous).deal ?? 1;
			const currentDeal = motionMetadata(current).deal ?? 1;
			const dealChanged = current.round !== previous.round || currentDeal !== previousDeal;
			if (dealChanged) events.push({
				key: `${current.round}:${currentDeal}:deal`,
				kind: "deal"
			});
			const previousHistory = dealChanged ? [] : previous.state.history;
			const currentHistory = current.state.history;
			if (previousHistory.every((entry, index) => historyEntrySignature(entry) === historyEntrySignature(currentHistory[index]))) for (let index = previousHistory.length; index < currentHistory.length; index += 1) {
				const entry = currentHistory[index];
				if (entry === void 0) continue;
				const key = historyMotionKey(current, entry, index);
				if ("score" in entry) continue;
				if ("pass" in entry) {
					events.push({
						key,
						kind: "pass",
						seat: entry.seat
					});
					if (isSecondPass(currentHistory, index)) events.push({
						key: `${key}:reset`,
						kind: "trick-reset"
					});
					continue;
				}
				events.push({
					key,
					kind: "play",
					seat: entry.seat,
					cards: entry.combination.cards
				});
				if (entry.combination.kind === "bomb" || entry.combination.kind === "rocket") events.push({
					key: `${key}:impact`,
					kind: "impact",
					impact: entry.combination.kind
				});
			}
			if (previous.status !== current.status && (current.status === "round-finished" || current.status === "finished")) {
				const result = current.roundResults.at(-1);
				events.push({
					key: `${current.round}:${currentDeal}:settlement:${current.status}`,
					kind: "settlement",
					final: current.status === "finished",
					round: current.round,
					...result === void 0 ? {} : { result }
				});
			}
			return events;
		}
		/**
		* Stable identity for recent-action rows, including repeated identical actions.
		*
		* @param history - Public action history containing the row.
		* @param index - Zero-based index of the row to identify.
		* @returns A signature with an occurrence suffix unique within the history.
		*/
		function historyEntryKey(history, index) {
			const entry = history[index];
			if (entry === void 0) return `missing:${index}`;
			const signature = historyEntrySignature(entry);
			let occurrence = 0;
			for (let cursor = 0; cursor <= index; cursor += 1) {
				const candidate = history[cursor];
				if (candidate !== void 0 && historyEntrySignature(candidate) === signature) occurrence += 1;
			}
			return `${signature}:${occurrence}`;
		}
		/**
		* Keep at most four logical actions; beyond that, hydrate instead of playing catch-up.
		*
		* @param queued - Presentation events already waiting to run.
		* @param incoming - Newly derived presentation events.
		* @returns The bounded event queue, or only the latest settlement when overloaded.
		*/
		function appendMotionEvents(queued, incoming) {
			const combined = [...queued, ...incoming];
			if (new Set(combined.map(motionEventGroupKey)).size > MAX_QUEUED_ACTIONS) return combined.filter((event) => event.kind === "settlement").slice(-1);
			return combined.slice(0, MAX_QUEUED_EVENTS);
		}
		/**
		* Run committed events one at a time and flush all animation work while hidden.
		*
		* @param snapshot - Latest table snapshot, when one has been received.
		* @param roomPhase - Current room lifecycle phase used to detect the initial deal.
		* @returns Current motion presentation state for the table renderer.
		*/
		function useTableMotion(snapshot, roomPhase) {
			const reducedMotion = usePrefersReducedMotion();
			const previous = (0, react.useRef)(void 0);
			const observedPreGame = (0, react.useRef)(false);
			const [queue, setQueue] = (0, react.useState)([]);
			const running = snapshot?.status === "failed" ? void 0 : snapshot;
			const finalSettlement = running?.status === "finished" ? settlementEvent(running, true) : void 0;
			(0, react.useEffect)(() => {
				if (roomPhase === "lobby" || roomPhase === "locked") observedPreGame.current = true;
				if (running === void 0) {
					previous.current = void 0;
					setQueue([]);
					return;
				}
				if (reducedMotion || document.visibilityState === "hidden") {
					previous.current = running;
					observedPreGame.current = false;
					setQueue([]);
					return;
				}
				const prior = previous.current;
				previous.current = running;
				if (prior === void 0) {
					if (observedPreGame.current && roomPhase === "running" && running.status === "running") {
						const deal = motionMetadata(running).deal ?? 1;
						setQueue([{
							key: `${running.round}:${deal}:deal`,
							kind: "deal"
						}]);
					}
					observedPreGame.current = false;
					return;
				}
				const next = diffTableMotion(prior, running);
				if (running.status === "finished") {
					setQueue([]);
					return;
				}
				if (running.status === "round-finished") {
					const settlement = next.find((candidate) => candidate.kind === "settlement");
					setQueue(settlement === void 0 ? [] : [settlement]);
					return;
				}
				if (next.length > 0) setQueue((current) => appendMotionEvents(current, next));
			}, [
				reducedMotion,
				roomPhase,
				running
			]);
			const event = queue[0];
			(0, react.useEffect)(() => {
				if (event === void 0) return;
				const timeout = window.setTimeout(() => {
					setQueue((current) => current[0]?.key === event.key ? current.slice(1) : current);
				}, eventDuration(event));
				return () => {
					window.clearTimeout(timeout);
				};
			}, [event]);
			(0, react.useEffect)(() => {
				const flush = () => {
					if (document.visibilityState === "hidden") setQueue([]);
				};
				document.addEventListener("visibilitychange", flush);
				return () => {
					document.removeEventListener("visibilitychange", flush);
				};
			}, []);
			return {
				event,
				finalSettlement,
				hideLastPlay: running !== void 0 && queue.some((candidate) => candidate.kind === "play" && samePlay(candidate, running.state.lastPlay)),
				reducedMotion
			};
		}
		function usePrefersReducedMotion() {
			const [reduced, setReduced] = (0, react.useState)(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
			(0, react.useEffect)(() => {
				if (typeof window.matchMedia !== "function") return;
				const query = window.matchMedia("(prefers-reduced-motion: reduce)");
				const update = () => {
					setReduced(query.matches);
				};
				query.addEventListener("change", update);
				return () => {
					query.removeEventListener("change", update);
				};
			}, []);
			return reduced;
		}
		function historyMotionKey(snapshot, entry, index) {
			const metadata = motionMetadata(snapshot);
			const version = (metadata.decisionOutcomes?.find((candidate) => candidate.historyIndex === index))?.afterStateVersion ?? snapshot.state.version;
			return `${snapshot.round}:${metadata.deal ?? 1}:${version}:${index}:${historyEntrySignature(entry)}`;
		}
		function motionMetadata(snapshot) {
			return snapshot;
		}
		function historyEntrySignature(entry) {
			if (entry === void 0) return "missing";
			if ("score" in entry) return `bid:${entry.seat}:${entry.score}`;
			if ("pass" in entry) return `pass:${entry.seat}`;
			return `play:${entry.seat}:${entry.combination.kind}:${entry.combination.cards.join(",")}`;
		}
		function isSecondPass(history, index) {
			const previous = history[index - 1];
			return previous !== void 0 && "pass" in previous;
		}
		function eventDuration(event) {
			switch (event.kind) {
				case "deal": return 1050;
				case "play": return 480;
				case "pass": return 420;
				case "trick-reset": return 360;
				case "impact": return 620;
				case "settlement": return 2e3;
				default: return 0;
			}
		}
		function motionEventGroupKey(event) {
			return event.key.replace(/:(?:reset|impact)$/u, "");
		}
		function settlementEvent(snapshot, final) {
			const deal = motionMetadata(snapshot).deal ?? 1;
			const result = snapshot.roundResults.at(-1);
			return {
				key: `${snapshot.round}:${deal}:settlement:${final ? "finished" : "round-finished"}`,
				kind: "settlement",
				final,
				round: snapshot.round,
				...result === void 0 ? {} : { result }
			};
		}
		function samePlay(event, play) {
			return play !== void 0 && event.seat === play.seat && event.cards.length === play.combination.cards.length && event.cards.every((card, index) => card === play.combination.cards[index]);
		}
		//#endregion
		//#region \0dsh-doudizhu-css:/Users/zhou/Code/dsh/dsh-doudizhu/src/client/LanGameTable.module.css.mjs
		const css = ".RRsvha_loading,.RRsvha_setup,.RRsvha_room{box-sizing:border-box;width:100%;min-height:100%;color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}.RRsvha_loading{color:var(--dsw-alias-label-tertiary);place-items:center;display:grid}.RRsvha_setup{background:radial-gradient(circle at 50% 10%, color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent), transparent 55%), var(--dsw-alias-bg-base);place-items:center;padding:32px;display:grid;overflow:visible}.RRsvha_setupCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:min(680px,100%);box-shadow:var(--dsw-shadow-lv2);border-radius:20px;padding:28px}.RRsvha_setupCard h2{margin:8px 0;font-size:28px;line-height:36px}.RRsvha_setupCard>p{color:var(--dsw-alias-label-secondary);margin:0 0 24px;line-height:24px}.RRsvha_eyebrow{color:var(--dsw-alias-state-success-primary);letter-spacing:.12em;font-size:11px;font-weight:700}.RRsvha_field{min-width:0;color:var(--dsw-alias-label-secondary);gap:7px;margin-bottom:14px;font-size:12px;font-weight:600;display:grid}.RRsvha_field input,.RRsvha_field textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);font:inherit;border-radius:10px;outline:none;font-weight:400}.RRsvha_field input{height:42px;padding:0 12px}.RRsvha_field textarea{resize:vertical;min-height:92px;padding:11px 12px;line-height:20px}.RRsvha_field input:focus,.RRsvha_field textarea:focus{border-color:var(--dsw-alias-button-info-fill);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-button-info-fill) 18%, transparent)}.RRsvha_field textarea:disabled{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-module-platform)}.RRsvha_joinGrid{grid-template-columns:minmax(0,2fr) minmax(130px,1fr);gap:12px;display:grid}.RRsvha_divider{color:var(--dsw-alias-label-caption);align-items:center;gap:12px;margin:18px 0;font-size:12px;display:flex}.RRsvha_divider:before,.RRsvha_divider:after{content:\"\";background:var(--dsw-alias-border-l2);flex:1;height:1px}.RRsvha_primaryButton,.RRsvha_secondaryButton,.RRsvha_ghostButton{min-height:40px;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:10px;padding:0 18px;font-size:13px;font-weight:650}.RRsvha_primaryButton{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}.RRsvha_secondaryButton{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-button-elevated-fill);color:var(--dsw-alias-label-primary)}.RRsvha_ghostButton{color:var(--dsw-alias-label-secondary);background:0 0}.RRsvha_primaryButton:disabled,.RRsvha_secondaryButton:disabled,.RRsvha_ghostButton:disabled{cursor:default;opacity:.45}.RRsvha_room{background:radial-gradient(circle at 50% 32%, color-mix(in srgb, var(--dsw-alias-state-success-primary) 24%, transparent), transparent 54%), color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, var(--dsw-alias-bg-base));grid-template-rows:auto minmax(600px,1fr) auto;gap:12px;padding:18px 20px 20px;display:grid;overflow:visible}.RRsvha_roomHeader{justify-content:space-between;align-items:center;gap:16px;display:flex}.RRsvha_roomHeader>div:first-child{gap:4px;display:grid}.RRsvha_roomHeader strong{font-size:18px;line-height:26px}.RRsvha_roomCode{justify-items:end;display:grid}.RRsvha_roomCode span{color:var(--dsw-alias-label-tertiary);font-size:11px}.RRsvha_roomCode b{letter-spacing:.14em;font-size:22px}.RRsvha_table{border:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 28%, var(--dsw-alias-border-l2));background:radial-gradient(ellipse at 50% 42%, color-mix(in srgb, var(--dsw-alias-state-success-primary) 24%, var(--dsw-alias-bg-layer-1)), transparent 66%), linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-success-primary) 17%, var(--dsw-alias-bg-layer-2)), color-mix(in srgb, var(--dsw-alias-state-success-primary) 9%, var(--dsw-alias-bg-layer-1)));min-height:600px;box-shadow:inset 0 1px #ffffff42, inset 0 -40px 100px color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent), var(--dsw-shadow-lv2);border-radius:34px;position:relative;overflow:hidden}.RRsvha_tableHud{width:min(320px,100% - 280px);color:color-mix(in srgb, var(--dsw-alias-label-primary) 72%, transparent);text-align:center;place-items:center;display:grid;position:absolute;top:28px;left:50%;translate:-50%}.RRsvha_tableHud>span:first-child{letter-spacing:.3em;font-size:11px}.RRsvha_tableHud b{margin:2px 0 4px;font-size:24px;line-height:30px}.RRsvha_tableHud small{color:var(--dsw-alias-label-secondary);line-height:18px}.RRsvha_playRail{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 84%, transparent);width:min(680px,100% - 320px);min-height:164px;box-shadow:0 14px 42px color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);backdrop-filter:blur(18px)saturate(1.12);border-radius:18px;grid-template-columns:1fr;gap:16px;padding:18px 22px 14px;display:grid;position:absolute;top:190px;left:50%;translate:-50%}.RRsvha_bottomCards{z-index:2;position:absolute;top:24px;right:30px}.RRsvha_recentActions{border-top:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent);grid-column:1/-1;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:10px;padding-top:9px;display:grid}.RRsvha_recentActions>span{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:10px;font-weight:650}.RRsvha_recentActions ol{gap:6px;min-width:0;margin:0;padding:0;list-style:none;display:flex;overflow:hidden}.RRsvha_recentActions li{background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 80%, transparent);min-width:0;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;border-radius:999px;padding:3px 7px;font-size:10px;overflow:hidden}.RRsvha_recentActions em{color:var(--dsw-alias-state-success-primary);margin-right:5px;font-style:normal;font-weight:700}.RRsvha_recentActions b{color:var(--dsw-alias-state-warn-label);margin-right:5px;font-size:9px;font-weight:700}.RRsvha_seat{text-align:center;justify-items:center;gap:4px;min-width:108px;display:grid;position:absolute}.RRsvha_left{top:190px;left:6%}.RRsvha_right{top:190px;right:6%}.RRsvha_bottom{min-width:0;position:static}.RRsvha_left,.RRsvha_right{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 38%, transparent);border-radius:18px;padding:10px 12px}.RRsvha_left .RRsvha_cardFan,.RRsvha_right .RRsvha_cardFan{order:-1;margin:0 0 5px}.RRsvha_left .RRsvha_avatar,.RRsvha_right .RRsvha_avatar{margin-bottom:0}.RRsvha_seatCopy{justify-items:center;gap:1px;min-width:0;display:grid}.RRsvha_activeSeat .RRsvha_avatar{border-color:var(--dsw-alias-button-info-fill);box-shadow:0 0 0 4px color-mix(in srgb, var(--dsw-alias-button-info-fill) 18%, transparent);animation:1.6s ease-in-out infinite RRsvha_active-seat-breathe}.RRsvha_turnBadge{background:var(--dsw-alias-button-info-fill);color:var(--dsw-alias-label-primary-foreground);border-radius:999px;padding:2px 7px;font-size:10px;font-weight:700}.RRsvha_avatar{border:2px solid color-mix(in srgb, var(--dsw-alias-label-primary) 34%, transparent);background:var(--dsw-alias-bg-layer-2);border-radius:50%;place-items:center;width:40px;height:40px;margin-bottom:3px;font-weight:700;display:grid}.RRsvha_seat strong{font-size:13px;line-height:18px}.RRsvha_seat small{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:16px}.RRsvha_seatCopy strong{text-overflow:ellipsis;white-space:nowrap;max-width:116px;overflow:hidden}.RRsvha_offlineSeat .RRsvha_avatar,.RRsvha_offlineSeat .RRsvha_cardFan{filter:grayscale();opacity:.46}.RRsvha_offlineSeat small{color:var(--dsw-alias-state-error-primary);font-weight:700}.RRsvha_cardFan{width:48px;height:30px;margin-top:7px;position:relative}.RRsvha_cardFan img{width:46px;height:46px;image-rendering:pixelated;transform-origin:bottom;position:absolute;bottom:0;left:1px}.RRsvha_cardFan img:nth-child(n+2){display:none}.RRsvha_tableHud em{color:var(--dsw-alias-state-warn-label);margin-top:4px;font-size:12px;font-style:normal;font-weight:700}.RRsvha_matchRound,.RRsvha_totalScore{color:var(--dsw-alias-label-secondary);margin-top:3px;font-size:10px;line-height:14px}.RRsvha_matchRound{color:var(--dsw-alias-label-primary);font-weight:700}.RRsvha_localPlayerArea{z-index:5;box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 82%, transparent);width:fit-content;min-width:280px;max-width:calc(100% - 48px);box-shadow:0 18px 48px color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);backdrop-filter:blur(20px)saturate(1.14);border-radius:22px;gap:8px;padding:10px 18px 14px;display:grid;position:absolute;bottom:18px;left:50%;translate:-50%}.RRsvha_localPlayerArea .RRsvha_bottom{text-align:left;justify-content:flex-end;justify-self:end;align-items:center;gap:10px;padding-right:10px;display:flex}.RRsvha_localPlayerArea .RRsvha_bottom .RRsvha_avatar{flex:none;width:34px;height:34px;margin:0}.RRsvha_localPlayerArea .RRsvha_bottom .RRsvha_seatCopy{justify-items:start}.RRsvha_localPlayerArea .RRsvha_bottom .RRsvha_cardFan{display:none}.RRsvha_localPlayerArea:not(:has(.RRsvha_hand)){width:auto;min-width:176px;padding:10px 18px}.RRsvha_hand{grid-row:1;min-width:0;position:static}.RRsvha_localPlayerArea .RRsvha_bottom{grid-row:2}.RRsvha_localPlayerArea .RRsvha_hand .RRsvha_cardRow>span{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.RRsvha_cardRow{justify-items:center;gap:5px;display:grid}.RRsvha_cardRow>span{color:var(--dsw-alias-label-secondary);font-size:10px;font-weight:650}.RRsvha_cardRow>div{justify-content:center;min-width:0;display:flex}.RRsvha_cardRow i{box-sizing:border-box;width:42px;height:64px;margin-left:-10px;font-style:normal;display:block}.RRsvha_cardRow i:first-child{margin-left:0}.RRsvha_cardRow img{width:64px;height:64px;image-rendering:pixelated;display:block}.RRsvha_compactCards{margin:0}.RRsvha_compactCards i{width:32px;height:48px;margin-left:-8px}.RRsvha_compactCards img{width:48px;height:48px}.RRsvha_controlPanel{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent);border-radius:14px;grid-template-columns:minmax(220px,1fr) auto;gap:12px 18px;padding:16px;display:grid}.RRsvha_controlPanel .RRsvha_field{margin:0}.RRsvha_lockedStrategy{min-width:0;color:var(--dsw-alias-label-secondary);align-self:center;font-size:12px}.RRsvha_lockedStrategy summary{cursor:pointer;width:fit-content;font-weight:650}.RRsvha_lockedStrategy p{color:var(--dsw-alias-label-tertiary);margin:8px 0 0;line-height:18px}.RRsvha_share{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;grid-column:1/-1;align-items:center;gap:6px 10px;font-size:12px;display:flex}.RRsvha_share code{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:6px;padding:4px 7px}.RRsvha_actions{justify-content:flex-end;align-items:end;gap:8px;display:flex}.RRsvha_error{color:var(--dsw-alias-state-error-primary);grid-column:1/-1;margin:4px 0 0;font-size:12px}@media (width<=760px){.RRsvha_setup{padding:16px}.RRsvha_setupCard{padding:20px}.RRsvha_joinGrid{grid-template-columns:1fr;gap:0}.RRsvha_room{grid-template-rows:auto minmax(590px,1fr) auto;padding:10px}.RRsvha_roomHeader strong{font-size:16px}.RRsvha_roomCode b{font-size:18px}.RRsvha_table{border-radius:26px;min-height:590px}.RRsvha_tableHud{width:210px;top:18px}.RRsvha_tableHud b{font-size:21px}.RRsvha_left{top:126px;left:12px}.RRsvha_right{top:126px;right:12px}.RRsvha_seat{min-width:86px}.RRsvha_avatar{width:36px;height:36px}.RRsvha_playRail{grid-template-columns:1fr;width:auto;min-height:150px;top:258px;left:16px;right:16px;translate:none}.RRsvha_bottomCards{top:96px;left:50%;right:auto;translate:-50%}.RRsvha_recentActions{grid-column:1;grid-template-columns:1fr;gap:5px}.RRsvha_recentActions ol{flex-wrap:wrap}.RRsvha_localPlayerArea{border-radius:18px;width:calc(100% - 20px);padding:10px 10px 12px;bottom:10px}.RRsvha_cardRow i{width:34px;height:56px;margin-left:-13px}.RRsvha_cardRow img{width:56px;height:56px}.RRsvha_controlPanel{grid-template-columns:1fr}.RRsvha_actions{flex-wrap:wrap;justify-content:stretch;align-items:stretch}.RRsvha_actions button{flex:1}}@media (width<=480px){.RRsvha_roomHeader .RRsvha_eyebrow{display:none}.RRsvha_room{grid-template-rows:auto 566px auto}.RRsvha_table{min-height:566px}.RRsvha_tableHud{text-align:left;justify-items:start;width:146px;top:14px;left:14px;translate:none}.RRsvha_tableHud>span:first-child{display:none}.RRsvha_tableHud b{margin-top:0;font-size:19px;line-height:24px}.RRsvha_left,.RRsvha_right{top:146px}.RRsvha_playRail{min-height:138px;padding:12px;top:274px;left:10px;right:10px}.RRsvha_bottomCards{top:14px;left:auto;right:12px;translate:none}.RRsvha_localPlayerArea .RRsvha_bottom{gap:8px}.RRsvha_cardRow i{width:28px;height:48px;margin-left:-16px}.RRsvha_cardRow img{width:48px;height:48px}.RRsvha_compactCards i{width:24px;height:40px;margin-left:-13px}.RRsvha_compactCards img{width:40px;height:40px}.RRsvha_recentActions li{max-width:150px}}.RRsvha_motionLayer{z-index:20;border-radius:inherit;pointer-events:none;position:absolute;inset:0;overflow:hidden}.RRsvha_dealAnimation,.RRsvha_playFlight{position:absolute;inset:0}.RRsvha_dealAnimation img{opacity:0;width:54px;height:54px;image-rendering:pixelated;animation:.48s cubic-bezier(.2,.75,.25,1) both RRsvha_deal-card;animation-delay:calc(var(--deal-index) * 45ms);position:absolute;top:48%;left:50%;translate:-50% -50%}.RRsvha_dealAnimation img[data-target=left]{--deal-x:-34vw;--deal-y:-4vh;--deal-rotate:-12deg}.RRsvha_dealAnimation img[data-target=right]{--deal-x:34vw;--deal-y:-4vh;--deal-rotate:12deg}.RRsvha_dealAnimation img[data-target=bottom]{--deal-x:0;--deal-y:33vh;--deal-rotate:2deg}.RRsvha_playFlight{justify-content:center;align-items:center;display:flex}.RRsvha_playFlight[data-origin=left],.RRsvha_passChip[data-origin=left]{--origin-x:-32vw;--origin-y:-8vh}.RRsvha_playFlight[data-origin=right],.RRsvha_passChip[data-origin=right]{--origin-x:32vw;--origin-y:-8vh}.RRsvha_playFlight[data-origin=bottom],.RRsvha_passChip[data-origin=bottom]{--origin-x:0;--origin-y:30vh}.RRsvha_playFlight img{opacity:0;filter:drop-shadow(0 8px 12px #00000047);width:60px;height:60px;image-rendering:pixelated;margin-left:-16px;animation:.46s cubic-bezier(.16,.82,.27,1) both RRsvha_play-flight}.RRsvha_playFlight img:first-child{margin-left:0}.RRsvha_passChip,.RRsvha_trickReset,.RRsvha_impact,.RRsvha_settlement{position:absolute;top:50%;left:50%;translate:-50% -50%}.RRsvha_passChip,.RRsvha_trickReset{border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 88%, transparent);box-shadow:var(--dsw-shadow-lv1);color:var(--dsw-alias-label-secondary);backdrop-filter:blur(8px);border-radius:999px;padding:7px 15px;font-size:13px;font-weight:700}.RRsvha_passChip{animation:.4s ease-out both RRsvha_pass-chip}.RRsvha_trickReset{color:var(--dsw-alias-state-success-primary);animation:.34s ease-out both RRsvha_trick-reset}.RRsvha_impact{border:2px solid var(--dsw-alias-state-warn-label);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, transparent);width:132px;height:132px;color:var(--dsw-alias-state-warn-label);letter-spacing:.08em;text-shadow:0 2px 12px color-mix(in srgb, var(--dsw-alias-bg-base) 80%, transparent);border-radius:50%;place-items:center;font-size:26px;font-weight:900;animation:.6s cubic-bezier(.18,.86,.3,1) both RRsvha_impact-ring;display:grid}.RRsvha_impact[data-impact=rocket]{border-color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 20%, transparent);width:156px;height:156px;color:var(--dsw-alias-state-error-primary)}.RRsvha_table:has(.RRsvha_impact){animation:.42s ease-out both RRsvha_impact-table}.RRsvha_settlement{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-label) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 94%, transparent);min-width:min(320px,100% - 48px);box-shadow:var(--dsw-shadow-lv3);text-align:center;backdrop-filter:blur(14px);border-radius:18px;gap:7px;padding:22px 28px;animation:1.95s both RRsvha_settlement-in;display:grid}.RRsvha_settlement strong{color:var(--dsw-alias-state-warn-label);font-size:22px}.RRsvha_settlement span{color:var(--dsw-alias-label-secondary);font-size:13px}.RRsvha_settlement[data-final=true]{animation:.24s ease-out both RRsvha_settlement-final-in}@keyframes RRsvha_active-seat-breathe{0%,to{box-shadow:0 0 0 3px color-mix(in srgb, var(--dsw-alias-button-info-fill) 14%, transparent)}50%{box-shadow:0 0 0 8px color-mix(in srgb, var(--dsw-alias-button-info-fill) 27%, transparent)}}@keyframes RRsvha_deal-card{0%{opacity:0;transform:translate(0,0)scale(.82)rotate(0)}18%{opacity:1}to{opacity:0;transform:translate3d(var(--deal-x), var(--deal-y), 0) scale(.96) rotate(var(--deal-rotate))}}@keyframes RRsvha_play-flight{0%{opacity:0;transform:translate3d(var(--origin-x), var(--origin-y), 0) scale(.76)}28%{opacity:1}to{opacity:0;transform:translate(0,0)scale(1)}}@keyframes RRsvha_pass-chip{0%{opacity:0;transform:translate3d(var(--origin-x), var(--origin-y), 0) scale(.86)}35%{opacity:1}to{opacity:0;transform:translate(0,0)scale(1)}}@keyframes RRsvha_trick-reset{0%{opacity:0;transform:scale(.86)}35%{opacity:1}to{opacity:0;transform:scale(1.06)}}@keyframes RRsvha_impact-ring{0%{opacity:0;transform:scale(.3)}28%{opacity:1;transform:scale(1.08)}72%{opacity:1;transform:scale(.96)}to{opacity:0;transform:scale(1.34)}}@keyframes RRsvha_impact-table{0%,to{transform:translate(0,0)}22%{transform:translate(-3px,1px)}42%{transform:translate(3px,-1px)}62%{transform:translate(-2px)}82%{transform:translate(2px,1px)}}@keyframes RRsvha_settlement-in{0%{opacity:0;transform:translateY(12px)scale(.96)}14%,82%{opacity:1;transform:translateY(0)scale(1)}to{opacity:0;transform:translateY(-5px)scale(1)}}@keyframes RRsvha_settlement-final-in{0%{opacity:0;transform:translateY(8px)scale(.97)}to{opacity:1;transform:translateY(0)scale(1)}}@media (width<=760px){.RRsvha_dealAnimation img[data-target=left]{--deal-x:-120px;--deal-y:-48px}.RRsvha_dealAnimation img[data-target=right]{--deal-x:120px;--deal-y:-48px}.RRsvha_dealAnimation img[data-target=bottom]{--deal-x:0;--deal-y:190px}.RRsvha_playFlight[data-origin=left],.RRsvha_passChip[data-origin=left]{--origin-x:-120px;--origin-y:-70px}.RRsvha_playFlight[data-origin=right],.RRsvha_passChip[data-origin=right]{--origin-x:120px;--origin-y:-70px}.RRsvha_playFlight[data-origin=bottom],.RRsvha_passChip[data-origin=bottom]{--origin-x:0;--origin-y:190px}}@media (prefers-reduced-motion:reduce){.RRsvha_activeSeat .RRsvha_avatar,.RRsvha_dealAnimation img,.RRsvha_playFlight img,.RRsvha_passChip,.RRsvha_trickReset,.RRsvha_impact,.RRsvha_table:has(.RRsvha_impact),.RRsvha_settlement{animation:none}}";
		const tagId = "dsh-doudizhu/LanGameTable.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-doudizhu";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var LanGameTable_module_css_default = {
			"activeSeat": "RRsvha_activeSeat",
			"primaryButton": "RRsvha_primaryButton",
			"table": "RRsvha_table",
			"left": "RRsvha_left",
			"turnBadge": "RRsvha_turnBadge",
			"active-seat-breathe": "RRsvha_active-seat-breathe",
			"roomCode": "RRsvha_roomCode",
			"loading": "RRsvha_loading",
			"eyebrow": "RRsvha_eyebrow",
			"matchRound": "RRsvha_matchRound",
			"hand": "RRsvha_hand",
			"bottom": "RRsvha_bottom",
			"cardRow": "RRsvha_cardRow",
			"share": "RRsvha_share",
			"setupCard": "RRsvha_setupCard",
			"secondaryButton": "RRsvha_secondaryButton",
			"bottomCards": "RRsvha_bottomCards",
			"actions": "RRsvha_actions",
			"compactCards": "RRsvha_compactCards",
			"motionLayer": "RRsvha_motionLayer",
			"settlement": "RRsvha_settlement",
			"impact-ring": "RRsvha_impact-ring",
			"impact-table": "RRsvha_impact-table",
			"field": "RRsvha_field",
			"dealAnimation": "RRsvha_dealAnimation",
			"setup": "RRsvha_setup",
			"settlement-in": "RRsvha_settlement-in",
			"divider": "RRsvha_divider",
			"deal-card": "RRsvha_deal-card",
			"totalScore": "RRsvha_totalScore",
			"passChip": "RRsvha_passChip",
			"pass-chip": "RRsvha_pass-chip",
			"recentActions": "RRsvha_recentActions",
			"controlPanel": "RRsvha_controlPanel",
			"error": "RRsvha_error",
			"trick-reset": "RRsvha_trick-reset",
			"tableHud": "RRsvha_tableHud",
			"seatCopy": "RRsvha_seatCopy",
			"play-flight": "RRsvha_play-flight",
			"trickReset": "RRsvha_trickReset",
			"impact": "RRsvha_impact",
			"settlement-final-in": "RRsvha_settlement-final-in",
			"roomHeader": "RRsvha_roomHeader",
			"localPlayerArea": "RRsvha_localPlayerArea",
			"right": "RRsvha_right",
			"playRail": "RRsvha_playRail",
			"offlineSeat": "RRsvha_offlineSeat",
			"room": "RRsvha_room",
			"lockedStrategy": "RRsvha_lockedStrategy",
			"playFlight": "RRsvha_playFlight",
			"ghostButton": "RRsvha_ghostButton",
			"joinGrid": "RRsvha_joinGrid",
			"avatar": "RRsvha_avatar",
			"seat": "RRsvha_seat",
			"cardFan": "RRsvha_cardFan"
		};
		//#endregion
		//#region src/client/LanGameTable.tsx
		/** Full conversation-view card table with lobby controls. */
		const DEFAULT_PROMPT = "稳健出牌，优先保留炸弹，并根据已经出现的牌推断剩余牌型。";
		/** Render setup, lobby, and autonomous-game states without replacing the resident composer. */
		function LanGameTable({ useLanGame, start, host, join, updatePrompt, setReady, leave, t }) {
			const state = useLanGame((value) => value);
			const [strategyPrompt, setStrategyPrompt] = (0, react.useState)(DEFAULT_PROMPT);
			const [url, setUrl] = (0, react.useState)("");
			const [code, setCode] = (0, react.useState)("");
			(0, react.useEffect)(start, [start]);
			const savedPrompt = state.participant?.strategyPrompt;
			(0, react.useEffect)(() => {
				if (savedPrompt !== void 0) setStrategyPrompt(savedPrompt);
			}, [savedPrompt]);
			if (state.status === "loading") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: LanGameTable_module_css_default.loading,
				children: t("state.loading")
			});
			if (state.status === "idle" || state.participant === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
				className: LanGameTable_module_css_default.setup,
				"data-lan-game-table": "setup",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: LanGameTable_module_css_default.setupCard,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: LanGameTable_module_css_default.eyebrow,
							children: "DSH · LAN AGENT GAME"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("setup.title") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("setup.subtitle") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: LanGameTable_module_css_default.field,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("prompt.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								value: strategyPrompt,
								onChange: (event) => {
									setStrategyPrompt(event.target.value);
								},
								placeholder: t("prompt.placeholder")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: LanGameTable_module_css_default.primaryButton,
							type: "button",
							disabled: state.pending || strategyPrompt.trim() === "",
							onClick: () => {
								host(strategyPrompt);
							},
							children: t("host.action")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: LanGameTable_module_css_default.divider,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "或" })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: LanGameTable_module_css_default.joinGrid,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: LanGameTable_module_css_default.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("join.url") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: url,
									onChange: (event) => {
										setUrl(event.target.value);
									},
									placeholder: "ws://192.168.1.8:43120/"
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: LanGameTable_module_css_default.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("join.code") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: code,
									inputMode: "numeric",
									maxLength: 6,
									onChange: (event) => {
										setCode(event.target.value.replace(/\D/gu, ""));
									},
									placeholder: "123456"
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: LanGameTable_module_css_default.secondaryButton,
							type: "button",
							disabled: state.pending || strategyPrompt.trim() === "" || url.trim() === "" || code.length !== 6,
							onClick: () => {
								join({
									url,
									code,
									strategyPrompt
								});
							},
							children: t("join.action")
						}),
						state.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: LanGameTable_module_css_default.error,
							role: "alert",
							children: state.error
						})
					]
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RoomTable, {
				state,
				participant: state.participant,
				strategyPrompt,
				setStrategyPrompt,
				updatePrompt,
				setReady,
				leave,
				t
			});
		}
		function RoomTable({ state, participant, strategyPrompt, setStrategyPrompt, updatePrompt, setReady, leave, t }) {
			const { room } = participant;
			const me = room.members.find((member) => member.id === participant.memberId);
			const seats = Array.from({ length: room.maxMembers }, (_, seat) => room.members.find((member) => member.seat === seat));
			const game = doudizhuTableSnapshot(participant.game);
			const privateGame = doudizhuPrivateSnapshot(participant.privateGame);
			const publicGame = game?.status === "failed" ? void 0 : game?.state;
			const activeSeat = game?.status === "failed" ? void 0 : game?.decisionSeat ?? publicGame?.currentSeat;
			const decisionOutcomes = game?.status === "failed" ? void 0 : game?.decisionOutcomes;
			const localSeat = me?.seat ?? 0;
			const leftSeat = (localSeat + 1) % 3;
			const rightSeat = (localSeat + 2) % 3;
			const editable = room.phase === "lobby" && !me?.ready;
			const motion = useTableMotion(game, room.phase);
			const displayedLastPlay = motion.hideLastPlay ? void 0 : publicGame?.lastPlay;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: LanGameTable_module_css_default.room,
				"data-lan-game-table": room.phase,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: LanGameTable_module_css_default.roomHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: LanGameTable_module_css_default.eyebrow,
							children: "DSH · AUTONOMOUS TABLE"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: phaseLabel(room.phase, t) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: LanGameTable_module_css_default.roomCode,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("room.code") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: room.code })]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: LanGameTable_module_css_default.table,
						"aria-label": t("setup.title"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Seat, {
								member: seats[leftSeat],
								me: participant.memberId,
								position: "left",
								count: publicGame?.cardCounts[leftSeat],
								landlord: publicGame?.landlord === leftSeat,
								active: activeSeat === leftSeat,
								t
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Seat, {
								member: seats[rightSeat],
								me: participant.memberId,
								position: "right",
								count: publicGame?.cardCounts[rightSeat],
								landlord: publicGame?.landlord === rightSeat,
								active: activeSeat === rightSeat,
								t
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: LanGameTable_module_css_default.tableHud,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "DSH" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "斗地主" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: gameStatus(room.phase, game, t) }),
									game !== void 0 && game.status !== "failed" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: LanGameTable_module_css_default.matchRound,
										children: t("game.round").replace("{round}", String(game.round)).replace("{total}", String(game.totalRounds))
									}),
									publicGame !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: t("game.multiplier").replace("{value}", String(publicGame.multiplier)) }),
									game !== void 0 && game.status !== "failed" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: LanGameTable_module_css_default.totalScore,
										children: t("game.totalScore").replace("{a}", String(game.totalScores[0])).replace("{b}", String(game.totalScores[1])).replace("{c}", String(game.totalScores[2]))
									})
								]
							}),
							publicGame !== void 0 && publicGame.bottom.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: LanGameTable_module_css_default.bottomCards,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									label: t("game.bottom"),
									cards: publicGame.bottom,
									compact: true
								})
							}),
							publicGame !== void 0 && (displayedLastPlay !== void 0 || publicGame.history.length > 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: LanGameTable_module_css_default.playRail,
								"data-lan-game-play-rail": true,
								children: [displayedLastPlay !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
									label: t("game.lastPlay"),
									cards: displayedLastPlay.combination.cards
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecentActions, {
									history: publicGame.history,
									outcomes: decisionOutcomes,
									t
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: LanGameTable_module_css_default.localPlayerArea,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Seat, {
									member: seats[localSeat],
									me: participant.memberId,
									position: "bottom",
									count: publicGame?.cardCounts[localSeat],
									landlord: publicGame?.landlord === localSeat,
									active: activeSeat === localSeat,
									t
								}), privateGame !== void 0 && privateGame.yourCards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: LanGameTable_module_css_default.hand,
									"aria-label": t("game.yourCards"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardRow, {
										label: t("game.yourCards"),
										cards: privateGame.yourCards
									})
								})]
							}),
							motion.finalSettlement !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableMotionLayer, {
								event: motion.finalSettlement,
								localSeat,
								t
							}),
							motion.finalSettlement === void 0 && !motion.reducedMotion && motion.event !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TableMotionLayer, {
								event: motion.event,
								localSeat,
								t
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: LanGameTable_module_css_default.controlPanel,
						children: [
							participant.role === "coordinator" && room.phase === "lobby" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: LanGameTable_module_css_default.share,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("room.copyHint") }), participant.joinUrls.map((joinUrl) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: joinUrl }, joinUrl))]
							}),
							room.phase === "lobby" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: LanGameTable_module_css_default.field,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("prompt.label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									value: strategyPrompt,
									disabled: !editable || state.pending,
									onChange: (event) => {
										setStrategyPrompt(event.target.value);
									}
								})]
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
								className: LanGameTable_module_css_default.lockedStrategy,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("prompt.locked") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: strategyPrompt })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: LanGameTable_module_css_default.actions,
								children: [
									editable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: LanGameTable_module_css_default.secondaryButton,
										type: "button",
										disabled: state.pending || strategyPrompt.trim() === "",
										onClick: () => {
											updatePrompt(strategyPrompt);
										},
										children: t("room.savePrompt")
									}),
									room.phase === "lobby" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: LanGameTable_module_css_default.primaryButton,
										type: "button",
										disabled: state.pending,
										onClick: () => {
											setReady(!me?.ready);
										},
										children: me?.ready ? t("room.cancelReady") : t("room.ready")
									}),
									room.phase === "lobby" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: LanGameTable_module_css_default.ghostButton,
										type: "button",
										disabled: state.pending,
										onClick: () => {
											leave();
										},
										children: t("room.leave")
									}),
									room.phase === "finished" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: LanGameTable_module_css_default.primaryButton,
										type: "button",
										disabled: state.pending,
										onClick: () => {
											leave();
										},
										children: t("room.newRoom")
									})
								]
							}),
							state.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: LanGameTable_module_css_default.error,
								role: "alert",
								children: state.error
							})
						]
					})
				]
			});
		}
		function Seat({ member, me, position, count, landlord, active, t }) {
			const connected = member?.connected ?? false;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${LanGameTable_module_css_default.seat} ${LanGameTable_module_css_default[position]} ${active && connected ? LanGameTable_module_css_default.activeSeat : ""} ${member !== void 0 && !connected ? LanGameTable_module_css_default.offlineSeat : ""}`,
				"data-connected": member === void 0 ? void 0 : connected,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.avatar,
						children: member === void 0 ? "?" : member.seat + 1
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: LanGameTable_module_css_default.seatCopy,
						"data-connected": member === void 0 ? void 0 : connected,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: member === void 0 ? t("seat.empty") : member.id === me ? t("seat.you") : compactId(member.id) }),
							member !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: !member.connected ? t("seat.offline") : landlord ? t("game.landlord") : count === void 0 ? member.ready ? t("seat.ready") : t("seat.notReady") : t("game.cardsLeft").replace("{count}", String(count)) }),
							active && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: LanGameTable_module_css_default.turnBadge,
								children: t("game.turn")
							})
						]
					}),
					member !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: LanGameTable_module_css_default.cardFan,
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdm////x9fsrjFHOQAAAAF0Uk5TAEDm2GYAAAB5SURBVDjL7dMxCoAwDAXQejMv4SXTwRvE+7RDdwtGJCUFPyUOLoIfHPqgoWB+CE+yWPQ8JWqJswJZGqzSsg+BmOn6DDgXkZq5g97oEBWSwaZwGBSFOga44s+Ap/szfvgqwM9+Y4P8GbDasPxQDyiQ2zmo6b3IUHUnJxKAJ2mWyRxxAAAAAElFTkSuQmCC",
								alt: ""
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdm////x9fsrjFHOQAAAAF0Uk5TAEDm2GYAAAB5SURBVDjL7dMxCoAwDAXQejMv4SXTwRvE+7RDdwtGJCUFPyUOLoIfHPqgoWB+CE+yWPQ8JWqJswJZGqzSsg+BmOn6DDgXkZq5g97oEBWSwaZwGBSFOga44s+Ap/szfvgqwM9+Y4P8GbDasPxQDyiQ2zmo6b3IUHUnJxKAJ2mWyRxxAAAAAElFTkSuQmCC",
								alt: ""
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
								src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdm////x9fsrjFHOQAAAAF0Uk5TAEDm2GYAAAB5SURBVDjL7dMxCoAwDAXQejMv4SXTwRvE+7RDdwtGJCUFPyUOLoIfHPqgoWB+CE+yWPQ8JWqJswJZGqzSsg+BmOn6DDgXkZq5g97oEBWSwaZwGBSFOga44s+Ap/szfvgqwM9+Y4P8GbDasPxQDyiQ2zmo6b3IUHUnJxKAJ2mWyRxxAAAAAElFTkSuQmCC",
								alt: ""
							})
						]
					})
				]
			});
		}
		function CardRow({ label, cards, compact = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${LanGameTable_module_css_default.cardRow} ${compact ? LanGameTable_module_css_default.compactCards : ""}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
					"data-red": isRedCard(card) || void 0,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: KENNEY_CARD_IMAGES[card],
						alt: cardLabel(card)
					})
				}, card)) })]
			});
		}
		function RecentActions({ history, outcomes, t }) {
			const start = Math.max(0, history.length - 5);
			const recent = history.slice(start);
			if (recent.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: LanGameTable_module_css_default.recentActions,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("game.recent") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", { children: recent.map((entry, offset) => {
					const index = start + offset;
					const previous = history[index - 1];
					const beforePrevious = history[index - 2];
					const fresh = "combination" in entry && previous !== void 0 && beforePrevious !== void 0 && "pass" in previous && "pass" in beforePrevious;
					const fallback = outcomes?.find((outcome) => outcome.historyIndex === index)?.source === "fallback";
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
						fresh && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: t("game.newTrick") }),
						fallback && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: t("game.trustee") }),
						historyEntryLabel(entry, t)
					] }, historyEntryKey(history, index));
				}) })]
			});
		}
		function TableMotionLayer({ event, localSeat, t }) {
			const origin = "seat" in event ? relativeSeat(event.seat, localSeat) : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: LanGameTable_module_css_default.motionLayer,
				"data-motion-kind": event.kind,
				"aria-hidden": event.kind !== "settlement",
				children: [
					event.kind === "deal" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.dealAnimation,
						children: Array.from({ length: 12 }, (_, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABAAgMAAADXB5lNAAAABGdBTUEAALGPC/xhBQAAAAxQTFRFAAAATVdm////x9fsrjFHOQAAAAF0Uk5TAEDm2GYAAAB5SURBVDjL7dMxCoAwDAXQejMv4SXTwRvE+7RDdwtGJCUFPyUOLoIfHPqgoWB+CE+yWPQ8JWqJswJZGqzSsg+BmOn6DDgXkZq5g97oEBWSwaZwGBSFOga44s+Ap/szfvgqwM9+Y4P8GbDasPxQDyiQ2zmo6b3IUHUnJxKAJ2mWyRxxAAAAAElFTkSuQmCC",
							alt: "",
							"data-target": [
								"left",
								"right",
								"bottom"
							][index % 3],
							style: { "--deal-index": index }
						}, index))
					}),
					event.kind === "play" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.playFlight,
						"data-origin": origin,
						children: event.cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: KENNEY_CARD_IMAGES[card],
							alt: ""
						}, card))
					}),
					event.kind === "pass" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.passChip,
						"data-origin": origin,
						children: t("game.passChip")
					}),
					event.kind === "trick-reset" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.trickReset,
						children: t("game.newTrick")
					}),
					event.kind === "impact" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: LanGameTable_module_css_default.impact,
						"data-impact": event.impact,
						children: event.impact === "rocket" ? t("game.rocket") : t("game.bomb")
					}),
					event.kind === "settlement" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: LanGameTable_module_css_default.settlement,
						"data-final": event.final,
						role: "status",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: event.final ? t("game.matchSettled") : t("game.roundSettled").replace("{round}", String(event.round)) }), event.result !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("game.settlementScores").replace("{a}", signedScore(event.result.scores[0])).replace("{b}", signedScore(event.result.scores[1])).replace("{c}", signedScore(event.result.scores[2])) })]
					})
				]
			});
		}
		function relativeSeat(seat, localSeat) {
			if (seat === localSeat) return "bottom";
			return seat === (localSeat + 1) % 3 ? "left" : "right";
		}
		function signedScore(score) {
			return score > 0 ? `+${score}` : String(score);
		}
		function historyEntryLabel(entry, t) {
			const seat = String(entry.seat + 1);
			if ("score" in entry) return entry.score === 0 ? t("game.noBid").replace("{seat}", seat) : t("game.bid").replace("{seat}", seat).replace("{score}", String(entry.score));
			if ("pass" in entry) return t("game.pass").replace("{seat}", seat);
			return t("game.played").replace("{seat}", seat).replace("{cards}", entry.combination.cards.map(cardLabel).join(" "));
		}
		function phaseLabel(phase, t) {
			switch (phase) {
				case "lobby": return t("room.waiting");
				case "locked": return t("room.locked");
				case "running": return t("room.running");
				case "finished": return t("room.finished");
				default: return "";
			}
		}
		function compactId(value) {
			return value.length <= 12 ? value : `${value.slice(0, 5)}…${value.slice(-4)}`;
		}
		function gameStatus(roomPhase, game, t) {
			if (game?.status === "failed") return `${t("game.failed")}：${game.error}`;
			if (game?.status === "round-finished") return t("game.roundFinished");
			if (game?.state.phase === "bidding") return t("game.bidding");
			if (game?.state.phase === "playing") return t("game.playing");
			if (game?.state.phase === "finished") return t("room.finished");
			return roomPhase === "running" ? t("room.enginePending") : t("room.waiting");
		}
		function cardLabel(card) {
			if (card === "joker-small") return "小王";
			if (card === "joker-big") return "大王";
			const prefix = card[0];
			return `${prefix === "C" ? "♣" : prefix === "D" ? "♦" : prefix === "H" ? "♥" : prefix === "S" ? "♠" : ""}${card.slice(1)}`;
		}
		function isRedCard(card) {
			return card.startsWith("D") || card.startsWith("H") || card === "joker-big";
		}
		//#endregion
		//#region src/client/locales.ts
		/** Simplified Chinese dictionary and complete English fallback. */
		const zh = {
			"view.label": "斗地主",
			"setup.title": "局域网 AI 斗地主",
			"setup.subtitle": "三台 DSH 连接后，模型自动出牌；你仍可在下方输入框继续工作。",
			"prompt.label": "策略 Prompt",
			"prompt.placeholder": "例如：稳健出牌，优先保留炸弹，记住已出现的大牌。",
			"prompt.locked": "赛前策略（已锁定）",
			"host.action": "创建房间",
			"join.url": "房主地址",
			"join.code": "六位房间码",
			"join.action": "加入房间",
			"room.code": "房间码",
			"room.copyHint": "把地址和房间码发给另外两位玩家",
			"room.savePrompt": "保存策略",
			"room.ready": "准备",
			"room.cancelReady": "取消准备",
			"room.leave": "离开房间",
			"room.newRoom": "结束并返回大厅",
			"room.waiting": "等待三名玩家准备",
			"room.locked": "策略已锁定，正在启动模型",
			"room.running": "模型已接管牌局",
			"room.enginePending": "Game Session 已就绪，等待规则引擎发牌",
			"game.bidding": "正在叫地主",
			"game.playing": "模型正在自主出牌",
			"game.bottom": "地主底牌",
			"game.yourCards": "手牌",
			"game.lastPlay": "上一手",
			"game.recent": "最近动作",
			"game.newTrick": "新一轮",
			"game.trustee": "托管",
			"game.passChip": "不要",
			"game.bomb": "炸弹",
			"game.rocket": "王炸",
			"game.roundSettled": "第 {round} 局结算",
			"game.matchSettled": "三局结算",
			"game.settlementScores": "本局 {a} / {b} / {c}",
			"game.bid": "{seat} 号叫 {score} 分",
			"game.noBid": "{seat} 号不叫",
			"game.pass": "{seat} 号不要",
			"game.played": "{seat} 号 · {cards}",
			"game.landlord": "地主",
			"game.farmer": "农民",
			"game.turn": "行动中",
			"game.cardsLeft": "剩余 {count} 张",
			"game.multiplier": "{value} 倍",
			"game.failed": "对局异常结束",
			"game.round": "第 {round}/{total} 局",
			"game.roundFinished": "本局已结算，正在自动洗牌",
			"game.totalScore": "总分 {a} / {b} / {c}",
			"room.finished": "本局结束",
			"seat.empty": "等待加入",
			"seat.you": "你",
			"seat.ready": "已准备",
			"seat.notReady": "未准备",
			"seat.offline": "离线",
			"state.loading": "正在读取本机 DSH 房间状态…"
		};
		/** English dictionary checked against the Chinese key source. */
		const en = {
			"view.label": "DouDizhu",
			"setup.title": "LAN AI DouDizhu",
			"setup.subtitle": "Connect three DSH instances. Models play autonomously while the composer remains available.",
			"prompt.label": "Strategy Prompt",
			"prompt.placeholder": "For example: play conservatively, preserve bombs, and track high cards.",
			"prompt.locked": "Pre-match strategy (locked)",
			"host.action": "Create room",
			"join.url": "Coordinator address",
			"join.code": "Six-digit room code",
			"join.action": "Join room",
			"room.code": "Room code",
			"room.copyHint": "Share the address and code with the other two players",
			"room.savePrompt": "Save strategy",
			"room.ready": "Ready",
			"room.cancelReady": "Cancel ready",
			"room.leave": "Leave room",
			"room.newRoom": "Finish and return to lobby",
			"room.waiting": "Waiting for three ready players",
			"room.locked": "Strategies locked; models are starting",
			"room.running": "Models control the match",
			"room.enginePending": "Game Sessions are ready; waiting for the rules engine to deal",
			"game.bidding": "Bidding for landlord",
			"game.playing": "Models are playing autonomously",
			"game.bottom": "Landlord bottom cards",
			"game.yourCards": "Your hand",
			"game.lastPlay": "Last play",
			"game.recent": "Recent actions",
			"game.newTrick": "New trick",
			"game.trustee": "Auto",
			"game.passChip": "Pass",
			"game.bomb": "Bomb",
			"game.rocket": "Rocket",
			"game.roundSettled": "Round {round} settled",
			"game.matchSettled": "Three-round result",
			"game.settlementScores": "Round {a} / {b} / {c}",
			"game.bid": "Seat {seat} bids {score}",
			"game.noBid": "Seat {seat} passes bidding",
			"game.pass": "Seat {seat} passes",
			"game.played": "Seat {seat} · {cards}",
			"game.landlord": "Landlord",
			"game.farmer": "Farmer",
			"game.turn": "Acting",
			"game.cardsLeft": "{count} cards left",
			"game.multiplier": "×{value}",
			"game.failed": "Match failed",
			"game.round": "Round {round}/{total}",
			"game.roundFinished": "Round settled; shuffling automatically",
			"game.totalScore": "Total {a} / {b} / {c}",
			"room.finished": "Match finished",
			"seat.empty": "Waiting for player",
			"seat.you": "You",
			"seat.ready": "Ready",
			"seat.notReady": "Not ready",
			"seat.offline": "Offline",
			"state.loading": "Reading the local DSH room state…"
		};
		//#endregion
		//#region src/client/index.ts
		/** Required local Remote carrier, locale registry, and conversation slot ledger. */
		const inject = [
			"remote",
			"locale",
			"slots"
		];
		/** Mount the package-owned Remote contribution and register the table view. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register("lanGame", {
				zh,
				en
			}), "lan-game-ui: dictionaries");
			ctx.effect(async () => {
				const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE);
				const viewFiber = ctx.inject(["remote.lanRoomTransport"], (scope) => {
					scope.slots.inject("conversation.view", () => scope.slots.register({
						name: "conversation.view",
						id: "lan-game",
						order: 20,
						locale: "lanGame",
						label: () => scope.locale.bind("lanGame")("view.label"),
						inject: (sessionId) => {
							const client = new LanGameClient(sessionId, scope.remote.lanRoomTransport);
							return {
								hooks: { lanGame: client.store },
								start: () => client.start(),
								host: (strategyPrompt) => client.host(strategyPrompt),
								join: (request) => client.join(request),
								updatePrompt: (strategyPrompt) => client.updatePrompt(strategyPrompt),
								setReady: (ready) => client.setReady(ready),
								leave: () => client.leave()
							};
						}
					}, LanGameTable));
				});
				await viewFiber;
				return async () => {
					await viewFiber.dispose();
					await unmountRemote();
				};
			}, "lan-game-ui: Remote namespace and conversation view");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map