/**
 * Validates the Datadog host.
 * @param {string} ddHost - The Datadog host.
 * @returns {string} - The Datadog host.
 * @public
 * @function
 * @throws {Error} - If the Datadog host is invalid.
 */
const validateDatadogHostname = (ddHost) => {
  // Verify the host.
  if (!ddHost || !ddHost.match(/^[a-z0-9.-]+\.(datadoghq\.(com|eu|us)|ddog-gov\.com)$/)) {
    throw new Error(
      `Invalid DataDog host: ${ddHost}. See here for more details: https://docs.datadoghq.com/getting_started/site/`,
    )
  }
  return ddHost
}

module.exports = { validateDatadogHostname }
