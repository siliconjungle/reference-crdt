const shelfStore = {}

const generateRandomId = () => {
  return Math.random().toString(36).substring(2)
}

const createShelf = (value, userId) => {
  const address = generateRandomId()
  shelfStore[address] = {
    address,
    value,
    version: 0,
    lastVersionBy: userId,
  }
  return shelfStore[address]
}

const shouldUpdateShelf = (address, version, userId) => {
  const shelf = shelfStore[address]

  if (shelf.version < version) {
    return false
  }

  if (shelf.version === version) {
    if (shelf.lastVersionBy === userId) {
      return false
    }

    if (shelf.lastVersionBy < userId) {
      return false
    }
  }

  return true
}

const updateShelf = (address, value, version, userId) => {
  const shelf = shelfStore[address]
  shelf.value = value
  shelf.version = version
  shelf.lastVersionBy = userId
  return shelf
}

const referenceStore = {}

const createReference = (key, address, userId) => {
  referenceStore[key] = {
    key,
    address,
    version: 0,
    lastVersionBy: userId,
  }
  return referenceStore[key]
}

const shouldUpdateReference = (key, version, userId) => {
  const reference = referenceStore[key]

  if (reference.version < version) {
    return false
  }

  if (reference.version === version) {
    if (reference.lastVersionBy === userId) {
      return false
    }

    if (reference.lastVersionBy < userId) {
      return false
    }
  }
  
  return true
}

const updateReference = (key, address, version, userId) => {
  const reference = referenceStore[key]
  reference.address = address
  reference.version = version
  reference.lastVersionBy = userId

  return reference
}

// When a user makes a change to a shelf, we send the address over the wire as part of the diff rather than the key.
const getAddressByKey = (key) => {
  const reference = referenceStore[key]
  return reference?.address ?? null
}

// Pretty slow approach. Alternatively you could create a list of references in the shelf store.
const getShelfReferences = (address) => {
  return Object.keys(referenceStore)
    .filter(key => referenceStore[key].address === address)
}
