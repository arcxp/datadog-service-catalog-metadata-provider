/**
 * @file This file contains the functions which apply the organization rules to service catalog entries.
 * @module lib/org-rules
 * @author Mike Stemle <themanchicken@duck.com>
 **/

const YAML = require('yaml')
const core = require('@actions/core')
const github = require('@actions/github')
const ghRestPlugin = require('@octokit/rest')
const _ = require('lodash')

/**
 * The default name of the service catalog rules file in the `.github` repository.
 * @type {string}
 * @private
 * @constant
 */
const DEFAULT_RULES_NAME = 'service-catalog-rules.yml'

/**
 * Fetch the GitHub token from the environment, and return an authenticated
 * Octokit instance.
 * @param {string} token - The GitHub token to use for authentication, otherwise the GITHUB_TOKEN from the environment will be used.
 * @returns {Octokit} - An authenticated Octokit instance.
 * @private
 * @function
 * @async
 */
const ghHandle = async (token = undefined) =>
  Promise.resolve()
    .then(
      () =>
        token || core.getInput('github-token') || process.env['GITHUB_TOKEN']
    )
    .then((token) =>
      !!token && token.length > 0
        ? github.getOctokit(token, {})
        : core.warning('No GitHub token found, org rules cannot be applied.')
    )

/**
 * Fetch the current organization from the GitHub context.
 * @param {Octokit} gh - An authenticated Octokit instance (default is the GITHUB_TOKEN from the environment).
 * @returns {string} - The current organization.
 * @private
 * @function
 * @async
 */
const currentOrg = (gh = undefined) => {
  try {
    return github.context.repo?.owner
  } catch (err) {
    core.error(`Unable to determine current organization or owner: ${err}`)
    core.setFailed(
      'This GitHub Actions environment does not have a valid context.'
    )
  }

  return
}

/**
 * Fetch the contents of the Org Rules File from the org's `.github` repository.
 * @param {Octokit} gh - An authenticated Octokit instance (default is the GITHUB_TOKEN from the environment).
 * @param {string} rulesFileName - The name of the rules file in the `.github` repository (default is `service-catalog-rules.yml`).
 * @returns {object} - The contents of the Org Rules File.
 * @private
 * @function
 * @async
 */
const fetchRemoteRules = async (
  gh = undefined,
  rulesFileName = DEFAULT_RULES_NAME
) => {
  try {
    const octokit = gh ?? (await ghHandle())

    if (!octokit) {
      return
    }

    const orgName = currentOrg(octokit)
    const defaultPayload = { org: orgName || 'UNKNOWN', rules: [] }

    if (!orgName) {
      core.warning('Unable to determine current organization or owner.')
      return defaultPayload
    }

    const { data } = await octokit.rest.repos
      .getContent({
        owner: orgName,
        repo: '.github',
        path: rulesFileName,
      })
      .then((res) => {
        core.debug(`Result of fetching remote rules: ${JSON.stringify(res)}`)
        return res?.data ? res : { data: undefined }
      })
      .catch((err) => {
        core.debug(`Caught exception fetching remote rules: ${err}`)
        return Promise.resolve({ data: undefined })
      })
    if (!data) {
      core.debug(
        `The Org Rules File "${rulesFileName}" in the «${orgName}/.github» repository appears to contain no content.`
      )
      return defaultPayload
    }

    // Debugging
    if (!!process.env['RUNNER_DEBUG']) {
      core.debug(
        `Org Rules File "${rulesFileName}" contents: ${JSON.stringify(
          data,
          undefined,
          2
        )}`
      )
    }

    // Start parsing the rules file.
    const orgRulesFileContents = YAML.parse(
      decodeURIComponent(
        Buffer.from(data.content, data.encoding ?? 'base64').toString()
      )
    )

    if (!orgRulesFileContents || typeof orgRulesFileContents !== 'object') {
      return core.setFailed(
        `Org Rules File "${rulesFileName}" failed to parse.`
      )
    }

    if (
      orgRulesFileContents?.org?.toLocaleLowerCase() !==
      orgName?.toLocaleLowerCase()
    ) {
      return core.warning(
        `Org ${orgName} does not match the org in the Org Rules File. This isn't fatal, but it might be an indication that you're using the wrong Org Rules File.`
      )
    }

    return orgRulesFileContents || defaultPayload
  } catch (err) {
    return core.setFailed('Error fetching remote rules: ' + err.toString())
  }
}

