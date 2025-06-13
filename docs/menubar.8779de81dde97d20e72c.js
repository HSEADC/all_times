/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 997:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(f){if(true){module.exports=f()}else { var g; }})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c=undefined;if(!f&&c)return require(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u=undefined,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// istanbul ignore file
var AbortController;
var browserGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null; // self is the global in web workers
if (!browserGlobal) {
    AbortController = require('abort-controller');
}
else if ('signal' in new Request('https://airtable.com')) {
    AbortController = browserGlobal.AbortController;
}
else {
    /* eslint-disable @typescript-eslint/no-var-requires */
    var polyfill = require('abortcontroller-polyfill/dist/cjs-ponyfill');
    /* eslint-enable @typescript-eslint/no-var-requires */
    AbortController = polyfill.AbortController;
}
module.exports = AbortController;

},{"abort-controller":20,"abortcontroller-polyfill/dist/cjs-ponyfill":19}],2:[function(require,module,exports){
"use strict";
var AirtableError = /** @class */ (function () {
    function AirtableError(error, message, statusCode) {
        this.error = error;
        this.message = message;
        this.statusCode = statusCode;
    }
    AirtableError.prototype.toString = function () {
        return [
            this.message,
            '(',
            this.error,
            ')',
            this.statusCode ? "[Http code " + this.statusCode + "]" : '',
        ].join('');
    };
    return AirtableError;
}());
module.exports = AirtableError;

},{}],3:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var get_1 = __importDefault(require("lodash/get"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var keys_1 = __importDefault(require("lodash/keys"));
var fetch_1 = __importDefault(require("./fetch"));
var abort_controller_1 = __importDefault(require("./abort-controller"));
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var airtable_error_1 = __importDefault(require("./airtable_error"));
var table_1 = __importDefault(require("./table"));
var http_headers_1 = __importDefault(require("./http_headers"));
var run_action_1 = __importDefault(require("./run_action"));
var package_version_1 = __importDefault(require("./package_version"));
var exponential_backoff_with_jitter_1 = __importDefault(require("./exponential_backoff_with_jitter"));
var userAgent = "Airtable.js/" + package_version_1.default;
var Base = /** @class */ (function () {
    function Base(airtable, baseId) {
        this._airtable = airtable;
        this._id = baseId;
    }
    Base.prototype.table = function (tableName) {
        return new table_1.default(this, null, tableName);
    };
    Base.prototype.makeRequest = function (options) {
        var _this = this;
        var _a;
        if (options === void 0) { options = {}; }
        var method = get_1.default(options, 'method', 'GET').toUpperCase();
        var url = this._airtable._endpointUrl + "/v" + this._airtable._apiVersionMajor + "/" + this._id + get_1.default(options, 'path', '/') + "?" + object_to_query_param_string_1.default(get_1.default(options, 'qs', {}));
        var controller = new abort_controller_1.default();
        var headers = this._getRequestHeaders(Object.assign({}, this._airtable._customHeaders, (_a = options.headers) !== null && _a !== void 0 ? _a : {}));
        var requestOptions = {
            method: method,
            headers: headers,
            signal: controller.signal,
        };
        if ('body' in options && _canRequestMethodIncludeBody(method)) {
            requestOptions.body = JSON.stringify(options.body);
        }
        var timeout = setTimeout(function () {
            controller.abort();
        }, this._airtable._requestTimeout);
        return new Promise(function (resolve, reject) {
            fetch_1.default(url, requestOptions)
                .then(function (resp) {
                clearTimeout(timeout);
                if (resp.status === 429 && !_this._airtable._noRetryIfRateLimited) {
                    var numAttempts_1 = get_1.default(options, '_numAttempts', 0);
                    var backoffDelayMs = exponential_backoff_with_jitter_1.default(numAttempts_1);
                    setTimeout(function () {
                        var newOptions = __assign(__assign({}, options), { _numAttempts: numAttempts_1 + 1 });
                        _this.makeRequest(newOptions)
                            .then(resolve)
                            .catch(reject);
                    }, backoffDelayMs);
                }
                else {
                    resp.json()
                        .then(function (body) {
                        var err = _this._checkStatusForError(resp.status, body) ||
                            _getErrorForNonObjectBody(resp.status, body);
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve({
                                statusCode: resp.status,
                                headers: resp.headers,
                                body: body,
                            });
                        }
                    })
                        .catch(function () {
                        var err = _getErrorForNonObjectBody(resp.status);
                        reject(err);
                    });
                }
            })
                .catch(function (err) {
                clearTimeout(timeout);
                err = new airtable_error_1.default('CONNECTION_ERROR', err.message, null);
                reject(err);
            });
        });
    };
    /**
     * @deprecated This method is deprecated.
     */
    Base.prototype.runAction = function (method, path, queryParams, bodyData, callback) {
        run_action_1.default(this, method, path, queryParams, bodyData, callback, 0);
    };
    Base.prototype._getRequestHeaders = function (headers) {
        var result = new http_headers_1.default();
        result.set('Authorization', "Bearer " + this._airtable._apiKey);
        result.set('User-Agent', userAgent);
        result.set('Content-Type', 'application/json');
        for (var _i = 0, _a = keys_1.default(headers); _i < _a.length; _i++) {
            var headerKey = _a[_i];
            result.set(headerKey, headers[headerKey]);
        }
        return result.toJSON();
    };
    Base.prototype._checkStatusForError = function (statusCode, body) {
        var _a = (body !== null && body !== void 0 ? body : { error: {} }).error, error = _a === void 0 ? {} : _a;
        var type = error.type, message = error.message;
        if (statusCode === 401) {
            return new airtable_error_1.default('AUTHENTICATION_REQUIRED', 'You should provide valid api key to perform this operation', statusCode);
        }
        else if (statusCode === 403) {
            return new airtable_error_1.default('NOT_AUTHORIZED', 'You are not authorized to perform this operation', statusCode);
        }
        else if (statusCode === 404) {
            return new airtable_error_1.default('NOT_FOUND', message !== null && message !== void 0 ? message : 'Could not find what you are looking for', statusCode);
        }
        else if (statusCode === 413) {
            return new airtable_error_1.default('REQUEST_TOO_LARGE', 'Request body is too large', statusCode);
        }
        else if (statusCode === 422) {
            return new airtable_error_1.default(type !== null && type !== void 0 ? type : 'UNPROCESSABLE_ENTITY', message !== null && message !== void 0 ? message : 'The operation cannot be processed', statusCode);
        }
        else if (statusCode === 429) {
            return new airtable_error_1.default('TOO_MANY_REQUESTS', 'You have made too many requests in a short period of time. Please retry your request later', statusCode);
        }
        else if (statusCode === 500) {
            return new airtable_error_1.default('SERVER_ERROR', 'Try again. If the problem persists, contact support.', statusCode);
        }
        else if (statusCode === 503) {
            return new airtable_error_1.default('SERVICE_UNAVAILABLE', 'The service is temporarily unavailable. Please retry shortly.', statusCode);
        }
        else if (statusCode >= 400) {
            return new airtable_error_1.default(type !== null && type !== void 0 ? type : 'UNEXPECTED_ERROR', message !== null && message !== void 0 ? message : 'An unexpected error occurred', statusCode);
        }
        else {
            return null;
        }
    };
    Base.prototype.doCall = function (tableName) {
        return this.table(tableName);
    };
    Base.prototype.getId = function () {
        return this._id;
    };
    Base.createFunctor = function (airtable, baseId) {
        var base = new Base(airtable, baseId);
        var baseFn = function (tableName) {
            return base.doCall(tableName);
        };
        baseFn._base = base;
        baseFn.table = base.table.bind(base);
        baseFn.makeRequest = base.makeRequest.bind(base);
        baseFn.runAction = base.runAction.bind(base);
        baseFn.getId = base.getId.bind(base);
        return baseFn;
    };
    return Base;
}());
function _canRequestMethodIncludeBody(method) {
    return method !== 'GET' && method !== 'DELETE';
}
function _getErrorForNonObjectBody(statusCode, body) {
    if (isPlainObject_1.default(body)) {
        return null;
    }
    else {
        return new airtable_error_1.default('UNEXPECTED_ERROR', 'The response from Airtable was invalid JSON. Please try again soon.', statusCode);
    }
}
module.exports = Base;

},{"./abort-controller":1,"./airtable_error":2,"./exponential_backoff_with_jitter":6,"./fetch":7,"./http_headers":9,"./object_to_query_param_string":11,"./package_version":12,"./run_action":16,"./table":17,"lodash/get":77,"lodash/isPlainObject":89,"lodash/keys":93}],4:[function(require,module,exports){
"use strict";
/**
 * Given a function fn that takes a callback as its last argument, returns
 * a new version of the function that takes the callback optionally. If
 * the function is not called with a callback for the last argument, the
 * function will return a promise instead.
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
function callbackToPromise(fn, context, callbackArgIndex) {
    if (callbackArgIndex === void 0) { callbackArgIndex = void 0; }
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
    return function () {
        var callArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            callArgs[_i] = arguments[_i];
        }
        var thisCallbackArgIndex;
        if (callbackArgIndex === void 0) {
            // istanbul ignore next
            thisCallbackArgIndex = callArgs.length > 0 ? callArgs.length - 1 : 0;
        }
        else {
            thisCallbackArgIndex = callbackArgIndex;
        }
        var callbackArg = callArgs[thisCallbackArgIndex];
        if (typeof callbackArg === 'function') {
            fn.apply(context, callArgs);
            return void 0;
        }
        else {
            var args_1 = [];
            // If an explicit callbackArgIndex is set, but the function is called
            // with too few arguments, we want to push undefined onto args so that
            // our constructed callback ends up at the right index.
            var argLen = Math.max(callArgs.length, thisCallbackArgIndex);
            for (var i = 0; i < argLen; i++) {
                args_1.push(callArgs[i]);
            }
            return new Promise(function (resolve, reject) {
                args_1.push(function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
                fn.apply(context, args_1);
            });
        }
    };
}
module.exports = callbackToPromise;

},{}],5:[function(require,module,exports){
"use strict";
var didWarnForDeprecation = {};
/**
 * Convenience function for marking a function as deprecated.
 *
 * Will emit a warning the first time that function is called.
 *
 * @param fn the function to mark as deprecated.
 * @param key a unique key identifying the function.
 * @param message the warning message.
 *
 * @return a wrapped function
 */
function deprecate(fn, key, message) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!didWarnForDeprecation[key]) {
            didWarnForDeprecation[key] = true;
            console.warn(message);
        }
        fn.apply(this, args);
    };
}
module.exports = deprecate;

},{}],6:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var internal_config_json_1 = __importDefault(require("./internal_config.json"));
// "Full Jitter" algorithm taken from https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
function exponentialBackoffWithJitter(numberOfRetries) {
    var rawBackoffTimeMs = internal_config_json_1.default.INITIAL_RETRY_DELAY_IF_RATE_LIMITED * Math.pow(2, numberOfRetries);
    var clippedBackoffTimeMs = Math.min(internal_config_json_1.default.MAX_RETRY_DELAY_IF_RATE_LIMITED, rawBackoffTimeMs);
    var jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
    return jitteredBackoffTimeMs;
}
module.exports = exponentialBackoffWithJitter;

},{"./internal_config.json":10}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// istanbul ignore file
var node_fetch_1 = __importDefault(require("node-fetch"));
var browserGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null; // self is the global in web workers
module.exports = !browserGlobal ? node_fetch_1.default : browserGlobal.fetch.bind(browserGlobal);

},{"node-fetch":20}],8:[function(require,module,exports){
"use strict";
/* eslint-enable @typescript-eslint/no-explicit-any */
function has(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
}
module.exports = has;

},{}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var keys_1 = __importDefault(require("lodash/keys"));
var isBrowser = typeof window !== 'undefined';
var HttpHeaders = /** @class */ (function () {
    function HttpHeaders() {
        this._headersByLowercasedKey = {};
    }
    HttpHeaders.prototype.set = function (headerKey, headerValue) {
        var lowercasedKey = headerKey.toLowerCase();
        if (lowercasedKey === 'x-airtable-user-agent') {
            lowercasedKey = 'user-agent';
            headerKey = 'User-Agent';
        }
        this._headersByLowercasedKey[lowercasedKey] = {
            headerKey: headerKey,
            headerValue: headerValue,
        };
    };
    HttpHeaders.prototype.toJSON = function () {
        var result = {};
        for (var _i = 0, _a = keys_1.default(this._headersByLowercasedKey); _i < _a.length; _i++) {
            var lowercasedKey = _a[_i];
            var headerDefinition = this._headersByLowercasedKey[lowercasedKey];
            var headerKey = void 0;
            /* istanbul ignore next */
            if (isBrowser && lowercasedKey === 'user-agent') {
                // Some browsers do not allow overriding the user agent.
                // https://github.com/Airtable/airtable.js/issues/52
                headerKey = 'X-Airtable-User-Agent';
            }
            else {
                headerKey = headerDefinition.headerKey;
            }
            result[headerKey] = headerDefinition.headerValue;
        }
        return result;
    };
    return HttpHeaders;
}());
module.exports = HttpHeaders;

},{"lodash/keys":93}],10:[function(require,module,exports){
module.exports={
    "INITIAL_RETRY_DELAY_IF_RATE_LIMITED": 5000,
    "MAX_RETRY_DELAY_IF_RATE_LIMITED": 600000
}

},{}],11:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isArray_1 = __importDefault(require("lodash/isArray"));
var isNil_1 = __importDefault(require("lodash/isNil"));
var keys_1 = __importDefault(require("lodash/keys"));
/* eslint-enable @typescript-eslint/no-explicit-any */
// Adapted from jQuery.param:
// https://github.com/jquery/jquery/blob/2.2-stable/src/serialize.js
function buildParams(prefix, obj, addFn) {
    if (isArray_1.default(obj)) {
        // Serialize array item.
        for (var index = 0; index < obj.length; index++) {
            var value = obj[index];
            if (/\[\]$/.test(prefix)) {
                // Treat each array item as a scalar.
                addFn(prefix, value);
            }
            else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams(prefix + "[" + (typeof value === 'object' && value !== null ? index : '') + "]", value, addFn);
            }
        }
    }
    else if (typeof obj === 'object') {
        // Serialize object item.
        for (var _i = 0, _a = keys_1.default(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = obj[key];
            buildParams(prefix + "[" + key + "]", value, addFn);
        }
    }
    else {
        // Serialize scalar item.
        addFn(prefix, obj);
    }
}
function objectToQueryParamString(obj) {
    var parts = [];
    var addFn = function (key, value) {
        value = isNil_1.default(value) ? '' : value;
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    };
    for (var _i = 0, _a = keys_1.default(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = obj[key];
        buildParams(key, value, addFn);
    }
    return parts.join('&').replace(/%20/g, '+');
}
module.exports = objectToQueryParamString;

},{"lodash/isArray":79,"lodash/isNil":85,"lodash/keys":93}],12:[function(require,module,exports){
"use strict";
module.exports = "0.12.2";

},{}],13:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isFunction_1 = __importDefault(require("lodash/isFunction"));
var keys_1 = __importDefault(require("lodash/keys"));
var record_1 = __importDefault(require("./record"));
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var has_1 = __importDefault(require("./has"));
var query_params_1 = require("./query_params");
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
/**
 * Builds a query object. Won't fetch until `firstPage` or
 * or `eachPage` is called.
 *
 * Params should be validated prior to being passed to Query
 * with `Query.validateParams`.
 */
var Query = /** @class */ (function () {
    function Query(table, params) {
        this._table = table;
        this._params = params;
        this.firstPage = callback_to_promise_1.default(firstPage, this);
        this.eachPage = callback_to_promise_1.default(eachPage, this, 1);
        this.all = callback_to_promise_1.default(all, this);
    }
    /**
     * Validates the parameters for passing to the Query constructor.
     *
     * @params {object} params parameters to validate
     *
     * @return an object with two keys:
     *  validParams: the object that should be passed to the constructor.
     *  ignoredKeys: a list of keys that will be ignored.
     *  errors: a list of error messages.
     */
    Query.validateParams = function (params) {
        var validParams = {};
        var ignoredKeys = [];
        var errors = [];
        for (var _i = 0, _a = keys_1.default(params); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = params[key];
            if (has_1.default(Query.paramValidators, key)) {
                var validator = Query.paramValidators[key];
                var validationResult = validator(value);
                if (validationResult.pass) {
                    validParams[key] = value;
                }
                else {
                    errors.push(validationResult.error);
                }
            }
            else {
                ignoredKeys.push(key);
            }
        }
        return {
            validParams: validParams,
            ignoredKeys: ignoredKeys,
            errors: errors,
        };
    };
    Query.paramValidators = query_params_1.paramValidators;
    return Query;
}());
/**
 * Fetches the first page of results for the query asynchronously,
 * then calls `done(error, records)`.
 */
function firstPage(done) {
    if (!isFunction_1.default(done)) {
        throw new Error('The first parameter to `firstPage` must be a function');
    }
    this.eachPage(function (records) {
        done(null, records);
    }, function (error) {
        done(error, null);
    });
}
/**
 * Fetches each page of results for the query asynchronously.
 *
 * Calls `pageCallback(records, fetchNextPage)` for each
 * page. You must call `fetchNextPage()` to fetch the next page of
 * results.
 *
 * After fetching all pages, or if there's an error, calls
 * `done(error)`.
 */
function eachPage(pageCallback, done) {
    var _this = this;
    if (!isFunction_1.default(pageCallback)) {
        throw new Error('The first parameter to `eachPage` must be a function');
    }
    if (!isFunction_1.default(done) && done !== void 0) {
        throw new Error('The second parameter to `eachPage` must be a function or undefined');
    }
    var params = __assign({}, this._params);
    var pathAndParamsAsString = "/" + this._table._urlEncodedNameOrId() + "?" + object_to_query_param_string_1.default(params);
    var queryParams = {};
    var requestData = null;
    var method;
    var path;
    if (params.method === 'post' || pathAndParamsAsString.length > query_params_1.URL_CHARACTER_LENGTH_LIMIT) {
        // There is a 16kb limit on GET requests. Since the URL makes up nearly all of the request size, we check for any requests that
        // that come close to this limit and send it as a POST instead. Additionally, we'll send the request as a post if it is specified
        // with the request params
        requestData = params;
        method = 'post';
        path = "/" + this._table._urlEncodedNameOrId() + "/listRecords";
        var paramNames = Object.keys(params);
        for (var _i = 0, paramNames_1 = paramNames; _i < paramNames_1.length; _i++) {
            var paramName = paramNames_1[_i];
            if (query_params_1.shouldListRecordsParamBePassedAsParameter(paramName)) {
                // timeZone and userLocale is parsed from the GET request separately from the other params. This parsing
                // does not occurring within the body parser we use for POST requests, so this will still need to be passed
                // via query params
                queryParams[paramName] = params[paramName];
            }
            else {
                requestData[paramName] = params[paramName];
            }
        }
    }
    else {
        method = 'get';
        queryParams = params;
        path = "/" + this._table._urlEncodedNameOrId();
    }
    var inner = function () {
        _this._table._base.runAction(method, path, queryParams, requestData, function (err, response, result) {
            if (err) {
                done(err, null);
            }
            else {
                var next = void 0;
                if (result.offset) {
                    params.offset = result.offset;
                    next = inner;
                }
                else {
                    next = function () {
                        done(null);
                    };
                }
                var records = result.records.map(function (recordJson) {
                    return new record_1.default(_this._table, null, recordJson);
                });
                pageCallback(records, next);
            }
        });
    };
    inner();
}
/**
 * Fetches all pages of results asynchronously. May take a long time.
 */
function all(done) {
    if (!isFunction_1.default(done)) {
        throw new Error('The first parameter to `all` must be a function');
    }
    var allRecords = [];
    this.eachPage(function (pageRecords, fetchNextPage) {
        allRecords.push.apply(allRecords, pageRecords);
        fetchNextPage();
    }, function (err) {
        if (err) {
            done(err, null);
        }
        else {
            done(null, allRecords);
        }
    });
}
module.exports = Query;

},{"./callback_to_promise":4,"./has":8,"./object_to_query_param_string":11,"./query_params":14,"./record":15,"lodash/isFunction":83,"lodash/keys":93}],14:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldListRecordsParamBePassedAsParameter = exports.URL_CHARACTER_LENGTH_LIMIT = exports.paramValidators = void 0;
var typecheck_1 = __importDefault(require("./typecheck"));
var isString_1 = __importDefault(require("lodash/isString"));
var isNumber_1 = __importDefault(require("lodash/isNumber"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var isBoolean_1 = __importDefault(require("lodash/isBoolean"));
exports.paramValidators = {
    fields: typecheck_1.default(typecheck_1.default.isArrayOf(isString_1.default), 'the value for `fields` should be an array of strings'),
    filterByFormula: typecheck_1.default(isString_1.default, 'the value for `filterByFormula` should be a string'),
    maxRecords: typecheck_1.default(isNumber_1.default, 'the value for `maxRecords` should be a number'),
    pageSize: typecheck_1.default(isNumber_1.default, 'the value for `pageSize` should be a number'),
    offset: typecheck_1.default(isNumber_1.default, 'the value for `offset` should be a number'),
    sort: typecheck_1.default(typecheck_1.default.isArrayOf(function (obj) {
        return (isPlainObject_1.default(obj) &&
            isString_1.default(obj.field) &&
            (obj.direction === void 0 || ['asc', 'desc'].includes(obj.direction)));
    }), 'the value for `sort` should be an array of sort objects. ' +
        'Each sort object must have a string `field` value, and an optional ' +
        '`direction` value that is "asc" or "desc".'),
    view: typecheck_1.default(isString_1.default, 'the value for `view` should be a string'),
    cellFormat: typecheck_1.default(function (cellFormat) {
        return isString_1.default(cellFormat) && ['json', 'string'].includes(cellFormat);
    }, 'the value for `cellFormat` should be "json" or "string"'),
    timeZone: typecheck_1.default(isString_1.default, 'the value for `timeZone` should be a string'),
    userLocale: typecheck_1.default(isString_1.default, 'the value for `userLocale` should be a string'),
    method: typecheck_1.default(function (method) {
        return isString_1.default(method) && ['get', 'post'].includes(method);
    }, 'the value for `method` should be "get" or "post"'),
    returnFieldsByFieldId: typecheck_1.default(isBoolean_1.default, 'the value for `returnFieldsByFieldId` should be a boolean'),
    recordMetadata: typecheck_1.default(typecheck_1.default.isArrayOf(isString_1.default), 'the value for `recordMetadata` should be an array of strings'),
};
exports.URL_CHARACTER_LENGTH_LIMIT = 15000;
exports.shouldListRecordsParamBePassedAsParameter = function (paramName) {
    return paramName === 'timeZone' || paramName === 'userLocale';
};

},{"./typecheck":18,"lodash/isBoolean":81,"lodash/isNumber":86,"lodash/isPlainObject":89,"lodash/isString":90}],15:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var Record = /** @class */ (function () {
    function Record(table, recordId, recordJson) {
        this._table = table;
        this.id = recordId || recordJson.id;
        if (recordJson) {
            this.commentCount = recordJson.commentCount;
        }
        this.setRawJson(recordJson);
        this.save = callback_to_promise_1.default(save, this);
        this.patchUpdate = callback_to_promise_1.default(patchUpdate, this);
        this.putUpdate = callback_to_promise_1.default(putUpdate, this);
        this.destroy = callback_to_promise_1.default(destroy, this);
        this.fetch = callback_to_promise_1.default(fetch, this);
        this.updateFields = this.patchUpdate;
        this.replaceFields = this.putUpdate;
    }
    Record.prototype.getId = function () {
        return this.id;
    };
    Record.prototype.get = function (columnName) {
        return this.fields[columnName];
    };
    Record.prototype.set = function (columnName, columnValue) {
        this.fields[columnName] = columnValue;
    };
    Record.prototype.setRawJson = function (rawJson) {
        this._rawJson = rawJson;
        this.fields = (this._rawJson && this._rawJson.fields) || {};
    };
    return Record;
}());
function save(done) {
    this.putUpdate(this.fields, done);
}
function patchUpdate(cellValuesByName, opts, done) {
    var _this = this;
    if (!done) {
        done = opts;
        opts = {};
    }
    var updateBody = __assign({ fields: cellValuesByName }, opts);
    this._table._base.runAction('patch', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, updateBody, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
function putUpdate(cellValuesByName, opts, done) {
    var _this = this;
    if (!done) {
        done = opts;
        opts = {};
    }
    var updateBody = __assign({ fields: cellValuesByName }, opts);
    this._table._base.runAction('put', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, updateBody, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
function destroy(done) {
    var _this = this;
    this._table._base.runAction('delete', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, null, function (err) {
        if (err) {
            done(err);
            return;
        }
        done(null, _this);
    });
}
function fetch(done) {
    var _this = this;
    this._table._base.runAction('get', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, null, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
module.exports = Record;

},{"./callback_to_promise":4}],16:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var exponential_backoff_with_jitter_1 = __importDefault(require("./exponential_backoff_with_jitter"));
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var package_version_1 = __importDefault(require("./package_version"));
var fetch_1 = __importDefault(require("./fetch"));
var abort_controller_1 = __importDefault(require("./abort-controller"));
var userAgent = "Airtable.js/" + package_version_1.default;
function runAction(base, method, path, queryParams, bodyData, callback, numAttempts) {
    var url = base._airtable._endpointUrl + "/v" + base._airtable._apiVersionMajor + "/" + base._id + path + "?" + object_to_query_param_string_1.default(queryParams);
    var headers = {
        authorization: "Bearer " + base._airtable._apiKey,
        'x-api-version': base._airtable._apiVersion,
        'x-airtable-application-id': base.getId(),
        'content-type': 'application/json',
    };
    var isBrowser = typeof window !== 'undefined';
    // Some browsers do not allow overriding the user agent.
    // https://github.com/Airtable/airtable.js/issues/52
    if (isBrowser) {
        headers['x-airtable-user-agent'] = userAgent;
    }
    else {
        headers['User-Agent'] = userAgent;
    }
    var controller = new abort_controller_1.default();
    var normalizedMethod = method.toUpperCase();
    var options = {
        method: normalizedMethod,
        headers: headers,
        signal: controller.signal,
    };
    if (bodyData !== null) {
        if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') {
            console.warn('body argument to runAction are ignored with GET or HEAD requests');
        }
        else {
            options.body = JSON.stringify(bodyData);
        }
    }
    var timeout = setTimeout(function () {
        controller.abort();
    }, base._airtable._requestTimeout);
    fetch_1.default(url, options)
        .then(function (resp) {
        clearTimeout(timeout);
        if (resp.status === 429 && !base._airtable._noRetryIfRateLimited) {
            var backoffDelayMs = exponential_backoff_with_jitter_1.default(numAttempts);
            setTimeout(function () {
                runAction(base, method, path, queryParams, bodyData, callback, numAttempts + 1);
            }, backoffDelayMs);
        }
        else {
            resp.json()
                .then(function (body) {
                var error = base._checkStatusForError(resp.status, body);
                // Ensure Response interface matches interface from
                // `request` Response object
                var r = {};
                Object.keys(resp).forEach(function (property) {
                    r[property] = resp[property];
                });
                r.body = body;
                r.statusCode = resp.status;
                callback(error, r, body);
            })
                .catch(function () {
                callback(base._checkStatusForError(resp.status));
            });
        }
    })
        .catch(function (error) {
        clearTimeout(timeout);
        callback(error);
    });
}
module.exports = runAction;

},{"./abort-controller":1,"./exponential_backoff_with_jitter":6,"./fetch":7,"./object_to_query_param_string":11,"./package_version":12}],17:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var deprecate_1 = __importDefault(require("./deprecate"));
var query_1 = __importDefault(require("./query"));
var query_params_1 = require("./query_params");
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var record_1 = __importDefault(require("./record"));
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var Table = /** @class */ (function () {
    function Table(base, tableId, tableName) {
        if (!tableId && !tableName) {
            throw new Error('Table name or table ID is required');
        }
        this._base = base;
        this.id = tableId;
        this.name = tableName;
        // Public API
        this.find = callback_to_promise_1.default(this._findRecordById, this);
        this.select = this._selectRecords.bind(this);
        this.create = callback_to_promise_1.default(this._createRecords, this);
        this.update = callback_to_promise_1.default(this._updateRecords.bind(this, false), this);
        this.replace = callback_to_promise_1.default(this._updateRecords.bind(this, true), this);
        this.destroy = callback_to_promise_1.default(this._destroyRecord, this);
        // Deprecated API
        this.list = deprecate_1.default(this._listRecords.bind(this), 'table.list', 'Airtable: `list()` is deprecated. Use `select()` instead.');
        this.forEach = deprecate_1.default(this._forEachRecord.bind(this), 'table.forEach', 'Airtable: `forEach()` is deprecated. Use `select()` instead.');
    }
    Table.prototype._findRecordById = function (recordId, done) {
        var record = new record_1.default(this, recordId);
        record.fetch(done);
    };
    Table.prototype._selectRecords = function (params) {
        if (params === void 0) {
            params = {};
        }
        if (arguments.length > 1) {
            console.warn("Airtable: `select` takes only one parameter, but it was given " + arguments.length + " parameters. Use `eachPage` or `firstPage` to fetch records.");
        }
        if (isPlainObject_1.default(params)) {
            var validationResults = query_1.default.validateParams(params);
            if (validationResults.errors.length) {
                var formattedErrors = validationResults.errors.map(function (error) {
                    return "  * " + error;
                });
                throw new Error("Airtable: invalid parameters for `select`:\n" + formattedErrors.join('\n'));
            }
            if (validationResults.ignoredKeys.length) {
                console.warn("Airtable: the following parameters to `select` will be ignored: " + validationResults.ignoredKeys.join(', '));
            }
            return new query_1.default(this, validationResults.validParams);
        }
        else {
            throw new Error('Airtable: the parameter for `select` should be a plain object or undefined.');
        }
    };
    Table.prototype._urlEncodedNameOrId = function () {
        return this.id || encodeURIComponent(this.name);
    };
    Table.prototype._createRecords = function (recordsData, optionalParameters, done) {
        var _this = this;
        var isCreatingMultipleRecords = Array.isArray(recordsData);
        if (!done) {
            done = optionalParameters;
            optionalParameters = {};
        }
        var requestData;
        if (isCreatingMultipleRecords) {
            requestData = __assign({ records: recordsData }, optionalParameters);
        }
        else {
            requestData = __assign({ fields: recordsData }, optionalParameters);
        }
        this._base.runAction('post', "/" + this._urlEncodedNameOrId() + "/", {}, requestData, function (err, resp, body) {
            if (err) {
                done(err);
                return;
            }
            var result;
            if (isCreatingMultipleRecords) {
                result = body.records.map(function (record) {
                    return new record_1.default(_this, record.id, record);
                });
            }
            else {
                result = new record_1.default(_this, body.id, body);
            }
            done(null, result);
        });
    };
    Table.prototype._updateRecords = function (isDestructiveUpdate, recordsDataOrRecordId, recordDataOrOptsOrDone, optsOrDone, done) {
        var _this = this;
        var opts;
        if (Array.isArray(recordsDataOrRecordId)) {
            var recordsData = recordsDataOrRecordId;
            opts = isPlainObject_1.default(recordDataOrOptsOrDone) ? recordDataOrOptsOrDone : {};
            done = (optsOrDone || recordDataOrOptsOrDone);
            var method = isDestructiveUpdate ? 'put' : 'patch';
            var requestData = __assign({ records: recordsData }, opts);
            this._base.runAction(method, "/" + this._urlEncodedNameOrId() + "/", {}, requestData, function (err, resp, body) {
                if (err) {
                    done(err);
                    return;
                }
                var result = body.records.map(function (record) {
                    return new record_1.default(_this, record.id, record);
                });
                done(null, result);
            });
        }
        else {
            var recordId = recordsDataOrRecordId;
            var recordData = recordDataOrOptsOrDone;
            opts = isPlainObject_1.default(optsOrDone) ? optsOrDone : {};
            done = (done || optsOrDone);
            var record = new record_1.default(this, recordId);
            if (isDestructiveUpdate) {
                record.putUpdate(recordData, opts, done);
            }
            else {
                record.patchUpdate(recordData, opts, done);
            }
        }
    };
    Table.prototype._destroyRecord = function (recordIdsOrId, done) {
        var _this = this;
        if (Array.isArray(recordIdsOrId)) {
            var queryParams = { records: recordIdsOrId };
            this._base.runAction('delete', "/" + this._urlEncodedNameOrId(), queryParams, null, function (err, response, results) {
                if (err) {
                    done(err);
                    return;
                }
                var records = results.records.map(function (_a) {
                    var id = _a.id;
                    return new record_1.default(_this, id, null);
                });
                done(null, records);
            });
        }
        else {
            var record = new record_1.default(this, recordIdsOrId);
            record.destroy(done);
        }
    };
    Table.prototype._listRecords = function (pageSize, offset, opts, done) {
        var _this = this;
        if (!done) {
            done = opts;
            opts = {};
        }
        var pathAndParamsAsString = "/" + this._urlEncodedNameOrId() + "?" + object_to_query_param_string_1.default(opts);
        var path;
        var listRecordsParameters = {};
        var listRecordsData = null;
        var method;
        if ((typeof opts !== 'function' && opts.method === 'post') ||
            pathAndParamsAsString.length > query_params_1.URL_CHARACTER_LENGTH_LIMIT) {
            // // There is a 16kb limit on GET requests. Since the URL makes up nearly all of the request size, we check for any requests that
            // that come close to this limit and send it as a POST instead. Additionally, we'll send the request as a post if it is specified
            // with the request params
            path = "/" + this._urlEncodedNameOrId() + "/listRecords";
            listRecordsData = __assign(__assign({}, (pageSize && { pageSize: pageSize })), (offset && { offset: offset }));
            method = 'post';
            var paramNames = Object.keys(opts);
            for (var _i = 0, paramNames_1 = paramNames; _i < paramNames_1.length; _i++) {
                var paramName = paramNames_1[_i];
                if (query_params_1.shouldListRecordsParamBePassedAsParameter(paramName)) {
                    listRecordsParameters[paramName] = opts[paramName];
                }
                else {
                    listRecordsData[paramName] = opts[paramName];
                }
            }
        }
        else {
            method = 'get';
            path = "/" + this._urlEncodedNameOrId() + "/";
            listRecordsParameters = __assign({ limit: pageSize, offset: offset }, opts);
        }
        this._base.runAction(method, path, listRecordsParameters, listRecordsData, function (err, response, results) {
            if (err) {
                done(err);
                return;
            }
            var records = results.records.map(function (recordJson) {
                return new record_1.default(_this, null, recordJson);
            });
            done(null, records, results.offset);
        });
    };
    Table.prototype._forEachRecord = function (opts, callback, done) {
        var _this = this;
        if (arguments.length === 2) {
            done = callback;
            callback = opts;
            opts = {};
        }
        var limit = Table.__recordsPerPageForIteration || 100;
        var offset = null;
        var nextPage = function () {
            _this._listRecords(limit, offset, opts, function (err, page, newOffset) {
                if (err) {
                    done(err);
                    return;
                }
                for (var index = 0; index < page.length; index++) {
                    callback(page[index]);
                }
                if (newOffset) {
                    offset = newOffset;
                    nextPage();
                }
                else {
                    done();
                }
            });
        };
        nextPage();
    };
    return Table;
}());
module.exports = Table;

},{"./callback_to_promise":4,"./deprecate":5,"./object_to_query_param_string":11,"./query":13,"./query_params":14,"./record":15,"lodash/isPlainObject":89}],18:[function(require,module,exports){
"use strict";
/* eslint-enable @typescript-eslint/no-explicit-any */
function check(fn, error) {
    return function (value) {
        if (fn(value)) {
            return { pass: true };
        }
        else {
            return { pass: false, error: error };
        }
    };
}
check.isOneOf = function isOneOf(options) {
    return options.includes.bind(options);
};
check.isArrayOf = function (itemValidator) {
    return function (value) {
        return Array.isArray(value) && value.every(itemValidator);
    };
};
module.exports = check;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var Emitter =
/*#__PURE__*/
function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    Object.defineProperty(this, 'listeners', {
      value: {},
      writable: true,
      configurable: true
    });
  }

  _createClass(Emitter, [{
    key: "addEventListener",
    value: function addEventListener(type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }

      this.listeners[type].push(callback);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, callback) {
      if (!(type in this.listeners)) {
        return;
      }

      var stack = this.listeners[type];

      for (var i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return;
        }
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      var _this = this;

      if (!(event.type in this.listeners)) {
        return;
      }

      var debounce = function debounce(callback) {
        setTimeout(function () {
          return callback.call(_this, event);
        });
      };

      var stack = this.listeners[event.type];

      for (var i = 0, l = stack.length; i < l; i++) {
        debounce(stack[i]);
      }

      return !event.defaultPrevented;
    }
  }]);

  return Emitter;
}();

var AbortSignal =
/*#__PURE__*/
function (_Emitter) {
  _inherits(AbortSignal, _Emitter);

  function AbortSignal() {
    var _this2;

    _classCallCheck(this, AbortSignal);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(AbortSignal).call(this)); // Some versions of babel does not transpile super() correctly for IE <= 10, if the parent
    // constructor has failed to run, then "this.listeners" will still be undefined and then we call
    // the parent constructor directly instead as a workaround. For general details, see babel bug:
    // https://github.com/babel/babel/issues/3041
    // This hack was added as a fix for the issue described here:
    // https://github.com/Financial-Times/polyfill-library/pull/59#issuecomment-477558042

    if (!_this2.listeners) {
      Emitter.call(_assertThisInitialized(_this2));
    } // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
    // we want Object.keys(new AbortController().signal) to be [] for compat with the native impl


    Object.defineProperty(_assertThisInitialized(_this2), 'aborted', {
      value: false,
      writable: true,
      configurable: true
    });
    Object.defineProperty(_assertThisInitialized(_this2), 'onabort', {
      value: null,
      writable: true,
      configurable: true
    });
    return _this2;
  }

  _createClass(AbortSignal, [{
    key: "toString",
    value: function toString() {
      return '[object AbortSignal]';
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      if (event.type === 'abort') {
        this.aborted = true;

        if (typeof this.onabort === 'function') {
          this.onabort.call(this, event);
        }
      }

      _get(_getPrototypeOf(AbortSignal.prototype), "dispatchEvent", this).call(this, event);
    }
  }]);

  return AbortSignal;
}(Emitter);
var AbortController =
/*#__PURE__*/
function () {
  function AbortController() {
    _classCallCheck(this, AbortController);

    // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
    // we want Object.keys(new AbortController()) to be [] for compat with the native impl
    Object.defineProperty(this, 'signal', {
      value: new AbortSignal(),
      writable: true,
      configurable: true
    });
  }

  _createClass(AbortController, [{
    key: "abort",
    value: function abort() {
      var event;

      try {
        event = new Event('abort');
      } catch (e) {
        if (typeof document !== 'undefined') {
          if (!document.createEvent) {
            // For Internet Explorer 8:
            event = document.createEventObject();
            event.type = 'abort';
          } else {
            // For Internet Explorer 11:
            event = document.createEvent('Event');
            event.initEvent('abort', false, false);
          }
        } else {
          // Fallback where document isn't available:
          event = {
            type: 'abort',
            bubbles: false,
            cancelable: false
          };
        }
      }

      this.signal.dispatchEvent(event);
    }
  }, {
    key: "toString",
    value: function toString() {
      return '[object AbortController]';
    }
  }]);

  return AbortController;
}();

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  // These are necessary to make sure that we get correct output for:
  // Object.prototype.toString.call(new AbortController())
  AbortController.prototype[Symbol.toStringTag] = 'AbortController';
  AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal';
}

function polyfillNeeded(self) {
  if (self.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
    console.log('__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill');
    return true;
  } // Note that the "unfetch" minimal fetch polyfill defines fetch() without
  // defining window.Request, and this polyfill need to work on top of unfetch
  // so the below feature detection needs the !self.AbortController part.
  // The Request.prototype check is also needed because Safari versions 11.1.2
  // up to and including 12.1.x has a window.AbortController present but still
  // does NOT correctly implement abortable fetch:
  // https://bugs.webkit.org/show_bug.cgi?id=174980#c2


  return typeof self.Request === 'function' && !self.Request.prototype.hasOwnProperty('signal') || !self.AbortController;
}

/**
 * Note: the "fetch.Request" default value is available for fetch imported from
 * the "node-fetch" package and not in browsers. This is OK since browsers
 * will be importing umd-polyfill.js from that path "self" is passed the
 * decorator so the default value will not be used (because browsers that define
 * fetch also has Request). One quirky setup where self.fetch exists but
 * self.Request does not is when the "unfetch" minimal fetch polyfill is used
 * on top of IE11; for this case the browser will try to use the fetch.Request
 * default value which in turn will be undefined but then then "if (Request)"
 * will ensure that you get a patched fetch but still no Request (as expected).
 * @param {fetch, Request = fetch.Request}
 * @returns {fetch: abortableFetch, Request: AbortableRequest}
 */

function abortableFetchDecorator(patchTargets) {
  if ('function' === typeof patchTargets) {
    patchTargets = {
      fetch: patchTargets
    };
  }

  var _patchTargets = patchTargets,
      fetch = _patchTargets.fetch,
      _patchTargets$Request = _patchTargets.Request,
      NativeRequest = _patchTargets$Request === void 0 ? fetch.Request : _patchTargets$Request,
      NativeAbortController = _patchTargets.AbortController,
      _patchTargets$__FORCE = _patchTargets.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL,
      __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL = _patchTargets$__FORCE === void 0 ? false : _patchTargets$__FORCE;

  if (!polyfillNeeded({
    fetch: fetch,
    Request: NativeRequest,
    AbortController: NativeAbortController,
    __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL: __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
  })) {
    return {
      fetch: fetch,
      Request: Request
    };
  }

  var Request = NativeRequest; // Note that the "unfetch" minimal fetch polyfill defines fetch() without
  // defining window.Request, and this polyfill need to work on top of unfetch
  // hence we only patch it if it's available. Also we don't patch it if signal
  // is already available on the Request prototype because in this case support
  // is present and the patching below can cause a crash since it assigns to
  // request.signal which is technically a read-only property. This latter error
  // happens when you run the main5.js node-fetch example in the repo
  // "abortcontroller-polyfill-examples". The exact error is:
  //   request.signal = init.signal;
  //   ^
  // TypeError: Cannot set property signal of #<Request> which has only a getter

  if (Request && !Request.prototype.hasOwnProperty('signal') || __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
    Request = function Request(input, init) {
      var signal;

      if (init && init.signal) {
        signal = init.signal; // Never pass init.signal to the native Request implementation when the polyfill has
        // been installed because if we're running on top of a browser with a
        // working native AbortController (i.e. the polyfill was installed due to
        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
        // fake AbortSignal to the native fetch will trigger:
        // TypeError: Failed to construct 'Request': member signal is not of type AbortSignal.

        delete init.signal;
      }

      var request = new NativeRequest(input, init);

      if (signal) {
        Object.defineProperty(request, 'signal', {
          writable: false,
          enumerable: false,
          configurable: true,
          value: signal
        });
      }

      return request;
    };

    Request.prototype = NativeRequest.prototype;
  }

  var realFetch = fetch;

  var abortableFetch = function abortableFetch(input, init) {
    var signal = Request && Request.prototype.isPrototypeOf(input) ? input.signal : init ? init.signal : undefined;

    if (signal) {
      var abortError;

      try {
        abortError = new DOMException('Aborted', 'AbortError');
      } catch (err) {
        // IE 11 does not support calling the DOMException constructor, use a
        // regular error object on it instead.
        abortError = new Error('Aborted');
        abortError.name = 'AbortError';
      } // Return early if already aborted, thus avoiding making an HTTP request


      if (signal.aborted) {
        return Promise.reject(abortError);
      } // Turn an event into a promise, reject it once `abort` is dispatched


      var cancellation = new Promise(function (_, reject) {
        signal.addEventListener('abort', function () {
          return reject(abortError);
        }, {
          once: true
        });
      });

      if (init && init.signal) {
        // Never pass .signal to the native implementation when the polyfill has
        // been installed because if we're running on top of a browser with a
        // working native AbortController (i.e. the polyfill was installed due to
        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
        // fake AbortSignal to the native fetch will trigger:
        // TypeError: Failed to execute 'fetch' on 'Window': member signal is not of type AbortSignal.
        delete init.signal;
      } // Return the fastest promise (don't need to wait for request to finish)


      return Promise.race([cancellation, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  return {
    fetch: abortableFetch,
    Request: Request
  };
}

exports.AbortController = AbortController;
exports.AbortSignal = AbortSignal;
exports.abortableFetch = abortableFetchDecorator;

},{}],20:[function(require,module,exports){

},{}],21:[function(require,module,exports){
var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;

},{"./_hashClear":46,"./_hashDelete":47,"./_hashGet":48,"./_hashHas":49,"./_hashSet":50}],22:[function(require,module,exports){
var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;

},{"./_listCacheClear":56,"./_listCacheDelete":57,"./_listCacheGet":58,"./_listCacheHas":59,"./_listCacheSet":60}],23:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":42,"./_root":72}],24:[function(require,module,exports){
var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;

},{"./_mapCacheClear":61,"./_mapCacheDelete":62,"./_mapCacheGet":63,"./_mapCacheHas":64,"./_mapCacheSet":65}],25:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":72}],26:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":35,"./_isIndex":51,"./isArguments":78,"./isArray":79,"./isBuffer":82,"./isTypedArray":92}],27:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],28:[function(require,module,exports){
var eq = require('./eq');

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;

},{"./eq":76}],29:[function(require,module,exports){
var castPath = require('./_castPath'),
    toKey = require('./_toKey');

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

},{"./_castPath":38,"./_toKey":74}],30:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":25,"./_getRawTag":44,"./_objectToString":70}],31:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

},{"./_baseGetTag":30,"./isObjectLike":88}],32:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isMasked":54,"./_toSource":75,"./isFunction":83,"./isObject":87}],33:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

},{"./_baseGetTag":30,"./isLength":84,"./isObjectLike":88}],34:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":55,"./_nativeKeys":68}],35:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],36:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    arrayMap = require('./_arrayMap'),
    isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"./_Symbol":25,"./_arrayMap":27,"./isArray":79,"./isSymbol":91}],37:[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],38:[function(require,module,exports){
var isArray = require('./isArray'),
    isKey = require('./_isKey'),
    stringToPath = require('./_stringToPath'),
    toString = require('./toString');

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;

},{"./_isKey":52,"./_stringToPath":73,"./isArray":79,"./toString":96}],39:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":72}],40:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
var isKeyable = require('./_isKeyable');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;

},{"./_isKeyable":53}],42:[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":32,"./_getValue":45}],43:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":71}],44:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":25}],45:[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],46:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

},{"./_nativeCreate":67}],47:[function(require,module,exports){
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

},{}],48:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

},{"./_nativeCreate":67}],49:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

},{"./_nativeCreate":67}],50:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

},{"./_nativeCreate":67}],51:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],52:[function(require,module,exports){
var isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;

},{"./isArray":79,"./isSymbol":91}],53:[function(require,module,exports){
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;

},{}],54:[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":39}],55:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],56:[function(require,module,exports){
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

},{}],57:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;

},{"./_assocIndexOf":28}],58:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

},{"./_assocIndexOf":28}],59:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

},{"./_assocIndexOf":28}],60:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;

},{"./_assocIndexOf":28}],61:[function(require,module,exports){
var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;

},{"./_Hash":21,"./_ListCache":22,"./_Map":23}],62:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

},{"./_getMapData":41}],63:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

},{"./_getMapData":41}],64:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

},{"./_getMapData":41}],65:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

},{"./_getMapData":41}],66:[function(require,module,exports){
var memoize = require('./memoize');

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;

},{"./memoize":94}],67:[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":42}],68:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":71}],69:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":40}],70:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],71:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],72:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":40}],73:[function(require,module,exports){
var memoizeCapped = require('./_memoizeCapped');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;

},{"./_memoizeCapped":66}],74:[function(require,module,exports){
var isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;

},{"./isSymbol":91}],75:[function(require,module,exports){
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],76:[function(require,module,exports){
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;

},{}],77:[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"./_baseGet":29}],78:[function(require,module,exports){
var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;

},{"./_baseIsArguments":31,"./isObjectLike":88}],79:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],80:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":83,"./isLength":84}],81:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike(value) && baseGetTag(value) == boolTag);
}

module.exports = isBoolean;

},{"./_baseGetTag":30,"./isObjectLike":88}],82:[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

},{"./_root":72,"./stubFalse":95}],83:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":30,"./isObject":87}],84:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],85:[function(require,module,exports){
/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

module.exports = isNil;

},{}],86:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == numberTag);
}

module.exports = isNumber;

},{"./_baseGetTag":30,"./isObjectLike":88}],87:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],88:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],89:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":30,"./_getPrototype":43,"./isObjectLike":88}],90:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

module.exports = isString;

},{"./_baseGetTag":30,"./isArray":79,"./isObjectLike":88}],91:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;

},{"./_baseGetTag":30,"./isObjectLike":88}],92:[function(require,module,exports){
var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;

},{"./_baseIsTypedArray":33,"./_baseUnary":37,"./_nodeUtil":69}],93:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":26,"./_baseKeys":34,"./isArrayLike":80}],94:[function(require,module,exports){
var MapCache = require('./_MapCache');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;

},{"./_MapCache":24}],95:[function(require,module,exports){
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],96:[function(require,module,exports){
var baseToString = require('./_baseToString');

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"./_baseToString":36}],"airtable":[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var base_1 = __importDefault(require("./base"));
var record_1 = __importDefault(require("./record"));
var table_1 = __importDefault(require("./table"));
var airtable_error_1 = __importDefault(require("./airtable_error"));
var Airtable = /** @class */ (function () {
    function Airtable(opts) {
        if (opts === void 0) { opts = {}; }
        var defaultConfig = Airtable.default_config();
        var apiVersion = opts.apiVersion || Airtable.apiVersion || defaultConfig.apiVersion;
        Object.defineProperties(this, {
            _apiKey: {
                value: opts.apiKey || Airtable.apiKey || defaultConfig.apiKey,
            },
            _apiVersion: {
                value: apiVersion,
            },
            _apiVersionMajor: {
                value: apiVersion.split('.')[0],
            },
            _customHeaders: {
                value: opts.customHeaders || {},
            },
            _endpointUrl: {
                value: opts.endpointUrl || Airtable.endpointUrl || defaultConfig.endpointUrl,
            },
            _noRetryIfRateLimited: {
                value: opts.noRetryIfRateLimited ||
                    Airtable.noRetryIfRateLimited ||
                    defaultConfig.noRetryIfRateLimited,
            },
            _requestTimeout: {
                value: opts.requestTimeout || Airtable.requestTimeout || defaultConfig.requestTimeout,
            },
        });
        if (!this._apiKey) {
            throw new Error('An API key is required to connect to Airtable');
        }
    }
    Airtable.prototype.base = function (baseId) {
        return base_1.default.createFunctor(this, baseId);
    };
    Airtable.default_config = function () {
        return {
            endpointUrl:  false || 'https://api.airtable.com',
            apiVersion: '0.1.0',
            apiKey: "",
            noRetryIfRateLimited: false,
            requestTimeout: 300 * 1000,
        };
    };
    Airtable.configure = function (_a) {
        var apiKey = _a.apiKey, endpointUrl = _a.endpointUrl, apiVersion = _a.apiVersion, noRetryIfRateLimited = _a.noRetryIfRateLimited, requestTimeout = _a.requestTimeout;
        Airtable.apiKey = apiKey;
        Airtable.endpointUrl = endpointUrl;
        Airtable.apiVersion = apiVersion;
        Airtable.noRetryIfRateLimited = noRetryIfRateLimited;
        Airtable.requestTimeout = requestTimeout;
    };
    Airtable.base = function (baseId) {
        return new Airtable().base(baseId);
    };
    Airtable.Base = base_1.default;
    Airtable.Record = record_1.default;
    Airtable.Table = table_1.default;
    Airtable.Error = airtable_error_1.default;
    return Airtable;
}());
module.exports = Airtable;

},{"./airtable_error":2,"./base":3,"./record":15,"./table":17}]},{},["airtable"])("airtable")
});


/***/ }),

/***/ 1782:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* unused harmony export getManifests */
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6104);
/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(997);
/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(airtable__WEBPACK_IMPORTED_MODULE_1__);


var token = 'pat5hnGRx3HBTRL2p.ba1766c854c088ded98d29939fae6335ca2b2ba5c123f5b75649c0c9f3b98e07';
airtable__WEBPACK_IMPORTED_MODULE_1___default().configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: token
});
var base = airtable__WEBPACK_IMPORTED_MODULE_1___default().base('appodaRNMUmYeBIY5');
// pat5hnGRx3HBTRL2p

function getManifests() {
  // пишем ассинхронную функцию
  // что-то пишем -- нажимаем ентер -- переход в сёрч.штмл -- генерится штмл и заполняется данными из таблицы
  return new Promise(function (resolve, reject) {
    // content -- empty arr
    var content = [];
    base('manifests').select({
      maxRecords: 100
    }).firstPage().then(function (result) {
      result.forEach(function (record) {
        content.push({
          id: record.id,
          //найди мне ячейку кот написана точно так же как в таблице
          titles: record.fields['Titles'],
          years: record.fields['Years'],
          describtions: record.fields['Describtions'],
          tags: record.fields['Tags'],
          imgs: record.fields['Images'],
          quotes: record.fields['Quotes'],
          url: record.fields['URL']
        });
      });
      //подгрузка контента
      resolve(content);
    });
  });
}


/***/ }),

/***/ 1372:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  A: () => (/* binding */ S_MenuBar)
});

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(6540);
// EXTERNAL MODULE: ./src/js/search-data.js
var search_data = __webpack_require__(1782);
// EXTERNAL MODULE: ./node_modules/classnames/index.js
var classnames = __webpack_require__(6942);
var classnames_default = /*#__PURE__*/__webpack_require__.n(classnames);
;// ./src/components/A_MainMenu.jsx
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var A_MainMenu = function A_MainMenu(_ref) {
  var text = _ref.text,
    current = _ref.current,
    url = _ref.url,
    type = _ref.type;
  var classes = classnames_default()(_defineProperty({
    A_MainMenu: true,
    current: current
  }, "".concat(type), true));
  return /*#__PURE__*/react.createElement("a", {
    href: url,
    className: classes
  }, text);
};
/* harmony default export */ const components_A_MainMenu = (A_MainMenu);

/////////////////////////////////////////////////////
;// ./src/components/A_Input.jsx

function A_Input_A_Input(_ref) {
  var value = _ref.value,
    placeholder = _ref.placeholder,
    handleInput = _ref.handleInput,
    handleSubmit = _ref.handleSubmit;
  //добавили хук (по сути просто фенкция) реф -- имеет ссылку на наш элемент
  var input = useRef();
  //конст онинпут содержит в себе анонимную функцию, которая берёт функцию инпут и передаёт в неё корректное значение инпута
  var onInput = function onInput() {
    return handleInput(input.current.value);
  };
  return /*#__PURE__*/React.createElement("input", {
    className: "A_input",
    value: value,
    ref: input,
    placeholder: placeholder,
    onInput: onInput,
    onKeyDown: function onKeyDown(e) {
      return e.key === 'Enter' && handleSubmit();
    }
  });
}
;// ./src/components/A_Button.jsx
function A_Button_typeof(o) { "@babel/helpers - typeof"; return A_Button_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, A_Button_typeof(o); }
function A_Button_defineProperty(e, r, t) { return (r = A_Button_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function A_Button_toPropertyKey(t) { var i = A_Button_toPrimitive(t, "string"); return "symbol" == A_Button_typeof(i) ? i : i + ""; }
function A_Button_toPrimitive(t, r) { if ("object" != A_Button_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != A_Button_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


function A_Button_A_Button(_ref) {
  var text = _ref.text,
    type = _ref.type,
    disabled = _ref.disabled,
    handleClick = _ref.handleClick;
  var classes = classNames(A_Button_defineProperty(A_Button_defineProperty({
    A_Button: true
  }, "".concat(type), true), "disabled", disabled));
  return /*#__PURE__*/React.createElement("div", {
    className: classes,
    onClick: handleClick
  }, text);
}

//classNames заменила на className
;// ./src/components/M_SearchForm.jsx



function M_SearchForm_M_SearchForm(_ref) {
  var searchInputValue = _ref.searchInputValue,
    isSearchButtonDisabled = _ref.isSearchButtonDisabled,
    handleInput = _ref.handleInput,
    handleSubmit = _ref.handleSubmit;
  return /*#__PURE__*/React.createElement("div", {
    className: "M_SearchForm"
  }, /*#__PURE__*/React.createElement(A_Input, {
    value: searchInputValue,
    handleInput: handleInput,
    handleSubmit: handleSubmit,
    placeholder: "\u041D\u0430\u0439\u0442\u0438 \u043C\u0430\u043D\u0438\u0444\u0435\u0441\u0442"
  }), searchInputValue != '' &&
  /*#__PURE__*/
  //по клику на крестик сёрч очищается
  React.createElement(A_Button, {
    text: "X",
    type: "resetField",
    disabled: false,
    handleClick: function handleClick() {
      return handleInput('');
    }
  }), /*#__PURE__*/React.createElement(A_Button, {
    text: "\u041F\u043E\u0438\u0441\u043A",
    type: "primary",
    disabled: isSearchButtonDisabled,
    handleClick: handleSubmit
  }));
}
;// ./src/components/A_Text.jsx
function A_Text_typeof(o) { "@babel/helpers - typeof"; return A_Text_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, A_Text_typeof(o); }
function A_Text_defineProperty(e, r, t) { return (r = A_Text_toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function A_Text_toPropertyKey(t) { var i = A_Text_toPrimitive(t, "string"); return "symbol" == A_Text_typeof(i) ? i : i + ""; }
function A_Text_toPrimitive(t, r) { if ("object" != A_Text_typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != A_Text_typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


function A_Text_A_Text(_ref) {
  var text = _ref.text,
    type = _ref.type;
  //обращаясь к библиотеке класс нэймс - если класс а_текст - то вынь его тайп (заголовок, абзац, название тега и тп)
  var classes = classNames(A_Text_defineProperty({
    A_Text: true
  }, "".concat(type), true));
  return /*#__PURE__*/React.createElement("div", {
    className: classes
  }, text);
}

//classNames заменила на className
;// ./src/components/M_PostSuggestion.jsx


function M_PostSuggestion_M_PostSuggestion(_ref) {
  var url = _ref.url,
    title = _ref.title,
    description = _ref.description;
  return /*#__PURE__*/React.createElement("a", {
    className: "M_PostSuggestion",
    href: "{url}"
  }, /*#__PURE__*/React.createElement(A_Text, {
    text: title,
    type: "h1"
  }), /*#__PURE__*/React.createElement(A_Text, {
    text: description,
    type: "p"
  }), /*#__PURE__*/React.createElement("div", {
    className: "C_PostTeaserTags"
  }, tagsEl));
}
;// ./src/components/O_SearchBar.jsx



var O_SearchBar = function O_SearchBar(_ref) {
  var searchInputValue = _ref.searchInputValue,
    isSearchButtonDisabled = _ref.isSearchButtonDisabled,
    postTeasers = _ref.postTeasers,
    handleSearchInput = _ref.handleSearchInput,
    handleSearchSubmit = _ref.handleSearchSubmit;
  var renderPostSuggestions = function renderPostSuggestions() {
    var searchLower = searchInputValue.toLowerCase();
    var clean = function clean(str) {
      return str.replace(/[\u202F\u00A0]/g, ' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase();
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "C_PostSuggestions"
    }, postTeasers.filter(function (t) {
      return clean(t.title).includes(searchLower) || clean(t.description).includes(searchLower);
    }).map(function (t) {
      return /*#__PURE__*/React.createElement(M_PostSuggestion, {
        key: t.id,
        title: t.title,
        description: t.description,
        url: t.url
      });
    }));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "O_SearchBar"
  }, /*#__PURE__*/React.createElement(M_SearchForm, {
    searchInputValue: searchInputValue,
    isSearchButtonDisabled: isSearchButtonDisabled,
    handleSearchInput: handleSearchInput,
    handleSearchSubmit: handleSearchSubmit
  }), searchInputValue.length >= 3 && !isSearchButtonDisabled && renderPostSuggestions());
};
/* harmony default export */ const components_O_SearchBar = ((/* unused pure expression or super */ null && (O_SearchBar)));
;// ./src/components/S_MenuBar.jsx




function S_MenuBar(_ref) {
  var initialSearchValue = _ref.searchInputValue,
    prerender = _ref.prerender,
    menu = _ref.menu,
    homeURL = _ref.homeURL;
  var currentURL = !prerender ? window.location.href : '';
  var menuElements = menu.map(function (_ref2, i) {
    var text = _ref2.text,
      url = _ref2.url;
    var linkURL = homeURL + url; // уникальный адрес для каждой страницы, например http://localhost:8080/articles.html
    return /*#__PURE__*/react.createElement(components_A_MainMenu, {
      key: i,
      current: linkURL === currentURL,
      text: text,
      url: linkURL,
      type: "mainMenuItem"
    });
  });
  return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement(components_A_MainMenu, {
    current: false,
    text: "",
    url: homeURL,
    type: "mainMenuLogo"
  }), /*#__PURE__*/react.createElement("div", {
    className: "C_MainMenu"
  }, menuElements));
}

///////////////////////////////////////////////////////////////

/***/ }),

/***/ 629:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_reset_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5875);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_vars_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8250);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_fonts_scss__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1678);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_basics_scss__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9479);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_select_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(9100);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_index_scss__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1552);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_atoms_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(7845);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_moleculs_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(7363);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_wrappers_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(2773);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_collections_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(414);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_organisms_scss__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(4950);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_components_superorganisms_scss__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(9097);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_stylesheets_clock_scss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(8882);
// Imports















var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_reset_scss__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_vars_scss__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_fonts_scss__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_basics_scss__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_select_scss__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_index_scss__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_atoms_scss__WEBPACK_IMPORTED_MODULE_8__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_moleculs_scss__WEBPACK_IMPORTED_MODULE_9__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_wrappers_scss__WEBPACK_IMPORTED_MODULE_10__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_collections_scss__WEBPACK_IMPORTED_MODULE_11__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_organisms_scss__WEBPACK_IMPORTED_MODULE_12__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_components_superorganisms_scss__WEBPACK_IMPORTED_MODULE_13__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_stylesheets_clock_scss__WEBPACK_IMPORTED_MODULE_14__/* ["default"] */ .A);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ``, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 9479:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `body{
    line-height: 1.3;
}

h1{
    font-family: Helvetica;
    font-size: 3.6vw;
}

h2{
    font-family: Helvetica;
    font-size: 2vw;
}

h3{
    font-family: Helvetica;
    font-size: 12vw;
}


p{
    font-family: Helvetica;
    font-size: 1.4vw;  
}

h4{
    font-size: 4vw;
    font-family: arial unicode;
}

a{
    font-family: Helvetica;
    font-size: 1.4vw;  
    text-decoration: none;
    color:inherit;
}

.Special_link{
    text-decoration: underline;
    cursor: pointer;
}

#email {
    font-family: Helvetica;
    border: none;
    color: inherit;
    padding: 0;
    text-align: left;
    font-size: 1.4vw; 
    border-bottom: 0.15vw solid currentColor; 
    outline: none;
}

.Down{
    margin-bottom: 0.6vh;
}

#center_txt{
    text-align: center;
}

#Logo_in_Footer{
    width: 10vw;
}
  

@media all and (max-width: 800px){
    p{
        font-size: 1.7vw;  
    }
    
    a{
        font-size: 1.7vw;  
    }
  
    #email {
        font-size: 1.7vw; 
    }
  
    input[type=search]{
        font-family: Helvetica;
        font-size: 1.7vw; 
    }
  
}
  
  
  @media all and (max-width: 680px){
    p{
        font-size: 2vw;  
    }
    
    a{
        font-size: 2vw;  
    }
  
    #email {
        font-size: 2vw; 
    }

    input[type=search]{
        font-family: Helvetica;
        font-size: 2vw; 
    }

    h2{
        font-size: 3vw;
    }
}
  
  
  
  @media all and (max-width: 480px){
    p{
        font-size: 3vw;  
    }
    
    a{
        font-size: 3vw;  
    }
  
    #email {
        font-size: 3vw; 
    }

    input[type=search]{
        font-family: Helvetica;
        font-size: 3vw; 
    }

    h2{
        font-size: 4vw;
    }

    h1{
        font-size: 5vw;
    }


}



















.O_Search {
    display: flex;
    align-items: center;
    gap: 2vw;

    width: 92%;
    padding: 1.5vw 3vw;
    font-family: Helvetica;
    font-size: 1.4vw;
}
  
.A_SearchInput {
    font-family: Helvetica;
    font-size: 1.4vw;
    border: none;
    border-bottom: 0.15vw solid rgba(150, 150, 150, 1);
    
    width: 100vw;
    height: 4vw;
    background-color: transparent;
    padding: 1px 8px;
  
    &:focus {
      box-shadow: none;
      outline: none;
    }
}
  
.A_SearchButton {
    width: 20%;
    height: 4.2vw;
    padding: 1px 8px;

    background-color: black;
    color: white;
    cursor: pointer;
    user-select: none;
    text-align: center;
    align-content: center;
  
    &.disable {
      background-color: lightgray;
      color: grey;
      cursor: default;
    }
}

















.A_Input{
    font-family: Helvetica;
    font-size: 1.4vw;
    border: none;
    border-bottom: 0.15vw solid rgba(150, 150, 150, 1);
    
    width: 100vw;
    height: 4vw;
    background-color: transparent;
    padding: 1px 8px;
  
    &:focus {
      box-shadow: none;
      outline: none;
    }
}

.M_SearchForm{
    display: flex;
    align-items: center;
    gap: 2vw;

    width: 92%;
    padding: 1.5vw 3vw;
    font-family: Helvetica;
    font-size: 1.4vw;
}

.A_Button{
    width: 20%;
    height: 4.2vw;
    padding: 1px 8px;

    background-color: black;
    color: white;
    cursor: pointer;
    user-select: none;
    text-align: center;
    align-content: center;
  
    &.disable {
      background-color: lightgray;
      color: grey;
      cursor: default;
    }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 8882:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.Clock_2020,
.Clock_1910,
.Clock_1920,
.Clock_1930,
.Clock_1940,
.Clock_1950,
.Clock_1960,
.Clock_1970,
.Clock_1980,
.Clock_1990,
.Clock_2000,
.Clock_2010 {
    display: none;
}

.Twenties:hover{
    color: rgb(105, 105, 105);
}
.NineteenTen:hover{
    color: rgb(105, 105, 105);
}
.NineteenThirty:hover{
    color: rgb(105, 105, 105);
}
.NineteenFourty:hover{
    color: rgb(105, 105, 105);
}
.NineteenFifty:hover{
    color: rgb(105, 105, 105);
}
.NineteenSixty:hover{
    color: rgb(105, 105, 105);
}
.NineteenSeventy:hover{
    color: rgb(105, 105, 105);
}
.NineteenEighty:hover{
    color: rgb(105, 105, 105);
}
.NineteenNinety:hover{
    color: rgb(105, 105, 105);
}
.TwoThousand:hover{
    color: rgb(105, 105, 105);
}
.TwentyTen:hover{
    color: rgb(105, 105, 105);
}
.NineteenTwenty:hover {
    color: rgb(105, 105, 105);
}


.Twenties_Display_Time,
.NineteenTen_Display_Time,
.NineteenTwenty_Display_Time,
.NineteenThirty_Display_Time,
.NineteenFourty_Display_Time,
.NineteenFifty_Display_Time,
.NineteenSixty_Display_Time,
.NineteenSeventy_Display_Time,
.NineteenEighty_Display_Time,
.NineteenNinety_Display_Time,
.TwoThousand_Display_Time,
.TwentyTen_Display_Time{
    display: none;
}

`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 7845:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.A_Hand {
    &.Hour {
      width: 8vw;
      height: 0.31vw;
      background-color: black;
  
      position: absolute;
      transform-origin: center left;
      top: calc(50%);
      left: 50%;
      transform: rotate(270deg);
    }
    &.Minute {
      width: 10vw;
      height: 0.31vw;
      background-color: rgb(255, 0, 0);
  
      position: absolute;
      transform-origin: center left;
      top: calc(45%);
      left: 50%;
      transform: rotate(270deg);
    }
  }

  .Main_Display_Time{
    display: block;
  }
  .A_Time {
    width: 23vw;
    position: absolute;
    top: 43%;
    left: 50%;
    
    text-decoration: none;
    font-family: Helvetica;
    font-size: 3.6vw;
    cursor: pointer;
    z-index: 0;
  
    &.right_side {
      text-align: right;
      transform-origin: center left;
  
      &:nth-of-type(1) {
        transform: rotate(-90deg);
      }
      &:nth-of-type(2) {
        transform: rotate(-60deg);
      }
      &:nth-of-type(3) {
        transform: rotate(-30deg);
      }
      &:nth-of-type(4) {
        transform: rotate(0deg);
      }
      &:nth-of-type(5) {
        transform: rotate(30deg);
      }
      &:nth-of-type(6) {
        transform: rotate(60deg);
      }
      &:nth-of-type(7) {
        transform: rotate(90deg);
      }
    }
    &.left_side {
      text-align: left;
      transform-origin: center right;
      left: calc(50% - 23vw);
  
      &:nth-of-type(8) {
        transform: rotate(-60deg);
      }
      &:nth-of-type(9) {
        transform: rotate(-30deg);
      }
      &:nth-of-type(10) {
        transform: rotate(0deg);
      }
      &:nth-of-type(11) {
        transform: rotate(30deg);
      }
      &:nth-of-type(12) {
        transform: rotate(60deg);
      }
    }
}

.A_Time:hover{
  color: rgb(105, 105, 105);
}

.A_Messager_Bar {
  width: 100%;
  height: 4vw;
  position: relative;
  display: flex;
  justify-content: end;
  font-family: Helvetica;
  color: rgba(150, 150, 150, 1);
  cursor: pointer;
  padding: 1vw 3vw;
  box-sizing: border-box;
  justify-self: center;
}
  
.A_Link {
  text-decoration: none;
  position: relative;
}

.A_Link::after{
  content: ""; 
  position: absolute;
  left: 0;
  bottom: -0.1vh; 
  width: 100%;
  height: 0.13vw; 
  background-color: currentColor;
}
  
.A_Search {
    font-family: Helvetica;
    font-size: 1.4vw;  
    border-bottom: 0.15vw solid rgba(150, 150, 150, 1);
    color: rgba(150, 150, 150, 1);
    margin-bottom: 0vw;
    margin-left: auto; 
}
  
.A_Search form input[type='search'] {
    font-family: Helvetica;
    font-size: 1.4vw;  
    border: 0;
    outline: none;
    cursor: text;
}
  
input::placeholder {
    text-align: left;
    font-size: 1.4vw;  
}

input[type="search"]::placeholder {
  color: rgba(150, 150, 150, 1); 
}

input[type="email"]::placeholder {
  color: currentColor; 
  font-weight: bold;
}

.A_Picture {
  width: 30.8vw;
  height: 100%;
}



  
.A_Quote{
    font-family: Helvetica;
    font-size: 1.25rem;  
    color: black;
    width: 30.8vw;
    padding: 1vw 0;
}

.A_Arrow_Back{
    cursor: pointer;
    width: 10vw;
}

.A_Mail form input[type='email'] {
    font-family: Helvetica;
    font-size: 1.4vw;  
    border: none;
    outline: none;
    cursor: text;
    text-align: left;
    padding: 0;
}

.A_Rights{
    width: 50%;
    text-align: left;
    color: inherit;
}
  
.A_Logo_in_Footer{
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.A_Nav{
  color: rgba(150, 150, 150, 1);
}

.A_Nav:hover{
  color: rgb(105, 105, 105);
}

.Active{
  color:black;
}

  
.A_Info_Icon{
  position: absolute;
  cursor: copy;
  z-index: 10;
}

.A_Info_Block{
  width: 100%;
  height: inherit;
  bottom: 0%;
  display: none;
  position: fixed;
  background-color: aqua;
  z-index: 10;
  color: rgb(0, 0, 0);

  font-family: Helvetica;
  font-size: 3vw;
  text-align: center;
  padding-top: 1vw;
  padding-bottom: 1vw;
}



.A_Info_Block_Mani{
  width: 100%;
  height: inherit;
  bottom: 0;
  display: none;
  position: fixed;
  background-color: aqua;
  z-index: 10;
  color: rgb(0, 0, 0);

  font-family: Helvetica;
  font-size: 3vw;
  text-align: center;
  padding-top: 1vw;
  padding-bottom: 1vw;
  align-self: flex-end;

  transition: opacity 0.3s ease, visibility 0.3s ease;

}











.A_Images_in_Slider {
  width: 100%;
  display: block;
}

.A_Images_in_Slider img{
  width: 100%;
  height: auto;
  display: none;
}

.A_Images_in_Slider img.activ_img {
  display: block;
}

.A_Arrow_Backwards, .A_Arrow_Forwards {
  /* font-size: 3vw; */
  width: 2vw;
  cursor: pointer;
  user-select: none
}

.A_Count_for_Slider{
  font-family: Helvetica;
  font-size: 3.6vw; 
  padding-bottom: 2vw;
}


.A_Name_of_Manifest{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}


.A_Lil_Txt_Manifest{
  padding-left: 5vw;
}

.A_Text_Area_in_Notes{
  border: solid black 1.5px;
  height: 18vw;
  font-size: 1.4vw;
  font-family: Helvetica;
  padding: 1vw;
}

.A_Save_Note_Button{
  border: none;
  background-color: white;
  font-size: 1.4vw;
  font-family: Helvetica;
  font-weight: bold;
  text-align: left;
  padding-left: 0vw;
  cursor: pointer;
}

.A_link_txt{
  display: flex;
  flex-direction: column;
  gap: 0vw;
  padding-bottom: 1vw;
}

.A_Pic_AbtUS_width{
  width: 100%;
}

.A_Time_Icon{
  position: absolute;
  cursor: copy;
  z-index: 10;
}

.A_Time_Icon_Close{
  position: absolute;
  cursor: copy;
}






.A_Pic_Article{
  width: 100%;
}

.A_Text_of_Article{
  width: 50%;
  display: none;
  flex-direction: column;
  justify-content: center;
  justify-self: center;
  gap: 1vw;
  padding-bottom: 2vw;
}

.A_Button_Article{
  cursor: pointer;
  rotate: 0deg;
  transition: 300ms ease all;
}

.A_Button_Article {
  transition: transform 0.3s ease;
}
.A_Text_of_Article {
  transition: opacity 0.3s ease, transform 0.3s ease;
  p {
    padding-bottom: 2vw;
  }
}



.A_Logo_in_AbtUs{
  display: none;
}









.A_Pic_for_Article{
  width: 100%;
  display: flex;
  position: relative;
}


.First_P{
  z-index: 10;
  position: absolute;
}

.Second_P{
  z-index: 3;
  position: relative;
}



.A_Color {
  width: 100%;
  height: 100%;
  z-index: 10;
  position: absolute;
  transition: all 1s ease-in-out;
  background-color: transparent; 
  mix-blend-mode: screen;
  pointer-events: auto; /* Чтобы hover работал */
}

.A_Color:hover {
  mix-blend-mode: screen;
  transition: all 1.2s ease-in-out;
}

.A_Manifest_Text{
  transition: all 1.2s ease-in-out;
}

.A_Color_Text{
  transition: all 1s ease-in-out;
  background-color: transparent; /* Лучше использовать transparent вместо none */
  mix-blend-mode: screen;
  pointer-events: auto; /* Чтобы hover работал */
}

.A_Color_Text:hover{
  mix-blend-mode: screen;
  transition: all 1s ease-in-out;
}

.A_RandColorFill{
  transition: all 1s ease-in-out;
  background-color: transparent;
  pointer-events: auto;
}

.A_RandColorFill:hover{
  transition: all 1s ease-in-out;
}


.Random_Position_Article_Icon{
  position: absolute;
  cursor: copy;
  z-index: 100;
}

.A_Dada_Gifka{
  display: none;
  position: absolute;
  align-self: center;
  z-index: 100;
}

.A_Gifka{
  display: none;
  position: absolute;
  align-self: center;
  z-index: 100;
}



.A_Lil_box_for_arrow_and_txt{
  display: flex;
  flex-direction: row;
}

.A_Lil_Arrow_Txt{
  margin-top: 1vw;
  margin-left: -1vw;
}


.Color_Change{
  display: flex;
  position: relative;
}



















#A_Video_Reflect{
  width: 76%;
  border: white 2px;
  padding-bottom: 2vw;
}

#A_P_Reflect{
  width: 70%;
}











































@media all and (max-width: 1600px){
  .A_Hand {
    &.Hour {
      top: calc(46%);
  }}
}






@media all and (max-width: 800px){

  .A_Save_Note_Button{
    font-size: 1.7vw; 
  }

  .A_Hand {
    &.Hour {
      top: calc(46%);
  }}

  #A_Video_Reflect{
    width: 100%;
    padding-bottom: 0;
  }

  .A_Text_Area_in_Notes {
    border: solid black 1px;
  }

  .A_Button_Article {
    width: 4vw;
    margin-top: -1vw;
  }

  #A_Icon_Resize{
    width: 5.5vw;
  }

}


@media all and (max-width: 680px){
  .A_Picture{
      width: 40vw;
  }

  .A_Quote{
      width: 40vw;
  }

  .A_Hand {
    &.Hour {
      top: calc(45%);
  }}

  .A_Save_Note_Button{
    font-size: 2vw; 
  }

  .A_Text_Area_in_Notes {
    border: solid black 1px;
  }

  .A_link_txt{
    padding-bottom: 2vw;
  }

  input::placeholder {
    text-align: left;
    font-size: 2vw;  
  }
  
  #A_P_AbtUs_Resize{
    font-size: 2.2vw;
  }

  #A_h3_Display{
    display: none;
  }

  .A_Logo_in_AbtUs{
    display: flex;
    align-self: center;
  }

  #A_Logo_Svg_Resize_AbtUs{
    width: 100vw;
    align-self: center;
  }

  #A_Video_Reflect{
    width: 100%;
    padding-bottom: 0;
  }

  #A_P_Reflect{
    padding-bottom: 2vw;
  }

  .A_Button_Article {
    width: 3.8vw;
    margin-top: -1.5vw;
  }

  #A_Icon_Resize{
    width: 6vw;
  }
  
  .A_Time {
    width: 35vw;
    position: absolute;
    /* top: 43%; */
    left: 50%;
    text-decoration: none;
    font-family: Helvetica;
    font-size: 6vw;
    cursor: pointer;
    z-index: 0;
}


  .A_Time {
    &.left_side {
        text-align: left;
        transform-origin: center right;
        left: calc(50% - 35vw);
    }
  }

  .A_Hand {
    &.Hour {
        width: 12vw;
    }
  }
}



@media all and (max-width: 480px){
  .A_Picture{
      width: 40vw;
  }

  .A_Quote{
      width: 40vw;
  }

  .A_Hand {
    &.Hour {
      top: calc(45%);
    }}

  .A_Mail{
    width: 100%;
  }
  
  .A_Rights{
    width: 100%;
  }

  .A_Logo_in_Footer{
    width: 100%;
  }

  #A_Logo_Svg_Resize{
    width: 20vw;
  }

  #A_Icon_Resize{
    width: 6vw;
  }

  .A_Save_Note_Button{
    font-size: 2.5vw; 
  }

  .A_Text_Area_in_Notes {
    border: solid black 1px;
  }

  .A_link_txt{
    padding-bottom: 2.5vw;
  }

  .A_Button_Article {
    width: 5vw;
    margin-top: -2vw;
  }

  .A_Color_Text{
    font-size: 6vw;
  }


  input::placeholder {
    text-align: left;
    font-size: 2.5vw;  
  }

  .A_Search form input[type='search'] {
    height: 3vw;
  }

  .A_Text_of_Article{
    width: 70%;
  }

  .A_Img_Resize{
    width: 7%;
  }

  #A_P_AbtUs_Resize{
    font-size: 3vw;
  }

  #A_h3_Display{
    display: none;
  }

  .A_Logo_in_AbtUs{
    display: flex;
    align-self: center;
  }

  #A_Logo_Svg_Resize_AbtUs{
    width: 100vw;
    align-self: center;
  }

  #A_Video_Reflect{
    width: 100%;
    padding-bottom: 0;
  }

  #A_P_Reflect{
    width: 100%;
    padding-bottom: 2vw;
  }




  .A_Time {
    width: 35vw;
    position: absolute;
    /* top: 43%; */
    left: 50%;
    text-decoration: none;
    font-family: Helvetica;
    font-size: 6vw;
    cursor: pointer;
    z-index: 0;
}


  .A_Time {
    &.left_side {
        text-align: left;
        transform-origin: center right;
        left: calc(50% - 35vw);
    }
  }


  .A_Hand {
    &.Hour {
        width: 12vw;
    }
}

}









































.O_ContentItem{
  display: flex;
  justify-content: flex-start; 
  align-items: flex-start; 
  gap: 2vw;

  
  height: 22vw;
  border-bottom: 0.16vw solid rgba(150, 150, 150, 1);
  padding: 1.5vw 3vw;
  background-color: rgba(79, 40, 96, 0);
  cursor: pointer;
}


.A_ContentItemTitle{
  font-family: Helvetica;
  font-size: 3.6vw;
}

.A_ContentItemImg{
  width: 30.8vw;
  height: 100%;
}

.C_ContentItemTags{
  width: 50%;
}

.A_ContentItemTag{
  font-family: Helvetica;
  font-size: 1.4vw;
}

.A_ContentItemDescribtion{
  font-family: Helvetica;
  font-size: 1.4vw;
}

`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 414:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.C_Menu_Bar {
    width: 100%;
    height: 5%;
    position: sticky;
    background-color: rgb(255, 255, 255);
    font-family: Helvetica;
    display: flex;
    gap: 5vw;
    padding: 1vw 3vw;
    justify-self: center;
    align-items: center;
    justify-content: left;
    cursor: pointer;
    box-sizing: border-box;
}

.C_Name_and_Arrow{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    padding-bottom: 2vw;
}

.C_MainMenu{
    display: flex;
    gap: 5vw;
    height: 5%;
}

@media all and (max-width: 480px){
    .C_Menu_Bar {
        height: 7%;
    }

    .C_MainMenu{
        height: 7%;
    }
}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 7363:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.M_Manifest_Text {
    display: flex;
    align-items: start;
    justify-content: space-between;
    flex-direction: column;
    padding: 1vw 0;
}

.M_Img_and_Text{
    display: flex;
    flex-direction: column;
    
    justify-content: space-between;
    gap: 2vw;
}

.M_Info_in_Footer{
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 10vw;
    flex-direction: row;
    font-weight: bold;
}

.M_Rights_and_Logo{
    display: flex;
    flex-direction: row;
    align-items: center;
    font-weight: bold;
    padding-top: 2vw;
}

.M_Text_Block_Left{
    width: 70%;
    display: flex;
    flex-direction: column;
    gap: 2vw;
}

.M_Notes{
    display: flex;
    position: sticky;
    flex-direction: column;
    gap: 1vw;
}

.M_Links{
    padding-top: 4vw;
}

.M_Pic_and_Txt_Reflection{
    display: flex;
    flex-direction: row;
    
    justify-content: left;
    gap: 2vw;
    padding-top: 2vw;
}

.M_Name_and_Cross_Article{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 1vw;
    padding-bottom: 1vw;
}



@media all and (max-width: 800px){
    .M_Pic_and_Txt_Reflection{
        width: 100%;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: left;
    }
}


@media all and (max-width: 480px){
    .M_Info_in_Footer {
        flex-wrap: wrap;
        gap: 5vw 1vw;
        padding-bottom: 3vw;
    }

    .M_Rights_and_Logo{
        gap: 1vw;
        justify-content: left;
        flex-wrap: wrap;
    }

    .M_Name_and_Cross_Article{
        height: 7vw;
        padding-bottom: 3vw;
    }

    .M_Text_Block_Left{
        width: 90%;
    }

    .M_Pic_and_Txt_Reflection{
        width: 100%;
        flex-wrap: wrap;
        justify-content: left;
    }

}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 4950:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.O_Clock {
    margin: 3vw 0vw 4vw 0vw;
    width: 100%;
    height: 72vh;
    position: relative;
}

.O_Manifest_Card {
    display: flex;
    justify-content: left;
    justify-self: center;
    gap: 2vw;
    height: 22vw;
    border-bottom: 0.16vw solid rgba(150, 150, 150, 1);
    padding: 1.5vw 3vw;
    background-color: rgba(79, 40, 96, 0);
    cursor: pointer;
    overflow: hidden;
}

.O_Footer{
    padding: 1.5vw 3vw;
    border-top: 0.16vw solid rgba(150, 150, 150, 1);
    margin-top: -0.16vw;
}

.O_Slider {
    justify-self: center;
    width: 73.5%;
    height: 80%;
    display: flex;
    justify-content: space-between;
    gap: 5vw;
    padding: 2vw 5vw 0vw 5vw;
    align-items: center;
}

.O_Notes_and_Links{
    width: 38%;
    border-left: 0.16vw solid rgba(150, 150, 150, 1);
    padding-left: 2vw;
    padding-bottom: 0vw;
    display: flex;
    justify-content: space-between;
    flex-direction: column;

}

.O_Abt_Us_block{
    width: 25%;
    gap: 1vw;
}

.O_Gif_and_Time{
    display: none;
    position: fixed;
    width: 100%;
    height: 100vh;
    justify-content: center;
    background-color: white;
    background-image: none;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 100;
    align-items: center;
    font-size: 9vw;
    font-family: Helvetica;
}

.O_Reflect_Block{
    padding: 1.5vw 3vw;
    display: flex;
    flex-direction: column;
}








@media all and (max-width: 680px){
 
  
    .O_Manifest_Card{
      height: 35%;
    }
 
    
    .O_Abt_Us_block{
        width: 100%;
        padding-bottom: 2vw;
    }

    .O_Clock {
        height: 90vh;
        position: relative;
    }
  
  }

  
@media all and (max-width: 480px){
    .O_Manifest_Card{
      height: 40%;
    }

    .O_Abt_Us_block{
        width: 100%;
        padding-bottom: 2vw;
    }

    
  .O_Clock {
    height: 90vh;
    position: relative;
}


}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 9097:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.S_All_About_Us{
    display: flex;
    flex-direction: row;
    padding: 1vw 3vw;
    gap: 2vw;
}

.S_All_Articles{
    padding: 1vw 3vw;
    display: flex;
    flex-direction: column;
}

.S_MenuBar{
    display: flex;
}

@media all and (max-width: 680px){

    .S_All_About_Us{
        flex-wrap: wrap;
        flex-direction: column;
    }

}

@media all and (max-width: 480px){

    .S_All_About_Us{
        flex-wrap: wrap;
        flex-direction: column;
    }

}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 2773:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.W_Manifests_Container {
    width: 100%;
    display: flex;
    justify-self: center;
    flex-direction: column;
}

.W_Manifest_Pic_and_Text{
    padding: 1.5vw 3vw;
}

.W_Manifest_Pic_and_Slider{
    padding-left: 3vw;
    padding-right: 3vw;
}

.W_Text_and_Notes{
    display: flex;
    flex-direction: row;
    gap: 3vw;
}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 1678:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4417);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(334), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `@font-face {
  font-family: 'Helvetica';
  src: url(${___CSS_LOADER_URL_REPLACEMENT_0___}) format('truetype');
  font-weight: 400;
  font-style: normal;
}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 1552:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root {
  --i: 30;
}

body {
  box-sizing: border-box;
}





























`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5875:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
*/

html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}
body {
  line-height: 1;
}
ol,
ul {
  list-style: none;
}
blockquote,
q {
  quotes: none;
}
blockquote:before,
blockquote:after,
q:before,
q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 9100:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.S_Articles{
    padding: 2rem;
}
.A_ArticleHeader{
    font-weight: bold;
    font-size: 2rem;
}
.M_FilterTags{
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}
.A_FilterTag{
    background-color: white;
    color: blue;
    border: 2px solid blue;
    padding: 0.5rem 1rem;
    border-radius: 2rem;

    &.active{
        background-color: blue;
        color: white;
    }

    &:hover{
        background-color: rgb(160, 160, 255);
        transition: background 0.8s ease;
    }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 8250:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root {
  --white: white;
  --black: black;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 6314:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 4417:
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ 1601:
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 6047:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * react-dom-server-legacy.browser.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*


 JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)

 Copyright (c) 2011 Gary Court
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

var React = __webpack_require__(6540),
  ReactDOM = __webpack_require__(961);
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
  REACT_PROVIDER_TYPE = Symbol.for("react.provider"),
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
  REACT_MEMO_TYPE = Symbol.for("react.memo"),
  REACT_LAZY_TYPE = Symbol.for("react.lazy"),
  REACT_SCOPE_TYPE = Symbol.for("react.scope"),
  REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
  REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"),
  REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"),
  REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"),
  MAYBE_ITERATOR_SYMBOL = Symbol.iterator,
  isArrayImpl = Array.isArray;
function murmurhash3_32_gc(key, seed) {
  var remainder = key.length & 3;
  var bytes = key.length - remainder;
  var h1 = seed;
  for (seed = 0; seed < bytes; ) {
    var k1 =
      (key.charCodeAt(seed) & 255) |
      ((key.charCodeAt(++seed) & 255) << 8) |
      ((key.charCodeAt(++seed) & 255) << 16) |
      ((key.charCodeAt(++seed) & 255) << 24);
    ++seed;
    k1 =
      (3432918353 * (k1 & 65535) +
        (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
      4294967295;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) &
      4294967295;
    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (5 * (h1 & 65535) + (((5 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
    h1 = (h1 & 65535) + 27492 + ((((h1 >>> 16) + 58964) & 65535) << 16);
  }
  k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
    case 2:
      k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
    case 1:
      (k1 ^= key.charCodeAt(seed) & 255),
        (k1 =
          (3432918353 * (k1 & 65535) +
            (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
          4294967295),
        (k1 = (k1 << 15) | (k1 >>> 17)),
        (h1 ^=
          (461845907 * (k1 & 65535) +
            (((461845907 * (k1 >>> 16)) & 65535) << 16)) &
          4294967295);
  }
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 =
    (2246822507 * (h1 & 65535) + (((2246822507 * (h1 >>> 16)) & 65535) << 16)) &
    4294967295;
  h1 ^= h1 >>> 13;
  h1 =
    (3266489909 * (h1 & 65535) + (((3266489909 * (h1 >>> 16)) & 65535) << 16)) &
    4294967295;
  return (h1 ^ (h1 >>> 16)) >>> 0;
}
var assign = Object.assign,
  hasOwnProperty = Object.prototype.hasOwnProperty,
  VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ),
  illegalAttributeNameCache = {},
  validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
    return !0;
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
    return (validatedAttributeNameCache[attributeName] = !0);
  illegalAttributeNameCache[attributeName] = !0;
  return !1;
}
var unitlessNumbers = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  ),
  aliases = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]),
  matchHtmlRegExp = /["'&<>]/;
function escapeTextForBrowser(text) {
  if (
    "boolean" === typeof text ||
    "number" === typeof text ||
    "bigint" === typeof text
  )
    return "" + text;
  text = "" + text;
  var match = matchHtmlRegExp.exec(text);
  if (match) {
    var html = "",
      index,
      lastIndex = 0;
    for (index = match.index; index < text.length; index++) {
      switch (text.charCodeAt(index)) {
        case 34:
          match = "&quot;";
          break;
        case 38:
          match = "&amp;";
          break;
        case 39:
          match = "&#x27;";
          break;
        case 60:
          match = "&lt;";
          break;
        case 62:
          match = "&gt;";
          break;
        default:
          continue;
      }
      lastIndex !== index && (html += text.slice(lastIndex, index));
      lastIndex = index + 1;
      html += match;
    }
    text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
  }
  return text;
}
var uppercasePattern = /([A-Z])/g,
  msPattern = /^ms-/,
  isJavaScriptProtocol =
    /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
  return isJavaScriptProtocol.test("" + url)
    ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
    : url;
}
var ReactSharedInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  ReactDOMSharedInternals =
    ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  sharedNotPendingObject = {
    pending: !1,
    data: null,
    method: null,
    action: null
  },
  previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
  f: previousDispatcher.f,
  r: previousDispatcher.r,
  D: prefetchDNS,
  C: preconnect,
  L: preload,
  m: preloadModule,
  X: preinitScript,
  S: preinitStyle,
  M: preinitModuleScript
};
var PRELOAD_NO_CREDS = [],
  scriptRegex = /(<\/|<)(s)(cript)/gi;
function scriptReplacer(match, prefix, s, suffix) {
  return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
}
function createResumableState(
  identifierPrefix,
  externalRuntimeConfig,
  bootstrapScriptContent,
  bootstrapScripts,
  bootstrapModules
) {
  return {
    idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
    nextFormID: 0,
    streamingFormat: 0,
    bootstrapScriptContent: bootstrapScriptContent,
    bootstrapScripts: bootstrapScripts,
    bootstrapModules: bootstrapModules,
    instructions: 0,
    hasBody: !1,
    hasHtml: !1,
    unknownResources: {},
    dnsResources: {},
    connectResources: { default: {}, anonymous: {}, credentials: {} },
    imageResources: {},
    styleResources: {},
    scriptResources: {},
    moduleUnknownResources: {},
    moduleScriptResources: {}
  };
}
function createPreambleState() {
  return {
    htmlChunks: null,
    headChunks: null,
    bodyChunks: null,
    contribution: 0
  };
}
function createFormatContext(insertionMode, selectedValue, tagScope) {
  return {
    insertionMode: insertionMode,
    selectedValue: selectedValue,
    tagScope: tagScope
  };
}
function getChildFormatContext(parentContext, type, props) {
  switch (type) {
    case "noscript":
      return createFormatContext(2, null, parentContext.tagScope | 1);
    case "select":
      return createFormatContext(
        2,
        null != props.value ? props.value : props.defaultValue,
        parentContext.tagScope
      );
    case "svg":
      return createFormatContext(4, null, parentContext.tagScope);
    case "picture":
      return createFormatContext(2, null, parentContext.tagScope | 2);
    case "math":
      return createFormatContext(5, null, parentContext.tagScope);
    case "foreignObject":
      return createFormatContext(2, null, parentContext.tagScope);
    case "table":
      return createFormatContext(6, null, parentContext.tagScope);
    case "thead":
    case "tbody":
    case "tfoot":
      return createFormatContext(7, null, parentContext.tagScope);
    case "colgroup":
      return createFormatContext(9, null, parentContext.tagScope);
    case "tr":
      return createFormatContext(8, null, parentContext.tagScope);
    case "head":
      if (2 > parentContext.insertionMode)
        return createFormatContext(3, null, parentContext.tagScope);
      break;
    case "html":
      if (0 === parentContext.insertionMode)
        return createFormatContext(1, null, parentContext.tagScope);
  }
  return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode
    ? createFormatContext(2, null, parentContext.tagScope)
    : parentContext;
}
var styleNameCache = new Map();
function pushStyleAttribute(target, style) {
  if ("object" !== typeof style) throw Error(formatProdErrorMessage(62));
  var isFirst = !0,
    styleName;
  for (styleName in style)
    if (hasOwnProperty.call(style, styleName)) {
      var styleValue = style[styleName];
      if (
        null != styleValue &&
        "boolean" !== typeof styleValue &&
        "" !== styleValue
      ) {
        if (0 === styleName.indexOf("--")) {
          var nameChunk = escapeTextForBrowser(styleName);
          styleValue = escapeTextForBrowser(("" + styleValue).trim());
        } else
          (nameChunk = styleNameCache.get(styleName)),
            void 0 === nameChunk &&
              ((nameChunk = escapeTextForBrowser(
                styleName
                  .replace(uppercasePattern, "-$1")
                  .toLowerCase()
                  .replace(msPattern, "-ms-")
              )),
              styleNameCache.set(styleName, nameChunk)),
            (styleValue =
              "number" === typeof styleValue
                ? 0 === styleValue || unitlessNumbers.has(styleName)
                  ? "" + styleValue
                  : styleValue + "px"
                : escapeTextForBrowser(("" + styleValue).trim()));
        isFirst
          ? ((isFirst = !1),
            target.push(' style="', nameChunk, ":", styleValue))
          : target.push(";", nameChunk, ":", styleValue);
      }
    }
  isFirst || target.push('"');
}
function pushBooleanAttribute(target, name, value) {
  value &&
    "function" !== typeof value &&
    "symbol" !== typeof value &&
    target.push(" ", name, '=""');
}
function pushStringAttribute(target, name, value) {
  "function" !== typeof value &&
    "symbol" !== typeof value &&
    "boolean" !== typeof value &&
    target.push(" ", name, '="', escapeTextForBrowser(value), '"');
}
var actionJavaScriptURL = escapeTextForBrowser(
  "javascript:throw new Error('React form unexpectedly submitted.')"
);
function pushAdditionalFormField(value, key) {
  this.push('<input type="hidden"');
  validateAdditionalFormField(value);
  pushStringAttribute(this, "name", key);
  pushStringAttribute(this, "value", value);
  this.push("/>");
}
function validateAdditionalFormField(value) {
  if ("string" !== typeof value) throw Error(formatProdErrorMessage(480));
}
function getCustomFormFields(resumableState, formAction) {
  if ("function" === typeof formAction.$$FORM_ACTION) {
    var id = resumableState.nextFormID++;
    resumableState = resumableState.idPrefix + id;
    try {
      var customFields = formAction.$$FORM_ACTION(resumableState);
      if (customFields) {
        var formData = customFields.data;
        null != formData && formData.forEach(validateAdditionalFormField);
      }
      return customFields;
    } catch (x) {
      if ("object" === typeof x && null !== x && "function" === typeof x.then)
        throw x;
    }
  }
  return null;
}
function pushFormActionAttribute(
  target,
  resumableState,
  renderState,
  formAction,
  formEncType,
  formMethod,
  formTarget,
  name
) {
  var formData = null;
  if ("function" === typeof formAction) {
    var customFields = getCustomFormFields(resumableState, formAction);
    null !== customFields
      ? ((name = customFields.name),
        (formAction = customFields.action || ""),
        (formEncType = customFields.encType),
        (formMethod = customFields.method),
        (formTarget = customFields.target),
        (formData = customFields.data))
      : (target.push(" ", "formAction", '="', actionJavaScriptURL, '"'),
        (formTarget = formMethod = formEncType = formAction = name = null),
        injectFormReplayingRuntime(resumableState, renderState));
  }
  null != name && pushAttribute(target, "name", name);
  null != formAction && pushAttribute(target, "formAction", formAction);
  null != formEncType && pushAttribute(target, "formEncType", formEncType);
  null != formMethod && pushAttribute(target, "formMethod", formMethod);
  null != formTarget && pushAttribute(target, "formTarget", formTarget);
  return formData;
}
function pushAttribute(target, name, value) {
  switch (name) {
    case "className":
      pushStringAttribute(target, "class", value);
      break;
    case "tabIndex":
      pushStringAttribute(target, "tabindex", value);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      pushStringAttribute(target, name, value);
      break;
    case "style":
      pushStyleAttribute(target, value);
      break;
    case "src":
    case "href":
      if ("" === value) break;
    case "action":
    case "formAction":
      if (
        null == value ||
        "function" === typeof value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      )
        break;
      value = sanitizeURL("" + value);
      target.push(" ", name, '="', escapeTextForBrowser(value), '"');
      break;
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "ref":
      break;
    case "autoFocus":
    case "multiple":
    case "muted":
      pushBooleanAttribute(target, name.toLowerCase(), value);
      break;
    case "xlinkHref":
      if (
        "function" === typeof value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      )
        break;
      value = sanitizeURL("" + value);
      target.push(" ", "xlink:href", '="', escapeTextForBrowser(value), '"');
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      "function" !== typeof value &&
        "symbol" !== typeof value &&
        target.push(" ", name, '="', escapeTextForBrowser(value), '"');
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      value &&
        "function" !== typeof value &&
        "symbol" !== typeof value &&
        target.push(" ", name, '=""');
      break;
    case "capture":
    case "download":
      !0 === value
        ? target.push(" ", name, '=""')
        : !1 !== value &&
          "function" !== typeof value &&
          "symbol" !== typeof value &&
          target.push(" ", name, '="', escapeTextForBrowser(value), '"');
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      "function" !== typeof value &&
        "symbol" !== typeof value &&
        !isNaN(value) &&
        1 <= value &&
        target.push(" ", name, '="', escapeTextForBrowser(value), '"');
      break;
    case "rowSpan":
    case "start":
      "function" === typeof value ||
        "symbol" === typeof value ||
        isNaN(value) ||
        target.push(" ", name, '="', escapeTextForBrowser(value), '"');
      break;
    case "xlinkActuate":
      pushStringAttribute(target, "xlink:actuate", value);
      break;
    case "xlinkArcrole":
      pushStringAttribute(target, "xlink:arcrole", value);
      break;
    case "xlinkRole":
      pushStringAttribute(target, "xlink:role", value);
      break;
    case "xlinkShow":
      pushStringAttribute(target, "xlink:show", value);
      break;
    case "xlinkTitle":
      pushStringAttribute(target, "xlink:title", value);
      break;
    case "xlinkType":
      pushStringAttribute(target, "xlink:type", value);
      break;
    case "xmlBase":
      pushStringAttribute(target, "xml:base", value);
      break;
    case "xmlLang":
      pushStringAttribute(target, "xml:lang", value);
      break;
    case "xmlSpace":
      pushStringAttribute(target, "xml:space", value);
      break;
    default:
      if (
        !(2 < name.length) ||
        ("o" !== name[0] && "O" !== name[0]) ||
        ("n" !== name[1] && "N" !== name[1])
      )
        if (((name = aliases.get(name) || name), isAttributeNameSafe(name))) {
          switch (typeof value) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              var prefix$8 = name.toLowerCase().slice(0, 5);
              if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
          }
          target.push(" ", name, '="', escapeTextForBrowser(value), '"');
        }
  }
}
function pushInnerHTML(target, innerHTML, children) {
  if (null != innerHTML) {
    if (null != children) throw Error(formatProdErrorMessage(60));
    if ("object" !== typeof innerHTML || !("__html" in innerHTML))
      throw Error(formatProdErrorMessage(61));
    innerHTML = innerHTML.__html;
    null !== innerHTML && void 0 !== innerHTML && target.push("" + innerHTML);
  }
}
function flattenOptionChildren(children) {
  var content = "";
  React.Children.forEach(children, function (child) {
    null != child && (content += child);
  });
  return content;
}
function injectFormReplayingRuntime(resumableState, renderState) {
  0 === (resumableState.instructions & 16) &&
    ((resumableState.instructions |= 16),
    renderState.bootstrapChunks.unshift(
      renderState.startInlineScript,
      'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});',
      "\x3c/script>"
    ));
}
function pushLinkImpl(target, props) {
  target.push(startChunkForTag("link"));
  for (var propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(formatProdErrorMessage(399, "link"));
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push("/>");
  return null;
}
var styleRegex = /(<\/|<)(s)(tyle)/gi;
function styleReplacer(match, prefix, s, suffix) {
  return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
}
function pushSelfClosing(target, props, tag) {
  target.push(startChunkForTag(tag));
  for (var propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(formatProdErrorMessage(399, tag));
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push("/>");
  return null;
}
function pushTitleImpl(target, props) {
  target.push(startChunkForTag("title"));
  var children = null,
    innerHTML = null,
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            children = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(">");
  props = Array.isArray(children)
    ? 2 > children.length
      ? children[0]
      : null
    : children;
  "function" !== typeof props &&
    "symbol" !== typeof props &&
    null !== props &&
    void 0 !== props &&
    target.push(escapeTextForBrowser("" + props));
  pushInnerHTML(target, innerHTML, children);
  target.push(endChunkForTag("title"));
  return null;
}
function pushScriptImpl(target, props) {
  target.push(startChunkForTag("script"));
  var children = null,
    innerHTML = null,
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            children = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(">");
  pushInnerHTML(target, innerHTML, children);
  "string" === typeof children &&
    target.push(("" + children).replace(scriptRegex, scriptReplacer));
  target.push(endChunkForTag("script"));
  return null;
}
function pushStartSingletonElement(target, props, tag) {
  target.push(startChunkForTag(tag));
  var innerHTML = (tag = null),
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            tag = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(">");
  pushInnerHTML(target, innerHTML, tag);
  return tag;
}
function pushStartGenericElement(target, props, tag) {
  target.push(startChunkForTag(tag));
  var innerHTML = (tag = null),
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            tag = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(">");
  pushInnerHTML(target, innerHTML, tag);
  return "string" === typeof tag
    ? (target.push(escapeTextForBrowser(tag)), null)
    : tag;
}
var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,
  validatedTagCache = new Map();
function startChunkForTag(tag) {
  var tagStartChunk = validatedTagCache.get(tag);
  if (void 0 === tagStartChunk) {
    if (!VALID_TAG_REGEX.test(tag))
      throw Error(formatProdErrorMessage(65, tag));
    tagStartChunk = "<" + tag;
    validatedTagCache.set(tag, tagStartChunk);
  }
  return tagStartChunk;
}
function pushStartInstance(
  target$jscomp$0,
  type,
  props,
  resumableState,
  renderState,
  preambleState,
  hoistableState,
  formatContext,
  textEmbedded,
  isFallback
) {
  switch (type) {
    case "div":
    case "span":
    case "svg":
    case "path":
      break;
    case "a":
      target$jscomp$0.push(startChunkForTag("a"));
      var children = null,
        innerHTML = null,
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                children = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              case "href":
                "" === propValue
                  ? pushStringAttribute(target$jscomp$0, "href", "")
                  : pushAttribute(target$jscomp$0, propKey, propValue);
                break;
              default:
                pushAttribute(target$jscomp$0, propKey, propValue);
            }
        }
      target$jscomp$0.push(">");
      pushInnerHTML(target$jscomp$0, innerHTML, children);
      if ("string" === typeof children) {
        target$jscomp$0.push(escapeTextForBrowser(children));
        var JSCompiler_inline_result = null;
      } else JSCompiler_inline_result = children;
      return JSCompiler_inline_result;
    case "g":
    case "p":
    case "li":
      break;
    case "select":
      target$jscomp$0.push(startChunkForTag("select"));
      var children$jscomp$0 = null,
        innerHTML$jscomp$0 = null,
        propKey$jscomp$0;
      for (propKey$jscomp$0 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$0)) {
          var propValue$jscomp$0 = props[propKey$jscomp$0];
          if (null != propValue$jscomp$0)
            switch (propKey$jscomp$0) {
              case "children":
                children$jscomp$0 = propValue$jscomp$0;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$0 = propValue$jscomp$0;
                break;
              case "defaultValue":
              case "value":
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$0,
                  propValue$jscomp$0
                );
            }
        }
      target$jscomp$0.push(">");
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
      return children$jscomp$0;
    case "option":
      var selectedValue = formatContext.selectedValue;
      target$jscomp$0.push(startChunkForTag("option"));
      var children$jscomp$1 = null,
        value = null,
        selected = null,
        innerHTML$jscomp$1 = null,
        propKey$jscomp$1;
      for (propKey$jscomp$1 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$1)) {
          var propValue$jscomp$1 = props[propKey$jscomp$1];
          if (null != propValue$jscomp$1)
            switch (propKey$jscomp$1) {
              case "children":
                children$jscomp$1 = propValue$jscomp$1;
                break;
              case "selected":
                selected = propValue$jscomp$1;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$1 = propValue$jscomp$1;
                break;
              case "value":
                value = propValue$jscomp$1;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$1,
                  propValue$jscomp$1
                );
            }
        }
      if (null != selectedValue) {
        var stringValue =
          null !== value
            ? "" + value
            : flattenOptionChildren(children$jscomp$1);
        if (isArrayImpl(selectedValue))
          for (var i = 0; i < selectedValue.length; i++) {
            if ("" + selectedValue[i] === stringValue) {
              target$jscomp$0.push(' selected=""');
              break;
            }
          }
        else
          "" + selectedValue === stringValue &&
            target$jscomp$0.push(' selected=""');
      } else selected && target$jscomp$0.push(' selected=""');
      target$jscomp$0.push(">");
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
      return children$jscomp$1;
    case "textarea":
      target$jscomp$0.push(startChunkForTag("textarea"));
      var value$jscomp$0 = null,
        defaultValue = null,
        children$jscomp$2 = null,
        propKey$jscomp$2;
      for (propKey$jscomp$2 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$2)) {
          var propValue$jscomp$2 = props[propKey$jscomp$2];
          if (null != propValue$jscomp$2)
            switch (propKey$jscomp$2) {
              case "children":
                children$jscomp$2 = propValue$jscomp$2;
                break;
              case "value":
                value$jscomp$0 = propValue$jscomp$2;
                break;
              case "defaultValue":
                defaultValue = propValue$jscomp$2;
                break;
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(91));
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$2,
                  propValue$jscomp$2
                );
            }
        }
      null === value$jscomp$0 &&
        null !== defaultValue &&
        (value$jscomp$0 = defaultValue);
      target$jscomp$0.push(">");
      if (null != children$jscomp$2) {
        if (null != value$jscomp$0) throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children$jscomp$2)) {
          if (1 < children$jscomp$2.length)
            throw Error(formatProdErrorMessage(93));
          value$jscomp$0 = "" + children$jscomp$2[0];
        }
        value$jscomp$0 = "" + children$jscomp$2;
      }
      "string" === typeof value$jscomp$0 &&
        "\n" === value$jscomp$0[0] &&
        target$jscomp$0.push("\n");
      null !== value$jscomp$0 &&
        target$jscomp$0.push(escapeTextForBrowser("" + value$jscomp$0));
      return null;
    case "input":
      target$jscomp$0.push(startChunkForTag("input"));
      var name = null,
        formAction = null,
        formEncType = null,
        formMethod = null,
        formTarget = null,
        value$jscomp$1 = null,
        defaultValue$jscomp$0 = null,
        checked = null,
        defaultChecked = null,
        propKey$jscomp$3;
      for (propKey$jscomp$3 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$3)) {
          var propValue$jscomp$3 = props[propKey$jscomp$3];
          if (null != propValue$jscomp$3)
            switch (propKey$jscomp$3) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "input"));
              case "name":
                name = propValue$jscomp$3;
                break;
              case "formAction":
                formAction = propValue$jscomp$3;
                break;
              case "formEncType":
                formEncType = propValue$jscomp$3;
                break;
              case "formMethod":
                formMethod = propValue$jscomp$3;
                break;
              case "formTarget":
                formTarget = propValue$jscomp$3;
                break;
              case "defaultChecked":
                defaultChecked = propValue$jscomp$3;
                break;
              case "defaultValue":
                defaultValue$jscomp$0 = propValue$jscomp$3;
                break;
              case "checked":
                checked = propValue$jscomp$3;
                break;
              case "value":
                value$jscomp$1 = propValue$jscomp$3;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$3,
                  propValue$jscomp$3
                );
            }
        }
      var formData = pushFormActionAttribute(
        target$jscomp$0,
        resumableState,
        renderState,
        formAction,
        formEncType,
        formMethod,
        formTarget,
        name
      );
      null !== checked
        ? pushBooleanAttribute(target$jscomp$0, "checked", checked)
        : null !== defaultChecked &&
          pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
      null !== value$jscomp$1
        ? pushAttribute(target$jscomp$0, "value", value$jscomp$1)
        : null !== defaultValue$jscomp$0 &&
          pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
      target$jscomp$0.push("/>");
      null != formData &&
        formData.forEach(pushAdditionalFormField, target$jscomp$0);
      return null;
    case "button":
      target$jscomp$0.push(startChunkForTag("button"));
      var children$jscomp$3 = null,
        innerHTML$jscomp$2 = null,
        name$jscomp$0 = null,
        formAction$jscomp$0 = null,
        formEncType$jscomp$0 = null,
        formMethod$jscomp$0 = null,
        formTarget$jscomp$0 = null,
        propKey$jscomp$4;
      for (propKey$jscomp$4 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$4)) {
          var propValue$jscomp$4 = props[propKey$jscomp$4];
          if (null != propValue$jscomp$4)
            switch (propKey$jscomp$4) {
              case "children":
                children$jscomp$3 = propValue$jscomp$4;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$2 = propValue$jscomp$4;
                break;
              case "name":
                name$jscomp$0 = propValue$jscomp$4;
                break;
              case "formAction":
                formAction$jscomp$0 = propValue$jscomp$4;
                break;
              case "formEncType":
                formEncType$jscomp$0 = propValue$jscomp$4;
                break;
              case "formMethod":
                formMethod$jscomp$0 = propValue$jscomp$4;
                break;
              case "formTarget":
                formTarget$jscomp$0 = propValue$jscomp$4;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$4,
                  propValue$jscomp$4
                );
            }
        }
      var formData$jscomp$0 = pushFormActionAttribute(
        target$jscomp$0,
        resumableState,
        renderState,
        formAction$jscomp$0,
        formEncType$jscomp$0,
        formMethod$jscomp$0,
        formTarget$jscomp$0,
        name$jscomp$0
      );
      target$jscomp$0.push(">");
      null != formData$jscomp$0 &&
        formData$jscomp$0.forEach(pushAdditionalFormField, target$jscomp$0);
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
      if ("string" === typeof children$jscomp$3) {
        target$jscomp$0.push(escapeTextForBrowser(children$jscomp$3));
        var JSCompiler_inline_result$jscomp$0 = null;
      } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
      return JSCompiler_inline_result$jscomp$0;
    case "form":
      target$jscomp$0.push(startChunkForTag("form"));
      var children$jscomp$4 = null,
        innerHTML$jscomp$3 = null,
        formAction$jscomp$1 = null,
        formEncType$jscomp$1 = null,
        formMethod$jscomp$1 = null,
        formTarget$jscomp$1 = null,
        propKey$jscomp$5;
      for (propKey$jscomp$5 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$5)) {
          var propValue$jscomp$5 = props[propKey$jscomp$5];
          if (null != propValue$jscomp$5)
            switch (propKey$jscomp$5) {
              case "children":
                children$jscomp$4 = propValue$jscomp$5;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$3 = propValue$jscomp$5;
                break;
              case "action":
                formAction$jscomp$1 = propValue$jscomp$5;
                break;
              case "encType":
                formEncType$jscomp$1 = propValue$jscomp$5;
                break;
              case "method":
                formMethod$jscomp$1 = propValue$jscomp$5;
                break;
              case "target":
                formTarget$jscomp$1 = propValue$jscomp$5;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$5,
                  propValue$jscomp$5
                );
            }
        }
      var formData$jscomp$1 = null,
        formActionName = null;
      if ("function" === typeof formAction$jscomp$1) {
        var customFields = getCustomFormFields(
          resumableState,
          formAction$jscomp$1
        );
        null !== customFields
          ? ((formAction$jscomp$1 = customFields.action || ""),
            (formEncType$jscomp$1 = customFields.encType),
            (formMethod$jscomp$1 = customFields.method),
            (formTarget$jscomp$1 = customFields.target),
            (formData$jscomp$1 = customFields.data),
            (formActionName = customFields.name))
          : (target$jscomp$0.push(
              " ",
              "action",
              '="',
              actionJavaScriptURL,
              '"'
            ),
            (formTarget$jscomp$1 =
              formMethod$jscomp$1 =
              formEncType$jscomp$1 =
              formAction$jscomp$1 =
                null),
            injectFormReplayingRuntime(resumableState, renderState));
      }
      null != formAction$jscomp$1 &&
        pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
      null != formEncType$jscomp$1 &&
        pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
      null != formMethod$jscomp$1 &&
        pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
      null != formTarget$jscomp$1 &&
        pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
      target$jscomp$0.push(">");
      null !== formActionName &&
        (target$jscomp$0.push('<input type="hidden"'),
        pushStringAttribute(target$jscomp$0, "name", formActionName),
        target$jscomp$0.push("/>"),
        null != formData$jscomp$1 &&
          formData$jscomp$1.forEach(pushAdditionalFormField, target$jscomp$0));
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
      if ("string" === typeof children$jscomp$4) {
        target$jscomp$0.push(escapeTextForBrowser(children$jscomp$4));
        var JSCompiler_inline_result$jscomp$1 = null;
      } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
      return JSCompiler_inline_result$jscomp$1;
    case "menuitem":
      target$jscomp$0.push(startChunkForTag("menuitem"));
      for (var propKey$jscomp$6 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$6)) {
          var propValue$jscomp$6 = props[propKey$jscomp$6];
          if (null != propValue$jscomp$6)
            switch (propKey$jscomp$6) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(400));
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$6,
                  propValue$jscomp$6
                );
            }
        }
      target$jscomp$0.push(">");
      return null;
    case "object":
      target$jscomp$0.push(startChunkForTag("object"));
      var children$jscomp$5 = null,
        innerHTML$jscomp$4 = null,
        propKey$jscomp$7;
      for (propKey$jscomp$7 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$7)) {
          var propValue$jscomp$7 = props[propKey$jscomp$7];
          if (null != propValue$jscomp$7)
            switch (propKey$jscomp$7) {
              case "children":
                children$jscomp$5 = propValue$jscomp$7;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$4 = propValue$jscomp$7;
                break;
              case "data":
                var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                if ("" === sanitizedValue) break;
                target$jscomp$0.push(
                  " ",
                  "data",
                  '="',
                  escapeTextForBrowser(sanitizedValue),
                  '"'
                );
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$7,
                  propValue$jscomp$7
                );
            }
        }
      target$jscomp$0.push(">");
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
      if ("string" === typeof children$jscomp$5) {
        target$jscomp$0.push(escapeTextForBrowser(children$jscomp$5));
        var JSCompiler_inline_result$jscomp$2 = null;
      } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
      return JSCompiler_inline_result$jscomp$2;
    case "title":
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(
          target$jscomp$0,
          props
        );
      else
        isFallback
          ? (JSCompiler_inline_result$jscomp$3 = null)
          : (pushTitleImpl(renderState.hoistableChunks, props),
            (JSCompiler_inline_result$jscomp$3 = void 0));
      return JSCompiler_inline_result$jscomp$3;
    case "link":
      var rel = props.rel,
        href = props.href,
        precedence = props.precedence;
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp ||
        "string" !== typeof rel ||
        "string" !== typeof href ||
        "" === href
      ) {
        pushLinkImpl(target$jscomp$0, props);
        var JSCompiler_inline_result$jscomp$4 = null;
      } else if ("stylesheet" === props.rel)
        if (
          "string" !== typeof precedence ||
          null != props.disabled ||
          props.onLoad ||
          props.onError
        )
          JSCompiler_inline_result$jscomp$4 = pushLinkImpl(
            target$jscomp$0,
            props
          );
        else {
          var styleQueue = renderState.styles.get(precedence),
            resourceState = resumableState.styleResources.hasOwnProperty(href)
              ? resumableState.styleResources[href]
              : void 0;
          if (null !== resourceState) {
            resumableState.styleResources[href] = null;
            styleQueue ||
              ((styleQueue = {
                precedence: escapeTextForBrowser(precedence),
                rules: [],
                hrefs: [],
                sheets: new Map()
              }),
              renderState.styles.set(precedence, styleQueue));
            var resource = {
              state: 0,
              props: assign({}, props, {
                "data-precedence": props.precedence,
                precedence: null
              })
            };
            if (resourceState) {
              2 === resourceState.length &&
                adoptPreloadCredentials(resource.props, resourceState);
              var preloadResource = renderState.preloads.stylesheets.get(href);
              preloadResource && 0 < preloadResource.length
                ? (preloadResource.length = 0)
                : (resource.state = 1);
            }
            styleQueue.sheets.set(href, resource);
            hoistableState && hoistableState.stylesheets.add(resource);
          } else if (styleQueue) {
            var resource$9 = styleQueue.sheets.get(href);
            resource$9 &&
              hoistableState &&
              hoistableState.stylesheets.add(resource$9);
          }
          textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
          JSCompiler_inline_result$jscomp$4 = null;
        }
      else
        props.onLoad || props.onError
          ? (JSCompiler_inline_result$jscomp$4 = pushLinkImpl(
              target$jscomp$0,
              props
            ))
          : (textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e"),
            (JSCompiler_inline_result$jscomp$4 = isFallback
              ? null
              : pushLinkImpl(renderState.hoistableChunks, props)));
      return JSCompiler_inline_result$jscomp$4;
    case "script":
      var asyncProp = props.async;
      if (
        "string" !== typeof props.src ||
        !props.src ||
        !asyncProp ||
        "function" === typeof asyncProp ||
        "symbol" === typeof asyncProp ||
        props.onLoad ||
        props.onError ||
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(
          target$jscomp$0,
          props
        );
      else {
        var key = props.src;
        if ("module" === props.type) {
          var resources = resumableState.moduleScriptResources;
          var preloads = renderState.preloads.moduleScripts;
        } else
          (resources = resumableState.scriptResources),
            (preloads = renderState.preloads.scripts);
        var resourceState$jscomp$0 = resources.hasOwnProperty(key)
          ? resources[key]
          : void 0;
        if (null !== resourceState$jscomp$0) {
          resources[key] = null;
          var scriptProps = props;
          if (resourceState$jscomp$0) {
            2 === resourceState$jscomp$0.length &&
              ((scriptProps = assign({}, props)),
              adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
            var preloadResource$jscomp$0 = preloads.get(key);
            preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
          }
          var resource$jscomp$0 = [];
          renderState.scripts.add(resource$jscomp$0);
          pushScriptImpl(resource$jscomp$0, scriptProps);
        }
        textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
        JSCompiler_inline_result$jscomp$5 = null;
      }
      return JSCompiler_inline_result$jscomp$5;
    case "style":
      var precedence$jscomp$0 = props.precedence,
        href$jscomp$0 = props.href;
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp ||
        "string" !== typeof precedence$jscomp$0 ||
        "string" !== typeof href$jscomp$0 ||
        "" === href$jscomp$0
      ) {
        target$jscomp$0.push(startChunkForTag("style"));
        var children$jscomp$6 = null,
          innerHTML$jscomp$5 = null,
          propKey$jscomp$8;
        for (propKey$jscomp$8 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$8)) {
            var propValue$jscomp$8 = props[propKey$jscomp$8];
            if (null != propValue$jscomp$8)
              switch (propKey$jscomp$8) {
                case "children":
                  children$jscomp$6 = propValue$jscomp$8;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$5 = propValue$jscomp$8;
                  break;
                default:
                  pushAttribute(
                    target$jscomp$0,
                    propKey$jscomp$8,
                    propValue$jscomp$8
                  );
              }
          }
        target$jscomp$0.push(">");
        var child = Array.isArray(children$jscomp$6)
          ? 2 > children$jscomp$6.length
            ? children$jscomp$6[0]
            : null
          : children$jscomp$6;
        "function" !== typeof child &&
          "symbol" !== typeof child &&
          null !== child &&
          void 0 !== child &&
          target$jscomp$0.push(("" + child).replace(styleRegex, styleReplacer));
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
        target$jscomp$0.push(endChunkForTag("style"));
        var JSCompiler_inline_result$jscomp$6 = null;
      } else {
        var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
        if (
          null !==
          (resumableState.styleResources.hasOwnProperty(href$jscomp$0)
            ? resumableState.styleResources[href$jscomp$0]
            : void 0)
        ) {
          resumableState.styleResources[href$jscomp$0] = null;
          styleQueue$jscomp$0
            ? styleQueue$jscomp$0.hrefs.push(
                escapeTextForBrowser(href$jscomp$0)
              )
            : ((styleQueue$jscomp$0 = {
                precedence: escapeTextForBrowser(precedence$jscomp$0),
                rules: [],
                hrefs: [escapeTextForBrowser(href$jscomp$0)],
                sheets: new Map()
              }),
              renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
          var target = styleQueue$jscomp$0.rules,
            children$jscomp$7 = null,
            innerHTML$jscomp$6 = null,
            propKey$jscomp$9;
          for (propKey$jscomp$9 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$9)) {
              var propValue$jscomp$9 = props[propKey$jscomp$9];
              if (null != propValue$jscomp$9)
                switch (propKey$jscomp$9) {
                  case "children":
                    children$jscomp$7 = propValue$jscomp$9;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$6 = propValue$jscomp$9;
                }
            }
          var child$jscomp$0 = Array.isArray(children$jscomp$7)
            ? 2 > children$jscomp$7.length
              ? children$jscomp$7[0]
              : null
            : children$jscomp$7;
          "function" !== typeof child$jscomp$0 &&
            "symbol" !== typeof child$jscomp$0 &&
            null !== child$jscomp$0 &&
            void 0 !== child$jscomp$0 &&
            target.push(
              ("" + child$jscomp$0).replace(styleRegex, styleReplacer)
            );
          pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
        }
        styleQueue$jscomp$0 &&
          hoistableState &&
          hoistableState.styles.add(styleQueue$jscomp$0);
        textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e");
        JSCompiler_inline_result$jscomp$6 = void 0;
      }
      return JSCompiler_inline_result$jscomp$6;
    case "meta":
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(
          target$jscomp$0,
          props,
          "meta"
        );
      else
        textEmbedded && target$jscomp$0.push("\x3c!-- --\x3e"),
          (JSCompiler_inline_result$jscomp$7 = isFallback
            ? null
            : "string" === typeof props.charSet
              ? pushSelfClosing(renderState.charsetChunks, props, "meta")
              : "viewport" === props.name
                ? pushSelfClosing(renderState.viewportChunks, props, "meta")
                : pushSelfClosing(renderState.hoistableChunks, props, "meta"));
      return JSCompiler_inline_result$jscomp$7;
    case "listing":
    case "pre":
      target$jscomp$0.push(startChunkForTag(type));
      var children$jscomp$8 = null,
        innerHTML$jscomp$7 = null,
        propKey$jscomp$10;
      for (propKey$jscomp$10 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$10)) {
          var propValue$jscomp$10 = props[propKey$jscomp$10];
          if (null != propValue$jscomp$10)
            switch (propKey$jscomp$10) {
              case "children":
                children$jscomp$8 = propValue$jscomp$10;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$7 = propValue$jscomp$10;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$10,
                  propValue$jscomp$10
                );
            }
        }
      target$jscomp$0.push(">");
      if (null != innerHTML$jscomp$7) {
        if (null != children$jscomp$8) throw Error(formatProdErrorMessage(60));
        if (
          "object" !== typeof innerHTML$jscomp$7 ||
          !("__html" in innerHTML$jscomp$7)
        )
          throw Error(formatProdErrorMessage(61));
        var html = innerHTML$jscomp$7.__html;
        null !== html &&
          void 0 !== html &&
          ("string" === typeof html && 0 < html.length && "\n" === html[0]
            ? target$jscomp$0.push("\n", html)
            : target$jscomp$0.push("" + html));
      }
      "string" === typeof children$jscomp$8 &&
        "\n" === children$jscomp$8[0] &&
        target$jscomp$0.push("\n");
      return children$jscomp$8;
    case "img":
      var src = props.src,
        srcSet = props.srcSet;
      if (
        !(
          "lazy" === props.loading ||
          (!src && !srcSet) ||
          ("string" !== typeof src && null != src) ||
          ("string" !== typeof srcSet && null != srcSet)
        ) &&
        "low" !== props.fetchPriority &&
        !1 === !!(formatContext.tagScope & 3) &&
        ("string" !== typeof src ||
          ":" !== src[4] ||
          ("d" !== src[0] && "D" !== src[0]) ||
          ("a" !== src[1] && "A" !== src[1]) ||
          ("t" !== src[2] && "T" !== src[2]) ||
          ("a" !== src[3] && "A" !== src[3])) &&
        ("string" !== typeof srcSet ||
          ":" !== srcSet[4] ||
          ("d" !== srcSet[0] && "D" !== srcSet[0]) ||
          ("a" !== srcSet[1] && "A" !== srcSet[1]) ||
          ("t" !== srcSet[2] && "T" !== srcSet[2]) ||
          ("a" !== srcSet[3] && "A" !== srcSet[3]))
      ) {
        var sizes = "string" === typeof props.sizes ? props.sizes : void 0,
          key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src,
          promotablePreloads = renderState.preloads.images,
          resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
        if (resource$jscomp$1) {
          if (
            "high" === props.fetchPriority ||
            10 > renderState.highImagePreloads.size
          )
            promotablePreloads.delete(key$jscomp$0),
              renderState.highImagePreloads.add(resource$jscomp$1);
        } else if (
          !resumableState.imageResources.hasOwnProperty(key$jscomp$0)
        ) {
          resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
          var input = props.crossOrigin;
          var JSCompiler_inline_result$jscomp$8 =
            "string" === typeof input
              ? "use-credentials" === input
                ? input
                : ""
              : void 0;
          var headers = renderState.headers,
            header;
          headers &&
          0 < headers.remainingCapacity &&
          "string" !== typeof props.srcSet &&
          ("high" === props.fetchPriority ||
            500 > headers.highImagePreloads.length) &&
          ((header = getPreloadAsHeader(src, "image", {
            imageSrcSet: props.srcSet,
            imageSizes: props.sizes,
            crossOrigin: JSCompiler_inline_result$jscomp$8,
            integrity: props.integrity,
            nonce: props.nonce,
            type: props.type,
            fetchPriority: props.fetchPriority,
            referrerPolicy: props.refererPolicy
          })),
          0 <= (headers.remainingCapacity -= header.length + 2))
            ? ((renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS),
              headers.highImagePreloads && (headers.highImagePreloads += ", "),
              (headers.highImagePreloads += header))
            : ((resource$jscomp$1 = []),
              pushLinkImpl(resource$jscomp$1, {
                rel: "preload",
                as: "image",
                href: srcSet ? void 0 : src,
                imageSrcSet: srcSet,
                imageSizes: sizes,
                crossOrigin: JSCompiler_inline_result$jscomp$8,
                integrity: props.integrity,
                type: props.type,
                fetchPriority: props.fetchPriority,
                referrerPolicy: props.referrerPolicy
              }),
              "high" === props.fetchPriority ||
              10 > renderState.highImagePreloads.size
                ? renderState.highImagePreloads.add(resource$jscomp$1)
                : (renderState.bulkPreloads.add(resource$jscomp$1),
                  promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
        }
      }
      return pushSelfClosing(target$jscomp$0, props, "img");
    case "base":
    case "area":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "param":
    case "source":
    case "track":
    case "wbr":
      return pushSelfClosing(target$jscomp$0, props, type);
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      break;
    case "head":
      if (2 > formatContext.insertionMode) {
        var preamble = preambleState || renderState.preamble;
        if (preamble.headChunks)
          throw Error(formatProdErrorMessage(545, "`<head>`"));
        preamble.headChunks = [];
        var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(
          preamble.headChunks,
          props,
          "head"
        );
      } else
        JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "head"
        );
      return JSCompiler_inline_result$jscomp$9;
    case "body":
      if (2 > formatContext.insertionMode) {
        var preamble$jscomp$0 = preambleState || renderState.preamble;
        if (preamble$jscomp$0.bodyChunks)
          throw Error(formatProdErrorMessage(545, "`<body>`"));
        preamble$jscomp$0.bodyChunks = [];
        var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(
          preamble$jscomp$0.bodyChunks,
          props,
          "body"
        );
      } else
        JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "body"
        );
      return JSCompiler_inline_result$jscomp$10;
    case "html":
      if (0 === formatContext.insertionMode) {
        var preamble$jscomp$1 = preambleState || renderState.preamble;
        if (preamble$jscomp$1.htmlChunks)
          throw Error(formatProdErrorMessage(545, "`<html>`"));
        preamble$jscomp$1.htmlChunks = [""];
        var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(
          preamble$jscomp$1.htmlChunks,
          props,
          "html"
        );
      } else
        JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "html"
        );
      return JSCompiler_inline_result$jscomp$11;
    default:
      if (-1 !== type.indexOf("-")) {
        target$jscomp$0.push(startChunkForTag(type));
        var children$jscomp$9 = null,
          innerHTML$jscomp$8 = null,
          propKey$jscomp$11;
        for (propKey$jscomp$11 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$11)) {
            var propValue$jscomp$11 = props[propKey$jscomp$11];
            if (null != propValue$jscomp$11) {
              var attributeName = propKey$jscomp$11;
              switch (propKey$jscomp$11) {
                case "children":
                  children$jscomp$9 = propValue$jscomp$11;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$8 = propValue$jscomp$11;
                  break;
                case "style":
                  pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                  break;
                case "suppressContentEditableWarning":
                case "suppressHydrationWarning":
                case "ref":
                  break;
                case "className":
                  attributeName = "class";
                default:
                  if (
                    isAttributeNameSafe(propKey$jscomp$11) &&
                    "function" !== typeof propValue$jscomp$11 &&
                    "symbol" !== typeof propValue$jscomp$11 &&
                    !1 !== propValue$jscomp$11
                  ) {
                    if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                    else if ("object" === typeof propValue$jscomp$11) continue;
                    target$jscomp$0.push(
                      " ",
                      attributeName,
                      '="',
                      escapeTextForBrowser(propValue$jscomp$11),
                      '"'
                    );
                  }
              }
            }
          }
        target$jscomp$0.push(">");
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
        return children$jscomp$9;
      }
  }
  return pushStartGenericElement(target$jscomp$0, props, type);
}
var endTagCache = new Map();
function endChunkForTag(tag) {
  var chunk = endTagCache.get(tag);
  void 0 === chunk && ((chunk = "</" + tag + ">"), endTagCache.set(tag, chunk));
  return chunk;
}
function hoistPreambleState(renderState, preambleState) {
  renderState = renderState.preamble;
  null === renderState.htmlChunks &&
    preambleState.htmlChunks &&
    ((renderState.htmlChunks = preambleState.htmlChunks),
    (preambleState.contribution |= 1));
  null === renderState.headChunks &&
    preambleState.headChunks &&
    ((renderState.headChunks = preambleState.headChunks),
    (preambleState.contribution |= 4));
  null === renderState.bodyChunks &&
    preambleState.bodyChunks &&
    ((renderState.bodyChunks = preambleState.bodyChunks),
    (preambleState.contribution |= 2));
}
function writeBootstrap(destination, renderState) {
  renderState = renderState.bootstrapChunks;
  for (var i = 0; i < renderState.length - 1; i++)
    destination.push(renderState[i]);
  return i < renderState.length
    ? ((i = renderState[i]), (renderState.length = 0), destination.push(i))
    : !0;
}
function writeStartPendingSuspenseBoundary(destination, renderState, id) {
  destination.push('\x3c!--$?--\x3e<template id="');
  if (null === id) throw Error(formatProdErrorMessage(395));
  destination.push(renderState.boundaryPrefix);
  renderState = id.toString(16);
  destination.push(renderState);
  return destination.push('"></template>');
}
function writePreambleContribution(destination, preambleState) {
  preambleState = preambleState.contribution;
  0 !== preambleState &&
    (destination.push("\x3c!--"),
    destination.push("" + preambleState),
    destination.push("--\x3e"));
}
function writeStartSegment(destination, renderState, formatContext, id) {
  switch (formatContext.insertionMode) {
    case 0:
    case 1:
    case 3:
    case 2:
      return (
        destination.push('<div hidden id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 4:
      return (
        destination.push('<svg aria-hidden="true" style="display:none" id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 5:
      return (
        destination.push('<math aria-hidden="true" style="display:none" id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 6:
      return (
        destination.push('<table hidden id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 7:
      return (
        destination.push('<table hidden><tbody id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 8:
      return (
        destination.push('<table hidden><tr id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    case 9:
      return (
        destination.push('<table hidden><colgroup id="'),
        destination.push(renderState.segmentPrefix),
        (renderState = id.toString(16)),
        destination.push(renderState),
        destination.push('">')
      );
    default:
      throw Error(formatProdErrorMessage(397));
  }
}
function writeEndSegment(destination, formatContext) {
  switch (formatContext.insertionMode) {
    case 0:
    case 1:
    case 3:
    case 2:
      return destination.push("</div>");
    case 4:
      return destination.push("</svg>");
    case 5:
      return destination.push("</math>");
    case 6:
      return destination.push("</table>");
    case 7:
      return destination.push("</tbody></table>");
    case 8:
      return destination.push("</tr></table>");
    case 9:
      return destination.push("</colgroup></table>");
    default:
      throw Error(formatProdErrorMessage(397));
  }
}
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
function escapeJSStringsForInstructionScripts(input) {
  return JSON.stringify(input).replace(
    regexForJSStringsInInstructionScripts,
    function (match) {
      switch (match) {
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
          );
      }
    }
  );
}
var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
function escapeJSObjectForInstructionScripts(input) {
  return JSON.stringify(input).replace(
    regexForJSStringsInScripts,
    function (match) {
      switch (match) {
        case "&":
          return "\\u0026";
        case ">":
          return "\\u003e";
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
          );
      }
    }
  );
}
var currentlyRenderingBoundaryHasStylesToHoist = !1,
  destinationHasCapacity = !0;
function flushStyleTagsLateForBoundary(styleQueue) {
  var rules = styleQueue.rules,
    hrefs = styleQueue.hrefs,
    i = 0;
  if (hrefs.length) {
    this.push('<style media="not all" data-precedence="');
    this.push(styleQueue.precedence);
    for (this.push('" data-href="'); i < hrefs.length - 1; i++)
      this.push(hrefs[i]), this.push(" ");
    this.push(hrefs[i]);
    this.push('">');
    for (i = 0; i < rules.length; i++) this.push(rules[i]);
    destinationHasCapacity = this.push("</style>");
    currentlyRenderingBoundaryHasStylesToHoist = !0;
    rules.length = 0;
    hrefs.length = 0;
  }
}
function hasStylesToHoist(stylesheet) {
  return 2 !== stylesheet.state
    ? (currentlyRenderingBoundaryHasStylesToHoist = !0)
    : !1;
}
function writeHoistablesForBoundary(destination, hoistableState, renderState) {
  currentlyRenderingBoundaryHasStylesToHoist = !1;
  destinationHasCapacity = !0;
  hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
  hoistableState.stylesheets.forEach(hasStylesToHoist);
  currentlyRenderingBoundaryHasStylesToHoist &&
    (renderState.stylesToHoist = !0);
  return destinationHasCapacity;
}
function flushResource(resource) {
  for (var i = 0; i < resource.length; i++) this.push(resource[i]);
  resource.length = 0;
}
var stylesheetFlushingQueue = [];
function flushStyleInPreamble(stylesheet) {
  pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
  for (var i = 0; i < stylesheetFlushingQueue.length; i++)
    this.push(stylesheetFlushingQueue[i]);
  stylesheetFlushingQueue.length = 0;
  stylesheet.state = 2;
}
function flushStylesInPreamble(styleQueue) {
  var hasStylesheets = 0 < styleQueue.sheets.size;
  styleQueue.sheets.forEach(flushStyleInPreamble, this);
  styleQueue.sheets.clear();
  var rules = styleQueue.rules,
    hrefs = styleQueue.hrefs;
  if (!hasStylesheets || hrefs.length) {
    this.push('<style data-precedence="');
    this.push(styleQueue.precedence);
    styleQueue = 0;
    if (hrefs.length) {
      for (
        this.push('" data-href="');
        styleQueue < hrefs.length - 1;
        styleQueue++
      )
        this.push(hrefs[styleQueue]), this.push(" ");
      this.push(hrefs[styleQueue]);
    }
    this.push('">');
    for (styleQueue = 0; styleQueue < rules.length; styleQueue++)
      this.push(rules[styleQueue]);
    this.push("</style>");
    rules.length = 0;
    hrefs.length = 0;
  }
}
function preloadLateStyle(stylesheet) {
  if (0 === stylesheet.state) {
    stylesheet.state = 1;
    var props = stylesheet.props;
    pushLinkImpl(stylesheetFlushingQueue, {
      rel: "preload",
      as: "style",
      href: stylesheet.props.href,
      crossOrigin: props.crossOrigin,
      fetchPriority: props.fetchPriority,
      integrity: props.integrity,
      media: props.media,
      hrefLang: props.hrefLang,
      referrerPolicy: props.referrerPolicy
    });
    for (
      stylesheet = 0;
      stylesheet < stylesheetFlushingQueue.length;
      stylesheet++
    )
      this.push(stylesheetFlushingQueue[stylesheet]);
    stylesheetFlushingQueue.length = 0;
  }
}
function preloadLateStyles(styleQueue) {
  styleQueue.sheets.forEach(preloadLateStyle, this);
  styleQueue.sheets.clear();
}
function writeStyleResourceDependenciesInJS(destination, hoistableState) {
  destination.push("[");
  var nextArrayOpenBrackChunk = "[";
  hoistableState.stylesheets.forEach(function (resource) {
    if (2 !== resource.state)
      if (3 === resource.state)
        destination.push(nextArrayOpenBrackChunk),
          (resource = escapeJSObjectForInstructionScripts(
            "" + resource.props.href
          )),
          destination.push(resource),
          destination.push("]"),
          (nextArrayOpenBrackChunk = ",[");
      else {
        destination.push(nextArrayOpenBrackChunk);
        var precedence = resource.props["data-precedence"],
          props = resource.props,
          coercedHref = sanitizeURL("" + resource.props.href);
        coercedHref = escapeJSObjectForInstructionScripts(coercedHref);
        destination.push(coercedHref);
        precedence = "" + precedence;
        destination.push(",");
        precedence = escapeJSObjectForInstructionScripts(precedence);
        destination.push(precedence);
        for (var propKey in props)
          if (
            hasOwnProperty.call(props, propKey) &&
            ((precedence = props[propKey]), null != precedence)
          )
            switch (propKey) {
              case "href":
              case "rel":
              case "precedence":
              case "data-precedence":
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "link"));
              default:
                writeStyleResourceAttributeInJS(
                  destination,
                  propKey,
                  precedence
                );
            }
        destination.push("]");
        nextArrayOpenBrackChunk = ",[";
        resource.state = 3;
      }
  });
  destination.push("]");
}
function writeStyleResourceAttributeInJS(destination, name, value) {
  var attributeName = name.toLowerCase();
  switch (typeof value) {
    case "function":
    case "symbol":
      return;
  }
  switch (name) {
    case "innerHTML":
    case "dangerouslySetInnerHTML":
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "style":
    case "ref":
      return;
    case "className":
      attributeName = "class";
      name = "" + value;
      break;
    case "hidden":
      if (!1 === value) return;
      name = "";
      break;
    case "src":
    case "href":
      value = sanitizeURL(value);
      name = "" + value;
      break;
    default:
      if (
        (2 < name.length &&
          ("o" === name[0] || "O" === name[0]) &&
          ("n" === name[1] || "N" === name[1])) ||
        !isAttributeNameSafe(name)
      )
        return;
      name = "" + value;
  }
  destination.push(",");
  attributeName = escapeJSObjectForInstructionScripts(attributeName);
  destination.push(attributeName);
  destination.push(",");
  attributeName = escapeJSObjectForInstructionScripts(name);
  destination.push(attributeName);
}
function createHoistableState() {
  return { styles: new Set(), stylesheets: new Set() };
}
function prefetchDNS(href) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if ("string" === typeof href && href) {
      if (!resumableState.dnsResources.hasOwnProperty(href)) {
        resumableState.dnsResources[href] = null;
        resumableState = renderState.headers;
        var header, JSCompiler_temp;
        if (
          (JSCompiler_temp =
            resumableState && 0 < resumableState.remainingCapacity)
        )
          JSCompiler_temp =
            ((header =
              "<" +
              ("" + href).replace(
                regexForHrefInLinkHeaderURLContext,
                escapeHrefForLinkHeaderURLContextReplacer
              ) +
              ">; rel=dns-prefetch"),
            0 <= (resumableState.remainingCapacity -= header.length + 2));
        JSCompiler_temp
          ? ((renderState.resets.dns[href] = null),
            resumableState.preconnects && (resumableState.preconnects += ", "),
            (resumableState.preconnects += header))
          : ((header = []),
            pushLinkImpl(header, { href: href, rel: "dns-prefetch" }),
            renderState.preconnects.add(header));
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.D(href);
}
function preconnect(href, crossOrigin) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if ("string" === typeof href && href) {
      var bucket =
        "use-credentials" === crossOrigin
          ? "credentials"
          : "string" === typeof crossOrigin
            ? "anonymous"
            : "default";
      if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
        resumableState.connectResources[bucket][href] = null;
        resumableState = renderState.headers;
        var header, JSCompiler_temp;
        if (
          (JSCompiler_temp =
            resumableState && 0 < resumableState.remainingCapacity)
        ) {
          JSCompiler_temp =
            "<" +
            ("" + href).replace(
              regexForHrefInLinkHeaderURLContext,
              escapeHrefForLinkHeaderURLContextReplacer
            ) +
            ">; rel=preconnect";
          if ("string" === typeof crossOrigin) {
            var escapedCrossOrigin = ("" + crossOrigin).replace(
              regexForLinkHeaderQuotedParamValueContext,
              escapeStringForLinkHeaderQuotedParamValueContextReplacer
            );
            JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
          }
          JSCompiler_temp =
            ((header = JSCompiler_temp),
            0 <= (resumableState.remainingCapacity -= header.length + 2));
        }
        JSCompiler_temp
          ? ((renderState.resets.connect[bucket][href] = null),
            resumableState.preconnects && (resumableState.preconnects += ", "),
            (resumableState.preconnects += header))
          : ((bucket = []),
            pushLinkImpl(bucket, {
              rel: "preconnect",
              href: href,
              crossOrigin: crossOrigin
            }),
            renderState.preconnects.add(bucket));
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.C(href, crossOrigin);
}
function preload(href, as, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (as && href) {
      switch (as) {
        case "image":
          if (options) {
            var imageSrcSet = options.imageSrcSet;
            var imageSizes = options.imageSizes;
            var fetchPriority = options.fetchPriority;
          }
          var key = imageSrcSet
            ? imageSrcSet + "\n" + (imageSizes || "")
            : href;
          if (resumableState.imageResources.hasOwnProperty(key)) return;
          resumableState.imageResources[key] = PRELOAD_NO_CREDS;
          resumableState = renderState.headers;
          var header;
          resumableState &&
          0 < resumableState.remainingCapacity &&
          "string" !== typeof imageSrcSet &&
          "high" === fetchPriority &&
          ((header = getPreloadAsHeader(href, as, options)),
          0 <= (resumableState.remainingCapacity -= header.length + 2))
            ? ((renderState.resets.image[key] = PRELOAD_NO_CREDS),
              resumableState.highImagePreloads &&
                (resumableState.highImagePreloads += ", "),
              (resumableState.highImagePreloads += header))
            : ((resumableState = []),
              pushLinkImpl(
                resumableState,
                assign(
                  { rel: "preload", href: imageSrcSet ? void 0 : href, as: as },
                  options
                )
              ),
              "high" === fetchPriority
                ? renderState.highImagePreloads.add(resumableState)
                : (renderState.bulkPreloads.add(resumableState),
                  renderState.preloads.images.set(key, resumableState)));
          break;
        case "style":
          if (resumableState.styleResources.hasOwnProperty(href)) return;
          imageSrcSet = [];
          pushLinkImpl(
            imageSrcSet,
            assign({ rel: "preload", href: href, as: as }, options)
          );
          resumableState.styleResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          renderState.preloads.stylesheets.set(href, imageSrcSet);
          renderState.bulkPreloads.add(imageSrcSet);
          break;
        case "script":
          if (resumableState.scriptResources.hasOwnProperty(href)) return;
          imageSrcSet = [];
          renderState.preloads.scripts.set(href, imageSrcSet);
          renderState.bulkPreloads.add(imageSrcSet);
          pushLinkImpl(
            imageSrcSet,
            assign({ rel: "preload", href: href, as: as }, options)
          );
          resumableState.scriptResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          break;
        default:
          if (resumableState.unknownResources.hasOwnProperty(as)) {
            if (
              ((imageSrcSet = resumableState.unknownResources[as]),
              imageSrcSet.hasOwnProperty(href))
            )
              return;
          } else
            (imageSrcSet = {}),
              (resumableState.unknownResources[as] = imageSrcSet);
          imageSrcSet[href] = PRELOAD_NO_CREDS;
          if (
            (resumableState = renderState.headers) &&
            0 < resumableState.remainingCapacity &&
            "font" === as &&
            ((key = getPreloadAsHeader(href, as, options)),
            0 <= (resumableState.remainingCapacity -= key.length + 2))
          )
            (renderState.resets.font[href] = PRELOAD_NO_CREDS),
              resumableState.fontPreloads &&
                (resumableState.fontPreloads += ", "),
              (resumableState.fontPreloads += key);
          else
            switch (
              ((resumableState = []),
              (href = assign({ rel: "preload", href: href, as: as }, options)),
              pushLinkImpl(resumableState, href),
              as)
            ) {
              case "font":
                renderState.fontPreloads.add(resumableState);
                break;
              default:
                renderState.bulkPreloads.add(resumableState);
            }
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.L(href, as, options);
}
function preloadModule(href, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (href) {
      var as =
        options && "string" === typeof options.as ? options.as : "script";
      switch (as) {
        case "script":
          if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
          as = [];
          resumableState.moduleScriptResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          renderState.preloads.moduleScripts.set(href, as);
          break;
        default:
          if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
            var resources = resumableState.unknownResources[as];
            if (resources.hasOwnProperty(href)) return;
          } else
            (resources = {}),
              (resumableState.moduleUnknownResources[as] = resources);
          as = [];
          resources[href] = PRELOAD_NO_CREDS;
      }
      pushLinkImpl(as, assign({ rel: "modulepreload", href: href }, options));
      renderState.bulkPreloads.add(as);
      enqueueFlush(request);
    }
  } else previousDispatcher.m(href, options);
}
function preinitStyle(href, precedence, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (href) {
      precedence = precedence || "default";
      var styleQueue = renderState.styles.get(precedence),
        resourceState = resumableState.styleResources.hasOwnProperty(href)
          ? resumableState.styleResources[href]
          : void 0;
      null !== resourceState &&
        ((resumableState.styleResources[href] = null),
        styleQueue ||
          ((styleQueue = {
            precedence: escapeTextForBrowser(precedence),
            rules: [],
            hrefs: [],
            sheets: new Map()
          }),
          renderState.styles.set(precedence, styleQueue)),
        (precedence = {
          state: 0,
          props: assign(
            { rel: "stylesheet", href: href, "data-precedence": precedence },
            options
          )
        }),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(precedence.props, resourceState),
          (renderState = renderState.preloads.stylesheets.get(href)) &&
          0 < renderState.length
            ? (renderState.length = 0)
            : (precedence.state = 1)),
        styleQueue.sheets.set(href, precedence),
        enqueueFlush(request));
    }
  } else previousDispatcher.S(href, precedence, options);
}
function preinitScript(src, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (src) {
      var resourceState = resumableState.scriptResources.hasOwnProperty(src)
        ? resumableState.scriptResources[src]
        : void 0;
      null !== resourceState &&
        ((resumableState.scriptResources[src] = null),
        (options = assign({ src: src, async: !0 }, options)),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(options, resourceState),
          (src = renderState.preloads.scripts.get(src))) &&
          (src.length = 0),
        (src = []),
        renderState.scripts.add(src),
        pushScriptImpl(src, options),
        enqueueFlush(request));
    }
  } else previousDispatcher.X(src, options);
}
function preinitModuleScript(src, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (src) {
      var resourceState = resumableState.moduleScriptResources.hasOwnProperty(
        src
      )
        ? resumableState.moduleScriptResources[src]
        : void 0;
      null !== resourceState &&
        ((resumableState.moduleScriptResources[src] = null),
        (options = assign({ src: src, type: "module", async: !0 }, options)),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(options, resourceState),
          (src = renderState.preloads.moduleScripts.get(src))) &&
          (src.length = 0),
        (src = []),
        renderState.scripts.add(src),
        pushScriptImpl(src, options),
        enqueueFlush(request));
    }
  } else previousDispatcher.M(src, options);
}
function adoptPreloadCredentials(target, preloadState) {
  null == target.crossOrigin && (target.crossOrigin = preloadState[0]);
  null == target.integrity && (target.integrity = preloadState[1]);
}
function getPreloadAsHeader(href, as, params) {
  href = ("" + href).replace(
    regexForHrefInLinkHeaderURLContext,
    escapeHrefForLinkHeaderURLContextReplacer
  );
  as = ("" + as).replace(
    regexForLinkHeaderQuotedParamValueContext,
    escapeStringForLinkHeaderQuotedParamValueContextReplacer
  );
  as = "<" + href + '>; rel=preload; as="' + as + '"';
  for (var paramName in params)
    hasOwnProperty.call(params, paramName) &&
      ((href = params[paramName]),
      "string" === typeof href &&
        (as +=
          "; " +
          paramName.toLowerCase() +
          '="' +
          ("" + href).replace(
            regexForLinkHeaderQuotedParamValueContext,
            escapeStringForLinkHeaderQuotedParamValueContextReplacer
          ) +
          '"'));
  return as;
}
var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
function escapeHrefForLinkHeaderURLContextReplacer(match) {
  switch (match) {
    case "<":
      return "%3C";
    case ">":
      return "%3E";
    case "\n":
      return "%0A";
    case "\r":
      return "%0D";
    default:
      throw Error(
        "escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
      );
  }
}
var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
  switch (match) {
    case '"':
      return "%22";
    case "'":
      return "%27";
    case ";":
      return "%3B";
    case ",":
      return "%2C";
    case "\n":
      return "%0A";
    case "\r":
      return "%0D";
    default:
      throw Error(
        "escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
      );
  }
}
function hoistStyleQueueDependency(styleQueue) {
  this.styles.add(styleQueue);
}
function hoistStylesheetDependency(stylesheet) {
  this.stylesheets.add(stylesheet);
}
function createRenderState(resumableState, generateStaticMarkup) {
  var idPrefix = resumableState.idPrefix,
    bootstrapChunks = [],
    bootstrapScriptContent = resumableState.bootstrapScriptContent,
    bootstrapScripts = resumableState.bootstrapScripts,
    bootstrapModules = resumableState.bootstrapModules;
  void 0 !== bootstrapScriptContent &&
    bootstrapChunks.push(
      "<script>",
      ("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer),
      "\x3c/script>"
    );
  bootstrapScriptContent = idPrefix + "P:";
  var JSCompiler_object_inline_segmentPrefix_1542 = idPrefix + "S:";
  idPrefix += "B:";
  var JSCompiler_object_inline_preamble_1545 = createPreambleState(),
    JSCompiler_object_inline_preconnects_1555 = new Set(),
    JSCompiler_object_inline_fontPreloads_1556 = new Set(),
    JSCompiler_object_inline_highImagePreloads_1557 = new Set(),
    JSCompiler_object_inline_styles_1558 = new Map(),
    JSCompiler_object_inline_bootstrapScripts_1559 = new Set(),
    JSCompiler_object_inline_scripts_1560 = new Set(),
    JSCompiler_object_inline_bulkPreloads_1561 = new Set(),
    JSCompiler_object_inline_preloads_1562 = {
      images: new Map(),
      stylesheets: new Map(),
      scripts: new Map(),
      moduleScripts: new Map()
    };
  if (void 0 !== bootstrapScripts)
    for (var i = 0; i < bootstrapScripts.length; i++) {
      var scriptConfig = bootstrapScripts[i],
        src,
        crossOrigin = void 0,
        integrity = void 0,
        props = {
          rel: "preload",
          as: "script",
          fetchPriority: "low",
          nonce: void 0
        };
      "string" === typeof scriptConfig
        ? (props.href = src = scriptConfig)
        : ((props.href = src = scriptConfig.src),
          (props.integrity = integrity =
            "string" === typeof scriptConfig.integrity
              ? scriptConfig.integrity
              : void 0),
          (props.crossOrigin = crossOrigin =
            "string" === typeof scriptConfig || null == scriptConfig.crossOrigin
              ? void 0
              : "use-credentials" === scriptConfig.crossOrigin
                ? "use-credentials"
                : ""));
      scriptConfig = resumableState;
      var href = src;
      scriptConfig.scriptResources[href] = null;
      scriptConfig.moduleScriptResources[href] = null;
      scriptConfig = [];
      pushLinkImpl(scriptConfig, props);
      JSCompiler_object_inline_bootstrapScripts_1559.add(scriptConfig);
      bootstrapChunks.push('<script src="', escapeTextForBrowser(src));
      "string" === typeof integrity &&
        bootstrapChunks.push('" integrity="', escapeTextForBrowser(integrity));
      "string" === typeof crossOrigin &&
        bootstrapChunks.push(
          '" crossorigin="',
          escapeTextForBrowser(crossOrigin)
        );
      bootstrapChunks.push('" async="">\x3c/script>');
    }
  if (void 0 !== bootstrapModules)
    for (
      bootstrapScripts = 0;
      bootstrapScripts < bootstrapModules.length;
      bootstrapScripts++
    )
      (props = bootstrapModules[bootstrapScripts]),
        (crossOrigin = src = void 0),
        (integrity = {
          rel: "modulepreload",
          fetchPriority: "low",
          nonce: void 0
        }),
        "string" === typeof props
          ? (integrity.href = i = props)
          : ((integrity.href = i = props.src),
            (integrity.integrity = crossOrigin =
              "string" === typeof props.integrity ? props.integrity : void 0),
            (integrity.crossOrigin = src =
              "string" === typeof props || null == props.crossOrigin
                ? void 0
                : "use-credentials" === props.crossOrigin
                  ? "use-credentials"
                  : "")),
        (props = resumableState),
        (scriptConfig = i),
        (props.scriptResources[scriptConfig] = null),
        (props.moduleScriptResources[scriptConfig] = null),
        (props = []),
        pushLinkImpl(props, integrity),
        JSCompiler_object_inline_bootstrapScripts_1559.add(props),
        bootstrapChunks.push(
          '<script type="module" src="',
          escapeTextForBrowser(i)
        ),
        "string" === typeof crossOrigin &&
          bootstrapChunks.push(
            '" integrity="',
            escapeTextForBrowser(crossOrigin)
          ),
        "string" === typeof src &&
          bootstrapChunks.push('" crossorigin="', escapeTextForBrowser(src)),
        bootstrapChunks.push('" async="">\x3c/script>');
  return {
    placeholderPrefix: bootstrapScriptContent,
    segmentPrefix: JSCompiler_object_inline_segmentPrefix_1542,
    boundaryPrefix: idPrefix,
    startInlineScript: "<script>",
    preamble: JSCompiler_object_inline_preamble_1545,
    externalRuntimeScript: null,
    bootstrapChunks: bootstrapChunks,
    importMapChunks: [],
    onHeaders: void 0,
    headers: null,
    resets: {
      font: {},
      dns: {},
      connect: { default: {}, anonymous: {}, credentials: {} },
      image: {},
      style: {}
    },
    charsetChunks: [],
    viewportChunks: [],
    hoistableChunks: [],
    preconnects: JSCompiler_object_inline_preconnects_1555,
    fontPreloads: JSCompiler_object_inline_fontPreloads_1556,
    highImagePreloads: JSCompiler_object_inline_highImagePreloads_1557,
    styles: JSCompiler_object_inline_styles_1558,
    bootstrapScripts: JSCompiler_object_inline_bootstrapScripts_1559,
    scripts: JSCompiler_object_inline_scripts_1560,
    bulkPreloads: JSCompiler_object_inline_bulkPreloads_1561,
    preloads: JSCompiler_object_inline_preloads_1562,
    stylesToHoist: !1,
    generateStaticMarkup: generateStaticMarkup
  };
}
function pushTextInstance(target, text, renderState, textEmbedded) {
  if (renderState.generateStaticMarkup)
    return target.push(escapeTextForBrowser(text)), !1;
  "" === text
    ? (target = textEmbedded)
    : (textEmbedded && target.push("\x3c!-- --\x3e"),
      target.push(escapeTextForBrowser(text)),
      (target = !0));
  return target;
}
function pushSegmentFinale(target, renderState, lastPushedText, textEmbedded) {
  renderState.generateStaticMarkup ||
    (lastPushedText && textEmbedded && target.push("\x3c!-- --\x3e"));
}
var bind = Function.prototype.bind,
  REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
  if (null == type) return null;
  if ("function" === typeof type)
    return type.$$typeof === REACT_CLIENT_REFERENCE
      ? null
      : type.displayName || type.name || null;
  if ("string" === typeof type) return type;
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return "Fragment";
    case REACT_PROFILER_TYPE:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE:
      return "Suspense";
    case REACT_SUSPENSE_LIST_TYPE:
      return "SuspenseList";
    case REACT_ACTIVITY_TYPE:
      return "Activity";
  }
  if ("object" === typeof type)
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return "Portal";
      case REACT_CONTEXT_TYPE:
        return (type.displayName || "Context") + ".Provider";
      case REACT_CONSUMER_TYPE:
        return (type._context.displayName || "Context") + ".Consumer";
      case REACT_FORWARD_REF_TYPE:
        var innerType = type.render;
        type = type.displayName;
        type ||
          ((type = innerType.displayName || innerType.name || ""),
          (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
        return type;
      case REACT_MEMO_TYPE:
        return (
          (innerType = type.displayName || null),
          null !== innerType
            ? innerType
            : getComponentNameFromType(type.type) || "Memo"
        );
      case REACT_LAZY_TYPE:
        innerType = type._payload;
        type = type._init;
        try {
          return getComponentNameFromType(type(innerType));
        } catch (x) {}
    }
  return null;
}
var emptyContextObject = {},
  currentActiveSnapshot = null;
function popToNearestCommonAncestor(prev, next) {
  if (prev !== next) {
    prev.context._currentValue2 = prev.parentValue;
    prev = prev.parent;
    var parentNext = next.parent;
    if (null === prev) {
      if (null !== parentNext) throw Error(formatProdErrorMessage(401));
    } else {
      if (null === parentNext) throw Error(formatProdErrorMessage(401));
      popToNearestCommonAncestor(prev, parentNext);
    }
    next.context._currentValue2 = next.value;
  }
}
function popAllPrevious(prev) {
  prev.context._currentValue2 = prev.parentValue;
  prev = prev.parent;
  null !== prev && popAllPrevious(prev);
}
function pushAllNext(next) {
  var parentNext = next.parent;
  null !== parentNext && pushAllNext(parentNext);
  next.context._currentValue2 = next.value;
}
function popPreviousToCommonLevel(prev, next) {
  prev.context._currentValue2 = prev.parentValue;
  prev = prev.parent;
  if (null === prev) throw Error(formatProdErrorMessage(402));
  prev.depth === next.depth
    ? popToNearestCommonAncestor(prev, next)
    : popPreviousToCommonLevel(prev, next);
}
function popNextToCommonLevel(prev, next) {
  var parentNext = next.parent;
  if (null === parentNext) throw Error(formatProdErrorMessage(402));
  prev.depth === parentNext.depth
    ? popToNearestCommonAncestor(prev, parentNext)
    : popNextToCommonLevel(prev, parentNext);
  next.context._currentValue2 = next.value;
}
function switchContext(newSnapshot) {
  var prev = currentActiveSnapshot;
  prev !== newSnapshot &&
    (null === prev
      ? pushAllNext(newSnapshot)
      : null === newSnapshot
        ? popAllPrevious(prev)
        : prev.depth === newSnapshot.depth
          ? popToNearestCommonAncestor(prev, newSnapshot)
          : prev.depth > newSnapshot.depth
            ? popPreviousToCommonLevel(prev, newSnapshot)
            : popNextToCommonLevel(prev, newSnapshot),
    (currentActiveSnapshot = newSnapshot));
}
var classComponentUpdater = {
    enqueueSetState: function (inst, payload) {
      inst = inst._reactInternals;
      null !== inst.queue && inst.queue.push(payload);
    },
    enqueueReplaceState: function (inst, payload) {
      inst = inst._reactInternals;
      inst.replace = !0;
      inst.queue = [payload];
    },
    enqueueForceUpdate: function () {}
  },
  emptyTreeContext = { id: 1, overflow: "" };
function pushTreeContext(baseContext, totalChildren, index) {
  var baseIdWithLeadingBit = baseContext.id;
  baseContext = baseContext.overflow;
  var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
  baseIdWithLeadingBit &= ~(1 << baseLength);
  index += 1;
  var length = 32 - clz32(totalChildren) + baseLength;
  if (30 < length) {
    var numberOfOverflowBits = baseLength - (baseLength % 5);
    length = (
      baseIdWithLeadingBit &
      ((1 << numberOfOverflowBits) - 1)
    ).toString(32);
    baseIdWithLeadingBit >>= numberOfOverflowBits;
    baseLength -= numberOfOverflowBits;
    return {
      id:
        (1 << (32 - clz32(totalChildren) + baseLength)) |
        (index << baseLength) |
        baseIdWithLeadingBit,
      overflow: length + baseContext
    };
  }
  return {
    id: (1 << length) | (index << baseLength) | baseIdWithLeadingBit,
    overflow: baseContext
  };
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback,
  log = Math.log,
  LN2 = Math.LN2;
function clz32Fallback(x) {
  x >>>= 0;
  return 0 === x ? 32 : (31 - ((log(x) / LN2) | 0)) | 0;
}
var SuspenseException = Error(formatProdErrorMessage(460));
function noop$2() {}
function trackUsedThenable(thenableState, thenable, index) {
  index = thenableState[index];
  void 0 === index
    ? thenableState.push(thenable)
    : index !== thenable && (thenable.then(noop$2, noop$2), (thenable = index));
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      "string" === typeof thenable.status
        ? thenable.then(noop$2, noop$2)
        : ((thenableState = thenable),
          (thenableState.status = "pending"),
          thenableState.then(
            function (fulfilledValue) {
              if ("pending" === thenable.status) {
                var fulfilledThenable = thenable;
                fulfilledThenable.status = "fulfilled";
                fulfilledThenable.value = fulfilledValue;
              }
            },
            function (error) {
              if ("pending" === thenable.status) {
                var rejectedThenable = thenable;
                rejectedThenable.status = "rejected";
                rejectedThenable.reason = error;
              }
            }
          ));
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
      suspendedThenable = thenable;
      throw SuspenseException;
  }
}
var suspendedThenable = null;
function getSuspendedThenable() {
  if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}
function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}
var objectIs = "function" === typeof Object.is ? Object.is : is,
  currentlyRenderingComponent = null,
  currentlyRenderingTask = null,
  currentlyRenderingRequest = null,
  currentlyRenderingKeyPath = null,
  firstWorkInProgressHook = null,
  workInProgressHook = null,
  isReRender = !1,
  didScheduleRenderPhaseUpdate = !1,
  localIdCounter = 0,
  actionStateCounter = 0,
  actionStateMatchingIndex = -1,
  thenableIndexCounter = 0,
  thenableState = null,
  renderPhaseUpdates = null,
  numberOfReRenders = 0;
function resolveCurrentlyRenderingComponent() {
  if (null === currentlyRenderingComponent)
    throw Error(formatProdErrorMessage(321));
  return currentlyRenderingComponent;
}
function createHook() {
  if (0 < numberOfReRenders) throw Error(formatProdErrorMessage(312));
  return { memoizedState: null, queue: null, next: null };
}
function createWorkInProgressHook() {
  null === workInProgressHook
    ? null === firstWorkInProgressHook
      ? ((isReRender = !1),
        (firstWorkInProgressHook = workInProgressHook = createHook()))
      : ((isReRender = !0), (workInProgressHook = firstWorkInProgressHook))
    : null === workInProgressHook.next
      ? ((isReRender = !1),
        (workInProgressHook = workInProgressHook.next = createHook()))
      : ((isReRender = !0), (workInProgressHook = workInProgressHook.next));
  return workInProgressHook;
}
function getThenableStateAfterSuspending() {
  var state = thenableState;
  thenableState = null;
  return state;
}
function resetHooksState() {
  currentlyRenderingKeyPath =
    currentlyRenderingRequest =
    currentlyRenderingTask =
    currentlyRenderingComponent =
      null;
  didScheduleRenderPhaseUpdate = !1;
  firstWorkInProgressHook = null;
  numberOfReRenders = 0;
  workInProgressHook = renderPhaseUpdates = null;
}
function basicStateReducer(state, action) {
  return "function" === typeof action ? action(state) : action;
}
function useReducer(reducer, initialArg, init) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  if (isReRender) {
    var queue = workInProgressHook.queue;
    initialArg = queue.dispatch;
    if (
      null !== renderPhaseUpdates &&
      ((init = renderPhaseUpdates.get(queue)), void 0 !== init)
    ) {
      renderPhaseUpdates.delete(queue);
      queue = workInProgressHook.memoizedState;
      do (queue = reducer(queue, init.action)), (init = init.next);
      while (null !== init);
      workInProgressHook.memoizedState = queue;
      return [queue, initialArg];
    }
    return [workInProgressHook.memoizedState, initialArg];
  }
  reducer =
    reducer === basicStateReducer
      ? "function" === typeof initialArg
        ? initialArg()
        : initialArg
      : void 0 !== init
        ? init(initialArg)
        : initialArg;
  workInProgressHook.memoizedState = reducer;
  reducer = workInProgressHook.queue = { last: null, dispatch: null };
  reducer = reducer.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingComponent,
    reducer
  );
  return [workInProgressHook.memoizedState, reducer];
}
function useMemo(nextCreate, deps) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  if (null !== workInProgressHook) {
    var prevState = workInProgressHook.memoizedState;
    if (null !== prevState && null !== deps) {
      var prevDeps = prevState[1];
      a: if (null === prevDeps) prevDeps = !1;
      else {
        for (var i = 0; i < prevDeps.length && i < deps.length; i++)
          if (!objectIs(deps[i], prevDeps[i])) {
            prevDeps = !1;
            break a;
          }
        prevDeps = !0;
      }
      if (prevDeps) return prevState[0];
    }
  }
  nextCreate = nextCreate();
  workInProgressHook.memoizedState = [nextCreate, deps];
  return nextCreate;
}
function dispatchAction(componentIdentity, queue, action) {
  if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
  if (componentIdentity === currentlyRenderingComponent)
    if (
      ((didScheduleRenderPhaseUpdate = !0),
      (componentIdentity = { action: action, next: null }),
      null === renderPhaseUpdates && (renderPhaseUpdates = new Map()),
      (action = renderPhaseUpdates.get(queue)),
      void 0 === action)
    )
      renderPhaseUpdates.set(queue, componentIdentity);
    else {
      for (queue = action; null !== queue.next; ) queue = queue.next;
      queue.next = componentIdentity;
    }
}
function unsupportedStartTransition() {
  throw Error(formatProdErrorMessage(394));
}
function unsupportedSetOptimisticState() {
  throw Error(formatProdErrorMessage(479));
}
function useActionState(action, initialState, permalink) {
  resolveCurrentlyRenderingComponent();
  var actionStateHookIndex = actionStateCounter++,
    request = currentlyRenderingRequest;
  if ("function" === typeof action.$$FORM_ACTION) {
    var nextPostbackStateKey = null,
      componentKeyPath = currentlyRenderingKeyPath;
    request = request.formState;
    var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
    if (null !== request && "function" === typeof isSignatureEqual) {
      var postbackKey = request[1];
      isSignatureEqual.call(action, request[2], request[3]) &&
        ((nextPostbackStateKey =
          void 0 !== permalink
            ? "p" + permalink
            : "k" +
              murmurhash3_32_gc(
                JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                0
              )),
        postbackKey === nextPostbackStateKey &&
          ((actionStateMatchingIndex = actionStateHookIndex),
          (initialState = request[0])));
    }
    var boundAction = action.bind(null, initialState);
    action = function (payload) {
      boundAction(payload);
    };
    "function" === typeof boundAction.$$FORM_ACTION &&
      (action.$$FORM_ACTION = function (prefix) {
        prefix = boundAction.$$FORM_ACTION(prefix);
        void 0 !== permalink &&
          ((permalink += ""), (prefix.action = permalink));
        var formData = prefix.data;
        formData &&
          (null === nextPostbackStateKey &&
            (nextPostbackStateKey =
              void 0 !== permalink
                ? "p" + permalink
                : "k" +
                  murmurhash3_32_gc(
                    JSON.stringify([
                      componentKeyPath,
                      null,
                      actionStateHookIndex
                    ]),
                    0
                  )),
          formData.append("$ACTION_KEY", nextPostbackStateKey));
        return prefix;
      });
    return [initialState, action, !1];
  }
  var boundAction$22 = action.bind(null, initialState);
  return [
    initialState,
    function (payload) {
      boundAction$22(payload);
    },
    !1
  ];
}
function unwrapThenable(thenable) {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  null === thenableState && (thenableState = []);
  return trackUsedThenable(thenableState, thenable, index);
}
function unsupportedRefresh() {
  throw Error(formatProdErrorMessage(393));
}
function noop$1() {}
var HooksDispatcher = {
    readContext: function (context) {
      return context._currentValue2;
    },
    use: function (usable) {
      if (null !== usable && "object" === typeof usable) {
        if ("function" === typeof usable.then) return unwrapThenable(usable);
        if (usable.$$typeof === REACT_CONTEXT_TYPE)
          return usable._currentValue2;
      }
      throw Error(formatProdErrorMessage(438, String(usable)));
    },
    useContext: function (context) {
      resolveCurrentlyRenderingComponent();
      return context._currentValue2;
    },
    useMemo: useMemo,
    useReducer: useReducer,
    useRef: function (initialValue) {
      currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
      workInProgressHook = createWorkInProgressHook();
      var previousRef = workInProgressHook.memoizedState;
      return null === previousRef
        ? ((initialValue = { current: initialValue }),
          (workInProgressHook.memoizedState = initialValue))
        : previousRef;
    },
    useState: function (initialState) {
      return useReducer(basicStateReducer, initialState);
    },
    useInsertionEffect: noop$1,
    useLayoutEffect: noop$1,
    useCallback: function (callback, deps) {
      return useMemo(function () {
        return callback;
      }, deps);
    },
    useImperativeHandle: noop$1,
    useEffect: noop$1,
    useDebugValue: noop$1,
    useDeferredValue: function (value, initialValue) {
      resolveCurrentlyRenderingComponent();
      return void 0 !== initialValue ? initialValue : value;
    },
    useTransition: function () {
      resolveCurrentlyRenderingComponent();
      return [!1, unsupportedStartTransition];
    },
    useId: function () {
      var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
      var overflow = JSCompiler_inline_result.overflow;
      JSCompiler_inline_result = JSCompiler_inline_result.id;
      JSCompiler_inline_result =
        (
          JSCompiler_inline_result &
          ~(1 << (32 - clz32(JSCompiler_inline_result) - 1))
        ).toString(32) + overflow;
      var resumableState = currentResumableState;
      if (null === resumableState) throw Error(formatProdErrorMessage(404));
      overflow = localIdCounter++;
      JSCompiler_inline_result =
        "\u00ab" + resumableState.idPrefix + "R" + JSCompiler_inline_result;
      0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
      return JSCompiler_inline_result + "\u00bb";
    },
    useSyncExternalStore: function (subscribe, getSnapshot, getServerSnapshot) {
      if (void 0 === getServerSnapshot)
        throw Error(formatProdErrorMessage(407));
      return getServerSnapshot();
    },
    useOptimistic: function (passthrough) {
      resolveCurrentlyRenderingComponent();
      return [passthrough, unsupportedSetOptimisticState];
    },
    useActionState: useActionState,
    useFormState: useActionState,
    useHostTransitionStatus: function () {
      resolveCurrentlyRenderingComponent();
      return sharedNotPendingObject;
    },
    useMemoCache: function (size) {
      for (var data = Array(size), i = 0; i < size; i++)
        data[i] = REACT_MEMO_CACHE_SENTINEL;
      return data;
    },
    useCacheRefresh: function () {
      return unsupportedRefresh;
    }
  },
  currentResumableState = null,
  DefaultAsyncDispatcher = {
    getCacheForType: function () {
      throw Error(formatProdErrorMessage(248));
    }
  },
  prefix,
  suffix;
function describeBuiltInComponentFrame(name) {
  if (void 0 === prefix)
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = (match && match[1]) || "";
      suffix =
        -1 < x.stack.indexOf("\n    at")
          ? " (<anonymous>)"
          : -1 < x.stack.indexOf("@")
            ? "@unknown:0:0"
            : "";
    }
  return "\n" + prefix + name + suffix;
}
var reentry = !1;
function describeNativeComponentFrame(fn, construct) {
  if (!fn || reentry) return "";
  reentry = !0;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function () {
        try {
          if (construct) {
            var Fake = function () {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function () {
                throw Error();
              }
            });
            if ("object" === typeof Reflect && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                var control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x$24) {
                control = x$24;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x$25) {
              control = x$25;
            }
            (Fake = fn()) &&
              "function" === typeof Fake.catch &&
              Fake.catch(function () {});
          }
        } catch (sample) {
          if (sample && control && "string" === typeof sample.stack)
            return [sample.stack, control.stack];
        }
        return [null, null];
      }
    };
    RunInRootFrame.DetermineComponentFrameRoot.displayName =
      "DetermineComponentFrameRoot";
    var namePropDescriptor = Object.getOwnPropertyDescriptor(
      RunInRootFrame.DetermineComponentFrameRoot,
      "name"
    );
    namePropDescriptor &&
      namePropDescriptor.configurable &&
      Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
      sampleStack = _RunInRootFrame$Deter[0],
      controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      var sampleLines = sampleStack.split("\n"),
        controlLines = controlStack.split("\n");
      for (
        namePropDescriptor = RunInRootFrame = 0;
        RunInRootFrame < sampleLines.length &&
        !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");

      )
        RunInRootFrame++;
      for (
        ;
        namePropDescriptor < controlLines.length &&
        !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        );

      )
        namePropDescriptor++;
      if (
        RunInRootFrame === sampleLines.length ||
        namePropDescriptor === controlLines.length
      )
        for (
          RunInRootFrame = sampleLines.length - 1,
            namePropDescriptor = controlLines.length - 1;
          1 <= RunInRootFrame &&
          0 <= namePropDescriptor &&
          sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];

        )
          namePropDescriptor--;
      for (
        ;
        1 <= RunInRootFrame && 0 <= namePropDescriptor;
        RunInRootFrame--, namePropDescriptor--
      )
        if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
          if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
            do
              if (
                (RunInRootFrame--,
                namePropDescriptor--,
                0 > namePropDescriptor ||
                  sampleLines[RunInRootFrame] !==
                    controlLines[namePropDescriptor])
              ) {
                var frame =
                  "\n" +
                  sampleLines[RunInRootFrame].replace(" at new ", " at ");
                fn.displayName &&
                  frame.includes("<anonymous>") &&
                  (frame = frame.replace("<anonymous>", fn.displayName));
                return frame;
              }
            while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
          }
          break;
        }
    }
  } finally {
    (reentry = !1), (Error.prepareStackTrace = previousPrepareStackTrace);
  }
  return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "")
    ? describeBuiltInComponentFrame(previousPrepareStackTrace)
    : "";
}
function describeComponentStackByType(type) {
  if ("string" === typeof type) return describeBuiltInComponentFrame(type);
  if ("function" === typeof type)
    return type.prototype && type.prototype.isReactComponent
      ? describeNativeComponentFrame(type, !0)
      : describeNativeComponentFrame(type, !1);
  if ("object" === typeof type && null !== type) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeNativeComponentFrame(type.render, !1);
      case REACT_MEMO_TYPE:
        return describeNativeComponentFrame(type.type, !1);
      case REACT_LAZY_TYPE:
        var lazyComponent = type,
          payload = lazyComponent._payload;
        lazyComponent = lazyComponent._init;
        try {
          type = lazyComponent(payload);
        } catch (x) {
          return describeBuiltInComponentFrame("Lazy");
        }
        return describeComponentStackByType(type);
    }
    if ("string" === typeof type.name)
      return (
        (payload = type.env),
        describeBuiltInComponentFrame(
          type.name + (payload ? " [" + payload + "]" : "")
        )
      );
  }
  switch (type) {
    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame("SuspenseList");
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame("Suspense");
  }
  return "";
}
function defaultErrorHandler(error) {
  if (
    "object" === typeof error &&
    null !== error &&
    "string" === typeof error.environmentName
  ) {
    var JSCompiler_inline_result = error.environmentName;
    error = [error].slice(0);
    "string" === typeof error[0]
      ? error.splice(
          0,
          1,
          "[%s] " + error[0],
          " " + JSCompiler_inline_result + " "
        )
      : error.splice(0, 0, "[%s] ", " " + JSCompiler_inline_result + " ");
    error.unshift(console);
    JSCompiler_inline_result = bind.apply(console.error, error);
    JSCompiler_inline_result();
  } else console.error(error);
  return null;
}
function noop() {}
function RequestInstance(
  resumableState,
  renderState,
  rootFormatContext,
  progressiveChunkSize,
  onError,
  onAllReady,
  onShellReady,
  onShellError,
  onFatalError,
  onPostpone,
  formState
) {
  var abortSet = new Set();
  this.destination = null;
  this.flushScheduled = !1;
  this.resumableState = resumableState;
  this.renderState = renderState;
  this.rootFormatContext = rootFormatContext;
  this.progressiveChunkSize =
    void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
  this.status = 10;
  this.fatalError = null;
  this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
  this.completedPreambleSegments = this.completedRootSegment = null;
  this.abortableTasks = abortSet;
  this.pingedTasks = [];
  this.clientRenderedBoundaries = [];
  this.completedBoundaries = [];
  this.partialBoundaries = [];
  this.trackedPostpones = null;
  this.onError = void 0 === onError ? defaultErrorHandler : onError;
  this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
  this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
  this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
  this.onShellError = void 0 === onShellError ? noop : onShellError;
  this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
  this.formState = void 0 === formState ? null : formState;
}
function createRequest(
  children,
  resumableState,
  renderState,
  rootFormatContext,
  progressiveChunkSize,
  onError,
  onAllReady,
  onShellReady,
  onShellError,
  onFatalError,
  onPostpone,
  formState
) {
  resumableState = new RequestInstance(
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
    formState
  );
  renderState = createPendingSegment(
    resumableState,
    0,
    null,
    rootFormatContext,
    !1,
    !1
  );
  renderState.parentFlushed = !0;
  children = createRenderTask(
    resumableState,
    null,
    children,
    -1,
    null,
    renderState,
    null,
    null,
    resumableState.abortableTasks,
    null,
    rootFormatContext,
    null,
    emptyTreeContext,
    null,
    !1
  );
  pushComponentStack(children);
  resumableState.pingedTasks.push(children);
  return resumableState;
}
var currentRequest = null;
function pingTask(request, task) {
  request.pingedTasks.push(task);
  1 === request.pingedTasks.length &&
    ((request.flushScheduled = null !== request.destination),
    performWork(request));
}
function createSuspenseBoundary(
  request,
  fallbackAbortableTasks,
  contentPreamble,
  fallbackPreamble
) {
  return {
    status: 0,
    rootSegmentID: -1,
    parentFlushed: !1,
    pendingTasks: 0,
    completedSegments: [],
    byteSize: 0,
    fallbackAbortableTasks: fallbackAbortableTasks,
    errorDigest: null,
    contentState: createHoistableState(),
    fallbackState: createHoistableState(),
    contentPreamble: contentPreamble,
    fallbackPreamble: fallbackPreamble,
    trackedContentKeyPath: null,
    trackedFallbackNode: null
  };
}
function createRenderTask(
  request,
  thenableState,
  node,
  childIndex,
  blockedBoundary,
  blockedSegment,
  blockedPreamble,
  hoistableState,
  abortSet,
  keyPath,
  formatContext,
  context,
  treeContext,
  componentStack,
  isFallback
) {
  request.allPendingTasks++;
  null === blockedBoundary
    ? request.pendingRootTasks++
    : blockedBoundary.pendingTasks++;
  var task = {
    replay: null,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: blockedSegment,
    blockedPreamble: blockedPreamble,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    componentStack: componentStack,
    thenableState: thenableState,
    isFallback: isFallback
  };
  abortSet.add(task);
  return task;
}
function createReplayTask(
  request,
  thenableState,
  replay,
  node,
  childIndex,
  blockedBoundary,
  hoistableState,
  abortSet,
  keyPath,
  formatContext,
  context,
  treeContext,
  componentStack,
  isFallback
) {
  request.allPendingTasks++;
  null === blockedBoundary
    ? request.pendingRootTasks++
    : blockedBoundary.pendingTasks++;
  replay.pendingTasks++;
  var task = {
    replay: replay,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: null,
    blockedPreamble: null,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    componentStack: componentStack,
    thenableState: thenableState,
    isFallback: isFallback
  };
  abortSet.add(task);
  return task;
}
function createPendingSegment(
  request,
  index,
  boundary,
  parentFormatContext,
  lastPushedText,
  textEmbedded
) {
  return {
    status: 0,
    parentFlushed: !1,
    id: -1,
    index: index,
    chunks: [],
    children: [],
    preambleChildren: [],
    parentFormatContext: parentFormatContext,
    boundary: boundary,
    lastPushedText: lastPushedText,
    textEmbedded: textEmbedded
  };
}
function pushComponentStack(task) {
  var node = task.node;
  if ("object" === typeof node && null !== node)
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        task.componentStack = { parent: task.componentStack, type: node.type };
    }
}
function getThrownInfo(node$jscomp$0) {
  var errorInfo = {};
  node$jscomp$0 &&
    Object.defineProperty(errorInfo, "componentStack", {
      configurable: !0,
      enumerable: !0,
      get: function () {
        try {
          var info = "",
            node = node$jscomp$0;
          do
            (info += describeComponentStackByType(node.type)),
              (node = node.parent);
          while (node);
          var JSCompiler_inline_result = info;
        } catch (x) {
          JSCompiler_inline_result =
            "\nError generating stack: " + x.message + "\n" + x.stack;
        }
        Object.defineProperty(errorInfo, "componentStack", {
          value: JSCompiler_inline_result
        });
        return JSCompiler_inline_result;
      }
    });
  return errorInfo;
}
function logRecoverableError(request, error, errorInfo) {
  request = request.onError;
  error = request(error, errorInfo);
  if (null == error || "string" === typeof error) return error;
}
function fatalError(request, error) {
  var onShellError = request.onShellError,
    onFatalError = request.onFatalError;
  onShellError(error);
  onFatalError(error);
  null !== request.destination
    ? ((request.status = 14), request.destination.destroy(error))
    : ((request.status = 13), (request.fatalError = error));
}
function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
  var prevThenableState = task.thenableState;
  task.thenableState = null;
  currentlyRenderingComponent = {};
  currentlyRenderingTask = task;
  currentlyRenderingRequest = request;
  currentlyRenderingKeyPath = keyPath;
  actionStateCounter = localIdCounter = 0;
  actionStateMatchingIndex = -1;
  thenableIndexCounter = 0;
  thenableState = prevThenableState;
  for (request = Component(props, secondArg); didScheduleRenderPhaseUpdate; )
    (didScheduleRenderPhaseUpdate = !1),
      (actionStateCounter = localIdCounter = 0),
      (actionStateMatchingIndex = -1),
      (thenableIndexCounter = 0),
      (numberOfReRenders += 1),
      (workInProgressHook = null),
      (request = Component(props, secondArg));
  resetHooksState();
  return request;
}
function finishFunctionComponent(
  request,
  task,
  keyPath,
  children,
  hasId,
  actionStateCount,
  actionStateMatchingIndex
) {
  var didEmitActionStateMarkers = !1;
  if (0 !== actionStateCount && null !== request.formState) {
    var segment = task.blockedSegment;
    if (null !== segment) {
      didEmitActionStateMarkers = !0;
      segment = segment.chunks;
      for (var i = 0; i < actionStateCount; i++)
        i === actionStateMatchingIndex
          ? segment.push("\x3c!--F!--\x3e")
          : segment.push("\x3c!--F--\x3e");
    }
  }
  actionStateCount = task.keyPath;
  task.keyPath = keyPath;
  hasId
    ? ((keyPath = task.treeContext),
      (task.treeContext = pushTreeContext(keyPath, 1, 0)),
      renderNode(request, task, children, -1),
      (task.treeContext = keyPath))
    : didEmitActionStateMarkers
      ? renderNode(request, task, children, -1)
      : renderNodeDestructive(request, task, children, -1);
  task.keyPath = actionStateCount;
}
function renderElement(request, task, keyPath, type, props, ref) {
  if ("function" === typeof type)
    if (type.prototype && type.prototype.isReactComponent) {
      var newProps = props;
      if ("ref" in props) {
        newProps = {};
        for (var propName in props)
          "ref" !== propName && (newProps[propName] = props[propName]);
      }
      var defaultProps = type.defaultProps;
      if (defaultProps) {
        newProps === props && (newProps = assign({}, newProps, props));
        for (var propName$33 in defaultProps)
          void 0 === newProps[propName$33] &&
            (newProps[propName$33] = defaultProps[propName$33]);
      }
      props = newProps;
      newProps = emptyContextObject;
      defaultProps = type.contextType;
      "object" === typeof defaultProps &&
        null !== defaultProps &&
        (newProps = defaultProps._currentValue2);
      newProps = new type(props, newProps);
      var initialState = void 0 !== newProps.state ? newProps.state : null;
      newProps.updater = classComponentUpdater;
      newProps.props = props;
      newProps.state = initialState;
      defaultProps = { queue: [], replace: !1 };
      newProps._reactInternals = defaultProps;
      ref = type.contextType;
      newProps.context =
        "object" === typeof ref && null !== ref
          ? ref._currentValue2
          : emptyContextObject;
      ref = type.getDerivedStateFromProps;
      "function" === typeof ref &&
        ((ref = ref(props, initialState)),
        (initialState =
          null === ref || void 0 === ref
            ? initialState
            : assign({}, initialState, ref)),
        (newProps.state = initialState));
      if (
        "function" !== typeof type.getDerivedStateFromProps &&
        "function" !== typeof newProps.getSnapshotBeforeUpdate &&
        ("function" === typeof newProps.UNSAFE_componentWillMount ||
          "function" === typeof newProps.componentWillMount)
      )
        if (
          ((type = newProps.state),
          "function" === typeof newProps.componentWillMount &&
            newProps.componentWillMount(),
          "function" === typeof newProps.UNSAFE_componentWillMount &&
            newProps.UNSAFE_componentWillMount(),
          type !== newProps.state &&
            classComponentUpdater.enqueueReplaceState(
              newProps,
              newProps.state,
              null
            ),
          null !== defaultProps.queue && 0 < defaultProps.queue.length)
        )
          if (
            ((type = defaultProps.queue),
            (ref = defaultProps.replace),
            (defaultProps.queue = null),
            (defaultProps.replace = !1),
            ref && 1 === type.length)
          )
            newProps.state = type[0];
          else {
            defaultProps = ref ? type[0] : newProps.state;
            initialState = !0;
            for (ref = ref ? 1 : 0; ref < type.length; ref++)
              (propName$33 = type[ref]),
                (propName$33 =
                  "function" === typeof propName$33
                    ? propName$33.call(newProps, defaultProps, props, void 0)
                    : propName$33),
                null != propName$33 &&
                  (initialState
                    ? ((initialState = !1),
                      (defaultProps = assign({}, defaultProps, propName$33)))
                    : assign(defaultProps, propName$33));
            newProps.state = defaultProps;
          }
        else defaultProps.queue = null;
      type = newProps.render();
      if (12 === request.status) throw null;
      props = task.keyPath;
      task.keyPath = keyPath;
      renderNodeDestructive(request, task, type, -1);
      task.keyPath = props;
    } else {
      type = renderWithHooks(request, task, keyPath, type, props, void 0);
      if (12 === request.status) throw null;
      finishFunctionComponent(
        request,
        task,
        keyPath,
        type,
        0 !== localIdCounter,
        actionStateCounter,
        actionStateMatchingIndex
      );
    }
  else if ("string" === typeof type)
    if (((newProps = task.blockedSegment), null === newProps))
      (newProps = props.children),
        (defaultProps = task.formatContext),
        (initialState = task.keyPath),
        (task.formatContext = getChildFormatContext(defaultProps, type, props)),
        (task.keyPath = keyPath),
        renderNode(request, task, newProps, -1),
        (task.formatContext = defaultProps),
        (task.keyPath = initialState);
    else {
      ref = pushStartInstance(
        newProps.chunks,
        type,
        props,
        request.resumableState,
        request.renderState,
        task.blockedPreamble,
        task.hoistableState,
        task.formatContext,
        newProps.lastPushedText,
        task.isFallback
      );
      newProps.lastPushedText = !1;
      defaultProps = task.formatContext;
      initialState = task.keyPath;
      task.keyPath = keyPath;
      3 ===
      (task.formatContext = getChildFormatContext(defaultProps, type, props))
        .insertionMode
        ? ((keyPath = createPendingSegment(
            request,
            0,
            null,
            task.formatContext,
            !1,
            !1
          )),
          newProps.preambleChildren.push(keyPath),
          (keyPath = createRenderTask(
            request,
            null,
            ref,
            -1,
            task.blockedBoundary,
            keyPath,
            task.blockedPreamble,
            task.hoistableState,
            request.abortableTasks,
            task.keyPath,
            task.formatContext,
            task.context,
            task.treeContext,
            task.componentStack,
            task.isFallback
          )),
          pushComponentStack(keyPath),
          request.pingedTasks.push(keyPath))
        : renderNode(request, task, ref, -1);
      task.formatContext = defaultProps;
      task.keyPath = initialState;
      a: {
        task = newProps.chunks;
        request = request.resumableState;
        switch (type) {
          case "title":
          case "style":
          case "script":
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "img":
          case "input":
          case "keygen":
          case "link":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
            break a;
          case "body":
            if (1 >= defaultProps.insertionMode) {
              request.hasBody = !0;
              break a;
            }
            break;
          case "html":
            if (0 === defaultProps.insertionMode) {
              request.hasHtml = !0;
              break a;
            }
            break;
          case "head":
            if (1 >= defaultProps.insertionMode) break a;
        }
        task.push(endChunkForTag(type));
      }
      newProps.lastPushedText = !1;
    }
  else {
    switch (type) {
      case REACT_LEGACY_HIDDEN_TYPE:
      case REACT_STRICT_MODE_TYPE:
      case REACT_PROFILER_TYPE:
      case REACT_FRAGMENT_TYPE:
        type = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, props.children, -1);
        task.keyPath = type;
        return;
      case REACT_ACTIVITY_TYPE:
        "hidden" !== props.mode &&
          ((type = task.keyPath),
          (task.keyPath = keyPath),
          renderNodeDestructive(request, task, props.children, -1),
          (task.keyPath = type));
        return;
      case REACT_SUSPENSE_LIST_TYPE:
        type = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, props.children, -1);
        task.keyPath = type;
        return;
      case REACT_VIEW_TRANSITION_TYPE:
      case REACT_SCOPE_TYPE:
        throw Error(formatProdErrorMessage(343));
      case REACT_SUSPENSE_TYPE:
        a: if (null !== task.replay) {
          type = task.keyPath;
          task.keyPath = keyPath;
          keyPath = props.children;
          try {
            renderNode(request, task, keyPath, -1);
          } finally {
            task.keyPath = type;
          }
        } else {
          type = task.keyPath;
          var parentBoundary = task.blockedBoundary;
          ref = task.blockedPreamble;
          var parentHoistableState = task.hoistableState;
          propName$33 = task.blockedSegment;
          propName = props.fallback;
          props = props.children;
          var fallbackAbortSet = new Set();
          var newBoundary =
            2 > task.formatContext.insertionMode
              ? createSuspenseBoundary(
                  request,
                  fallbackAbortSet,
                  createPreambleState(),
                  createPreambleState()
                )
              : createSuspenseBoundary(request, fallbackAbortSet, null, null);
          null !== request.trackedPostpones &&
            (newBoundary.trackedContentKeyPath = keyPath);
          var boundarySegment = createPendingSegment(
            request,
            propName$33.chunks.length,
            newBoundary,
            task.formatContext,
            !1,
            !1
          );
          propName$33.children.push(boundarySegment);
          propName$33.lastPushedText = !1;
          var contentRootSegment = createPendingSegment(
            request,
            0,
            null,
            task.formatContext,
            !1,
            !1
          );
          contentRootSegment.parentFlushed = !0;
          if (null !== request.trackedPostpones) {
            newProps = [keyPath[0], "Suspense Fallback", keyPath[2]];
            defaultProps = [newProps[1], newProps[2], [], null];
            request.trackedPostpones.workingMap.set(newProps, defaultProps);
            newBoundary.trackedFallbackNode = defaultProps;
            task.blockedSegment = boundarySegment;
            task.blockedPreamble = newBoundary.fallbackPreamble;
            task.keyPath = newProps;
            boundarySegment.status = 6;
            try {
              renderNode(request, task, propName, -1),
                pushSegmentFinale(
                  boundarySegment.chunks,
                  request.renderState,
                  boundarySegment.lastPushedText,
                  boundarySegment.textEmbedded
                ),
                (boundarySegment.status = 1);
            } catch (thrownValue) {
              throw (
                ((boundarySegment.status = 12 === request.status ? 3 : 4),
                thrownValue)
              );
            } finally {
              (task.blockedSegment = propName$33),
                (task.blockedPreamble = ref),
                (task.keyPath = type);
            }
            task = createRenderTask(
              request,
              null,
              props,
              -1,
              newBoundary,
              contentRootSegment,
              newBoundary.contentPreamble,
              newBoundary.contentState,
              task.abortSet,
              keyPath,
              task.formatContext,
              task.context,
              task.treeContext,
              task.componentStack,
              task.isFallback
            );
            pushComponentStack(task);
            request.pingedTasks.push(task);
          } else {
            task.blockedBoundary = newBoundary;
            task.blockedPreamble = newBoundary.contentPreamble;
            task.hoistableState = newBoundary.contentState;
            task.blockedSegment = contentRootSegment;
            task.keyPath = keyPath;
            contentRootSegment.status = 6;
            try {
              if (
                (renderNode(request, task, props, -1),
                pushSegmentFinale(
                  contentRootSegment.chunks,
                  request.renderState,
                  contentRootSegment.lastPushedText,
                  contentRootSegment.textEmbedded
                ),
                (contentRootSegment.status = 1),
                queueCompletedSegment(newBoundary, contentRootSegment),
                0 === newBoundary.pendingTasks && 0 === newBoundary.status)
              ) {
                newBoundary.status = 1;
                0 === request.pendingRootTasks &&
                  task.blockedPreamble &&
                  preparePreamble(request);
                break a;
              }
            } catch (thrownValue$28) {
              (newBoundary.status = 4),
                12 === request.status
                  ? ((contentRootSegment.status = 3),
                    (newProps = request.fatalError))
                  : ((contentRootSegment.status = 4),
                    (newProps = thrownValue$28)),
                (defaultProps = getThrownInfo(task.componentStack)),
                (initialState = logRecoverableError(
                  request,
                  newProps,
                  defaultProps
                )),
                (newBoundary.errorDigest = initialState),
                untrackBoundary(request, newBoundary);
            } finally {
              (task.blockedBoundary = parentBoundary),
                (task.blockedPreamble = ref),
                (task.hoistableState = parentHoistableState),
                (task.blockedSegment = propName$33),
                (task.keyPath = type);
            }
            task = createRenderTask(
              request,
              null,
              propName,
              -1,
              parentBoundary,
              boundarySegment,
              newBoundary.fallbackPreamble,
              newBoundary.fallbackState,
              fallbackAbortSet,
              [keyPath[0], "Suspense Fallback", keyPath[2]],
              task.formatContext,
              task.context,
              task.treeContext,
              task.componentStack,
              !0
            );
            pushComponentStack(task);
            request.pingedTasks.push(task);
          }
        }
        return;
    }
    if ("object" === typeof type && null !== type)
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          if ("ref" in props)
            for (newBoundary in ((newProps = {}), props))
              "ref" !== newBoundary &&
                (newProps[newBoundary] = props[newBoundary]);
          else newProps = props;
          type = renderWithHooks(
            request,
            task,
            keyPath,
            type.render,
            newProps,
            ref
          );
          finishFunctionComponent(
            request,
            task,
            keyPath,
            type,
            0 !== localIdCounter,
            actionStateCounter,
            actionStateMatchingIndex
          );
          return;
        case REACT_MEMO_TYPE:
          renderElement(request, task, keyPath, type.type, props, ref);
          return;
        case REACT_PROVIDER_TYPE:
        case REACT_CONTEXT_TYPE:
          defaultProps = props.children;
          newProps = task.keyPath;
          props = props.value;
          initialState = type._currentValue2;
          type._currentValue2 = props;
          ref = currentActiveSnapshot;
          currentActiveSnapshot = type = {
            parent: ref,
            depth: null === ref ? 0 : ref.depth + 1,
            context: type,
            parentValue: initialState,
            value: props
          };
          task.context = type;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, defaultProps, -1);
          request = currentActiveSnapshot;
          if (null === request) throw Error(formatProdErrorMessage(403));
          request.context._currentValue2 = request.parentValue;
          request = currentActiveSnapshot = request.parent;
          task.context = request;
          task.keyPath = newProps;
          return;
        case REACT_CONSUMER_TYPE:
          props = props.children;
          type = props(type._context._currentValue2);
          props = task.keyPath;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, type, -1);
          task.keyPath = props;
          return;
        case REACT_LAZY_TYPE:
          newProps = type._init;
          type = newProps(type._payload);
          if (12 === request.status) throw null;
          renderElement(request, task, keyPath, type, props, ref);
          return;
      }
    throw Error(
      formatProdErrorMessage(130, null == type ? type : typeof type, "")
    );
  }
}
function resumeNode(request, task, segmentId, node, childIndex) {
  var prevReplay = task.replay,
    blockedBoundary = task.blockedBoundary,
    resumedSegment = createPendingSegment(
      request,
      0,
      null,
      task.formatContext,
      !1,
      !1
    );
  resumedSegment.id = segmentId;
  resumedSegment.parentFlushed = !0;
  try {
    (task.replay = null),
      (task.blockedSegment = resumedSegment),
      renderNode(request, task, node, childIndex),
      (resumedSegment.status = 1),
      null === blockedBoundary
        ? (request.completedRootSegment = resumedSegment)
        : (queueCompletedSegment(blockedBoundary, resumedSegment),
          blockedBoundary.parentFlushed &&
            request.partialBoundaries.push(blockedBoundary));
  } finally {
    (task.replay = prevReplay), (task.blockedSegment = null);
  }
}
function renderNodeDestructive(request, task, node, childIndex) {
  null !== task.replay && "number" === typeof task.replay.slots
    ? resumeNode(request, task, task.replay.slots, node, childIndex)
    : ((task.node = node),
      (task.childIndex = childIndex),
      (node = task.componentStack),
      pushComponentStack(task),
      retryNode(request, task),
      (task.componentStack = node));
}
function retryNode(request, task) {
  var node = task.node,
    childIndex = task.childIndex;
  if (null !== node) {
    if ("object" === typeof node) {
      switch (node.$$typeof) {
        case REACT_ELEMENT_TYPE:
          var type = node.type,
            key = node.key,
            props = node.props;
          node = props.ref;
          var ref = void 0 !== node ? node : null,
            name = getComponentNameFromType(type),
            keyOrIndex =
              null == key ? (-1 === childIndex ? 0 : childIndex) : key;
          key = [task.keyPath, name, keyOrIndex];
          if (null !== task.replay)
            a: {
              var replay = task.replay;
              childIndex = replay.nodes;
              for (node = 0; node < childIndex.length; node++) {
                var node$jscomp$0 = childIndex[node];
                if (keyOrIndex === node$jscomp$0[1]) {
                  if (4 === node$jscomp$0.length) {
                    if (null !== name && name !== node$jscomp$0[0])
                      throw Error(
                        formatProdErrorMessage(490, node$jscomp$0[0], name)
                      );
                    var childNodes = node$jscomp$0[2];
                    name = node$jscomp$0[3];
                    keyOrIndex = task.node;
                    task.replay = {
                      nodes: childNodes,
                      slots: name,
                      pendingTasks: 1
                    };
                    try {
                      renderElement(request, task, key, type, props, ref);
                      if (
                        1 === task.replay.pendingTasks &&
                        0 < task.replay.nodes.length
                      )
                        throw Error(formatProdErrorMessage(488));
                      task.replay.pendingTasks--;
                    } catch (x) {
                      if (
                        "object" === typeof x &&
                        null !== x &&
                        (x === SuspenseException ||
                          "function" === typeof x.then)
                      )
                        throw (
                          (task.node === keyOrIndex && (task.replay = replay),
                          x)
                        );
                      task.replay.pendingTasks--;
                      props = getThrownInfo(task.componentStack);
                      key = task.blockedBoundary;
                      type = x;
                      props = logRecoverableError(request, type, props);
                      abortRemainingReplayNodes(
                        request,
                        key,
                        childNodes,
                        name,
                        type,
                        props
                      );
                    }
                    task.replay = replay;
                  } else {
                    if (type !== REACT_SUSPENSE_TYPE)
                      throw Error(
                        formatProdErrorMessage(
                          490,
                          "Suspense",
                          getComponentNameFromType(type) || "Unknown"
                        )
                      );
                    b: {
                      replay = void 0;
                      type = node$jscomp$0[5];
                      ref = node$jscomp$0[2];
                      name = node$jscomp$0[3];
                      keyOrIndex =
                        null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                      node$jscomp$0 =
                        null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                      var prevKeyPath = task.keyPath,
                        previousReplaySet = task.replay,
                        parentBoundary = task.blockedBoundary,
                        parentHoistableState = task.hoistableState,
                        content = props.children,
                        fallback = props.fallback,
                        fallbackAbortSet = new Set();
                      props =
                        2 > task.formatContext.insertionMode
                          ? createSuspenseBoundary(
                              request,
                              fallbackAbortSet,
                              createPreambleState(),
                              createPreambleState()
                            )
                          : createSuspenseBoundary(
                              request,
                              fallbackAbortSet,
                              null,
                              null
                            );
                      props.parentFlushed = !0;
                      props.rootSegmentID = type;
                      task.blockedBoundary = props;
                      task.hoistableState = props.contentState;
                      task.keyPath = key;
                      task.replay = {
                        nodes: ref,
                        slots: name,
                        pendingTasks: 1
                      };
                      try {
                        renderNode(request, task, content, -1);
                        if (
                          1 === task.replay.pendingTasks &&
                          0 < task.replay.nodes.length
                        )
                          throw Error(formatProdErrorMessage(488));
                        task.replay.pendingTasks--;
                        if (0 === props.pendingTasks && 0 === props.status) {
                          props.status = 1;
                          request.completedBoundaries.push(props);
                          break b;
                        }
                      } catch (error) {
                        (props.status = 4),
                          (childNodes = getThrownInfo(task.componentStack)),
                          (replay = logRecoverableError(
                            request,
                            error,
                            childNodes
                          )),
                          (props.errorDigest = replay),
                          task.replay.pendingTasks--,
                          request.clientRenderedBoundaries.push(props);
                      } finally {
                        (task.blockedBoundary = parentBoundary),
                          (task.hoistableState = parentHoistableState),
                          (task.replay = previousReplaySet),
                          (task.keyPath = prevKeyPath);
                      }
                      task = createReplayTask(
                        request,
                        null,
                        {
                          nodes: keyOrIndex,
                          slots: node$jscomp$0,
                          pendingTasks: 0
                        },
                        fallback,
                        -1,
                        parentBoundary,
                        props.fallbackState,
                        fallbackAbortSet,
                        [key[0], "Suspense Fallback", key[2]],
                        task.formatContext,
                        task.context,
                        task.treeContext,
                        task.componentStack,
                        !0
                      );
                      pushComponentStack(task);
                      request.pingedTasks.push(task);
                    }
                  }
                  childIndex.splice(node, 1);
                  break a;
                }
              }
            }
          else renderElement(request, task, key, type, props, ref);
          return;
        case REACT_PORTAL_TYPE:
          throw Error(formatProdErrorMessage(257));
        case REACT_LAZY_TYPE:
          childNodes = node._init;
          node = childNodes(node._payload);
          if (12 === request.status) throw null;
          renderNodeDestructive(request, task, node, childIndex);
          return;
      }
      if (isArrayImpl(node)) {
        renderChildrenArray(request, task, node, childIndex);
        return;
      }
      null === node || "object" !== typeof node
        ? (childNodes = null)
        : ((childNodes =
            (MAYBE_ITERATOR_SYMBOL && node[MAYBE_ITERATOR_SYMBOL]) ||
            node["@@iterator"]),
          (childNodes = "function" === typeof childNodes ? childNodes : null));
      if (childNodes && (childNodes = childNodes.call(node))) {
        node = childNodes.next();
        if (!node.done) {
          props = [];
          do props.push(node.value), (node = childNodes.next());
          while (!node.done);
          renderChildrenArray(request, task, props, childIndex);
        }
        return;
      }
      if ("function" === typeof node.then)
        return (
          (task.thenableState = null),
          renderNodeDestructive(request, task, unwrapThenable(node), childIndex)
        );
      if (node.$$typeof === REACT_CONTEXT_TYPE)
        return renderNodeDestructive(
          request,
          task,
          node._currentValue2,
          childIndex
        );
      childIndex = Object.prototype.toString.call(node);
      throw Error(
        formatProdErrorMessage(
          31,
          "[object Object]" === childIndex
            ? "object with keys {" + Object.keys(node).join(", ") + "}"
            : childIndex
        )
      );
    }
    if ("string" === typeof node)
      (childIndex = task.blockedSegment),
        null !== childIndex &&
          (childIndex.lastPushedText = pushTextInstance(
            childIndex.chunks,
            node,
            request.renderState,
            childIndex.lastPushedText
          ));
    else if ("number" === typeof node || "bigint" === typeof node)
      (childIndex = task.blockedSegment),
        null !== childIndex &&
          (childIndex.lastPushedText = pushTextInstance(
            childIndex.chunks,
            "" + node,
            request.renderState,
            childIndex.lastPushedText
          ));
  }
}
function renderChildrenArray(request, task, children, childIndex) {
  var prevKeyPath = task.keyPath;
  if (
    -1 !== childIndex &&
    ((task.keyPath = [task.keyPath, "Fragment", childIndex]),
    null !== task.replay)
  ) {
    for (
      var replay = task.replay, replayNodes = replay.nodes, j = 0;
      j < replayNodes.length;
      j++
    ) {
      var node = replayNodes[j];
      if (node[1] === childIndex) {
        childIndex = node[2];
        node = node[3];
        task.replay = { nodes: childIndex, slots: node, pendingTasks: 1 };
        try {
          renderChildrenArray(request, task, children, -1);
          if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
            throw Error(formatProdErrorMessage(488));
          task.replay.pendingTasks--;
        } catch (x) {
          if (
            "object" === typeof x &&
            null !== x &&
            (x === SuspenseException || "function" === typeof x.then)
          )
            throw x;
          task.replay.pendingTasks--;
          children = getThrownInfo(task.componentStack);
          var boundary = task.blockedBoundary,
            error = x;
          children = logRecoverableError(request, error, children);
          abortRemainingReplayNodes(
            request,
            boundary,
            childIndex,
            node,
            error,
            children
          );
        }
        task.replay = replay;
        replayNodes.splice(j, 1);
        break;
      }
    }
    task.keyPath = prevKeyPath;
    return;
  }
  replay = task.treeContext;
  replayNodes = children.length;
  if (
    null !== task.replay &&
    ((j = task.replay.slots), null !== j && "object" === typeof j)
  ) {
    for (childIndex = 0; childIndex < replayNodes; childIndex++)
      (node = children[childIndex]),
        (task.treeContext = pushTreeContext(replay, replayNodes, childIndex)),
        (boundary = j[childIndex]),
        "number" === typeof boundary
          ? (resumeNode(request, task, boundary, node, childIndex),
            delete j[childIndex])
          : renderNode(request, task, node, childIndex);
    task.treeContext = replay;
    task.keyPath = prevKeyPath;
    return;
  }
  for (j = 0; j < replayNodes; j++)
    (childIndex = children[j]),
      (task.treeContext = pushTreeContext(replay, replayNodes, j)),
      renderNode(request, task, childIndex, j);
  task.treeContext = replay;
  task.keyPath = prevKeyPath;
}
function untrackBoundary(request, boundary) {
  request = request.trackedPostpones;
  null !== request &&
    ((boundary = boundary.trackedContentKeyPath),
    null !== boundary &&
      ((boundary = request.workingMap.get(boundary)),
      void 0 !== boundary &&
        ((boundary.length = 4), (boundary[2] = []), (boundary[3] = null))));
}
function spawnNewSuspendedReplayTask(request, task, thenableState) {
  return createReplayTask(
    request,
    thenableState,
    task.replay,
    task.node,
    task.childIndex,
    task.blockedBoundary,
    task.hoistableState,
    task.abortSet,
    task.keyPath,
    task.formatContext,
    task.context,
    task.treeContext,
    task.componentStack,
    task.isFallback
  );
}
function spawnNewSuspendedRenderTask(request, task, thenableState) {
  var segment = task.blockedSegment,
    newSegment = createPendingSegment(
      request,
      segment.chunks.length,
      null,
      task.formatContext,
      segment.lastPushedText,
      !0
    );
  segment.children.push(newSegment);
  segment.lastPushedText = !1;
  return createRenderTask(
    request,
    thenableState,
    task.node,
    task.childIndex,
    task.blockedBoundary,
    newSegment,
    task.blockedPreamble,
    task.hoistableState,
    task.abortSet,
    task.keyPath,
    task.formatContext,
    task.context,
    task.treeContext,
    task.componentStack,
    task.isFallback
  );
}
function renderNode(request, task, node, childIndex) {
  var previousFormatContext = task.formatContext,
    previousContext = task.context,
    previousKeyPath = task.keyPath,
    previousTreeContext = task.treeContext,
    previousComponentStack = task.componentStack,
    segment = task.blockedSegment;
  if (null === segment)
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue) {
      if (
        (resetHooksState(),
        (node =
          thrownValue === SuspenseException
            ? getSuspendedThenable()
            : thrownValue),
        "object" === typeof node && null !== node)
      ) {
        if ("function" === typeof node.then) {
          childIndex = getThenableStateAfterSuspending();
          request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
          node.then(request, request);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
        if ("Maximum call stack size exceeded" === node.message) {
          node = getThenableStateAfterSuspending();
          node = spawnNewSuspendedReplayTask(request, task, node);
          request.pingedTasks.push(node);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
      }
    }
  else {
    var childrenLength = segment.children.length,
      chunkLength = segment.chunks.length;
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue$48) {
      if (
        (resetHooksState(),
        (segment.children.length = childrenLength),
        (segment.chunks.length = chunkLength),
        (node =
          thrownValue$48 === SuspenseException
            ? getSuspendedThenable()
            : thrownValue$48),
        "object" === typeof node && null !== node)
      ) {
        if ("function" === typeof node.then) {
          childIndex = getThenableStateAfterSuspending();
          request = spawnNewSuspendedRenderTask(request, task, childIndex).ping;
          node.then(request, request);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
        if ("Maximum call stack size exceeded" === node.message) {
          node = getThenableStateAfterSuspending();
          node = spawnNewSuspendedRenderTask(request, task, node);
          request.pingedTasks.push(node);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
      }
    }
  }
  task.formatContext = previousFormatContext;
  task.context = previousContext;
  task.keyPath = previousKeyPath;
  task.treeContext = previousTreeContext;
  switchContext(previousContext);
  throw node;
}
function abortTaskSoft(task) {
  var boundary = task.blockedBoundary;
  task = task.blockedSegment;
  null !== task && ((task.status = 3), finishedTask(this, boundary, task));
}
function abortRemainingReplayNodes(
  request$jscomp$0,
  boundary,
  nodes,
  slots,
  error,
  errorDigest$jscomp$0
) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (4 === node.length)
      abortRemainingReplayNodes(
        request$jscomp$0,
        boundary,
        node[2],
        node[3],
        error,
        errorDigest$jscomp$0
      );
    else {
      node = node[5];
      var request = request$jscomp$0,
        errorDigest = errorDigest$jscomp$0,
        resumedBoundary = createSuspenseBoundary(
          request,
          new Set(),
          null,
          null
        );
      resumedBoundary.parentFlushed = !0;
      resumedBoundary.rootSegmentID = node;
      resumedBoundary.status = 4;
      resumedBoundary.errorDigest = errorDigest;
      resumedBoundary.parentFlushed &&
        request.clientRenderedBoundaries.push(resumedBoundary);
    }
  }
  nodes.length = 0;
  if (null !== slots) {
    if (null === boundary) throw Error(formatProdErrorMessage(487));
    4 !== boundary.status &&
      ((boundary.status = 4),
      (boundary.errorDigest = errorDigest$jscomp$0),
      boundary.parentFlushed &&
        request$jscomp$0.clientRenderedBoundaries.push(boundary));
    if ("object" === typeof slots) for (var index in slots) delete slots[index];
  }
}
function abortTask(task, request, error) {
  var boundary = task.blockedBoundary,
    segment = task.blockedSegment;
  if (null !== segment) {
    if (6 === segment.status) return;
    segment.status = 3;
  }
  segment = getThrownInfo(task.componentStack);
  if (null === boundary) {
    if (13 !== request.status && 14 !== request.status) {
      boundary = task.replay;
      if (null === boundary) {
        logRecoverableError(request, error, segment);
        fatalError(request, error);
        return;
      }
      boundary.pendingTasks--;
      0 === boundary.pendingTasks &&
        0 < boundary.nodes.length &&
        ((task = logRecoverableError(request, error, segment)),
        abortRemainingReplayNodes(
          request,
          null,
          boundary.nodes,
          boundary.slots,
          error,
          task
        ));
      request.pendingRootTasks--;
      0 === request.pendingRootTasks && completeShell(request);
    }
  } else
    boundary.pendingTasks--,
      4 !== boundary.status &&
        ((boundary.status = 4),
        (task = logRecoverableError(request, error, segment)),
        (boundary.status = 4),
        (boundary.errorDigest = task),
        untrackBoundary(request, boundary),
        boundary.parentFlushed &&
          request.clientRenderedBoundaries.push(boundary)),
      boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
        return abortTask(fallbackTask, request, error);
      }),
      boundary.fallbackAbortableTasks.clear();
  request.allPendingTasks--;
  0 === request.allPendingTasks && completeAll(request);
}
function safelyEmitEarlyPreloads(request, shellComplete) {
  try {
    var renderState = request.renderState,
      onHeaders = renderState.onHeaders;
    if (onHeaders) {
      var headers = renderState.headers;
      if (headers) {
        renderState.headers = null;
        var linkHeader = headers.preconnects;
        headers.fontPreloads &&
          (linkHeader && (linkHeader += ", "),
          (linkHeader += headers.fontPreloads));
        headers.highImagePreloads &&
          (linkHeader && (linkHeader += ", "),
          (linkHeader += headers.highImagePreloads));
        if (!shellComplete) {
          var queueIter = renderState.styles.values(),
            queueStep = queueIter.next();
          b: for (
            ;
            0 < headers.remainingCapacity && !queueStep.done;
            queueStep = queueIter.next()
          )
            for (
              var sheetIter = queueStep.value.sheets.values(),
                sheetStep = sheetIter.next();
              0 < headers.remainingCapacity && !sheetStep.done;
              sheetStep = sheetIter.next()
            ) {
              var sheet = sheetStep.value,
                props = sheet.props,
                key = props.href,
                props$jscomp$0 = sheet.props,
                header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                  crossOrigin: props$jscomp$0.crossOrigin,
                  integrity: props$jscomp$0.integrity,
                  nonce: props$jscomp$0.nonce,
                  type: props$jscomp$0.type,
                  fetchPriority: props$jscomp$0.fetchPriority,
                  referrerPolicy: props$jscomp$0.referrerPolicy,
                  media: props$jscomp$0.media
                });
              if (0 <= (headers.remainingCapacity -= header.length + 2))
                (renderState.resets.style[key] = PRELOAD_NO_CREDS),
                  linkHeader && (linkHeader += ", "),
                  (linkHeader += header),
                  (renderState.resets.style[key] =
                    "string" === typeof props.crossOrigin ||
                    "string" === typeof props.integrity
                      ? [props.crossOrigin, props.integrity]
                      : PRELOAD_NO_CREDS);
              else break b;
            }
        }
        linkHeader ? onHeaders({ Link: linkHeader }) : onHeaders({});
      }
    }
  } catch (error) {
    logRecoverableError(request, error, {});
  }
}
function completeShell(request) {
  null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
  null === request.trackedPostpones && preparePreamble(request);
  request.onShellError = noop;
  request = request.onShellReady;
  request();
}
function completeAll(request) {
  safelyEmitEarlyPreloads(
    request,
    null === request.trackedPostpones
      ? !0
      : null === request.completedRootSegment ||
          5 !== request.completedRootSegment.status
  );
  preparePreamble(request);
  request = request.onAllReady;
  request();
}
function queueCompletedSegment(boundary, segment) {
  if (
    0 === segment.chunks.length &&
    1 === segment.children.length &&
    null === segment.children[0].boundary &&
    -1 === segment.children[0].id
  ) {
    var childSegment = segment.children[0];
    childSegment.id = segment.id;
    childSegment.parentFlushed = !0;
    1 === childSegment.status && queueCompletedSegment(boundary, childSegment);
  } else boundary.completedSegments.push(segment);
}
function finishedTask(request, boundary, segment) {
  if (null === boundary) {
    if (null !== segment && segment.parentFlushed) {
      if (null !== request.completedRootSegment)
        throw Error(formatProdErrorMessage(389));
      request.completedRootSegment = segment;
    }
    request.pendingRootTasks--;
    0 === request.pendingRootTasks && completeShell(request);
  } else
    boundary.pendingTasks--,
      4 !== boundary.status &&
        (0 === boundary.pendingTasks
          ? (0 === boundary.status && (boundary.status = 1),
            null !== segment &&
              segment.parentFlushed &&
              1 === segment.status &&
              queueCompletedSegment(boundary, segment),
            boundary.parentFlushed &&
              request.completedBoundaries.push(boundary),
            1 === boundary.status &&
              (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request),
              boundary.fallbackAbortableTasks.clear(),
              0 === request.pendingRootTasks &&
                null === request.trackedPostpones &&
                null !== boundary.contentPreamble &&
                preparePreamble(request)))
          : null !== segment &&
            segment.parentFlushed &&
            1 === segment.status &&
            (queueCompletedSegment(boundary, segment),
            1 === boundary.completedSegments.length &&
              boundary.parentFlushed &&
              request.partialBoundaries.push(boundary)));
  request.allPendingTasks--;
  0 === request.allPendingTasks && completeAll(request);
}
function performWork(request$jscomp$2) {
  if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
    var prevContext = currentActiveSnapshot,
      prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = HooksDispatcher;
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    var prevRequest = currentRequest;
    currentRequest = request$jscomp$2;
    var prevResumableState = currentResumableState;
    currentResumableState = request$jscomp$2.resumableState;
    try {
      var pingedTasks = request$jscomp$2.pingedTasks,
        i;
      for (i = 0; i < pingedTasks.length; i++) {
        var task = pingedTasks[i],
          request = request$jscomp$2,
          segment = task.blockedSegment;
        if (null === segment) {
          var request$jscomp$0 = request;
          if (0 !== task.replay.pendingTasks) {
            switchContext(task.context);
            try {
              "number" === typeof task.replay.slots
                ? resumeNode(
                    request$jscomp$0,
                    task,
                    task.replay.slots,
                    task.node,
                    task.childIndex
                  )
                : retryNode(request$jscomp$0, task);
              if (
                1 === task.replay.pendingTasks &&
                0 < task.replay.nodes.length
              )
                throw Error(formatProdErrorMessage(488));
              task.replay.pendingTasks--;
              task.abortSet.delete(task);
              finishedTask(request$jscomp$0, task.blockedBoundary, null);
            } catch (thrownValue) {
              resetHooksState();
              var x =
                thrownValue === SuspenseException
                  ? getSuspendedThenable()
                  : thrownValue;
              if (
                "object" === typeof x &&
                null !== x &&
                "function" === typeof x.then
              ) {
                var ping = task.ping;
                x.then(ping, ping);
                task.thenableState = getThenableStateAfterSuspending();
              } else {
                task.replay.pendingTasks--;
                task.abortSet.delete(task);
                var errorInfo = getThrownInfo(task.componentStack);
                request = void 0;
                var request$jscomp$1 = request$jscomp$0,
                  boundary = task.blockedBoundary,
                  error$jscomp$0 =
                    12 === request$jscomp$0.status
                      ? request$jscomp$0.fatalError
                      : x,
                  replayNodes = task.replay.nodes,
                  resumeSlots = task.replay.slots;
                request = logRecoverableError(
                  request$jscomp$1,
                  error$jscomp$0,
                  errorInfo
                );
                abortRemainingReplayNodes(
                  request$jscomp$1,
                  boundary,
                  replayNodes,
                  resumeSlots,
                  error$jscomp$0,
                  request
                );
                request$jscomp$0.pendingRootTasks--;
                0 === request$jscomp$0.pendingRootTasks &&
                  completeShell(request$jscomp$0);
                request$jscomp$0.allPendingTasks--;
                0 === request$jscomp$0.allPendingTasks &&
                  completeAll(request$jscomp$0);
              }
            } finally {
            }
          }
        } else if (
          ((request$jscomp$0 = void 0),
          (request$jscomp$1 = segment),
          0 === request$jscomp$1.status)
        ) {
          request$jscomp$1.status = 6;
          switchContext(task.context);
          var childrenLength = request$jscomp$1.children.length,
            chunkLength = request$jscomp$1.chunks.length;
          try {
            retryNode(request, task),
              pushSegmentFinale(
                request$jscomp$1.chunks,
                request.renderState,
                request$jscomp$1.lastPushedText,
                request$jscomp$1.textEmbedded
              ),
              task.abortSet.delete(task),
              (request$jscomp$1.status = 1),
              finishedTask(request, task.blockedBoundary, request$jscomp$1);
          } catch (thrownValue) {
            resetHooksState();
            request$jscomp$1.children.length = childrenLength;
            request$jscomp$1.chunks.length = chunkLength;
            var x$jscomp$0 =
              thrownValue === SuspenseException
                ? getSuspendedThenable()
                : 12 === request.status
                  ? request.fatalError
                  : thrownValue;
            if (
              "object" === typeof x$jscomp$0 &&
              null !== x$jscomp$0 &&
              "function" === typeof x$jscomp$0.then
            ) {
              request$jscomp$1.status = 0;
              task.thenableState = getThenableStateAfterSuspending();
              var ping$jscomp$0 = task.ping;
              x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
            } else {
              var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
              task.abortSet.delete(task);
              request$jscomp$1.status = 4;
              var boundary$jscomp$0 = task.blockedBoundary;
              request$jscomp$0 = logRecoverableError(
                request,
                x$jscomp$0,
                errorInfo$jscomp$0
              );
              null === boundary$jscomp$0
                ? fatalError(request, x$jscomp$0)
                : (boundary$jscomp$0.pendingTasks--,
                  4 !== boundary$jscomp$0.status &&
                    ((boundary$jscomp$0.status = 4),
                    (boundary$jscomp$0.errorDigest = request$jscomp$0),
                    untrackBoundary(request, boundary$jscomp$0),
                    boundary$jscomp$0.parentFlushed &&
                      request.clientRenderedBoundaries.push(boundary$jscomp$0),
                    0 === request.pendingRootTasks &&
                      null === request.trackedPostpones &&
                      null !== boundary$jscomp$0.contentPreamble &&
                      preparePreamble(request)));
              request.allPendingTasks--;
              0 === request.allPendingTasks && completeAll(request);
            }
          } finally {
          }
        }
      }
      pingedTasks.splice(0, i);
      null !== request$jscomp$2.destination &&
        flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
    } catch (error) {
      logRecoverableError(request$jscomp$2, error, {}),
        fatalError(request$jscomp$2, error);
    } finally {
      (currentResumableState = prevResumableState),
        (ReactSharedInternals.H = prevDispatcher),
        (ReactSharedInternals.A = prevAsyncDispatcher),
        prevDispatcher === HooksDispatcher && switchContext(prevContext),
        (currentRequest = prevRequest);
    }
  }
}
function preparePreambleFromSubtree(
  request,
  segment,
  collectedPreambleSegments
) {
  segment.preambleChildren.length &&
    collectedPreambleSegments.push(segment.preambleChildren);
  for (var pendingPreambles = !1, i = 0; i < segment.children.length; i++)
    pendingPreambles =
      preparePreambleFromSegment(
        request,
        segment.children[i],
        collectedPreambleSegments
      ) || pendingPreambles;
  return pendingPreambles;
}
function preparePreambleFromSegment(
  request,
  segment,
  collectedPreambleSegments
) {
  var boundary = segment.boundary;
  if (null === boundary)
    return preparePreambleFromSubtree(
      request,
      segment,
      collectedPreambleSegments
    );
  var preamble = boundary.contentPreamble,
    fallbackPreamble = boundary.fallbackPreamble;
  if (null === preamble || null === fallbackPreamble) return !1;
  switch (boundary.status) {
    case 1:
      hoistPreambleState(request.renderState, preamble);
      segment = boundary.completedSegments[0];
      if (!segment) throw Error(formatProdErrorMessage(391));
      return preparePreambleFromSubtree(
        request,
        segment,
        collectedPreambleSegments
      );
    case 5:
      if (null !== request.trackedPostpones) return !0;
    case 4:
      if (1 === segment.status)
        return (
          hoistPreambleState(request.renderState, fallbackPreamble),
          preparePreambleFromSubtree(
            request,
            segment,
            collectedPreambleSegments
          )
        );
    default:
      return !0;
  }
}
function preparePreamble(request) {
  if (
    request.completedRootSegment &&
    null === request.completedPreambleSegments
  ) {
    var collectedPreambleSegments = [],
      hasPendingPreambles = preparePreambleFromSegment(
        request,
        request.completedRootSegment,
        collectedPreambleSegments
      ),
      preamble = request.renderState.preamble;
    if (
      !1 === hasPendingPreambles ||
      (preamble.headChunks && preamble.bodyChunks)
    )
      request.completedPreambleSegments = collectedPreambleSegments;
  }
}
function flushSubtree(request, destination, segment, hoistableState) {
  segment.parentFlushed = !0;
  switch (segment.status) {
    case 0:
      segment.id = request.nextSegmentId++;
    case 5:
      return (
        (hoistableState = segment.id),
        (segment.lastPushedText = !1),
        (segment.textEmbedded = !1),
        (request = request.renderState),
        destination.push('<template id="'),
        destination.push(request.placeholderPrefix),
        (request = hoistableState.toString(16)),
        destination.push(request),
        destination.push('"></template>')
      );
    case 1:
      segment.status = 2;
      var r = !0,
        chunks = segment.chunks,
        chunkIdx = 0;
      segment = segment.children;
      for (var childIdx = 0; childIdx < segment.length; childIdx++) {
        for (r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)
          destination.push(chunks[chunkIdx]);
        r = flushSegment(request, destination, r, hoistableState);
      }
      for (; chunkIdx < chunks.length - 1; chunkIdx++)
        destination.push(chunks[chunkIdx]);
      chunkIdx < chunks.length && (r = destination.push(chunks[chunkIdx]));
      return r;
    default:
      throw Error(formatProdErrorMessage(390));
  }
}
function flushSegment(request, destination, segment, hoistableState) {
  var boundary = segment.boundary;
  if (null === boundary)
    return flushSubtree(request, destination, segment, hoistableState);
  boundary.parentFlushed = !0;
  if (4 === boundary.status) {
    if (!request.renderState.generateStaticMarkup) {
      var errorDigest = boundary.errorDigest;
      destination.push("\x3c!--$!--\x3e");
      destination.push("<template");
      errorDigest &&
        (destination.push(' data-dgst="'),
        (errorDigest = escapeTextForBrowser(errorDigest)),
        destination.push(errorDigest),
        destination.push('"'));
      destination.push("></template>");
    }
    flushSubtree(request, destination, segment, hoistableState);
    request.renderState.generateStaticMarkup
      ? (destination = !0)
      : ((request = boundary.fallbackPreamble) &&
          writePreambleContribution(destination, request),
        (destination = destination.push("\x3c!--/$--\x3e")));
    return destination;
  }
  if (1 !== boundary.status)
    return (
      0 === boundary.status &&
        (boundary.rootSegmentID = request.nextSegmentId++),
      0 < boundary.completedSegments.length &&
        request.partialBoundaries.push(boundary),
      writeStartPendingSuspenseBoundary(
        destination,
        request.renderState,
        boundary.rootSegmentID
      ),
      hoistableState &&
        ((boundary = boundary.fallbackState),
        boundary.styles.forEach(hoistStyleQueueDependency, hoistableState),
        boundary.stylesheets.forEach(
          hoistStylesheetDependency,
          hoistableState
        )),
      flushSubtree(request, destination, segment, hoistableState),
      destination.push("\x3c!--/$--\x3e")
    );
  if (boundary.byteSize > request.progressiveChunkSize)
    return (
      (boundary.rootSegmentID = request.nextSegmentId++),
      request.completedBoundaries.push(boundary),
      writeStartPendingSuspenseBoundary(
        destination,
        request.renderState,
        boundary.rootSegmentID
      ),
      flushSubtree(request, destination, segment, hoistableState),
      destination.push("\x3c!--/$--\x3e")
    );
  hoistableState &&
    ((segment = boundary.contentState),
    segment.styles.forEach(hoistStyleQueueDependency, hoistableState),
    segment.stylesheets.forEach(hoistStylesheetDependency, hoistableState));
  request.renderState.generateStaticMarkup ||
    destination.push("\x3c!--$--\x3e");
  segment = boundary.completedSegments;
  if (1 !== segment.length) throw Error(formatProdErrorMessage(391));
  flushSegment(request, destination, segment[0], hoistableState);
  request.renderState.generateStaticMarkup
    ? (destination = !0)
    : ((request = boundary.contentPreamble) &&
        writePreambleContribution(destination, request),
      (destination = destination.push("\x3c!--/$--\x3e")));
  return destination;
}
function flushSegmentContainer(request, destination, segment, hoistableState) {
  writeStartSegment(
    destination,
    request.renderState,
    segment.parentFormatContext,
    segment.id
  );
  flushSegment(request, destination, segment, hoistableState);
  return writeEndSegment(destination, segment.parentFormatContext);
}
function flushCompletedBoundary(request, destination, boundary) {
  for (
    var completedSegments = boundary.completedSegments, i = 0;
    i < completedSegments.length;
    i++
  )
    flushPartiallyCompletedSegment(
      request,
      destination,
      boundary,
      completedSegments[i]
    );
  completedSegments.length = 0;
  writeHoistablesForBoundary(
    destination,
    boundary.contentState,
    request.renderState
  );
  completedSegments = request.resumableState;
  request = request.renderState;
  i = boundary.rootSegmentID;
  boundary = boundary.contentState;
  var requiresStyleInsertion = request.stylesToHoist;
  request.stylesToHoist = !1;
  destination.push(request.startInlineScript);
  requiresStyleInsertion
    ? 0 === (completedSegments.instructions & 2)
      ? ((completedSegments.instructions |= 10),
        destination.push(
          '$RC=function(b,c,e){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(e)b.data="$!",a.setAttribute("data-dgst",e);else{e=b.parentNode;a=b.nextSibling;var f=0;do{if(a&&8===a.nodeType){var d=a.data;if("/$"===d)if(0===f)break;else f--;else"$"!==d&&"$?"!==d&&"$!"!==d||f++}d=a.nextSibling;e.removeChild(a);a=d}while(a);for(;c.firstChild;)e.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RM=new Map;\n$RR=function(t,u,y){function v(n){this._p=null;n()}for(var w=$RC,p=$RM,q=new Map,r=document,g,b,h=r.querySelectorAll("link[data-precedence],style[data-precedence]"),x=[],k=0;b=h[k++];)"not all"===b.getAttribute("media")?x.push(b):("LINK"===b.tagName&&p.set(b.getAttribute("href"),b),q.set(b.dataset.precedence,g=b));b=0;h=[];var l,a;for(k=!0;;){if(k){var e=y[b++];if(!e){k=!1;b=0;continue}var c=!1,m=0;var d=e[m++];if(a=p.get(d)){var f=a._p;c=!0}else{a=r.createElement("link");a.href=\nd;a.rel="stylesheet";for(a.dataset.precedence=l=e[m++];f=e[m++];)a.setAttribute(f,e[m++]);f=a._p=new Promise(function(n,z){a.onload=v.bind(a,n);a.onerror=v.bind(a,z)});p.set(d,a)}d=a.getAttribute("media");!f||d&&!matchMedia(d).matches||h.push(f);if(c)continue}else{a=x[b++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=q.get(l)||g;c===g&&(g=a);q.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=r.head,c.insertBefore(a,c.firstChild))}Promise.all(h).then(w.bind(null,\nt,u,""),w.bind(null,t,u,"Resource failed to load"))};$RR("'
        ))
      : 0 === (completedSegments.instructions & 8)
        ? ((completedSegments.instructions |= 8),
          destination.push(
            '$RM=new Map;\n$RR=function(t,u,y){function v(n){this._p=null;n()}for(var w=$RC,p=$RM,q=new Map,r=document,g,b,h=r.querySelectorAll("link[data-precedence],style[data-precedence]"),x=[],k=0;b=h[k++];)"not all"===b.getAttribute("media")?x.push(b):("LINK"===b.tagName&&p.set(b.getAttribute("href"),b),q.set(b.dataset.precedence,g=b));b=0;h=[];var l,a;for(k=!0;;){if(k){var e=y[b++];if(!e){k=!1;b=0;continue}var c=!1,m=0;var d=e[m++];if(a=p.get(d)){var f=a._p;c=!0}else{a=r.createElement("link");a.href=\nd;a.rel="stylesheet";for(a.dataset.precedence=l=e[m++];f=e[m++];)a.setAttribute(f,e[m++]);f=a._p=new Promise(function(n,z){a.onload=v.bind(a,n);a.onerror=v.bind(a,z)});p.set(d,a)}d=a.getAttribute("media");!f||d&&!matchMedia(d).matches||h.push(f);if(c)continue}else{a=x[b++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=q.get(l)||g;c===g&&(g=a);q.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=r.head,c.insertBefore(a,c.firstChild))}Promise.all(h).then(w.bind(null,\nt,u,""),w.bind(null,t,u,"Resource failed to load"))};$RR("'
          ))
        : destination.push('$RR("')
    : 0 === (completedSegments.instructions & 2)
      ? ((completedSegments.instructions |= 2),
        destination.push(
          '$RC=function(b,c,e){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(e)b.data="$!",a.setAttribute("data-dgst",e);else{e=b.parentNode;a=b.nextSibling;var f=0;do{if(a&&8===a.nodeType){var d=a.data;if("/$"===d)if(0===f)break;else f--;else"$"!==d&&"$?"!==d&&"$!"!==d||f++}d=a.nextSibling;e.removeChild(a);a=d}while(a);for(;c.firstChild;)e.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RC("'
        ))
      : destination.push('$RC("');
  completedSegments = i.toString(16);
  destination.push(request.boundaryPrefix);
  destination.push(completedSegments);
  destination.push('","');
  destination.push(request.segmentPrefix);
  destination.push(completedSegments);
  requiresStyleInsertion
    ? (destination.push('",'),
      writeStyleResourceDependenciesInJS(destination, boundary))
    : destination.push('"');
  boundary = destination.push(")\x3c/script>");
  return writeBootstrap(destination, request) && boundary;
}
function flushPartiallyCompletedSegment(
  request,
  destination,
  boundary,
  segment
) {
  if (2 === segment.status) return !0;
  var hoistableState = boundary.contentState,
    segmentID = segment.id;
  if (-1 === segmentID) {
    if (-1 === (segment.id = boundary.rootSegmentID))
      throw Error(formatProdErrorMessage(392));
    return flushSegmentContainer(request, destination, segment, hoistableState);
  }
  if (segmentID === boundary.rootSegmentID)
    return flushSegmentContainer(request, destination, segment, hoistableState);
  flushSegmentContainer(request, destination, segment, hoistableState);
  boundary = request.resumableState;
  request = request.renderState;
  destination.push(request.startInlineScript);
  0 === (boundary.instructions & 1)
    ? ((boundary.instructions |= 1),
      destination.push(
        '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'
      ))
    : destination.push('$RS("');
  destination.push(request.segmentPrefix);
  segmentID = segmentID.toString(16);
  destination.push(segmentID);
  destination.push('","');
  destination.push(request.placeholderPrefix);
  destination.push(segmentID);
  destination = destination.push('")\x3c/script>');
  return destination;
}
function flushCompletedQueues(request, destination) {
  try {
    if (!(0 < request.pendingRootTasks)) {
      var i,
        completedRootSegment = request.completedRootSegment;
      if (null !== completedRootSegment) {
        if (5 === completedRootSegment.status) return;
        var completedPreambleSegments = request.completedPreambleSegments;
        if (null === completedPreambleSegments) return;
        var renderState = request.renderState,
          preamble = renderState.preamble,
          htmlChunks = preamble.htmlChunks,
          headChunks = preamble.headChunks,
          i$jscomp$0;
        if (htmlChunks) {
          for (i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)
            destination.push(htmlChunks[i$jscomp$0]);
          if (headChunks)
            for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
              destination.push(headChunks[i$jscomp$0]);
          else {
            var chunk = startChunkForTag("head");
            destination.push(chunk);
            destination.push(">");
          }
        } else if (headChunks)
          for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
            destination.push(headChunks[i$jscomp$0]);
        var charsetChunks = renderState.charsetChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)
          destination.push(charsetChunks[i$jscomp$0]);
        charsetChunks.length = 0;
        renderState.preconnects.forEach(flushResource, destination);
        renderState.preconnects.clear();
        var viewportChunks = renderState.viewportChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)
          destination.push(viewportChunks[i$jscomp$0]);
        viewportChunks.length = 0;
        renderState.fontPreloads.forEach(flushResource, destination);
        renderState.fontPreloads.clear();
        renderState.highImagePreloads.forEach(flushResource, destination);
        renderState.highImagePreloads.clear();
        renderState.styles.forEach(flushStylesInPreamble, destination);
        var importMapChunks = renderState.importMapChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)
          destination.push(importMapChunks[i$jscomp$0]);
        importMapChunks.length = 0;
        renderState.bootstrapScripts.forEach(flushResource, destination);
        renderState.scripts.forEach(flushResource, destination);
        renderState.scripts.clear();
        renderState.bulkPreloads.forEach(flushResource, destination);
        renderState.bulkPreloads.clear();
        var hoistableChunks = renderState.hoistableChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)
          destination.push(hoistableChunks[i$jscomp$0]);
        for (
          renderState = hoistableChunks.length = 0;
          renderState < completedPreambleSegments.length;
          renderState++
        ) {
          var segments = completedPreambleSegments[renderState];
          for (preamble = 0; preamble < segments.length; preamble++)
            flushSegment(request, destination, segments[preamble], null);
        }
        var preamble$jscomp$0 = request.renderState.preamble,
          headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
        if (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) {
          var chunk$jscomp$0 = endChunkForTag("head");
          destination.push(chunk$jscomp$0);
        }
        var bodyChunks = preamble$jscomp$0.bodyChunks;
        if (bodyChunks)
          for (
            completedPreambleSegments = 0;
            completedPreambleSegments < bodyChunks.length;
            completedPreambleSegments++
          )
            destination.push(bodyChunks[completedPreambleSegments]);
        flushSegment(request, destination, completedRootSegment, null);
        request.completedRootSegment = null;
        writeBootstrap(destination, request.renderState);
      }
      var renderState$jscomp$0 = request.renderState;
      completedRootSegment = 0;
      var viewportChunks$jscomp$0 = renderState$jscomp$0.viewportChunks;
      for (
        completedRootSegment = 0;
        completedRootSegment < viewportChunks$jscomp$0.length;
        completedRootSegment++
      )
        destination.push(viewportChunks$jscomp$0[completedRootSegment]);
      viewportChunks$jscomp$0.length = 0;
      renderState$jscomp$0.preconnects.forEach(flushResource, destination);
      renderState$jscomp$0.preconnects.clear();
      renderState$jscomp$0.fontPreloads.forEach(flushResource, destination);
      renderState$jscomp$0.fontPreloads.clear();
      renderState$jscomp$0.highImagePreloads.forEach(
        flushResource,
        destination
      );
      renderState$jscomp$0.highImagePreloads.clear();
      renderState$jscomp$0.styles.forEach(preloadLateStyles, destination);
      renderState$jscomp$0.scripts.forEach(flushResource, destination);
      renderState$jscomp$0.scripts.clear();
      renderState$jscomp$0.bulkPreloads.forEach(flushResource, destination);
      renderState$jscomp$0.bulkPreloads.clear();
      var hoistableChunks$jscomp$0 = renderState$jscomp$0.hoistableChunks;
      for (
        completedRootSegment = 0;
        completedRootSegment < hoistableChunks$jscomp$0.length;
        completedRootSegment++
      )
        destination.push(hoistableChunks$jscomp$0[completedRootSegment]);
      hoistableChunks$jscomp$0.length = 0;
      var clientRenderedBoundaries = request.clientRenderedBoundaries;
      for (i = 0; i < clientRenderedBoundaries.length; i++) {
        var boundary = clientRenderedBoundaries[i];
        renderState$jscomp$0 = destination;
        var resumableState = request.resumableState,
          renderState$jscomp$1 = request.renderState,
          id = boundary.rootSegmentID,
          errorDigest = boundary.errorDigest;
        renderState$jscomp$0.push(renderState$jscomp$1.startInlineScript);
        0 === (resumableState.instructions & 4)
          ? ((resumableState.instructions |= 4),
            renderState$jscomp$0.push(
              '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("'
            ))
          : renderState$jscomp$0.push('$RX("');
        renderState$jscomp$0.push(renderState$jscomp$1.boundaryPrefix);
        var chunk$jscomp$1 = id.toString(16);
        renderState$jscomp$0.push(chunk$jscomp$1);
        renderState$jscomp$0.push('"');
        if (errorDigest) {
          renderState$jscomp$0.push(",");
          var chunk$jscomp$2 = escapeJSStringsForInstructionScripts(
            errorDigest || ""
          );
          renderState$jscomp$0.push(chunk$jscomp$2);
        }
        var JSCompiler_inline_result =
          renderState$jscomp$0.push(")\x3c/script>");
        if (!JSCompiler_inline_result) {
          request.destination = null;
          i++;
          clientRenderedBoundaries.splice(0, i);
          return;
        }
      }
      clientRenderedBoundaries.splice(0, i);
      var completedBoundaries = request.completedBoundaries;
      for (i = 0; i < completedBoundaries.length; i++)
        if (
          !flushCompletedBoundary(request, destination, completedBoundaries[i])
        ) {
          request.destination = null;
          i++;
          completedBoundaries.splice(0, i);
          return;
        }
      completedBoundaries.splice(0, i);
      var partialBoundaries = request.partialBoundaries;
      for (i = 0; i < partialBoundaries.length; i++) {
        var boundary$51 = partialBoundaries[i];
        a: {
          clientRenderedBoundaries = request;
          boundary = destination;
          var completedSegments = boundary$51.completedSegments;
          for (
            JSCompiler_inline_result = 0;
            JSCompiler_inline_result < completedSegments.length;
            JSCompiler_inline_result++
          )
            if (
              !flushPartiallyCompletedSegment(
                clientRenderedBoundaries,
                boundary,
                boundary$51,
                completedSegments[JSCompiler_inline_result]
              )
            ) {
              JSCompiler_inline_result++;
              completedSegments.splice(0, JSCompiler_inline_result);
              var JSCompiler_inline_result$jscomp$0 = !1;
              break a;
            }
          completedSegments.splice(0, JSCompiler_inline_result);
          JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(
            boundary,
            boundary$51.contentState,
            clientRenderedBoundaries.renderState
          );
        }
        if (!JSCompiler_inline_result$jscomp$0) {
          request.destination = null;
          i++;
          partialBoundaries.splice(0, i);
          return;
        }
      }
      partialBoundaries.splice(0, i);
      var largeBoundaries = request.completedBoundaries;
      for (i = 0; i < largeBoundaries.length; i++)
        if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
          request.destination = null;
          i++;
          largeBoundaries.splice(0, i);
          return;
        }
      largeBoundaries.splice(0, i);
    }
  } finally {
    0 === request.allPendingTasks &&
      0 === request.pingedTasks.length &&
      0 === request.clientRenderedBoundaries.length &&
      0 === request.completedBoundaries.length &&
      ((request.flushScheduled = !1),
      (i = request.resumableState),
      i.hasBody &&
        ((partialBoundaries = endChunkForTag("body")),
        destination.push(partialBoundaries)),
      i.hasHtml && ((i = endChunkForTag("html")), destination.push(i)),
      (request.status = 14),
      destination.push(null),
      (request.destination = null));
  }
}
function enqueueFlush(request) {
  if (
    !1 === request.flushScheduled &&
    0 === request.pingedTasks.length &&
    null !== request.destination
  ) {
    request.flushScheduled = !0;
    var destination = request.destination;
    destination
      ? flushCompletedQueues(request, destination)
      : (request.flushScheduled = !1);
  }
}
function startFlowing(request, destination) {
  if (13 === request.status)
    (request.status = 14), destination.destroy(request.fatalError);
  else if (14 !== request.status && null === request.destination) {
    request.destination = destination;
    try {
      flushCompletedQueues(request, destination);
    } catch (error) {
      logRecoverableError(request, error, {}), fatalError(request, error);
    }
  }
}
function abort(request, reason) {
  if (11 === request.status || 10 === request.status) request.status = 12;
  try {
    var abortableTasks = request.abortableTasks;
    if (0 < abortableTasks.size) {
      var error =
        void 0 === reason
          ? Error(formatProdErrorMessage(432))
          : "object" === typeof reason &&
              null !== reason &&
              "function" === typeof reason.then
            ? Error(formatProdErrorMessage(530))
            : reason;
      request.fatalError = error;
      abortableTasks.forEach(function (task) {
        return abortTask(task, request, error);
      });
      abortableTasks.clear();
    }
    null !== request.destination &&
      flushCompletedQueues(request, request.destination);
  } catch (error$53) {
    logRecoverableError(request, error$53, {}), fatalError(request, error$53);
  }
}
function onError() {}
function renderToStringImpl(
  children,
  options,
  generateStaticMarkup,
  abortReason
) {
  var didFatal = !1,
    fatalError = null,
    result = "",
    readyToStream = !1;
  options = createResumableState(options ? options.identifierPrefix : void 0);
  children = createRequest(
    children,
    options,
    createRenderState(options, generateStaticMarkup),
    createFormatContext(0, null, 0),
    Infinity,
    onError,
    void 0,
    function () {
      readyToStream = !0;
    },
    void 0,
    void 0,
    void 0
  );
  children.flushScheduled = null !== children.destination;
  performWork(children);
  10 === children.status && (children.status = 11);
  null === children.trackedPostpones &&
    safelyEmitEarlyPreloads(children, 0 === children.pendingRootTasks);
  abort(children, abortReason);
  startFlowing(children, {
    push: function (chunk) {
      null !== chunk && (result += chunk);
      return !0;
    },
    destroy: function (error) {
      didFatal = !0;
      fatalError = error;
    }
  });
  if (didFatal && fatalError !== abortReason) throw fatalError;
  if (!readyToStream) throw Error(formatProdErrorMessage(426));
  return result;
}
exports.renderToStaticMarkup = function (children, options) {
  return renderToStringImpl(
    children,
    options,
    !0,
    'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server'
  );
};
exports.renderToString = function (children, options) {
  return renderToStringImpl(
    children,
    options,
    !1,
    'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server'
  );
};
exports.version = "19.1.0";


/***/ }),

/***/ 7909:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * react-dom-server.browser.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*


 JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)

 Copyright (c) 2011 Gary Court
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

var React = __webpack_require__(6540),
  ReactDOM = __webpack_require__(961);
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
  REACT_PROVIDER_TYPE = Symbol.for("react.provider"),
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
  REACT_MEMO_TYPE = Symbol.for("react.memo"),
  REACT_LAZY_TYPE = Symbol.for("react.lazy"),
  REACT_SCOPE_TYPE = Symbol.for("react.scope"),
  REACT_ACTIVITY_TYPE = Symbol.for("react.activity"),
  REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden"),
  REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel"),
  REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"),
  MAYBE_ITERATOR_SYMBOL = Symbol.iterator,
  isArrayImpl = Array.isArray;
function murmurhash3_32_gc(key, seed) {
  var remainder = key.length & 3;
  var bytes = key.length - remainder;
  var h1 = seed;
  for (seed = 0; seed < bytes; ) {
    var k1 =
      (key.charCodeAt(seed) & 255) |
      ((key.charCodeAt(++seed) & 255) << 8) |
      ((key.charCodeAt(++seed) & 255) << 16) |
      ((key.charCodeAt(++seed) & 255) << 24);
    ++seed;
    k1 =
      (3432918353 * (k1 & 65535) +
        (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
      4294967295;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      (461845907 * (k1 & 65535) + (((461845907 * (k1 >>> 16)) & 65535) << 16)) &
      4294967295;
    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (5 * (h1 & 65535) + (((5 * (h1 >>> 16)) & 65535) << 16)) & 4294967295;
    h1 = (h1 & 65535) + 27492 + ((((h1 >>> 16) + 58964) & 65535) << 16);
  }
  k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(seed + 2) & 255) << 16;
    case 2:
      k1 ^= (key.charCodeAt(seed + 1) & 255) << 8;
    case 1:
      (k1 ^= key.charCodeAt(seed) & 255),
        (k1 =
          (3432918353 * (k1 & 65535) +
            (((3432918353 * (k1 >>> 16)) & 65535) << 16)) &
          4294967295),
        (k1 = (k1 << 15) | (k1 >>> 17)),
        (h1 ^=
          (461845907 * (k1 & 65535) +
            (((461845907 * (k1 >>> 16)) & 65535) << 16)) &
          4294967295);
  }
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 =
    (2246822507 * (h1 & 65535) + (((2246822507 * (h1 >>> 16)) & 65535) << 16)) &
    4294967295;
  h1 ^= h1 >>> 13;
  h1 =
    (3266489909 * (h1 & 65535) + (((3266489909 * (h1 >>> 16)) & 65535) << 16)) &
    4294967295;
  return (h1 ^ (h1 >>> 16)) >>> 0;
}
var channel = new MessageChannel(),
  taskQueue = [];
channel.port1.onmessage = function () {
  var task = taskQueue.shift();
  task && task();
};
function scheduleWork(callback) {
  taskQueue.push(callback);
  channel.port2.postMessage(null);
}
function handleErrorInNextTick(error) {
  setTimeout(function () {
    throw error;
  });
}
var LocalPromise = Promise,
  scheduleMicrotask =
    "function" === typeof queueMicrotask
      ? queueMicrotask
      : function (callback) {
          LocalPromise.resolve(null)
            .then(callback)
            .catch(handleErrorInNextTick);
        },
  currentView = null,
  writtenBytes = 0;
function writeChunk(destination, chunk) {
  if (0 !== chunk.byteLength)
    if (2048 < chunk.byteLength)
      0 < writtenBytes &&
        (destination.enqueue(
          new Uint8Array(currentView.buffer, 0, writtenBytes)
        ),
        (currentView = new Uint8Array(2048)),
        (writtenBytes = 0)),
        destination.enqueue(chunk);
    else {
      var allowableBytes = currentView.length - writtenBytes;
      allowableBytes < chunk.byteLength &&
        (0 === allowableBytes
          ? destination.enqueue(currentView)
          : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes),
            destination.enqueue(currentView),
            (chunk = chunk.subarray(allowableBytes))),
        (currentView = new Uint8Array(2048)),
        (writtenBytes = 0));
      currentView.set(chunk, writtenBytes);
      writtenBytes += chunk.byteLength;
    }
}
function writeChunkAndReturn(destination, chunk) {
  writeChunk(destination, chunk);
  return !0;
}
function completeWriting(destination) {
  currentView &&
    0 < writtenBytes &&
    (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)),
    (currentView = null),
    (writtenBytes = 0));
}
var textEncoder = new TextEncoder();
function stringToChunk(content) {
  return textEncoder.encode(content);
}
function stringToPrecomputedChunk(content) {
  return textEncoder.encode(content);
}
function closeWithError(destination, error) {
  "function" === typeof destination.error
    ? destination.error(error)
    : destination.close();
}
var assign = Object.assign,
  hasOwnProperty = Object.prototype.hasOwnProperty,
  VALID_ATTRIBUTE_NAME_REGEX = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ),
  illegalAttributeNameCache = {},
  validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
    return !0;
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
    return (validatedAttributeNameCache[attributeName] = !0);
  illegalAttributeNameCache[attributeName] = !0;
  return !1;
}
var unitlessNumbers = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  ),
  aliases = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]),
  matchHtmlRegExp = /["'&<>]/;
function escapeTextForBrowser(text) {
  if (
    "boolean" === typeof text ||
    "number" === typeof text ||
    "bigint" === typeof text
  )
    return "" + text;
  text = "" + text;
  var match = matchHtmlRegExp.exec(text);
  if (match) {
    var html = "",
      index,
      lastIndex = 0;
    for (index = match.index; index < text.length; index++) {
      switch (text.charCodeAt(index)) {
        case 34:
          match = "&quot;";
          break;
        case 38:
          match = "&amp;";
          break;
        case 39:
          match = "&#x27;";
          break;
        case 60:
          match = "&lt;";
          break;
        case 62:
          match = "&gt;";
          break;
        default:
          continue;
      }
      lastIndex !== index && (html += text.slice(lastIndex, index));
      lastIndex = index + 1;
      html += match;
    }
    text = lastIndex !== index ? html + text.slice(lastIndex, index) : html;
  }
  return text;
}
var uppercasePattern = /([A-Z])/g,
  msPattern = /^ms-/,
  isJavaScriptProtocol =
    /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
function sanitizeURL(url) {
  return isJavaScriptProtocol.test("" + url)
    ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
    : url;
}
var ReactSharedInternals =
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  ReactDOMSharedInternals =
    ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  sharedNotPendingObject = {
    pending: !1,
    data: null,
    method: null,
    action: null
  },
  previousDispatcher = ReactDOMSharedInternals.d;
ReactDOMSharedInternals.d = {
  f: previousDispatcher.f,
  r: previousDispatcher.r,
  D: prefetchDNS,
  C: preconnect,
  L: preload,
  m: preloadModule,
  X: preinitScript,
  S: preinitStyle,
  M: preinitModuleScript
};
var PRELOAD_NO_CREDS = [];
stringToPrecomputedChunk('"></template>');
var startInlineScript = stringToPrecomputedChunk("<script>"),
  endInlineScript = stringToPrecomputedChunk("\x3c/script>"),
  startScriptSrc = stringToPrecomputedChunk('<script src="'),
  startModuleSrc = stringToPrecomputedChunk('<script type="module" src="'),
  scriptNonce = stringToPrecomputedChunk('" nonce="'),
  scriptIntegirty = stringToPrecomputedChunk('" integrity="'),
  scriptCrossOrigin = stringToPrecomputedChunk('" crossorigin="'),
  endAsyncScript = stringToPrecomputedChunk('" async="">\x3c/script>'),
  scriptRegex = /(<\/|<)(s)(cript)/gi;
function scriptReplacer(match, prefix, s, suffix) {
  return "" + prefix + ("s" === s ? "\\u0073" : "\\u0053") + suffix;
}
var importMapScriptStart = stringToPrecomputedChunk(
    '<script type="importmap">'
  ),
  importMapScriptEnd = stringToPrecomputedChunk("\x3c/script>");
function createRenderState(
  resumableState,
  nonce,
  externalRuntimeConfig,
  importMap,
  onHeaders,
  maxHeadersLength
) {
  var inlineScriptWithNonce =
      void 0 === nonce
        ? startInlineScript
        : stringToPrecomputedChunk(
            '<script nonce="' + escapeTextForBrowser(nonce) + '">'
          ),
    idPrefix = resumableState.idPrefix;
  externalRuntimeConfig = [];
  var bootstrapScriptContent = resumableState.bootstrapScriptContent,
    bootstrapScripts = resumableState.bootstrapScripts,
    bootstrapModules = resumableState.bootstrapModules;
  void 0 !== bootstrapScriptContent &&
    externalRuntimeConfig.push(
      inlineScriptWithNonce,
      stringToChunk(
        ("" + bootstrapScriptContent).replace(scriptRegex, scriptReplacer)
      ),
      endInlineScript
    );
  bootstrapScriptContent = [];
  void 0 !== importMap &&
    (bootstrapScriptContent.push(importMapScriptStart),
    bootstrapScriptContent.push(
      stringToChunk(
        ("" + JSON.stringify(importMap)).replace(scriptRegex, scriptReplacer)
      )
    ),
    bootstrapScriptContent.push(importMapScriptEnd));
  importMap = onHeaders
    ? {
        preconnects: "",
        fontPreloads: "",
        highImagePreloads: "",
        remainingCapacity:
          2 + ("number" === typeof maxHeadersLength ? maxHeadersLength : 2e3)
      }
    : null;
  onHeaders = {
    placeholderPrefix: stringToPrecomputedChunk(idPrefix + "P:"),
    segmentPrefix: stringToPrecomputedChunk(idPrefix + "S:"),
    boundaryPrefix: stringToPrecomputedChunk(idPrefix + "B:"),
    startInlineScript: inlineScriptWithNonce,
    preamble: createPreambleState(),
    externalRuntimeScript: null,
    bootstrapChunks: externalRuntimeConfig,
    importMapChunks: bootstrapScriptContent,
    onHeaders: onHeaders,
    headers: importMap,
    resets: {
      font: {},
      dns: {},
      connect: { default: {}, anonymous: {}, credentials: {} },
      image: {},
      style: {}
    },
    charsetChunks: [],
    viewportChunks: [],
    hoistableChunks: [],
    preconnects: new Set(),
    fontPreloads: new Set(),
    highImagePreloads: new Set(),
    styles: new Map(),
    bootstrapScripts: new Set(),
    scripts: new Set(),
    bulkPreloads: new Set(),
    preloads: {
      images: new Map(),
      stylesheets: new Map(),
      scripts: new Map(),
      moduleScripts: new Map()
    },
    nonce: nonce,
    hoistableState: null,
    stylesToHoist: !1
  };
  if (void 0 !== bootstrapScripts)
    for (importMap = 0; importMap < bootstrapScripts.length; importMap++) {
      var scriptConfig = bootstrapScripts[importMap];
      idPrefix = inlineScriptWithNonce = void 0;
      bootstrapScriptContent = {
        rel: "preload",
        as: "script",
        fetchPriority: "low",
        nonce: nonce
      };
      "string" === typeof scriptConfig
        ? (bootstrapScriptContent.href = maxHeadersLength = scriptConfig)
        : ((bootstrapScriptContent.href = maxHeadersLength = scriptConfig.src),
          (bootstrapScriptContent.integrity = idPrefix =
            "string" === typeof scriptConfig.integrity
              ? scriptConfig.integrity
              : void 0),
          (bootstrapScriptContent.crossOrigin = inlineScriptWithNonce =
            "string" === typeof scriptConfig || null == scriptConfig.crossOrigin
              ? void 0
              : "use-credentials" === scriptConfig.crossOrigin
                ? "use-credentials"
                : ""));
      scriptConfig = resumableState;
      var href = maxHeadersLength;
      scriptConfig.scriptResources[href] = null;
      scriptConfig.moduleScriptResources[href] = null;
      scriptConfig = [];
      pushLinkImpl(scriptConfig, bootstrapScriptContent);
      onHeaders.bootstrapScripts.add(scriptConfig);
      externalRuntimeConfig.push(
        startScriptSrc,
        stringToChunk(escapeTextForBrowser(maxHeadersLength))
      );
      nonce &&
        externalRuntimeConfig.push(
          scriptNonce,
          stringToChunk(escapeTextForBrowser(nonce))
        );
      "string" === typeof idPrefix &&
        externalRuntimeConfig.push(
          scriptIntegirty,
          stringToChunk(escapeTextForBrowser(idPrefix))
        );
      "string" === typeof inlineScriptWithNonce &&
        externalRuntimeConfig.push(
          scriptCrossOrigin,
          stringToChunk(escapeTextForBrowser(inlineScriptWithNonce))
        );
      externalRuntimeConfig.push(endAsyncScript);
    }
  if (void 0 !== bootstrapModules)
    for (
      bootstrapScripts = 0;
      bootstrapScripts < bootstrapModules.length;
      bootstrapScripts++
    )
      (bootstrapScriptContent = bootstrapModules[bootstrapScripts]),
        (inlineScriptWithNonce = maxHeadersLength = void 0),
        (idPrefix = {
          rel: "modulepreload",
          fetchPriority: "low",
          nonce: nonce
        }),
        "string" === typeof bootstrapScriptContent
          ? (idPrefix.href = importMap = bootstrapScriptContent)
          : ((idPrefix.href = importMap = bootstrapScriptContent.src),
            (idPrefix.integrity = inlineScriptWithNonce =
              "string" === typeof bootstrapScriptContent.integrity
                ? bootstrapScriptContent.integrity
                : void 0),
            (idPrefix.crossOrigin = maxHeadersLength =
              "string" === typeof bootstrapScriptContent ||
              null == bootstrapScriptContent.crossOrigin
                ? void 0
                : "use-credentials" === bootstrapScriptContent.crossOrigin
                  ? "use-credentials"
                  : "")),
        (bootstrapScriptContent = resumableState),
        (scriptConfig = importMap),
        (bootstrapScriptContent.scriptResources[scriptConfig] = null),
        (bootstrapScriptContent.moduleScriptResources[scriptConfig] = null),
        (bootstrapScriptContent = []),
        pushLinkImpl(bootstrapScriptContent, idPrefix),
        onHeaders.bootstrapScripts.add(bootstrapScriptContent),
        externalRuntimeConfig.push(
          startModuleSrc,
          stringToChunk(escapeTextForBrowser(importMap))
        ),
        nonce &&
          externalRuntimeConfig.push(
            scriptNonce,
            stringToChunk(escapeTextForBrowser(nonce))
          ),
        "string" === typeof inlineScriptWithNonce &&
          externalRuntimeConfig.push(
            scriptIntegirty,
            stringToChunk(escapeTextForBrowser(inlineScriptWithNonce))
          ),
        "string" === typeof maxHeadersLength &&
          externalRuntimeConfig.push(
            scriptCrossOrigin,
            stringToChunk(escapeTextForBrowser(maxHeadersLength))
          ),
        externalRuntimeConfig.push(endAsyncScript);
  return onHeaders;
}
function createResumableState(
  identifierPrefix,
  externalRuntimeConfig,
  bootstrapScriptContent,
  bootstrapScripts,
  bootstrapModules
) {
  return {
    idPrefix: void 0 === identifierPrefix ? "" : identifierPrefix,
    nextFormID: 0,
    streamingFormat: 0,
    bootstrapScriptContent: bootstrapScriptContent,
    bootstrapScripts: bootstrapScripts,
    bootstrapModules: bootstrapModules,
    instructions: 0,
    hasBody: !1,
    hasHtml: !1,
    unknownResources: {},
    dnsResources: {},
    connectResources: { default: {}, anonymous: {}, credentials: {} },
    imageResources: {},
    styleResources: {},
    scriptResources: {},
    moduleUnknownResources: {},
    moduleScriptResources: {}
  };
}
function createPreambleState() {
  return {
    htmlChunks: null,
    headChunks: null,
    bodyChunks: null,
    contribution: 0
  };
}
function createFormatContext(insertionMode, selectedValue, tagScope) {
  return {
    insertionMode: insertionMode,
    selectedValue: selectedValue,
    tagScope: tagScope
  };
}
function createRootFormatContext(namespaceURI) {
  return createFormatContext(
    "http://www.w3.org/2000/svg" === namespaceURI
      ? 4
      : "http://www.w3.org/1998/Math/MathML" === namespaceURI
        ? 5
        : 0,
    null,
    0
  );
}
function getChildFormatContext(parentContext, type, props) {
  switch (type) {
    case "noscript":
      return createFormatContext(2, null, parentContext.tagScope | 1);
    case "select":
      return createFormatContext(
        2,
        null != props.value ? props.value : props.defaultValue,
        parentContext.tagScope
      );
    case "svg":
      return createFormatContext(4, null, parentContext.tagScope);
    case "picture":
      return createFormatContext(2, null, parentContext.tagScope | 2);
    case "math":
      return createFormatContext(5, null, parentContext.tagScope);
    case "foreignObject":
      return createFormatContext(2, null, parentContext.tagScope);
    case "table":
      return createFormatContext(6, null, parentContext.tagScope);
    case "thead":
    case "tbody":
    case "tfoot":
      return createFormatContext(7, null, parentContext.tagScope);
    case "colgroup":
      return createFormatContext(9, null, parentContext.tagScope);
    case "tr":
      return createFormatContext(8, null, parentContext.tagScope);
    case "head":
      if (2 > parentContext.insertionMode)
        return createFormatContext(3, null, parentContext.tagScope);
      break;
    case "html":
      if (0 === parentContext.insertionMode)
        return createFormatContext(1, null, parentContext.tagScope);
  }
  return 6 <= parentContext.insertionMode || 2 > parentContext.insertionMode
    ? createFormatContext(2, null, parentContext.tagScope)
    : parentContext;
}
var textSeparator = stringToPrecomputedChunk("\x3c!-- --\x3e");
function pushTextInstance(target, text, renderState, textEmbedded) {
  if ("" === text) return textEmbedded;
  textEmbedded && target.push(textSeparator);
  target.push(stringToChunk(escapeTextForBrowser(text)));
  return !0;
}
var styleNameCache = new Map(),
  styleAttributeStart = stringToPrecomputedChunk(' style="'),
  styleAssign = stringToPrecomputedChunk(":"),
  styleSeparator = stringToPrecomputedChunk(";");
function pushStyleAttribute(target, style) {
  if ("object" !== typeof style) throw Error(formatProdErrorMessage(62));
  var isFirst = !0,
    styleName;
  for (styleName in style)
    if (hasOwnProperty.call(style, styleName)) {
      var styleValue = style[styleName];
      if (
        null != styleValue &&
        "boolean" !== typeof styleValue &&
        "" !== styleValue
      ) {
        if (0 === styleName.indexOf("--")) {
          var nameChunk = stringToChunk(escapeTextForBrowser(styleName));
          styleValue = stringToChunk(
            escapeTextForBrowser(("" + styleValue).trim())
          );
        } else
          (nameChunk = styleNameCache.get(styleName)),
            void 0 === nameChunk &&
              ((nameChunk = stringToPrecomputedChunk(
                escapeTextForBrowser(
                  styleName
                    .replace(uppercasePattern, "-$1")
                    .toLowerCase()
                    .replace(msPattern, "-ms-")
                )
              )),
              styleNameCache.set(styleName, nameChunk)),
            (styleValue =
              "number" === typeof styleValue
                ? 0 === styleValue || unitlessNumbers.has(styleName)
                  ? stringToChunk("" + styleValue)
                  : stringToChunk(styleValue + "px")
                : stringToChunk(
                    escapeTextForBrowser(("" + styleValue).trim())
                  ));
        isFirst
          ? ((isFirst = !1),
            target.push(
              styleAttributeStart,
              nameChunk,
              styleAssign,
              styleValue
            ))
          : target.push(styleSeparator, nameChunk, styleAssign, styleValue);
      }
    }
  isFirst || target.push(attributeEnd);
}
var attributeSeparator = stringToPrecomputedChunk(" "),
  attributeAssign = stringToPrecomputedChunk('="'),
  attributeEnd = stringToPrecomputedChunk('"'),
  attributeEmptyString = stringToPrecomputedChunk('=""');
function pushBooleanAttribute(target, name, value) {
  value &&
    "function" !== typeof value &&
    "symbol" !== typeof value &&
    target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
}
function pushStringAttribute(target, name, value) {
  "function" !== typeof value &&
    "symbol" !== typeof value &&
    "boolean" !== typeof value &&
    target.push(
      attributeSeparator,
      stringToChunk(name),
      attributeAssign,
      stringToChunk(escapeTextForBrowser(value)),
      attributeEnd
    );
}
var actionJavaScriptURL = stringToPrecomputedChunk(
    escapeTextForBrowser(
      "javascript:throw new Error('React form unexpectedly submitted.')"
    )
  ),
  startHiddenInputChunk = stringToPrecomputedChunk('<input type="hidden"');
function pushAdditionalFormField(value, key) {
  this.push(startHiddenInputChunk);
  validateAdditionalFormField(value);
  pushStringAttribute(this, "name", key);
  pushStringAttribute(this, "value", value);
  this.push(endOfStartTagSelfClosing);
}
function validateAdditionalFormField(value) {
  if ("string" !== typeof value) throw Error(formatProdErrorMessage(480));
}
function getCustomFormFields(resumableState, formAction) {
  if ("function" === typeof formAction.$$FORM_ACTION) {
    var id = resumableState.nextFormID++;
    resumableState = resumableState.idPrefix + id;
    try {
      var customFields = formAction.$$FORM_ACTION(resumableState);
      if (customFields) {
        var formData = customFields.data;
        null != formData && formData.forEach(validateAdditionalFormField);
      }
      return customFields;
    } catch (x) {
      if ("object" === typeof x && null !== x && "function" === typeof x.then)
        throw x;
    }
  }
  return null;
}
function pushFormActionAttribute(
  target,
  resumableState,
  renderState,
  formAction,
  formEncType,
  formMethod,
  formTarget,
  name
) {
  var formData = null;
  if ("function" === typeof formAction) {
    var customFields = getCustomFormFields(resumableState, formAction);
    null !== customFields
      ? ((name = customFields.name),
        (formAction = customFields.action || ""),
        (formEncType = customFields.encType),
        (formMethod = customFields.method),
        (formTarget = customFields.target),
        (formData = customFields.data))
      : (target.push(
          attributeSeparator,
          stringToChunk("formAction"),
          attributeAssign,
          actionJavaScriptURL,
          attributeEnd
        ),
        (formTarget = formMethod = formEncType = formAction = name = null),
        injectFormReplayingRuntime(resumableState, renderState));
  }
  null != name && pushAttribute(target, "name", name);
  null != formAction && pushAttribute(target, "formAction", formAction);
  null != formEncType && pushAttribute(target, "formEncType", formEncType);
  null != formMethod && pushAttribute(target, "formMethod", formMethod);
  null != formTarget && pushAttribute(target, "formTarget", formTarget);
  return formData;
}
function pushAttribute(target, name, value) {
  switch (name) {
    case "className":
      pushStringAttribute(target, "class", value);
      break;
    case "tabIndex":
      pushStringAttribute(target, "tabindex", value);
      break;
    case "dir":
    case "role":
    case "viewBox":
    case "width":
    case "height":
      pushStringAttribute(target, name, value);
      break;
    case "style":
      pushStyleAttribute(target, value);
      break;
    case "src":
    case "href":
      if ("" === value) break;
    case "action":
    case "formAction":
      if (
        null == value ||
        "function" === typeof value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      )
        break;
      value = sanitizeURL("" + value);
      target.push(
        attributeSeparator,
        stringToChunk(name),
        attributeAssign,
        stringToChunk(escapeTextForBrowser(value)),
        attributeEnd
      );
      break;
    case "defaultValue":
    case "defaultChecked":
    case "innerHTML":
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "ref":
      break;
    case "autoFocus":
    case "multiple":
    case "muted":
      pushBooleanAttribute(target, name.toLowerCase(), value);
      break;
    case "xlinkHref":
      if (
        "function" === typeof value ||
        "symbol" === typeof value ||
        "boolean" === typeof value
      )
        break;
      value = sanitizeURL("" + value);
      target.push(
        attributeSeparator,
        stringToChunk("xlink:href"),
        attributeAssign,
        stringToChunk(escapeTextForBrowser(value)),
        attributeEnd
      );
      break;
    case "contentEditable":
    case "spellCheck":
    case "draggable":
    case "value":
    case "autoReverse":
    case "externalResourcesRequired":
    case "focusable":
    case "preserveAlpha":
      "function" !== typeof value &&
        "symbol" !== typeof value &&
        target.push(
          attributeSeparator,
          stringToChunk(name),
          attributeAssign,
          stringToChunk(escapeTextForBrowser(value)),
          attributeEnd
        );
      break;
    case "inert":
    case "allowFullScreen":
    case "async":
    case "autoPlay":
    case "controls":
    case "default":
    case "defer":
    case "disabled":
    case "disablePictureInPicture":
    case "disableRemotePlayback":
    case "formNoValidate":
    case "hidden":
    case "loop":
    case "noModule":
    case "noValidate":
    case "open":
    case "playsInline":
    case "readOnly":
    case "required":
    case "reversed":
    case "scoped":
    case "seamless":
    case "itemScope":
      value &&
        "function" !== typeof value &&
        "symbol" !== typeof value &&
        target.push(
          attributeSeparator,
          stringToChunk(name),
          attributeEmptyString
        );
      break;
    case "capture":
    case "download":
      !0 === value
        ? target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeEmptyString
          )
        : !1 !== value &&
          "function" !== typeof value &&
          "symbol" !== typeof value &&
          target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeAssign,
            stringToChunk(escapeTextForBrowser(value)),
            attributeEnd
          );
      break;
    case "cols":
    case "rows":
    case "size":
    case "span":
      "function" !== typeof value &&
        "symbol" !== typeof value &&
        !isNaN(value) &&
        1 <= value &&
        target.push(
          attributeSeparator,
          stringToChunk(name),
          attributeAssign,
          stringToChunk(escapeTextForBrowser(value)),
          attributeEnd
        );
      break;
    case "rowSpan":
    case "start":
      "function" === typeof value ||
        "symbol" === typeof value ||
        isNaN(value) ||
        target.push(
          attributeSeparator,
          stringToChunk(name),
          attributeAssign,
          stringToChunk(escapeTextForBrowser(value)),
          attributeEnd
        );
      break;
    case "xlinkActuate":
      pushStringAttribute(target, "xlink:actuate", value);
      break;
    case "xlinkArcrole":
      pushStringAttribute(target, "xlink:arcrole", value);
      break;
    case "xlinkRole":
      pushStringAttribute(target, "xlink:role", value);
      break;
    case "xlinkShow":
      pushStringAttribute(target, "xlink:show", value);
      break;
    case "xlinkTitle":
      pushStringAttribute(target, "xlink:title", value);
      break;
    case "xlinkType":
      pushStringAttribute(target, "xlink:type", value);
      break;
    case "xmlBase":
      pushStringAttribute(target, "xml:base", value);
      break;
    case "xmlLang":
      pushStringAttribute(target, "xml:lang", value);
      break;
    case "xmlSpace":
      pushStringAttribute(target, "xml:space", value);
      break;
    default:
      if (
        !(2 < name.length) ||
        ("o" !== name[0] && "O" !== name[0]) ||
        ("n" !== name[1] && "N" !== name[1])
      )
        if (((name = aliases.get(name) || name), isAttributeNameSafe(name))) {
          switch (typeof value) {
            case "function":
            case "symbol":
              return;
            case "boolean":
              var prefix$8 = name.toLowerCase().slice(0, 5);
              if ("data-" !== prefix$8 && "aria-" !== prefix$8) return;
          }
          target.push(
            attributeSeparator,
            stringToChunk(name),
            attributeAssign,
            stringToChunk(escapeTextForBrowser(value)),
            attributeEnd
          );
        }
  }
}
var endOfStartTag = stringToPrecomputedChunk(">"),
  endOfStartTagSelfClosing = stringToPrecomputedChunk("/>");
function pushInnerHTML(target, innerHTML, children) {
  if (null != innerHTML) {
    if (null != children) throw Error(formatProdErrorMessage(60));
    if ("object" !== typeof innerHTML || !("__html" in innerHTML))
      throw Error(formatProdErrorMessage(61));
    innerHTML = innerHTML.__html;
    null !== innerHTML &&
      void 0 !== innerHTML &&
      target.push(stringToChunk("" + innerHTML));
  }
}
function flattenOptionChildren(children) {
  var content = "";
  React.Children.forEach(children, function (child) {
    null != child && (content += child);
  });
  return content;
}
var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""'),
  formReplayingRuntimeScript = stringToPrecomputedChunk(
    'addEventListener("submit",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute("formAction");null!=f&&(e=f,b=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===e&&(a.preventDefault(),b?(a=document.createElement("input"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});'
  );
function injectFormReplayingRuntime(resumableState, renderState) {
  0 === (resumableState.instructions & 16) &&
    ((resumableState.instructions |= 16),
    renderState.bootstrapChunks.unshift(
      renderState.startInlineScript,
      formReplayingRuntimeScript,
      endInlineScript
    ));
}
var formStateMarkerIsMatching = stringToPrecomputedChunk("\x3c!--F!--\x3e"),
  formStateMarkerIsNotMatching = stringToPrecomputedChunk("\x3c!--F--\x3e");
function pushLinkImpl(target, props) {
  target.push(startChunkForTag("link"));
  for (var propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(formatProdErrorMessage(399, "link"));
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTagSelfClosing);
  return null;
}
var styleRegex = /(<\/|<)(s)(tyle)/gi;
function styleReplacer(match, prefix, s, suffix) {
  return "" + prefix + ("s" === s ? "\\73 " : "\\53 ") + suffix;
}
function pushSelfClosing(target, props, tag) {
  target.push(startChunkForTag(tag));
  for (var propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(formatProdErrorMessage(399, tag));
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTagSelfClosing);
  return null;
}
function pushTitleImpl(target, props) {
  target.push(startChunkForTag("title"));
  var children = null,
    innerHTML = null,
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            children = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTag);
  props = Array.isArray(children)
    ? 2 > children.length
      ? children[0]
      : null
    : children;
  "function" !== typeof props &&
    "symbol" !== typeof props &&
    null !== props &&
    void 0 !== props &&
    target.push(stringToChunk(escapeTextForBrowser("" + props)));
  pushInnerHTML(target, innerHTML, children);
  target.push(endChunkForTag("title"));
  return null;
}
function pushScriptImpl(target, props) {
  target.push(startChunkForTag("script"));
  var children = null,
    innerHTML = null,
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            children = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  "string" === typeof children &&
    target.push(
      stringToChunk(("" + children).replace(scriptRegex, scriptReplacer))
    );
  target.push(endChunkForTag("script"));
  return null;
}
function pushStartSingletonElement(target, props, tag) {
  target.push(startChunkForTag(tag));
  var innerHTML = (tag = null),
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            tag = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, tag);
  return tag;
}
function pushStartGenericElement(target, props, tag) {
  target.push(startChunkForTag(tag));
  var innerHTML = (tag = null),
    propKey;
  for (propKey in props)
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (null != propValue)
        switch (propKey) {
          case "children":
            tag = propValue;
            break;
          case "dangerouslySetInnerHTML":
            innerHTML = propValue;
            break;
          default:
            pushAttribute(target, propKey, propValue);
        }
    }
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, tag);
  return "string" === typeof tag
    ? (target.push(stringToChunk(escapeTextForBrowser(tag))), null)
    : tag;
}
var leadingNewline = stringToPrecomputedChunk("\n"),
  VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/,
  validatedTagCache = new Map();
function startChunkForTag(tag) {
  var tagStartChunk = validatedTagCache.get(tag);
  if (void 0 === tagStartChunk) {
    if (!VALID_TAG_REGEX.test(tag))
      throw Error(formatProdErrorMessage(65, tag));
    tagStartChunk = stringToPrecomputedChunk("<" + tag);
    validatedTagCache.set(tag, tagStartChunk);
  }
  return tagStartChunk;
}
var doctypeChunk = stringToPrecomputedChunk("<!DOCTYPE html>");
function pushStartInstance(
  target$jscomp$0,
  type,
  props,
  resumableState,
  renderState,
  preambleState,
  hoistableState,
  formatContext,
  textEmbedded,
  isFallback
) {
  switch (type) {
    case "div":
    case "span":
    case "svg":
    case "path":
      break;
    case "a":
      target$jscomp$0.push(startChunkForTag("a"));
      var children = null,
        innerHTML = null,
        propKey;
      for (propKey in props)
        if (hasOwnProperty.call(props, propKey)) {
          var propValue = props[propKey];
          if (null != propValue)
            switch (propKey) {
              case "children":
                children = propValue;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML = propValue;
                break;
              case "href":
                "" === propValue
                  ? pushStringAttribute(target$jscomp$0, "href", "")
                  : pushAttribute(target$jscomp$0, propKey, propValue);
                break;
              default:
                pushAttribute(target$jscomp$0, propKey, propValue);
            }
        }
      target$jscomp$0.push(endOfStartTag);
      pushInnerHTML(target$jscomp$0, innerHTML, children);
      if ("string" === typeof children) {
        target$jscomp$0.push(stringToChunk(escapeTextForBrowser(children)));
        var JSCompiler_inline_result = null;
      } else JSCompiler_inline_result = children;
      return JSCompiler_inline_result;
    case "g":
    case "p":
    case "li":
      break;
    case "select":
      target$jscomp$0.push(startChunkForTag("select"));
      var children$jscomp$0 = null,
        innerHTML$jscomp$0 = null,
        propKey$jscomp$0;
      for (propKey$jscomp$0 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$0)) {
          var propValue$jscomp$0 = props[propKey$jscomp$0];
          if (null != propValue$jscomp$0)
            switch (propKey$jscomp$0) {
              case "children":
                children$jscomp$0 = propValue$jscomp$0;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$0 = propValue$jscomp$0;
                break;
              case "defaultValue":
              case "value":
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$0,
                  propValue$jscomp$0
                );
            }
        }
      target$jscomp$0.push(endOfStartTag);
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$0, children$jscomp$0);
      return children$jscomp$0;
    case "option":
      var selectedValue = formatContext.selectedValue;
      target$jscomp$0.push(startChunkForTag("option"));
      var children$jscomp$1 = null,
        value = null,
        selected = null,
        innerHTML$jscomp$1 = null,
        propKey$jscomp$1;
      for (propKey$jscomp$1 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$1)) {
          var propValue$jscomp$1 = props[propKey$jscomp$1];
          if (null != propValue$jscomp$1)
            switch (propKey$jscomp$1) {
              case "children":
                children$jscomp$1 = propValue$jscomp$1;
                break;
              case "selected":
                selected = propValue$jscomp$1;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$1 = propValue$jscomp$1;
                break;
              case "value":
                value = propValue$jscomp$1;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$1,
                  propValue$jscomp$1
                );
            }
        }
      if (null != selectedValue) {
        var stringValue =
          null !== value
            ? "" + value
            : flattenOptionChildren(children$jscomp$1);
        if (isArrayImpl(selectedValue))
          for (var i = 0; i < selectedValue.length; i++) {
            if ("" + selectedValue[i] === stringValue) {
              target$jscomp$0.push(selectedMarkerAttribute);
              break;
            }
          }
        else
          "" + selectedValue === stringValue &&
            target$jscomp$0.push(selectedMarkerAttribute);
      } else selected && target$jscomp$0.push(selectedMarkerAttribute);
      target$jscomp$0.push(endOfStartTag);
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$1, children$jscomp$1);
      return children$jscomp$1;
    case "textarea":
      target$jscomp$0.push(startChunkForTag("textarea"));
      var value$jscomp$0 = null,
        defaultValue = null,
        children$jscomp$2 = null,
        propKey$jscomp$2;
      for (propKey$jscomp$2 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$2)) {
          var propValue$jscomp$2 = props[propKey$jscomp$2];
          if (null != propValue$jscomp$2)
            switch (propKey$jscomp$2) {
              case "children":
                children$jscomp$2 = propValue$jscomp$2;
                break;
              case "value":
                value$jscomp$0 = propValue$jscomp$2;
                break;
              case "defaultValue":
                defaultValue = propValue$jscomp$2;
                break;
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(91));
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$2,
                  propValue$jscomp$2
                );
            }
        }
      null === value$jscomp$0 &&
        null !== defaultValue &&
        (value$jscomp$0 = defaultValue);
      target$jscomp$0.push(endOfStartTag);
      if (null != children$jscomp$2) {
        if (null != value$jscomp$0) throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children$jscomp$2)) {
          if (1 < children$jscomp$2.length)
            throw Error(formatProdErrorMessage(93));
          value$jscomp$0 = "" + children$jscomp$2[0];
        }
        value$jscomp$0 = "" + children$jscomp$2;
      }
      "string" === typeof value$jscomp$0 &&
        "\n" === value$jscomp$0[0] &&
        target$jscomp$0.push(leadingNewline);
      null !== value$jscomp$0 &&
        target$jscomp$0.push(
          stringToChunk(escapeTextForBrowser("" + value$jscomp$0))
        );
      return null;
    case "input":
      target$jscomp$0.push(startChunkForTag("input"));
      var name = null,
        formAction = null,
        formEncType = null,
        formMethod = null,
        formTarget = null,
        value$jscomp$1 = null,
        defaultValue$jscomp$0 = null,
        checked = null,
        defaultChecked = null,
        propKey$jscomp$3;
      for (propKey$jscomp$3 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$3)) {
          var propValue$jscomp$3 = props[propKey$jscomp$3];
          if (null != propValue$jscomp$3)
            switch (propKey$jscomp$3) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "input"));
              case "name":
                name = propValue$jscomp$3;
                break;
              case "formAction":
                formAction = propValue$jscomp$3;
                break;
              case "formEncType":
                formEncType = propValue$jscomp$3;
                break;
              case "formMethod":
                formMethod = propValue$jscomp$3;
                break;
              case "formTarget":
                formTarget = propValue$jscomp$3;
                break;
              case "defaultChecked":
                defaultChecked = propValue$jscomp$3;
                break;
              case "defaultValue":
                defaultValue$jscomp$0 = propValue$jscomp$3;
                break;
              case "checked":
                checked = propValue$jscomp$3;
                break;
              case "value":
                value$jscomp$1 = propValue$jscomp$3;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$3,
                  propValue$jscomp$3
                );
            }
        }
      var formData = pushFormActionAttribute(
        target$jscomp$0,
        resumableState,
        renderState,
        formAction,
        formEncType,
        formMethod,
        formTarget,
        name
      );
      null !== checked
        ? pushBooleanAttribute(target$jscomp$0, "checked", checked)
        : null !== defaultChecked &&
          pushBooleanAttribute(target$jscomp$0, "checked", defaultChecked);
      null !== value$jscomp$1
        ? pushAttribute(target$jscomp$0, "value", value$jscomp$1)
        : null !== defaultValue$jscomp$0 &&
          pushAttribute(target$jscomp$0, "value", defaultValue$jscomp$0);
      target$jscomp$0.push(endOfStartTagSelfClosing);
      null != formData &&
        formData.forEach(pushAdditionalFormField, target$jscomp$0);
      return null;
    case "button":
      target$jscomp$0.push(startChunkForTag("button"));
      var children$jscomp$3 = null,
        innerHTML$jscomp$2 = null,
        name$jscomp$0 = null,
        formAction$jscomp$0 = null,
        formEncType$jscomp$0 = null,
        formMethod$jscomp$0 = null,
        formTarget$jscomp$0 = null,
        propKey$jscomp$4;
      for (propKey$jscomp$4 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$4)) {
          var propValue$jscomp$4 = props[propKey$jscomp$4];
          if (null != propValue$jscomp$4)
            switch (propKey$jscomp$4) {
              case "children":
                children$jscomp$3 = propValue$jscomp$4;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$2 = propValue$jscomp$4;
                break;
              case "name":
                name$jscomp$0 = propValue$jscomp$4;
                break;
              case "formAction":
                formAction$jscomp$0 = propValue$jscomp$4;
                break;
              case "formEncType":
                formEncType$jscomp$0 = propValue$jscomp$4;
                break;
              case "formMethod":
                formMethod$jscomp$0 = propValue$jscomp$4;
                break;
              case "formTarget":
                formTarget$jscomp$0 = propValue$jscomp$4;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$4,
                  propValue$jscomp$4
                );
            }
        }
      var formData$jscomp$0 = pushFormActionAttribute(
        target$jscomp$0,
        resumableState,
        renderState,
        formAction$jscomp$0,
        formEncType$jscomp$0,
        formMethod$jscomp$0,
        formTarget$jscomp$0,
        name$jscomp$0
      );
      target$jscomp$0.push(endOfStartTag);
      null != formData$jscomp$0 &&
        formData$jscomp$0.forEach(pushAdditionalFormField, target$jscomp$0);
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$2, children$jscomp$3);
      if ("string" === typeof children$jscomp$3) {
        target$jscomp$0.push(
          stringToChunk(escapeTextForBrowser(children$jscomp$3))
        );
        var JSCompiler_inline_result$jscomp$0 = null;
      } else JSCompiler_inline_result$jscomp$0 = children$jscomp$3;
      return JSCompiler_inline_result$jscomp$0;
    case "form":
      target$jscomp$0.push(startChunkForTag("form"));
      var children$jscomp$4 = null,
        innerHTML$jscomp$3 = null,
        formAction$jscomp$1 = null,
        formEncType$jscomp$1 = null,
        formMethod$jscomp$1 = null,
        formTarget$jscomp$1 = null,
        propKey$jscomp$5;
      for (propKey$jscomp$5 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$5)) {
          var propValue$jscomp$5 = props[propKey$jscomp$5];
          if (null != propValue$jscomp$5)
            switch (propKey$jscomp$5) {
              case "children":
                children$jscomp$4 = propValue$jscomp$5;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$3 = propValue$jscomp$5;
                break;
              case "action":
                formAction$jscomp$1 = propValue$jscomp$5;
                break;
              case "encType":
                formEncType$jscomp$1 = propValue$jscomp$5;
                break;
              case "method":
                formMethod$jscomp$1 = propValue$jscomp$5;
                break;
              case "target":
                formTarget$jscomp$1 = propValue$jscomp$5;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$5,
                  propValue$jscomp$5
                );
            }
        }
      var formData$jscomp$1 = null,
        formActionName = null;
      if ("function" === typeof formAction$jscomp$1) {
        var customFields = getCustomFormFields(
          resumableState,
          formAction$jscomp$1
        );
        null !== customFields
          ? ((formAction$jscomp$1 = customFields.action || ""),
            (formEncType$jscomp$1 = customFields.encType),
            (formMethod$jscomp$1 = customFields.method),
            (formTarget$jscomp$1 = customFields.target),
            (formData$jscomp$1 = customFields.data),
            (formActionName = customFields.name))
          : (target$jscomp$0.push(
              attributeSeparator,
              stringToChunk("action"),
              attributeAssign,
              actionJavaScriptURL,
              attributeEnd
            ),
            (formTarget$jscomp$1 =
              formMethod$jscomp$1 =
              formEncType$jscomp$1 =
              formAction$jscomp$1 =
                null),
            injectFormReplayingRuntime(resumableState, renderState));
      }
      null != formAction$jscomp$1 &&
        pushAttribute(target$jscomp$0, "action", formAction$jscomp$1);
      null != formEncType$jscomp$1 &&
        pushAttribute(target$jscomp$0, "encType", formEncType$jscomp$1);
      null != formMethod$jscomp$1 &&
        pushAttribute(target$jscomp$0, "method", formMethod$jscomp$1);
      null != formTarget$jscomp$1 &&
        pushAttribute(target$jscomp$0, "target", formTarget$jscomp$1);
      target$jscomp$0.push(endOfStartTag);
      null !== formActionName &&
        (target$jscomp$0.push(startHiddenInputChunk),
        pushStringAttribute(target$jscomp$0, "name", formActionName),
        target$jscomp$0.push(endOfStartTagSelfClosing),
        null != formData$jscomp$1 &&
          formData$jscomp$1.forEach(pushAdditionalFormField, target$jscomp$0));
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$3, children$jscomp$4);
      if ("string" === typeof children$jscomp$4) {
        target$jscomp$0.push(
          stringToChunk(escapeTextForBrowser(children$jscomp$4))
        );
        var JSCompiler_inline_result$jscomp$1 = null;
      } else JSCompiler_inline_result$jscomp$1 = children$jscomp$4;
      return JSCompiler_inline_result$jscomp$1;
    case "menuitem":
      target$jscomp$0.push(startChunkForTag("menuitem"));
      for (var propKey$jscomp$6 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$6)) {
          var propValue$jscomp$6 = props[propKey$jscomp$6];
          if (null != propValue$jscomp$6)
            switch (propKey$jscomp$6) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(400));
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$6,
                  propValue$jscomp$6
                );
            }
        }
      target$jscomp$0.push(endOfStartTag);
      return null;
    case "object":
      target$jscomp$0.push(startChunkForTag("object"));
      var children$jscomp$5 = null,
        innerHTML$jscomp$4 = null,
        propKey$jscomp$7;
      for (propKey$jscomp$7 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$7)) {
          var propValue$jscomp$7 = props[propKey$jscomp$7];
          if (null != propValue$jscomp$7)
            switch (propKey$jscomp$7) {
              case "children":
                children$jscomp$5 = propValue$jscomp$7;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$4 = propValue$jscomp$7;
                break;
              case "data":
                var sanitizedValue = sanitizeURL("" + propValue$jscomp$7);
                if ("" === sanitizedValue) break;
                target$jscomp$0.push(
                  attributeSeparator,
                  stringToChunk("data"),
                  attributeAssign,
                  stringToChunk(escapeTextForBrowser(sanitizedValue)),
                  attributeEnd
                );
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$7,
                  propValue$jscomp$7
                );
            }
        }
      target$jscomp$0.push(endOfStartTag);
      pushInnerHTML(target$jscomp$0, innerHTML$jscomp$4, children$jscomp$5);
      if ("string" === typeof children$jscomp$5) {
        target$jscomp$0.push(
          stringToChunk(escapeTextForBrowser(children$jscomp$5))
        );
        var JSCompiler_inline_result$jscomp$2 = null;
      } else JSCompiler_inline_result$jscomp$2 = children$jscomp$5;
      return JSCompiler_inline_result$jscomp$2;
    case "title":
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$3 = pushTitleImpl(
          target$jscomp$0,
          props
        );
      else
        isFallback
          ? (JSCompiler_inline_result$jscomp$3 = null)
          : (pushTitleImpl(renderState.hoistableChunks, props),
            (JSCompiler_inline_result$jscomp$3 = void 0));
      return JSCompiler_inline_result$jscomp$3;
    case "link":
      var rel = props.rel,
        href = props.href,
        precedence = props.precedence;
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp ||
        "string" !== typeof rel ||
        "string" !== typeof href ||
        "" === href
      ) {
        pushLinkImpl(target$jscomp$0, props);
        var JSCompiler_inline_result$jscomp$4 = null;
      } else if ("stylesheet" === props.rel)
        if (
          "string" !== typeof precedence ||
          null != props.disabled ||
          props.onLoad ||
          props.onError
        )
          JSCompiler_inline_result$jscomp$4 = pushLinkImpl(
            target$jscomp$0,
            props
          );
        else {
          var styleQueue = renderState.styles.get(precedence),
            resourceState = resumableState.styleResources.hasOwnProperty(href)
              ? resumableState.styleResources[href]
              : void 0;
          if (null !== resourceState) {
            resumableState.styleResources[href] = null;
            styleQueue ||
              ((styleQueue = {
                precedence: stringToChunk(escapeTextForBrowser(precedence)),
                rules: [],
                hrefs: [],
                sheets: new Map()
              }),
              renderState.styles.set(precedence, styleQueue));
            var resource = {
              state: 0,
              props: assign({}, props, {
                "data-precedence": props.precedence,
                precedence: null
              })
            };
            if (resourceState) {
              2 === resourceState.length &&
                adoptPreloadCredentials(resource.props, resourceState);
              var preloadResource = renderState.preloads.stylesheets.get(href);
              preloadResource && 0 < preloadResource.length
                ? (preloadResource.length = 0)
                : (resource.state = 1);
            }
            styleQueue.sheets.set(href, resource);
            hoistableState && hoistableState.stylesheets.add(resource);
          } else if (styleQueue) {
            var resource$9 = styleQueue.sheets.get(href);
            resource$9 &&
              hoistableState &&
              hoistableState.stylesheets.add(resource$9);
          }
          textEmbedded && target$jscomp$0.push(textSeparator);
          JSCompiler_inline_result$jscomp$4 = null;
        }
      else
        props.onLoad || props.onError
          ? (JSCompiler_inline_result$jscomp$4 = pushLinkImpl(
              target$jscomp$0,
              props
            ))
          : (textEmbedded && target$jscomp$0.push(textSeparator),
            (JSCompiler_inline_result$jscomp$4 = isFallback
              ? null
              : pushLinkImpl(renderState.hoistableChunks, props)));
      return JSCompiler_inline_result$jscomp$4;
    case "script":
      var asyncProp = props.async;
      if (
        "string" !== typeof props.src ||
        !props.src ||
        !asyncProp ||
        "function" === typeof asyncProp ||
        "symbol" === typeof asyncProp ||
        props.onLoad ||
        props.onError ||
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$5 = pushScriptImpl(
          target$jscomp$0,
          props
        );
      else {
        var key = props.src;
        if ("module" === props.type) {
          var resources = resumableState.moduleScriptResources;
          var preloads = renderState.preloads.moduleScripts;
        } else
          (resources = resumableState.scriptResources),
            (preloads = renderState.preloads.scripts);
        var resourceState$jscomp$0 = resources.hasOwnProperty(key)
          ? resources[key]
          : void 0;
        if (null !== resourceState$jscomp$0) {
          resources[key] = null;
          var scriptProps = props;
          if (resourceState$jscomp$0) {
            2 === resourceState$jscomp$0.length &&
              ((scriptProps = assign({}, props)),
              adoptPreloadCredentials(scriptProps, resourceState$jscomp$0));
            var preloadResource$jscomp$0 = preloads.get(key);
            preloadResource$jscomp$0 && (preloadResource$jscomp$0.length = 0);
          }
          var resource$jscomp$0 = [];
          renderState.scripts.add(resource$jscomp$0);
          pushScriptImpl(resource$jscomp$0, scriptProps);
        }
        textEmbedded && target$jscomp$0.push(textSeparator);
        JSCompiler_inline_result$jscomp$5 = null;
      }
      return JSCompiler_inline_result$jscomp$5;
    case "style":
      var precedence$jscomp$0 = props.precedence,
        href$jscomp$0 = props.href;
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp ||
        "string" !== typeof precedence$jscomp$0 ||
        "string" !== typeof href$jscomp$0 ||
        "" === href$jscomp$0
      ) {
        target$jscomp$0.push(startChunkForTag("style"));
        var children$jscomp$6 = null,
          innerHTML$jscomp$5 = null,
          propKey$jscomp$8;
        for (propKey$jscomp$8 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$8)) {
            var propValue$jscomp$8 = props[propKey$jscomp$8];
            if (null != propValue$jscomp$8)
              switch (propKey$jscomp$8) {
                case "children":
                  children$jscomp$6 = propValue$jscomp$8;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$5 = propValue$jscomp$8;
                  break;
                default:
                  pushAttribute(
                    target$jscomp$0,
                    propKey$jscomp$8,
                    propValue$jscomp$8
                  );
              }
          }
        target$jscomp$0.push(endOfStartTag);
        var child = Array.isArray(children$jscomp$6)
          ? 2 > children$jscomp$6.length
            ? children$jscomp$6[0]
            : null
          : children$jscomp$6;
        "function" !== typeof child &&
          "symbol" !== typeof child &&
          null !== child &&
          void 0 !== child &&
          target$jscomp$0.push(
            stringToChunk(("" + child).replace(styleRegex, styleReplacer))
          );
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$5, children$jscomp$6);
        target$jscomp$0.push(endChunkForTag("style"));
        var JSCompiler_inline_result$jscomp$6 = null;
      } else {
        var styleQueue$jscomp$0 = renderState.styles.get(precedence$jscomp$0);
        if (
          null !==
          (resumableState.styleResources.hasOwnProperty(href$jscomp$0)
            ? resumableState.styleResources[href$jscomp$0]
            : void 0)
        ) {
          resumableState.styleResources[href$jscomp$0] = null;
          styleQueue$jscomp$0
            ? styleQueue$jscomp$0.hrefs.push(
                stringToChunk(escapeTextForBrowser(href$jscomp$0))
              )
            : ((styleQueue$jscomp$0 = {
                precedence: stringToChunk(
                  escapeTextForBrowser(precedence$jscomp$0)
                ),
                rules: [],
                hrefs: [stringToChunk(escapeTextForBrowser(href$jscomp$0))],
                sheets: new Map()
              }),
              renderState.styles.set(precedence$jscomp$0, styleQueue$jscomp$0));
          var target = styleQueue$jscomp$0.rules,
            children$jscomp$7 = null,
            innerHTML$jscomp$6 = null,
            propKey$jscomp$9;
          for (propKey$jscomp$9 in props)
            if (hasOwnProperty.call(props, propKey$jscomp$9)) {
              var propValue$jscomp$9 = props[propKey$jscomp$9];
              if (null != propValue$jscomp$9)
                switch (propKey$jscomp$9) {
                  case "children":
                    children$jscomp$7 = propValue$jscomp$9;
                    break;
                  case "dangerouslySetInnerHTML":
                    innerHTML$jscomp$6 = propValue$jscomp$9;
                }
            }
          var child$jscomp$0 = Array.isArray(children$jscomp$7)
            ? 2 > children$jscomp$7.length
              ? children$jscomp$7[0]
              : null
            : children$jscomp$7;
          "function" !== typeof child$jscomp$0 &&
            "symbol" !== typeof child$jscomp$0 &&
            null !== child$jscomp$0 &&
            void 0 !== child$jscomp$0 &&
            target.push(
              stringToChunk(
                ("" + child$jscomp$0).replace(styleRegex, styleReplacer)
              )
            );
          pushInnerHTML(target, innerHTML$jscomp$6, children$jscomp$7);
        }
        styleQueue$jscomp$0 &&
          hoistableState &&
          hoistableState.styles.add(styleQueue$jscomp$0);
        textEmbedded && target$jscomp$0.push(textSeparator);
        JSCompiler_inline_result$jscomp$6 = void 0;
      }
      return JSCompiler_inline_result$jscomp$6;
    case "meta":
      if (
        4 === formatContext.insertionMode ||
        formatContext.tagScope & 1 ||
        null != props.itemProp
      )
        var JSCompiler_inline_result$jscomp$7 = pushSelfClosing(
          target$jscomp$0,
          props,
          "meta"
        );
      else
        textEmbedded && target$jscomp$0.push(textSeparator),
          (JSCompiler_inline_result$jscomp$7 = isFallback
            ? null
            : "string" === typeof props.charSet
              ? pushSelfClosing(renderState.charsetChunks, props, "meta")
              : "viewport" === props.name
                ? pushSelfClosing(renderState.viewportChunks, props, "meta")
                : pushSelfClosing(renderState.hoistableChunks, props, "meta"));
      return JSCompiler_inline_result$jscomp$7;
    case "listing":
    case "pre":
      target$jscomp$0.push(startChunkForTag(type));
      var children$jscomp$8 = null,
        innerHTML$jscomp$7 = null,
        propKey$jscomp$10;
      for (propKey$jscomp$10 in props)
        if (hasOwnProperty.call(props, propKey$jscomp$10)) {
          var propValue$jscomp$10 = props[propKey$jscomp$10];
          if (null != propValue$jscomp$10)
            switch (propKey$jscomp$10) {
              case "children":
                children$jscomp$8 = propValue$jscomp$10;
                break;
              case "dangerouslySetInnerHTML":
                innerHTML$jscomp$7 = propValue$jscomp$10;
                break;
              default:
                pushAttribute(
                  target$jscomp$0,
                  propKey$jscomp$10,
                  propValue$jscomp$10
                );
            }
        }
      target$jscomp$0.push(endOfStartTag);
      if (null != innerHTML$jscomp$7) {
        if (null != children$jscomp$8) throw Error(formatProdErrorMessage(60));
        if (
          "object" !== typeof innerHTML$jscomp$7 ||
          !("__html" in innerHTML$jscomp$7)
        )
          throw Error(formatProdErrorMessage(61));
        var html = innerHTML$jscomp$7.__html;
        null !== html &&
          void 0 !== html &&
          ("string" === typeof html && 0 < html.length && "\n" === html[0]
            ? target$jscomp$0.push(leadingNewline, stringToChunk(html))
            : target$jscomp$0.push(stringToChunk("" + html)));
      }
      "string" === typeof children$jscomp$8 &&
        "\n" === children$jscomp$8[0] &&
        target$jscomp$0.push(leadingNewline);
      return children$jscomp$8;
    case "img":
      var src = props.src,
        srcSet = props.srcSet;
      if (
        !(
          "lazy" === props.loading ||
          (!src && !srcSet) ||
          ("string" !== typeof src && null != src) ||
          ("string" !== typeof srcSet && null != srcSet)
        ) &&
        "low" !== props.fetchPriority &&
        !1 === !!(formatContext.tagScope & 3) &&
        ("string" !== typeof src ||
          ":" !== src[4] ||
          ("d" !== src[0] && "D" !== src[0]) ||
          ("a" !== src[1] && "A" !== src[1]) ||
          ("t" !== src[2] && "T" !== src[2]) ||
          ("a" !== src[3] && "A" !== src[3])) &&
        ("string" !== typeof srcSet ||
          ":" !== srcSet[4] ||
          ("d" !== srcSet[0] && "D" !== srcSet[0]) ||
          ("a" !== srcSet[1] && "A" !== srcSet[1]) ||
          ("t" !== srcSet[2] && "T" !== srcSet[2]) ||
          ("a" !== srcSet[3] && "A" !== srcSet[3]))
      ) {
        var sizes = "string" === typeof props.sizes ? props.sizes : void 0,
          key$jscomp$0 = srcSet ? srcSet + "\n" + (sizes || "") : src,
          promotablePreloads = renderState.preloads.images,
          resource$jscomp$1 = promotablePreloads.get(key$jscomp$0);
        if (resource$jscomp$1) {
          if (
            "high" === props.fetchPriority ||
            10 > renderState.highImagePreloads.size
          )
            promotablePreloads.delete(key$jscomp$0),
              renderState.highImagePreloads.add(resource$jscomp$1);
        } else if (
          !resumableState.imageResources.hasOwnProperty(key$jscomp$0)
        ) {
          resumableState.imageResources[key$jscomp$0] = PRELOAD_NO_CREDS;
          var input = props.crossOrigin;
          var JSCompiler_inline_result$jscomp$8 =
            "string" === typeof input
              ? "use-credentials" === input
                ? input
                : ""
              : void 0;
          var headers = renderState.headers,
            header;
          headers &&
          0 < headers.remainingCapacity &&
          "string" !== typeof props.srcSet &&
          ("high" === props.fetchPriority ||
            500 > headers.highImagePreloads.length) &&
          ((header = getPreloadAsHeader(src, "image", {
            imageSrcSet: props.srcSet,
            imageSizes: props.sizes,
            crossOrigin: JSCompiler_inline_result$jscomp$8,
            integrity: props.integrity,
            nonce: props.nonce,
            type: props.type,
            fetchPriority: props.fetchPriority,
            referrerPolicy: props.refererPolicy
          })),
          0 <= (headers.remainingCapacity -= header.length + 2))
            ? ((renderState.resets.image[key$jscomp$0] = PRELOAD_NO_CREDS),
              headers.highImagePreloads && (headers.highImagePreloads += ", "),
              (headers.highImagePreloads += header))
            : ((resource$jscomp$1 = []),
              pushLinkImpl(resource$jscomp$1, {
                rel: "preload",
                as: "image",
                href: srcSet ? void 0 : src,
                imageSrcSet: srcSet,
                imageSizes: sizes,
                crossOrigin: JSCompiler_inline_result$jscomp$8,
                integrity: props.integrity,
                type: props.type,
                fetchPriority: props.fetchPriority,
                referrerPolicy: props.referrerPolicy
              }),
              "high" === props.fetchPriority ||
              10 > renderState.highImagePreloads.size
                ? renderState.highImagePreloads.add(resource$jscomp$1)
                : (renderState.bulkPreloads.add(resource$jscomp$1),
                  promotablePreloads.set(key$jscomp$0, resource$jscomp$1)));
        }
      }
      return pushSelfClosing(target$jscomp$0, props, "img");
    case "base":
    case "area":
    case "br":
    case "col":
    case "embed":
    case "hr":
    case "keygen":
    case "param":
    case "source":
    case "track":
    case "wbr":
      return pushSelfClosing(target$jscomp$0, props, type);
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      break;
    case "head":
      if (2 > formatContext.insertionMode) {
        var preamble = preambleState || renderState.preamble;
        if (preamble.headChunks)
          throw Error(formatProdErrorMessage(545, "`<head>`"));
        preamble.headChunks = [];
        var JSCompiler_inline_result$jscomp$9 = pushStartSingletonElement(
          preamble.headChunks,
          props,
          "head"
        );
      } else
        JSCompiler_inline_result$jscomp$9 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "head"
        );
      return JSCompiler_inline_result$jscomp$9;
    case "body":
      if (2 > formatContext.insertionMode) {
        var preamble$jscomp$0 = preambleState || renderState.preamble;
        if (preamble$jscomp$0.bodyChunks)
          throw Error(formatProdErrorMessage(545, "`<body>`"));
        preamble$jscomp$0.bodyChunks = [];
        var JSCompiler_inline_result$jscomp$10 = pushStartSingletonElement(
          preamble$jscomp$0.bodyChunks,
          props,
          "body"
        );
      } else
        JSCompiler_inline_result$jscomp$10 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "body"
        );
      return JSCompiler_inline_result$jscomp$10;
    case "html":
      if (0 === formatContext.insertionMode) {
        var preamble$jscomp$1 = preambleState || renderState.preamble;
        if (preamble$jscomp$1.htmlChunks)
          throw Error(formatProdErrorMessage(545, "`<html>`"));
        preamble$jscomp$1.htmlChunks = [doctypeChunk];
        var JSCompiler_inline_result$jscomp$11 = pushStartSingletonElement(
          preamble$jscomp$1.htmlChunks,
          props,
          "html"
        );
      } else
        JSCompiler_inline_result$jscomp$11 = pushStartGenericElement(
          target$jscomp$0,
          props,
          "html"
        );
      return JSCompiler_inline_result$jscomp$11;
    default:
      if (-1 !== type.indexOf("-")) {
        target$jscomp$0.push(startChunkForTag(type));
        var children$jscomp$9 = null,
          innerHTML$jscomp$8 = null,
          propKey$jscomp$11;
        for (propKey$jscomp$11 in props)
          if (hasOwnProperty.call(props, propKey$jscomp$11)) {
            var propValue$jscomp$11 = props[propKey$jscomp$11];
            if (null != propValue$jscomp$11) {
              var attributeName = propKey$jscomp$11;
              switch (propKey$jscomp$11) {
                case "children":
                  children$jscomp$9 = propValue$jscomp$11;
                  break;
                case "dangerouslySetInnerHTML":
                  innerHTML$jscomp$8 = propValue$jscomp$11;
                  break;
                case "style":
                  pushStyleAttribute(target$jscomp$0, propValue$jscomp$11);
                  break;
                case "suppressContentEditableWarning":
                case "suppressHydrationWarning":
                case "ref":
                  break;
                case "className":
                  attributeName = "class";
                default:
                  if (
                    isAttributeNameSafe(propKey$jscomp$11) &&
                    "function" !== typeof propValue$jscomp$11 &&
                    "symbol" !== typeof propValue$jscomp$11 &&
                    !1 !== propValue$jscomp$11
                  ) {
                    if (!0 === propValue$jscomp$11) propValue$jscomp$11 = "";
                    else if ("object" === typeof propValue$jscomp$11) continue;
                    target$jscomp$0.push(
                      attributeSeparator,
                      stringToChunk(attributeName),
                      attributeAssign,
                      stringToChunk(escapeTextForBrowser(propValue$jscomp$11)),
                      attributeEnd
                    );
                  }
              }
            }
          }
        target$jscomp$0.push(endOfStartTag);
        pushInnerHTML(target$jscomp$0, innerHTML$jscomp$8, children$jscomp$9);
        return children$jscomp$9;
      }
  }
  return pushStartGenericElement(target$jscomp$0, props, type);
}
var endTagCache = new Map();
function endChunkForTag(tag) {
  var chunk = endTagCache.get(tag);
  void 0 === chunk &&
    ((chunk = stringToPrecomputedChunk("</" + tag + ">")),
    endTagCache.set(tag, chunk));
  return chunk;
}
function hoistPreambleState(renderState, preambleState) {
  renderState = renderState.preamble;
  null === renderState.htmlChunks &&
    preambleState.htmlChunks &&
    ((renderState.htmlChunks = preambleState.htmlChunks),
    (preambleState.contribution |= 1));
  null === renderState.headChunks &&
    preambleState.headChunks &&
    ((renderState.headChunks = preambleState.headChunks),
    (preambleState.contribution |= 4));
  null === renderState.bodyChunks &&
    preambleState.bodyChunks &&
    ((renderState.bodyChunks = preambleState.bodyChunks),
    (preambleState.contribution |= 2));
}
function writeBootstrap(destination, renderState) {
  renderState = renderState.bootstrapChunks;
  for (var i = 0; i < renderState.length - 1; i++)
    writeChunk(destination, renderState[i]);
  return i < renderState.length
    ? ((i = renderState[i]),
      (renderState.length = 0),
      writeChunkAndReturn(destination, i))
    : !0;
}
var placeholder1 = stringToPrecomputedChunk('<template id="'),
  placeholder2 = stringToPrecomputedChunk('"></template>'),
  startCompletedSuspenseBoundary = stringToPrecomputedChunk("\x3c!--$--\x3e"),
  startPendingSuspenseBoundary1 = stringToPrecomputedChunk(
    '\x3c!--$?--\x3e<template id="'
  ),
  startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>'),
  startClientRenderedSuspenseBoundary =
    stringToPrecomputedChunk("\x3c!--$!--\x3e"),
  endSuspenseBoundary = stringToPrecomputedChunk("\x3c!--/$--\x3e"),
  clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk("<template"),
  clientRenderedSuspenseBoundaryErrorAttrInterstitial =
    stringToPrecomputedChunk('"'),
  clientRenderedSuspenseBoundaryError1A =
    stringToPrecomputedChunk(' data-dgst="');
stringToPrecomputedChunk(' data-msg="');
stringToPrecomputedChunk(' data-stck="');
stringToPrecomputedChunk(' data-cstck="');
var clientRenderedSuspenseBoundaryError2 =
  stringToPrecomputedChunk("></template>");
function writeStartPendingSuspenseBoundary(destination, renderState, id) {
  writeChunk(destination, startPendingSuspenseBoundary1);
  if (null === id) throw Error(formatProdErrorMessage(395));
  writeChunk(destination, renderState.boundaryPrefix);
  writeChunk(destination, stringToChunk(id.toString(16)));
  return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
}
var boundaryPreambleContributionChunkStart =
    stringToPrecomputedChunk("\x3c!--"),
  boundaryPreambleContributionChunkEnd = stringToPrecomputedChunk("--\x3e");
function writePreambleContribution(destination, preambleState) {
  preambleState = preambleState.contribution;
  0 !== preambleState &&
    (writeChunk(destination, boundaryPreambleContributionChunkStart),
    writeChunk(destination, stringToChunk("" + preambleState)),
    writeChunk(destination, boundaryPreambleContributionChunkEnd));
}
var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="'),
  startSegmentHTML2 = stringToPrecomputedChunk('">'),
  endSegmentHTML = stringToPrecomputedChunk("</div>"),
  startSegmentSVG = stringToPrecomputedChunk(
    '<svg aria-hidden="true" style="display:none" id="'
  ),
  startSegmentSVG2 = stringToPrecomputedChunk('">'),
  endSegmentSVG = stringToPrecomputedChunk("</svg>"),
  startSegmentMathML = stringToPrecomputedChunk(
    '<math aria-hidden="true" style="display:none" id="'
  ),
  startSegmentMathML2 = stringToPrecomputedChunk('">'),
  endSegmentMathML = stringToPrecomputedChunk("</math>"),
  startSegmentTable = stringToPrecomputedChunk('<table hidden id="'),
  startSegmentTable2 = stringToPrecomputedChunk('">'),
  endSegmentTable = stringToPrecomputedChunk("</table>"),
  startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="'),
  startSegmentTableBody2 = stringToPrecomputedChunk('">'),
  endSegmentTableBody = stringToPrecomputedChunk("</tbody></table>"),
  startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="'),
  startSegmentTableRow2 = stringToPrecomputedChunk('">'),
  endSegmentTableRow = stringToPrecomputedChunk("</tr></table>"),
  startSegmentColGroup = stringToPrecomputedChunk(
    '<table hidden><colgroup id="'
  ),
  startSegmentColGroup2 = stringToPrecomputedChunk('">'),
  endSegmentColGroup = stringToPrecomputedChunk("</colgroup></table>");
function writeStartSegment(destination, renderState, formatContext, id) {
  switch (formatContext.insertionMode) {
    case 0:
    case 1:
    case 3:
    case 2:
      return (
        writeChunk(destination, startSegmentHTML),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentHTML2)
      );
    case 4:
      return (
        writeChunk(destination, startSegmentSVG),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentSVG2)
      );
    case 5:
      return (
        writeChunk(destination, startSegmentMathML),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentMathML2)
      );
    case 6:
      return (
        writeChunk(destination, startSegmentTable),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentTable2)
      );
    case 7:
      return (
        writeChunk(destination, startSegmentTableBody),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentTableBody2)
      );
    case 8:
      return (
        writeChunk(destination, startSegmentTableRow),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentTableRow2)
      );
    case 9:
      return (
        writeChunk(destination, startSegmentColGroup),
        writeChunk(destination, renderState.segmentPrefix),
        writeChunk(destination, stringToChunk(id.toString(16))),
        writeChunkAndReturn(destination, startSegmentColGroup2)
      );
    default:
      throw Error(formatProdErrorMessage(397));
  }
}
function writeEndSegment(destination, formatContext) {
  switch (formatContext.insertionMode) {
    case 0:
    case 1:
    case 3:
    case 2:
      return writeChunkAndReturn(destination, endSegmentHTML);
    case 4:
      return writeChunkAndReturn(destination, endSegmentSVG);
    case 5:
      return writeChunkAndReturn(destination, endSegmentMathML);
    case 6:
      return writeChunkAndReturn(destination, endSegmentTable);
    case 7:
      return writeChunkAndReturn(destination, endSegmentTableBody);
    case 8:
      return writeChunkAndReturn(destination, endSegmentTableRow);
    case 9:
      return writeChunkAndReturn(destination, endSegmentColGroup);
    default:
      throw Error(formatProdErrorMessage(397));
  }
}
var completeSegmentScript1Full = stringToPrecomputedChunk(
    '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'
  ),
  completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("'),
  completeSegmentScript2 = stringToPrecomputedChunk('","'),
  completeSegmentScriptEnd = stringToPrecomputedChunk('")\x3c/script>');
stringToPrecomputedChunk('<template data-rsi="" data-sid="');
stringToPrecomputedChunk('" data-pid="');
var completeBoundaryScript1Full = stringToPrecomputedChunk(
    '$RC=function(b,c,e){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(e)b.data="$!",a.setAttribute("data-dgst",e);else{e=b.parentNode;a=b.nextSibling;var f=0;do{if(a&&8===a.nodeType){var d=a.data;if("/$"===d)if(0===f)break;else f--;else"$"!==d&&"$?"!==d&&"$!"!==d||f++}d=a.nextSibling;e.removeChild(a);a=d}while(a);for(;c.firstChild;)e.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RC("'
  ),
  completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("'),
  completeBoundaryWithStylesScript1FullBoth = stringToPrecomputedChunk(
    '$RC=function(b,c,e){c=document.getElementById(c);c.parentNode.removeChild(c);var a=document.getElementById(b);if(a){b=a.previousSibling;if(e)b.data="$!",a.setAttribute("data-dgst",e);else{e=b.parentNode;a=b.nextSibling;var f=0;do{if(a&&8===a.nodeType){var d=a.data;if("/$"===d)if(0===f)break;else f--;else"$"!==d&&"$?"!==d&&"$!"!==d||f++}d=a.nextSibling;e.removeChild(a);a=d}while(a);for(;c.firstChild;)e.insertBefore(c.firstChild,a);b.data="$"}b._reactRetry&&b._reactRetry()}};$RM=new Map;\n$RR=function(t,u,y){function v(n){this._p=null;n()}for(var w=$RC,p=$RM,q=new Map,r=document,g,b,h=r.querySelectorAll("link[data-precedence],style[data-precedence]"),x=[],k=0;b=h[k++];)"not all"===b.getAttribute("media")?x.push(b):("LINK"===b.tagName&&p.set(b.getAttribute("href"),b),q.set(b.dataset.precedence,g=b));b=0;h=[];var l,a;for(k=!0;;){if(k){var e=y[b++];if(!e){k=!1;b=0;continue}var c=!1,m=0;var d=e[m++];if(a=p.get(d)){var f=a._p;c=!0}else{a=r.createElement("link");a.href=\nd;a.rel="stylesheet";for(a.dataset.precedence=l=e[m++];f=e[m++];)a.setAttribute(f,e[m++]);f=a._p=new Promise(function(n,z){a.onload=v.bind(a,n);a.onerror=v.bind(a,z)});p.set(d,a)}d=a.getAttribute("media");!f||d&&!matchMedia(d).matches||h.push(f);if(c)continue}else{a=x[b++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=q.get(l)||g;c===g&&(g=a);q.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=r.head,c.insertBefore(a,c.firstChild))}Promise.all(h).then(w.bind(null,\nt,u,""),w.bind(null,t,u,"Resource failed to load"))};$RR("'
  ),
  completeBoundaryWithStylesScript1FullPartial = stringToPrecomputedChunk(
    '$RM=new Map;\n$RR=function(t,u,y){function v(n){this._p=null;n()}for(var w=$RC,p=$RM,q=new Map,r=document,g,b,h=r.querySelectorAll("link[data-precedence],style[data-precedence]"),x=[],k=0;b=h[k++];)"not all"===b.getAttribute("media")?x.push(b):("LINK"===b.tagName&&p.set(b.getAttribute("href"),b),q.set(b.dataset.precedence,g=b));b=0;h=[];var l,a;for(k=!0;;){if(k){var e=y[b++];if(!e){k=!1;b=0;continue}var c=!1,m=0;var d=e[m++];if(a=p.get(d)){var f=a._p;c=!0}else{a=r.createElement("link");a.href=\nd;a.rel="stylesheet";for(a.dataset.precedence=l=e[m++];f=e[m++];)a.setAttribute(f,e[m++]);f=a._p=new Promise(function(n,z){a.onload=v.bind(a,n);a.onerror=v.bind(a,z)});p.set(d,a)}d=a.getAttribute("media");!f||d&&!matchMedia(d).matches||h.push(f);if(c)continue}else{a=x[b++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=q.get(l)||g;c===g&&(g=a);q.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=r.head,c.insertBefore(a,c.firstChild))}Promise.all(h).then(w.bind(null,\nt,u,""),w.bind(null,t,u,"Resource failed to load"))};$RR("'
  ),
  completeBoundaryWithStylesScript1Partial = stringToPrecomputedChunk('$RR("'),
  completeBoundaryScript2 = stringToPrecomputedChunk('","'),
  completeBoundaryScript3a = stringToPrecomputedChunk('",'),
  completeBoundaryScript3b = stringToPrecomputedChunk('"'),
  completeBoundaryScriptEnd = stringToPrecomputedChunk(")\x3c/script>");
stringToPrecomputedChunk('<template data-rci="" data-bid="');
stringToPrecomputedChunk('<template data-rri="" data-bid="');
stringToPrecomputedChunk('" data-sid="');
stringToPrecomputedChunk('" data-sty="');
var clientRenderScript1Full = stringToPrecomputedChunk(
    '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX("'
  ),
  clientRenderScript1Partial = stringToPrecomputedChunk('$RX("'),
  clientRenderScript1A = stringToPrecomputedChunk('"'),
  clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(","),
  clientRenderScriptEnd = stringToPrecomputedChunk(")\x3c/script>");
stringToPrecomputedChunk('<template data-rxi="" data-bid="');
stringToPrecomputedChunk('" data-dgst="');
stringToPrecomputedChunk('" data-msg="');
stringToPrecomputedChunk('" data-stck="');
stringToPrecomputedChunk('" data-cstck="');
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
function escapeJSStringsForInstructionScripts(input) {
  return JSON.stringify(input).replace(
    regexForJSStringsInInstructionScripts,
    function (match) {
      switch (match) {
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
          );
      }
    }
  );
}
var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
function escapeJSObjectForInstructionScripts(input) {
  return JSON.stringify(input).replace(
    regexForJSStringsInScripts,
    function (match) {
      switch (match) {
        case "&":
          return "\\u0026";
        case ">":
          return "\\u003e";
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error(
            "escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
          );
      }
    }
  );
}
var lateStyleTagResourceOpen1 = stringToPrecomputedChunk(
    '<style media="not all" data-precedence="'
  ),
  lateStyleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'),
  lateStyleTagResourceOpen3 = stringToPrecomputedChunk('">'),
  lateStyleTagTemplateClose = stringToPrecomputedChunk("</style>"),
  currentlyRenderingBoundaryHasStylesToHoist = !1,
  destinationHasCapacity = !0;
function flushStyleTagsLateForBoundary(styleQueue) {
  var rules = styleQueue.rules,
    hrefs = styleQueue.hrefs,
    i = 0;
  if (hrefs.length) {
    writeChunk(this, lateStyleTagResourceOpen1);
    writeChunk(this, styleQueue.precedence);
    for (writeChunk(this, lateStyleTagResourceOpen2); i < hrefs.length - 1; i++)
      writeChunk(this, hrefs[i]), writeChunk(this, spaceSeparator);
    writeChunk(this, hrefs[i]);
    writeChunk(this, lateStyleTagResourceOpen3);
    for (i = 0; i < rules.length; i++) writeChunk(this, rules[i]);
    destinationHasCapacity = writeChunkAndReturn(
      this,
      lateStyleTagTemplateClose
    );
    currentlyRenderingBoundaryHasStylesToHoist = !0;
    rules.length = 0;
    hrefs.length = 0;
  }
}
function hasStylesToHoist(stylesheet) {
  return 2 !== stylesheet.state
    ? (currentlyRenderingBoundaryHasStylesToHoist = !0)
    : !1;
}
function writeHoistablesForBoundary(destination, hoistableState, renderState) {
  currentlyRenderingBoundaryHasStylesToHoist = !1;
  destinationHasCapacity = !0;
  hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
  hoistableState.stylesheets.forEach(hasStylesToHoist);
  currentlyRenderingBoundaryHasStylesToHoist &&
    (renderState.stylesToHoist = !0);
  return destinationHasCapacity;
}
function flushResource(resource) {
  for (var i = 0; i < resource.length; i++) writeChunk(this, resource[i]);
  resource.length = 0;
}
var stylesheetFlushingQueue = [];
function flushStyleInPreamble(stylesheet) {
  pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
  for (var i = 0; i < stylesheetFlushingQueue.length; i++)
    writeChunk(this, stylesheetFlushingQueue[i]);
  stylesheetFlushingQueue.length = 0;
  stylesheet.state = 2;
}
var styleTagResourceOpen1 = stringToPrecomputedChunk(
    '<style data-precedence="'
  ),
  styleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="'),
  spaceSeparator = stringToPrecomputedChunk(" "),
  styleTagResourceOpen3 = stringToPrecomputedChunk('">'),
  styleTagResourceClose = stringToPrecomputedChunk("</style>");
function flushStylesInPreamble(styleQueue) {
  var hasStylesheets = 0 < styleQueue.sheets.size;
  styleQueue.sheets.forEach(flushStyleInPreamble, this);
  styleQueue.sheets.clear();
  var rules = styleQueue.rules,
    hrefs = styleQueue.hrefs;
  if (!hasStylesheets || hrefs.length) {
    writeChunk(this, styleTagResourceOpen1);
    writeChunk(this, styleQueue.precedence);
    styleQueue = 0;
    if (hrefs.length) {
      for (
        writeChunk(this, styleTagResourceOpen2);
        styleQueue < hrefs.length - 1;
        styleQueue++
      )
        writeChunk(this, hrefs[styleQueue]), writeChunk(this, spaceSeparator);
      writeChunk(this, hrefs[styleQueue]);
    }
    writeChunk(this, styleTagResourceOpen3);
    for (styleQueue = 0; styleQueue < rules.length; styleQueue++)
      writeChunk(this, rules[styleQueue]);
    writeChunk(this, styleTagResourceClose);
    rules.length = 0;
    hrefs.length = 0;
  }
}
function preloadLateStyle(stylesheet) {
  if (0 === stylesheet.state) {
    stylesheet.state = 1;
    var props = stylesheet.props;
    pushLinkImpl(stylesheetFlushingQueue, {
      rel: "preload",
      as: "style",
      href: stylesheet.props.href,
      crossOrigin: props.crossOrigin,
      fetchPriority: props.fetchPriority,
      integrity: props.integrity,
      media: props.media,
      hrefLang: props.hrefLang,
      referrerPolicy: props.referrerPolicy
    });
    for (
      stylesheet = 0;
      stylesheet < stylesheetFlushingQueue.length;
      stylesheet++
    )
      writeChunk(this, stylesheetFlushingQueue[stylesheet]);
    stylesheetFlushingQueue.length = 0;
  }
}
function preloadLateStyles(styleQueue) {
  styleQueue.sheets.forEach(preloadLateStyle, this);
  styleQueue.sheets.clear();
}
var arrayFirstOpenBracket = stringToPrecomputedChunk("["),
  arraySubsequentOpenBracket = stringToPrecomputedChunk(",["),
  arrayInterstitial = stringToPrecomputedChunk(","),
  arrayCloseBracket = stringToPrecomputedChunk("]");
function writeStyleResourceDependenciesInJS(destination, hoistableState) {
  writeChunk(destination, arrayFirstOpenBracket);
  var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
  hoistableState.stylesheets.forEach(function (resource) {
    if (2 !== resource.state)
      if (3 === resource.state)
        writeChunk(destination, nextArrayOpenBrackChunk),
          writeChunk(
            destination,
            stringToChunk(
              escapeJSObjectForInstructionScripts("" + resource.props.href)
            )
          ),
          writeChunk(destination, arrayCloseBracket),
          (nextArrayOpenBrackChunk = arraySubsequentOpenBracket);
      else {
        writeChunk(destination, nextArrayOpenBrackChunk);
        var precedence = resource.props["data-precedence"],
          props = resource.props,
          coercedHref = sanitizeURL("" + resource.props.href);
        writeChunk(
          destination,
          stringToChunk(escapeJSObjectForInstructionScripts(coercedHref))
        );
        precedence = "" + precedence;
        writeChunk(destination, arrayInterstitial);
        writeChunk(
          destination,
          stringToChunk(escapeJSObjectForInstructionScripts(precedence))
        );
        for (var propKey in props)
          if (
            hasOwnProperty.call(props, propKey) &&
            ((precedence = props[propKey]), null != precedence)
          )
            switch (propKey) {
              case "href":
              case "rel":
              case "precedence":
              case "data-precedence":
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(399, "link"));
              default:
                writeStyleResourceAttributeInJS(
                  destination,
                  propKey,
                  precedence
                );
            }
        writeChunk(destination, arrayCloseBracket);
        nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
        resource.state = 3;
      }
  });
  writeChunk(destination, arrayCloseBracket);
}
function writeStyleResourceAttributeInJS(destination, name, value) {
  var attributeName = name.toLowerCase();
  switch (typeof value) {
    case "function":
    case "symbol":
      return;
  }
  switch (name) {
    case "innerHTML":
    case "dangerouslySetInnerHTML":
    case "suppressContentEditableWarning":
    case "suppressHydrationWarning":
    case "style":
    case "ref":
      return;
    case "className":
      attributeName = "class";
      name = "" + value;
      break;
    case "hidden":
      if (!1 === value) return;
      name = "";
      break;
    case "src":
    case "href":
      value = sanitizeURL(value);
      name = "" + value;
      break;
    default:
      if (
        (2 < name.length &&
          ("o" === name[0] || "O" === name[0]) &&
          ("n" === name[1] || "N" === name[1])) ||
        !isAttributeNameSafe(name)
      )
        return;
      name = "" + value;
  }
  writeChunk(destination, arrayInterstitial);
  writeChunk(
    destination,
    stringToChunk(escapeJSObjectForInstructionScripts(attributeName))
  );
  writeChunk(destination, arrayInterstitial);
  writeChunk(
    destination,
    stringToChunk(escapeJSObjectForInstructionScripts(name))
  );
}
function createHoistableState() {
  return { styles: new Set(), stylesheets: new Set() };
}
function prefetchDNS(href) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if ("string" === typeof href && href) {
      if (!resumableState.dnsResources.hasOwnProperty(href)) {
        resumableState.dnsResources[href] = null;
        resumableState = renderState.headers;
        var header, JSCompiler_temp;
        if (
          (JSCompiler_temp =
            resumableState && 0 < resumableState.remainingCapacity)
        )
          JSCompiler_temp =
            ((header =
              "<" +
              ("" + href).replace(
                regexForHrefInLinkHeaderURLContext,
                escapeHrefForLinkHeaderURLContextReplacer
              ) +
              ">; rel=dns-prefetch"),
            0 <= (resumableState.remainingCapacity -= header.length + 2));
        JSCompiler_temp
          ? ((renderState.resets.dns[href] = null),
            resumableState.preconnects && (resumableState.preconnects += ", "),
            (resumableState.preconnects += header))
          : ((header = []),
            pushLinkImpl(header, { href: href, rel: "dns-prefetch" }),
            renderState.preconnects.add(header));
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.D(href);
}
function preconnect(href, crossOrigin) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if ("string" === typeof href && href) {
      var bucket =
        "use-credentials" === crossOrigin
          ? "credentials"
          : "string" === typeof crossOrigin
            ? "anonymous"
            : "default";
      if (!resumableState.connectResources[bucket].hasOwnProperty(href)) {
        resumableState.connectResources[bucket][href] = null;
        resumableState = renderState.headers;
        var header, JSCompiler_temp;
        if (
          (JSCompiler_temp =
            resumableState && 0 < resumableState.remainingCapacity)
        ) {
          JSCompiler_temp =
            "<" +
            ("" + href).replace(
              regexForHrefInLinkHeaderURLContext,
              escapeHrefForLinkHeaderURLContextReplacer
            ) +
            ">; rel=preconnect";
          if ("string" === typeof crossOrigin) {
            var escapedCrossOrigin = ("" + crossOrigin).replace(
              regexForLinkHeaderQuotedParamValueContext,
              escapeStringForLinkHeaderQuotedParamValueContextReplacer
            );
            JSCompiler_temp += '; crossorigin="' + escapedCrossOrigin + '"';
          }
          JSCompiler_temp =
            ((header = JSCompiler_temp),
            0 <= (resumableState.remainingCapacity -= header.length + 2));
        }
        JSCompiler_temp
          ? ((renderState.resets.connect[bucket][href] = null),
            resumableState.preconnects && (resumableState.preconnects += ", "),
            (resumableState.preconnects += header))
          : ((bucket = []),
            pushLinkImpl(bucket, {
              rel: "preconnect",
              href: href,
              crossOrigin: crossOrigin
            }),
            renderState.preconnects.add(bucket));
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.C(href, crossOrigin);
}
function preload(href, as, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (as && href) {
      switch (as) {
        case "image":
          if (options) {
            var imageSrcSet = options.imageSrcSet;
            var imageSizes = options.imageSizes;
            var fetchPriority = options.fetchPriority;
          }
          var key = imageSrcSet
            ? imageSrcSet + "\n" + (imageSizes || "")
            : href;
          if (resumableState.imageResources.hasOwnProperty(key)) return;
          resumableState.imageResources[key] = PRELOAD_NO_CREDS;
          resumableState = renderState.headers;
          var header;
          resumableState &&
          0 < resumableState.remainingCapacity &&
          "string" !== typeof imageSrcSet &&
          "high" === fetchPriority &&
          ((header = getPreloadAsHeader(href, as, options)),
          0 <= (resumableState.remainingCapacity -= header.length + 2))
            ? ((renderState.resets.image[key] = PRELOAD_NO_CREDS),
              resumableState.highImagePreloads &&
                (resumableState.highImagePreloads += ", "),
              (resumableState.highImagePreloads += header))
            : ((resumableState = []),
              pushLinkImpl(
                resumableState,
                assign(
                  { rel: "preload", href: imageSrcSet ? void 0 : href, as: as },
                  options
                )
              ),
              "high" === fetchPriority
                ? renderState.highImagePreloads.add(resumableState)
                : (renderState.bulkPreloads.add(resumableState),
                  renderState.preloads.images.set(key, resumableState)));
          break;
        case "style":
          if (resumableState.styleResources.hasOwnProperty(href)) return;
          imageSrcSet = [];
          pushLinkImpl(
            imageSrcSet,
            assign({ rel: "preload", href: href, as: as }, options)
          );
          resumableState.styleResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          renderState.preloads.stylesheets.set(href, imageSrcSet);
          renderState.bulkPreloads.add(imageSrcSet);
          break;
        case "script":
          if (resumableState.scriptResources.hasOwnProperty(href)) return;
          imageSrcSet = [];
          renderState.preloads.scripts.set(href, imageSrcSet);
          renderState.bulkPreloads.add(imageSrcSet);
          pushLinkImpl(
            imageSrcSet,
            assign({ rel: "preload", href: href, as: as }, options)
          );
          resumableState.scriptResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          break;
        default:
          if (resumableState.unknownResources.hasOwnProperty(as)) {
            if (
              ((imageSrcSet = resumableState.unknownResources[as]),
              imageSrcSet.hasOwnProperty(href))
            )
              return;
          } else
            (imageSrcSet = {}),
              (resumableState.unknownResources[as] = imageSrcSet);
          imageSrcSet[href] = PRELOAD_NO_CREDS;
          if (
            (resumableState = renderState.headers) &&
            0 < resumableState.remainingCapacity &&
            "font" === as &&
            ((key = getPreloadAsHeader(href, as, options)),
            0 <= (resumableState.remainingCapacity -= key.length + 2))
          )
            (renderState.resets.font[href] = PRELOAD_NO_CREDS),
              resumableState.fontPreloads &&
                (resumableState.fontPreloads += ", "),
              (resumableState.fontPreloads += key);
          else
            switch (
              ((resumableState = []),
              (href = assign({ rel: "preload", href: href, as: as }, options)),
              pushLinkImpl(resumableState, href),
              as)
            ) {
              case "font":
                renderState.fontPreloads.add(resumableState);
                break;
              default:
                renderState.bulkPreloads.add(resumableState);
            }
      }
      enqueueFlush(request);
    }
  } else previousDispatcher.L(href, as, options);
}
function preloadModule(href, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (href) {
      var as =
        options && "string" === typeof options.as ? options.as : "script";
      switch (as) {
        case "script":
          if (resumableState.moduleScriptResources.hasOwnProperty(href)) return;
          as = [];
          resumableState.moduleScriptResources[href] =
            !options ||
            ("string" !== typeof options.crossOrigin &&
              "string" !== typeof options.integrity)
              ? PRELOAD_NO_CREDS
              : [options.crossOrigin, options.integrity];
          renderState.preloads.moduleScripts.set(href, as);
          break;
        default:
          if (resumableState.moduleUnknownResources.hasOwnProperty(as)) {
            var resources = resumableState.unknownResources[as];
            if (resources.hasOwnProperty(href)) return;
          } else
            (resources = {}),
              (resumableState.moduleUnknownResources[as] = resources);
          as = [];
          resources[href] = PRELOAD_NO_CREDS;
      }
      pushLinkImpl(as, assign({ rel: "modulepreload", href: href }, options));
      renderState.bulkPreloads.add(as);
      enqueueFlush(request);
    }
  } else previousDispatcher.m(href, options);
}
function preinitStyle(href, precedence, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (href) {
      precedence = precedence || "default";
      var styleQueue = renderState.styles.get(precedence),
        resourceState = resumableState.styleResources.hasOwnProperty(href)
          ? resumableState.styleResources[href]
          : void 0;
      null !== resourceState &&
        ((resumableState.styleResources[href] = null),
        styleQueue ||
          ((styleQueue = {
            precedence: stringToChunk(escapeTextForBrowser(precedence)),
            rules: [],
            hrefs: [],
            sheets: new Map()
          }),
          renderState.styles.set(precedence, styleQueue)),
        (precedence = {
          state: 0,
          props: assign(
            { rel: "stylesheet", href: href, "data-precedence": precedence },
            options
          )
        }),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(precedence.props, resourceState),
          (renderState = renderState.preloads.stylesheets.get(href)) &&
          0 < renderState.length
            ? (renderState.length = 0)
            : (precedence.state = 1)),
        styleQueue.sheets.set(href, precedence),
        enqueueFlush(request));
    }
  } else previousDispatcher.S(href, precedence, options);
}
function preinitScript(src, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (src) {
      var resourceState = resumableState.scriptResources.hasOwnProperty(src)
        ? resumableState.scriptResources[src]
        : void 0;
      null !== resourceState &&
        ((resumableState.scriptResources[src] = null),
        (options = assign({ src: src, async: !0 }, options)),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(options, resourceState),
          (src = renderState.preloads.scripts.get(src))) &&
          (src.length = 0),
        (src = []),
        renderState.scripts.add(src),
        pushScriptImpl(src, options),
        enqueueFlush(request));
    }
  } else previousDispatcher.X(src, options);
}
function preinitModuleScript(src, options) {
  var request = currentRequest ? currentRequest : null;
  if (request) {
    var resumableState = request.resumableState,
      renderState = request.renderState;
    if (src) {
      var resourceState = resumableState.moduleScriptResources.hasOwnProperty(
        src
      )
        ? resumableState.moduleScriptResources[src]
        : void 0;
      null !== resourceState &&
        ((resumableState.moduleScriptResources[src] = null),
        (options = assign({ src: src, type: "module", async: !0 }, options)),
        resourceState &&
          (2 === resourceState.length &&
            adoptPreloadCredentials(options, resourceState),
          (src = renderState.preloads.moduleScripts.get(src))) &&
          (src.length = 0),
        (src = []),
        renderState.scripts.add(src),
        pushScriptImpl(src, options),
        enqueueFlush(request));
    }
  } else previousDispatcher.M(src, options);
}
function adoptPreloadCredentials(target, preloadState) {
  null == target.crossOrigin && (target.crossOrigin = preloadState[0]);
  null == target.integrity && (target.integrity = preloadState[1]);
}
function getPreloadAsHeader(href, as, params) {
  href = ("" + href).replace(
    regexForHrefInLinkHeaderURLContext,
    escapeHrefForLinkHeaderURLContextReplacer
  );
  as = ("" + as).replace(
    regexForLinkHeaderQuotedParamValueContext,
    escapeStringForLinkHeaderQuotedParamValueContextReplacer
  );
  as = "<" + href + '>; rel=preload; as="' + as + '"';
  for (var paramName in params)
    hasOwnProperty.call(params, paramName) &&
      ((href = params[paramName]),
      "string" === typeof href &&
        (as +=
          "; " +
          paramName.toLowerCase() +
          '="' +
          ("" + href).replace(
            regexForLinkHeaderQuotedParamValueContext,
            escapeStringForLinkHeaderQuotedParamValueContextReplacer
          ) +
          '"'));
  return as;
}
var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
function escapeHrefForLinkHeaderURLContextReplacer(match) {
  switch (match) {
    case "<":
      return "%3C";
    case ">":
      return "%3E";
    case "\n":
      return "%0A";
    case "\r":
      return "%0D";
    default:
      throw Error(
        "escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
      );
  }
}
var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
  switch (match) {
    case '"':
      return "%22";
    case "'":
      return "%27";
    case ";":
      return "%3B";
    case ",":
      return "%2C";
    case "\n":
      return "%0A";
    case "\r":
      return "%0D";
    default:
      throw Error(
        "escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React"
      );
  }
}
function hoistStyleQueueDependency(styleQueue) {
  this.styles.add(styleQueue);
}
function hoistStylesheetDependency(stylesheet) {
  this.stylesheets.add(stylesheet);
}
var bind = Function.prototype.bind,
  REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
function getComponentNameFromType(type) {
  if (null == type) return null;
  if ("function" === typeof type)
    return type.$$typeof === REACT_CLIENT_REFERENCE
      ? null
      : type.displayName || type.name || null;
  if ("string" === typeof type) return type;
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return "Fragment";
    case REACT_PROFILER_TYPE:
      return "Profiler";
    case REACT_STRICT_MODE_TYPE:
      return "StrictMode";
    case REACT_SUSPENSE_TYPE:
      return "Suspense";
    case REACT_SUSPENSE_LIST_TYPE:
      return "SuspenseList";
    case REACT_ACTIVITY_TYPE:
      return "Activity";
  }
  if ("object" === typeof type)
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return "Portal";
      case REACT_CONTEXT_TYPE:
        return (type.displayName || "Context") + ".Provider";
      case REACT_CONSUMER_TYPE:
        return (type._context.displayName || "Context") + ".Consumer";
      case REACT_FORWARD_REF_TYPE:
        var innerType = type.render;
        type = type.displayName;
        type ||
          ((type = innerType.displayName || innerType.name || ""),
          (type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef"));
        return type;
      case REACT_MEMO_TYPE:
        return (
          (innerType = type.displayName || null),
          null !== innerType
            ? innerType
            : getComponentNameFromType(type.type) || "Memo"
        );
      case REACT_LAZY_TYPE:
        innerType = type._payload;
        type = type._init;
        try {
          return getComponentNameFromType(type(innerType));
        } catch (x) {}
    }
  return null;
}
var emptyContextObject = {},
  currentActiveSnapshot = null;
function popToNearestCommonAncestor(prev, next) {
  if (prev !== next) {
    prev.context._currentValue = prev.parentValue;
    prev = prev.parent;
    var parentNext = next.parent;
    if (null === prev) {
      if (null !== parentNext) throw Error(formatProdErrorMessage(401));
    } else {
      if (null === parentNext) throw Error(formatProdErrorMessage(401));
      popToNearestCommonAncestor(prev, parentNext);
    }
    next.context._currentValue = next.value;
  }
}
function popAllPrevious(prev) {
  prev.context._currentValue = prev.parentValue;
  prev = prev.parent;
  null !== prev && popAllPrevious(prev);
}
function pushAllNext(next) {
  var parentNext = next.parent;
  null !== parentNext && pushAllNext(parentNext);
  next.context._currentValue = next.value;
}
function popPreviousToCommonLevel(prev, next) {
  prev.context._currentValue = prev.parentValue;
  prev = prev.parent;
  if (null === prev) throw Error(formatProdErrorMessage(402));
  prev.depth === next.depth
    ? popToNearestCommonAncestor(prev, next)
    : popPreviousToCommonLevel(prev, next);
}
function popNextToCommonLevel(prev, next) {
  var parentNext = next.parent;
  if (null === parentNext) throw Error(formatProdErrorMessage(402));
  prev.depth === parentNext.depth
    ? popToNearestCommonAncestor(prev, parentNext)
    : popNextToCommonLevel(prev, parentNext);
  next.context._currentValue = next.value;
}
function switchContext(newSnapshot) {
  var prev = currentActiveSnapshot;
  prev !== newSnapshot &&
    (null === prev
      ? pushAllNext(newSnapshot)
      : null === newSnapshot
        ? popAllPrevious(prev)
        : prev.depth === newSnapshot.depth
          ? popToNearestCommonAncestor(prev, newSnapshot)
          : prev.depth > newSnapshot.depth
            ? popPreviousToCommonLevel(prev, newSnapshot)
            : popNextToCommonLevel(prev, newSnapshot),
    (currentActiveSnapshot = newSnapshot));
}
var classComponentUpdater = {
    enqueueSetState: function (inst, payload) {
      inst = inst._reactInternals;
      null !== inst.queue && inst.queue.push(payload);
    },
    enqueueReplaceState: function (inst, payload) {
      inst = inst._reactInternals;
      inst.replace = !0;
      inst.queue = [payload];
    },
    enqueueForceUpdate: function () {}
  },
  emptyTreeContext = { id: 1, overflow: "" };
function pushTreeContext(baseContext, totalChildren, index) {
  var baseIdWithLeadingBit = baseContext.id;
  baseContext = baseContext.overflow;
  var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
  baseIdWithLeadingBit &= ~(1 << baseLength);
  index += 1;
  var length = 32 - clz32(totalChildren) + baseLength;
  if (30 < length) {
    var numberOfOverflowBits = baseLength - (baseLength % 5);
    length = (
      baseIdWithLeadingBit &
      ((1 << numberOfOverflowBits) - 1)
    ).toString(32);
    baseIdWithLeadingBit >>= numberOfOverflowBits;
    baseLength -= numberOfOverflowBits;
    return {
      id:
        (1 << (32 - clz32(totalChildren) + baseLength)) |
        (index << baseLength) |
        baseIdWithLeadingBit,
      overflow: length + baseContext
    };
  }
  return {
    id: (1 << length) | (index << baseLength) | baseIdWithLeadingBit,
    overflow: baseContext
  };
}
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback,
  log = Math.log,
  LN2 = Math.LN2;
function clz32Fallback(x) {
  x >>>= 0;
  return 0 === x ? 32 : (31 - ((log(x) / LN2) | 0)) | 0;
}
var SuspenseException = Error(formatProdErrorMessage(460));
function noop$2() {}
function trackUsedThenable(thenableState, thenable, index) {
  index = thenableState[index];
  void 0 === index
    ? thenableState.push(thenable)
    : index !== thenable && (thenable.then(noop$2, noop$2), (thenable = index));
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      "string" === typeof thenable.status
        ? thenable.then(noop$2, noop$2)
        : ((thenableState = thenable),
          (thenableState.status = "pending"),
          thenableState.then(
            function (fulfilledValue) {
              if ("pending" === thenable.status) {
                var fulfilledThenable = thenable;
                fulfilledThenable.status = "fulfilled";
                fulfilledThenable.value = fulfilledValue;
              }
            },
            function (error) {
              if ("pending" === thenable.status) {
                var rejectedThenable = thenable;
                rejectedThenable.status = "rejected";
                rejectedThenable.reason = error;
              }
            }
          ));
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
      suspendedThenable = thenable;
      throw SuspenseException;
  }
}
var suspendedThenable = null;
function getSuspendedThenable() {
  if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}
function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}
var objectIs = "function" === typeof Object.is ? Object.is : is,
  currentlyRenderingComponent = null,
  currentlyRenderingTask = null,
  currentlyRenderingRequest = null,
  currentlyRenderingKeyPath = null,
  firstWorkInProgressHook = null,
  workInProgressHook = null,
  isReRender = !1,
  didScheduleRenderPhaseUpdate = !1,
  localIdCounter = 0,
  actionStateCounter = 0,
  actionStateMatchingIndex = -1,
  thenableIndexCounter = 0,
  thenableState = null,
  renderPhaseUpdates = null,
  numberOfReRenders = 0;
function resolveCurrentlyRenderingComponent() {
  if (null === currentlyRenderingComponent)
    throw Error(formatProdErrorMessage(321));
  return currentlyRenderingComponent;
}
function createHook() {
  if (0 < numberOfReRenders) throw Error(formatProdErrorMessage(312));
  return { memoizedState: null, queue: null, next: null };
}
function createWorkInProgressHook() {
  null === workInProgressHook
    ? null === firstWorkInProgressHook
      ? ((isReRender = !1),
        (firstWorkInProgressHook = workInProgressHook = createHook()))
      : ((isReRender = !0), (workInProgressHook = firstWorkInProgressHook))
    : null === workInProgressHook.next
      ? ((isReRender = !1),
        (workInProgressHook = workInProgressHook.next = createHook()))
      : ((isReRender = !0), (workInProgressHook = workInProgressHook.next));
  return workInProgressHook;
}
function getThenableStateAfterSuspending() {
  var state = thenableState;
  thenableState = null;
  return state;
}
function resetHooksState() {
  currentlyRenderingKeyPath =
    currentlyRenderingRequest =
    currentlyRenderingTask =
    currentlyRenderingComponent =
      null;
  didScheduleRenderPhaseUpdate = !1;
  firstWorkInProgressHook = null;
  numberOfReRenders = 0;
  workInProgressHook = renderPhaseUpdates = null;
}
function basicStateReducer(state, action) {
  return "function" === typeof action ? action(state) : action;
}
function useReducer(reducer, initialArg, init) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  if (isReRender) {
    var queue = workInProgressHook.queue;
    initialArg = queue.dispatch;
    if (
      null !== renderPhaseUpdates &&
      ((init = renderPhaseUpdates.get(queue)), void 0 !== init)
    ) {
      renderPhaseUpdates.delete(queue);
      queue = workInProgressHook.memoizedState;
      do (queue = reducer(queue, init.action)), (init = init.next);
      while (null !== init);
      workInProgressHook.memoizedState = queue;
      return [queue, initialArg];
    }
    return [workInProgressHook.memoizedState, initialArg];
  }
  reducer =
    reducer === basicStateReducer
      ? "function" === typeof initialArg
        ? initialArg()
        : initialArg
      : void 0 !== init
        ? init(initialArg)
        : initialArg;
  workInProgressHook.memoizedState = reducer;
  reducer = workInProgressHook.queue = { last: null, dispatch: null };
  reducer = reducer.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingComponent,
    reducer
  );
  return [workInProgressHook.memoizedState, reducer];
}
function useMemo(nextCreate, deps) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  deps = void 0 === deps ? null : deps;
  if (null !== workInProgressHook) {
    var prevState = workInProgressHook.memoizedState;
    if (null !== prevState && null !== deps) {
      var prevDeps = prevState[1];
      a: if (null === prevDeps) prevDeps = !1;
      else {
        for (var i = 0; i < prevDeps.length && i < deps.length; i++)
          if (!objectIs(deps[i], prevDeps[i])) {
            prevDeps = !1;
            break a;
          }
        prevDeps = !0;
      }
      if (prevDeps) return prevState[0];
    }
  }
  nextCreate = nextCreate();
  workInProgressHook.memoizedState = [nextCreate, deps];
  return nextCreate;
}
function dispatchAction(componentIdentity, queue, action) {
  if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
  if (componentIdentity === currentlyRenderingComponent)
    if (
      ((didScheduleRenderPhaseUpdate = !0),
      (componentIdentity = { action: action, next: null }),
      null === renderPhaseUpdates && (renderPhaseUpdates = new Map()),
      (action = renderPhaseUpdates.get(queue)),
      void 0 === action)
    )
      renderPhaseUpdates.set(queue, componentIdentity);
    else {
      for (queue = action; null !== queue.next; ) queue = queue.next;
      queue.next = componentIdentity;
    }
}
function unsupportedStartTransition() {
  throw Error(formatProdErrorMessage(394));
}
function unsupportedSetOptimisticState() {
  throw Error(formatProdErrorMessage(479));
}
function useActionState(action, initialState, permalink) {
  resolveCurrentlyRenderingComponent();
  var actionStateHookIndex = actionStateCounter++,
    request = currentlyRenderingRequest;
  if ("function" === typeof action.$$FORM_ACTION) {
    var nextPostbackStateKey = null,
      componentKeyPath = currentlyRenderingKeyPath;
    request = request.formState;
    var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
    if (null !== request && "function" === typeof isSignatureEqual) {
      var postbackKey = request[1];
      isSignatureEqual.call(action, request[2], request[3]) &&
        ((nextPostbackStateKey =
          void 0 !== permalink
            ? "p" + permalink
            : "k" +
              murmurhash3_32_gc(
                JSON.stringify([componentKeyPath, null, actionStateHookIndex]),
                0
              )),
        postbackKey === nextPostbackStateKey &&
          ((actionStateMatchingIndex = actionStateHookIndex),
          (initialState = request[0])));
    }
    var boundAction = action.bind(null, initialState);
    action = function (payload) {
      boundAction(payload);
    };
    "function" === typeof boundAction.$$FORM_ACTION &&
      (action.$$FORM_ACTION = function (prefix) {
        prefix = boundAction.$$FORM_ACTION(prefix);
        void 0 !== permalink &&
          ((permalink += ""), (prefix.action = permalink));
        var formData = prefix.data;
        formData &&
          (null === nextPostbackStateKey &&
            (nextPostbackStateKey =
              void 0 !== permalink
                ? "p" + permalink
                : "k" +
                  murmurhash3_32_gc(
                    JSON.stringify([
                      componentKeyPath,
                      null,
                      actionStateHookIndex
                    ]),
                    0
                  )),
          formData.append("$ACTION_KEY", nextPostbackStateKey));
        return prefix;
      });
    return [initialState, action, !1];
  }
  var boundAction$22 = action.bind(null, initialState);
  return [
    initialState,
    function (payload) {
      boundAction$22(payload);
    },
    !1
  ];
}
function unwrapThenable(thenable) {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  null === thenableState && (thenableState = []);
  return trackUsedThenable(thenableState, thenable, index);
}
function unsupportedRefresh() {
  throw Error(formatProdErrorMessage(393));
}
function noop$1() {}
var HooksDispatcher = {
    readContext: function (context) {
      return context._currentValue;
    },
    use: function (usable) {
      if (null !== usable && "object" === typeof usable) {
        if ("function" === typeof usable.then) return unwrapThenable(usable);
        if (usable.$$typeof === REACT_CONTEXT_TYPE) return usable._currentValue;
      }
      throw Error(formatProdErrorMessage(438, String(usable)));
    },
    useContext: function (context) {
      resolveCurrentlyRenderingComponent();
      return context._currentValue;
    },
    useMemo: useMemo,
    useReducer: useReducer,
    useRef: function (initialValue) {
      currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
      workInProgressHook = createWorkInProgressHook();
      var previousRef = workInProgressHook.memoizedState;
      return null === previousRef
        ? ((initialValue = { current: initialValue }),
          (workInProgressHook.memoizedState = initialValue))
        : previousRef;
    },
    useState: function (initialState) {
      return useReducer(basicStateReducer, initialState);
    },
    useInsertionEffect: noop$1,
    useLayoutEffect: noop$1,
    useCallback: function (callback, deps) {
      return useMemo(function () {
        return callback;
      }, deps);
    },
    useImperativeHandle: noop$1,
    useEffect: noop$1,
    useDebugValue: noop$1,
    useDeferredValue: function (value, initialValue) {
      resolveCurrentlyRenderingComponent();
      return void 0 !== initialValue ? initialValue : value;
    },
    useTransition: function () {
      resolveCurrentlyRenderingComponent();
      return [!1, unsupportedStartTransition];
    },
    useId: function () {
      var JSCompiler_inline_result = currentlyRenderingTask.treeContext;
      var overflow = JSCompiler_inline_result.overflow;
      JSCompiler_inline_result = JSCompiler_inline_result.id;
      JSCompiler_inline_result =
        (
          JSCompiler_inline_result &
          ~(1 << (32 - clz32(JSCompiler_inline_result) - 1))
        ).toString(32) + overflow;
      var resumableState = currentResumableState;
      if (null === resumableState) throw Error(formatProdErrorMessage(404));
      overflow = localIdCounter++;
      JSCompiler_inline_result =
        "\u00ab" + resumableState.idPrefix + "R" + JSCompiler_inline_result;
      0 < overflow && (JSCompiler_inline_result += "H" + overflow.toString(32));
      return JSCompiler_inline_result + "\u00bb";
    },
    useSyncExternalStore: function (subscribe, getSnapshot, getServerSnapshot) {
      if (void 0 === getServerSnapshot)
        throw Error(formatProdErrorMessage(407));
      return getServerSnapshot();
    },
    useOptimistic: function (passthrough) {
      resolveCurrentlyRenderingComponent();
      return [passthrough, unsupportedSetOptimisticState];
    },
    useActionState: useActionState,
    useFormState: useActionState,
    useHostTransitionStatus: function () {
      resolveCurrentlyRenderingComponent();
      return sharedNotPendingObject;
    },
    useMemoCache: function (size) {
      for (var data = Array(size), i = 0; i < size; i++)
        data[i] = REACT_MEMO_CACHE_SENTINEL;
      return data;
    },
    useCacheRefresh: function () {
      return unsupportedRefresh;
    }
  },
  currentResumableState = null,
  DefaultAsyncDispatcher = {
    getCacheForType: function () {
      throw Error(formatProdErrorMessage(248));
    }
  },
  prefix,
  suffix;
function describeBuiltInComponentFrame(name) {
  if (void 0 === prefix)
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = (match && match[1]) || "";
      suffix =
        -1 < x.stack.indexOf("\n    at")
          ? " (<anonymous>)"
          : -1 < x.stack.indexOf("@")
            ? "@unknown:0:0"
            : "";
    }
  return "\n" + prefix + name + suffix;
}
var reentry = !1;
function describeNativeComponentFrame(fn, construct) {
  if (!fn || reentry) return "";
  reentry = !0;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function () {
        try {
          if (construct) {
            var Fake = function () {
              throw Error();
            };
            Object.defineProperty(Fake.prototype, "props", {
              set: function () {
                throw Error();
              }
            });
            if ("object" === typeof Reflect && Reflect.construct) {
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                var control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x$24) {
                control = x$24;
              }
              fn.call(Fake.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (x$25) {
              control = x$25;
            }
            (Fake = fn()) &&
              "function" === typeof Fake.catch &&
              Fake.catch(function () {});
          }
        } catch (sample) {
          if (sample && control && "string" === typeof sample.stack)
            return [sample.stack, control.stack];
        }
        return [null, null];
      }
    };
    RunInRootFrame.DetermineComponentFrameRoot.displayName =
      "DetermineComponentFrameRoot";
    var namePropDescriptor = Object.getOwnPropertyDescriptor(
      RunInRootFrame.DetermineComponentFrameRoot,
      "name"
    );
    namePropDescriptor &&
      namePropDescriptor.configurable &&
      Object.defineProperty(
        RunInRootFrame.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
      sampleStack = _RunInRootFrame$Deter[0],
      controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      var sampleLines = sampleStack.split("\n"),
        controlLines = controlStack.split("\n");
      for (
        namePropDescriptor = RunInRootFrame = 0;
        RunInRootFrame < sampleLines.length &&
        !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");

      )
        RunInRootFrame++;
      for (
        ;
        namePropDescriptor < controlLines.length &&
        !controlLines[namePropDescriptor].includes(
          "DetermineComponentFrameRoot"
        );

      )
        namePropDescriptor++;
      if (
        RunInRootFrame === sampleLines.length ||
        namePropDescriptor === controlLines.length
      )
        for (
          RunInRootFrame = sampleLines.length - 1,
            namePropDescriptor = controlLines.length - 1;
          1 <= RunInRootFrame &&
          0 <= namePropDescriptor &&
          sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];

        )
          namePropDescriptor--;
      for (
        ;
        1 <= RunInRootFrame && 0 <= namePropDescriptor;
        RunInRootFrame--, namePropDescriptor--
      )
        if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
          if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
            do
              if (
                (RunInRootFrame--,
                namePropDescriptor--,
                0 > namePropDescriptor ||
                  sampleLines[RunInRootFrame] !==
                    controlLines[namePropDescriptor])
              ) {
                var frame =
                  "\n" +
                  sampleLines[RunInRootFrame].replace(" at new ", " at ");
                fn.displayName &&
                  frame.includes("<anonymous>") &&
                  (frame = frame.replace("<anonymous>", fn.displayName));
                return frame;
              }
            while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
          }
          break;
        }
    }
  } finally {
    (reentry = !1), (Error.prepareStackTrace = previousPrepareStackTrace);
  }
  return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "")
    ? describeBuiltInComponentFrame(previousPrepareStackTrace)
    : "";
}
function describeComponentStackByType(type) {
  if ("string" === typeof type) return describeBuiltInComponentFrame(type);
  if ("function" === typeof type)
    return type.prototype && type.prototype.isReactComponent
      ? describeNativeComponentFrame(type, !0)
      : describeNativeComponentFrame(type, !1);
  if ("object" === typeof type && null !== type) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeNativeComponentFrame(type.render, !1);
      case REACT_MEMO_TYPE:
        return describeNativeComponentFrame(type.type, !1);
      case REACT_LAZY_TYPE:
        var lazyComponent = type,
          payload = lazyComponent._payload;
        lazyComponent = lazyComponent._init;
        try {
          type = lazyComponent(payload);
        } catch (x) {
          return describeBuiltInComponentFrame("Lazy");
        }
        return describeComponentStackByType(type);
    }
    if ("string" === typeof type.name)
      return (
        (payload = type.env),
        describeBuiltInComponentFrame(
          type.name + (payload ? " [" + payload + "]" : "")
        )
      );
  }
  switch (type) {
    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame("SuspenseList");
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame("Suspense");
  }
  return "";
}
function defaultErrorHandler(error) {
  if (
    "object" === typeof error &&
    null !== error &&
    "string" === typeof error.environmentName
  ) {
    var JSCompiler_inline_result = error.environmentName;
    error = [error].slice(0);
    "string" === typeof error[0]
      ? error.splice(
          0,
          1,
          "%c%s%c " + error[0],
          "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
          " " + JSCompiler_inline_result + " ",
          ""
        )
      : error.splice(
          0,
          0,
          "%c%s%c ",
          "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px",
          " " + JSCompiler_inline_result + " ",
          ""
        );
    error.unshift(console);
    JSCompiler_inline_result = bind.apply(console.error, error);
    JSCompiler_inline_result();
  } else console.error(error);
  return null;
}
function noop() {}
function RequestInstance(
  resumableState,
  renderState,
  rootFormatContext,
  progressiveChunkSize,
  onError,
  onAllReady,
  onShellReady,
  onShellError,
  onFatalError,
  onPostpone,
  formState
) {
  var abortSet = new Set();
  this.destination = null;
  this.flushScheduled = !1;
  this.resumableState = resumableState;
  this.renderState = renderState;
  this.rootFormatContext = rootFormatContext;
  this.progressiveChunkSize =
    void 0 === progressiveChunkSize ? 12800 : progressiveChunkSize;
  this.status = 10;
  this.fatalError = null;
  this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0;
  this.completedPreambleSegments = this.completedRootSegment = null;
  this.abortableTasks = abortSet;
  this.pingedTasks = [];
  this.clientRenderedBoundaries = [];
  this.completedBoundaries = [];
  this.partialBoundaries = [];
  this.trackedPostpones = null;
  this.onError = void 0 === onError ? defaultErrorHandler : onError;
  this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
  this.onAllReady = void 0 === onAllReady ? noop : onAllReady;
  this.onShellReady = void 0 === onShellReady ? noop : onShellReady;
  this.onShellError = void 0 === onShellError ? noop : onShellError;
  this.onFatalError = void 0 === onFatalError ? noop : onFatalError;
  this.formState = void 0 === formState ? null : formState;
}
function createRequest(
  children,
  resumableState,
  renderState,
  rootFormatContext,
  progressiveChunkSize,
  onError,
  onAllReady,
  onShellReady,
  onShellError,
  onFatalError,
  onPostpone,
  formState
) {
  resumableState = new RequestInstance(
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
    formState
  );
  renderState = createPendingSegment(
    resumableState,
    0,
    null,
    rootFormatContext,
    !1,
    !1
  );
  renderState.parentFlushed = !0;
  children = createRenderTask(
    resumableState,
    null,
    children,
    -1,
    null,
    renderState,
    null,
    null,
    resumableState.abortableTasks,
    null,
    rootFormatContext,
    null,
    emptyTreeContext,
    null,
    !1
  );
  pushComponentStack(children);
  resumableState.pingedTasks.push(children);
  return resumableState;
}
function createPrerenderRequest(
  children,
  resumableState,
  renderState,
  rootFormatContext,
  progressiveChunkSize,
  onError,
  onAllReady,
  onShellReady,
  onShellError,
  onFatalError,
  onPostpone
) {
  children = createRequest(
    children,
    resumableState,
    renderState,
    rootFormatContext,
    progressiveChunkSize,
    onError,
    onAllReady,
    onShellReady,
    onShellError,
    onFatalError,
    onPostpone,
    void 0
  );
  children.trackedPostpones = {
    workingMap: new Map(),
    rootNodes: [],
    rootSlots: null
  };
  return children;
}
var currentRequest = null;
function pingTask(request, task) {
  request.pingedTasks.push(task);
  1 === request.pingedTasks.length &&
    ((request.flushScheduled = null !== request.destination),
    null !== request.trackedPostpones || 10 === request.status
      ? scheduleMicrotask(function () {
          return performWork(request);
        })
      : scheduleWork(function () {
          return performWork(request);
        }));
}
function createSuspenseBoundary(
  request,
  fallbackAbortableTasks,
  contentPreamble,
  fallbackPreamble
) {
  return {
    status: 0,
    rootSegmentID: -1,
    parentFlushed: !1,
    pendingTasks: 0,
    completedSegments: [],
    byteSize: 0,
    fallbackAbortableTasks: fallbackAbortableTasks,
    errorDigest: null,
    contentState: createHoistableState(),
    fallbackState: createHoistableState(),
    contentPreamble: contentPreamble,
    fallbackPreamble: fallbackPreamble,
    trackedContentKeyPath: null,
    trackedFallbackNode: null
  };
}
function createRenderTask(
  request,
  thenableState,
  node,
  childIndex,
  blockedBoundary,
  blockedSegment,
  blockedPreamble,
  hoistableState,
  abortSet,
  keyPath,
  formatContext,
  context,
  treeContext,
  componentStack,
  isFallback
) {
  request.allPendingTasks++;
  null === blockedBoundary
    ? request.pendingRootTasks++
    : blockedBoundary.pendingTasks++;
  var task = {
    replay: null,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: blockedSegment,
    blockedPreamble: blockedPreamble,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    componentStack: componentStack,
    thenableState: thenableState,
    isFallback: isFallback
  };
  abortSet.add(task);
  return task;
}
function createReplayTask(
  request,
  thenableState,
  replay,
  node,
  childIndex,
  blockedBoundary,
  hoistableState,
  abortSet,
  keyPath,
  formatContext,
  context,
  treeContext,
  componentStack,
  isFallback
) {
  request.allPendingTasks++;
  null === blockedBoundary
    ? request.pendingRootTasks++
    : blockedBoundary.pendingTasks++;
  replay.pendingTasks++;
  var task = {
    replay: replay,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: null,
    blockedPreamble: null,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    componentStack: componentStack,
    thenableState: thenableState,
    isFallback: isFallback
  };
  abortSet.add(task);
  return task;
}
function createPendingSegment(
  request,
  index,
  boundary,
  parentFormatContext,
  lastPushedText,
  textEmbedded
) {
  return {
    status: 0,
    parentFlushed: !1,
    id: -1,
    index: index,
    chunks: [],
    children: [],
    preambleChildren: [],
    parentFormatContext: parentFormatContext,
    boundary: boundary,
    lastPushedText: lastPushedText,
    textEmbedded: textEmbedded
  };
}
function pushComponentStack(task) {
  var node = task.node;
  if ("object" === typeof node && null !== node)
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        task.componentStack = { parent: task.componentStack, type: node.type };
    }
}
function getThrownInfo(node$jscomp$0) {
  var errorInfo = {};
  node$jscomp$0 &&
    Object.defineProperty(errorInfo, "componentStack", {
      configurable: !0,
      enumerable: !0,
      get: function () {
        try {
          var info = "",
            node = node$jscomp$0;
          do
            (info += describeComponentStackByType(node.type)),
              (node = node.parent);
          while (node);
          var JSCompiler_inline_result = info;
        } catch (x) {
          JSCompiler_inline_result =
            "\nError generating stack: " + x.message + "\n" + x.stack;
        }
        Object.defineProperty(errorInfo, "componentStack", {
          value: JSCompiler_inline_result
        });
        return JSCompiler_inline_result;
      }
    });
  return errorInfo;
}
function logRecoverableError(request, error, errorInfo) {
  request = request.onError;
  error = request(error, errorInfo);
  if (null == error || "string" === typeof error) return error;
}
function fatalError(request, error) {
  var onShellError = request.onShellError,
    onFatalError = request.onFatalError;
  onShellError(error);
  onFatalError(error);
  null !== request.destination
    ? ((request.status = 14), closeWithError(request.destination, error))
    : ((request.status = 13), (request.fatalError = error));
}
function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
  var prevThenableState = task.thenableState;
  task.thenableState = null;
  currentlyRenderingComponent = {};
  currentlyRenderingTask = task;
  currentlyRenderingRequest = request;
  currentlyRenderingKeyPath = keyPath;
  actionStateCounter = localIdCounter = 0;
  actionStateMatchingIndex = -1;
  thenableIndexCounter = 0;
  thenableState = prevThenableState;
  for (request = Component(props, secondArg); didScheduleRenderPhaseUpdate; )
    (didScheduleRenderPhaseUpdate = !1),
      (actionStateCounter = localIdCounter = 0),
      (actionStateMatchingIndex = -1),
      (thenableIndexCounter = 0),
      (numberOfReRenders += 1),
      (workInProgressHook = null),
      (request = Component(props, secondArg));
  resetHooksState();
  return request;
}
function finishFunctionComponent(
  request,
  task,
  keyPath,
  children,
  hasId,
  actionStateCount,
  actionStateMatchingIndex
) {
  var didEmitActionStateMarkers = !1;
  if (0 !== actionStateCount && null !== request.formState) {
    var segment = task.blockedSegment;
    if (null !== segment) {
      didEmitActionStateMarkers = !0;
      segment = segment.chunks;
      for (var i = 0; i < actionStateCount; i++)
        i === actionStateMatchingIndex
          ? segment.push(formStateMarkerIsMatching)
          : segment.push(formStateMarkerIsNotMatching);
    }
  }
  actionStateCount = task.keyPath;
  task.keyPath = keyPath;
  hasId
    ? ((keyPath = task.treeContext),
      (task.treeContext = pushTreeContext(keyPath, 1, 0)),
      renderNode(request, task, children, -1),
      (task.treeContext = keyPath))
    : didEmitActionStateMarkers
      ? renderNode(request, task, children, -1)
      : renderNodeDestructive(request, task, children, -1);
  task.keyPath = actionStateCount;
}
function renderElement(request, task, keyPath, type, props, ref) {
  if ("function" === typeof type)
    if (type.prototype && type.prototype.isReactComponent) {
      var newProps = props;
      if ("ref" in props) {
        newProps = {};
        for (var propName in props)
          "ref" !== propName && (newProps[propName] = props[propName]);
      }
      var defaultProps = type.defaultProps;
      if (defaultProps) {
        newProps === props && (newProps = assign({}, newProps, props));
        for (var propName$33 in defaultProps)
          void 0 === newProps[propName$33] &&
            (newProps[propName$33] = defaultProps[propName$33]);
      }
      props = newProps;
      newProps = emptyContextObject;
      defaultProps = type.contextType;
      "object" === typeof defaultProps &&
        null !== defaultProps &&
        (newProps = defaultProps._currentValue);
      newProps = new type(props, newProps);
      var initialState = void 0 !== newProps.state ? newProps.state : null;
      newProps.updater = classComponentUpdater;
      newProps.props = props;
      newProps.state = initialState;
      defaultProps = { queue: [], replace: !1 };
      newProps._reactInternals = defaultProps;
      ref = type.contextType;
      newProps.context =
        "object" === typeof ref && null !== ref
          ? ref._currentValue
          : emptyContextObject;
      ref = type.getDerivedStateFromProps;
      "function" === typeof ref &&
        ((ref = ref(props, initialState)),
        (initialState =
          null === ref || void 0 === ref
            ? initialState
            : assign({}, initialState, ref)),
        (newProps.state = initialState));
      if (
        "function" !== typeof type.getDerivedStateFromProps &&
        "function" !== typeof newProps.getSnapshotBeforeUpdate &&
        ("function" === typeof newProps.UNSAFE_componentWillMount ||
          "function" === typeof newProps.componentWillMount)
      )
        if (
          ((type = newProps.state),
          "function" === typeof newProps.componentWillMount &&
            newProps.componentWillMount(),
          "function" === typeof newProps.UNSAFE_componentWillMount &&
            newProps.UNSAFE_componentWillMount(),
          type !== newProps.state &&
            classComponentUpdater.enqueueReplaceState(
              newProps,
              newProps.state,
              null
            ),
          null !== defaultProps.queue && 0 < defaultProps.queue.length)
        )
          if (
            ((type = defaultProps.queue),
            (ref = defaultProps.replace),
            (defaultProps.queue = null),
            (defaultProps.replace = !1),
            ref && 1 === type.length)
          )
            newProps.state = type[0];
          else {
            defaultProps = ref ? type[0] : newProps.state;
            initialState = !0;
            for (ref = ref ? 1 : 0; ref < type.length; ref++)
              (propName$33 = type[ref]),
                (propName$33 =
                  "function" === typeof propName$33
                    ? propName$33.call(newProps, defaultProps, props, void 0)
                    : propName$33),
                null != propName$33 &&
                  (initialState
                    ? ((initialState = !1),
                      (defaultProps = assign({}, defaultProps, propName$33)))
                    : assign(defaultProps, propName$33));
            newProps.state = defaultProps;
          }
        else defaultProps.queue = null;
      type = newProps.render();
      if (12 === request.status) throw null;
      props = task.keyPath;
      task.keyPath = keyPath;
      renderNodeDestructive(request, task, type, -1);
      task.keyPath = props;
    } else {
      type = renderWithHooks(request, task, keyPath, type, props, void 0);
      if (12 === request.status) throw null;
      finishFunctionComponent(
        request,
        task,
        keyPath,
        type,
        0 !== localIdCounter,
        actionStateCounter,
        actionStateMatchingIndex
      );
    }
  else if ("string" === typeof type)
    if (((newProps = task.blockedSegment), null === newProps))
      (newProps = props.children),
        (defaultProps = task.formatContext),
        (initialState = task.keyPath),
        (task.formatContext = getChildFormatContext(defaultProps, type, props)),
        (task.keyPath = keyPath),
        renderNode(request, task, newProps, -1),
        (task.formatContext = defaultProps),
        (task.keyPath = initialState);
    else {
      ref = pushStartInstance(
        newProps.chunks,
        type,
        props,
        request.resumableState,
        request.renderState,
        task.blockedPreamble,
        task.hoistableState,
        task.formatContext,
        newProps.lastPushedText,
        task.isFallback
      );
      newProps.lastPushedText = !1;
      defaultProps = task.formatContext;
      initialState = task.keyPath;
      task.keyPath = keyPath;
      3 ===
      (task.formatContext = getChildFormatContext(defaultProps, type, props))
        .insertionMode
        ? ((keyPath = createPendingSegment(
            request,
            0,
            null,
            task.formatContext,
            !1,
            !1
          )),
          newProps.preambleChildren.push(keyPath),
          (keyPath = createRenderTask(
            request,
            null,
            ref,
            -1,
            task.blockedBoundary,
            keyPath,
            task.blockedPreamble,
            task.hoistableState,
            request.abortableTasks,
            task.keyPath,
            task.formatContext,
            task.context,
            task.treeContext,
            task.componentStack,
            task.isFallback
          )),
          pushComponentStack(keyPath),
          request.pingedTasks.push(keyPath))
        : renderNode(request, task, ref, -1);
      task.formatContext = defaultProps;
      task.keyPath = initialState;
      a: {
        task = newProps.chunks;
        request = request.resumableState;
        switch (type) {
          case "title":
          case "style":
          case "script":
          case "area":
          case "base":
          case "br":
          case "col":
          case "embed":
          case "hr":
          case "img":
          case "input":
          case "keygen":
          case "link":
          case "meta":
          case "param":
          case "source":
          case "track":
          case "wbr":
            break a;
          case "body":
            if (1 >= defaultProps.insertionMode) {
              request.hasBody = !0;
              break a;
            }
            break;
          case "html":
            if (0 === defaultProps.insertionMode) {
              request.hasHtml = !0;
              break a;
            }
            break;
          case "head":
            if (1 >= defaultProps.insertionMode) break a;
        }
        task.push(endChunkForTag(type));
      }
      newProps.lastPushedText = !1;
    }
  else {
    switch (type) {
      case REACT_LEGACY_HIDDEN_TYPE:
      case REACT_STRICT_MODE_TYPE:
      case REACT_PROFILER_TYPE:
      case REACT_FRAGMENT_TYPE:
        type = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, props.children, -1);
        task.keyPath = type;
        return;
      case REACT_ACTIVITY_TYPE:
        "hidden" !== props.mode &&
          ((type = task.keyPath),
          (task.keyPath = keyPath),
          renderNodeDestructive(request, task, props.children, -1),
          (task.keyPath = type));
        return;
      case REACT_SUSPENSE_LIST_TYPE:
        type = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, props.children, -1);
        task.keyPath = type;
        return;
      case REACT_VIEW_TRANSITION_TYPE:
      case REACT_SCOPE_TYPE:
        throw Error(formatProdErrorMessage(343));
      case REACT_SUSPENSE_TYPE:
        a: if (null !== task.replay) {
          type = task.keyPath;
          task.keyPath = keyPath;
          keyPath = props.children;
          try {
            renderNode(request, task, keyPath, -1);
          } finally {
            task.keyPath = type;
          }
        } else {
          type = task.keyPath;
          var parentBoundary = task.blockedBoundary;
          ref = task.blockedPreamble;
          var parentHoistableState = task.hoistableState;
          propName$33 = task.blockedSegment;
          propName = props.fallback;
          props = props.children;
          var fallbackAbortSet = new Set();
          var newBoundary =
            2 > task.formatContext.insertionMode
              ? createSuspenseBoundary(
                  request,
                  fallbackAbortSet,
                  createPreambleState(),
                  createPreambleState()
                )
              : createSuspenseBoundary(request, fallbackAbortSet, null, null);
          null !== request.trackedPostpones &&
            (newBoundary.trackedContentKeyPath = keyPath);
          var boundarySegment = createPendingSegment(
            request,
            propName$33.chunks.length,
            newBoundary,
            task.formatContext,
            !1,
            !1
          );
          propName$33.children.push(boundarySegment);
          propName$33.lastPushedText = !1;
          var contentRootSegment = createPendingSegment(
            request,
            0,
            null,
            task.formatContext,
            !1,
            !1
          );
          contentRootSegment.parentFlushed = !0;
          if (null !== request.trackedPostpones) {
            newProps = [keyPath[0], "Suspense Fallback", keyPath[2]];
            defaultProps = [newProps[1], newProps[2], [], null];
            request.trackedPostpones.workingMap.set(newProps, defaultProps);
            newBoundary.trackedFallbackNode = defaultProps;
            task.blockedSegment = boundarySegment;
            task.blockedPreamble = newBoundary.fallbackPreamble;
            task.keyPath = newProps;
            boundarySegment.status = 6;
            try {
              renderNode(request, task, propName, -1),
                boundarySegment.lastPushedText &&
                  boundarySegment.textEmbedded &&
                  boundarySegment.chunks.push(textSeparator),
                (boundarySegment.status = 1);
            } catch (thrownValue) {
              throw (
                ((boundarySegment.status = 12 === request.status ? 3 : 4),
                thrownValue)
              );
            } finally {
              (task.blockedSegment = propName$33),
                (task.blockedPreamble = ref),
                (task.keyPath = type);
            }
            task = createRenderTask(
              request,
              null,
              props,
              -1,
              newBoundary,
              contentRootSegment,
              newBoundary.contentPreamble,
              newBoundary.contentState,
              task.abortSet,
              keyPath,
              task.formatContext,
              task.context,
              task.treeContext,
              task.componentStack,
              task.isFallback
            );
            pushComponentStack(task);
            request.pingedTasks.push(task);
          } else {
            task.blockedBoundary = newBoundary;
            task.blockedPreamble = newBoundary.contentPreamble;
            task.hoistableState = newBoundary.contentState;
            task.blockedSegment = contentRootSegment;
            task.keyPath = keyPath;
            contentRootSegment.status = 6;
            try {
              if (
                (renderNode(request, task, props, -1),
                contentRootSegment.lastPushedText &&
                  contentRootSegment.textEmbedded &&
                  contentRootSegment.chunks.push(textSeparator),
                (contentRootSegment.status = 1),
                queueCompletedSegment(newBoundary, contentRootSegment),
                0 === newBoundary.pendingTasks && 0 === newBoundary.status)
              ) {
                newBoundary.status = 1;
                0 === request.pendingRootTasks &&
                  task.blockedPreamble &&
                  preparePreamble(request);
                break a;
              }
            } catch (thrownValue$28) {
              (newBoundary.status = 4),
                12 === request.status
                  ? ((contentRootSegment.status = 3),
                    (newProps = request.fatalError))
                  : ((contentRootSegment.status = 4),
                    (newProps = thrownValue$28)),
                (defaultProps = getThrownInfo(task.componentStack)),
                (initialState = logRecoverableError(
                  request,
                  newProps,
                  defaultProps
                )),
                (newBoundary.errorDigest = initialState),
                untrackBoundary(request, newBoundary);
            } finally {
              (task.blockedBoundary = parentBoundary),
                (task.blockedPreamble = ref),
                (task.hoistableState = parentHoistableState),
                (task.blockedSegment = propName$33),
                (task.keyPath = type);
            }
            task = createRenderTask(
              request,
              null,
              propName,
              -1,
              parentBoundary,
              boundarySegment,
              newBoundary.fallbackPreamble,
              newBoundary.fallbackState,
              fallbackAbortSet,
              [keyPath[0], "Suspense Fallback", keyPath[2]],
              task.formatContext,
              task.context,
              task.treeContext,
              task.componentStack,
              !0
            );
            pushComponentStack(task);
            request.pingedTasks.push(task);
          }
        }
        return;
    }
    if ("object" === typeof type && null !== type)
      switch (type.$$typeof) {
        case REACT_FORWARD_REF_TYPE:
          if ("ref" in props)
            for (newBoundary in ((newProps = {}), props))
              "ref" !== newBoundary &&
                (newProps[newBoundary] = props[newBoundary]);
          else newProps = props;
          type = renderWithHooks(
            request,
            task,
            keyPath,
            type.render,
            newProps,
            ref
          );
          finishFunctionComponent(
            request,
            task,
            keyPath,
            type,
            0 !== localIdCounter,
            actionStateCounter,
            actionStateMatchingIndex
          );
          return;
        case REACT_MEMO_TYPE:
          renderElement(request, task, keyPath, type.type, props, ref);
          return;
        case REACT_PROVIDER_TYPE:
        case REACT_CONTEXT_TYPE:
          defaultProps = props.children;
          newProps = task.keyPath;
          props = props.value;
          initialState = type._currentValue;
          type._currentValue = props;
          ref = currentActiveSnapshot;
          currentActiveSnapshot = type = {
            parent: ref,
            depth: null === ref ? 0 : ref.depth + 1,
            context: type,
            parentValue: initialState,
            value: props
          };
          task.context = type;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, defaultProps, -1);
          request = currentActiveSnapshot;
          if (null === request) throw Error(formatProdErrorMessage(403));
          request.context._currentValue = request.parentValue;
          request = currentActiveSnapshot = request.parent;
          task.context = request;
          task.keyPath = newProps;
          return;
        case REACT_CONSUMER_TYPE:
          props = props.children;
          type = props(type._context._currentValue);
          props = task.keyPath;
          task.keyPath = keyPath;
          renderNodeDestructive(request, task, type, -1);
          task.keyPath = props;
          return;
        case REACT_LAZY_TYPE:
          newProps = type._init;
          type = newProps(type._payload);
          if (12 === request.status) throw null;
          renderElement(request, task, keyPath, type, props, ref);
          return;
      }
    throw Error(
      formatProdErrorMessage(130, null == type ? type : typeof type, "")
    );
  }
}
function resumeNode(request, task, segmentId, node, childIndex) {
  var prevReplay = task.replay,
    blockedBoundary = task.blockedBoundary,
    resumedSegment = createPendingSegment(
      request,
      0,
      null,
      task.formatContext,
      !1,
      !1
    );
  resumedSegment.id = segmentId;
  resumedSegment.parentFlushed = !0;
  try {
    (task.replay = null),
      (task.blockedSegment = resumedSegment),
      renderNode(request, task, node, childIndex),
      (resumedSegment.status = 1),
      null === blockedBoundary
        ? (request.completedRootSegment = resumedSegment)
        : (queueCompletedSegment(blockedBoundary, resumedSegment),
          blockedBoundary.parentFlushed &&
            request.partialBoundaries.push(blockedBoundary));
  } finally {
    (task.replay = prevReplay), (task.blockedSegment = null);
  }
}
function renderNodeDestructive(request, task, node, childIndex) {
  null !== task.replay && "number" === typeof task.replay.slots
    ? resumeNode(request, task, task.replay.slots, node, childIndex)
    : ((task.node = node),
      (task.childIndex = childIndex),
      (node = task.componentStack),
      pushComponentStack(task),
      retryNode(request, task),
      (task.componentStack = node));
}
function retryNode(request, task) {
  var node = task.node,
    childIndex = task.childIndex;
  if (null !== node) {
    if ("object" === typeof node) {
      switch (node.$$typeof) {
        case REACT_ELEMENT_TYPE:
          var type = node.type,
            key = node.key,
            props = node.props;
          node = props.ref;
          var ref = void 0 !== node ? node : null,
            name = getComponentNameFromType(type),
            keyOrIndex =
              null == key ? (-1 === childIndex ? 0 : childIndex) : key;
          key = [task.keyPath, name, keyOrIndex];
          if (null !== task.replay)
            a: {
              var replay = task.replay;
              childIndex = replay.nodes;
              for (node = 0; node < childIndex.length; node++) {
                var node$jscomp$0 = childIndex[node];
                if (keyOrIndex === node$jscomp$0[1]) {
                  if (4 === node$jscomp$0.length) {
                    if (null !== name && name !== node$jscomp$0[0])
                      throw Error(
                        formatProdErrorMessage(490, node$jscomp$0[0], name)
                      );
                    var childNodes = node$jscomp$0[2];
                    name = node$jscomp$0[3];
                    keyOrIndex = task.node;
                    task.replay = {
                      nodes: childNodes,
                      slots: name,
                      pendingTasks: 1
                    };
                    try {
                      renderElement(request, task, key, type, props, ref);
                      if (
                        1 === task.replay.pendingTasks &&
                        0 < task.replay.nodes.length
                      )
                        throw Error(formatProdErrorMessage(488));
                      task.replay.pendingTasks--;
                    } catch (x) {
                      if (
                        "object" === typeof x &&
                        null !== x &&
                        (x === SuspenseException ||
                          "function" === typeof x.then)
                      )
                        throw (
                          (task.node === keyOrIndex && (task.replay = replay),
                          x)
                        );
                      task.replay.pendingTasks--;
                      props = getThrownInfo(task.componentStack);
                      key = task.blockedBoundary;
                      type = x;
                      props = logRecoverableError(request, type, props);
                      abortRemainingReplayNodes(
                        request,
                        key,
                        childNodes,
                        name,
                        type,
                        props
                      );
                    }
                    task.replay = replay;
                  } else {
                    if (type !== REACT_SUSPENSE_TYPE)
                      throw Error(
                        formatProdErrorMessage(
                          490,
                          "Suspense",
                          getComponentNameFromType(type) || "Unknown"
                        )
                      );
                    b: {
                      replay = void 0;
                      type = node$jscomp$0[5];
                      ref = node$jscomp$0[2];
                      name = node$jscomp$0[3];
                      keyOrIndex =
                        null === node$jscomp$0[4] ? [] : node$jscomp$0[4][2];
                      node$jscomp$0 =
                        null === node$jscomp$0[4] ? null : node$jscomp$0[4][3];
                      var prevKeyPath = task.keyPath,
                        previousReplaySet = task.replay,
                        parentBoundary = task.blockedBoundary,
                        parentHoistableState = task.hoistableState,
                        content = props.children,
                        fallback = props.fallback,
                        fallbackAbortSet = new Set();
                      props =
                        2 > task.formatContext.insertionMode
                          ? createSuspenseBoundary(
                              request,
                              fallbackAbortSet,
                              createPreambleState(),
                              createPreambleState()
                            )
                          : createSuspenseBoundary(
                              request,
                              fallbackAbortSet,
                              null,
                              null
                            );
                      props.parentFlushed = !0;
                      props.rootSegmentID = type;
                      task.blockedBoundary = props;
                      task.hoistableState = props.contentState;
                      task.keyPath = key;
                      task.replay = {
                        nodes: ref,
                        slots: name,
                        pendingTasks: 1
                      };
                      try {
                        renderNode(request, task, content, -1);
                        if (
                          1 === task.replay.pendingTasks &&
                          0 < task.replay.nodes.length
                        )
                          throw Error(formatProdErrorMessage(488));
                        task.replay.pendingTasks--;
                        if (0 === props.pendingTasks && 0 === props.status) {
                          props.status = 1;
                          request.completedBoundaries.push(props);
                          break b;
                        }
                      } catch (error) {
                        (props.status = 4),
                          (childNodes = getThrownInfo(task.componentStack)),
                          (replay = logRecoverableError(
                            request,
                            error,
                            childNodes
                          )),
                          (props.errorDigest = replay),
                          task.replay.pendingTasks--,
                          request.clientRenderedBoundaries.push(props);
                      } finally {
                        (task.blockedBoundary = parentBoundary),
                          (task.hoistableState = parentHoistableState),
                          (task.replay = previousReplaySet),
                          (task.keyPath = prevKeyPath);
                      }
                      task = createReplayTask(
                        request,
                        null,
                        {
                          nodes: keyOrIndex,
                          slots: node$jscomp$0,
                          pendingTasks: 0
                        },
                        fallback,
                        -1,
                        parentBoundary,
                        props.fallbackState,
                        fallbackAbortSet,
                        [key[0], "Suspense Fallback", key[2]],
                        task.formatContext,
                        task.context,
                        task.treeContext,
                        task.componentStack,
                        !0
                      );
                      pushComponentStack(task);
                      request.pingedTasks.push(task);
                    }
                  }
                  childIndex.splice(node, 1);
                  break a;
                }
              }
            }
          else renderElement(request, task, key, type, props, ref);
          return;
        case REACT_PORTAL_TYPE:
          throw Error(formatProdErrorMessage(257));
        case REACT_LAZY_TYPE:
          childNodes = node._init;
          node = childNodes(node._payload);
          if (12 === request.status) throw null;
          renderNodeDestructive(request, task, node, childIndex);
          return;
      }
      if (isArrayImpl(node)) {
        renderChildrenArray(request, task, node, childIndex);
        return;
      }
      null === node || "object" !== typeof node
        ? (childNodes = null)
        : ((childNodes =
            (MAYBE_ITERATOR_SYMBOL && node[MAYBE_ITERATOR_SYMBOL]) ||
            node["@@iterator"]),
          (childNodes = "function" === typeof childNodes ? childNodes : null));
      if (childNodes && (childNodes = childNodes.call(node))) {
        node = childNodes.next();
        if (!node.done) {
          props = [];
          do props.push(node.value), (node = childNodes.next());
          while (!node.done);
          renderChildrenArray(request, task, props, childIndex);
        }
        return;
      }
      if ("function" === typeof node.then)
        return (
          (task.thenableState = null),
          renderNodeDestructive(request, task, unwrapThenable(node), childIndex)
        );
      if (node.$$typeof === REACT_CONTEXT_TYPE)
        return renderNodeDestructive(
          request,
          task,
          node._currentValue,
          childIndex
        );
      childIndex = Object.prototype.toString.call(node);
      throw Error(
        formatProdErrorMessage(
          31,
          "[object Object]" === childIndex
            ? "object with keys {" + Object.keys(node).join(", ") + "}"
            : childIndex
        )
      );
    }
    if ("string" === typeof node)
      (childIndex = task.blockedSegment),
        null !== childIndex &&
          (childIndex.lastPushedText = pushTextInstance(
            childIndex.chunks,
            node,
            request.renderState,
            childIndex.lastPushedText
          ));
    else if ("number" === typeof node || "bigint" === typeof node)
      (childIndex = task.blockedSegment),
        null !== childIndex &&
          (childIndex.lastPushedText = pushTextInstance(
            childIndex.chunks,
            "" + node,
            request.renderState,
            childIndex.lastPushedText
          ));
  }
}
function renderChildrenArray(request, task, children, childIndex) {
  var prevKeyPath = task.keyPath;
  if (
    -1 !== childIndex &&
    ((task.keyPath = [task.keyPath, "Fragment", childIndex]),
    null !== task.replay)
  ) {
    for (
      var replay = task.replay, replayNodes = replay.nodes, j = 0;
      j < replayNodes.length;
      j++
    ) {
      var node = replayNodes[j];
      if (node[1] === childIndex) {
        childIndex = node[2];
        node = node[3];
        task.replay = { nodes: childIndex, slots: node, pendingTasks: 1 };
        try {
          renderChildrenArray(request, task, children, -1);
          if (1 === task.replay.pendingTasks && 0 < task.replay.nodes.length)
            throw Error(formatProdErrorMessage(488));
          task.replay.pendingTasks--;
        } catch (x) {
          if (
            "object" === typeof x &&
            null !== x &&
            (x === SuspenseException || "function" === typeof x.then)
          )
            throw x;
          task.replay.pendingTasks--;
          children = getThrownInfo(task.componentStack);
          var boundary = task.blockedBoundary,
            error = x;
          children = logRecoverableError(request, error, children);
          abortRemainingReplayNodes(
            request,
            boundary,
            childIndex,
            node,
            error,
            children
          );
        }
        task.replay = replay;
        replayNodes.splice(j, 1);
        break;
      }
    }
    task.keyPath = prevKeyPath;
    return;
  }
  replay = task.treeContext;
  replayNodes = children.length;
  if (
    null !== task.replay &&
    ((j = task.replay.slots), null !== j && "object" === typeof j)
  ) {
    for (childIndex = 0; childIndex < replayNodes; childIndex++)
      (node = children[childIndex]),
        (task.treeContext = pushTreeContext(replay, replayNodes, childIndex)),
        (boundary = j[childIndex]),
        "number" === typeof boundary
          ? (resumeNode(request, task, boundary, node, childIndex),
            delete j[childIndex])
          : renderNode(request, task, node, childIndex);
    task.treeContext = replay;
    task.keyPath = prevKeyPath;
    return;
  }
  for (j = 0; j < replayNodes; j++)
    (childIndex = children[j]),
      (task.treeContext = pushTreeContext(replay, replayNodes, j)),
      renderNode(request, task, childIndex, j);
  task.treeContext = replay;
  task.keyPath = prevKeyPath;
}
function untrackBoundary(request, boundary) {
  request = request.trackedPostpones;
  null !== request &&
    ((boundary = boundary.trackedContentKeyPath),
    null !== boundary &&
      ((boundary = request.workingMap.get(boundary)),
      void 0 !== boundary &&
        ((boundary.length = 4), (boundary[2] = []), (boundary[3] = null))));
}
function spawnNewSuspendedReplayTask(request, task, thenableState) {
  return createReplayTask(
    request,
    thenableState,
    task.replay,
    task.node,
    task.childIndex,
    task.blockedBoundary,
    task.hoistableState,
    task.abortSet,
    task.keyPath,
    task.formatContext,
    task.context,
    task.treeContext,
    task.componentStack,
    task.isFallback
  );
}
function spawnNewSuspendedRenderTask(request, task, thenableState) {
  var segment = task.blockedSegment,
    newSegment = createPendingSegment(
      request,
      segment.chunks.length,
      null,
      task.formatContext,
      segment.lastPushedText,
      !0
    );
  segment.children.push(newSegment);
  segment.lastPushedText = !1;
  return createRenderTask(
    request,
    thenableState,
    task.node,
    task.childIndex,
    task.blockedBoundary,
    newSegment,
    task.blockedPreamble,
    task.hoistableState,
    task.abortSet,
    task.keyPath,
    task.formatContext,
    task.context,
    task.treeContext,
    task.componentStack,
    task.isFallback
  );
}
function renderNode(request, task, node, childIndex) {
  var previousFormatContext = task.formatContext,
    previousContext = task.context,
    previousKeyPath = task.keyPath,
    previousTreeContext = task.treeContext,
    previousComponentStack = task.componentStack,
    segment = task.blockedSegment;
  if (null === segment)
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue) {
      if (
        (resetHooksState(),
        (node =
          thrownValue === SuspenseException
            ? getSuspendedThenable()
            : thrownValue),
        "object" === typeof node && null !== node)
      ) {
        if ("function" === typeof node.then) {
          childIndex = getThenableStateAfterSuspending();
          request = spawnNewSuspendedReplayTask(request, task, childIndex).ping;
          node.then(request, request);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
        if ("Maximum call stack size exceeded" === node.message) {
          node = getThenableStateAfterSuspending();
          node = spawnNewSuspendedReplayTask(request, task, node);
          request.pingedTasks.push(node);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
      }
    }
  else {
    var childrenLength = segment.children.length,
      chunkLength = segment.chunks.length;
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue$48) {
      if (
        (resetHooksState(),
        (segment.children.length = childrenLength),
        (segment.chunks.length = chunkLength),
        (node =
          thrownValue$48 === SuspenseException
            ? getSuspendedThenable()
            : thrownValue$48),
        "object" === typeof node && null !== node)
      ) {
        if ("function" === typeof node.then) {
          childIndex = getThenableStateAfterSuspending();
          request = spawnNewSuspendedRenderTask(request, task, childIndex).ping;
          node.then(request, request);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
        if ("Maximum call stack size exceeded" === node.message) {
          node = getThenableStateAfterSuspending();
          node = spawnNewSuspendedRenderTask(request, task, node);
          request.pingedTasks.push(node);
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          switchContext(previousContext);
          return;
        }
      }
    }
  }
  task.formatContext = previousFormatContext;
  task.context = previousContext;
  task.keyPath = previousKeyPath;
  task.treeContext = previousTreeContext;
  switchContext(previousContext);
  throw node;
}
function abortTaskSoft(task) {
  var boundary = task.blockedBoundary;
  task = task.blockedSegment;
  null !== task && ((task.status = 3), finishedTask(this, boundary, task));
}
function abortRemainingReplayNodes(
  request$jscomp$0,
  boundary,
  nodes,
  slots,
  error,
  errorDigest$jscomp$0
) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (4 === node.length)
      abortRemainingReplayNodes(
        request$jscomp$0,
        boundary,
        node[2],
        node[3],
        error,
        errorDigest$jscomp$0
      );
    else {
      node = node[5];
      var request = request$jscomp$0,
        errorDigest = errorDigest$jscomp$0,
        resumedBoundary = createSuspenseBoundary(
          request,
          new Set(),
          null,
          null
        );
      resumedBoundary.parentFlushed = !0;
      resumedBoundary.rootSegmentID = node;
      resumedBoundary.status = 4;
      resumedBoundary.errorDigest = errorDigest;
      resumedBoundary.parentFlushed &&
        request.clientRenderedBoundaries.push(resumedBoundary);
    }
  }
  nodes.length = 0;
  if (null !== slots) {
    if (null === boundary) throw Error(formatProdErrorMessage(487));
    4 !== boundary.status &&
      ((boundary.status = 4),
      (boundary.errorDigest = errorDigest$jscomp$0),
      boundary.parentFlushed &&
        request$jscomp$0.clientRenderedBoundaries.push(boundary));
    if ("object" === typeof slots) for (var index in slots) delete slots[index];
  }
}
function abortTask(task, request, error) {
  var boundary = task.blockedBoundary,
    segment = task.blockedSegment;
  if (null !== segment) {
    if (6 === segment.status) return;
    segment.status = 3;
  }
  segment = getThrownInfo(task.componentStack);
  if (null === boundary) {
    if (13 !== request.status && 14 !== request.status) {
      boundary = task.replay;
      if (null === boundary) {
        logRecoverableError(request, error, segment);
        fatalError(request, error);
        return;
      }
      boundary.pendingTasks--;
      0 === boundary.pendingTasks &&
        0 < boundary.nodes.length &&
        ((task = logRecoverableError(request, error, segment)),
        abortRemainingReplayNodes(
          request,
          null,
          boundary.nodes,
          boundary.slots,
          error,
          task
        ));
      request.pendingRootTasks--;
      0 === request.pendingRootTasks && completeShell(request);
    }
  } else
    boundary.pendingTasks--,
      4 !== boundary.status &&
        ((boundary.status = 4),
        (task = logRecoverableError(request, error, segment)),
        (boundary.status = 4),
        (boundary.errorDigest = task),
        untrackBoundary(request, boundary),
        boundary.parentFlushed &&
          request.clientRenderedBoundaries.push(boundary)),
      boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
        return abortTask(fallbackTask, request, error);
      }),
      boundary.fallbackAbortableTasks.clear();
  request.allPendingTasks--;
  0 === request.allPendingTasks && completeAll(request);
}
function safelyEmitEarlyPreloads(request, shellComplete) {
  try {
    var renderState = request.renderState,
      onHeaders = renderState.onHeaders;
    if (onHeaders) {
      var headers = renderState.headers;
      if (headers) {
        renderState.headers = null;
        var linkHeader = headers.preconnects;
        headers.fontPreloads &&
          (linkHeader && (linkHeader += ", "),
          (linkHeader += headers.fontPreloads));
        headers.highImagePreloads &&
          (linkHeader && (linkHeader += ", "),
          (linkHeader += headers.highImagePreloads));
        if (!shellComplete) {
          var queueIter = renderState.styles.values(),
            queueStep = queueIter.next();
          b: for (
            ;
            0 < headers.remainingCapacity && !queueStep.done;
            queueStep = queueIter.next()
          )
            for (
              var sheetIter = queueStep.value.sheets.values(),
                sheetStep = sheetIter.next();
              0 < headers.remainingCapacity && !sheetStep.done;
              sheetStep = sheetIter.next()
            ) {
              var sheet = sheetStep.value,
                props = sheet.props,
                key = props.href,
                props$jscomp$0 = sheet.props,
                header = getPreloadAsHeader(props$jscomp$0.href, "style", {
                  crossOrigin: props$jscomp$0.crossOrigin,
                  integrity: props$jscomp$0.integrity,
                  nonce: props$jscomp$0.nonce,
                  type: props$jscomp$0.type,
                  fetchPriority: props$jscomp$0.fetchPriority,
                  referrerPolicy: props$jscomp$0.referrerPolicy,
                  media: props$jscomp$0.media
                });
              if (0 <= (headers.remainingCapacity -= header.length + 2))
                (renderState.resets.style[key] = PRELOAD_NO_CREDS),
                  linkHeader && (linkHeader += ", "),
                  (linkHeader += header),
                  (renderState.resets.style[key] =
                    "string" === typeof props.crossOrigin ||
                    "string" === typeof props.integrity
                      ? [props.crossOrigin, props.integrity]
                      : PRELOAD_NO_CREDS);
              else break b;
            }
        }
        linkHeader ? onHeaders({ Link: linkHeader }) : onHeaders({});
      }
    }
  } catch (error) {
    logRecoverableError(request, error, {});
  }
}
function completeShell(request) {
  null === request.trackedPostpones && safelyEmitEarlyPreloads(request, !0);
  null === request.trackedPostpones && preparePreamble(request);
  request.onShellError = noop;
  request = request.onShellReady;
  request();
}
function completeAll(request) {
  safelyEmitEarlyPreloads(
    request,
    null === request.trackedPostpones
      ? !0
      : null === request.completedRootSegment ||
          5 !== request.completedRootSegment.status
  );
  preparePreamble(request);
  request = request.onAllReady;
  request();
}
function queueCompletedSegment(boundary, segment) {
  if (
    0 === segment.chunks.length &&
    1 === segment.children.length &&
    null === segment.children[0].boundary &&
    -1 === segment.children[0].id
  ) {
    var childSegment = segment.children[0];
    childSegment.id = segment.id;
    childSegment.parentFlushed = !0;
    1 === childSegment.status && queueCompletedSegment(boundary, childSegment);
  } else boundary.completedSegments.push(segment);
}
function finishedTask(request, boundary, segment) {
  if (null === boundary) {
    if (null !== segment && segment.parentFlushed) {
      if (null !== request.completedRootSegment)
        throw Error(formatProdErrorMessage(389));
      request.completedRootSegment = segment;
    }
    request.pendingRootTasks--;
    0 === request.pendingRootTasks && completeShell(request);
  } else
    boundary.pendingTasks--,
      4 !== boundary.status &&
        (0 === boundary.pendingTasks
          ? (0 === boundary.status && (boundary.status = 1),
            null !== segment &&
              segment.parentFlushed &&
              1 === segment.status &&
              queueCompletedSegment(boundary, segment),
            boundary.parentFlushed &&
              request.completedBoundaries.push(boundary),
            1 === boundary.status &&
              (boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request),
              boundary.fallbackAbortableTasks.clear(),
              0 === request.pendingRootTasks &&
                null === request.trackedPostpones &&
                null !== boundary.contentPreamble &&
                preparePreamble(request)))
          : null !== segment &&
            segment.parentFlushed &&
            1 === segment.status &&
            (queueCompletedSegment(boundary, segment),
            1 === boundary.completedSegments.length &&
              boundary.parentFlushed &&
              request.partialBoundaries.push(boundary)));
  request.allPendingTasks--;
  0 === request.allPendingTasks && completeAll(request);
}
function performWork(request$jscomp$2) {
  if (14 !== request$jscomp$2.status && 13 !== request$jscomp$2.status) {
    var prevContext = currentActiveSnapshot,
      prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = HooksDispatcher;
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    var prevRequest = currentRequest;
    currentRequest = request$jscomp$2;
    var prevResumableState = currentResumableState;
    currentResumableState = request$jscomp$2.resumableState;
    try {
      var pingedTasks = request$jscomp$2.pingedTasks,
        i;
      for (i = 0; i < pingedTasks.length; i++) {
        var task = pingedTasks[i],
          request = request$jscomp$2,
          segment = task.blockedSegment;
        if (null === segment) {
          var request$jscomp$0 = request;
          if (0 !== task.replay.pendingTasks) {
            switchContext(task.context);
            try {
              "number" === typeof task.replay.slots
                ? resumeNode(
                    request$jscomp$0,
                    task,
                    task.replay.slots,
                    task.node,
                    task.childIndex
                  )
                : retryNode(request$jscomp$0, task);
              if (
                1 === task.replay.pendingTasks &&
                0 < task.replay.nodes.length
              )
                throw Error(formatProdErrorMessage(488));
              task.replay.pendingTasks--;
              task.abortSet.delete(task);
              finishedTask(request$jscomp$0, task.blockedBoundary, null);
            } catch (thrownValue) {
              resetHooksState();
              var x =
                thrownValue === SuspenseException
                  ? getSuspendedThenable()
                  : thrownValue;
              if (
                "object" === typeof x &&
                null !== x &&
                "function" === typeof x.then
              ) {
                var ping = task.ping;
                x.then(ping, ping);
                task.thenableState = getThenableStateAfterSuspending();
              } else {
                task.replay.pendingTasks--;
                task.abortSet.delete(task);
                var errorInfo = getThrownInfo(task.componentStack);
                request = void 0;
                var request$jscomp$1 = request$jscomp$0,
                  boundary = task.blockedBoundary,
                  error$jscomp$0 =
                    12 === request$jscomp$0.status
                      ? request$jscomp$0.fatalError
                      : x,
                  replayNodes = task.replay.nodes,
                  resumeSlots = task.replay.slots;
                request = logRecoverableError(
                  request$jscomp$1,
                  error$jscomp$0,
                  errorInfo
                );
                abortRemainingReplayNodes(
                  request$jscomp$1,
                  boundary,
                  replayNodes,
                  resumeSlots,
                  error$jscomp$0,
                  request
                );
                request$jscomp$0.pendingRootTasks--;
                0 === request$jscomp$0.pendingRootTasks &&
                  completeShell(request$jscomp$0);
                request$jscomp$0.allPendingTasks--;
                0 === request$jscomp$0.allPendingTasks &&
                  completeAll(request$jscomp$0);
              }
            } finally {
            }
          }
        } else if (
          ((request$jscomp$0 = void 0),
          (request$jscomp$1 = segment),
          0 === request$jscomp$1.status)
        ) {
          request$jscomp$1.status = 6;
          switchContext(task.context);
          var childrenLength = request$jscomp$1.children.length,
            chunkLength = request$jscomp$1.chunks.length;
          try {
            retryNode(request, task),
              request$jscomp$1.lastPushedText &&
                request$jscomp$1.textEmbedded &&
                request$jscomp$1.chunks.push(textSeparator),
              task.abortSet.delete(task),
              (request$jscomp$1.status = 1),
              finishedTask(request, task.blockedBoundary, request$jscomp$1);
          } catch (thrownValue) {
            resetHooksState();
            request$jscomp$1.children.length = childrenLength;
            request$jscomp$1.chunks.length = chunkLength;
            var x$jscomp$0 =
              thrownValue === SuspenseException
                ? getSuspendedThenable()
                : 12 === request.status
                  ? request.fatalError
                  : thrownValue;
            if (
              "object" === typeof x$jscomp$0 &&
              null !== x$jscomp$0 &&
              "function" === typeof x$jscomp$0.then
            ) {
              request$jscomp$1.status = 0;
              task.thenableState = getThenableStateAfterSuspending();
              var ping$jscomp$0 = task.ping;
              x$jscomp$0.then(ping$jscomp$0, ping$jscomp$0);
            } else {
              var errorInfo$jscomp$0 = getThrownInfo(task.componentStack);
              task.abortSet.delete(task);
              request$jscomp$1.status = 4;
              var boundary$jscomp$0 = task.blockedBoundary;
              request$jscomp$0 = logRecoverableError(
                request,
                x$jscomp$0,
                errorInfo$jscomp$0
              );
              null === boundary$jscomp$0
                ? fatalError(request, x$jscomp$0)
                : (boundary$jscomp$0.pendingTasks--,
                  4 !== boundary$jscomp$0.status &&
                    ((boundary$jscomp$0.status = 4),
                    (boundary$jscomp$0.errorDigest = request$jscomp$0),
                    untrackBoundary(request, boundary$jscomp$0),
                    boundary$jscomp$0.parentFlushed &&
                      request.clientRenderedBoundaries.push(boundary$jscomp$0),
                    0 === request.pendingRootTasks &&
                      null === request.trackedPostpones &&
                      null !== boundary$jscomp$0.contentPreamble &&
                      preparePreamble(request)));
              request.allPendingTasks--;
              0 === request.allPendingTasks && completeAll(request);
            }
          } finally {
          }
        }
      }
      pingedTasks.splice(0, i);
      null !== request$jscomp$2.destination &&
        flushCompletedQueues(request$jscomp$2, request$jscomp$2.destination);
    } catch (error) {
      logRecoverableError(request$jscomp$2, error, {}),
        fatalError(request$jscomp$2, error);
    } finally {
      (currentResumableState = prevResumableState),
        (ReactSharedInternals.H = prevDispatcher),
        (ReactSharedInternals.A = prevAsyncDispatcher),
        prevDispatcher === HooksDispatcher && switchContext(prevContext),
        (currentRequest = prevRequest);
    }
  }
}
function preparePreambleFromSubtree(
  request,
  segment,
  collectedPreambleSegments
) {
  segment.preambleChildren.length &&
    collectedPreambleSegments.push(segment.preambleChildren);
  for (var pendingPreambles = !1, i = 0; i < segment.children.length; i++)
    pendingPreambles =
      preparePreambleFromSegment(
        request,
        segment.children[i],
        collectedPreambleSegments
      ) || pendingPreambles;
  return pendingPreambles;
}
function preparePreambleFromSegment(
  request,
  segment,
  collectedPreambleSegments
) {
  var boundary = segment.boundary;
  if (null === boundary)
    return preparePreambleFromSubtree(
      request,
      segment,
      collectedPreambleSegments
    );
  var preamble = boundary.contentPreamble,
    fallbackPreamble = boundary.fallbackPreamble;
  if (null === preamble || null === fallbackPreamble) return !1;
  switch (boundary.status) {
    case 1:
      hoistPreambleState(request.renderState, preamble);
      segment = boundary.completedSegments[0];
      if (!segment) throw Error(formatProdErrorMessage(391));
      return preparePreambleFromSubtree(
        request,
        segment,
        collectedPreambleSegments
      );
    case 5:
      if (null !== request.trackedPostpones) return !0;
    case 4:
      if (1 === segment.status)
        return (
          hoistPreambleState(request.renderState, fallbackPreamble),
          preparePreambleFromSubtree(
            request,
            segment,
            collectedPreambleSegments
          )
        );
    default:
      return !0;
  }
}
function preparePreamble(request) {
  if (
    request.completedRootSegment &&
    null === request.completedPreambleSegments
  ) {
    var collectedPreambleSegments = [],
      hasPendingPreambles = preparePreambleFromSegment(
        request,
        request.completedRootSegment,
        collectedPreambleSegments
      ),
      preamble = request.renderState.preamble;
    if (
      !1 === hasPendingPreambles ||
      (preamble.headChunks && preamble.bodyChunks)
    )
      request.completedPreambleSegments = collectedPreambleSegments;
  }
}
function flushSubtree(request, destination, segment, hoistableState) {
  segment.parentFlushed = !0;
  switch (segment.status) {
    case 0:
      segment.id = request.nextSegmentId++;
    case 5:
      return (
        (hoistableState = segment.id),
        (segment.lastPushedText = !1),
        (segment.textEmbedded = !1),
        (request = request.renderState),
        writeChunk(destination, placeholder1),
        writeChunk(destination, request.placeholderPrefix),
        (request = stringToChunk(hoistableState.toString(16))),
        writeChunk(destination, request),
        writeChunkAndReturn(destination, placeholder2)
      );
    case 1:
      segment.status = 2;
      var r = !0,
        chunks = segment.chunks,
        chunkIdx = 0;
      segment = segment.children;
      for (var childIdx = 0; childIdx < segment.length; childIdx++) {
        for (r = segment[childIdx]; chunkIdx < r.index; chunkIdx++)
          writeChunk(destination, chunks[chunkIdx]);
        r = flushSegment(request, destination, r, hoistableState);
      }
      for (; chunkIdx < chunks.length - 1; chunkIdx++)
        writeChunk(destination, chunks[chunkIdx]);
      chunkIdx < chunks.length &&
        (r = writeChunkAndReturn(destination, chunks[chunkIdx]));
      return r;
    default:
      throw Error(formatProdErrorMessage(390));
  }
}
function flushSegment(request, destination, segment, hoistableState) {
  var boundary = segment.boundary;
  if (null === boundary)
    return flushSubtree(request, destination, segment, hoistableState);
  boundary.parentFlushed = !0;
  if (4 === boundary.status) {
    var errorDigest = boundary.errorDigest;
    writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
    writeChunk(destination, clientRenderedSuspenseBoundaryError1);
    errorDigest &&
      (writeChunk(destination, clientRenderedSuspenseBoundaryError1A),
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest))),
      writeChunk(
        destination,
        clientRenderedSuspenseBoundaryErrorAttrInterstitial
      ));
    writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
    flushSubtree(request, destination, segment, hoistableState);
    (request = boundary.fallbackPreamble) &&
      writePreambleContribution(destination, request);
    return writeChunkAndReturn(destination, endSuspenseBoundary);
  }
  if (1 !== boundary.status)
    return (
      0 === boundary.status &&
        (boundary.rootSegmentID = request.nextSegmentId++),
      0 < boundary.completedSegments.length &&
        request.partialBoundaries.push(boundary),
      writeStartPendingSuspenseBoundary(
        destination,
        request.renderState,
        boundary.rootSegmentID
      ),
      hoistableState &&
        ((boundary = boundary.fallbackState),
        boundary.styles.forEach(hoistStyleQueueDependency, hoistableState),
        boundary.stylesheets.forEach(
          hoistStylesheetDependency,
          hoistableState
        )),
      flushSubtree(request, destination, segment, hoistableState),
      writeChunkAndReturn(destination, endSuspenseBoundary)
    );
  if (boundary.byteSize > request.progressiveChunkSize)
    return (
      (boundary.rootSegmentID = request.nextSegmentId++),
      request.completedBoundaries.push(boundary),
      writeStartPendingSuspenseBoundary(
        destination,
        request.renderState,
        boundary.rootSegmentID
      ),
      flushSubtree(request, destination, segment, hoistableState),
      writeChunkAndReturn(destination, endSuspenseBoundary)
    );
  hoistableState &&
    ((segment = boundary.contentState),
    segment.styles.forEach(hoistStyleQueueDependency, hoistableState),
    segment.stylesheets.forEach(hoistStylesheetDependency, hoistableState));
  writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
  segment = boundary.completedSegments;
  if (1 !== segment.length) throw Error(formatProdErrorMessage(391));
  flushSegment(request, destination, segment[0], hoistableState);
  (request = boundary.contentPreamble) &&
    writePreambleContribution(destination, request);
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function flushSegmentContainer(request, destination, segment, hoistableState) {
  writeStartSegment(
    destination,
    request.renderState,
    segment.parentFormatContext,
    segment.id
  );
  flushSegment(request, destination, segment, hoistableState);
  return writeEndSegment(destination, segment.parentFormatContext);
}
function flushCompletedBoundary(request, destination, boundary) {
  for (
    var completedSegments = boundary.completedSegments, i = 0;
    i < completedSegments.length;
    i++
  )
    flushPartiallyCompletedSegment(
      request,
      destination,
      boundary,
      completedSegments[i]
    );
  completedSegments.length = 0;
  writeHoistablesForBoundary(
    destination,
    boundary.contentState,
    request.renderState
  );
  completedSegments = request.resumableState;
  request = request.renderState;
  i = boundary.rootSegmentID;
  boundary = boundary.contentState;
  var requiresStyleInsertion = request.stylesToHoist;
  request.stylesToHoist = !1;
  writeChunk(destination, request.startInlineScript);
  requiresStyleInsertion
    ? 0 === (completedSegments.instructions & 2)
      ? ((completedSegments.instructions |= 10),
        writeChunk(destination, completeBoundaryWithStylesScript1FullBoth))
      : 0 === (completedSegments.instructions & 8)
        ? ((completedSegments.instructions |= 8),
          writeChunk(destination, completeBoundaryWithStylesScript1FullPartial))
        : writeChunk(destination, completeBoundaryWithStylesScript1Partial)
    : 0 === (completedSegments.instructions & 2)
      ? ((completedSegments.instructions |= 2),
        writeChunk(destination, completeBoundaryScript1Full))
      : writeChunk(destination, completeBoundaryScript1Partial);
  completedSegments = stringToChunk(i.toString(16));
  writeChunk(destination, request.boundaryPrefix);
  writeChunk(destination, completedSegments);
  writeChunk(destination, completeBoundaryScript2);
  writeChunk(destination, request.segmentPrefix);
  writeChunk(destination, completedSegments);
  requiresStyleInsertion
    ? (writeChunk(destination, completeBoundaryScript3a),
      writeStyleResourceDependenciesInJS(destination, boundary))
    : writeChunk(destination, completeBoundaryScript3b);
  boundary = writeChunkAndReturn(destination, completeBoundaryScriptEnd);
  return writeBootstrap(destination, request) && boundary;
}
function flushPartiallyCompletedSegment(
  request,
  destination,
  boundary,
  segment
) {
  if (2 === segment.status) return !0;
  var hoistableState = boundary.contentState,
    segmentID = segment.id;
  if (-1 === segmentID) {
    if (-1 === (segment.id = boundary.rootSegmentID))
      throw Error(formatProdErrorMessage(392));
    return flushSegmentContainer(request, destination, segment, hoistableState);
  }
  if (segmentID === boundary.rootSegmentID)
    return flushSegmentContainer(request, destination, segment, hoistableState);
  flushSegmentContainer(request, destination, segment, hoistableState);
  boundary = request.resumableState;
  request = request.renderState;
  writeChunk(destination, request.startInlineScript);
  0 === (boundary.instructions & 1)
    ? ((boundary.instructions |= 1),
      writeChunk(destination, completeSegmentScript1Full))
    : writeChunk(destination, completeSegmentScript1Partial);
  writeChunk(destination, request.segmentPrefix);
  segmentID = stringToChunk(segmentID.toString(16));
  writeChunk(destination, segmentID);
  writeChunk(destination, completeSegmentScript2);
  writeChunk(destination, request.placeholderPrefix);
  writeChunk(destination, segmentID);
  destination = writeChunkAndReturn(destination, completeSegmentScriptEnd);
  return destination;
}
function flushCompletedQueues(request, destination) {
  currentView = new Uint8Array(2048);
  writtenBytes = 0;
  try {
    if (!(0 < request.pendingRootTasks)) {
      var i,
        completedRootSegment = request.completedRootSegment;
      if (null !== completedRootSegment) {
        if (5 === completedRootSegment.status) return;
        var completedPreambleSegments = request.completedPreambleSegments;
        if (null === completedPreambleSegments) return;
        var renderState = request.renderState,
          preamble = renderState.preamble,
          htmlChunks = preamble.htmlChunks,
          headChunks = preamble.headChunks,
          i$jscomp$0;
        if (htmlChunks) {
          for (i$jscomp$0 = 0; i$jscomp$0 < htmlChunks.length; i$jscomp$0++)
            writeChunk(destination, htmlChunks[i$jscomp$0]);
          if (headChunks)
            for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
              writeChunk(destination, headChunks[i$jscomp$0]);
          else
            writeChunk(destination, startChunkForTag("head")),
              writeChunk(destination, endOfStartTag);
        } else if (headChunks)
          for (i$jscomp$0 = 0; i$jscomp$0 < headChunks.length; i$jscomp$0++)
            writeChunk(destination, headChunks[i$jscomp$0]);
        var charsetChunks = renderState.charsetChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < charsetChunks.length; i$jscomp$0++)
          writeChunk(destination, charsetChunks[i$jscomp$0]);
        charsetChunks.length = 0;
        renderState.preconnects.forEach(flushResource, destination);
        renderState.preconnects.clear();
        var viewportChunks = renderState.viewportChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < viewportChunks.length; i$jscomp$0++)
          writeChunk(destination, viewportChunks[i$jscomp$0]);
        viewportChunks.length = 0;
        renderState.fontPreloads.forEach(flushResource, destination);
        renderState.fontPreloads.clear();
        renderState.highImagePreloads.forEach(flushResource, destination);
        renderState.highImagePreloads.clear();
        renderState.styles.forEach(flushStylesInPreamble, destination);
        var importMapChunks = renderState.importMapChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < importMapChunks.length; i$jscomp$0++)
          writeChunk(destination, importMapChunks[i$jscomp$0]);
        importMapChunks.length = 0;
        renderState.bootstrapScripts.forEach(flushResource, destination);
        renderState.scripts.forEach(flushResource, destination);
        renderState.scripts.clear();
        renderState.bulkPreloads.forEach(flushResource, destination);
        renderState.bulkPreloads.clear();
        var hoistableChunks = renderState.hoistableChunks;
        for (i$jscomp$0 = 0; i$jscomp$0 < hoistableChunks.length; i$jscomp$0++)
          writeChunk(destination, hoistableChunks[i$jscomp$0]);
        for (
          renderState = hoistableChunks.length = 0;
          renderState < completedPreambleSegments.length;
          renderState++
        ) {
          var segments = completedPreambleSegments[renderState];
          for (preamble = 0; preamble < segments.length; preamble++)
            flushSegment(request, destination, segments[preamble], null);
        }
        var preamble$jscomp$0 = request.renderState.preamble,
          headChunks$jscomp$0 = preamble$jscomp$0.headChunks;
        (preamble$jscomp$0.htmlChunks || headChunks$jscomp$0) &&
          writeChunk(destination, endChunkForTag("head"));
        var bodyChunks = preamble$jscomp$0.bodyChunks;
        if (bodyChunks)
          for (
            completedPreambleSegments = 0;
            completedPreambleSegments < bodyChunks.length;
            completedPreambleSegments++
          )
            writeChunk(destination, bodyChunks[completedPreambleSegments]);
        flushSegment(request, destination, completedRootSegment, null);
        request.completedRootSegment = null;
        writeBootstrap(destination, request.renderState);
      }
      var renderState$jscomp$0 = request.renderState;
      completedRootSegment = 0;
      var viewportChunks$jscomp$0 = renderState$jscomp$0.viewportChunks;
      for (
        completedRootSegment = 0;
        completedRootSegment < viewportChunks$jscomp$0.length;
        completedRootSegment++
      )
        writeChunk(destination, viewportChunks$jscomp$0[completedRootSegment]);
      viewportChunks$jscomp$0.length = 0;
      renderState$jscomp$0.preconnects.forEach(flushResource, destination);
      renderState$jscomp$0.preconnects.clear();
      renderState$jscomp$0.fontPreloads.forEach(flushResource, destination);
      renderState$jscomp$0.fontPreloads.clear();
      renderState$jscomp$0.highImagePreloads.forEach(
        flushResource,
        destination
      );
      renderState$jscomp$0.highImagePreloads.clear();
      renderState$jscomp$0.styles.forEach(preloadLateStyles, destination);
      renderState$jscomp$0.scripts.forEach(flushResource, destination);
      renderState$jscomp$0.scripts.clear();
      renderState$jscomp$0.bulkPreloads.forEach(flushResource, destination);
      renderState$jscomp$0.bulkPreloads.clear();
      var hoistableChunks$jscomp$0 = renderState$jscomp$0.hoistableChunks;
      for (
        completedRootSegment = 0;
        completedRootSegment < hoistableChunks$jscomp$0.length;
        completedRootSegment++
      )
        writeChunk(destination, hoistableChunks$jscomp$0[completedRootSegment]);
      hoistableChunks$jscomp$0.length = 0;
      var clientRenderedBoundaries = request.clientRenderedBoundaries;
      for (i = 0; i < clientRenderedBoundaries.length; i++) {
        var boundary = clientRenderedBoundaries[i];
        renderState$jscomp$0 = destination;
        var resumableState = request.resumableState,
          renderState$jscomp$1 = request.renderState,
          id = boundary.rootSegmentID,
          errorDigest = boundary.errorDigest;
        writeChunk(
          renderState$jscomp$0,
          renderState$jscomp$1.startInlineScript
        );
        0 === (resumableState.instructions & 4)
          ? ((resumableState.instructions |= 4),
            writeChunk(renderState$jscomp$0, clientRenderScript1Full))
          : writeChunk(renderState$jscomp$0, clientRenderScript1Partial);
        writeChunk(renderState$jscomp$0, renderState$jscomp$1.boundaryPrefix);
        writeChunk(renderState$jscomp$0, stringToChunk(id.toString(16)));
        writeChunk(renderState$jscomp$0, clientRenderScript1A);
        errorDigest &&
          (writeChunk(
            renderState$jscomp$0,
            clientRenderErrorScriptArgInterstitial
          ),
          writeChunk(
            renderState$jscomp$0,
            stringToChunk(
              escapeJSStringsForInstructionScripts(errorDigest || "")
            )
          ));
        var JSCompiler_inline_result = writeChunkAndReturn(
          renderState$jscomp$0,
          clientRenderScriptEnd
        );
        if (!JSCompiler_inline_result) {
          request.destination = null;
          i++;
          clientRenderedBoundaries.splice(0, i);
          return;
        }
      }
      clientRenderedBoundaries.splice(0, i);
      var completedBoundaries = request.completedBoundaries;
      for (i = 0; i < completedBoundaries.length; i++)
        if (
          !flushCompletedBoundary(request, destination, completedBoundaries[i])
        ) {
          request.destination = null;
          i++;
          completedBoundaries.splice(0, i);
          return;
        }
      completedBoundaries.splice(0, i);
      completeWriting(destination);
      currentView = new Uint8Array(2048);
      writtenBytes = 0;
      var partialBoundaries = request.partialBoundaries;
      for (i = 0; i < partialBoundaries.length; i++) {
        var boundary$51 = partialBoundaries[i];
        a: {
          clientRenderedBoundaries = request;
          boundary = destination;
          var completedSegments = boundary$51.completedSegments;
          for (
            JSCompiler_inline_result = 0;
            JSCompiler_inline_result < completedSegments.length;
            JSCompiler_inline_result++
          )
            if (
              !flushPartiallyCompletedSegment(
                clientRenderedBoundaries,
                boundary,
                boundary$51,
                completedSegments[JSCompiler_inline_result]
              )
            ) {
              JSCompiler_inline_result++;
              completedSegments.splice(0, JSCompiler_inline_result);
              var JSCompiler_inline_result$jscomp$0 = !1;
              break a;
            }
          completedSegments.splice(0, JSCompiler_inline_result);
          JSCompiler_inline_result$jscomp$0 = writeHoistablesForBoundary(
            boundary,
            boundary$51.contentState,
            clientRenderedBoundaries.renderState
          );
        }
        if (!JSCompiler_inline_result$jscomp$0) {
          request.destination = null;
          i++;
          partialBoundaries.splice(0, i);
          return;
        }
      }
      partialBoundaries.splice(0, i);
      var largeBoundaries = request.completedBoundaries;
      for (i = 0; i < largeBoundaries.length; i++)
        if (!flushCompletedBoundary(request, destination, largeBoundaries[i])) {
          request.destination = null;
          i++;
          largeBoundaries.splice(0, i);
          return;
        }
      largeBoundaries.splice(0, i);
    }
  } finally {
    0 === request.allPendingTasks &&
    0 === request.pingedTasks.length &&
    0 === request.clientRenderedBoundaries.length &&
    0 === request.completedBoundaries.length
      ? ((request.flushScheduled = !1),
        (i = request.resumableState),
        i.hasBody && writeChunk(destination, endChunkForTag("body")),
        i.hasHtml && writeChunk(destination, endChunkForTag("html")),
        completeWriting(destination),
        (request.status = 14),
        destination.close(),
        (request.destination = null))
      : completeWriting(destination);
  }
}
function startWork(request) {
  request.flushScheduled = null !== request.destination;
  scheduleMicrotask(function () {
    return performWork(request);
  });
  scheduleWork(function () {
    10 === request.status && (request.status = 11);
    null === request.trackedPostpones &&
      safelyEmitEarlyPreloads(request, 0 === request.pendingRootTasks);
  });
}
function enqueueFlush(request) {
  !1 === request.flushScheduled &&
    0 === request.pingedTasks.length &&
    null !== request.destination &&
    ((request.flushScheduled = !0),
    scheduleWork(function () {
      var destination = request.destination;
      destination
        ? flushCompletedQueues(request, destination)
        : (request.flushScheduled = !1);
    }));
}
function startFlowing(request, destination) {
  if (13 === request.status)
    (request.status = 14), closeWithError(destination, request.fatalError);
  else if (14 !== request.status && null === request.destination) {
    request.destination = destination;
    try {
      flushCompletedQueues(request, destination);
    } catch (error) {
      logRecoverableError(request, error, {}), fatalError(request, error);
    }
  }
}
function abort(request, reason) {
  if (11 === request.status || 10 === request.status) request.status = 12;
  try {
    var abortableTasks = request.abortableTasks;
    if (0 < abortableTasks.size) {
      var error =
        void 0 === reason
          ? Error(formatProdErrorMessage(432))
          : "object" === typeof reason &&
              null !== reason &&
              "function" === typeof reason.then
            ? Error(formatProdErrorMessage(530))
            : reason;
      request.fatalError = error;
      abortableTasks.forEach(function (task) {
        return abortTask(task, request, error);
      });
      abortableTasks.clear();
    }
    null !== request.destination &&
      flushCompletedQueues(request, request.destination);
  } catch (error$53) {
    logRecoverableError(request, error$53, {}), fatalError(request, error$53);
  }
}
function ensureCorrectIsomorphicReactVersion() {
  var isomorphicReactPackageVersion = React.version;
  if ("19.1.0" !== isomorphicReactPackageVersion)
    throw Error(
      formatProdErrorMessage(
        527,
        isomorphicReactPackageVersion,
        "19.1.0"
      )
    );
}
ensureCorrectIsomorphicReactVersion();
ensureCorrectIsomorphicReactVersion();
exports.prerender = function (children, options) {
  return new Promise(function (resolve, reject) {
    var onHeaders = options ? options.onHeaders : void 0,
      onHeadersImpl;
    onHeaders &&
      (onHeadersImpl = function (headersDescriptor) {
        onHeaders(new Headers(headersDescriptor));
      });
    var resources = createResumableState(
        options ? options.identifierPrefix : void 0,
        options ? options.unstable_externalRuntimeSrc : void 0,
        options ? options.bootstrapScriptContent : void 0,
        options ? options.bootstrapScripts : void 0,
        options ? options.bootstrapModules : void 0
      ),
      request = createPrerenderRequest(
        children,
        resources,
        createRenderState(
          resources,
          void 0,
          options ? options.unstable_externalRuntimeSrc : void 0,
          options ? options.importMap : void 0,
          onHeadersImpl,
          options ? options.maxHeadersLength : void 0
        ),
        createRootFormatContext(options ? options.namespaceURI : void 0),
        options ? options.progressiveChunkSize : void 0,
        options ? options.onError : void 0,
        function () {
          var result = {
            prelude: new ReadableStream(
              {
                type: "bytes",
                pull: function (controller) {
                  startFlowing(request, controller);
                },
                cancel: function (reason) {
                  request.destination = null;
                  abort(request, reason);
                }
              },
              { highWaterMark: 0 }
            )
          };
          resolve(result);
        },
        void 0,
        void 0,
        reject,
        options ? options.onPostpone : void 0
      );
    if (options && options.signal) {
      var signal = options.signal;
      if (signal.aborted) abort(request, signal.reason);
      else {
        var listener = function () {
          abort(request, signal.reason);
          signal.removeEventListener("abort", listener);
        };
        signal.addEventListener("abort", listener);
      }
    }
    startWork(request);
  });
};
exports.renderToReadableStream = function (children, options) {
  return new Promise(function (resolve, reject) {
    var onFatalError,
      onAllReady,
      allReady = new Promise(function (res, rej) {
        onAllReady = res;
        onFatalError = rej;
      }),
      onHeaders = options ? options.onHeaders : void 0,
      onHeadersImpl;
    onHeaders &&
      (onHeadersImpl = function (headersDescriptor) {
        onHeaders(new Headers(headersDescriptor));
      });
    var resumableState = createResumableState(
        options ? options.identifierPrefix : void 0,
        options ? options.unstable_externalRuntimeSrc : void 0,
        options ? options.bootstrapScriptContent : void 0,
        options ? options.bootstrapScripts : void 0,
        options ? options.bootstrapModules : void 0
      ),
      request = createRequest(
        children,
        resumableState,
        createRenderState(
          resumableState,
          options ? options.nonce : void 0,
          options ? options.unstable_externalRuntimeSrc : void 0,
          options ? options.importMap : void 0,
          onHeadersImpl,
          options ? options.maxHeadersLength : void 0
        ),
        createRootFormatContext(options ? options.namespaceURI : void 0),
        options ? options.progressiveChunkSize : void 0,
        options ? options.onError : void 0,
        onAllReady,
        function () {
          var stream = new ReadableStream(
            {
              type: "bytes",
              pull: function (controller) {
                startFlowing(request, controller);
              },
              cancel: function (reason) {
                request.destination = null;
                abort(request, reason);
              }
            },
            { highWaterMark: 0 }
          );
          stream.allReady = allReady;
          resolve(stream);
        },
        function (error) {
          allReady.catch(function () {});
          reject(error);
        },
        onFatalError,
        options ? options.onPostpone : void 0,
        options ? options.formState : void 0
      );
    if (options && options.signal) {
      var signal = options.signal;
      if (signal.aborted) abort(request, signal.reason);
      else {
        var listener = function () {
          abort(request, signal.reason);
          signal.removeEventListener("abort", listener);
        };
        signal.addEventListener("abort", listener);
      }
    }
    startWork(request);
  });
};
exports.version = "19.1.0";


/***/ }),

/***/ 6221:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


var React = __webpack_require__(6540);
function formatProdErrorMessage(code) {
  var url = "https://react.dev/errors/" + code;
  if (1 < arguments.length) {
    url += "?args[]=" + encodeURIComponent(arguments[1]);
    for (var i = 2; i < arguments.length; i++)
      url += "&args[]=" + encodeURIComponent(arguments[i]);
  }
  return (
    "Minified React error #" +
    code +
    "; visit " +
    url +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
function noop() {}
var Internals = {
    d: {
      f: noop,
      r: function () {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  },
  REACT_PORTAL_TYPE = Symbol.for("react.portal");
function createPortal$1(children, containerInfo, implementation) {
  var key =
    3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key: null == key ? null : "" + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}
var ReactSharedInternals =
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function getCrossOriginStringAs(as, input) {
  if ("font" === as) return "";
  if ("string" === typeof input)
    return "use-credentials" === input ? input : "";
}
exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
  Internals;
exports.createPortal = function (children, container) {
  var key =
    2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
  if (
    !container ||
    (1 !== container.nodeType &&
      9 !== container.nodeType &&
      11 !== container.nodeType)
  )
    throw Error(formatProdErrorMessage(299));
  return createPortal$1(children, container, null, key);
};
exports.flushSync = function (fn) {
  var previousTransition = ReactSharedInternals.T,
    previousUpdatePriority = Internals.p;
  try {
    if (((ReactSharedInternals.T = null), (Internals.p = 2), fn)) return fn();
  } finally {
    (ReactSharedInternals.T = previousTransition),
      (Internals.p = previousUpdatePriority),
      Internals.d.f();
  }
};
exports.preconnect = function (href, options) {
  "string" === typeof href &&
    (options
      ? ((options = options.crossOrigin),
        (options =
          "string" === typeof options
            ? "use-credentials" === options
              ? options
              : ""
            : void 0))
      : (options = null),
    Internals.d.C(href, options));
};
exports.prefetchDNS = function (href) {
  "string" === typeof href && Internals.d.D(href);
};
exports.preinit = function (href, options) {
  if ("string" === typeof href && options && "string" === typeof options.as) {
    var as = options.as,
      crossOrigin = getCrossOriginStringAs(as, options.crossOrigin),
      integrity =
        "string" === typeof options.integrity ? options.integrity : void 0,
      fetchPriority =
        "string" === typeof options.fetchPriority
          ? options.fetchPriority
          : void 0;
    "style" === as
      ? Internals.d.S(
          href,
          "string" === typeof options.precedence ? options.precedence : void 0,
          {
            crossOrigin: crossOrigin,
            integrity: integrity,
            fetchPriority: fetchPriority
          }
        )
      : "script" === as &&
        Internals.d.X(href, {
          crossOrigin: crossOrigin,
          integrity: integrity,
          fetchPriority: fetchPriority,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
  }
};
exports.preinitModule = function (href, options) {
  if ("string" === typeof href)
    if ("object" === typeof options && null !== options) {
      if (null == options.as || "script" === options.as) {
        var crossOrigin = getCrossOriginStringAs(
          options.as,
          options.crossOrigin
        );
        Internals.d.M(href, {
          crossOrigin: crossOrigin,
          integrity:
            "string" === typeof options.integrity ? options.integrity : void 0,
          nonce: "string" === typeof options.nonce ? options.nonce : void 0
        });
      }
    } else null == options && Internals.d.M(href);
};
exports.preload = function (href, options) {
  if (
    "string" === typeof href &&
    "object" === typeof options &&
    null !== options &&
    "string" === typeof options.as
  ) {
    var as = options.as,
      crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
    Internals.d.L(href, as, {
      crossOrigin: crossOrigin,
      integrity:
        "string" === typeof options.integrity ? options.integrity : void 0,
      nonce: "string" === typeof options.nonce ? options.nonce : void 0,
      type: "string" === typeof options.type ? options.type : void 0,
      fetchPriority:
        "string" === typeof options.fetchPriority
          ? options.fetchPriority
          : void 0,
      referrerPolicy:
        "string" === typeof options.referrerPolicy
          ? options.referrerPolicy
          : void 0,
      imageSrcSet:
        "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
      imageSizes:
        "string" === typeof options.imageSizes ? options.imageSizes : void 0,
      media: "string" === typeof options.media ? options.media : void 0
    });
  }
};
exports.preloadModule = function (href, options) {
  if ("string" === typeof href)
    if (options) {
      var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
      Internals.d.m(href, {
        as:
          "string" === typeof options.as && "script" !== options.as
            ? options.as
            : void 0,
        crossOrigin: crossOrigin,
        integrity:
          "string" === typeof options.integrity ? options.integrity : void 0
      });
    } else Internals.d.m(href);
};
exports.requestFormReset = function (form) {
  Internals.d.r(form);
};
exports.unstable_batchedUpdates = function (fn, a) {
  return fn(a);
};
exports.useFormState = function (action, initialState, permalink) {
  return ReactSharedInternals.H.useFormState(action, initialState, permalink);
};
exports.useFormStatus = function () {
  return ReactSharedInternals.H.useHostTransitionStatus();
};
exports.version = "19.1.0";


/***/ }),

/***/ 961:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function checkDCE() {
  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  if (
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }
  if (false) {}
  try {
    // Verify that the code above has been dead code eliminated (DCE'd).
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    // DevTools shouldn't crash React, no matter what.
    // We should still report in case we break this code.
    console.error(err);
  }
}

if (true) {
  // DCE check should happen before ReactDOM bundle executes so that
  // DevTools can report bad minification during injection.
  checkDCE();
  module.exports = __webpack_require__(6221);
} else {}


/***/ }),

/***/ 5848:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var l, s;
if (true) {
  l = __webpack_require__(6047);
  s = __webpack_require__(7909);
} else {}

exports.version = l.version;
exports.renderToString = l.renderToString;
exports.renderToStaticMarkup = l.renderToStaticMarkup;
exports.renderToReadableStream = s.renderToReadableStream;
if (s.resume) {
  exports.resume = s.resume;
}


/***/ }),

/***/ 9869:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
  REACT_PORTAL_TYPE = Symbol.for("react.portal"),
  REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
  REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
  REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
  REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
  REACT_CONTEXT_TYPE = Symbol.for("react.context"),
  REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
  REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
  REACT_MEMO_TYPE = Symbol.for("react.memo"),
  REACT_LAZY_TYPE = Symbol.for("react.lazy"),
  MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
function getIteratorFn(maybeIterable) {
  if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
  maybeIterable =
    (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable["@@iterator"];
  return "function" === typeof maybeIterable ? maybeIterable : null;
}
var ReactNoopUpdateQueue = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {}
  },
  assign = Object.assign,
  emptyObject = {};
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};
Component.prototype.setState = function (partialState, callback) {
  if (
    "object" !== typeof partialState &&
    "function" !== typeof partialState &&
    null != partialState
  )
    throw Error(
      "takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, partialState, callback, "setState");
};
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
};
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = !0;
var isArrayImpl = Array.isArray,
  ReactSharedInternals = { H: null, A: null, T: null, S: null, V: null },
  hasOwnProperty = Object.prototype.hasOwnProperty;
function ReactElement(type, key, self, source, owner, props) {
  self = props.ref;
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: void 0 !== self ? self : null,
    props: props
  };
}
function cloneAndReplaceKey(oldElement, newKey) {
  return ReactElement(
    oldElement.type,
    newKey,
    void 0,
    void 0,
    void 0,
    oldElement.props
  );
}
function isValidElement(object) {
  return (
    "object" === typeof object &&
    null !== object &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
function escape(key) {
  var escaperLookup = { "=": "=0", ":": "=2" };
  return (
    "$" +
    key.replace(/[=:]/g, function (match) {
      return escaperLookup[match];
    })
  );
}
var userProvidedKeyEscapeRegex = /\/+/g;
function getElementKey(element, index) {
  return "object" === typeof element && null !== element && null != element.key
    ? escape("" + element.key)
    : index.toString(36);
}
function noop$1() {}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case "fulfilled":
      return thenable.value;
    case "rejected":
      throw thenable.reason;
    default:
      switch (
        ("string" === typeof thenable.status
          ? thenable.then(noop$1, noop$1)
          : ((thenable.status = "pending"),
            thenable.then(
              function (fulfilledValue) {
                "pending" === thenable.status &&
                  ((thenable.status = "fulfilled"),
                  (thenable.value = fulfilledValue));
              },
              function (error) {
                "pending" === thenable.status &&
                  ((thenable.status = "rejected"), (thenable.reason = error));
              }
            )),
        thenable.status)
      ) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if ("undefined" === type || "boolean" === type) children = null;
  var invokeCallback = !1;
  if (null === children) invokeCallback = !0;
  else
    switch (type) {
      case "bigint":
      case "string":
      case "number":
        invokeCallback = !0;
        break;
      case "object":
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = !0;
            break;
          case REACT_LAZY_TYPE:
            return (
              (invokeCallback = children._init),
              mapIntoArray(
                invokeCallback(children._payload),
                array,
                escapedPrefix,
                nameSoFar,
                callback
              )
            );
        }
    }
  if (invokeCallback)
    return (
      (callback = callback(children)),
      (invokeCallback =
        "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar),
      isArrayImpl(callback)
        ? ((escapedPrefix = ""),
          null != invokeCallback &&
            (escapedPrefix =
              invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"),
          mapIntoArray(callback, array, escapedPrefix, "", function (c) {
            return c;
          }))
        : null != callback &&
          (isValidElement(callback) &&
            (callback = cloneAndReplaceKey(
              callback,
              escapedPrefix +
                (null == callback.key ||
                (children && children.key === callback.key)
                  ? ""
                  : ("" + callback.key).replace(
                      userProvidedKeyEscapeRegex,
                      "$&/"
                    ) + "/") +
                invokeCallback
            )),
          array.push(callback)),
      1
    );
  invokeCallback = 0;
  var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
  if (isArrayImpl(children))
    for (var i = 0; i < children.length; i++)
      (nameSoFar = children[i]),
        (type = nextNamePrefix + getElementKey(nameSoFar, i)),
        (invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        ));
  else if (((i = getIteratorFn(children)), "function" === typeof i))
    for (
      children = i.call(children), i = 0;
      !(nameSoFar = children.next()).done;

    )
      (nameSoFar = nameSoFar.value),
        (type = nextNamePrefix + getElementKey(nameSoFar, i++)),
        (invokeCallback += mapIntoArray(
          nameSoFar,
          array,
          escapedPrefix,
          type,
          callback
        ));
  else if ("object" === type) {
    if ("function" === typeof children.then)
      return mapIntoArray(
        resolveThenable(children),
        array,
        escapedPrefix,
        nameSoFar,
        callback
      );
    array = String(children);
    throw Error(
      "Objects are not valid as a React child (found: " +
        ("[object Object]" === array
          ? "object with keys {" + Object.keys(children).join(", ") + "}"
          : array) +
        "). If you meant to render a collection of children, use an array instead."
    );
  }
  return invokeCallback;
}
function mapChildren(children, func, context) {
  if (null == children) return children;
  var result = [],
    count = 0;
  mapIntoArray(children, result, "", "", function (child) {
    return func.call(context, child, count++);
  });
  return result;
}
function lazyInitializer(payload) {
  if (-1 === payload._status) {
    var ctor = payload._result;
    ctor = ctor();
    ctor.then(
      function (moduleObject) {
        if (0 === payload._status || -1 === payload._status)
          (payload._status = 1), (payload._result = moduleObject);
      },
      function (error) {
        if (0 === payload._status || -1 === payload._status)
          (payload._status = 2), (payload._result = error);
      }
    );
    -1 === payload._status && ((payload._status = 0), (payload._result = ctor));
  }
  if (1 === payload._status) return payload._result.default;
  throw payload._result;
}
var reportGlobalError =
  "function" === typeof reportError
    ? reportError
    : function (error) {
        if (
          "object" === typeof window &&
          "function" === typeof window.ErrorEvent
        ) {
          var event = new window.ErrorEvent("error", {
            bubbles: !0,
            cancelable: !0,
            message:
              "object" === typeof error &&
              null !== error &&
              "string" === typeof error.message
                ? String(error.message)
                : String(error),
            error: error
          });
          if (!window.dispatchEvent(event)) return;
        } else if (
          "object" === typeof process &&
          "function" === typeof process.emit
        ) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      };
function noop() {}
exports.Children = {
  map: mapChildren,
  forEach: function (children, forEachFunc, forEachContext) {
    mapChildren(
      children,
      function () {
        forEachFunc.apply(this, arguments);
      },
      forEachContext
    );
  },
  count: function (children) {
    var n = 0;
    mapChildren(children, function () {
      n++;
    });
    return n;
  },
  toArray: function (children) {
    return (
      mapChildren(children, function (child) {
        return child;
      }) || []
    );
  },
  only: function (children) {
    if (!isValidElement(children))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return children;
  }
};
exports.Component = Component;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.PureComponent = PureComponent;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
  ReactSharedInternals;
exports.__COMPILER_RUNTIME = {
  __proto__: null,
  c: function (size) {
    return ReactSharedInternals.H.useMemoCache(size);
  }
};
exports.cache = function (fn) {
  return function () {
    return fn.apply(null, arguments);
  };
};
exports.cloneElement = function (element, config, children) {
  if (null === element || void 0 === element)
    throw Error(
      "The argument must be a React element, but you passed " + element + "."
    );
  var props = assign({}, element.props),
    key = element.key,
    owner = void 0;
  if (null != config)
    for (propName in (void 0 !== config.ref && (owner = void 0),
    void 0 !== config.key && (key = "" + config.key),
    config))
      !hasOwnProperty.call(config, propName) ||
        "key" === propName ||
        "__self" === propName ||
        "__source" === propName ||
        ("ref" === propName && void 0 === config.ref) ||
        (props[propName] = config[propName]);
  var propName = arguments.length - 2;
  if (1 === propName) props.children = children;
  else if (1 < propName) {
    for (var childArray = Array(propName), i = 0; i < propName; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  return ReactElement(element.type, key, void 0, void 0, owner, props);
};
exports.createContext = function (defaultValue) {
  defaultValue = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: null,
    Consumer: null
  };
  defaultValue.Provider = defaultValue;
  defaultValue.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE,
    _context: defaultValue
  };
  return defaultValue;
};
exports.createElement = function (type, config, children) {
  var propName,
    props = {},
    key = null;
  if (null != config)
    for (propName in (void 0 !== config.key && (key = "" + config.key), config))
      hasOwnProperty.call(config, propName) &&
        "key" !== propName &&
        "__self" !== propName &&
        "__source" !== propName &&
        (props[propName] = config[propName]);
  var childrenLength = arguments.length - 2;
  if (1 === childrenLength) props.children = children;
  else if (1 < childrenLength) {
    for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
      childArray[i] = arguments[i + 2];
    props.children = childArray;
  }
  if (type && type.defaultProps)
    for (propName in ((childrenLength = type.defaultProps), childrenLength))
      void 0 === props[propName] &&
        (props[propName] = childrenLength[propName]);
  return ReactElement(type, key, void 0, void 0, null, props);
};
exports.createRef = function () {
  return { current: null };
};
exports.forwardRef = function (render) {
  return { $$typeof: REACT_FORWARD_REF_TYPE, render: render };
};
exports.isValidElement = isValidElement;
exports.lazy = function (ctor) {
  return {
    $$typeof: REACT_LAZY_TYPE,
    _payload: { _status: -1, _result: ctor },
    _init: lazyInitializer
  };
};
exports.memo = function (type, compare) {
  return {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: void 0 === compare ? null : compare
  };
};
exports.startTransition = function (scope) {
  var prevTransition = ReactSharedInternals.T,
    currentTransition = {};
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope(),
      onStartTransitionFinish = ReactSharedInternals.S;
    null !== onStartTransitionFinish &&
      onStartTransitionFinish(currentTransition, returnValue);
    "object" === typeof returnValue &&
      null !== returnValue &&
      "function" === typeof returnValue.then &&
      returnValue.then(noop, reportGlobalError);
  } catch (error) {
    reportGlobalError(error);
  } finally {
    ReactSharedInternals.T = prevTransition;
  }
};
exports.unstable_useCacheRefresh = function () {
  return ReactSharedInternals.H.useCacheRefresh();
};
exports.use = function (usable) {
  return ReactSharedInternals.H.use(usable);
};
exports.useActionState = function (action, initialState, permalink) {
  return ReactSharedInternals.H.useActionState(action, initialState, permalink);
};
exports.useCallback = function (callback, deps) {
  return ReactSharedInternals.H.useCallback(callback, deps);
};
exports.useContext = function (Context) {
  return ReactSharedInternals.H.useContext(Context);
};
exports.useDebugValue = function () {};
exports.useDeferredValue = function (value, initialValue) {
  return ReactSharedInternals.H.useDeferredValue(value, initialValue);
};
exports.useEffect = function (create, createDeps, update) {
  var dispatcher = ReactSharedInternals.H;
  if ("function" === typeof update)
    throw Error(
      "useEffect CRUD overload is not enabled in this build of React."
    );
  return dispatcher.useEffect(create, createDeps);
};
exports.useId = function () {
  return ReactSharedInternals.H.useId();
};
exports.useImperativeHandle = function (ref, create, deps) {
  return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
};
exports.useInsertionEffect = function (create, deps) {
  return ReactSharedInternals.H.useInsertionEffect(create, deps);
};
exports.useLayoutEffect = function (create, deps) {
  return ReactSharedInternals.H.useLayoutEffect(create, deps);
};
exports.useMemo = function (create, deps) {
  return ReactSharedInternals.H.useMemo(create, deps);
};
exports.useOptimistic = function (passthrough, reducer) {
  return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
};
exports.useReducer = function (reducer, initialArg, init) {
  return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
};
exports.useRef = function (initialValue) {
  return ReactSharedInternals.H.useRef(initialValue);
};
exports.useState = function (initialState) {
  return ReactSharedInternals.H.useState(initialState);
};
exports.useSyncExternalStore = function (
  subscribe,
  getSnapshot,
  getServerSnapshot
) {
  return ReactSharedInternals.H.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
};
exports.useTransition = function () {
  return ReactSharedInternals.H.useTransition();
};
exports.version = "19.1.0";


/***/ }),

/***/ 6540:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (true) {
  module.exports = __webpack_require__(9869);
} else {}


/***/ }),

/***/ 6104:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5072);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7825);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7659);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5056);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(540);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1113);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(629);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());
options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_index_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, options);




       /* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_index_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_index_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_node_modules_postcss_loader_dist_cjs_js_ruleSet_1_rules_3_use_3_index_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals : undefined);


/***/ }),

/***/ 5072:
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 7659:
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 540:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 5056:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 7825:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 1113:
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 334:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "fonts/Helvetica..ttf";

/***/ }),

/***/ 6942:
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (arg) {
				classes = appendClass(classes, parseValue(arg));
			}
		}

		return classes;
	}

	function parseValue (arg) {
		if (typeof arg === 'string' || typeof arg === 'number') {
			return arg;
		}

		if (typeof arg !== 'object') {
			return '';
		}

		if (Array.isArray(arg)) {
			return classNames.apply(null, arg);
		}

		if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
			return arg.toString();
		}

		var classes = '';

		for (var key in arg) {
			if (hasOwn.call(arg, key) && arg[key]) {
				classes = appendClass(classes, key);
			}
		}

		return classes;
	}

	function appendClass (value, newClass) {
		if (!newClass) {
			return value;
		}
	
		if (value) {
			return value + ' ' + newClass;
		}
	
		return value + newClass;
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			953: 0,
/******/ 			531: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// UNUSED EXPORTS: menubar

;// ./src/js/menubar-data.js
var homeURL = 'http://localhost:8080/';
// const homeURL = 'http://annkomkova.github.io/static-site-09-24/'

var menu = [{
  text: 'All Times',
  url: 'index.html'
}, {
  text: 'Статьи',
  url: 'articles.html'
}, {
  text: 'Рефлексия',
  url: 'reflection.html'
}, {
  text: 'О нас',
  url: 'aboutUs.html'
}];
var props = {
  prerender: true,
  homeURL: homeURL,
  menu: menu
};


///////////////////////////////
;// ./src/js/menubar.js

var menubar_React = __webpack_require__(6540);
var ReactDOMServer = __webpack_require__(5848);
var S_MenuBar = (__webpack_require__(1372)/* ["default"] */ .A);
var menubar = ReactDOMServer.renderToString(menubar_React.createElement(S_MenuBar, props));


////////////////////////////////
})();

/******/ })()
;