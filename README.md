# Datadog Service Catalog Metadata Provider

[![DataDog Service Catalog](https://github.com/arcxp/datadog-service-catalog-metadata-provider/actions/workflows/automated-testing.yml/badge.svg)](https://github.com/arcxp/datadog-service-catalog-metadata-provider/actions/workflows/automated-testing.yml)

Welcome to the Datadog Service Catalog Metadata Provider!

The Datadog Service Catalog is a marvelous new way to track which services are in production. Your telemetry data is presented in the Service Catalog in a way where you can see the health of your services, and the health of the services that depend on them, all in one place. Most importantly, the Service Catalog helps you support your services in any environment.

With the Service Catalog registration API, you can supply the Service Catalog with all of the support information you might want:

- The name of the service
- The name of the application to which the service belongs
- The team which supports and maintains the service
- The email address of the team
- The URL of the service's documentation, which has a special subtype for runbooks (we _all_ need more runbooks)
- The URL of the service's source code
- The URL of the service's dashboards and performance metrics
- Integration information for important services like Slack, MS Teams, PagerDuty, and Opsgenie

You can use this to register your services with the Service Catalog, and then use the Service Catalog to find the information you need to support your services.

Supporting services can be tricky, and the Datadog Service Catalog can make it easier for team members who aren't familiar with your service to support it. The Service Catalog can also help you find the information you need to support your services, and help you find the right people to support your services.

**NOTE ABOUT VERSIONING:** This GitHub Action uses the [Service Catalog Definition APIs](https://docs.datadoghq.com/tracing/service_catalog/service_definition_api/#post-a-service-definition) at version 2. Datadog is always working to improve their APIs, and this Action will be updated to support the newer versions of the API as they become available.

## Supported Versions

At this time, this GitHub Action supports the following versions of the Service Catalog schema:

- `v2`
- `v2.1`

## Wait, but why?

Datadog already has methods for supplying this information. Why do we need another one? The answer is pretty simple: constraints.

Datadog has a super useful GitHub integration which allows you to register your service with a simple JSON file in your repository, after you install their GitHub plugin and give it read access to your repository. This is great, but if you're using GitOps for deployments and such, sometimes more integrations and webhooks can be concerning.

In order to get the benefits of the Service Catalog without having to open GitHub up to those integrations, this GitHub Action will allow you to register your services with the Service Catalog using a GitHub Action, which then allows you to have full control and visibility over this process. It also gives you full control over when this information is sent to Datadog.

Another reason to use this Action is that it permits your organization to establish controls on what must be present in your service metadata. For example, you might require that all services running in production have a runbook, or that all services have a specific tag which says where they're run. This Action gives you a way to add some controls without having to chase down every service owner and ask them to add the information. For more information on this functionality, see the section on [Organization Controls](#organization-controls) below.

## Supported Metadata Fields

The registration API's links are below, and it takes input per its own JSON schema (also below), but this Action seeks to make things simpler and easier still! There are a lot of fields to choose from across the supported versions, we're going to group them into: Action Fields, Schema Fields, and Convenience Fields.

- Action Fields are fields that are specific to this GitHub Action. They are not part of the Service Catalog API, but they are used by this Action to make things easier for you.
- Schema Fields are fields that are part of the Service Catalog API. They are not specific to this GitHub Action, but they are used by this Action to make things easier for you. These may vary by `schema-version`.
- Convenience Fields are fields that are not part of the Service Catalog API, but they are used by this Action to make things easier for you. With these fields you need not worry about schema version, this action will map them to supported fields for you.

### Action Fields

All of these fields are used for the functioning of this Action.

| Field | Description | Required | Default |
| --- | --- | --- | --- |
| `schema-version` | This is the version of the schema you're using. This action supports versions `v2` and `v2.1`, with `v2` being the default if no version is specified. | No | `v2` |
| `github-token` | This action will use the built-in `GITHUB_TOKEN` for all GitHub access. If you would prefer to use a different GitHub token for the action, please specify it here. | No | `GITHUB_TOKEN` |
| `org-rules-file` | If you would prefer to use a different name for your Org Rules File, you can specify it here. This parameter only supports a different file name within the `.github` repository, it will not support an alternate repository. Please make sure that your Org Rules File is accessible to whichever token you use (either `GITHUB_TOKEN` or the `github-token` input value). | No | `.github/service-catalog-rules.yml` |
| `datadog-hostname` | The Datadog host to use for the integration, which varies by Datadog customer. [See here for more details:](https://docs.datadoghq.com/getting_started/site/) <https://docs.datadoghq.com/getting_started/site/>. Please make sure that you are sure about this value. You'll get an error if it's incorrect. | Yes | `https://api.datadoghq.com` |
| `datadog-key` | The Datadog API key to use for the integration. _Please_ use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to secure your secrets. | Yes | |
| `datadog-app-key` | The Datadog Application key to use for the integration. _Please_ use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to secure your secrets. | Yes | |

### Schema Fields

These fields directly map to the Service Catalog API. Please see the [Service Catalog API Documentation](https://docs.datadoghq.com/tracing/service_catalog/service_definition_api/#post-a-service-definition) for more information.

Using a field which is not supported in the schema version you've selected will result in an error.

| Field | Description | Required | Default | Schema Versions |
| --- | --- | --- | --- | --- |
| `service-name` | The name of the service. This must be unique across all services. | Yes | | `v2`, `v2.1` |
| `team` | The team that owns the service. | Yes | | `v2`, `v2.1` |
| `description` | A description of the service. | No | | `v2.1` |
| `application` | The application that the service belongs to. | No | | `v2.1` |
| `tier` | The importance tier of the service. This is an unconstrained text field where you can use your own tiering definitions. Examples would be `High`, `Critical`, or however you or your organization classify criticality tiers. | No | | `v2.1` |
| `lifecycle` | This is the lifecycle of the service. This text field is unconstrained, and some examples are `production`, `development`, `staging`. | No | | `v2.1` |
| `contacts` | The list of contacts for the service. Each of these contacts is an object. Keep in mind that `email` and `slack-support-channel` are already included as contacts. This list should be in addition to that. These values are supplied as objects, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `[]` | `v2`, `v2.1` |
| `contacts[].name` | The name of the contact. | Yes | | `v2`, `v2.1` |
| `contacts[].type` | The type of the contact. Acceptable values are: `email`, `slack`, and `microsoft-teams` | Yes | | `v2`, `v2.1` |
| `contacts[].contact` | The actual contact information for the contact. For example, if the type is `email`, this would be the email address. | Yes | | `v2`, `v2.1` |
| `repos` | The list of GitHub repositories that are part of the service. You must supply at least one repository. The repositories are supplied as objects, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. In `v2.1`, this field is moved under `links`. | Yes | `[]` | `v2` |
| `repos[].name` | The name of the repository. | Yes | | `v2` |
| `repos[].url` | The URL of the repository. | Yes | | `v2` |
| `repos[].provider` | The provider of the repository. Acceptable values are: `Github`. | No | | `v2` |
| `tags` | The list of tags that are associated with the service. This should be a list of key-value pairs separated by colons. | No | |
| `links` | A list of links associated with the service. These links are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `[]` | `v2`, `v2.1` |
| `links[].name` | The name of the link. | Yes | | `v2`, `v2.1` |
| `links[].url` | The URL of the link. | Yes | | `v2`, `v2.1` |
| `links[].type` | The type for the link. Acceptable values are: `doc`, `wiki`, `runbook`, `url`, `repo`, `dashboard`, `oncall`, `code`, and `link` | Yes | | `v2`, `v2.1` |
| `docs` | A list of documentation links associated with the service. These links are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. In `v2.1`, this field moved under `links`. | No | `[]` | `v2` |
| `docs[].name` | The name of the document. | Yes | | `v2` |
| `docs[].url` | The URL of the document. | Yes | | `v2` |
| `docs[].provider` | The provider for where the documentation lives. Acceptable values are: `Confluence`, `GoogleDocs`, `Github`, `Jira`, `OneNote`, `SharePoint`, and `Dropbox` | No | | `v2` |
| `integrations` | Integrations associated with the service. These integrations are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `{}` | `v2`, `v2.1` |
| `integrations.opsgenie` | The OpsGenie details for the service. | No | | `v2`, `v2.1` |
| `integrations.opsgenie.service_url` | The service URL for the OpsGenie integration. A team URL will work, but if you want on-call metadata then make sure that this URL is to a service, not a team. | Yes | | `v2`, `v2.1` |
| `integrations.opsgenie.region` | The region for the OpsGenie integration. Acceptable values are `US` and `EU`. | No | | `v2`, `v2.1` |
| `integrations.pagerduty` | The PagerDuty URL for the service. **Important:** In `v2`, this field is just a URL. In `v2.1` this field is a dictionary with a `service-url` property. | No | | `v2`, `v2.1` |
| `integrations.pagerduty.service-url` | The PagerDuty URL for the service. | Yes | | `v2.1` |

### Convenience Fields

| Field | Description | Required | Default |
| --- | --- | --- | --- |
| `email` | The email address of the team that owns the service. | Yes | |
| `slack-support-channel` | The Slack channel where folks can get support for the service. **This must be a Slack URL.** | No | |
| `slack` | This field is an alias for the `slack-support-channel` field. **This must be a Slack URL.** | No | |
| `repo` | The GitHub repository where the service is hosted. In `v2`, this field maps into the `repos` field, but in `v2.1` it maps into the `links` field. | No | |
| `opsgenie` | This is a convenience field for your OpsGenie service URL. | No | |
| `pagerduty` | This is a convenience field for your PagerDuty service URL. | No | |

## Example

### Simplest possible example

Here I have a simple example of a service that has a single repository, and the least amount of metadata possible.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: arcxp/datadog-service-catalog-metadata-provider@v2
        with:
          schema-version: v2.1
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APP_KEY }}
          service-name: my-service
          team: my-team
          email: my-team@my-organization-which-totally-exists.com
```

### Simpler service with more metadata

In this example, you can see that my team is called "Global Greetings," and I have a single repository for my service. I also have a single document, and a single link.

My Slack support channel is listed by URL, and the email address is present. At the bottom you can also see the OpsGenie integration details.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: arcxp/datadog-service-catalog-metadata-provider@v2
        with:
          schema-version: v2
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APPLICATION_KEY }}
          service-name: hello-world
          team: Global Greetings
          email: global.greetings@fake-email-host.com
          slack-support-channel: 'https://team-name-here.slack.com/archives/ABC123'
          repos: |
            - name: hello-world
              url: https://github.com/fake-org/hello-world
              provider: github
          docs: |
            - name: outage-runbook
              url: https://fake-org.github.io/hello-world-outage-runbook
              provider: github
          integrations: |
            opsgenie:
              service_url: https://fake-org.hello-world.opsgenie.com
              region: US
          contacts: |
            - name: Product Owner
              email: john.doe@fake-email-host.com
```

### Example with multiple repositories

This example is the same as above, except that I have a multiple repositories involved.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: arcxp/datadog-service-catalog-metadata-provider@v2
        with:
          schema-version: v2
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APPLICATION_KEY }}
          service-name: hello-world
          team: Global Greetings
          email: global.greetings@fake-email-host.com
          slack-support-channel: 'https://team-name-here.slack.com/archives/ABC123'
          repos: |
            - name: hello-world
              url: https://github.com/fake-org/hello-world
              provider: github
            - name: some-library
              url: https://github.com/fake-org/some-library
              provider: github
          docs: |
            - name: outage-runbook
              url: https://fake-org.github.io/hello-world-outage-runbook
              provider: github
          integrations: |
            opsgenie:
              service_url: https://fake-org.hello-world.opsgenie.com
              region: US
          contacts: |
            - name: Product Owner
              email: john.doe@fake-email-host.com
```

### The whole enchilada

This is the maximal configuration you could use, in a complete workflow that you could copy-and-paste. It's a bit verbose, but it shows you all the options you have complete with "why."

#### Here it is for schema version `v2`

```yaml
---
name: Datadog Service Catalog Metadata Provider

on:
  # This will make my service definition get pushed any time I push a change
  # to the main branch of my repository.
  push:
    branches:
      - main
  # This trigger will allow me to manually run the Action in GitHub.
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # This uses the custom action to push the service definition to Datadog.
      - uses: arcxp/datadog-service-catalog-metadata-provider@v2
        with:
          service-version: v2
          # You should use GitHub's encrypted secrets feature to manage secrets for Datadog.
          # Don't store your secrets in your workflow files, and don't do anything fancy to get them.
          # GitHub already gave us a great tool for managing secrets, and it's super easy to use.
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APPLICATION_KEY }}

          # This maps to the `dd-service` field in Datadog, it's just the name of your service.
          service-name: hello-world
          
          # The name of the team which owns and/or supports the service.
          team: Global Greetings

          # The email address of the team which owns and/or supports the service.
          email: global.greetings@fake-email-host.com
          
          # The URL of the Slack channel where support for the service is handled.
          # Keep in mind, this _must_ be a URL. To get the URL, right-click on the channel
          # in the Slack app, and select "Copy link" in the "Copy" submenu.
          slack-support-channel: 'https://team-name-here.slack.com/archives/ABC123'
          
          tags: |
            - isprod:true
            - lang:nodejs
          
          # For repos, you'll obviously want to have the repository for your service. If your service
          # is made up of multiple repositories, you can add them here as well. Note that we're using a multi-line string here. That multi-line string will be parsed as YAML, I didn't typo.
          repos: |
            - name: hello-world (primary service repo)
              url: https://github.com/fake-org/hello-world
              provider: github
            - name: some-library
              url: https://github.com/fake-org/some-library
              provider: github
          
          # Docs contain anything that you might need when supporting the service.
          docs: |
            - name: API Docs
              url: https://fake-org.github.io/hello-world-api-docs
              provider: github
          
          # Links are great for runbooks, other documentation, other services which
          # could be helpful, as well as dashboards.
          links: |
            - name: outage-runbook
              url: https://fake-org.github.io/hello-world-outage-runbook
              type: runbook
            - name: hello-world dashboard
              url: https://app.datadoghq.com/dashboard/1234567890
              type: dashboard
          
          # These integrations allow folks to be able to see who's on-call for the
          # service right from the Datadog Service Catalog.
          integrations: |
            opsgenie:
              service_url: https://fake-org.hello-world.opsgenie.com
              region: US
            pagerduty: https://fake-org.hello-world.pagerduty.com
          
          # This is the Product Owner, you should contact them if you have suggestions.
          contacts: |
            - name: Product Owner
              email: john.doe@fake-email-host.com
