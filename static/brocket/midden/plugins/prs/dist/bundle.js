var Export =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileOverview
	 * @name index.js
	 * @author Gavin Coombes
	 * @license BSD-3-Clause
	 */
	'use strict';
	
	var Export = __webpack_require__(/*! ./src/export */ 1);
	module.exports = Export;


/***/ },
/* 1 */
/*!***********************!*\
  !*** ./src/export.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileOverview
	 * @name export.js
	 * @author Gavin Coombes
	 * @license
	 */
	
	'use strict';
	
	var Relay = __webpack_require__(/*! dpaw-brocket-relay */ 2);
	
	var defaultOpts = {
	  baseAddr: "wss://brocket.dpaw.wa.gov.au",
	  channel: 'dendrite',
	  appID: 'prs',
	  userID: 'gavinco'
	};
	
	var Export = {
	
	  init: function init(opts) {
	    var self = this;
	    var relay = Object.create(Relay);
	    relay.init(opts || defaultOpts);
	
	    relay.on('message', function (msg) {
	      return console.log('monorail.plugin received msg', msg);
	    });
	    relay.on('dispatch', function (msg) {
	      return console.log('monorail.plugin dispatched msg', msg);
	    });
	    relay.subscribe(function (msg) {
	      return console.log('Monorail.plugin: Subscriber received msg ', msg);
	    });
	
	    relay.connect();
	    self.relay = relay;
	    // Tags are formed appID:db:op
	    self.tag = opts.appID + ':map:transport_map';
	    self.dispatch = relay.dispatch.bind(relay);
	  },
	
	  'export': function _export(args) {
	    var appMap = harvest(args);
	    var urMap = transform(appMap);
	    var msg = { tag: self.tag, payload: urMap };
	    self.dispatch(msg);
	  },
	
	  destroy: function destroy() {
	    var self = this;
	    self.relay.destroy();
	  },
	
	  _harvest: harvest,
	  _transform: transform
	
	};
	
	/**
	 * Harvest the extent and geojson data
	 * @param {Object} map - A Leaflet map instance
	 * @param {Object} geojson - A valid geojson object
	 * @returns {Object} - A representation of the map in app terms
	 */
	function harvest(map, geojson) {
	  check_map(map);
	  check_geojson(geojson);
	  var appMap = {
	    bounds: map.getBounds(),
	    features: geojson
	  };
	  return appMap;
	}
	function transform(appMap) {
	  check_exists(appMap);
	  var urMap = {
	    'base': {
	      'bounds': urBounds(appMap.bounds),
	      'projection': ''
	    },
	    'tileLayers': {},
	    'featureLayers': {
	      'feature_abc': {
	        'id': 'feature_abc',
	        'data_source': '$ref',
	        'path': ['root', 'data', 'feature_abc'],
	        'layer_name': 'referral',
	        'provider': 'ogr'
	      }
	    },
	    'layout': {
	      'container': {
	        'width': null,
	        'height': null,
	        'orientation': null
	      },
	      'layers': ['feature_abc'],
	      'widgets': []
	    },
	    'widgets': {},
	    'data': {
	      'feature_abc': appMap.features
	    }
	  };
	  return urMap;
	}
	
	function urBounds(bs) {
	  var urBounds = {
	    minLon: bs._southWest.lng,
	    minLat: bs._southWest.lat,
	    maxLon: bs._northEast.lng,
	    maxLat: bs._northEast.lat
	  };
	  return urBounds;
	}
	
	module.exports = Export;
	
	function check_map(map) {
	  if (map != null && typeof map.getBounds === 'function') {
	    return;
	  } else {
	    throw new TypeError('map object must have getBounds method');
	  }
	}
	
	function check_geojson(geojson) {
	  if (geojson != null && typeof geojson === 'object') {
	    return;
	  } else {
	    throw TypeError('geojson object must be valid');
	  }
	}
	
	function check_exists(value, name) {
	  if (value != null && typeof value === 'object') {
	    return;
	  } else {
	    throw TypeError((name ? name : 'value') + ' object must be valid');
	  }
	}

/***/ },
/* 2 */
/*!***************************************!*\
  !*** ./~/dpaw-brocket-relay/index.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Relay = __webpack_require__(/*! ./src/relay.js */ 3);
	
	module.exports = Relay;

