console.log('A reference tree CRDT.')

// Each object has a memory address that's randomly generated.
// That memory address then has a parent memory address that it points to.
// If the parent memory address is null, then the object is the root.

const parents = {}
const parentVersions = {}
const values = {}
const valueVersions = {}

// Generate a random memory address and return it.
const generateRandomId = () => {
  return Math.random().toString(36).substring(2)
}

console.log(generateRandomId())

// Create a new object with a random memory address.
const createObject = (data, parentId) => {
  if (parents[parentId] === undefined) {
    return
  }
  const id = generateRandomId()
  values[id] = data
  parents[id] = parentId || null
  parentVersions[id] = 0
  valueVersions[id] = 0
}

// Merges should be resolved by smallest parent ID.
const shouldSetParent = (id, newParentId, newParentVersion) =>
  parents[id] !== undefined && (newParentVersion < parentVersions[id] || newParentVersion === parentVersions[id] && newParentId < parents[id])

const shouldSetValue = (id, newValue, newValueVersion) =>
  newValueVersion < valueVersions[id] ||newValueVersion === valueVersions[id] && JSON.stringify(newValue) < JSON.stringify(values[id])

const setParent = (id, newParentId, newParentVersion) => {
  if (shouldSetParent(id, newParentId, newParentVersion)) {
    parents[id] = newParentId
    parentVersions[id] = newParentVersion
  }
}

const setValue = (id, newValue, newValueVersion) => {
  if (shouldSetValue(id, newValue, newValueVersion)) {
    values[id] = newValue
    valueVersions[id] = newValueVersion
  }
}

// Get children of a parent.
// This is kind of an expensive operation.
// Would it be better to just add references from parents to children as well?
const getChildren = (parentId) => {
  return Object.keys(parents).filter(id => parents[id] === parentId)
}