```

#### Here it is for schema version `v2.1`

This is ported over from `v2`, and `v2.1` fields are added.

```yaml
---
name: Datadog Service Catalog Metadata Provider

on:
  # This will make my service definition get pushed any time I push a change
  # to the main branch of my repository.
  push:
    branches:
      - main
  # This trigger will allow me to manually run the Action in GitHub.
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # This uses the custom action to push the service definition to Datadog.
      - uses: arcxp/datadog-service-catalog-metadata-provider@v2
        with:
          service-version: v2.1
          # You should use GitHub's encrypted secrets feature to manage secrets for Datadog.
          # Don't store your secrets in your workflow files, and don't do anything fancy to get them.
          # GitHub already gave us a great tool for managing secrets, and it's super easy to use.
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APPLICATION_KEY }}

          # This maps to the `dd-service` field in Datadog, it's just the name of your service.
          service-name: hello-world

          # This is the application name, which is used to group services together.
          application: hello-world

          # This application is critically important, so let's outline that with the tier field.
          tier: critical

          # This service is in production, so let's put that into the lifecycle field
          lifecycle: production
          
          # The name of the team which owns and/or supports the service.
          team: Global Greetings

          # The email address of the team which owns and/or supports the service. This is a convenience field
          email: global.greetings@fake-email-host.com
          
          # The URL of the Slack channel where support for the service is handled.
          # Keep in mind, this _must_ be a URL. To get the URL, right-click on the channel
          # in the Slack app, and select "Copy link" in the "Copy" submenu.
          slack-support-channel: 'https://team-name-here.slack.com/archives/ABC123'
          
          tags: |
            - isprod:true
            - lang:nodejs
          
          # Links are great for runbooks, other documentation, other services which
          # could be helpful, as well as dashboards. In v2.1 repos and docs move here.
          links: |
            - name: hello-world (primary service repo)
              url: https://github.com/fake-org/hello-world
              type: repo
              provider: github
            - name: some-library
              url: https://github.com/fake-org/some-library
              type: repo
              provider: github
             - name: outage-runbook
              url: https://fake-org.github.io/hello-world-outage-runbook
              type: runbook
            - name: hello-world dashboard
              url: https://app.datadoghq.com/dashboard/1234567890
              type: dashboard
            - name: API Docs
              url: https://fake-org.github.io/hello-world-api-docs
              type: doc
              provider: github
          
          # These integrations allow folks to be able to see who's on-call for the
          # service right from the Datadog Service Catalog.
          integrations: |
            opsgenie:
              service_url: https://fake-org.hello-world.opsgenie.com
              region: US
            pagerduty:
              service-url: https://fake-org.hello-world.pagerduty.com
          
          # This is the Product Owner, you should contact them if you have suggestions.
          contacts: |
            - name: Product Owner
              email: john.doe@fake-email-host.com
