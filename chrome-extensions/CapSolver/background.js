"use strict";
(() => {
    var se = Object.create;
    var P = Object.defineProperty;
    var ie = Object.getOwnPropertyDescriptor;
    var ce = Object.getOwnPropertyNames;
    var le = Object.getPrototypeOf,
        ue = Object.prototype.hasOwnProperty;
    var pe = (e, t, n) => t in e ? P(e, t, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: n
    }) : e[t] = n;
    var E = (e, t) => () => (t || e((t = {
        exports: {}
    }).exports, t), t.exports);
    var fe = (e, t, n, a) => {
        if (t && typeof t == "object" || typeof t == "function")
            for (let o of ce(t)) !ue.call(e, o) && o !== n && P(e, o, {
                get: () => t[o],
                enumerable: !(a = ie(t, o)) || a.enumerable
            });
        return e
    };
    var F = (e, t, n) => (n = e != null ? se(le(e)) : {}, fe(t || !e || !e.__esModule ? P(n, "default", {
        value: e,
        enumerable: !0
    }) : n, e));
    var C = (e, t, n) => (pe(e, typeof t != "symbol" ? t + "" : t, n), n);
    var W = E((Ne, I) => {
        "use strict";
        var y = typeof Reflect == "object" ? Reflect : null,
            O = y && typeof y.apply == "function" ? y.apply : function(t, n, a) {
                return Function.prototype.apply.call(t, n, a)
            },
            T;
        y && typeof y.ownKeys == "function" ? T = y.ownKeys : Object.getOwnPropertySymbols ? T = function(t) {
            return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))
        } : T = function(t) {
            return Object.getOwnPropertyNames(t)
        };

        function de(e) {
            console && console.warn && console.warn(e)
        }
        var K = Number.isNaN || function(t) {
            return t !== t
        };

        function i() {
            i.init.call(this)
        }
        I.exports = i;
        I.exports.once = ye;
        i.EventEmitter = i;
        i.prototype._events = void 0;
        i.prototype._eventsCount = 0;
        i.prototype._maxListeners = void 0;
        var D = 10;

        function k(e) {
            if (typeof e != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof e)
        }
        Object.defineProperty(i, "defaultMaxListeners", {
            enumerable: !0,
            get: function() {
                return D
            },
            set: function(e) {
                if (typeof e != "number" || e < 0 || K(e)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + e + ".");
                D = e
            }
        });
        i.init = function() {
            (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
        };
        i.prototype.setMaxListeners = function(t) {
            if (typeof t != "number" || t < 0 || K(t)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + t + ".");
            return this._maxListeners = t, this
        };

        function B(e) {
            return e._maxListeners === void 0 ? i.defaultMaxListeners : e._maxListeners
        }
        i.prototype.getMaxListeners = function() {
            return B(this)
        };
        i.prototype.emit = function(t) {
            for (var n = [], a = 1; a < arguments.length; a++) n.push(arguments[a]);
            var o = t === "error",
                r = this._events;
            if (r !== void 0) o = o && r.error === void 0;
            else if (!o) return !1;
            if (o) {
                var s;
                if (n.length > 0 && (s = n[0]), s instanceof Error) throw s;
                var c = new Error("Unhandled error." + (s ? " (" + s.message + ")" : ""));
                throw c.context = s, c
            }
            var h = r[t];
            if (h === void 0) return !1;
            if (typeof h == "function") O(h, this, n);
            else
                for (var l = h.length, g = q(h, l), a = 0; a < l; ++a) O(g[a], this, n);
            return !0
        };

        function j(e, t, n, a) {
            var o, r, s;
            if (k(n), r = e._events, r === void 0 ? (r = e._events = Object.create(null), e._eventsCount = 0) : (r.newListener !== void 0 && (e.emit("newListener", t, n.listener ? n.listener : n), r = e._events), s = r[t]), s === void 0) s = r[t] = n, ++e._eventsCount;
            else if (typeof s == "function" ? s = r[t] = a ? [n, s] : [s, n] : a ? s.unshift(n) : s.push(n), o = B(e), o > 0 && s.length > o && !s.warned) {
                s.warned = !0;
                var c = new Error("Possible EventEmitter memory leak detected. " + s.length + " " + String(t) + " listeners added. Use emitter.setMaxListeners() to increase limit");
                c.name = "MaxListenersExceededWarning", c.emitter = e, c.type = t, c.count = s.length, de(c)
            }
            return e
        }
        i.prototype.addListener = function(t, n) {
            return j(this, t, n, !1)
        };
        i.prototype.on = i.prototype.addListener;
        i.prototype.prependListener = function(t, n) {
            return j(this, t, n, !0)
        };

        function he() {
            if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
        }

        function H(e, t, n) {
            var a = {
                    fired: !1,
                    wrapFn: void 0,
                    target: e,
                    type: t,
                    listener: n
                },
                o = he.bind(a);
            return o.listener = n, a.wrapFn = o, o
        }
        i.prototype.once = function(t, n) {
            return k(n), this.on(t, H(this, t, n)), this
        };
        i.prototype.prependOnceListener = function(t, n) {
            return k(n), this.prependListener(t, H(this, t, n)), this
        };
        i.prototype.removeListener = function(t, n) {
            var a, o, r, s, c;
            if (k(n), o = this._events, o === void 0) return this;
            if (a = o[t], a === void 0) return this;
            if (a === n || a.listener === n) --this._eventsCount === 0 ? this._events = Object.create(null) : (delete o[t], o.removeListener && this.emit("removeListener", t, a.listener || n));
            else if (typeof a != "function") {
                for (r = -1, s = a.length - 1; s >= 0; s--)
                    if (a[s] === n || a[s].listener === n) {
                        c = a[s].listener, r = s;
                        break
                    } if (r < 0) return this;
                r === 0 ? a.shift() : ge(a, r), a.length === 1 && (o[t] = a[0]), o.removeListener !== void 0 && this.emit("removeListener", t, c || n)
            }
            return this
        };
        i.prototype.off = i.prototype.removeListener;
        i.prototype.removeAllListeners = function(t) {
            var n, a, o;
            if (a = this._events, a === void 0) return this;
            if (a.removeListener === void 0) return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : a[t] !== void 0 && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete a[t]), this;
            if (arguments.length === 0) {
                var r = Object.keys(a),
                    s;
                for (o = 0; o < r.length; ++o) s = r[o], s !== "removeListener" && this.removeAllListeners(s);
                return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
            }
            if (n = a[t], typeof n == "function") this.removeListener(t, n);
            else if (n !== void 0)
                for (o = n.length - 1; o >= 0; o--) this.removeListener(t, n[o]);
            return this
        };

        function N(e, t, n) {
            var a = e._events;
            if (a === void 0) return [];
            var o = a[t];
            return o === void 0 ? [] : typeof o == "function" ? n ? [o.listener || o] : [o] : n ? me(o) : q(o, o.length)
        }
        i.prototype.listeners = function(t) {
            return N(this, t, !0)
        };
        i.prototype.rawListeners = function(t) {
            return N(this, t, !1)
        };
        i.listenerCount = function(e, t) {
            return typeof e.listenerCount == "function" ? e.listenerCount(t) : U.call(e, t)
        };
        i.prototype.listenerCount = U;

        function U(e) {
            var t = this._events;
            if (t !== void 0) {
                var n = t[e];
                if (typeof n == "function") return 1;
                if (n !== void 0) return n.length
            }
            return 0
        }
        i.prototype.eventNames = function() {
            return this._eventsCount > 0 ? T(this._events) : []
        };

        function q(e, t) {
            for (var n = new Array(t), a = 0; a < t; ++a) n[a] = e[a];
            return n
        }

        function ge(e, t) {
            for (; t + 1 < e.length; t++) e[t] = e[t + 1];
            e.pop()
        }

        function me(e) {
            for (var t = new Array(e.length), n = 0; n < t.length; ++n) t[n] = e[n].listener || e[n];
            return t
        }

        function ye(e, t) {
            return new Promise(function(n, a) {
                function o(s) {
                    e.removeListener(t, r), a(s)
                }

                function r() {
                    typeof e.removeListener == "function" && e.removeListener("error", o), n([].slice.call(arguments))
                }
                V(e, t, r, {
                    once: !0
                }), t !== "error" && Ce(e, o, {
                    once: !0
                })
            })
        }

        function Ce(e, t, n) {
            typeof e.on == "function" && V(e, "error", t, n)
        }

        function V(e, t, n, a) {
            if (typeof e.on == "function") a.once ? e.once(t, n) : e.on(t, n);
            else if (typeof e.addEventListener == "function") e.addEventListener(t, function o(r) {
                a.once && e.removeEventListener(t, o), n(r)
            });
            else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof e)
        }
    });
    var G = E((We, p) => {
        p.exports.boot = function(e) {
            return e
        };
        p.exports.ssrMiddleware = function(e) {
            return e
        };
        p.exports.configure = function(e) {
            return e
        };
        p.exports.preFetch = function(e) {
            return e
        };
        p.exports.route = function(e) {
            return e
        };
        p.exports.store = function(e) {
            return e
        };
        p.exports.bexBackground = function(e) {
            return e
        };
        p.exports.bexContent = function(e) {
            return e
        };
        p.exports.bexDom = function(e) {
            return e
        };
        p.exports.ssrProductionExport = function(e) {
            return e
        };
        p.exports.ssrCreate = function(e) {
            return e
        };
        p.exports.ssrListen = function(e) {
            return e
        };
        p.exports.ssrClose = function(e) {
            return e
        };
        p.exports.ssrServeStaticContent = function(e) {
            return e
        };
        p.exports.ssrRenderPreloadTag = function(e) {
            return e
        }
    });
    var $ = F(W());
    var M, x = 0,
        u = new Array(256);
    for (let e = 0; e < 256; e++) u[e] = (e + 256).toString(16).substring(1);
    var be = (() => {
            let e = typeof crypto != "undefined" ? crypto : typeof window != "undefined" ? window.crypto || window.msCrypto : void 0;
            if (e !== void 0) {
                if (e.randomBytes !== void 0) return e.randomBytes;
                if (e.getRandomValues !== void 0) return t => {
                    let n = new Uint8Array(t);
                    return e.getRandomValues(n), n
                }
            }
            return t => {
                let n = [];
                for (let a = t; a > 0; a--) n.push(Math.floor(Math.random() * 256));
                return n
            }
        })(),
        z = 4096;

    function Q() {
        (M === void 0 || x + 16 > z) && (x = 0, M = be(z));
        let e = Array.prototype.slice.call(M, x, x += 16);
        return e[6] = e[6] & 15 | 64, e[8] = e[8] & 63 | 128, u[e[0]] + u[e[1]] + u[e[2]] + u[e[3]] + "-" + u[e[4]] + u[e[5]] + "-" + u[e[6]] + u[e[7]] + "-" + u[e[8]] + u[e[9]] + "-" + u[e[10]] + u[e[11]] + u[e[12]] + u[e[13]] + u[e[14]] + u[e[15]]
    }
    var ve = {
            undefined: () => 0,
            boolean: () => 4,
            number: () => 8,
            string: e => 2 * e.length,
            object: e => e ? Object.keys(e).reduce((t, n) => S(n) + S(e[n]) + t, 0) : 0
        },
        S = e => ve[typeof e](e),
        b = class extends $.EventEmitter {
            constructor(t) {
                super(), this.setMaxListeners(1 / 0), this.wall = t, t.listen(n => {
                    Array.isArray(n) ? n.forEach(a => this._emit(a)) : this._emit(n)
                }), this._sendingQueue = [], this._sending = !1, this._maxMessageSize = 32 * 1024 * 1024
            }
            send(t, n) {
                return this._send([{
                    event: t,
                    payload: n
                }])
            }
            getEvents() {
                return this._events
            }
            on(t, n) {
                return super.on(t, a => {
                    n({
                        ...a,
                        respond: o => this.send(a.eventResponseKey, o)
                    })
                })
            }
            _emit(t) {
                typeof t == "string" ? this.emit(t) : this.emit(t.event, t.payload)
            }
            _send(t) {
                return this._sendingQueue.push(t), this._nextSend()
            }
            _nextSend() {
                if (!this._sendingQueue.length || this._sending) return Promise.resolve();
                this._sending = !0;
                let t = this._sendingQueue.shift(),
                    n = t[0],
                    a = `${n.event}.${Q()}`,
                    o = a + ".result";
                return new Promise((r, s) => {
                    let c = [],
                        h = l => {
                            if (l !== void 0 && l._chunkSplit) {
                                let g = l._chunkSplit;
                                c = [...c, ...l.data], g.lastChunk && (this.off(o, h), r(c))
                            } else this.off(o, h), r(l)
                        };
                    this.on(o, h);
                    try {
                        let l = t.map(g => ({
                            ...g,
                            payload: {
                                data: g.payload,
                                eventResponseKey: o
                            }
                        }));
                        this.wall.send(l)
                    } catch (l) {
                        let g = "Message length exceeded maximum allowed length.";
                        if (l.message === g && Array.isArray(n.payload)) {
                            let _ = S(n);
                            if (_ > this._maxMessageSize) {
                                let w = Math.ceil(_ / this._maxMessageSize),
                                    oe = Math.ceil(n.payload.length / w),
                                    A = n.payload;
                                for (let L = 0; L < w; L++) {
                                    let re = Math.min(A.length, oe);
                                    this.wall.send([{
                                        event: n.event,
                                        payload: {
                                            _chunkSplit: {
                                                count: w,
                                                lastChunk: L === w - 1
                                            },
                                            data: A.splice(0, re)
                                        }
                                    }])
                                }
                            }
                        }
                    }
                    this._sending = !1, setTimeout(() => this._nextSend(), 16)
                })
            }
        };
    var ne = F(G());
    var we = chrome.runtime.getURL("assets/config.json");
    async function Te() {
        let e = await chrome.storage.local.get("defaultConfig");
        if (e.defaultConfig) return e.defaultConfig;
        let t = {},
            a = await (await fetch(we)).json();
        return a && (t = a, chrome.storage.local.set({
            defaultConfig: t
        })), t
    }
    var v = {
            manualSolving: !1,
            apiKey: "",
            appId: "",
            enabledForImageToText: !0,
            enabledForRecaptchaV3: !0,
            enabledForHCaptcha: !0,
            enabledForGeetestV4: !1,
            recaptchaV3MinScore: .5,
            enabledForRecaptcha: !0,
            enabledForFunCaptcha: !0,
            enabledForDataDome: !1,
            useProxy: !1,
            proxyType: "http",
            hostOrIp: "",
            port: "",
            proxyLogin: "",
            proxyPassword: "",
            enabledForBlacklistControl: !1,
            blackUrlList: [],
            isInBlackList: !1,
            reCaptchaMode: "click",
            reCaptchaDelayTime: 0,
            reCaptchaCollapse: !1,
            reCaptchaRepeatTimes: 10,
            reCaptcha3Mode: "token",
            reCaptcha3DelayTime: 0,
            reCaptcha3Collapse: !1,
            reCaptcha3RepeatTimes: 10,
            hCaptchaMode: "click",
            hCaptchaDelayTime: 0,
            hCaptchaCollapse: !1,
            hCaptchaRepeatTimes: 10,
            funCaptchaMode: "click",
            funCaptchaDelayTime: 0,
            funCaptchaCollapse: !1,
            funCaptchaRepeatTimes: 10,
            geetestMode: "click",
            geetestCollapse: !1,
            geetestDelayTime: 0,
            geetestRepeatTimes: 10,
            textCaptchaMode: "click",
            textCaptchaCollapse: !1,
            textCaptchaDelayTime: 0,
            textCaptchaRepeatTimes: 10,
            enabledForCloudflare: !1,
            cloudflareMode: "click",
            cloudflareCollapse: !1,
            cloudflareDelayTime: 0,
            cloudflareRepeatTimes: 10,
            datadomeMode: "click",
            datadomeCollapse: !1,
            datadomeDelayTime: 0,
            datadomeRepeatTimes: 10,
            enabledForAws: !1,
            awsMode: "click",
            awsCollapse: !1,
            awsDelayTime: 0,
            awsRepeatTimes: 10,
            useCapsolver: !0,
            isInit: !1,
            solvedCallback: "captchaSolvedCallback",
            textCaptchaSourceAttribute: "capsolver-image-to-text-source",
            textCaptchaResultAttribute: "capsolver-image-to-text-result"
        },
        J = {
            proxyType: ["socks5", "http", "https", "socks4"],
            mode: ["click", "token"]
        };
    async function X() {
        let e = await Te(),
            t = Object.keys(e);
        for (let n of t)
            if (!(n === "proxyType" && !J[n].includes(e[n]))) {
                {
                    if (n.endsWith("Mode") && !J.mode.includes(e[n])) continue;
                    if (n === "port") {
                        if (typeof e[n] != "number") continue;
                        v[n] = e[n]
                    }
                }
                Reflect.has(v, n) && typeof v[n] == typeof e[n] && (v[n] = e[n])
            } return v
    }
    var ke = X(),
        d = {
            default: ke,
            async get(e) {
                return (await this.getAll())[e]
            },
            async getAll() {
                let e = await X(),
                    t = await chrome.storage.local.get("config");
                return d.joinConfig(e, t.config)
            },
            async set(e) {
                let t = await d.getAll(),
                    n = d.joinConfig(t, e);
                return chrome.storage.local.set({
                    config: n
                })
            },
            joinConfig(e, t) {
                let n = {};
                if (e)
                    for (let a in e) n[a] = e[a];
                if (t)
                    for (let a in t) n[a] = t[a];
                return n
            }
        };

    function Z(e) {
        e.on("storage.get", ({
            data: t,
            respond: n
        }) => {
            let {
                key: a
            } = t;
            a === null ? chrome.storage.local.get(null, o => {
                n(Object.values(o))
            }) : chrome.storage.local.get([a], o => {
                n(o[a])
            })
        }), e.on("storage.set", ({
            data: t,
            respond: n
        }) => {
            chrome.storage.local.set({
                [t.key]: t.value
            }, () => {
                n()
            })
        }), e.on("storage.remove", ({
            data: t,
            respond: n
        }) => {
            chrome.storage.local.remove(t.key, () => {
                n()
            })
        }), e.on("config", async ({
            respond: t
        }) => {
            let n = await d.getAll();
            t(n).then()
        })
    }

    function Y(e) {
        e.on("log", ({
            data: t,
            respond: n
        }) => {
            console.log(`[BEX] ${t.message}`, ...t.data || []), n()
        })
    }
    var R = class {
        constructor(t) {
            C(this, "baseURL");
            this.baseURL = t
        }
        async post(t, n, a) {
            let o = await fetch(this.getURL(t), {
                method: "POST",
                body: JSON.stringify(n),
                headers: {
                    "Content-Type": "application/json"
                },
                ...a
            });
            return {
                status: o.status,
                statusText: o.statusText,
                data: await o.json(),
                headers: o.headers
            }
        }
        getURL(t) {
            return this.baseURL + t
        }
    };
    var f = class {
        constructor(t) {
            C(this, "options", {
                apiKey: "",
                service: "https://api.capsolver.com",
                defaultTimeout: 120,
                pollingInterval: 5,
                recaptchaTimeout: 600
            });
            C(this, "http");
            for (let n in this.options) this.options[n] = t[n] === void 0 ? this.options[n] : t[n];
            this.http = new R(this.options.service)
        }
        static async API(t) {
            let n = await d.getAll();
            if (!(t != null && t.apiKey) && !(n != null && n.apiKey)) throw new Error("Capsover: No API Kye set up yet!");
            return new f({
                apiKey: n.apiKey,
                ...t
            })
        }
        async getProxyParams(t) {
            let n = await d.getAll();
            return {
                proxyType: n.proxyType,
                proxyAddress: n.hostOrIp,
                proxyPort: n.port,
                proxyLogin: n.proxyLogin,
                proxyPassword: n.proxyPassword,
                type: t.type.replace("ProxyLess", "")
            }
        }
        async getBalance() {
            var n, a, o;
            let t = await this.http.post("/getBalance", {
                clientKey: this.options.apiKey
            });
            if (t.status !== 200 || ((n = t.data) == null ? void 0 : n.errorCode) || ((a = t.data) == null ? void 0 : a.errorId)) throw new Error(((o = t.data) == null ? void 0 : o.errorDescription) || "createTask fail\uFF01");
            return t.data
        }
        async createTaskResult(t, n) {
            n || (n = {
                timeout: this.options.defaultTimeout,
                pollingInterval: this.options.pollingInterval
            });
            let a = await d.getAll();
            if (a.appId && (t.appId = a.appId), a.useProxy) {
                let l = await this.getProxyParams(t.task);
                Object.assign(t.task, l)
            }
            let o = await this.createTask(t),
                {
                    taskId: r
                } = o,
                s = this.getTime(),
                c = n.timeout === void 0 ? this.options.defaultTimeout : n.timeout,
                h = n.pollingInterval === void 0 ? this.options.pollingInterval : n.pollingInterval;
            for (; !(this.getTime() - s > c);) {
                await new Promise(g => setTimeout(g, h * 1e3));
                let l = await this.getTaskSolution({
                    taskId: r
                });
                if (l.status === "ready") return l
            }
            throw new Error("Timeout " + c + " seconds reached")
        }
        async createTask(t) {
            var a, o, r;
            let n = await this.http.post("/createTask", {
                clientKey: this.options.apiKey,
                ...t
            });
            if (n.status !== 200 || ((a = n.data) == null ? void 0 : a.errorCode) || ((o = n.data) == null ? void 0 : o.errorId)) throw new Error(((r = n.data) == null ? void 0 : r.errorDescription) || "createTask fail\uFF01");
            if (!n.data.taskId) throw new Error("taskIs is empty!");
            return n.data
        }
        async getTaskSolution({
            taskId: t
        }) {
            var a, o, r;
            let n = await this.http.post("/getTaskResult", {
                clientKey: this.options.apiKey,
                taskId: t
            });
            if (n.status !== 200 || ((a = n.data) == null ? void 0 : a.errorCode) || ((o = n.data) == null ? void 0 : o.errorId)) throw new Error(((r = n.data) == null ? void 0 : r.errorDescription) || "getTaskResult fail\uFF01");
            return n.data
        }
        async createRecognitionTask(t) {
            var o, r, s;
            let n = await d.getAll();
            n.appId && (t.appId = n.appId);
            let a = await this.http.post("/createTask", {
                clientKey: this.options.apiKey,
                ...t
            });
            if (a.status !== 200 || ((o = a.data) == null ? void 0 : o.errorCode) || ((r = a.data) == null ? void 0 : r.errorId) !== 0) throw new Error(((s = a.data) == null ? void 0 : s.errorDescription) || "createTask fail\uFF01");
            if (!a.data.taskId) throw new Error("taskIs is empty!");
            return a.data
        }
        getTime() {
            return parseInt(String(Date.now() / 1e3))
        }
    };

    function te(e, t, n) {
        let {
            action: a
        } = e;
        return d.getAll().then(o => {
            switch (a) {
                case "solver":
                    o[`${e.captchaType}Mode`] === "click" ? Le(e).then(r => {
                        n({
                            response: r
                        })
                    }) : Re(e, o).then(r => {
                        n({
                            response: r
                        })
                    });
                    break;
                case "execute":
                    ee({
                        command: "execute"
                    });
                    break;
                case "solved":
                    ee({
                        response: {
                            action: "solved"
                        }
                    });
                    break;
                case "callback":
                    xe(o);
                    break
            }
        }), a === "solver"
    }
    async function ee(e) {
        let t = await chrome.tabs.query({
            currentWindow: !0,
            active: !0
        });
        for (let n of t) chrome.tabs.sendMessage(n.id, e)
    }
    async function xe(e) {
        let t = await chrome.tabs.query({
            currentWindow: !0,
            active: !0
        });
        for (let n of t) chrome.scripting.executeScript({
            args: [e],
            target: {
                tabId: n.id
            },
            world: "MAIN",
            func: a => {
                window[a.solvedCallback] && window[a.solvedCallback]()
            }
        })
    }
    async function Re(e, t) {
        let {
            captchaType: n,
            widgetId: a,
            params: o,
            action: r
        } = e, s = {
            action: r,
            request: {
                captchaType: n,
                widgetId: a
            }
        };
        if (!o) return s.error = "params is error!", s;
        try {
            s.response = await Pe(n, o, t)
        } catch (c) {
            s.error = String(c)
        }
        return s
    }
    async function Le(e) {
        let {
            captchaType: t,
            params: n,
            action: a
        } = e, o = {
            action: a,
            request: {
                captchaType: t
            }
        };
        if (!n) return o.error = "params is error!", o;
        n.hasOwnProperty("index") && (o.index = n.index), n.hasOwnProperty("id") && (o.id = n.id);
        try {
            o.response = await Ie(t, n)
        } catch (r) {
            o.error = String(r)
        }
        return o
    }
    async function Pe(e, t, n) {
        let a = {
            code: "",
            status: "processing"
        };
        switch (e) {
            case "hCaptcha": {
                let o = await Me(t);
                a.code = o.solution.gRecaptchaResponse, a.status = o.status;
                break
            }
            case "reCaptcha": {
                let o = await Se(t);
                a.code = o.solution.gRecaptchaResponse, a.status = o.status;
                break
            }
            case "funCaptcha": {
                let o = await Ae(t);
                a.code = o.solution.token, a.status = o.status;
                break
            }
            case "reCaptcha3": {
                let o = await _e(t);
                a.code = o.solution.gRecaptchaResponse, a.status = o.status;
                break
            }
            case "cloudflare": {
                let o = await Ee(t);
                a.code = o.solution.token, a.status = o.status;
                break
            }
            default:
                throw new Error("do not support captchaType: " + e)
        }
        return a
    }
    async function Ie(e, t) {
        let n = {
            status: "processing"
        };
        switch (e) {
            case "funCaptcha": {
                let a = await Fe(t);
                n.status = a.status, n.solution = a.solution;
                break
            }
            case "hCaptcha": {
                let a = await Oe(t);
                n.status = a.status, n.solution = a.solution;
                break
            }
            case "reCaptcha": {
                let a = await De(t);
                n.status = a.status, n.solution = a.solution;
                break
            }
            case "textCaptcha": {
                let a = await Ke(t);
                n.status = a.status, n.solution = a.solution;
                break
            }
            default:
                throw new Error("do not support captchaType: " + e)
        }
        return n
    }
    async function Me(e) {
        return await (await f.API()).createTaskResult({
            task: {
                type: "HCaptchaTaskProxyLess",
                websiteURL: e.url,
                websiteKey: e.sitekey
            }
        })
    }
    async function Se(e) {
        return await (await f.API()).createTaskResult({
            task: {
                type: "ReCaptchaV2TaskProxyLess",
                websiteURL: e.url,
                websiteKey: e.sitekey,
                enterprisePayload: {
                    s: e.s
                }
            }
        })
    }
    async function _e(e) {
        return await (await f.API()).createTaskResult({
            task: {
                type: "ReCaptchaV3TaskProxyLess",
                websiteURL: e.url,
                websiteKey: e.sitekey,
                pageAction: e.action,
                enterprisePayload: {
                    s: e.s
                }
            }
        })
    }
    async function Ae(e) {
        return await (await f.API()).createTaskResult({
            task: {
                type: "FunCaptchaTaskProxyLess",
                websiteURL: e.websiteURL,
                websitePublicKey: e.websitePublicKey
            }
        })
    }
    async function Ee(e) {
        return await (await f.API()).createTaskResult({
            task: {
                type: "",
                websiteURL: e.websiteURL,
                websitePublicKey: e.websiteKey,
                metaData: {
                    type: e.type
                }
            }
        })
    }
    async function Fe(e) {
        return await (await f.API()).createRecognitionTask({
            task: {
                type: "FunCaptchaClassification",
                images: [e.image],
                question: e.question
            }
        })
    }
    async function Oe(e) {
        return await (await f.API()).createRecognitionTask({
            task: {
                type: "HCaptchaClassification",
                queries: e.queries,
                question: e.question
            }
        })
    }
    async function De(e) {
        return await (await f.API()).createRecognitionTask({
            task: {
                type: "ReCaptchaV2Classification",
                image: e.image,
                question: e.question
            }
        })
    }
    async function Ke(e) {
        return await (await f.API()).createRecognitionTask({
            task: {
                type: "ImageToTextTask",
                body: e.body
            }
        })
    }
    chrome.runtime.onConnect.addListener(() => {
        console.log("CapSolver is connect")
    });
    chrome.runtime.onMessage.addListener(te);
    var ae = (0, ne.bexBackground)(e => {
        Y(e), Z(e)
    });
    var m = {},
        Be = e => {
            let t = e.sender.tab,
                n;
            if (e.name.indexOf(":") > -1) {
                let o = e.name.split(":");
                n = o[1], e.name = o[0]
            }
            t !== void 0 && (n = t.id);
            let a = m[n];
            return a || (a = m[n] = {}), a[e.name] = {
                port: e,
                connected: !0,
                listening: !1
            }, a[e.name]
        };
    chrome.runtime.onConnect.addListener(e => {
        let t = Be(e);
        t.port.onDisconnect.addListener(() => {
            t.connected = !1
        });
        let n = new b({
            listen(a) {
                for (let o in m) {
                    let r = m[o];
                    r.app && !r.app.listening && (r.app.listening = !0, r.app.port.onMessage.addListener(a)), r.contentScript && !r.contentScript.listening && (r.contentScript.port.onMessage.addListener(a), r.contentScript.listening = !0)
                }
            },
            send(a) {
                for (let o in m) {
                    let r = m[o];
                    r.app && r.app.connected && r.app.port.postMessage(a), r.contentScript && r.contentScript.connected && r.contentScript.port.postMessage(a)
                }
            }
        });
        ae(n, m);
        for (let a in m) {
            let o = m[a];
            o.app && o.contentScript && je(o.app, o.contentScript)
        }
    });

    function je(e, t) {
        e.port.onMessage.addListener(n => {
            t.connected && t.port.postMessage(n)
        }), t.port.onMessage.addListener(n => {
            e.connected && e.port.postMessage(n)
        })
    }

    const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
    chrome.runtime.onStartup.addListener(keepAlive);
    keepAlive();
})();