/***/ },
/* 3 */
/*!*******************************************!*\
  !*** ./~/dpaw-brocket-relay/src/relay.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileOverview
	 * @name relay.js
	 * @author Gavin Coombes
	 * @license MIT
	 * @version 0.2.0
	 * @module relay
	 *
	 * A brocket relay using the EventEmitter interface
	 *
	 */
	'use strict';
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }
	
	var events = __webpack_require__(/*! events */ 4);
	var WebSocket = __webpack_require__(/*! reconnectingwebsocket */ 5);
	var utility = __webpack_require__(/*! ./utility */ 6);
	// Aliases
	var EventEmitter = events.EventEmitter;
	var u = utility;
	var log = utility.log;
	
	var MODE = {
	  RECV: 0,
	  DUPLEX: 1,
	  SEND: 2
	};
	
	/**
	 * Separator for network level tags
	 * @const {string}
	 */
	var TAG_SEP = '|';
	
	/**
	 * Default websocket scheme
	 * @const {string}
	 */
	var WEBSOCKET_PROTOCOLS = 'wss';
	
	/**
	 * Default websocket options - mirror ReconnectingSocket defaults
	 * @const {object}
	 */
	var WEBSOCKET_OPTIONS = {
	  /* Unless noted, these are the ReconnectingSocket defaults */
	  debug: false, // default: false
	  automaticOpen: false, // default: true
	  reconnectInterval: 1000,
	  maxReconnectInterval: 30 * 1000,
	  reconnectDecay: 1.5,
	  timeoutInterval: 2000,
	  maxReconnectAttempts: null,
	  binaryType: 'blob'
	};
	
	/**
	 * Default relay options
	 * @const {object}
	 */
	var DEFAULT_OPTIONS = {
	  baseAddr: undefined,
	  channel: 'dendrite',
	  appID: undefined,
	  userID: undefined, // Must be provided to init
	  connID: undefined, // Generate on init
	  pulse: 30 * 1000, /* ms */
	  recvMode: 1,
	  sendMode: 1,
	  conchMode: 1,
	  ignoreEcho: false,
	  wrapping: true, // Wrap app messages with network tags
	  webSocketOptions: WEBSOCKET_OPTIONS
	};
	
	/**
	 * Prototype object of the Relay class
	 * @implements EventEmitter
	 * @class
	 */
	var RelayModule = (function () {
	  var obj = Object.create(new events.EventEmitter());
	  obj.$type = "RelayModule";
	  return obj;
	})();
	
	/**
	 * The central Relay class
	 * @class
	 *
	 */
	var RelayObject = Object.create(RelayModule);
	
	/**
	 * Initialise a relay object with options
	 * @function
	 *
	 * @param {object} [opts] - Sensible defaults if omitted.
	 */
	RelayObject.init = function init(opts) {
	  var self = this;
	  self.opts = u.defaults({}, opts, DEFAULT_OPTIONS);
	
	  // get/set properties
	  self.recvMode = u.prop(self.opts.recvMode);
	  self.sendMode = u.prop(self.opts.sendMode);
	  self.conchMode = u.prop(self.opts.conchMode);
	  self._channel = u.prop(self.opts.channel);
	
	  var _ws_addresses = ws_addresses(self.opts.baseAddr, self._channel());
	
	  var _ws_addresses2 = _slicedToArray(_ws_addresses, 2);
	
	  self.pubAddr = _ws_addresses2[0];
	  self.subAddr = _ws_addresses2[1];
	
	  self.message$ = null;
	
	  self.opts.connID = u._s6();
	  self.tag = [self.opts.appID, self.opts.userID, self.opts.connID].join(TAG_SEP);
	  self.subscriptions = Object.create({}); // Empty and no prototype
	
	  if (self.opts.automaticOpen) self.connect();
	};
	
	/**
	 * Ensures that the websocket reconnect with new address on channel change
	 *
	 * @property {string} - The name of the brocket channel.
	 * @param {String} value
	 * @returns {String | undefined}
	 */
	RelayObject.channel = function (value) {
	  var self = this;
	  if (arguments.length) {
	    self._channel(value);
	
	    var _ws_addresses3 = ws_addresses(self.opts.baseAddr, self._channel());
	
	    var _ws_addresses32 = _slicedToArray(_ws_addresses3, 2);
	
	    self.pubAddr = _ws_addresses32[0];
	    self.subAddr = _ws_addresses32[1];
	
	    self.reconnect();
	  }
	  return self._channel();
	};
	
	/**
	 * Open the publish and subscribe websockets
	 * @function
	 */
	RelayObject.connect = function connect() {
	  var self = this;
	  self._connect(WebSocket, self.opts.webSocketOptions);
	};
	
	RelayObject._connect = function _connect(WebSocket, opts) {
	  var self = this;
	  /* WebSocket(url, protocals, options) */
	  var pws = new WebSocket(self.pubAddr, null, opts);
	  pws.addEventListener('open', function (v) {
	    return self.emit('pub/open');
	  });
	  // pws.addEventListener('open', v => log('Opening ' + self.pubAddr));
	  pws.addEventListener('close', function () {
	    return self.emit('pub/close');
	  });
	  // pws.addEventListener('close', v => log('Closing ' + self.pubAddr));
	  pws.addEventListener('error', function (evt) {
	    return self.emit('pub/error', evt);
	  });
	  pws.addEventListener('error', function (evt) {
	    return self.emit('error', evt);
	  });
	  pws.open();
	  self.pubWS = pws;
	
	  self.subWS = new WebSocket(self.subAddr, null, opts);
	  self.subWS.addEventListener('open', function (evt) {
	    return self.emit('sub/open');
	  });
	  self.subWS.addEventListener('open', function (v) {
	    return log('Opening ' + self.subAddr);
	  });
	  self.subWS.addEventListener('close', function (evt) {
	    return self.emit('sub/close', evt);
	  });
	  self.subWS.addEventListener('error', function (evt) {
	    return self.emit('sub/error', evt);
	  });
	  self.subWS.addEventListener('error', function (evt) {
	    return self.emit('error', evt);
	  });
	  self.subWS.addEventListener('message', function (evt) {
	    return self.receive(evt);
	  });
	
	  // self.addEventListener('sub/close', v => log('Closing ' + self.subAddr));
	
	  self.subWS.open();
	  self.emit('beat', 'Connecting');
	};
	
	RelayObject.inject_rx = function inject_rx(Rx) {
	  // To avoid the rather heavy dependency of Rx, use inject a local dependency.
	  var self = this;
	  var message$ = Rx.Observable.fromEvent(self, 'receive');
	  var messageSubject = new Rx.BehaviorSubject();
	  message$.subscribe(messageSubject);
	  self.message$ = messageSubject;
	};
	
	/**
	 * Close and reopen the sockets, no timeout
	 */
	RelayObject.reconnect = function reconnect() {
	  var self = this;
	  if (self.pubWS) self.pubWS.close();
	  if (self.subWS) self.subWS.close();
	  self.connect();
	},
	
	/**
	 * Relay each network message
	 *
	 * @function
	 *
	 */
	RelayObject.receive = function receive(evt) {
	  var self = this;
	  // Ignore if in broadcast mode
	  if (self.recvMode < 1) return;
	
	  var tag, payload;
	  if (self.opts.wrapping) {
	    var _msg2 = self.deserialise(evt.data);
	    var unwrapped = self.unwrap(_msg2);
	    tag = unwrapped.tag;
	    payload = unwrapped.payload;
	  } else {
	    var _msg3 = self.deserialise(evt.data);
	    tag = _msg3.tag;
	    payload = _msg3.payload;
	  }
	
	  var _tag$split = tag.split(TAG_SEP);
	
	  var _tag$split2 = _slicedToArray(_tag$split, 3);
	
	  var appID = _tag$split2[0];
	  var userID = _tag$split2[1];
	  var connID = _tag$split2[2];
	
	  /* Bail out on echos */
	  if (self.opts.ignoreEcho && self.opts.connID === connID) {
	    log('Echo ignored. connID: ' + self.opts.connID);
	    return;
	  }
	  var msg = { tag: tag, payload: payload };
	  self.broadcast(msg);
	  self.emit('receive', msg);
	},
	
	/**
	 * Send a message into the Brocket network
	 *
	 * @function
	 * @param {object} msg - Must have tag and payload properties
	 */
	RelayObject.dispatch = function dispatch(msg) {
	  // log('Relay.dispatch: before wrap, msg is ', msg);
	  var self = this;
	  var outmsg = undefined;
	  if (self.sendMode < 1) return;
	  if (self.opts.wrapping) {
	    var wrapped_msg = self.wrap(msg);
	    outmsg = self.serialise(wrapped_msg);
	  } else {
	    outmsg = self.serialise(msg);
	  }
	  if (self.pubWS.readyState === 1) {
	    self.emit('dispatch', msg);
	    self.pubWS.send(outmsg);
	  } else {
	    console.warn('Websocket is not open! Message dropped is ', msg);
	  }
	};
	
	/**
	 *
	 * Register a callback for every message.
	 * var f = msg => log('Received msg ', msg);
	 * relay.subscribe(f)
	 *
	 * Register a callback for messages with an appTag of 'bounds'
	 * var g = msg => log('Received bounds message');
	 * relay.subscribe('bounds', g)
	 *
	 * @function
	 * @param {...args}
	 * args can be single callback for all messages
	 * or tag, cb to set a listener for a specific tag.
	 */
	RelayObject.subscribe = function subscribe() {
	  var self = this;
	
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var tag = args[0];
	  var cb = args[1];
	
	  if (!cb) {
	    ;
	    var _ref = ['global', tag];
	    tag = _ref[0];
	    cb = _ref[1];
	  }self.subscriptions = addSubscription(self.subscriptions, tag, cb);
	}, RelayObject.dispatchStream = function dispatchStream(outgoing$) {
	  // Use relay.dispatchStream(outgoing$)
	  var dispatch = self.dispatch.bind(self);
	  outgoing$.subscribe(dispatch);
	};
	
	/** Relay a message from the Brocket network to subscribed listeners
	 *  The message will go to every global listener,
	 *  but only by tag to tagged listeners
	 *
	 * @param {object} - With tag, payload properties
	 */
	RelayObject.broadcast = function broadcast(msg) {
	  var self = this;
	  var subs = self.subscriptions;
	  var tag = msg.tag;
	  var payload = msg.payload;
	
	  sendBroadcast(subs.global, msg);
	  sendBroadcast(subs[tag], payload);
	  /**
	    * @event RelayObject#broadcast
	    * @type {object}
	    * @property (object} msg - The broadcast message)
	   */
	  self.emit('broadcast', msg);
	};
	
	/**
	 * Destroy all the thingz, with a timeout for slow sockets
	 * @function
	 */
	RelayObject.destroy = function destroy(timeout) {
	  var self = this;
	  timeout = timeout || 100;
	  closeSocket(self.pubWS, timeout);
	  closeSocket(self.subWS, timeout);
	};
	
	RelayObject.wrap = function wrap(_msg) {
	  /** Application message -> Network message */
	  var self = this;
	  var msg = { tag: self.tag,
	    payload: _msg };
	  return msg;
	};
	
	RelayObject.unwrap = function unwrap(_payload) {
	  var self = this;
	  // Unwraps a payload into tag and payload
	  var tag = _payload.tag;
	  var payload = _payload.payload;
	
	  return payload;
	};
	
	RelayObject.serialise = function serialise(msg) {
	  return JSON.stringify(msg);
	};
	
	RelayObject.deserialise = function deserialise(msg) {
	  // Check if the msg is already an object
	  // The issue here seems to be some 'helpful' libraries will automatically deserialise json
	  var out = undefined;
	  if (u.isString(msg)) {
	    out = JSON.parse(msg);
	  } else if (u.isObject(msg)) {
	    out = msg;
	  } else {
	    throw new Error("I don't even know what he is!? " + msg);
	  }
	  return out;
	};
	
	function closeSocket(s, interval) {
	  if (s && s.readyState === 0) {
	    // Connecting
	    // log('Socket connecting');
	    window.setTimeout(closeSocket.bind(null, s, interval), interval);
	  } else if (s && s.readyState === 1) {
	    // Open
	    // log('Socket open');
	    s.close();
	  } else {
	    log('Socket does not exist or is closed.'); // Socket does not exist or is closing/closed
	  }
	}
	
	function addSubscription(subs, key, val) {
	  if (!u.has(subs, key)) subs[key] = [];
	  subs[key] = [].concat(_toConsumableArray(subs[key]), [val]);
	  // subs[key] = u.append(val, subs[key]);
	  return subs;
	}
	
	function sendBroadcast(listeners, msg) {
	  if (listeners && listeners.length) {
	    listeners.forEach(function (f) {
	      return f(msg);
	    });
	  }
	}
	
	function ws_addresses(base, chan) {
	  var pub = base + '/pub/' + chan;
	  var sub = base + '/sub/' + chan;
	  /** Network payload -> application message */
	  return [pub, sub];
	}
	
	module.exports = RelayObject;