```

## Quick note on triggers

While there are a number of triggers you can use for this workflow, I recommend that you limit the triggers here to `workflow_dispatch` and `push` for your primary branch. Keep in mind that Datadog is going to always overwrite the Service Catalog definition whenever you run this action.

**WARNING:** If your workflow triggers trigger this Action when it's not needed, you may not only waste minutes in GitHub Actions, but you may experience rate-limiting by Datadog. If you experience rate-limiting, you may wish to restrict your triggers to only `workflow_dispatch` and `push` for your primary branch.

**ANOTHER WARNING:** Keep in mind that this is pushing your data up to Datadog. Please only use this Action when it's time to tell Datadog. If you're using this Action to test your configuration, you probably want to use a different Action for your live services, each with different triggers. If you don't do this, you may end up publishing service definitions which conflict with one another.

## Organizational Controls

One of the challenges of running a large set of services is keeping track of what belongs to who, and enforcing all of the rules associated with that. With this GitHub Action you can use your organization's `.github` repository to configure controls that this Action will enforce for you. Combine that with branch rules, and you can prevent merges which would break the rules.

### The organization rules YAML file

The place where you will configure your organization's rules is `.github/service-catalog-rules.yml` in your organization's `.github` repository. This file will be a YAML file which contains a list of rules. The syntax of this file is simple YAML, and the rules are simple as well.

For schema versioning, backwards compatibility will be maintained. If you would like to make schema version a constraint, there is a field for that in the Org Rules File.

Here's an example:

```yaml
---

