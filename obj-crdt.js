const FIELD_TYPES = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  NULL: 'null',
  OTHER: 'other',
}

export const FIELD_TYPE_RANKINGS = {
  'object': 0,
  'array': 1,
  'string': 2,
  'number': 3,
  'boolean': 4,
  'null': 5,
  'other': 6,
}

const crdtTypes = {}

export const getFieldTypeRankings = (value) => {
  return FIELD_TYPE_RANKINGS[getFieldType(value)]
}

const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const getFieldType = (value) => {
  if (value === null) return FIELD_TYPES.NULL
  if (Array.isArray(value)) return FIELD_TYPES.ARRAY
  return Object.keys(FIELD_TYPE_RANKINGS).includes(typeof value) ? typeof(value) : FIELD_TYPES.OTHER
}

const createShallowDiff = (oldObj, newObj) => {
  const diff = {}
  Object.keys(newObj).forEach(key => {
    if (newObj[key] !== oldObj[key]) {
      diff[key] = newObj[key]
    }
  })
  return diff
}

const createDeepDiff = (oldObj, newObj) => {
  const diff = {}
  Object.keys(newObj).forEach(key => {
    if (newObj[key] !== oldObj[key]) {
      if (typeof newObj[key] === 'object' && typeof oldObj[key] === 'object') {
        diff[key] = createDeepDiff(oldObj[key], newObj[key])
      } else {
        diff[key] = newObj[key]
      }
    }
  })
  return diff
}

const createCrdtObject = (id, type, data, lastChangeBy) => {
  return {
    id,
    type,
    data,
    version: 0,
    lastChangeBy,
  }
}

// Definitions are a list of objects where each field is a field name and the value is a type.
const createCrdtType = (name, definitions) => {
  return {
    name,
    definitions,
  }
}

const isCrdtType = (data, type) => {
  // Check if the data matches one of the definitions
  return type.definitions.some(definition => {
    return Object.keys(definition).every(key => {
      // Check if the definition's field types match the data's field types
      return definition[key] === getFieldType(data[key])
    })
  })
}

// Get the crdt type index from the definitions list.
const getCrdtTypeIndex = (definitions, type) => {
  return definitions.findIndex(definition => {
    return Object.keys(definition).every(key => {
      return definition[key] === type[key]
    })
  })
}

// Check if a CRDT should be merged with another CRDT.
const shouldReplace = (crdt, otherCrdt, crdtTypes) => {
  // CRDT is not a valid type
  if (!isCrdtType(otherCrdt.data, crdtTypes[otherCrdt.type])) {
    return false
  }
  // CRDT types must match
  if (crdt.type !== otherCrdt.type) {
    return false
  }
  if (crdt.version === otherCrdt.version) {
    const crdtTypeIndex = getCrdtTypeIndex(crdt.type, crdtTypes[crdt.type])
    const otherCrdtTypeIndex = getCrdtTypeIndex(otherCrdt.type, crdtTypes[otherCrdt.type])

    if (crdtTypeIndex === otherCrdtTypeIndex) {
      return crdt.lastChangeBy < otherCrdt.lastChangeBy
    }
    
    return crdtTypeIndex < otherCrdtTypeIndex
  }

  return crdt.version < otherCrdt.version
}

const changeCRDT = (crdt, data, lastChangeBy) => {
  const newCrdt = deepCopy(crdt)
  newCrdt.data = data
  newCrdt.version += 1
  newCrdt.lastChangeBy = lastChangeBy
  return newCrdt
}