/***/ },
/* 4 */
/*!*************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/events/events.js ***!
  \*************************************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function (n) {
	  if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function (type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events) this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler)) return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++) listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function (type, listener) {
	  var m;
	
	  if (!isFunction(listener)) throw TypeError('listener must be a function');
	
	  if (!this._events) this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function (type, listener) {
	  if (!isFunction(listener)) throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function (type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener)) throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type]) return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener || isFunction(list.listener) && list.listener === listener) {
	    delete this._events[type];
	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener || list[i].listener && list[i].listener === listener) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0) return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener) this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function (type) {
	  var key, listeners;
	
	  if (!this._events) return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length) this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function (type) {
	  var ret;
	  if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function (type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener)) return 1;else if (evlistener) return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function (emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}

/***/ },
/* 5 */
/*!********************************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/reconnectingwebsocket/reconnecting-websocket.js ***!
  \********************************************************************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// MIT License:
	//
	// Copyright (c) 2010-2012, Joe Walnes
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	
	'use strict';
	
	(function (global, factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module.exports) {
	        module.exports = factory();
	    } else {
	        global.ReconnectingWebSocket = factory();
	    }
	})(undefined, function () {
	
	    if (!('WebSocket' in window)) {
	        return;
	    }
	
	    function ReconnectingWebSocket(url, protocols, options) {
	
	        // Default settings
	        var settings = {
	
	            /** Whether this instance should log debug messages. */
	            debug: false,
	
	            /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
	            automaticOpen: true,
	
	            /** The number of milliseconds to delay before attempting to reconnect. */
	            reconnectInterval: 1000,
	            /** The maximum number of milliseconds to delay a reconnection attempt. */
	            maxReconnectInterval: 30000,
	            /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
	            reconnectDecay: 1.5,
	
	            /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
	            timeoutInterval: 2000,
	
	            /** The maximum number of reconnection attempts to make. Unlimited if null. */
	            maxReconnectAttempts: null
	        };
	        if (!options) {
	            options = {};
	        }
	
	        // Overwrite and define settings with options if they exist.
	        for (var key in settings) {
	            if (typeof options[key] !== 'undefined') {
	                this[key] = options[key];
	            } else {
	                this[key] = settings[key];
	            }
	        }
	
	        // These should be treated as read-only properties
	
	        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
	        this.url = url;
	
	        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
	        this.reconnectAttempts = 0;
	
	        /**
	         * The current state of the connection.
	         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
	         * Read only.
	         */
	        this.readyState = WebSocket.CONNECTING;
	
	        /**
	         * A string indicating the name of the sub-protocol the server selected; this will be one of
	         * the strings specified in the protocols parameter when creating the WebSocket object.
	         * Read only.
	         */
	        this.protocol = null;
	
	        // Private state variables
	
	        var self = this;
	        var ws;
	        var forcedClose = false;
	        var timedOut = false;
	        var eventTarget = document.createElement('div');
	
	        // Wire up "on*" properties as event handlers
	
	        eventTarget.addEventListener('open', function (event) {
	            self.onopen(event);
	        });
	        eventTarget.addEventListener('close', function (event) {
	            self.onclose(event);
	        });
	        eventTarget.addEventListener('connecting', function (event) {
	            self.onconnecting(event);
	        });
	        eventTarget.addEventListener('message', function (event) {
	            self.onmessage(event);
	        });
	        eventTarget.addEventListener('error', function (event) {
	            self.onerror(event);
	        });
	
	        // Expose the API required by EventTarget
	
	        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
	        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
	        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);
	
	        /**
	         * This function generates an event that is compatible with standard
	         * compliant browsers and IE9 - IE11
	         *
	         * This will prevent the error:
	         * Object doesn't support this action
	         *
	         * http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
	         * @param s String The name that the event should use
	         * @param args Object an optional object that the event will use
	         */
	        function generateEvent(s, args) {
	            var evt = document.createEvent("CustomEvent");
	            evt.initCustomEvent(s, false, false, args);
	            return evt;
	        };
	
	        this.open = function (reconnectAttempt) {
	            ws = new WebSocket(self.url, protocols || []);
	
	            if (reconnectAttempt) {
	                if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
	                    return;
	                }
	            } else {
	                eventTarget.dispatchEvent(generateEvent('connecting'));
	                this.reconnectAttempts = 0;
	            }
	
	            if (self.debug || ReconnectingWebSocket.debugAll) {
	                console.debug('ReconnectingWebSocket', 'attempt-connect', self.url);
	            }
	
	            var localWs = ws;
	            var timeout = setTimeout(function () {
	                if (self.debug || ReconnectingWebSocket.debugAll) {
	                    console.debug('ReconnectingWebSocket', 'connection-timeout', self.url);
	                }
	                timedOut = true;
	                localWs.close();
	                timedOut = false;
	            }, self.timeoutInterval);
	
	            ws.onopen = function (event) {
	                clearTimeout(timeout);
	                if (self.debug || ReconnectingWebSocket.debugAll) {
	                    console.debug('ReconnectingWebSocket', 'onopen', self.url);
	                }
	                self.protocol = ws.protocol;
	                self.readyState = WebSocket.OPEN;
	                self.reconnectAttempts = 0;
	                var e = generateEvent('open');
	                e.isReconnect = reconnectAttempt;
	                reconnectAttempt = false;
	                eventTarget.dispatchEvent(e);
	            };
	
	            ws.onclose = function (event) {
	                clearTimeout(timeout);
	                ws = null;
	                if (forcedClose) {
	                    self.readyState = WebSocket.CLOSED;
	                    eventTarget.dispatchEvent(generateEvent('close'));
	                } else {
	                    self.readyState = WebSocket.CONNECTING;
	                    var e = generateEvent('connecting');
	                    e.code = event.code;
	                    e.reason = event.reason;
	                    e.wasClean = event.wasClean;
	                    eventTarget.dispatchEvent(e);
	                    if (!reconnectAttempt && !timedOut) {
	                        if (self.debug || ReconnectingWebSocket.debugAll) {
	                            console.debug('ReconnectingWebSocket', 'onclose', self.url);
	                        }
	                        eventTarget.dispatchEvent(generateEvent('close'));
	                    }
	
	                    var timeout = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
	                    setTimeout(function () {
	                        self.reconnectAttempts++;
	                        self.open(true);
	                    }, timeout > self.maxReconnectInterval ? self.maxReconnectInterval : timeout);
	                }
	            };
	            ws.onmessage = function (event) {
	                if (self.debug || ReconnectingWebSocket.debugAll) {
	                    console.debug('ReconnectingWebSocket', 'onmessage', self.url, event.data);
	                }
	                var e = generateEvent('message');
	                e.data = event.data;
	                eventTarget.dispatchEvent(e);
	            };
	            ws.onerror = function (event) {
	                if (self.debug || ReconnectingWebSocket.debugAll) {
	                    console.debug('ReconnectingWebSocket', 'onerror', self.url, event);
	                }
	                eventTarget.dispatchEvent(generateEvent('error'));
	            };
	        };
	
	        // Whether or not to create a websocket upon instantiation
	        if (this.automaticOpen == true) {
	            this.open(false);
	        }
	
	        /**
	         * Transmits data to the server over the WebSocket connection.
	         *
	         * @param data a text string, ArrayBuffer or Blob to send to the server.
	         */
	        this.send = function (data) {
	            if (ws) {
	                if (self.debug || ReconnectingWebSocket.debugAll) {
	                    console.debug('ReconnectingWebSocket', 'send', self.url, data);
	                }
	                return ws.send(data);
	            } else {
	                throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
	            }
	        };
	
	        /**
	         * Closes the WebSocket connection or connection attempt, if any.
	         * If the connection is already CLOSED, this method does nothing.
	         */
	        this.close = function (code, reason) {
	            // Default CLOSE_NORMAL code
	            if (typeof code == 'undefined') {
	                code = 1000;
	            }
	            forcedClose = true;
	            if (ws) {
	                ws.close(code, reason);
	            }
	        };
	
	        /**
	         * Additional public API method to refresh the connection if still open (close, re-open).
	         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
	         */
	        this.refresh = function () {
	            if (ws) {
	                ws.close();
	            }
	        };
	    }
	
	    /**
	     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
	     * this indicates that the connection is ready to send and receive data.
	     */
	    ReconnectingWebSocket.prototype.onopen = function (event) {};
	    /** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
	    ReconnectingWebSocket.prototype.onclose = function (event) {};
	    /** An event listener to be called when a connection begins being attempted. */
	    ReconnectingWebSocket.prototype.onconnecting = function (event) {};
	    /** An event listener to be called when a message is received from the server. */
	    ReconnectingWebSocket.prototype.onmessage = function (event) {};
	    /** An event listener to be called when an error occurs. */
	    ReconnectingWebSocket.prototype.onerror = function (event) {};
	
	    /**
	     * Whether all instances of ReconnectingWebSocket should log debug messages.
	     * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
	     */
	    ReconnectingWebSocket.debugAll = false;
	
	    ReconnectingWebSocket.CONNECTING = WebSocket.CONNECTING;
	    ReconnectingWebSocket.OPEN = WebSocket.OPEN;
	    ReconnectingWebSocket.CLOSING = WebSocket.CLOSING;
	    ReconnectingWebSocket.CLOSED = WebSocket.CLOSED;
	
	    return ReconnectingWebSocket;
	});
	/**
	 * This behaves like a WebSocket in every way, except if it fails to connect,
	 * or it gets disconnected, it will repeatedly poll until it successfully connects
	 * again.
	 *
	 * It is API compatible, so when you have:
	 *   ws = new WebSocket('ws://....');
	 * you can replace with:
	 *   ws = new ReconnectingWebSocket('ws://....');
	 *
	 * The event stream will typically look like:
	 *  onconnecting
	 *  onopen
	 *  onmessage
	 *  onmessage
	 *  onclose // lost connection
	 *  onconnecting
	 *  onopen  // sometime later...
	 *  onmessage
	 *  onmessage
	 *  etc...
	 *
	 * It is API compatible with the standard WebSocket API, apart from the following members:
	 *
	 * - `bufferedAmount`
	 * - `extensions`
	 * - `binaryType`
	 *
	 * Latest version: https://github.com/joewalnes/reconnecting-websocket/
	 * - Joe Walnes
	 *
	 * Syntax
	 * ======
	 * var socket = new ReconnectingWebSocket(url, protocols, options);
	 *
	 * Parameters
	 * ==========
	 * url - The url you are connecting to.
	 * protocols - Optional string or array of protocols.
	 * options - See below
	 *
	 * Options
	 * =======
	 * Options can either be passed upon instantiation or set after instantiation:
	 *
	 * var socket = new ReconnectingWebSocket(url, null, { debug: true, reconnectInterval: 4000 });
	 *
	 * or
	 *
	 * var socket = new ReconnectingWebSocket(url);
	 * socket.debug = true;
	 * socket.reconnectInterval = 4000;
	 *
	 * debug
	 * - Whether this instance should log debug messages. Accepts true or false. Default: false.
	 *
	 * automaticOpen
	 * - Whether or not the websocket should attempt to connect immediately upon instantiation. The socket can be manually opened or closed at any time using ws.open() and ws.close().
	 *
	 * reconnectInterval
	 * - The number of milliseconds to delay before attempting to reconnect. Accepts integer. Default: 1000.
	 *
	 * maxReconnectInterval
	 * - The maximum number of milliseconds to delay a reconnection attempt. Accepts integer. Default: 30000.
	 *
	 * reconnectDecay
	 * - The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. Accepts integer or float. Default: 1.5.
	 *
	 * timeoutInterval
	 * - The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. Accepts integer. Default: 2000.
	 *
	 */

