const { Socket, createServer, connect } = require("net");
const { SecureContextOptions, createSecureContext } = require("tls");
const fs = require("fs");
const { upgradeSocket } = (function () {
  let exports = {};
  ("use strict");
  var __assign =
    (this && this.__assign) ||
    function () {
      __assign =
        Object.assign ||
        function (t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
        };
      return __assign.apply(this, arguments);
    };
  var __values =
    (this && this.__values) ||
    function (o) {
      var s = typeof Symbol === "function" && Symbol.iterator,
        m = s && o[s],
        i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          },
        };
      throw new TypeError(
        s ? "Object is not iterable." : "Symbol.iterator is not defined."
      );
    };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.isUpgraded = exports.upgradeSocket = void 0;
  var tls_1 = require("tls");
  /**
   * Upgrades a regular socket to a TLSSocket.
   * @param socket
   * @param options
   * @returns Upgraded socket.
   */
  function upgradeSocket(socket, socketOptions) {
    var e_1, _a, e_2, _b;
    var events = {};
    try {
      // Remove event listeners to ensure the data listener is not called with garbage.
      // Those will be reattached later to the upgraded socket.
      for (
        var _c = __values([] /*socket.eventNames()*/), _d = _c.next();
        !_d.done;
        _d = _c.next()
      ) {
        var eventName = _d.value;
        events[eventName] = [];
        //var listeners = socket.listeners(eventName);
        //try {
        //    for (var listeners_1 = (e_2 = void 0, __values(listeners)), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
        //        var listener = listeners_1_1.value;
        //        events[eventName].push(listener);
        //    }
        //}
        //catch (e_2_1) { e_2 = { error: e_2_1 }; }
        //finally {
        //    try {
        //        if (listeners_1_1 && !listeners_1_1.done && (_b = listeners_1.return)) _b.call(listeners_1);
        //    }
        //    finally { if (e_2) throw e_2.error; }
        //}
        //socket.removeAllListeners(eventName);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return new Promise(function (resolve, reject) {
      var error = function (err) {
        var e_3, _a, e_4, _b;
        try {
          // Reattach event listeners to the original socket.
          for (
            var _c = __values(Object.keys(events)), _d = _c.next();
            !_d.done;
            _d = _c.next()
          ) {
            var eventName = _d.value;
            try {
              for (
                var _e = ((e_4 = void 0), __values(events[eventName])),
                  _f = _e.next();
                !_f.done;
                _f = _e.next()
              ) {
                var listener = _f.value;
                socket.addListener(eventName, listener);
              }
            } catch (e_4_1) {
              e_4 = { error: e_4_1 };
            } finally {
              try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
              } finally {
                if (e_4) throw e_4.error;
              }
            }
          }
        } catch (e_3_1) {
          e_3 = { error: e_3_1 };
        } finally {
          try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
          } finally {
            if (e_3) throw e_3.error;
          }
        }
        reject(err);
      };
      var isServer = !!socket.server;
      var tlsSocket = isServer
        ? new tls_1.TLSSocket(
            socket,
            __assign({ isServer: true }, socketOptions)
          )
        : (0, tls_1.connect)(__assign({ socket: socket }, socketOptions));
      tlsSocket.tcpSocket = socket;
      // If we get an error here or the socket is closed,
      // it's almost definitely due to the upgrade failing.
      tlsSocket.once("error", function (err) {
        return error(err);
      });
      tlsSocket.once("close", function () {
        return error(new Error("Socket closed unexpectedly."));
      });
      tlsSocket.once(isServer ? "secure" : "secureConnect", function () {
        var e_5, _a, e_6, _b;
        // Ensure the socket is secure.
        if (!isUpgraded(tlsSocket)) {
          error(new Error("Unable to upgrade socket."));
          return;
        }
        // Ensure all the temporary listeners are removed.
        tlsSocket.removeAllListeners("error");
        tlsSocket.removeAllListeners("close");
        try {
          // Reattach event listeners to the upgraded socket.
          for (
            var _c = __values(Object.keys(events)), _d = _c.next();
            !_d.done;
            _d = _c.next()
          ) {
            var eventName = _d.value;
            try {
              for (
                var _e = ((e_6 = void 0), __values(events[eventName])),
                  _f = _e.next();
                !_f.done;
                _f = _e.next()
              ) {
                var listener = _f.value;
                tlsSocket.addListener(eventName, listener);
              }
            } catch (e_6_1) {
              e_6 = { error: e_6_1 };
            } finally {
              try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
              } finally {
                if (e_6) throw e_6.error;
              }
            }
          }
        } catch (e_5_1) {
          e_5 = { error: e_5_1 };
        } finally {
          try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
          } finally {
            if (e_5) throw e_5.error;
          }
        }
        resolve(tlsSocket);
      });
    });
  }
  exports.upgradeSocket = upgradeSocket;
  /**
   * Determine whether the socket provided is secure or not.
   * @param socket
   * @returns
   */
  function isUpgraded(socket) {
    return socket instanceof tls_1.TLSSocket && socket.encrypted;
  }
  exports.isUpgraded = isUpgraded;
  return exports;
})();

// Load certificates for your server connections.
const secureContext = createSecureContext({
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
});

const server = createServer(async (socket) => {
  //console.log(socket._handle.__proto__)
  let buffer = [];
  let stopIt = false;
  upgradeSocket(
    new Proxy(
      {
        server: true,
        _handle: {},
        pause: socket.pause.bind(socket),
        end: socket.end.bind(socket),
        on: socket.on.bind(socket),
        once: socket.once.bind(socket),
        resume: socket.resume.bind(socket),
        destroy: () => {},
      },
      {
        get: (o, k) => {
          if (typeof o[k] == "function") {
            return function (...a) {
              if (stopIt) return;
              if (k == "on" && a[0] == "data") {
                let realDataListener = a[1];
                a[1] = function (...a) {
                  if (stopIt) return;
                  buffer.push(a[0]);
                  return realDataListener(...a);
                };
              }
              return o[k](...a);
            };
          } else return o[k];
        },
      }
    ),
    {
      secureContext,
      rejectUnauthorized: false,
      SNICallback: function (hostname, cb) {
        //console.log(this.tcpSocket)
        console.log("hostname is", hostname);
        const client = new Socket();
        let that = this;
        // Send a connection request to the server.
        stopIt = true;
        this.destroy();
        client.connect({ port: 443, host: hostname }, function () {
          console.log("connected");
          client.pipe(socket);
          socket.pipe(client);
          for (let b of buffer) client.write(b);
        });
      },
    }
  ).catch((e) => {});
});

server.listen(8114, "0.0.0.0");