/**
 * Check selection criteria for tags.
 * @param {object} tags - The tags to check.
 * @param {object} serviceDefinition - The service definition to use when checking.
 * @returns {boolean} - True if the tags match, false otherwise.
 * @throws {Error} - If the tags are invalid.
 * @private
 * @function
 */
const selectionForTags = (tags, serviceDefinition) => {
  if (!_.isPlainObject(tags) || _.isEmpty(tags)) {
    throw new Error('Tags must be expressed as key-value pairs.')
  }

  for (const [tagKey, tagValue] of Object.entries(tags)) {
    const foundTag =
      serviceDefinition?.tags?.find((tag) =>
        _.startsWith(tag.toLocaleLowerCase(), tagKey.toLocaleLowerCase())
      ) || undefined

    if (!foundTag) {
      return false
    }

    const [foundTagKey, foundTagValue] = foundTag
      .toLocaleLowerCase()
      .split(/\s*?:\s*?/)
    if (foundTagKey.trim() !== tagKey.toLocaleLowerCase()) {
      return false
    } else if (foundTagValue.trim() !== tagValue.toLocaleLowerCase()) {
      return false
    }
  }

  return true
}

const caseSensitiveFieldListMatch =
  (fieldName) => (value, serviceDefinition) => {
    if (value.toLocaleLowerCase() === 'all') {
      !!_.get(serviceDefinition, fieldName, undefined)
    }
    if (!Array.isArray(value)) {
      core.warning(
        `Invalid value for ${fieldName}: ${value}; this should be either 'all' or an array of acceptable values.`
      )
    }

    return (
      value.filter((v) => _.get(serviceDefinition, fieldName, []).includes(v))
        .length > 0
    )
  }

/**
 * Make a function which checks for a field name in a service definition.
 * @param {string} fieldName - The field name to check.
 * @returns {function} - A function which checks for the field name in a service definition.
 * @private
 * @function
 **/
const caseInsensitiveFieldMatch = (fieldName) => (value, serviceDefinition) =>
  value.toLocaleLowerCase() ===
  serviceDefinition?.[fieldName]?.toLocaleLowerCase()

/**
 * Determine if the rule applies to the service description. Since a single rule can have
 * multiple selection criteria, this function will return true only if _all_ selection criteria
 * are met.
 * @param {object} rule - The rule to check.
 * @param {object} serviceDescription - The service description to use when checking.
 * @returns {boolean} - True if the rule applies to the service description, false otherwise.
 * @private
 * @function
 * @throws {Error} - If the rule is invalid.
 */
const determineApplicabilityOfRule = (rule, serviceDescription) => {
  const selectionCriteria = rule?.selection || undefined
  const selectionCheckers = {
    tags: selectionForTags,
    'service-name': caseInsensitiveFieldMatch('dd-service'),
    'schema-version': caseInsensitiveFieldMatch('schema-version'),
    team: caseInsensitiveFieldMatch('team'),
    application: caseSensitiveFieldListMatch('application'),
    tier: caseSensitiveFieldListMatch('tier'),
    lifecycle: caseSensitiveFieldListMatch('lifecycle'),
  }
  const selectableFields = Object.keys(selectionCheckers)

  if (!selectionCriteria) return false

  if (`${selectionCriteria}`.toLocaleLowerCase() === 'all') return true

  // Find all of the criteria which fail.
  const failingCriteria = _.filter(selectionCriteria, (value, key) => {
    // Quick validation check
    if (!selectionCheckers[key]) {
      throw new Error(
        `Field "${key}" is not a valid for selection criteria, only ${selectableFields.join(
          ', '
        )} are supported.`
      )
    }

    return selectionCheckers[key](value, serviceDescription) === false
  })

  // If there are no failing criteria, then the rule applies.
  return failingCriteria.length === 0
}