/***/ },
/* 6 */
/*!*********************************************!*\
  !*** ./~/dpaw-brocket-relay/src/utility.js ***!
  \*********************************************/
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileOverview
	 * @name utility.js<relay>
	 * @author Gavin Coombes
	 * @license BSD-3-Clause
	 *
	 * Local util script just inlines functions from dpaw-brocket-utility and lodash
	 */
	
	/**
	 * Relay utility
	 * @module relay/utility
	 */
	
	/**
	 * Represents the utility object
	 * @class
	 */
	'use strict';
	
	var utility = function utility() {};
	
	var log = Function.prototype.bind.call(console.log, console);
	
	utility.prop = prop;
	/** Check for an object  (from lodash) */
	utility.isObject = __webpack_require__(/*! lodash/lang/isObject */ 7);
	
	/** Check for a string */
	utility.isString = __webpack_require__(/*! lodash/lang/isString */ 8);
	
	/**
	 * Check an object has a property. [lodash]
	 * @param {object} - the object
	 * @param {string} - the property
	 * @returns {boolean}
	 */
	utility.has = __webpack_require__(/*! lodash/object/has */ 10);
	utility.defaults = __webpack_require__(/*! lodash/object/defaults */ 28);
	
	/**
	 * Return a getter-setter function
	 * @param {*} prev - The previous value.
	 * @returns {*} - The current value.
	 */
	function prop(prev) {
	  // Return a function a getter-setter [see mithril.js]
	  var _prop = function _prop(val) {
	    if (arguments.length) {
	      prev = val;
	    }
	    return prev;
	  };
	  _prop.toJSON = function () {
	    return prev;
	  };
	  return _prop;
	};
	
	/**
	 * Generate a random string.
	 * @returns {string} Six random characters
	 */
	function s6() {
	  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
	};
	
	module.exports = {
	  /** Make a getter-setter */
	  prop: prop,
	
	  /** Log to console */
	  log: log,
	
	  /** Make a cool string */
	  _s6: s6,
	  has: __webpack_require__(/*! lodash/object/has */ 10),
	  defaults: __webpack_require__(/*! lodash/object/defaults */ 28),
	  isObject: __webpack_require__(/*! lodash/lang/isObject */ 7),
	  isString: __webpack_require__(/*! lodash/lang/isString */ 8)
	};

