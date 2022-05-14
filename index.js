console.log('A reference tree CRDT.')

// Each object has a memory address that's randomly generated.
// That memory address then has a parent memory address that it points to.
// If the parent memory address is null, then the object is the root.

// Each value has a type
// That type dictates how merges happen and what functionality they have.

// Some types are shelves, others are sequencers, etc.

const parents = {}
const parentVersions = {}
const values = {}
const valueVersions = {}
const unrooted = {}

// Generate a random memory address and return it.
const generateRandomId = () => {
  return Math.random().toString(36).substring(2)
}

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
    // For now i'm just removing them and then adding them if the new one changes things.
    if (unrooted[id]) {
      const parentList = getParentList(id)
      parentList.forEach(parentId => {
        delete unrooted[parentId]
      })
    }
    parents[id] = newParentId
    parentVersions[id] = newParentVersion

    // This detects infinite loops it's quite slow for deeply nested children though.
    const newParentList = getParentList(id)
    if (newParentList.includes(id)) {
      newParentList.forEach(parentId => {
        unrooted[parentId] = true
      })
    }
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

// Create a unique list of all objects that are parents of a child.
const getParentList = (childId) => {
  const parentList = []
  let currentId = childId
  // This could be faster with a key/value store but then you need to convert it to an array.
  // This shouldn't need to check if it includes the childId either. This could be re-written.
  while (parents[currentId] !== null && !parentList.includes(currentId) && !parentList.includes(childId)) {
    parentList.push(currentId)
    currentId = parents[currentId]
  }
  return parentList
}

// Detect if a parent is a descendant of a child.
// Don't allow for infinite loops.
// If you do allow for infinite loops, you should detect them and separate them.
const isDescendant = (parentId, childId) => {
  return getParentList(childId).includes(parentId)
}

// Get depth to specific parent
// This could be more efficient if it exited when the parent was found
const getDepthFromParent = (parentId, childId) => {
  const parentList = getParentList(childId)
  return parentList.indexOf(parentId)
}

// Get unrooted elements
const getUnrootedElements = () => {
  return Object.keys(unrooted)
}

// Get rooted elements
const getRootedElements = () => {
  return Object.keys(parents).filter(key => !unrooted[key])
}
