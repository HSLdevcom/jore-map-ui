const trimStrings = (key: unknown, value: unknown) => {
  if (typeof value === 'string') {
    return value.trim()
  }

  return value
}

// Taken from here: https://codepen.io/ajmueller/pen/NyXNME
export const trimObjectWhiteSpaces = (object: Object) => {
  return JSON.parse(JSON.stringify(object, trimStrings, 4))
}