/***/ },
/* 7 */
/*!********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isObject.js ***!
  \********************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
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
	 * _.isObject(1);
	 * // => false
	 */
	'use strict';
	
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;

/***/ },
/* 8 */
/*!********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isString.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 9);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || isObjectLike(value) && objToString.call(value) == stringTag;
	}
	
	module.exports = isString;

/***/ },
/* 9 */
/*!****************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isObjectLike.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	'use strict';
	
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;

/***/ },
/* 10 */
/*!*****************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/object/has.js ***!
  \*****************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGet = __webpack_require__(/*! ../internal/baseGet */ 11),
	    baseSlice = __webpack_require__(/*! ../internal/baseSlice */ 13),
	    isArguments = __webpack_require__(/*! ../lang/isArguments */ 14),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 19),
	    isIndex = __webpack_require__(/*! ../internal/isIndex */ 23),
	    isKey = __webpack_require__(/*! ../internal/isKey */ 24),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 18),
	    last = __webpack_require__(/*! ../array/last */ 25),
	    toPath = __webpack_require__(/*! ../internal/toPath */ 26);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Checks if `path` is a direct property.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @param {Array|string} path The path to check.
	 * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
	 * @example
	 *
	 * var object = { 'a': { 'b': { 'c': 3 } } };
	 *
	 * _.has(object, 'a');
	 * // => true
	 *
	 * _.has(object, 'a.b.c');
	 * // => true
	 *
	 * _.has(object, ['a', 'b', 'c']);
	 * // => true
	 */
	function has(object, path) {
	  if (object == null) {
	    return false;
	  }
	  var result = hasOwnProperty.call(object, path);
	  if (!result && !isKey(path)) {
	    path = toPath(path);
	    object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	    if (object == null) {
	      return false;
	    }
	    path = last(path);
	    result = hasOwnProperty.call(object, path);
	  }
	  return result || isLength(object.length) && isIndex(path, object.length) && (isArray(object) || isArguments(object));
	}
	
	module.exports = has;

