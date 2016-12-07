/*
 * normalize-json-structure.js: Normalization of nested JSON structure
 *
 * (C) 2016 Brandon Hamilton
 * MIT LICENCE
 *
 */

'use strict';

var isArray = Array.isArray || function(obj) {
  return obj.toString() === '[object Array]';
};

function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
}

function type(item) {
  if (isArray(item)) {
    return 'array';
  } else if (isObject(item)) {
    return 'object';
  } else {
    return typeof item;
  }
}

var typeHierarchy = ['array', 'object', 'string', 'number'];

function resolveTypeOrder(t1, t2) {
  if (t1 == t2) {
    return t1;
  }
  for (var i = 0; i < typeHierarchy.length; i++) {
    if (t1 === typeHierarchy[i] || t2 === typeHierarchy[i]) {
      return typeHierarchy[i];
    }
  }
  return t1;
}

function resolveTypes(item, name) {
  var thisType = type(item);
  var typeMap = {};
  typeMap[name] = thisType;
  switch(thisType) {
    case 'array': 
      typeMap = item.reduce(function(t, c) { 
        var childTypes = resolveTypes(c, name + '[]');
        for (var n in childTypes) { t[n] = n in t ? resolveTypeOrder(t[n], childTypes[n]) : childTypes[n]; };
        return t;
      }, typeMap);
      break;
    case 'object':
      for (var property in item) {
        if (item.hasOwnProperty(property)) {
          var childTypes = resolveTypes( item[property], name + '.' + property );
          for (var n in childTypes) { typeMap[n] = n in typeMap ? resolveTypeOrder(typeMap[n], childTypes[n]) : childTypes[n]; };
        }
      }
  }
  return typeMap;
}

function transform(item, name, typeMap) {
  var thisType = type(item);
  var thisItem = item;

  if (thisType != typeMap[name]) {
    switch(typeMap[name]) {
      case 'array':
        thisItem = [item];
        break;
      case 'object':
        thisItem = {};
        var nameParts = name.split(/\.|\[\]/);
        do { property = nameParts.pop(); } while (!property);
        thisItem[property] = item;
        break;
      case 'string':
        thisItem = item.toString();
        break;
      default:
        thisItem = item;
    }
    thisType = typeMap[name];
  }
  switch(thisType) {
    case 'array':
      thisItem = thisItem.reduce(function(children ,childItem) {
        var child = transform(childItem, name + '[]', typeMap);
        if (isArray(child)) {
          return children.concat(child);
        } else {
          children.push(child);
          return children
        }
      }, []);
      break;
    case 'object':
      for (var property in thisItem) {
        if (thisItem.hasOwnProperty(property)) {
          thisItem[property] = transform( thisItem[property], name + '.' + property, typeMap);
        }
      }
      break;
  }
  return thisItem;
}

exports = module.exports = function normalizeJSON(data, replacer, space) {
  data = typeof data === 'string' ? JSON.parse(data) : data;
  return JSON.stringify(transform(data, '$value', resolveTypes(data, '$value', {})), replacer, space);
}
