var _atoms = ['number', 'string', 'boolean', 'null', 'undefined'],
    _classes = (
      'Boolean Number String Function Array Date RegExp Object'
    ).split(' '),
    _class2type = {},
    _types = ['*'];

var _customs = {};

// Fill types
for (var k in _classes) {
  var name = _classes[k];
  _types.push(name.toLowerCase());
  _class2type['[object ' + name + ']'] = name.toLowerCase();
}

exports.register = function(a1, a2) {
  var k, a, id, tmp, struct, o;

  // Check errors:
  if (arguments.length === 1) {
    if (this.get(a1) === 'object') {
      o = a1;
      id = o.id;
      struct = o.struct;
    } else
      throw 'If struct.register is called with one arguments, ' +
            'it has to be an object';
  } else if (arguments.length === 2) {
    if (this.get(a1) !== 'string' || !a1)
      throw 'If struct.register is called with more than one arguments, ' +
            'the first one must be the string id';
    else
      id = a1;

    struct = a2;
  } else
    throw 'struct.register has to be called with one or three arguments';

  if (this.get(id) !== 'string' || id.length === 0)
    throw 'A structure requires an string id';

  if (_customs[id] !== undefined && _customs[id] !== 'proto')
    throw 'The structure "' + id + '" already exists';

  _customs[id] = 1;

  // Check given prototypes:
  a = domino.utils.array((o || {}).proto);
  tmp = {};
  for (k in a)
    if (_customs[a[k]] === undefined) {
      _customs[a[k]] = 1;
      tmp[a[k]] = 1;
    }

  if (
    (this.get(struct) !== 'function') && !this.isValid(struct)
  )
    throw 'A structure requires a valid "structure" property ' +
          'describing the structure. It can be a valid structure or a ' +
          'function that test if an object matches the structure.';

  if (~_types.indexOf(id)) {
    delete _customs[id];
    throw '"' + id + '" is a reserved structure name';
  }

  // Effectively add the structure:
  _customs[id] = (o === undefined) ?
    {
      id: id,
      struct: struct
    } :
    {};

  if (o !== undefined)
    for (k in o)
      _customs[id][k] = o[k];

  // Delete prototypes:
  for (k in tmp)
    if (k !== id)
      delete _customs[k];
};

exports.get = function(obj) {
  return obj == null ?
    String(obj) :
    _class2type[Object.prototype.toString.call(obj)] || 'object';
};

exports.existing = function(key) {
  return typeof key === 'string' ?
    (_customs[key] || {}).struct :
    domino.utils.clone(_customs);
};

exports.check = function(type, obj, params) {
  var a, i, k,
      typeOf = this.get(obj),
      p = params || {};

  if (this.get(type) === 'string') {
    a = type.replace(/^\?/, '').split(/\|/);
    for (i in a)
      if (_types.indexOf(a[i]) < 0 && _customs[a[i]] === undefined)
        throw 'Invalid type';

    if (obj == null)
      return !!type.match(/^\?/, '');
    else
      type = type.replace(/^\?/, '');

    for (i in a)
      if (_customs[a[i]])
        if (
          (this.get(_customs[a[i]].struct) === 'function') ?
          (_customs[a[i]].struct(obj) === true) :
          this.check(_customs[a[i]].struct, obj, _customs[a[i]])
        )
          return true;

    return !!(~a.indexOf('*') || ~a.indexOf(typeOf));
  } else if (this.get(type) === 'object') {
    if (typeOf !== 'object')
      return false;

    for (k in type)
      if (!this.check(type[k], obj[k]))
        return false;

    if (!p.includes)
      for (k in obj)
        if (type[k] === undefined)
          return false;

    return true;
  } else if (this.get(type) === 'array') {
    if (typeOf !== 'array')
      return false;

    if (type.length !== 1)
      throw 'Invalid type';

    for (k in obj)
      if (!this.check(type[0], obj[k]))
        return false;

    return true;
  } else
    return false;
};

exports.deepScalar = function(type) {
  var a, i;
  if (this.get(type) === 'string') {
    a = type.replace(/^\?/, '').split(/\|/);
    for (i in a)
      if (_atoms.indexOf(a[i]) < 0)
        return false;
    return true;
  } else if (this.check('object|array', type)) {
    for (i in type)
      if (!this.deepScalar(type[i]))
        return false;
    return true;
  }

  return false;
};

exports.compare = function(v1, v2, type) {
  var t1 = this.get(v1),
      t2 = this.get(v2),
      a, i;

  if (
    !this.deepScalar(type) ||
    !this.check(type, v1) ||
    !this.check(type, v2)
  )
    return false;

  if (this.get(type) === 'string') {
    return v1 === v2;
  } else if (this.get(type) === 'object') {
    for (i in type)
      if (!this.compare(v1[i], v2[i], type[i]))
        return false;
    return true;
  } else if (this.get(type) === 'array') {
    if (v1.length !== v2.length)
      return false;
    var l = v1.length;
    for (i = 0; i < l; i++)
      if (!this.compare(v1[i], v2[i], type[0]))
        return false;
    return true;
  }

  return false;
};

exports.isValid = function(type) {
  var a, k, i;
  if (this.get(type) === 'string') {
    a = type.replace(/^\?/, '').split(/\|/);
    for (i in a)
      if (_types.indexOf(a[i]) < 0 && _customs[a[i]] === undefined)
        return false;
    return true;
  } else if (this.get(type) === 'object') {
    for (k in type)
      if (!this.isValid(type[k]))
        return false;

    return true;
  } else if (this.get(type) === 'array')
    return type.length === 1 ?
      this.isValid(type[0]) :
      false;
  else
    return false;
};