org: arcxp

rules:
  # This should require all service catalog definitions to
  # contain an `isprod` tag.
  - name: Simple Requirements
    selection: all
    requirements:
      tags:
      - isprod: ANY

  # Everything that runs in production must have a runbook
  - name: Prod needs a runbook
    selection:
      tags:
        isprod: "true"
    requirements:
      links:
        type: "runbook"
```

It should be noted that _all_ of the key-value pairs for rules and selection criteria in an Org Rules File are case-insensitive for the values. All values will be converted to locale-sensitive lowercase before being evaluated. Keys are still case-sensitive though.

For tags, all things are lower-case.

#### The `org` key

This is the key of your org. There are two reasons why we have this key:

- It helps to have a key in here to remember which org the Org Rules File applies to.
- It's a sanity check to make sure that you're not accidentally running this Action against the wrong org. More of a misunderstanding mitigation device than anything else. If the `org` value doesn't match the org that the Action is running in, the Action will fail.

#### The `rules` fields

A quick note on versioning and backwards-compatibility: If a field is backwards-compatible, it will be marked as such in the table below. Not all fields are backwards-compatible, and if they are not then they will be skipped if the schema version is mismatched. We are intentionally using the same version numbers here that we use in the Service Catalog schema, this way there is less confusion. If you would like to make schema version a constraint, there is a field for that in the Org Rules File.

The Org Rules File is pretty light-weight, here's a breakdown of the fields:

| Field | Description | Required? | Default Value | Versions Supported |
| --- | --- | --- | --- | --- |
| `name` | The name of the rule. This is just for your own reference, it's not used by the Action. | `false` | `undefined` | all |
| `selection` | The selection criteria for the rule. This is a list of criteria which will be used to select the services which the rule applies to. The word `all` for the value of this field indicates that it is applicable to all definitions for the whole org. This field must be a list, except for the case of `all`. | `true` | No default | all |
| `selection[].schema-version` | The version of the schema which this rule applies to. This is a string which is used to determine which version of the schema to use. If this field is not present then the version will not be considered. Note that fields which are version-specific will cause an error if there is a mismatch, so you may wish to consider having versioned rules in those instances. The value of this field should match one of the supported versions above. | `false` | `undefined` | all |
| `selection[].tags` | These are the tags which you can use as selection criteria for this rule. These key-value pairs allow the Metadata Provider to choose which rules will apply. See examples below. | `false` | `{}` | all |
| `selection[].service-name` | This is the name of the service which you can use as selection criteria for this rule. | `false` | `undefined` | all |
| `selection[].application` | This is the name of the application which you can use as selection criteria for this rule. | `false` | `undefined` | `v2.1` |
| `selection[].tier` | This is the name of the tier which you can use as selection criteria for this rule. | `false` | `undefined` | `v2.1` |
| `selection[].lifecycle` | This is the name of the lifecycle which you can use as selection criteria for this rule. | `false` | `undefined` | `v2.1` |
| `selection[].team` | This is the name of the team which you can use as selection criteria for this rule. | `false` | `undefined` | all |
| `requirements` | These are the requirements which must be met for the rule to pass. More details for this field are below in "On Requirements." | `true` | No default | all |
| `requirements[].schema-version` | This is the version that the schema is constrained to. If this field is not present, this field is not constrained.  The value of this field should match one of the supported versions above. | `false` | `undefined` | all |
| `requirements[].application` | This is the name of the application which you can use as a requirement for this rule. | `false` | `undefined` | `v2.1` |
| `requirements[].description` | This is a description of the service which you can use as a requirement for this rule. | `false` | `undefined` | `v2.1` |
| `requirements[].tier` | This is the name of the tier which you can use as a requirement for this rule. | `false` | `undefined` | `v2.1` |
| `requirements[].lifecycle` | This is the name of the lifecycle which you can use as a requirement for this rule. | `false` | `undefined` | `v2.1` |
| `requirements[].tags` | These are the tags which you can require for this rule. | `false` | `undefined` | all |
| `requirements[].tags.<tag-name>` | These are the tag values which you can require for this rule. If you only wish to validate the presence of the tag, use the value `ANY` to indicate that any value is valid. | `false` | `undefined` | all |
| `requirements[].tags.<tag-name>.[]` | You may supply a list of acceptable values as a sequence. Keep in mind that outside of special values (such as `ANY`), all value checks are forced to locale-sensitive lower case. | `false` | `undefined` | all |
| `requirements[].links` | This structure allows you to have requirements surrounding the `links` section. | `false` | `undefined` | all |
| `requirements[].links.count` | Require at least this many `links` entries. If you require at least 1 link, you'd put a value here. | `false` | `undefined` | all |
| `requirements[].links.type` | Require at least one of the `links` entry to have a specific type. If you need more than one, please use two rules, one for each type. | `false` | `undefined` | all |
| `requirements[].links.provider` | Require at least one of the `links` entry to have a specific provider. If you need more than one, please use two rules, one for each provider. **PLEASE NOTE**: This is check is case-sensitive, and this property is version-specific. | `false` | `undefined` | `v2.1` |
| `requirements[].docs` | This structure allows you to have requirements surrounding the `docs` section. | `false` | `undefined` | `v2` |
| `requirements[].docs.provider` | Require at least one of the `docs` entry to have a specific provider. If you need more than one, please use two rules, one for each provider. **PLEASE NOTE**: This is check is case-sensitive. | `false` | `undefined` | `v2` |
| `requirements[].docs.count` | Require at least this many `docs` entries. If you require at least 1 doc, you'd put a value here. | `false` | `undefined` | `v2` |
| `requirements[].contacts` | This structure allows you to have requirements surrounding the `contacts` section. | `false` | `undefined` | all |
| `requirements[].contacts.count` | Require at least this many `contacts` entries. If you require at least 1 link, you'd put a value here. | `false` | `undefined` | all |
| `requirements[].contacts.type` | Require at least one of the `contacts` entry to have a specific type. If you need more than one, please use two rules, one for each type. | `false` | `undefined` | all |
| `requirements[].repos` | This structure allows you to have requirements surrounding the `repos` section. | `false` | `undefined` | `v2` |
| `requirements[].repos.count` | Require at least this many `repos` entries. If you require at least 1 repo, you'd put a value here. | `false` | `undefined` | `v2` |
| `requirements[].integrations` | This structure allows you to have requirements surrounding the `integrations` section. | `false` | `undefined` | all |
| `requirements[].integrations[(opsgenie|pagerduty)]` | With this requirement you can require either an OpsGenie or a PagerDuty integration. | `false` | `[]` | all |

##### On Selection

The `selection` structure allows the Metadata Provider to choose which rules will apply to which services. The `selection` field is a list of criteria which will be used to select the services which the rule applies to. The word `all` for the value of this field indicates that it is applicable to all definitions for the whole org. This field must be a list, except for the case of `all`.

You can select on a small handful of fields on the greater service definition. These fields are:

- Tags
- Service Name
- Team Name

Wildcards are _not_ supported, so all values must be exact matches. Wildcards may be supported in the future.

##### On Requirements

The `requirements` section of the Org Rules file is where you will define the requirements which must be met for the rule to pass. The requirements are a list of requirements, and each requirement is a list of fields which must be present in the service definition.



The syntax for these requirements is as follows:

```yaml
---