/**
 * Determine if the service description meets the requirements of the rule, using only a count.
 * @param {string} locationOfCountInRequirement - The location of the count to match in the requirement.
 * @param {string} locationOfCountInServiceDefinition - The location of the count to match in the service definition.
 * @returns {function} - A compliance check function.
 * @private
 * @function
 */
const makeComplianceCheck_countOnly = (
  locationOfCountInRequirement,
  locationOfCountInServiceDefinition
) => {
  const countField_req = (requirement) =>
    _.get(requirement, locationOfCountInRequirement, undefined)
  const countField_sd = (serviceDefinition) =>
    _.get(serviceDefinition, locationOfCountInServiceDefinition, undefined)

  return (requirement, serviceDefinition) => {
    const req_count = countField_req(requirement)
    const sd_count = countField_sd(serviceDefinition)

    if (req_count === undefined) return true
    if (sd_count === undefined) return false
    if (sd_count < req_count) return false

    return true
  }
}

/**
 * Create a compliance check function which checks that a field in the service definition using a value check and a count.
 * @param {string} locationOfMatchInRequirement - The location of the field to match in the requirement.
 * @param {string} locationOfCountInRequirement - The location of the count to match in the requirement.
 * @param {string} locationOfFieldListInServiceDefinition - The location of the field list in the service definition.
 * @param {string} locationOfMatchInField - The location of the field to match in the field.
 * @param {string} locationOfCountInServiceDefinition - The location of the count to match in the service definition.
 * @returns {function} - A compliance check function.
 * @private
 * @function
 */
const makeComplianceCheck_valueMatchAndCount = (
  locationOfMatchInRequirement,
  locationOfCountInRequirement,
  locationOfFieldListInServiceDefinition,
  locationOfMatchInField,
  locationOfCountInServiceDefinition
) => {
  const matchField_req = (requirement) =>
    _.get(requirement, locationOfMatchInRequirement, undefined)
  const matchList_sd = (serviceDefinition) =>
    _.get(serviceDefinition, locationOfFieldListInServiceDefinition, undefined)
  const matchField_sd = (field) =>
    _.get(field, locationOfMatchInField, undefined)
  const countEnforcer = makeComplianceCheck_countOnly(
    locationOfCountInRequirement,
    locationOfCountInServiceDefinition
  )

  return (requirement, serviceDefinition) => {
    const req_match = matchField_req(requirement)
    const sd_list = matchList_sd(serviceDefinition)

    if (!countEnforcer(requirement, serviceDefinition)) return false

    const permittedValues = Array.isArray(req_match) ? req_match : [req_match]

    if (req_match === undefined) return true
    if (sd_list === undefined) return false
    if (
      permittedValues.length &&
      !sd_list.find((value) =>
        _.includes(permittedValues, matchField_sd(value).toLocaleLowerCase())
      )
    ) {
      return false
    }

    return true
  }
}

/**
 * Create a compliance check function which checks that a field in the service definition using a value check, with support for `any`.
 * @param {string} fieldName - The name of the field to check.
 * @returns {function} - A compliance check function.
 * @private
 * @function
 **/
const makeSimpleStringFieldComplianceChecker =
  (fieldName) => (requirement, serviceDefinition) => {
    if (!requirement || _.isEmpty(requirement)) return true
    if (!serviceDefinition || _.isEmpty(serviceDefinition)) return false

    // Support `any`
    if (
      !Array.isArray(requirement) &&
      requirement.toLocaleLowerCase() === 'any'
    ) {
      return !!_.get(serviceDefinition, fieldName, undefined)
    }

    const req_list = Array.isArray(requirement) ? requirement : [requirement]
    const sd_value = _.get(serviceDefinition, fieldName, undefined)

    return req_list.includes(sd_value)
  }

