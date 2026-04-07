var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentQuery, _currentQueryInitialState, _currentResult, _currentResultState, _currentResultOptions, _currentThenable, _selectError, _selectFn, _selectResult, _lastQueryWithDefinedData, _staleTimeoutId, _refetchIntervalId, _currentRefetchInterval, _trackedProps, _QueryObserver_instances, executeFetch_fn, updateStaleTimeout_fn, computeRefetchInterval_fn, updateRefetchInterval_fn, updateTimers_fn, clearStaleTimeout_fn, clearRefetchInterval_fn, updateQuery_fn, notify_fn, _a, _client2, _currentResult2, _currentMutation, _mutateOptions, _MutationObserver_instances, updateResult_fn, notify_fn2, _b;
import { D as ProtocolError, T as TimeoutWaitingForResponseErrorCode, E as utf8ToBytes, F as ExternalError, G as MissingRootKeyErrorCode, H as Certificate, I as lookupResultToBuffer, J as RequestStatusResponseStatus, U as UnknownError, K as RequestStatusDoneNoReplyErrorCode, N as RejectError, O as CertifiedRejectErrorCode, Q as UNREACHABLE_ERROR, V as InputError, W as InvalidReadStateRequestErrorCode, X as ReadRequestType, Y as Principal, _ as IDL, $ as MissingCanisterIdErrorCode, a0 as HttpAgent, a1 as encode, a2 as QueryResponseStatus, a3 as UncertifiedRejectErrorCode, a4 as isV3ResponseBody, a5 as isV2ResponseBody, a6 as UncertifiedRejectUpdateErrorCode, a7 as UnexpectedErrorCode, a8 as decode, a9 as Subscribable, aa as pendingThenable, ab as resolveEnabled, ac as shallowEqualObjects, ad as resolveStaleTime, ae as noop, af as environmentManager, ag as isValidTimeout, ah as timeUntilStale, ai as timeoutManager, aj as focusManager, ak as fetchState, al as replaceData, am as notifyManager, an as hashKey, ao as getDefaultState, r as reactExports, ap as shouldThrowError, aq as useQueryClient, ar as useInternetIdentity, as as createActorWithConfig, at as Variant, au as Record, av as Opt, aw as Vec, ax as Service, ay as Func, az as Nat, aA as Text, aB as Null, aC as Bool, aD as Int, aE as Principal$1, aF as Float64, aG as Nat8, u as ue } from "./index-aguMEkBW.js";
const FIVE_MINUTES_IN_MSEC = 5 * 60 * 1e3;
function defaultStrategy() {
  return chain(conditionalDelay(once(), 1e3), backoff(1e3, 1.2), timeout(FIVE_MINUTES_IN_MSEC));
}
function once() {
  let first = true;
  return async () => {
    if (first) {
      first = false;
      return true;
    }
    return false;
  };
}
function conditionalDelay(condition, timeInMsec) {
  return async (canisterId, requestId, status) => {
    if (await condition(canisterId, requestId, status)) {
      return new Promise((resolve) => setTimeout(resolve, timeInMsec));
    }
  };
}
function timeout(timeInMsec) {
  const end = Date.now() + timeInMsec;
  return async (_canisterId, requestId, status) => {
    if (Date.now() > end) {
      throw ProtocolError.fromCode(new TimeoutWaitingForResponseErrorCode(`Request timed out after ${timeInMsec} msec`, requestId, status));
    }
  };
}
function backoff(startingThrottleInMsec, backoffFactor) {
  let currentThrottling = startingThrottleInMsec;
  return () => new Promise((resolve) => setTimeout(() => {
    currentThrottling *= backoffFactor;
    resolve();
  }, currentThrottling));
}
function chain(...strategies) {
  return async (canisterId, requestId, status) => {
    for (const a of strategies) {
      await a(canisterId, requestId, status);
    }
  };
}
const DEFAULT_POLLING_OPTIONS = {
  preSignReadStateRequest: false
};
function hasProperty(value, property) {
  return Object.prototype.hasOwnProperty.call(value, property);
}
function isObjectWithProperty(value, property) {
  return value !== null && typeof value === "object" && hasProperty(value, property);
}
function hasFunction(value, property) {
  return hasProperty(value, property) && typeof value[property] === "function";
}
function isSignedReadStateRequestWithExpiry(value) {
  return isObjectWithProperty(value, "body") && isObjectWithProperty(value.body, "content") && value.body.content.request_type === ReadRequestType.ReadState && isObjectWithProperty(value.body.content, "ingress_expiry") && typeof value.body.content.ingress_expiry === "object" && value.body.content.ingress_expiry !== null && hasFunction(value.body.content.ingress_expiry, "toHash");
}
async function pollForResponse(agent, canisterId, requestId, options = {}) {
  const path = [utf8ToBytes("request_status"), requestId];
  let state;
  let currentRequest;
  const preSignReadStateRequest = options.preSignReadStateRequest ?? false;
  if (preSignReadStateRequest) {
    currentRequest = await constructRequest({
      paths: [path],
      agent,
      pollingOptions: options
    });
    state = await agent.readState(canisterId, { paths: [path] }, void 0, currentRequest);
  } else {
    state = await agent.readState(canisterId, { paths: [path] });
  }
  if (agent.rootKey == null) {
    throw ExternalError.fromCode(new MissingRootKeyErrorCode());
  }
  const cert = await Certificate.create({
    certificate: state.certificate,
    rootKey: agent.rootKey,
    canisterId,
    blsVerify: options.blsVerify,
    agent
  });
  const maybeBuf = lookupResultToBuffer(cert.lookup_path([...path, utf8ToBytes("status")]));
  let status;
  if (typeof maybeBuf === "undefined") {
    status = RequestStatusResponseStatus.Unknown;
  } else {
    status = new TextDecoder().decode(maybeBuf);
  }
  switch (status) {
    case RequestStatusResponseStatus.Replied: {
      return {
        reply: lookupResultToBuffer(cert.lookup_path([...path, "reply"])),
        certificate: cert
      };
    }
    case RequestStatusResponseStatus.Received:
    case RequestStatusResponseStatus.Unknown:
    case RequestStatusResponseStatus.Processing: {
      const strategy = options.strategy ?? defaultStrategy();
      await strategy(canisterId, requestId, status);
      return pollForResponse(agent, canisterId, requestId, {
        ...options,
        // Pass over either the strategy already provided or the new one created above
        strategy,
        request: currentRequest
      });
    }
    case RequestStatusResponseStatus.Rejected: {
      const rejectCode = new Uint8Array(lookupResultToBuffer(cert.lookup_path([...path, "reject_code"])))[0];
      const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(cert.lookup_path([...path, "reject_message"])));
      const errorCodeBuf = lookupResultToBuffer(cert.lookup_path([...path, "error_code"]));
      const errorCode = errorCodeBuf ? new TextDecoder().decode(errorCodeBuf) : void 0;
      throw RejectError.fromCode(new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, errorCode));
    }
    case RequestStatusResponseStatus.Done:
      throw UnknownError.fromCode(new RequestStatusDoneNoReplyErrorCode(requestId));
  }
  throw UNREACHABLE_ERROR;
}
async function constructRequest(options) {
  var _a2;
  const { paths, agent, pollingOptions } = options;
  if (pollingOptions.request && isSignedReadStateRequestWithExpiry(pollingOptions.request)) {
    return pollingOptions.request;
  }
  const request = await ((_a2 = agent.createReadStateRequest) == null ? void 0 : _a2.call(agent, {
    paths
  }, void 0));
  if (!isSignedReadStateRequestWithExpiry(request)) {
    throw InputError.fromCode(new InvalidReadStateRequestErrorCode(request));
  }
  return request;
}
const metadataSymbol = Symbol.for("ic-agent-metadata");
class Actor {
  /**
   * Get the Agent class this Actor would call, or undefined if the Actor would use
   * the default agent (global.ic.agent).
   * @param actor The actor to get the agent of.
   */
  static agentOf(actor) {
    return actor[metadataSymbol].config.agent;
  }
  /**
   * Get the interface of an actor, in the form of an instance of a Service.
   * @param actor The actor to get the interface of.
   */
  static interfaceOf(actor) {
    return actor[metadataSymbol].service;
  }
  static canisterIdOf(actor) {
    return Principal.from(actor[metadataSymbol].config.canisterId);
  }
  static createActorClass(interfaceFactory, options) {
    const service = interfaceFactory({ IDL });
    class CanisterActor extends Actor {
      constructor(config) {
        if (!config.canisterId) {
          throw InputError.fromCode(new MissingCanisterIdErrorCode(config.canisterId));
        }
        const canisterId = typeof config.canisterId === "string" ? Principal.fromText(config.canisterId) : config.canisterId;
        super({
          config: {
            ...DEFAULT_ACTOR_CONFIG,
            ...config,
            canisterId
          },
          service
        });
        for (const [methodName, func] of service._fields) {
          if (options == null ? void 0 : options.httpDetails) {
            func.annotations.push(ACTOR_METHOD_WITH_HTTP_DETAILS);
          }
          if (options == null ? void 0 : options.certificate) {
            func.annotations.push(ACTOR_METHOD_WITH_CERTIFICATE);
          }
          this[methodName] = _createActorMethod(this, methodName, func, config.blsVerify);
        }
      }
    }
    return CanisterActor;
  }
  /**
   * Creates an actor with the given interface factory and configuration.
   *
   * The [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package can be used to generate the interface factory for your canister.
   * @param interfaceFactory - the interface factory for the actor, typically generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package
   * @param configuration - the configuration for the actor
   * @returns an actor with the given interface factory and configuration
   * @example
   * Using the interface factory generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { Actor, HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { idlFactory } from './api/declarations/hello-world.did';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = Actor.createActor(idlFactory, {
   *   agent,
   *   canisterId,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   * @example
   * Using the `createActor` wrapper function generated by the [`@icp-sdk/bindgen`](https://js.icp.build/bindgen/) package:
   * ```ts
   * import { HttpAgent } from '@icp-sdk/core/agent';
   * import { Principal } from '@icp-sdk/core/principal';
   * import { createActor } from './api/hello-world';
   *
   * const canisterId = Principal.fromText('rrkah-fqaaa-aaaaa-aaaaq-cai');
   *
   * const agent = await HttpAgent.create({
   *   host: 'https://icp-api.io',
   * });
   *
   * const actor = createActor(canisterId, {
   *   agent,
   * });
   *
   * const response = await actor.greet('world');
   * console.log(response);
   * ```
   */
  static createActor(interfaceFactory, configuration) {
    if (!configuration.canisterId) {
      throw InputError.fromCode(new MissingCanisterIdErrorCode(configuration.canisterId));
    }
    return new (this.createActorClass(interfaceFactory))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @deprecated - use createActor with actorClassOptions instead
   */
  static createActorWithHttpDetails(interfaceFactory, configuration) {
    return new (this.createActorClass(interfaceFactory, { httpDetails: true }))(configuration);
  }
  /**
   * Returns an actor with methods that return the http response details along with the result
   * @param interfaceFactory - the interface factory for the actor
   * @param configuration - the configuration for the actor
   * @param actorClassOptions - options for the actor class extended details to return with the result
   */
  static createActorWithExtendedDetails(interfaceFactory, configuration, actorClassOptions = {
    httpDetails: true,
    certificate: true
  }) {
    return new (this.createActorClass(interfaceFactory, actorClassOptions))(configuration);
  }
  constructor(metadata) {
    this[metadataSymbol] = Object.freeze(metadata);
  }
}
function decodeReturnValue(types, msg) {
  const returnValues = decode(types, msg);
  switch (returnValues.length) {
    case 0:
      return void 0;
    case 1:
      return returnValues[0];
    default:
      return returnValues;
  }
}
const DEFAULT_ACTOR_CONFIG = {
  pollingOptions: DEFAULT_POLLING_OPTIONS
};
const ACTOR_METHOD_WITH_HTTP_DETAILS = "http-details";
const ACTOR_METHOD_WITH_CERTIFICATE = "certificate";
function _createActorMethod(actor, methodName, func, blsVerify) {
  let caller;
  if (func.annotations.includes("query") || func.annotations.includes("composite_query")) {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = {
        ...options,
        ...(_b2 = (_a2 = actor[metadataSymbol].config).queryTransform) == null ? void 0 : _b2.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || new HttpAgent();
      const cid = Principal.from(options.canisterId || actor[metadataSymbol].config.canisterId);
      const arg = encode(func.argTypes, args);
      const result = await agent.query(cid, {
        methodName,
        arg,
        effectiveCanisterId: options.effectiveCanisterId
      });
      const httpDetails = {
        ...result.httpDetails,
        requestDetails: result.requestDetails
      };
      switch (result.status) {
        case QueryResponseStatus.Rejected: {
          const uncertifiedRejectErrorCode = new UncertifiedRejectErrorCode(result.requestId, result.reject_code, result.reject_message, result.error_code, result.signatures);
          uncertifiedRejectErrorCode.callContext = {
            canisterId: cid,
            methodName,
            httpDetails
          };
          throw RejectError.fromCode(uncertifiedRejectErrorCode);
        }
        case QueryResponseStatus.Replied:
          return func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS) ? {
            httpDetails,
            result: decodeReturnValue(func.retTypes, result.reply.arg)
          } : decodeReturnValue(func.retTypes, result.reply.arg);
      }
    };
  } else {
    caller = async (options, ...args) => {
      var _a2, _b2;
      options = {
        ...options,
        ...(_b2 = (_a2 = actor[metadataSymbol].config).callTransform) == null ? void 0 : _b2.call(_a2, methodName, args, {
          ...actor[metadataSymbol].config,
          ...options
        })
      };
      const agent = options.agent || actor[metadataSymbol].config.agent || HttpAgent.createSync();
      const { canisterId, effectiveCanisterId, pollingOptions } = {
        ...DEFAULT_ACTOR_CONFIG,
        ...actor[metadataSymbol].config,
        ...options
      };
      const cid = Principal.from(canisterId);
      const ecid = effectiveCanisterId !== void 0 ? Principal.from(effectiveCanisterId) : cid;
      const arg = encode(func.argTypes, args);
      const { requestId, response, requestDetails } = await agent.call(cid, {
        methodName,
        arg,
        effectiveCanisterId: ecid,
        nonce: options.nonce
      });
      let reply;
      let certificate;
      if (isV3ResponseBody(response.body)) {
        if (agent.rootKey == null) {
          throw ExternalError.fromCode(new MissingRootKeyErrorCode());
        }
        const cert = response.body.certificate;
        certificate = await Certificate.create({
          certificate: cert,
          rootKey: agent.rootKey,
          canisterId: ecid,
          blsVerify,
          agent
        });
        const path = [utf8ToBytes("request_status"), requestId];
        const status = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "status"])));
        switch (status) {
          case "replied":
            reply = lookupResultToBuffer(certificate.lookup_path([...path, "reply"]));
            break;
          case "rejected": {
            const rejectCode = new Uint8Array(lookupResultToBuffer(certificate.lookup_path([...path, "reject_code"])))[0];
            const rejectMessage = new TextDecoder().decode(lookupResultToBuffer(certificate.lookup_path([...path, "reject_message"])));
            const error_code_buf = lookupResultToBuffer(certificate.lookup_path([...path, "error_code"]));
            const error_code = error_code_buf ? new TextDecoder().decode(error_code_buf) : void 0;
            const certifiedRejectErrorCode = new CertifiedRejectErrorCode(requestId, rejectCode, rejectMessage, error_code);
            certifiedRejectErrorCode.callContext = {
              canisterId: cid,
              methodName,
              httpDetails: response
            };
            throw RejectError.fromCode(certifiedRejectErrorCode);
          }
        }
      } else if (isV2ResponseBody(response.body)) {
        const { reject_code, reject_message, error_code } = response.body;
        const errorCode = new UncertifiedRejectUpdateErrorCode(requestId, reject_code, reject_message, error_code);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails: response
        };
        throw RejectError.fromCode(errorCode);
      }
      if (response.status === 202) {
        const pollOptions = {
          ...pollingOptions,
          blsVerify
        };
        const response2 = await pollForResponse(agent, ecid, requestId, pollOptions);
        certificate = response2.certificate;
        reply = response2.reply;
      }
      const shouldIncludeHttpDetails = func.annotations.includes(ACTOR_METHOD_WITH_HTTP_DETAILS);
      const shouldIncludeCertificate = func.annotations.includes(ACTOR_METHOD_WITH_CERTIFICATE);
      const httpDetails = { ...response, requestDetails };
      if (reply !== void 0) {
        if (shouldIncludeHttpDetails && shouldIncludeCertificate) {
          return {
            httpDetails,
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeCertificate) {
          return {
            certificate,
            result: decodeReturnValue(func.retTypes, reply)
          };
        } else if (shouldIncludeHttpDetails) {
          return {
            httpDetails,
            result: decodeReturnValue(func.retTypes, reply)
          };
        }
        return decodeReturnValue(func.retTypes, reply);
      } else {
        const errorCode = new UnexpectedErrorCode(`Call was returned undefined. We cannot determine if the call was successful or not. Return types: [${func.retTypes.map((t) => t.display()).join(",")}].`);
        errorCode.callContext = {
          canisterId: cid,
          methodName,
          httpDetails
        };
        throw UnknownError.fromCode(errorCode);
      }
    };
  }
  const handler = (...args) => caller({}, ...args);
  handler.withOptions = (options) => (...args) => caller(options, ...args);
  return handler;
}
var QueryObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _QueryObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentQuery);
    __privateAdd(this, _currentQueryInitialState);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentResultState);
    __privateAdd(this, _currentResultOptions);
    __privateAdd(this, _currentThenable);
    __privateAdd(this, _selectError);
    __privateAdd(this, _selectFn);
    __privateAdd(this, _selectResult);
    // This property keeps track of the last query with defined data.
    // It will be used to pass the previous data and query to the placeholder function between renders.
    __privateAdd(this, _lastQueryWithDefinedData);
    __privateAdd(this, _staleTimeoutId);
    __privateAdd(this, _refetchIntervalId);
    __privateAdd(this, _currentRefetchInterval);
    __privateAdd(this, _trackedProps, /* @__PURE__ */ new Set());
    this.options = options;
    __privateSet(this, _client, client);
    __privateSet(this, _selectError, null);
    __privateSet(this, _currentThenable, pendingThenable());
    this.bindMethods();
    this.setOptions(options);
  }
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      __privateGet(this, _currentQuery).addObserver(this);
      if (shouldFetchOnMount(__privateGet(this, _currentQuery), this.options)) {
        __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
      } else {
        this.updateResult();
      }
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      __privateGet(this, _currentQuery),
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
    __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
    __privateGet(this, _currentQuery).removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = __privateGet(this, _currentQuery);
    this.options = __privateGet(this, _client).defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
    __privateGet(this, _currentQuery).setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: __privateGet(this, _currentQuery),
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      __privateGet(this, _currentQuery),
      prevQuery,
      this.options,
      prevOptions
    )) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
    this.updateResult();
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || resolveStaleTime(this.options.staleTime, __privateGet(this, _currentQuery)) !== resolveStaleTime(prevOptions.staleTime, __privateGet(this, _currentQuery)))) {
      __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
    }
    const nextRefetchInterval = __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this);
    if (mounted && (__privateGet(this, _currentQuery) !== prevQuery || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) !== resolveEnabled(prevOptions.enabled, __privateGet(this, _currentQuery)) || nextRefetchInterval !== __privateGet(this, _currentRefetchInterval))) {
      __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      __privateSet(this, _currentResult, result);
      __privateSet(this, _currentResultOptions, this.options);
      __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    }
    return result;
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked == null ? void 0 : onPropTracked(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && __privateGet(this, _currentThenable).status === "pending") {
            __privateGet(this, _currentThenable).reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    __privateGet(this, _trackedProps).add(key);
  }
  getCurrentQuery() {
    return __privateGet(this, _currentQuery);
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = __privateGet(this, _client).defaultQueryOptions(options);
    const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this, {
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return __privateGet(this, _currentResult);
    });
  }
  createResult(query, options) {
    var _a2;
    const prevQuery = __privateGet(this, _currentQuery);
    const prevOptions = this.options;
    const prevResult = __privateGet(this, _currentResult);
    const prevResultState = __privateGet(this, _currentResultState);
    const prevResultOptions = __privateGet(this, _currentResultOptions);
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : __privateGet(this, _currentQueryInitialState);
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          (_a2 = __privateGet(this, _lastQueryWithDefinedData)) == null ? void 0 : _a2.state.data,
          __privateGet(this, _lastQueryWithDefinedData)
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult == null ? void 0 : prevResult.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === __privateGet(this, _selectFn)) {
        data = __privateGet(this, _selectResult);
      } else {
        try {
          __privateSet(this, _selectFn, options.select);
          data = options.select(data);
          data = replaceData(prevResult == null ? void 0 : prevResult.data, data, options);
          __privateSet(this, _selectResult, data);
          __privateSet(this, _selectError, null);
        } catch (selectError) {
          __privateSet(this, _selectError, selectError);
        }
      }
    }
    if (__privateGet(this, _selectError)) {
      error = __privateGet(this, _selectError);
      data = __privateGet(this, _selectResult);
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: __privateGet(this, _currentThenable),
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = __privateSet(this, _currentThenable, nextResult.promise = pendingThenable());
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = __privateGet(this, _currentThenable);
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = __privateGet(this, _currentResult);
    const nextResult = this.createResult(__privateGet(this, _currentQuery), this.options);
    __privateSet(this, _currentResultState, __privateGet(this, _currentQuery).state);
    __privateSet(this, _currentResultOptions, this.options);
    if (__privateGet(this, _currentResultState).data !== void 0) {
      __privateSet(this, _lastQueryWithDefinedData, __privateGet(this, _currentQuery));
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    __privateSet(this, _currentResult, nextResult);
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !__privateGet(this, _trackedProps).size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? __privateGet(this, _trackedProps)
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(__privateGet(this, _currentResult)).some((key) => {
        const typedKey = key;
        const changed = __privateGet(this, _currentResult)[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    __privateMethod(this, _QueryObserver_instances, notify_fn).call(this, { listeners: shouldNotifyListeners() });
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      __privateMethod(this, _QueryObserver_instances, updateTimers_fn).call(this);
    }
  }
}, _client = new WeakMap(), _currentQuery = new WeakMap(), _currentQueryInitialState = new WeakMap(), _currentResult = new WeakMap(), _currentResultState = new WeakMap(), _currentResultOptions = new WeakMap(), _currentThenable = new WeakMap(), _selectError = new WeakMap(), _selectFn = new WeakMap(), _selectResult = new WeakMap(), _lastQueryWithDefinedData = new WeakMap(), _staleTimeoutId = new WeakMap(), _refetchIntervalId = new WeakMap(), _currentRefetchInterval = new WeakMap(), _trackedProps = new WeakMap(), _QueryObserver_instances = new WeakSet(), executeFetch_fn = function(fetchOptions) {
  __privateMethod(this, _QueryObserver_instances, updateQuery_fn).call(this);
  let promise = __privateGet(this, _currentQuery).fetch(
    this.options,
    fetchOptions
  );
  if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
    promise = promise.catch(noop);
  }
  return promise;
}, updateStaleTimeout_fn = function() {
  __privateMethod(this, _QueryObserver_instances, clearStaleTimeout_fn).call(this);
  const staleTime = resolveStaleTime(
    this.options.staleTime,
    __privateGet(this, _currentQuery)
  );
  if (environmentManager.isServer() || __privateGet(this, _currentResult).isStale || !isValidTimeout(staleTime)) {
    return;
  }
  const time = timeUntilStale(__privateGet(this, _currentResult).dataUpdatedAt, staleTime);
  const timeout2 = time + 1;
  __privateSet(this, _staleTimeoutId, timeoutManager.setTimeout(() => {
    if (!__privateGet(this, _currentResult).isStale) {
      this.updateResult();
    }
  }, timeout2));
}, computeRefetchInterval_fn = function() {
  return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(__privateGet(this, _currentQuery)) : this.options.refetchInterval) ?? false;
}, updateRefetchInterval_fn = function(nextInterval) {
  __privateMethod(this, _QueryObserver_instances, clearRefetchInterval_fn).call(this);
  __privateSet(this, _currentRefetchInterval, nextInterval);
  if (environmentManager.isServer() || resolveEnabled(this.options.enabled, __privateGet(this, _currentQuery)) === false || !isValidTimeout(__privateGet(this, _currentRefetchInterval)) || __privateGet(this, _currentRefetchInterval) === 0) {
    return;
  }
  __privateSet(this, _refetchIntervalId, timeoutManager.setInterval(() => {
    if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
      __privateMethod(this, _QueryObserver_instances, executeFetch_fn).call(this);
    }
  }, __privateGet(this, _currentRefetchInterval)));
}, updateTimers_fn = function() {
  __privateMethod(this, _QueryObserver_instances, updateStaleTimeout_fn).call(this);
  __privateMethod(this, _QueryObserver_instances, updateRefetchInterval_fn).call(this, __privateMethod(this, _QueryObserver_instances, computeRefetchInterval_fn).call(this));
}, clearStaleTimeout_fn = function() {
  if (__privateGet(this, _staleTimeoutId)) {
    timeoutManager.clearTimeout(__privateGet(this, _staleTimeoutId));
    __privateSet(this, _staleTimeoutId, void 0);
  }
}, clearRefetchInterval_fn = function() {
  if (__privateGet(this, _refetchIntervalId)) {
    timeoutManager.clearInterval(__privateGet(this, _refetchIntervalId));
    __privateSet(this, _refetchIntervalId, void 0);
  }
}, updateQuery_fn = function() {
  const query = __privateGet(this, _client).getQueryCache().build(__privateGet(this, _client), this.options);
  if (query === __privateGet(this, _currentQuery)) {
    return;
  }
  const prevQuery = __privateGet(this, _currentQuery);
  __privateSet(this, _currentQuery, query);
  __privateSet(this, _currentQueryInitialState, query.state);
  if (this.hasListeners()) {
    prevQuery == null ? void 0 : prevQuery.removeObserver(this);
    query.addObserver(this);
  }
}, notify_fn = function(notifyOptions) {
  notifyManager.batch(() => {
    if (notifyOptions.listeners) {
      this.listeners.forEach((listener) => {
        listener(__privateGet(this, _currentResult));
      });
    }
    __privateGet(this, _client).getQueryCache().notify({
      query: __privateGet(this, _currentQuery),
      type: "observerResultsUpdated"
    });
  });
}, _a);
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var MutationObserver = (_b = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _MutationObserver_instances);
    __privateAdd(this, _client2);
    __privateAdd(this, _currentResult2);
    __privateAdd(this, _currentMutation);
    __privateAdd(this, _mutateOptions);
    __privateSet(this, _client2, client);
    this.setOptions(options);
    this.bindMethods();
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _a2;
    const prevOptions = this.options;
    this.options = __privateGet(this, _client2).defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client2).getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: __privateGet(this, _currentMutation),
        observer: this
      });
    }
    if ((prevOptions == null ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state.status) === "pending") {
      __privateGet(this, _currentMutation).setOptions(this.options);
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn2).call(this, action);
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult2);
  }
  reset() {
    var _a2;
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, void 0);
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn2).call(this);
  }
  mutate(variables, options) {
    var _a2;
    __privateSet(this, _mutateOptions, options);
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, __privateGet(this, _client2).getMutationCache().build(__privateGet(this, _client2), this.options));
    __privateGet(this, _currentMutation).addObserver(this);
    return __privateGet(this, _currentMutation).execute(variables);
  }
}, _client2 = new WeakMap(), _currentResult2 = new WeakMap(), _currentMutation = new WeakMap(), _mutateOptions = new WeakMap(), _MutationObserver_instances = new WeakSet(), updateResult_fn = function() {
  var _a2;
  const state = ((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state) ?? getDefaultState();
  __privateSet(this, _currentResult2, {
    ...state,
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    mutate: this.mutate,
    reset: this.reset
  });
}, notify_fn2 = function(action) {
  notifyManager.batch(() => {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    if (__privateGet(this, _mutateOptions) && this.hasListeners()) {
      const variables = __privateGet(this, _currentResult2).variables;
      const onMutateResult = __privateGet(this, _currentResult2).context;
      const context = {
        client: __privateGet(this, _client2),
        meta: this.options.meta,
        mutationKey: this.options.mutationKey
      };
      if ((action == null ? void 0 : action.type) === "success") {
        try {
          (_b2 = (_a2 = __privateGet(this, _mutateOptions)).onSuccess) == null ? void 0 : _b2.call(
            _a2,
            action.data,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_d = (_c = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _d.call(
            _c,
            action.data,
            null,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      } else if ((action == null ? void 0 : action.type) === "error") {
        try {
          (_f = (_e = __privateGet(this, _mutateOptions)).onError) == null ? void 0 : _f.call(
            _e,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_h = (_g = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _h.call(
            _g,
            void 0,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      }
    }
    this.listeners.forEach((listener) => {
      listener(__privateGet(this, _currentResult2));
    });
  });
}, _b);
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = (query == null ? void 0 : query.state.error) && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => (defaultedOptions == null ? void 0 : defaultedOptions.suspense) && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  var _a2, _b2, _c, _d;
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  (_b2 = (_a2 = client.getDefaultOptions().queries) == null ? void 0 : _a2._experimental_beforeQuery) == null ? void 0 : _b2.call(
    _a2,
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  (_d = (_c = client.getDefaultOptions().queries) == null ? void 0 : _c._experimental_afterQuery) == null ? void 0 : _d.call(
    _c,
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query == null ? void 0 : query.promise
    );
    promise == null ? void 0 : promise.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver);
}
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
function hasAccessControl(actor) {
  return typeof actor === "object" && actor !== null && "_initializeAccessControl" in actor;
}
const ACTOR_QUERY_KEY = "actor";
function useActor(createActor2) {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, identity == null ? void 0 : identity.getPrincipal().toString()],
    queryFn: async () => {
      const isAuthenticated = !!identity;
      if (!isAuthenticated) {
        return await createActorWithConfig(createActor2);
      }
      const actorOptions = {
        agentOptions: {
          identity
        }
      };
      const actor = await createActorWithConfig(createActor2, actorOptions);
      if (hasAccessControl(actor)) {
        await actor._initializeAccessControl();
      }
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true
  });
  reactExports.useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);
  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching
  };
}
const ApplicationStatus = Variant({
  "Applied": Null,
  "Rejected": Null,
  "Interviewing": Null,
  "Offer": Null,
  "Archived": Null
});
const ApplicationSource = Variant({
  "referral": Null,
  "network": Null,
  "direct": Null,
  "job_board": Null,
  "recruiter": Null
});
const JobType$1 = Variant({
  "onsite": Null,
  "remote": Null,
  "hybrid": Null
});
const Timestamp = Int;
const AddApplicationArgs = Record({
  "fitScoreConfidence": Opt(Nat),
  "status": ApplicationStatus,
  "aiSuggestion": Opt(Text),
  "source": ApplicationSource,
  "jobType": JobType$1,
  "fitScore": Opt(Nat),
  "tags": Vec(Text),
  "jobUrl": Text,
  "appliedDate": Timestamp,
  "notes": Text,
  "companyName": Text,
  "isHighPotential": Bool,
  "salaryMax": Opt(Nat),
  "salaryMin": Opt(Nat),
  "position": Text,
  "location": Text
});
const AppId = Nat;
const UserId = Principal$1;
const Application = Record({
  "id": AppId,
  "fitScoreConfidence": Opt(Nat),
  "status": ApplicationStatus,
  "aiSuggestion": Opt(Text),
  "source": ApplicationSource,
  "jobType": JobType$1,
  "userId": UserId,
  "fitScore": Opt(Nat),
  "tags": Vec(Text),
  "lastUpdated": Timestamp,
  "jobUrl": Text,
  "appliedDate": Timestamp,
  "notes": Text,
  "companyName": Text,
  "isHighPotential": Bool,
  "salaryMax": Opt(Nat),
  "salaryMin": Opt(Nat),
  "position": Text,
  "location": Text
});
const UserRole = Variant({
  "admin": Null,
  "user": Null,
  "guest": Null
});
const DateRange = Record({
  "toDate": Timestamp,
  "fromDate": Timestamp
});
const ApplicationsOverTime = Record({
  "date": Timestamp,
  "count": Nat
});
const ApplicationsByJobType = Record({
  "jobType": JobType$1,
  "count": Nat
});
const ApplicationsBySource = Record({
  "source": ApplicationSource,
  "count": Nat
});
const AnalyticsResult = Record({
  "offerRate": Float64,
  "total": Nat,
  "overTime": Vec(ApplicationsOverTime),
  "interviewRate": Float64,
  "avgTimeToOffer": Float64,
  "responseRate": Float64,
  "byJobType": Vec(ApplicationsByJobType),
  "bySource": Vec(ApplicationsBySource)
});
const GetApplicationsArgs = Record({
  "page": Nat,
  "pageSize": Nat,
  "statusFilter": Opt(ApplicationStatus)
});
const GetApplicationsResult = Record({
  "total": Nat,
  "page": Nat,
  "pageSize": Nat,
  "applications": Vec(Application)
});
const AiInsight = Record({
  "message": Text,
  "category": Text,
  "priority": Nat
});
const ParsedJobDetails = Record({
  "fitScoreConfidence": Opt(Nat),
  "rawJson": Text,
  "jobType": Opt(JobType$1),
  "fitScore": Opt(Nat),
  "tags": Vec(Text),
  "notes": Text,
  "companyName": Text,
  "salaryMax": Opt(Nat),
  "salaryMin": Opt(Nat),
  "position": Text,
  "location": Text
});
const http_header = Record({
  "value": Text,
  "name": Text
});
const http_request_result = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
const TransformationInput = Record({
  "context": Vec(Nat8),
  "response": http_request_result
});
const TransformationOutput = Record({
  "status": Nat,
  "body": Vec(Nat8),
  "headers": Vec(http_header)
});
const UpdateApplicationArgs = Record({
  "id": AppId,
  "fitScoreConfidence": Opt(Nat),
  "status": ApplicationStatus,
  "aiSuggestion": Opt(Text),
  "source": ApplicationSource,
  "jobType": JobType$1,
  "fitScore": Opt(Nat),
  "tags": Vec(Text),
  "jobUrl": Text,
  "appliedDate": Timestamp,
  "notes": Text,
  "companyName": Text,
  "isHighPotential": Bool,
  "salaryMax": Opt(Nat),
  "salaryMin": Opt(Nat),
  "position": Text,
  "location": Text
});
Service({
  "_initializeAccessControl": Func([], [], []),
  "addApplication": Func([AddApplicationArgs], [Application], []),
  "assignCallerUserRole": Func([Principal$1, UserRole], [], []),
  "deleteApplication": Func([Nat], [Bool], []),
  "getAnalytics": Func([DateRange], [AnalyticsResult], ["query"]),
  "getApplication": Func([Nat], [Opt(Application)], ["query"]),
  "getApplications": Func(
    [GetApplicationsArgs],
    [GetApplicationsResult],
    ["query"]
  ),
  "getCallerUserRole": Func([], [UserRole], ["query"]),
  "getInsights": Func([], [Vec(AiInsight)], []),
  "initSampleData": Func([], [Nat], []),
  "isCallerAdmin": Func([], [Bool], ["query"]),
  "parseJobUrl": Func([Text], [ParsedJobDetails], []),
  "searchApplications": Func([Text], [Vec(Application)], []),
  "transform": Func(
    [TransformationInput],
    [TransformationOutput],
    ["query"]
  ),
  "updateApplication": Func(
    [UpdateApplicationArgs],
    [Opt(Application)],
    []
  ),
  "updateApplicationStatus": Func(
    [Nat, ApplicationStatus],
    [Opt(Application)],
    []
  )
});
const idlFactory = ({ IDL: IDL2 }) => {
  const ApplicationStatus2 = IDL2.Variant({
    "Applied": IDL2.Null,
    "Rejected": IDL2.Null,
    "Interviewing": IDL2.Null,
    "Offer": IDL2.Null,
    "Archived": IDL2.Null
  });
  const ApplicationSource2 = IDL2.Variant({
    "referral": IDL2.Null,
    "network": IDL2.Null,
    "direct": IDL2.Null,
    "job_board": IDL2.Null,
    "recruiter": IDL2.Null
  });
  const JobType2 = IDL2.Variant({
    "onsite": IDL2.Null,
    "remote": IDL2.Null,
    "hybrid": IDL2.Null
  });
  const Timestamp2 = IDL2.Int;
  const AddApplicationArgs2 = IDL2.Record({
    "fitScoreConfidence": IDL2.Opt(IDL2.Nat),
    "status": ApplicationStatus2,
    "aiSuggestion": IDL2.Opt(IDL2.Text),
    "source": ApplicationSource2,
    "jobType": JobType2,
    "fitScore": IDL2.Opt(IDL2.Nat),
    "tags": IDL2.Vec(IDL2.Text),
    "jobUrl": IDL2.Text,
    "appliedDate": Timestamp2,
    "notes": IDL2.Text,
    "companyName": IDL2.Text,
    "isHighPotential": IDL2.Bool,
    "salaryMax": IDL2.Opt(IDL2.Nat),
    "salaryMin": IDL2.Opt(IDL2.Nat),
    "position": IDL2.Text,
    "location": IDL2.Text
  });
  const AppId2 = IDL2.Nat;
  const UserId2 = IDL2.Principal;
  const Application2 = IDL2.Record({
    "id": AppId2,
    "fitScoreConfidence": IDL2.Opt(IDL2.Nat),
    "status": ApplicationStatus2,
    "aiSuggestion": IDL2.Opt(IDL2.Text),
    "source": ApplicationSource2,
    "jobType": JobType2,
    "userId": UserId2,
    "fitScore": IDL2.Opt(IDL2.Nat),
    "tags": IDL2.Vec(IDL2.Text),
    "lastUpdated": Timestamp2,
    "jobUrl": IDL2.Text,
    "appliedDate": Timestamp2,
    "notes": IDL2.Text,
    "companyName": IDL2.Text,
    "isHighPotential": IDL2.Bool,
    "salaryMax": IDL2.Opt(IDL2.Nat),
    "salaryMin": IDL2.Opt(IDL2.Nat),
    "position": IDL2.Text,
    "location": IDL2.Text
  });
  const UserRole2 = IDL2.Variant({
    "admin": IDL2.Null,
    "user": IDL2.Null,
    "guest": IDL2.Null
  });
  const DateRange2 = IDL2.Record({
    "toDate": Timestamp2,
    "fromDate": Timestamp2
  });
  const ApplicationsOverTime2 = IDL2.Record({
    "date": Timestamp2,
    "count": IDL2.Nat
  });
  const ApplicationsByJobType2 = IDL2.Record({
    "jobType": JobType2,
    "count": IDL2.Nat
  });
  const ApplicationsBySource2 = IDL2.Record({
    "source": ApplicationSource2,
    "count": IDL2.Nat
  });
  const AnalyticsResult2 = IDL2.Record({
    "offerRate": IDL2.Float64,
    "total": IDL2.Nat,
    "overTime": IDL2.Vec(ApplicationsOverTime2),
    "interviewRate": IDL2.Float64,
    "avgTimeToOffer": IDL2.Float64,
    "responseRate": IDL2.Float64,
    "byJobType": IDL2.Vec(ApplicationsByJobType2),
    "bySource": IDL2.Vec(ApplicationsBySource2)
  });
  const GetApplicationsArgs2 = IDL2.Record({
    "page": IDL2.Nat,
    "pageSize": IDL2.Nat,
    "statusFilter": IDL2.Opt(ApplicationStatus2)
  });
  const GetApplicationsResult2 = IDL2.Record({
    "total": IDL2.Nat,
    "page": IDL2.Nat,
    "pageSize": IDL2.Nat,
    "applications": IDL2.Vec(Application2)
  });
  const AiInsight2 = IDL2.Record({
    "message": IDL2.Text,
    "category": IDL2.Text,
    "priority": IDL2.Nat
  });
  const ParsedJobDetails2 = IDL2.Record({
    "fitScoreConfidence": IDL2.Opt(IDL2.Nat),
    "rawJson": IDL2.Text,
    "jobType": IDL2.Opt(JobType2),
    "fitScore": IDL2.Opt(IDL2.Nat),
    "tags": IDL2.Vec(IDL2.Text),
    "notes": IDL2.Text,
    "companyName": IDL2.Text,
    "salaryMax": IDL2.Opt(IDL2.Nat),
    "salaryMin": IDL2.Opt(IDL2.Nat),
    "position": IDL2.Text,
    "location": IDL2.Text
  });
  const http_header2 = IDL2.Record({ "value": IDL2.Text, "name": IDL2.Text });
  const http_request_result2 = IDL2.Record({
    "status": IDL2.Nat,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(http_header2)
  });
  const TransformationInput2 = IDL2.Record({
    "context": IDL2.Vec(IDL2.Nat8),
    "response": http_request_result2
  });
  const TransformationOutput2 = IDL2.Record({
    "status": IDL2.Nat,
    "body": IDL2.Vec(IDL2.Nat8),
    "headers": IDL2.Vec(http_header2)
  });
  const UpdateApplicationArgs2 = IDL2.Record({
    "id": AppId2,
    "fitScoreConfidence": IDL2.Opt(IDL2.Nat),
    "status": ApplicationStatus2,
    "aiSuggestion": IDL2.Opt(IDL2.Text),
    "source": ApplicationSource2,
    "jobType": JobType2,
    "fitScore": IDL2.Opt(IDL2.Nat),
    "tags": IDL2.Vec(IDL2.Text),
    "jobUrl": IDL2.Text,
    "appliedDate": Timestamp2,
    "notes": IDL2.Text,
    "companyName": IDL2.Text,
    "isHighPotential": IDL2.Bool,
    "salaryMax": IDL2.Opt(IDL2.Nat),
    "salaryMin": IDL2.Opt(IDL2.Nat),
    "position": IDL2.Text,
    "location": IDL2.Text
  });
  return IDL2.Service({
    "_initializeAccessControl": IDL2.Func([], [], []),
    "addApplication": IDL2.Func([AddApplicationArgs2], [Application2], []),
    "assignCallerUserRole": IDL2.Func([IDL2.Principal, UserRole2], [], []),
    "deleteApplication": IDL2.Func([IDL2.Nat], [IDL2.Bool], []),
    "getAnalytics": IDL2.Func([DateRange2], [AnalyticsResult2], ["query"]),
    "getApplication": IDL2.Func([IDL2.Nat], [IDL2.Opt(Application2)], ["query"]),
    "getApplications": IDL2.Func(
      [GetApplicationsArgs2],
      [GetApplicationsResult2],
      ["query"]
    ),
    "getCallerUserRole": IDL2.Func([], [UserRole2], ["query"]),
    "getInsights": IDL2.Func([], [IDL2.Vec(AiInsight2)], []),
    "initSampleData": IDL2.Func([], [IDL2.Nat], []),
    "isCallerAdmin": IDL2.Func([], [IDL2.Bool], ["query"]),
    "parseJobUrl": IDL2.Func([IDL2.Text], [ParsedJobDetails2], []),
    "searchApplications": IDL2.Func([IDL2.Text], [IDL2.Vec(Application2)], []),
    "transform": IDL2.Func(
      [TransformationInput2],
      [TransformationOutput2],
      ["query"]
    ),
    "updateApplication": IDL2.Func(
      [UpdateApplicationArgs2],
      [IDL2.Opt(Application2)],
      []
    ),
    "updateApplicationStatus": IDL2.Func(
      [IDL2.Nat, ApplicationStatus2],
      [IDL2.Opt(Application2)],
      []
    )
  });
};
function candid_some(value) {
  return [
    value
  ];
}
function candid_none() {
  return [];
}
function record_opt_to_undefined(arg) {
  return arg == null ? void 0 : arg;
}
var JobType = /* @__PURE__ */ ((JobType2) => {
  JobType2["onsite"] = "onsite";
  JobType2["remote"] = "remote";
  JobType2["hybrid"] = "hybrid";
  return JobType2;
})(JobType || {});
class Backend {
  constructor(actor, _uploadFile, _downloadFile, processError) {
    this.actor = actor;
    this._uploadFile = _uploadFile;
    this._downloadFile = _downloadFile;
    this.processError = processError;
  }
  async _initializeAccessControl() {
    if (this.processError) {
      try {
        const result = await this.actor._initializeAccessControl();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor._initializeAccessControl();
      return result;
    }
  }
  async addApplication(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.addApplication(to_candid_AddApplicationArgs_n1(this._uploadFile, this._downloadFile, arg0));
        return from_candid_Application_n9(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.addApplication(to_candid_AddApplicationArgs_n1(this._uploadFile, this._downloadFile, arg0));
      return from_candid_Application_n9(this._uploadFile, this._downloadFile, result);
    }
  }
  async assignCallerUserRole(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n19(this._uploadFile, this._downloadFile, arg1));
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.assignCallerUserRole(arg0, to_candid_UserRole_n19(this._uploadFile, this._downloadFile, arg1));
      return result;
    }
  }
  async deleteApplication(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.deleteApplication(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.deleteApplication(arg0);
      return result;
    }
  }
  async getAnalytics(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getAnalytics(arg0);
        return from_candid_AnalyticsResult_n21(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getAnalytics(arg0);
      return from_candid_AnalyticsResult_n21(this._uploadFile, this._downloadFile, result);
    }
  }
  async getApplication(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getApplication(arg0);
        return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getApplication(arg0);
      return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async getApplications(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.getApplications(to_candid_GetApplicationsArgs_n30(this._uploadFile, this._downloadFile, arg0));
        return from_candid_GetApplicationsResult_n32(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getApplications(to_candid_GetApplicationsArgs_n30(this._uploadFile, this._downloadFile, arg0));
      return from_candid_GetApplicationsResult_n32(this._uploadFile, this._downloadFile, result);
    }
  }
  async getCallerUserRole() {
    if (this.processError) {
      try {
        const result = await this.actor.getCallerUserRole();
        return from_candid_UserRole_n35(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getCallerUserRole();
      return from_candid_UserRole_n35(this._uploadFile, this._downloadFile, result);
    }
  }
  async getInsights() {
    if (this.processError) {
      try {
        const result = await this.actor.getInsights();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.getInsights();
      return result;
    }
  }
  async initSampleData() {
    if (this.processError) {
      try {
        const result = await this.actor.initSampleData();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.initSampleData();
      return result;
    }
  }
  async isCallerAdmin() {
    if (this.processError) {
      try {
        const result = await this.actor.isCallerAdmin();
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.isCallerAdmin();
      return result;
    }
  }
  async parseJobUrl(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.parseJobUrl(arg0);
        return from_candid_ParsedJobDetails_n37(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.parseJobUrl(arg0);
      return from_candid_ParsedJobDetails_n37(this._uploadFile, this._downloadFile, result);
    }
  }
  async searchApplications(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.searchApplications(arg0);
        return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.searchApplications(arg0);
      return from_candid_vec_n34(this._uploadFile, this._downloadFile, result);
    }
  }
  async transform(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.transform(arg0);
        return result;
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.transform(arg0);
      return result;
    }
  }
  async updateApplication(arg0) {
    if (this.processError) {
      try {
        const result = await this.actor.updateApplication(to_candid_UpdateApplicationArgs_n40(this._uploadFile, this._downloadFile, arg0));
        return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateApplication(to_candid_UpdateApplicationArgs_n40(this._uploadFile, this._downloadFile, arg0));
      return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
    }
  }
  async updateApplicationStatus(arg0, arg1) {
    if (this.processError) {
      try {
        const result = await this.actor.updateApplicationStatus(arg0, to_candid_ApplicationStatus_n3(this._uploadFile, this._downloadFile, arg1));
        return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
      } catch (e) {
        this.processError(e);
        throw new Error("unreachable");
      }
    } else {
      const result = await this.actor.updateApplicationStatus(arg0, to_candid_ApplicationStatus_n3(this._uploadFile, this._downloadFile, arg1));
      return from_candid_opt_n29(this._uploadFile, this._downloadFile, result);
    }
  }
}
function from_candid_AnalyticsResult_n21(_uploadFile, _downloadFile, value) {
  return from_candid_record_n22(_uploadFile, _downloadFile, value);
}
function from_candid_ApplicationSource_n15(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n16(_uploadFile, _downloadFile, value);
}
function from_candid_ApplicationStatus_n12(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n13(_uploadFile, _downloadFile, value);
}
function from_candid_Application_n9(_uploadFile, _downloadFile, value) {
  return from_candid_record_n10(_uploadFile, _downloadFile, value);
}
function from_candid_ApplicationsByJobType_n24(_uploadFile, _downloadFile, value) {
  return from_candid_record_n25(_uploadFile, _downloadFile, value);
}
function from_candid_ApplicationsBySource_n27(_uploadFile, _downloadFile, value) {
  return from_candid_record_n28(_uploadFile, _downloadFile, value);
}
function from_candid_GetApplicationsResult_n32(_uploadFile, _downloadFile, value) {
  return from_candid_record_n33(_uploadFile, _downloadFile, value);
}
function from_candid_JobType_n17(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n18(_uploadFile, _downloadFile, value);
}
function from_candid_ParsedJobDetails_n37(_uploadFile, _downloadFile, value) {
  return from_candid_record_n38(_uploadFile, _downloadFile, value);
}
function from_candid_UserRole_n35(_uploadFile, _downloadFile, value) {
  return from_candid_variant_n36(_uploadFile, _downloadFile, value);
}
function from_candid_opt_n11(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n14(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : value[0];
}
function from_candid_opt_n29(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_Application_n9(_uploadFile, _downloadFile, value[0]);
}
function from_candid_opt_n39(_uploadFile, _downloadFile, value) {
  return value.length === 0 ? null : from_candid_JobType_n17(_uploadFile, _downloadFile, value[0]);
}
function from_candid_record_n10(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    fitScoreConfidence: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.fitScoreConfidence)),
    status: from_candid_ApplicationStatus_n12(_uploadFile, _downloadFile, value.status),
    aiSuggestion: record_opt_to_undefined(from_candid_opt_n14(_uploadFile, _downloadFile, value.aiSuggestion)),
    source: from_candid_ApplicationSource_n15(_uploadFile, _downloadFile, value.source),
    jobType: from_candid_JobType_n17(_uploadFile, _downloadFile, value.jobType),
    userId: value.userId,
    fitScore: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.fitScore)),
    tags: value.tags,
    lastUpdated: value.lastUpdated,
    jobUrl: value.jobUrl,
    appliedDate: value.appliedDate,
    notes: value.notes,
    companyName: value.companyName,
    isHighPotential: value.isHighPotential,
    salaryMax: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.salaryMax)),
    salaryMin: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.salaryMin)),
    position: value.position,
    location: value.location
  };
}
function from_candid_record_n22(_uploadFile, _downloadFile, value) {
  return {
    offerRate: value.offerRate,
    total: value.total,
    overTime: value.overTime,
    interviewRate: value.interviewRate,
    avgTimeToOffer: value.avgTimeToOffer,
    responseRate: value.responseRate,
    byJobType: from_candid_vec_n23(_uploadFile, _downloadFile, value.byJobType),
    bySource: from_candid_vec_n26(_uploadFile, _downloadFile, value.bySource)
  };
}
function from_candid_record_n25(_uploadFile, _downloadFile, value) {
  return {
    jobType: from_candid_JobType_n17(_uploadFile, _downloadFile, value.jobType),
    count: value.count
  };
}
function from_candid_record_n28(_uploadFile, _downloadFile, value) {
  return {
    source: from_candid_ApplicationSource_n15(_uploadFile, _downloadFile, value.source),
    count: value.count
  };
}
function from_candid_record_n33(_uploadFile, _downloadFile, value) {
  return {
    total: value.total,
    page: value.page,
    pageSize: value.pageSize,
    applications: from_candid_vec_n34(_uploadFile, _downloadFile, value.applications)
  };
}
function from_candid_record_n38(_uploadFile, _downloadFile, value) {
  return {
    fitScoreConfidence: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.fitScoreConfidence)),
    rawJson: value.rawJson,
    jobType: record_opt_to_undefined(from_candid_opt_n39(_uploadFile, _downloadFile, value.jobType)),
    fitScore: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.fitScore)),
    tags: value.tags,
    notes: value.notes,
    companyName: value.companyName,
    salaryMax: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.salaryMax)),
    salaryMin: record_opt_to_undefined(from_candid_opt_n11(_uploadFile, _downloadFile, value.salaryMin)),
    position: value.position,
    location: value.location
  };
}
function from_candid_variant_n13(_uploadFile, _downloadFile, value) {
  return "Applied" in value ? "Applied" : "Rejected" in value ? "Rejected" : "Interviewing" in value ? "Interviewing" : "Offer" in value ? "Offer" : "Archived" in value ? "Archived" : value;
}
function from_candid_variant_n16(_uploadFile, _downloadFile, value) {
  return "referral" in value ? "referral" : "network" in value ? "network" : "direct" in value ? "direct" : "job_board" in value ? "job_board" : "recruiter" in value ? "recruiter" : value;
}
function from_candid_variant_n18(_uploadFile, _downloadFile, value) {
  return "onsite" in value ? "onsite" : "remote" in value ? "remote" : "hybrid" in value ? "hybrid" : value;
}
function from_candid_variant_n36(_uploadFile, _downloadFile, value) {
  return "admin" in value ? "admin" : "user" in value ? "user" : "guest" in value ? "guest" : value;
}
function from_candid_vec_n23(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ApplicationsByJobType_n24(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n26(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_ApplicationsBySource_n27(_uploadFile, _downloadFile, x));
}
function from_candid_vec_n34(_uploadFile, _downloadFile, value) {
  return value.map((x) => from_candid_Application_n9(_uploadFile, _downloadFile, x));
}
function to_candid_AddApplicationArgs_n1(_uploadFile, _downloadFile, value) {
  return to_candid_record_n2(_uploadFile, _downloadFile, value);
}
function to_candid_ApplicationSource_n5(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n6(_uploadFile, _downloadFile, value);
}
function to_candid_ApplicationStatus_n3(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n4(_uploadFile, _downloadFile, value);
}
function to_candid_GetApplicationsArgs_n30(_uploadFile, _downloadFile, value) {
  return to_candid_record_n31(_uploadFile, _downloadFile, value);
}
function to_candid_JobType_n7(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n8(_uploadFile, _downloadFile, value);
}
function to_candid_UpdateApplicationArgs_n40(_uploadFile, _downloadFile, value) {
  return to_candid_record_n41(_uploadFile, _downloadFile, value);
}
function to_candid_UserRole_n19(_uploadFile, _downloadFile, value) {
  return to_candid_variant_n20(_uploadFile, _downloadFile, value);
}
function to_candid_record_n2(_uploadFile, _downloadFile, value) {
  return {
    fitScoreConfidence: value.fitScoreConfidence ? candid_some(value.fitScoreConfidence) : candid_none(),
    status: to_candid_ApplicationStatus_n3(_uploadFile, _downloadFile, value.status),
    aiSuggestion: value.aiSuggestion ? candid_some(value.aiSuggestion) : candid_none(),
    source: to_candid_ApplicationSource_n5(_uploadFile, _downloadFile, value.source),
    jobType: to_candid_JobType_n7(_uploadFile, _downloadFile, value.jobType),
    fitScore: value.fitScore ? candid_some(value.fitScore) : candid_none(),
    tags: value.tags,
    jobUrl: value.jobUrl,
    appliedDate: value.appliedDate,
    notes: value.notes,
    companyName: value.companyName,
    isHighPotential: value.isHighPotential,
    salaryMax: value.salaryMax ? candid_some(value.salaryMax) : candid_none(),
    salaryMin: value.salaryMin ? candid_some(value.salaryMin) : candid_none(),
    position: value.position,
    location: value.location
  };
}
function to_candid_record_n31(_uploadFile, _downloadFile, value) {
  return {
    page: value.page,
    pageSize: value.pageSize,
    statusFilter: value.statusFilter ? candid_some(to_candid_ApplicationStatus_n3(_uploadFile, _downloadFile, value.statusFilter)) : candid_none()
  };
}
function to_candid_record_n41(_uploadFile, _downloadFile, value) {
  return {
    id: value.id,
    fitScoreConfidence: value.fitScoreConfidence ? candid_some(value.fitScoreConfidence) : candid_none(),
    status: to_candid_ApplicationStatus_n3(_uploadFile, _downloadFile, value.status),
    aiSuggestion: value.aiSuggestion ? candid_some(value.aiSuggestion) : candid_none(),
    source: to_candid_ApplicationSource_n5(_uploadFile, _downloadFile, value.source),
    jobType: to_candid_JobType_n7(_uploadFile, _downloadFile, value.jobType),
    fitScore: value.fitScore ? candid_some(value.fitScore) : candid_none(),
    tags: value.tags,
    jobUrl: value.jobUrl,
    appliedDate: value.appliedDate,
    notes: value.notes,
    companyName: value.companyName,
    isHighPotential: value.isHighPotential,
    salaryMax: value.salaryMax ? candid_some(value.salaryMax) : candid_none(),
    salaryMin: value.salaryMin ? candid_some(value.salaryMin) : candid_none(),
    position: value.position,
    location: value.location
  };
}
function to_candid_variant_n20(_uploadFile, _downloadFile, value) {
  return value == "admin" ? {
    admin: null
  } : value == "user" ? {
    user: null
  } : value == "guest" ? {
    guest: null
  } : value;
}
function to_candid_variant_n4(_uploadFile, _downloadFile, value) {
  return value == "Applied" ? {
    Applied: null
  } : value == "Rejected" ? {
    Rejected: null
  } : value == "Interviewing" ? {
    Interviewing: null
  } : value == "Offer" ? {
    Offer: null
  } : value == "Archived" ? {
    Archived: null
  } : value;
}
function to_candid_variant_n6(_uploadFile, _downloadFile, value) {
  return value == "referral" ? {
    referral: null
  } : value == "network" ? {
    network: null
  } : value == "direct" ? {
    direct: null
  } : value == "job_board" ? {
    job_board: null
  } : value == "recruiter" ? {
    recruiter: null
  } : value;
}
function to_candid_variant_n8(_uploadFile, _downloadFile, value) {
  return value == "onsite" ? {
    onsite: null
  } : value == "remote" ? {
    remote: null
  } : value == "hybrid" ? {
    hybrid: null
  } : value;
}
function createActor(canisterId, _uploadFile, _downloadFile, options = {}) {
  const agent = options.agent || HttpAgent.createSync({
    ...options.agentOptions
  });
  if (options.agent && options.agentOptions) {
    console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
  }
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions
  });
  return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