org: "my-org"

rules:
  - name: "This is a test."
    selection:
      tags:
        isprod: "true"
    requirements:
      tags:
        - data-sensitivity:
          - critical
          - high
          - medium
          - low
          - public
        - isprod: ANY
      links:
        count: 1
        type: "runbook"
      docs:
        count: 1
      contacts:
        type: "email"
        count: 2
      repos:
        count: 1
      integrations:
        - pagerduty
```

This is a maximal set of requirements for `v2`, but here's what it means:

- The rule applies only to services which have the `isprod` tag, and the value of that tag is `true`.
- The service is required to have a tag named `data-sensitivity`, and the value of that tag must be one of `critical`, `high`, `medium`, `low`, or `public`.
- The rule requires that the service have at least one `links` entry with the type `runbook`.
- The rule requires that the service have at least one `docs`.
- The rule requires that the service have at least one `contacts` entry with the type `email`.
- The rule requires that the service have at least one `repos`.
- The rule requires that the service have at least one `integrations` entry called `pagerduty`.

It's encouraged to be judicious in how these are required. Restrictions are inherently, well, restrictive. If you're not careful, you can end up with a situation where you're not able to add new services to your org because they don't meet the requirements of a rule. It's a good idea to start with a minimal set of requirements, and then add more as you go.

### Working with versions

Because of versioning, the above schema will break with schema `v2.1`. Let's take a look at what this would look like if we wanted the same rules to work across all versions of the schema:

```yaml
---