/**
 * Check if the service description complies with the tags rule.
 * @param {object} requirement - The requirement to check.
 * @param {object} serviceDescription - The service description to use when checking.
 * @returns {boolean} - True if the service description complies with the rule, false otherwise.
 * @private
 * @function
 */
const checkTagsCompliance = (requirement, serviceDescription) => {
  if (!requirement || _.isEmpty(requirement)) return true

  // Need to preprocess these tags, they sometimes come in as a string, sometimes as a key/value pair.
  const requiredTags = _.map(requirement, (tagValue, tagName) => {
    if (typeof tagValue === 'object') return tagValue
    if (typeof tagValue === 'string' && typeof tagName === 'number') {
      const [parsedTagKey, parsedTagValue] = tagValue
        .toLocaleLowerCase()
        .split(/\s*?:\s*?/)
      return { [parsedTagKey]: parsedTagValue }
    }
    return { [tagName]: tagValue }
  })

  const parsedTags = _.merge(
    ...(serviceDescription?.tags || []).map((tag) => {
      const [tagKey, tagValue] = tag.toLocaleLowerCase().split(/\s*?:\s*?/)
      return { [tagKey]: tagValue }
    })
  )

  const nonCompliantTags = _.filter(requiredTags, (tagObj) => {
    const [tagName, tagValue] = _.head(Object.entries(tagObj))

    validTagValues = (Array.isArray(tagValue) ? tagValue : [tagValue]).map(
      (x) => (typeof x === 'string' ? x.toLocaleLowerCase() : x)
    )

    return tagValue === 'ANY'
      ? !_.has(parsedTags, tagName)
      : !_.includes(validTagValues, parsedTags[tagName]?.toLocaleLowerCase())
  })

  return nonCompliantTags.length === 0
}

/**
 * Check if the service description complies with the integrations requirement.
 * @param {object} requirement - The requirement to check.
 * @param {object} serviceDescription - The service description to use when checking.
 * @returns {boolean} - True if the service description complies with the requirement, false otherwise.
 * @private
 * @function
 */
const checkIntegrationsCompliance = (requirement, serviceDescription) => {
  if (!requirement || !_.isArray(requirement) || requirement.length === 0) {
    return true
  }

  // Just a little validation.
  if (
    requirement.filter((x) => !_.includes(['pagerduty', 'opsgenie'], x))
      .length > 0
  ) {
    return core.setFailed('Invalid integration requirement: ' + requirement)
  }

  if (
    _.includes(requirement, 'pagerduty') &&
    !_.has(serviceDescription, 'integrations.pagerduty')
  ) {
    return false
  }
  if (
    _.includes(requirement, 'opsgenie') &&
    !_.has(serviceDescription, 'integrations.opsgenie')
  ) {
    return false
  }

  return true
}

/**
 * Determine if the service description complies with the rule.
 * @param {object} rule - The rule to check.
 * @param {object} serviceDescription - The service description to use when checking.
 * @returns {boolean} - True if the service description complies with the rule, false otherwise.
 * @private
 * @function
 * @throws {Error} - If the rule or service description are invalid.
 */