/***/ },
/* 11 */
/*!***********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseGet.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var toObject = __webpack_require__(/*! ./toObject */ 12);
	
	/**
	 * The base implementation of `get` without support for string paths
	 * and default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path of the property to get.
	 * @param {string} [pathKey] The key representation of path.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path, pathKey) {
	  if (object == null) {
	    return;
	  }
	  if (pathKey !== undefined && pathKey in toObject(object)) {
	    path = [pathKey];
	  }
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = object[path[index++]];
	  }
	  return index && index == length ? object : undefined;
	}
	
	module.exports = baseGet;

/***/ },
/* 12 */
/*!************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/toObject.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(/*! ../lang/isObject */ 7);
	
	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}
	
	module.exports = toObject;

/***/ },
/* 13 */
/*!*************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseSlice.js ***!
  \*************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	"use strict";
	
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;
	
	  start = start == null ? 0 : +start || 0;
	  if (start < 0) {
	    start = -start > length ? 0 : length + start;
	  }
	  end = end === undefined || end > length ? length : +end || 0;
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : end - start >>> 0;
	  start >>>= 0;
	
	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}
	
	module.exports = baseSlice;

/***/ },
/* 14 */
/*!***********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isArguments.js ***!
  \***********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArrayLike = __webpack_require__(/*! ../internal/isArrayLike */ 15),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 9);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	    return isObjectLike(value) && isArrayLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}
	
	module.exports = isArguments;

/***/ },
/* 15 */
/*!***************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isArrayLike.js ***!
  \***************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getLength = __webpack_require__(/*! ./getLength */ 16),
	    isLength = __webpack_require__(/*! ./isLength */ 18);
	
	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}
	
	module.exports = isArrayLike;