const NS_PER_MS = BigInt(1e6);
function tsToIso(ts) {
  return new Date(Number(ts / NS_PER_MS)).toISOString();
}
function nowTs() {
  return BigInt(Date.now()) * NS_PER_MS;
}
function formatSalary(min, max) {
  if (!min && !max) return void 0;
  const fmt = (n) => `$${(Number(n) / 1e3).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return void 0;
}
function toFrontendApp(b) {
  return {
    id: String(b.id),
    company: b.companyName,
    jobTitle: b.position,
    location: b.location,
    jobType: b.jobType,
    source: b.source,
    status: b.status,
    salary: formatSalary(b.salaryMin, b.salaryMax),
    url: b.jobUrl || void 0,
    notes: b.notes || void 0,
    tags: b.tags,
    appliedAt: tsToIso(b.appliedDate),
    updatedAt: tsToIso(b.lastUpdated),
    fitScore: b.fitScore !== void 0 ? Number(b.fitScore) : void 0,
    fitScoreConfidence: b.fitScoreConfidence !== void 0 ? Number(b.fitScoreConfidence) : void 0,
    remote: b.jobType === JobType.remote,
    isHighPotential: b.isHighPotential,
    aiSuggestion: b.aiSuggestion
  };
}
function toFrontendInsight(b, idx) {
  const cat = b.category.toLowerCase();
  const type = cat.includes("warn") ? "warning" : cat.includes("opp") ? "opportunity" : "tip";
  return {
    id: String(idx),
    type,
    title: b.category,
    message: b.message
  };
}
function useApplications(args) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["applications", args],
    queryFn: async () => {
      if (!actor) return { applications: [], total: 0 };
      const result = await actor.getApplications({
        page: (args == null ? void 0 : args.page) ?? BigInt(1),
        pageSize: (args == null ? void 0 : args.pageSize) ?? BigInt(100),
        statusFilter: args == null ? void 0 : args.statusFilter
      });
      return {
        applications: result.applications.map(toFrontendApp),
        total: Number(result.total)
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
}
function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor)
        return {
          totalApplications: 0,
          byStatus: {
            Applied: 0,
            Interviewing: 0,
            Offer: 0,
            Rejected: 0,
            Archived: 0
          },
          bySource: {},
          byMonth: [],
          responseRate: 0,
          avgTimeToResponse: 0,
          topCompanies: []
        };
      const now = nowTs();
      const fiveYearsAgo = now - BigInt(5 * 365 * 24 * 36e5) * NS_PER_MS;
      const raw = await actor.getAnalytics({
        fromDate: fiveYearsAgo,
        toDate: now
      });
      const byStatus = {
        Applied: 0,
        Interviewing: 0,
        Offer: 0,
        Rejected: 0,
        Archived: 0
      };
      const bySource = {};
      for (const s of raw.bySource) {
        bySource[String(s.source)] = Number(s.count);
      }
      const byMonth = raw.overTime.map((o) => ({
        month: new Date(Number(o.date / NS_PER_MS)).toLocaleDateString(
          "en-US",
          { month: "short" }
        ),
        count: Number(o.count)
      }));
      return {
        totalApplications: Number(raw.total),
        byStatus,
        bySource,
        byMonth,
        responseRate: raw.responseRate,
        avgTimeToResponse: raw.avgTimeToOffer,
        topCompanies: []
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
}
function useInsights() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getInsights();
      return raw.map(toFrontendInsight);
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
}
function useAddApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addApplication(
        args
      );
      return toFrontendApp(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      ue.success("Application added successfully");
    },
    onError: () => {
      ue.error("Failed to add application");
    }
  });
}
function useDeleteApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteApplication(BigInt(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      ue.success("Application deleted");
    },
    onError: () => {
      ue.error("Failed to delete application");
    }
  });
}
function useUpdateApplicationStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateApplicationStatus(BigInt(id), status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      ue.success("Status updated");
    },
    onError: () => {
      ue.error("Failed to update status");
    }
  });
}
function useParseJobUrl() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (url) => {
      if (!actor) throw new Error("Not connected");
      const raw = await actor.parseJobUrl(url);
      return {
        companyName: raw.companyName,
        position: raw.position,
        location: raw.location,
        jobType: raw.jobType,
        salary: formatSalary(raw.salaryMin, raw.salaryMax),
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        fitScore: raw.fitScore !== void 0 ? Number(raw.fitScore) : void 0,
        fitScoreConfidence: raw.fitScoreConfidence !== void 0 ? Number(raw.fitScoreConfidence) : void 0,
        tags: raw.tags,
        notes: raw.notes,
        rawJson: raw.rawJson
      };
    },
    onError: () => {
      ue.error("Failed to parse job URL");
    }
  });
}
export {
  useAddApplication as a,
  useApplications as b,
  useDeleteApplication as c,
  useUpdateApplicationStatus as d,
  useAnalytics as e,
  useInsights as f,
  useParseJobUrl as u
};