const determineRuleCompliance = (rule, serviceDescription) => {
  core.debug({ rule, serviceDescription })
  if (!rule || !serviceDescription) {
    throw new Error('Both rule and service description are required.')
  }

  // If the rule lacks requirements or isn't applicable, then it complies.
  if (
    rule?.requirements?.length === 0 ||
    !determineApplicabilityOfRule(rule, serviceDescription)
  ) {
    return true
  }

  const complianceCheckers = {
    // Tags and integrations have special handling.
    tags: checkTagsCompliance,
    integrations: checkIntegrationsCompliance,

    application: makeSimpleStringFieldComplianceChecker('application'),
    description: makeSimpleStringFieldComplianceChecker('description'),
    lifecycle: makeSimpleStringFieldComplianceChecker('lifecycle'),
    tier: makeSimpleStringFieldComplianceChecker('tier'),

    // Everything else can use these higher-order functions.
    links: makeComplianceCheck_valueMatchAndCount(
      'type',
      'count',
      'links',
      'type',
      'links.length'
    ),
    docs: makeComplianceCheck_valueMatchAndCount(
      'provider',
      'count',
      'docs',
      'provider',
      'docs.length'
    ),
    contacts: makeComplianceCheck_valueMatchAndCount(
      'type',
      'count',
      'contacts',
      'type',
      'contacts.length'
    ),
    repos: makeComplianceCheck_countOnly('count', 'repos.length'),
  }
  const fieldsOutOfCompliance = []

  _.each(rule?.requirements, (reqValue, reqName) => {
    if (!complianceCheckers[reqName]) {
      throw new Error(
        `Field "${reqName}" is not available for requirements. Please see the documentation for available fields.`
      )
    }

    if (complianceCheckers[reqName](reqValue, serviceDescription) === false) {
      fieldsOutOfCompliance.push(reqName)
    }
  })

  fieldsOutOfCompliance.length > 0 &&
    console.warn(
      `Fields out of compliance: ${JSON.stringify(
        fieldsOutOfCompliance,
        undefined,
        2
      )}`
    )

  return fieldsOutOfCompliance.length === 0
}

/**
 * This function will take the rules and apply them to the service description.
 * In the event that the rules are unintelligible or are violated, then
 * `core.setFailed()` will be called.
 * @param {object} serviceDescription - The service description to be sent to Datadog.
 * @param {object} orgRules - The organization rules to apply to the service description.
 * @returns {void} - Nothing.
 * @private
 * @async
 * @function
 */
const applyOrgRules = (serviceDescription, orgRules) => {
  const rules = orgRules?.rules || []
  const brokenRules = rules.filter(
    (rule) => !determineRuleCompliance(rule, serviceDescription)
  )

  if (brokenRules.length > 0) {
    core.setFailed(
      `The service description violates the following rules: ${JSON.stringify(
        brokenRules,
        undefined,
        2
      )}`
    )
    return false
  }

  return true
}

/**
 * Apply the organization rules to the service description to be sent to Datadog.
 * @param {object} serviceDescription - The service description to be sent to Datadog.
 * @returns {Promise<boolean>} - Nothing.
 * @public
 * @function
 * @async
 * @throws {Error} - If the Datadog host is invalid.
 */
const fetchAndApplyOrgRules = (serviceDescription) =>
  Promise.resolve()
    .then(() => ghHandle())
    .then((gh) =>
      fetchRemoteRules(
        gh,
        core.getInput('org-rules-file') || DEFAULT_RULES_NAME
      )
    )
    .then((remoteOrgRules) => {
      if (!remoteOrgRules) {
        core.warning(`No rules found for the organization "${currentOrg()}".`)
      } else {
        core.debug(
          `Rules found for the organization "${currentOrg()}": ${JSON.stringify(
            remoteOrgRules,
            undefined,
            2
          )}`
        )
      }
      return remoteOrgRules
    })
    .then((remoteOrgRules) =>
      Promise.resolve(
        !!remoteOrgRules
          ? applyOrgRules(serviceDescription, remoteOrgRules)
          : true
      )
    )
    .catch((err) => {
      core.warning('Failing with error: ' + err)
      return Promise.reject(err)
    })

module.exports = {
  fetchAndApplyOrgRules,
}

// Expose some of the private functions for testing.
if (process.env['JEST_WORKER_ID']) {
  module.exports._test = {
    fetchRemoteRules,
    applyOrgRules,
    currentOrg,
    ghHandle,
    determineApplicabilityOfRule,
    determineRuleCompliance,
    DEFAULT_RULES_NAME,
  }
}