/***/ },
/* 16 */
/*!*************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/getLength.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseProperty = __webpack_require__(/*! ./baseProperty */ 17);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;

/***/ },
/* 17 */
/*!****************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseProperty.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	"use strict";
	
	function baseProperty(key) {
	  return function (object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;

/***/ },
/* 18 */
/*!************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isLength.js ***!
  \************************************************************/
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	'use strict';
	
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;

/***/ },
/* 19 */
/*!*******************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isArray.js ***!
  \*******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(/*! ../internal/getNative */ 20),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 18),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 9);
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function (value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	module.exports = isArray;

/***/ },
/* 20 */
/*!*************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/getNative.js ***!
  \*************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isNative = __webpack_require__(/*! ../lang/isNative */ 21);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	module.exports = getNative;

/***/ },
/* 21 */
/*!********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isNative.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isFunction = __webpack_require__(/*! ./isFunction */ 22),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 9);
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' + fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}
	
	module.exports = isNative;

/***/ },
/* 22 */
/*!**********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/lang/isFunction.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(/*! ./isObject */ 7);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	module.exports = isFunction;

/***/ },
/* 23 */
/*!***********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isIndex.js ***!
  \***********************************************************/
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	'use strict';
	
	var reIsUint = /^\d+$/;
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = typeof value == 'number' || reIsUint.test(value) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	module.exports = isIndex;

/***/ },
/* 24 */
/*!*********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isKey.js ***!
  \*********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArray = __webpack_require__(/*! ../lang/isArray */ 19),
	    toObject = __webpack_require__(/*! ./toObject */ 12);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
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
	  var type = typeof value;
	  if (type == 'string' && reIsPlainProp.test(value) || type == 'number') {
	    return true;
	  }
	  if (isArray(value)) {
	    return false;
	  }
	  var result = !reIsDeepProp.test(value);
	  return result || object != null && value in toObject(object);
	}
	
	module.exports = isKey;

/***/ },
/* 25 */
/*!*****************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/array/last.js ***!
  \*****************************************************/
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	"use strict";
	
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}
	
	module.exports = last;

/***/ },
/* 26 */
/*!**********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/toPath.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseToString = __webpack_require__(/*! ./baseToString */ 27),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 19);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `value` to property path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Array} Returns the property path array.
	 */
	function toPath(value) {
	  if (isArray(value)) {
	    return value;
	  }
	  var result = [];
	  baseToString(value).replace(rePropName, function (match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
	  });
	  return result;
	}
	
	module.exports = toPath;

/***/ },
/* 27 */
/*!****************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseToString.js ***!
  \****************************************************************/
/***/ function(module, exports) {

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	'use strict';
	
	function baseToString(value) {
	  return value == null ? '' : value + '';
	}
	
	module.exports = baseToString;

/***/ },
/* 28 */
/*!**********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/object/defaults.js ***!
  \**********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assign = __webpack_require__(/*! ./assign */ 29),
	    assignDefaults = __webpack_require__(/*! ../internal/assignDefaults */ 41),
	    createDefaults = __webpack_require__(/*! ../internal/createDefaults */ 42);
	
	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object for all destination properties that resolve to `undefined`. Once a
	 * property is set, additional values of the same property are ignored.
	 *
	 * **Note:** This method mutates `object`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	 * // => { 'user': 'barney', 'age': 36 }
	 */
	var defaults = createDefaults(assign, assignDefaults);
	
	module.exports = defaults;

/***/ },
/* 29 */
/*!********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/object/assign.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var assignWith = __webpack_require__(/*! ../internal/assignWith */ 30),
	    baseAssign = __webpack_require__(/*! ../internal/baseAssign */ 34),
	    createAssigner = __webpack_require__(/*! ../internal/createAssigner */ 36);
	
	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object. Subsequent sources overwrite property assignments of previous sources.
	 * If `customizer` is provided it's invoked to produce the assigned values.
	 * The `customizer` is bound to `thisArg` and invoked with five arguments:
	 * (objectValue, sourceValue, key, object, source).
	 *
	 * **Note:** This method mutates `object` and is based on
	 * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
	 *
	 * @static
	 * @memberOf _
	 * @alias extend
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @param {Function} [customizer] The function to customize assigned values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	 * // => { 'user': 'fred', 'age': 40 }
	 *
	 * // using a customizer callback
	 * var defaults = _.partialRight(_.assign, function(value, other) {
	 *   return _.isUndefined(value) ? other : value;
	 * });
	 *
	 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	 * // => { 'user': 'barney', 'age': 36 }
	 */
	var assign = createAssigner(function (object, source, customizer) {
	    return customizer ? assignWith(object, source, customizer) : baseAssign(object, source);
	});
	
	module.exports = assign;

/***/ },
/* 30 */
/*!**************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/assignWith.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var keys = __webpack_require__(/*! ../object/keys */ 31);
	
	/**
	 * A specialized version of `_.assign` for customizing assigned values without
	 * support for argument juggling, multiple sources, and `this` binding `customizer`
	 * functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Object} Returns `object`.
	 */
	function assignWith(object, source, customizer) {
	  var index = -1,
	      props = keys(source),
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index],
	        value = object[key],
	        result = customizer(value, source[key], key, object, source);
	
	    if ((result === result ? result !== value : value === value) || value === undefined && !(key in object)) {
	      object[key] = result;
	    }
	  }
	  return object;
	}
	
	module.exports = assignWith;

/***/ },
/* 31 */
/*!******************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/object/keys.js ***!
  \******************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var getNative = __webpack_require__(/*! ../internal/getNative */ 20),
	    isArrayLike = __webpack_require__(/*! ../internal/isArrayLike */ 15),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 7),
	    shimKeys = __webpack_require__(/*! ../internal/shimKeys */ 32);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
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
	var keys = !nativeKeys ? shimKeys : function (object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if (typeof Ctor == 'function' && Ctor.prototype === object || typeof object != 'function' && isArrayLike(object)) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};
	
	module.exports = keys;