org: "my-org"

rules:
  - name: "This is a test. (v2)"
    selection:
      schema-version: v2
      tags:
        isprod: "true"
    requirements:
      tags:
        - data-sensitivity:
          - critical
          - high
          - medium
          - low
          - public
        - isprod: ANY
      links:
        count: 1
        type: "runbook"
      docs:
        count: 1
      contacts:
        type: "email"
        count: 2
      repos:
        count: 1
      integrations:
        - pagerduty

  - name: "This is a test. (v2.1)"
    selection:
      schema-version: v2.1
      tags:
        isprod: "true"
    requirements:
      tags:
        - data-sensitivity:
          - critical
          - high
          - medium
          - low
          - public
        - isprod: ANY
      links:
        count: 3
        type:
          - "runbook"
          - "repo"
          - "doc"
      contacts:
        type: "email"
        count: 2
      integrations:
        - pagerduty
```

Since the `repos` and `docs` fields were rolled up under `links` in `v2.1`, this second rule now requires three links, at least one of type `runbook`, one `doc`, and one `repo`. The first rule still shows the older schema version, and works just the way it used to in `v2`.

## Weird stuff

- Datadog will _always_ force your tag names and values to lowercase. The use of lower-case characters in all tags is encouraged, in order to avoid inconsistencies between your definitions and Datadog's.
- Datadog will replace any whitespace in your tag values with a `-`. please keep that in mind, too.
- For both of the above reasons, I encourage a more picky use of quotation marks in your YAML, just to avoid any potential parser misunderstandings.

## Troubleshooting

| Error | Common Causes | Potential Solutions |
| --- | --- | --- |
| `Error: The Datadog API key is required.` | You didn't set the `datadog-key` input. | Set the `datadog-key` input. |
| `Error: The Datadog application key is required.` | You didn't set the `datadog-app-key` input. | Set the `datadog-app-key` input. |
| `Error: The Datadog hostname is required.` | You didn't set the `datadog-hostname` input. | Set the `datadog-hostname` input. |
| `Error: The service name is required.` | You didn't set the `service-name` input. | Set the `service-name` input. |
| `Error: The team name is required.` | You didn't set the `team` input. | Set the `team` input. |
| `Error: The team email is required.` | You didn't set the `email` input. | Set the `email` input. |
| Datadog gives a 403 when you try to push the service definition. | You didn't set the `datadog-key` or `datadog-app-key` inputs correctly, or you've got the wrong `datadog-hostname` value for your account. | Check the `datadog-hostname` first, that's easier to check since GitHub Actions secrets will not show the value to you. After you've verified that, if you still have a 403, verify that you set the `datadog-key` and `datadog-app-key` inputs correctly. If that continues to cause trouble, you may want to visit the [API documentation for the API that this Action uses](https://docs.datadoghq.com/api/latest/service-definition/?code-lang=curl#create-or-update-service-definition) and make sure that it's functional with the host name and credentials you've provided. |

## Design Decisions

As with any other application, there are a number of decisions that were made in the design of this Action. Here are some of the more important ones:

- For the Org Rules File, only the `.github` repository in the same GitHub org as the repository being processed will be used. This is to prevent a naughty user from trying to play around too much with the repositories and finding a toehold to do something malicious.
- If there is no Org Rules file, the action will still run, but it will not enforce any rules.
- If there _is_ a file, but it does not parse, the action will fail. This is to prevent a user from accidentally breaking the Org Rules File, and then not knowing why the action is failing, but also to make sure that if someone intended for rules to be followed, we respect that.
- If there is an Org Rules File, but it does not contain any rules, the action will still run, but it will not enforce any rules (because there aren't any).

## Trust, Privacy, and Security

While this Custom Action does handle sensitive information (mostly your Datadog and GitHub secrets), this information is only used for the purpose of interacting with the Datadog and GitHub APIs. This information is not stored anywhere, and is not used for any other purpose. This Action is open source, and you are encouraged to review the code.

All security reports and dependency vulnerabilities via GitHub's security features are reviewed and addressed as quickly as possible. If you have more questions, please review the `SECURITY.md` file in this repository.

In no way does this Action phone home or otherwise send any information to any service other than GitHub or Datadog.

## References

- [Datadog Service Definition API](https://docs.datadoghq.com/tracing/service_catalog/service_definition_api/)
- [JSON Schema for the Datadog Service Definition](https://github.com/Datadog/schema/blob/main/service-catalog/v2/schema.json)
- [Working example for the Org Rules File](https://github.com/arcxp/.github/blob/main/service-catalog-rules.yml)

## Authors

Unless otherwise specified, none of the authors of this project are affiliated with Datadog, Inc.

- [Mike Stemle](https://github.com/manchicken)

## Thanks

- Thanks to The Washington Post and Arc XP for letting me work on this really cool project.
- GitHub Copilot was exceptionally helpful in the writing of tests and documentation for this program.
- Datadog personnel have been instrumental in helping me understand the API and the schema, and have been very helpful in getting this Action to a place where it's ready for public consumption.
- My own leadership, especially Jason Taylor and Jason Bartz, have been highly supportive of this project, and have provided invaluable peer review.
- Anybody who has contributed to this project, either through code, documentation, creating issues, or testing.

Thanks everybody!
