# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]

### Changed

- Updated dependencies
  - `yaml`
  - `@types/jest`
  - `jest`
  - `prettier`

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
