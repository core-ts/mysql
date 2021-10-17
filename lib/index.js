"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = require("mysql");
var build_1 = require("./build");
__export(require("./build"));
var resource = (function () {
  function resource() {
  }
  return resource;
}());
exports.resource = resource;
function createPool(conf) {
  if (conf.max && conf.max > 0 && !conf.connectionLimit) {
    conf.connectionLimit = conf.max;
  }
  var pool = mysql_1.createPool(conf);
  return pool;
}
exports.createPool = createPool;
var PoolManager = (function () {
  function PoolManager(pool) {
    this.pool = pool;
    this.exec = this.exec.bind(this);
    this.execBatch = this.execBatch.bind(this);
    this.query = this.query.bind(this);
    this.queryOne = this.queryOne.bind(this);
    this.execScalar = this.execScalar.bind(this);
    this.count = this.count.bind(this);
  }
  PoolManager.prototype.exec = function (sql, args, ctx) {
    var p = (ctx ? ctx : this.pool);
    return exec(p, sql, args);
  };
  PoolManager.prototype.execBatch = function (statements, firstSuccess, ctx) {
    var p = (ctx ? ctx : this.pool);
    return execBatch(p, statements, firstSuccess);
  };
  PoolManager.prototype.query = function (sql, args, m, bools, ctx) {
    var p = (ctx ? ctx : this.pool);
    return query(p, sql, args, m, bools);
  };
  PoolManager.prototype.queryOne = function (sql, args, m, bools, ctx) {
    var p = (ctx ? ctx : this.pool);
    return queryOne(p, sql, args, m, bools);
  };
  PoolManager.prototype.execScalar = function (sql, args, ctx) {
    var p = (ctx ? ctx : this.pool);
    return execScalar(p, sql, args);
  };
  PoolManager.prototype.count = function (sql, args, ctx) {
    var p = (ctx ? ctx : this.pool);
    return count(p, sql, args);
  };
  return PoolManager;
}());
exports.PoolManager = PoolManager;
function execBatch(pool, statements, firstSuccess) {
  if (!statements || statements.length === 0) {
    return Promise.resolve(0);
  }
  else if (statements.length === 1) {
    return exec(pool, statements[0].query, statements[0].params);
  }
  if (firstSuccess) {
    return new Promise(function (resolve, reject) {
      pool.getConnection(function (er0, connection) {
        if (er0) {
          return reject(er0);
        }
        connection.beginTransaction(function (er1) {
          if (er1) {
            connection.rollback(function () {
              return reject(er1);
            });
          }
          else {
            var query0 = void 0;
            var queries_1 = [];
            var l = statements.length;
            for (var j = 0; j < l; j++) {
              var item = statements[j];
              if (j === 0) {
                query0 = mysql_1.format(item.query, toArray(item.params));
              }
              else {
                if (item.query.endsWith(';')) {
                  queries_1.push(mysql_1.format(item.query, toArray(item.params)));
                }
                else {
                  queries_1.push(mysql_1.format(item.query + ';', toArray(item.params)));
                }
              }
            }
            connection.query(query0, function (er2a, results0) {
              if (er2a) {
                buildError(er2a);
                connection.rollback(function () {
                  return reject(er2a);
                });
              }
              else {
                if (results0 && results0.affectedRows === 0) {
                  return 0;
                }
                else {
                  connection.query(queries_1.join(''), function (er2, results) {
                    if (er2) {
                      connection.rollback(function () {
                        return reject(er2);
                      });
                    }
                    else {
                      connection.commit(function (er3) {
                        if (er3) {
                          connection.rollback(function () {
                            return reject(er3);
                          });
                        }
                      });
                      var c_1 = 0;
                      c_1 += results0.affectedRows;
                      results.forEach((function (x) { return c_1 += x.affectedRows; }));
                      return resolve(c_1);
                    }
                  });
                }
              }
            });
          }
        });
      });
    });
  }
  else {
    return new Promise(function (resolve, reject) {
      pool.getConnection(function (er0, connection) {
        if (er0) {
          return reject(er0);
        }
        connection.beginTransaction(function (er1) {
          if (er1) {
            connection.rollback(function () {
              return reject(er1);
            });
          }
          else {
            var queries_2 = [];
            statements.forEach(function (item) {
              if (item.query.endsWith(';')) {
                queries_2.push(mysql_1.format(item.query, toArray(item.params)));
              }
              else {
                queries_2.push(mysql_1.format(item.query + ';', toArray(item.params)));
              }
            });
            connection.query(queries_2.join(''), function (er2, results) {
              if (er2) {
                connection.rollback(function () {
                  return reject(er2);
                });
              }
              else {
                connection.commit(function (er3) {
                  if (er3) {
                    connection.rollback(function () {
                      return reject(er3);
                    });
                  }
                });
                var c_2 = 0;
                results.forEach((function (x) { return c_2 += x.affectedRows; }));
                return resolve(c_2);
              }
            });
          }
        });
      });
    });
  }
}
exports.execBatch = execBatch;
function buildError(err) {
  if (err.errno === 1062 && err.code === 'ER_DUP_ENTRY') {
    err.error = 'duplicate';
  }
  return err;
}
function exec(pool, sql, args) {
  var p = toArray(args);
  return new Promise(function (resolve, reject) {
    return pool.query(sql, p, function (err, results) {
      if (err) {
        buildError(err);
        return reject(err);
      }
      else {
        return resolve(results.affectedRows);
      }
    });
  });
}
exports.exec = exec;
function query(pool, sql, args, m, bools) {
  var p = toArray(args);
  return new Promise(function (resolve, reject) {
    return pool.query(sql, p, function (err, results) {
      if (err) {
        return reject(err);
      }
      else {
        return resolve(handleResults(results, m, bools));
      }
    });
  });
}
exports.query = query;
function queryOne(pool, sql, args, m, bools) {
  return query(pool, sql, args, m, bools).then(function (r) {
    return (r && r.length > 0 ? r[0] : null);
  });
}
exports.queryOne = queryOne;
function execScalar(pool, sql, args) {
  return queryOne(pool, sql, args).then(function (r) {
    if (!r) {
      return null;
    }
    else {
      var keys = Object.keys(r);
      return r[keys[0]];
    }
  });
}
exports.execScalar = execScalar;
function count(pool, sql, args) {
  return execScalar(pool, sql, args);
}
exports.count = count;
function save(pool, obj, table, attrs, ver, buildParam, i) {
  var s = build_1.buildToSave(obj, table, attrs, ver, buildParam);
  if (typeof pool === 'function') {
    return pool(s.query, s.params);
  }
  else {
    return exec(pool, s.query, s.params);
  }
}
exports.save = save;
function saveBatch(pool, objs, table, attrs, ver, buildParam) {
  var s = build_1.buildToSaveBatch(objs, table, attrs, ver, buildParam);
  if (typeof pool === 'function') {
    return pool(s);
  }
  else {
    return execBatch(pool, s);
  }
}
exports.saveBatch = saveBatch;
function toArray(arr) {
  if (!arr || arr.length === 0) {
    return [];
  }
  var p = [];
  var l = arr.length;
  for (var i = 0; i < l; i++) {
    if (arr[i] === undefined || arr[i] == null) {
      p.push(null);
    }
    else {
      if (typeof arr[i] === 'object') {
        if (arr[i] instanceof Date) {
          p.push(arr[i]);
        }
        else {
          if (resource.string) {
            var s = JSON.stringify(arr[i]);
            p.push(s);
          }
          else {
            p.push(arr[i]);
          }
        }
      }
      else {
        p.push(arr[i]);
      }
    }
  }
  return p;
}
exports.toArray = toArray;
function handleResults(r, m, bools) {
  if (m) {
    var res = mapArray(r, m);
    if (bools && bools.length > 0) {
      return handleBool(res, bools);
    }
    else {
      return res;
    }
  }
  else {
    if (bools && bools.length > 0) {
      return handleBool(r, bools);
    }
    else {
      return r;
    }
  }
}
exports.handleResults = handleResults;
function handleBool(objs, bools) {
  if (!bools || bools.length === 0 || !objs) {
    return objs;
  }
  for (var _i = 0, objs_1 = objs; _i < objs_1.length; _i++) {
    var obj = objs_1[_i];
    for (var _a = 0, bools_1 = bools; _a < bools_1.length; _a++) {
      var field = bools_1[_a];
      var v = obj[field.name];
      if (typeof v !== 'boolean' && v != null && v !== undefined) {
        var b = field.true;
        if (b == null || b === undefined) {
          obj[field.name] = ('1' == v || 'T' == v || 'Y' == v || 'true' == v || 'on' == v);
        }
        else {
          obj[field.name] = (v == b ? true : false);
        }
      }
    }
  }
  return objs;
}
exports.handleBool = handleBool;
function map(obj, m) {
  if (!m) {
    return obj;
  }
  var mkeys = Object.keys(m);
  if (mkeys.length === 0) {
    return obj;
  }
  var obj2 = {};
  var keys = Object.keys(obj);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var k0 = m[key];
    if (!k0) {
      k0 = key;
    }
    obj2[k0] = obj[key];
  }
  return obj2;
}
exports.map = map;
function mapArray(results, m) {
  if (!m) {
    return results;
  }
  var mkeys = Object.keys(m);
  if (mkeys.length === 0) {
    return results;
  }
  var objs = [];
  var length = results.length;
  for (var i = 0; i < length; i++) {
    var obj = results[i];
    var obj2 = {};
    var keys = Object.keys(obj);
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
      var key = keys_2[_i];
      var k0 = m[key];
      if (!k0) {
        k0 = key;
      }
      obj2[k0] = obj[key];
    }
    objs.push(obj2);
  }
  return objs;
}
exports.mapArray = mapArray;
function getFields(fields, all) {
  if (!fields || fields.length === 0) {
    return undefined;
  }
  var ext = [];
  if (all) {
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var s = fields_1[_i];
      if (all.includes(s)) {
        ext.push(s);
      }
    }
    if (ext.length === 0) {
      return undefined;
    }
    else {
      return ext;
    }
  }
  else {
    return fields;
  }
}
exports.getFields = getFields;
function buildFields(fields, all) {
  var s = getFields(fields, all);
  if (!s || s.length === 0) {
    return '*';
  }
  else {
    return s.join(',');
  }
}
exports.buildFields = buildFields;
function getMapField(name, mp) {
  if (!mp) {
    return name;
  }
  var x = mp[name];
  if (!x) {
    return name;
  }
  if (typeof x === 'string') {
    return x;
  }
  return name;
}
exports.getMapField = getMapField;
function isEmpty(s) {
  return !(s && s.length > 0);
}
exports.isEmpty = isEmpty;
var StringService = (function () {
  function StringService(pool, table, column) {
    this.pool = pool;
    this.table = table;
    this.column = column;
    this.load = this.load.bind(this);
    this.save = this.save.bind(this);
  }
  StringService.prototype.load = function (key, max) {
    var _this = this;
    var s = "select " + this.column + " from " + this.table + " where " + this.column + " like ? order by " + this.column + " limit " + max;
    return query(this.pool, s, ['' + key + '%']).then(function (arr) {
      return arr.map(function (i) { return i[_this.column]; });
    });
  };
  StringService.prototype.save = function (values) {
    if (!values || values.length === 0) {
      return Promise.resolve(0);
    }
    var arr = [];
    for (var i = 1; i <= values.length; i++) {
      arr.push('(?)');
    }
    var s = "insert ignore into " + this.table + "(" + this.column + ")values" + arr.join(',');
    return exec(this.pool, s, values);
  };
  return StringService;
}());
exports.StringService = StringService;
function version(attrs) {
  var ks = Object.keys(attrs);
  for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
    var k = ks_1[_i];
    var attr = attrs[k];
    if (attr.version) {
      attr.name = k;
      return attr;
    }
  }
  return undefined;
}
exports.version = version;
var MySQLWriter = (function () {
  function MySQLWriter(pool, table, attributes, toDB, buildParam) {
    this.table = table;
    this.attributes = attributes;
    this.write = this.write.bind(this);
    if (typeof pool === 'function') {
      this.exec = pool;
    }
    else {
      this.pool = pool;
    }
    this.param = buildParam;
    this.map = toDB;
    var x = version(attributes);
    if (x) {
      this.version = x.name;
    }
  }
  MySQLWriter.prototype.write = function (obj) {
    if (!obj) {
      return Promise.resolve(0);
    }
    var obj2 = obj;
    if (this.map) {
      obj2 = this.map(obj);
    }
    var stmt = build_1.buildToSave(obj2, this.table, this.attributes, this.version, this.param);
    if (stmt) {
      if (this.exec) {
        return this.exec(stmt.query, stmt.params);
      }
      else {
        return exec(this.pool, stmt.query, stmt.params);
      }
    }
    else {
      return Promise.resolve(0);
    }
  };
  return MySQLWriter;
}());
exports.MySQLWriter = MySQLWriter;
var MySQLBatchWriter = (function () {
  function MySQLBatchWriter(pool, table, attributes, toDB, buildParam) {
    this.table = table;
    this.attributes = attributes;
    this.write = this.write.bind(this);
    if (typeof pool === 'function') {
      this.execute = pool;
    }
    else {
      this.pool = pool;
    }
    this.param = buildParam;
    this.map = toDB;
    var x = version(attributes);
    if (x) {
      this.version = x.name;
    }
  }
  MySQLBatchWriter.prototype.write = function (objs) {
    if (!objs || objs.length === 0) {
      return Promise.resolve(0);
    }
    var list = objs;
    if (this.map) {
      list = [];
      for (var _i = 0, objs_2 = objs; _i < objs_2.length; _i++) {
        var obj = objs_2[_i];
        var obj2 = this.map(obj);
        list.push(obj2);
      }
    }
    var stmts = build_1.buildToSaveBatch(list, this.table, this.attributes, this.version, this.param);
    if (stmts && stmts.length > 0) {
      if (this.execute) {
        return this.execute(stmts);
      }
      else {
        return execBatch(this.pool, stmts);
      }
    }
    else {
      return Promise.resolve(0);
    }
  };
  return MySQLBatchWriter;
}());
exports.MySQLBatchWriter = MySQLBatchWriter;
var MySQLChecker = (function () {
  function MySQLChecker(pool, service, timeout) {
    this.pool = pool;
    this.service = service;
    this.timeout = timeout;
    if (!this.timeout) {
      this.timeout = 4200;
    }
    if (!this.service) {
      this.service = 'mysql';
    }
    this.check = this.check.bind(this);
    this.name = this.name.bind(this);
    this.build = this.build.bind(this);
  }
  MySQLChecker.prototype.check = function () {
    return __awaiter(this, void 0, void 0, function () {
      var obj, promise;
      var _this = this;
      return __generator(this, function (_a) {
        obj = {};
        promise = new Promise(function (resolve, reject) {
          _this.pool.query('select current_time', function (err, result) {
            if (err) {
              return reject(err);
            }
            else {
              resolve(obj);
            }
          });
        });
        if (this.timeout > 0) {
          return [2, promiseTimeOut(this.timeout, promise)];
        }
        else {
          return [2, promise];
        }
        return [2];
      });
    });
  };
  MySQLChecker.prototype.name = function () {
    return this.service;
  };
  MySQLChecker.prototype.build = function (data, err) {
    if (err) {
      if (!data) {
        data = {};
      }
      data['error'] = err;
    }
    return data;
  };
  return MySQLChecker;
}());
exports.MySQLChecker = MySQLChecker;
function promiseTimeOut(timeoutInMilliseconds, promise) {
  return Promise.race([
    promise,
    new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject("Timed out in: " + timeoutInMilliseconds + " milliseconds!");
      }, timeoutInMilliseconds);
    })
  ]);
}
