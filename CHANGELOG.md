# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [3.0.0] - unreleased

> [!WARNING]
> This version may include breaking changes!
> There have been efforts made to not break backwards compatibility for either the org rules file
> or the schema versions. That said, it is impossible to know how you have structured your files,
> so please exercise caution when upgrading to the `v3` tag.

### Added

- Better tests for the various schema versions

### Changed

- Moved all of the field mapping from a common module for all versions, to version-specific modules
  - This will make it easier to add new schema version support without risking breakage to existing versions
  - This makes it much easier to test convenience functionality independently from the schema fields
- So... many... tests...

## [2.3.0] - 2024-02-07

### Added

- Support for extensions, they're just a straight YAML-to-JSON conversion.

## [2.2.0] - 2023-12-21

### Added

- Added support for schema version v2.2
- Added the `uuid` dependency since `@actions/core` insists
- Added some more edge case tests

### Changed

- Updated dependencies

## [2.1.0] - 2023-10-20

### Added

- Added a limit of ten Datadog calls per Workflow step

### Changed

- Updated dependencies
  - `yaml`
  - `@types/jest`
  - `jest`
  - `prettier`
  - `@actions/github`
  - `@actions/http-client`
- Using `cjs` extensions instead of `js` ones, per convention
- Updating to NodeJS 20
- Changing from `@vercel/ncc` to `esbuild` for packaging.

## [2.0.0] - 2023-06-29

### Added

- Support for the Datadog Service Catalog v2.1 schema version.

### Changed

- Version updates to dependencies.
- Corrected a bunch of documentation problems.

## [1.1.2] - 2023-03-16

### Fixed

- Org rule file was not being read correctly. This has been fixed.
- The org name comparison shouldn't have been case-sensitive. This has been fixed.

### Changed

- The `currentOrg()` function is no longer `async` as it doesn't need to be.

## [1.1.1] - 2023-03-15

### Added

- Added the ability to restrict the provider on the `docs` node.

### Removed

- Removed the private `dotGitHubRepo()` function as it was unused. The Actions toolkit kinda renders that function unnecessary.

### Correction

- The prior version of this `CHANGELOG.md` file had the incorrect release date of `v1.1.0`. It was in fact 2023-03-15, not 2023-03-13.

## [1.1.0] - 2023-03-15

### Changed

- Updated dependencies to latest versions.

### Added

- Added the ability to add requirements and restrictions from the `ORG-NAME/.github/datadog-service-catalog.yml` file. This file is optional, and if it doesn't exist, the action will just use the defaults.
- Added a bunch of documentation to the README.md file for the Org Rules File.
- Added test coverage to Jest so we can track changes in coverage.
- The tests now run and pass in GitHub Actions!

### Fixed

- Fixed an issue which added a Slack link to the registry, even if there wasn't one provided. It was just showing up as "undefined".
- Fixed an issue where sometimes tags would be interpreted as an Array of Objects rather than just an Array of Strings.

## [1.0.4] - 2023-01-26

### Fixed

- Missed the new build process, resolved now.

## [1.0.3] - 2023-01-26

### Fixed

- Fixed an issue where lists which should have been empty were actually lists containing single empty string.

## [1.0.2] - 2023-01-26

### Fixed

- Dependencies issue which was causing jobs to fail.

## [1.0.0] - 2023-01-26

### Added

- Initial release
- The ability to push metadata to Datadog Service Catalog from a GitHub Action

<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
