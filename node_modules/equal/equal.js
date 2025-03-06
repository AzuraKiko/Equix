var SlowBuffer = require('buffer').SlowBuffer

/*
 * Returns true if the values `a` and `b` are equal.
 *
 * Support for circular structures is implemented through the `seen` argument,
 * expected to be an object with the following signature: `{ a: [], b: [] }`.
 */
function compare(a, b, seen) {
  if (a === b) {
    return true
  }

  if (Number.isNaN(a)) {
    return Number.isNaN(b)
  }

  // primitive values would have caused the call to return by now, if they
  // were equal
  if (!(a instanceof Object)) {
    return false
  }

  var type = Object.prototype.toString.call(a)

  if (Object.prototype.toString.call(b) !== type) {
    return false
  }

  var keys = Object.keys(a).sort()
    , other = Object.keys(b).sort()

  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== other[i]) {
      return false
    }
  }

  var index = seen.a.indexOf(a)

  if (index > -1) {
    return seen.b.indexOf(b) === index
  }

  seen.a.push(a)
  seen.b.push(b)

  if (type === '[object Error]') {
    var first = Error.prototype.toString.call(a)
      , second = Error.prototype.toString.call(b)

    if (first !== second) {
      return false
    }
  }

  else if (type === '[object RegExp]') {
    if (a.source !== b.source ||
        a.global !== b.global ||
        a.multiline !== b.multiline ||
        a.ignoreCase !== b.ignoreCase) {
      return false
    }
  }

  else if (type === '[object Date]') {
    if (a.getTime() !== b.getTime()) {
      return false
    }
  }

  else if (type === '[object Boolean]' ||
           type === '[object Number]' ||
           type === '[object String]') {
    if (!equal(a.valueOf(), b.valueOf())) {
      return false
    }
  }

  else if (Buffer.isBuffer(a)) {
    if ((a instanceof Buffer && !(b instanceof Buffer)) ||
        (a instanceof SlowBuffer && !(b instanceof SlowBuffer))) {
      return false
    }

    // discard keys relating to the underlying storage
    keys = keys.filter(function (key) {
      if (a instanceof SlowBuffer) {
        return key !== 'used'
      }

      return key !== 'parent' && key !== 'offset'
    })
  }

  return keys.reduce(function (ok, key) {
    return ok && compare(a[key], b[key], seen)
  }, true)
}

/*
 * Simple wrapper for `compare`.
 */
function equal(a, b) {
  return compare(a, b, { a: [], b: [] })
}

module.exports = equal
