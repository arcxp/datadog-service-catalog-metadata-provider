const VersionDifferences = {
  v2: {
    uniqueFields: ['docs', 'repos'],
    requiredFields: [],
  },
  'v2.1': {
    uniqueFields: ['application', 'description', 'tier', 'lifecycle'],
    requiredFields: [],
  },
}

Object.freeze(VersionDifferences)