/***/ },
/* 32 */
/*!************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/shimKeys.js ***!
  \************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArguments = __webpack_require__(/*! ../lang/isArguments */ 14),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 19),
	    isIndex = __webpack_require__(/*! ./isIndex */ 23),
	    isLength = __webpack_require__(/*! ./isLength */ 18),
	    keysIn = __webpack_require__(/*! ../object/keysIn */ 33);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;
	
	  var allowIndexes = !!length && isLength(length) && (isArray(object) || isArguments(object));
	
	  var index = -1,
	      result = [];
	
	  while (++index < propsLength) {
	    var key = props[index];
	    if (allowIndexes && isIndex(key, length) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = shimKeys;

/***/ },
/* 33 */
/*!********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/object/keysIn.js ***!
  \********************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArguments = __webpack_require__(/*! ../lang/isArguments */ 14),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 19),
	    isIndex = __webpack_require__(/*! ../internal/isIndex */ 23),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 18),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 7);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
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
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = length && isLength(length) && (isArray(object) || isArguments(object)) && length || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;
	
	  while (++index < length) {
	    result[index] = index + '';
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) && !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;

/***/ },
/* 34 */
/*!**************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseAssign.js ***!
  \**************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseCopy = __webpack_require__(/*! ./baseCopy */ 35),
	    keys = __webpack_require__(/*! ../object/keys */ 31);
	
	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	    return source == null ? object : baseCopy(source, keys(source), object);
	}
	
	module.exports = baseAssign;

/***/ },
/* 35 */
/*!************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/baseCopy.js ***!
  \************************************************************/
/***/ function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	"use strict";
	
	function baseCopy(source, props, object) {
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}
	
	module.exports = baseCopy;

/***/ },
/* 36 */
/*!******************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/createAssigner.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var bindCallback = __webpack_require__(/*! ./bindCallback */ 37),
	    isIterateeCall = __webpack_require__(/*! ./isIterateeCall */ 39),
	    restParam = __webpack_require__(/*! ../function/restParam */ 40);
	
	/**
	 * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return restParam(function (object, sources) {
	    var index = -1,
	        length = object == null ? 0 : sources.length,
	        customizer = length > 2 ? sources[length - 2] : undefined,
	        guard = length > 2 ? sources[2] : undefined,
	        thisArg = length > 1 ? sources[length - 1] : undefined;
	
	    if (typeof customizer == 'function') {
	      customizer = bindCallback(customizer, thisArg, 5);
	      length -= 2;
	    } else {
	      customizer = typeof thisArg == 'function' ? thisArg : undefined;
	      length -= customizer ? 1 : 0;
	    }
	    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	      customizer = length < 3 ? undefined : customizer;
	      length = 1;
	    }
	    while (++index < length) {
	      var source = sources[index];
	      if (source) {
	        assigner(object, source, customizer);
	      }
	    }
	    return object;
	  });
	}
	
	module.exports = createAssigner;

/***/ },
/* 37 */
/*!****************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/bindCallback.js ***!
  \****************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var identity = __webpack_require__(/*! ../utility/identity */ 38);
	
	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1:
	      return function (value) {
	        return func.call(thisArg, value);
	      };
	    case 3:
	      return function (value, index, collection) {
	        return func.call(thisArg, value, index, collection);
	      };
	    case 4:
	      return function (accumulator, value, index, collection) {
	        return func.call(thisArg, accumulator, value, index, collection);
	      };
	    case 5:
	      return function (value, other, key, object, source) {
	        return func.call(thisArg, value, other, key, object, source);
	      };
	  }
	  return function () {
	    return func.apply(thisArg, arguments);
	  };
	}
	
	module.exports = bindCallback;

/***/ },
/* 38 */
/*!***********************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/utility/identity.js ***!
  \***********************************************************/
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	"use strict";
	
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;

/***/ },
/* 39 */
/*!******************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/isIterateeCall.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isArrayLike = __webpack_require__(/*! ./isArrayLike */ 15),
	    isIndex = __webpack_require__(/*! ./isIndex */ 23),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 7);
	
	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
	    var other = object[index];
	    return value === value ? value === other : other !== other;
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;

/***/ },
/* 40 */
/*!*************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/function/restParam.js ***!
  \*************************************************************/
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	'use strict';
	
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? func.length - 1 : +start || 0, 0);
	  return function () {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);
	
	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0:
	        return func.call(this, rest);
	      case 1:
	        return func.call(this, args[0], rest);
	      case 2:
	        return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}
	
	module.exports = restParam;

/***/ },
/* 41 */
/*!******************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/assignDefaults.js ***!
  \******************************************************************/
/***/ function(module, exports) {

	/**
	 * Used by `_.defaults` to customize its `_.assign` use.
	 *
	 * @private
	 * @param {*} objectValue The destination object property value.
	 * @param {*} sourceValue The source object property value.
	 * @returns {*} Returns the value to assign to the destination object.
	 */
	"use strict";
	
	function assignDefaults(objectValue, sourceValue) {
	  return objectValue === undefined ? sourceValue : objectValue;
	}
	
	module.exports = assignDefaults;

/***/ },
/* 42 */
/*!******************************************************************!*\
  !*** ./~/dpaw-brocket-relay/~/lodash/internal/createDefaults.js ***!
  \******************************************************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var restParam = __webpack_require__(/*! ../function/restParam */ 40);
	
	/**
	 * Creates a `_.defaults` or `_.defaultsDeep` function.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @param {Function} customizer The function to customize assigned values.
	 * @returns {Function} Returns the new defaults function.
	 */
	function createDefaults(assigner, customizer) {
	  return restParam(function (args) {
	    var object = args[0];
	    if (object == null) {
	      return object;
	    }
	    args.push(customizer);
	    return assigner.apply(undefined, args);
	  });
	}
	
	module.exports = createDefaults;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map