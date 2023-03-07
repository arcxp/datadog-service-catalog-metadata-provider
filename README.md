# Datadog Service Catalog Metadata Provider

[![DataDog Service Catalog](https://github.com/arcxp/datadog-service-catalog-metadata-provider/actions/workflows/automated-testing.yml/badge.svg)](https://github.com/arcxp/datadog-service-catalog-metadata-provider/actions/workflows/automated-testing.yml)

Welcome to the Datadog Service Catalog Metadata Provider!

The Datadog Service Catalog is a marvelous new way to track which services are in production. Your telemetry data is presented in the Service Catalog in a way where you can see the health of your services, and the health of the services that depend on them, all in one place. Most importantly, the Service Catalog helps you support your services in any environment.

With the Service Catalog registration API, you can supply the Service Catalog with all of the support information you might want:

- The name of the service
- The team which supports and maintains the service
- The email address of the team
- The URL of the service's documentation, which has a special subtype for runbooks (we _all_ need more runbooks)
- The URL of the service's source code
- The URL of the service's dashboards and performance metrics
- Integration information for important services like Slack, MS Teams, PagerDuty, and Opsgenie

You can use this to register your services with the Service Catalog, and then use the Service Catalog to find the information you need to support your services.

Supporting services can be tricky, and the Datadog Service Catalog can make it easier for team members who aren't familiar with your service to support it. The Service Catalog can also help you find the information you need to support your services, and help you find the right people to support your services.

## Wait, but why?

Datadog already has methods for supplying this information. Why do we need another one? The answer is pretty simple: constraints.

Datadog has a super useful GitHub integration which allows you to register your service with a simple JSON file in your repository, after you install their GitHub plugin and give it read access to your repository. This is great, but if you're using GitOps for deployments and such, sometimes more integrations and webhooks can be concerning.

In order to get the benefits of the Service Catalog without having to open GitHub up to those integrations, this GitHub Action will allow you to register your services with the Service Catalog using a GitHub Action, which then allows you to have full control and visibility over this process. It also gives you full control over when this information is sent to Datadog.

Another reason to use this Action is that it permits your organization to establish controls on what must be present in your service metadata. For example, you might require that all services running in production have a runbook, or that all services have a specific tag which says where they're run. This Action gives you a way to add some controls without having to chase down every service owner and ask them to add the information. For more information on this functionality, see the section on [Organization Controls](#organization-controls) below.

## Supported Metadata Fields

The registration API's links are below, and it takes input per its own JSON schema (also below), but this Action seeks to make things simpler and easier still! Here's a simplified list of the metadata fields that are supported by the Datadog Service Catalog Metadata Provider:

| Field | Description | Required | Default |
| --- | --- | --- | --- |
| `github-token` | This action will use the built-in `GITHUB_TOKEN` for all GitHub access. If you would prefer to use a different GitHub token for the action, please specify it here. | No | `GITHUB_TOKEN` |
| `org-rules-file` | If you would prefer to use a different name for your Org Rules File, you can specify it here. This parameter only supports a different file name within the `.github` repository, it will not support an alternate repository. Please make sure that your Org Rules File is accessible to whichever token you use (either `GITHUB_TOKEN` or the `github-token` input value). | No | `.github/service-catalog-rules.yml` |
| `datadog-hostname` | The Datadog host to use for the integration, which varies by Datadog customer. [See here for more details:](https://docs.datadoghq.com/getting_started/site/) <https://docs.datadoghq.com/getting_started/site/>. Please make sure that you are sure about this value. You'll get an error if it's incorrect. | Yes | `https://api.datadoghq.com` |
| `datadog-key` | The Datadog API key to use for the integration. _Please_ use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to secure your secrets. | Yes | |
| `datadog-app-key` | The Datadog Application key to use for the integration. _Please_ use [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to secure your secrets. | Yes | |
| `service-name` | The name of the service. This must be unique across all services. | Yes | |
| `team` | The team that owns the service. | Yes | |
| `email` | The email address of the team that owns the service. | Yes | |
| `slack-support-channel` | The Slack channel where folks can get support for the service. **This must be a Slack URL.** | No | |
| `repo` | The GitHub repository where the service is hosted. This is a convenience input for when you only have one repository for the service. You must either have this value, or you must have values specified in the `repos` object. | No | |

Here's a larger set of metadata fields that are supported by the Datadog Service Catalog Metadata Provider:

| Field | Description | Required | Default |
| --- | --- | --- | --- |
| `contacts` | The list of contacts for the service. Each of these contacts is an object. Keep in mind that `email` and `slack-support-channel` are already included as contacts. This list should be in addition to that. These values are supplied as objects, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `[]` |
| `contacts[].name` | The name of the contact. | Yes | |
| `contacts[].type` | The type of the contact. Acceptable values are: `email`, `slack`, and `microsoft-teams` | Yes | |
| `contacts[].value` | The value of the contact. For example, if the type is `email`, this would be the email address. | Yes | |
| `repos` | The list of GitHub repositories that are part of the service. You must supply at least one repository. The repositories are supplied as objects, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | Yes | `[]` |
| `repos[].name` | The name of the repository. | Yes | |
| `repos[].url` | The URL of the repository. | Yes | |
| `repos[].provider` | The provider of the repository. Acceptable values are: `Github`. | No | |
| `tags` | The list of tags that are associated with the service. This should be a list of key-value pairs separated by colons. | No | |
| `links` | A list of links associated with the service. These links are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `[]` |
| `links[].name` | The name of the link. | Yes | |
| `links[].url` | The URL of the link. | Yes | |
| `links[].type` | The type for the link. Acceptable values are: `doc`, `wiki`, `runbook`, `url`, `repo`, `dashboard`, `oncall`, `code`, and `link` | Yes | |
| `docs` | A list of documentation links associated with the service. These links are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `[]` |
| `docs[].name` | The name of the document. | Yes | |
| `docs[].url` | The URL of the document. | Yes | |
| `docs[].provider` | The provider for where the documentation lives. Acceptable values are: `Confluence`, `GoogleDocs`, `Github`, `Jira`, `OneNote`, `SharePoint`, and `Dropbox` | No | |
| `integrations` | Integrations associated with the service. These integrations are objects with a variety of properties, but due to the limitations of GitHub Actions, please supply these object properties as a multi-line string. | No | `{}` |
| `integrations.opsgenie` | The OpsGenie details for the service. | No | |
| `integrations.opsgenie.service_url` | The service URL for the OpsGenie integration. A team URL will work, but if you want on-call metadata then make sure that this URL is to a service, not a team. | Yes | |
| `integrations.opsgenie.region` | The region for the OpsGenie integration. Acceptable values are `US` and `EU`. | No | |
| `integrations.pagerduty` | The PagerDuty URL for the service. | No | |

## Example

### Simplest possible example

Here I have a simple example of a service that has a single repository, and the least amount of metadata possible.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: arcxp/datadog-service-catalog-metadata-provider@v1
        with:
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APP_KEY }}
          service-name: my-service
          team: my-team
          email: my-team@my-organization-which-totally-exists.com
```

### Simpler service with more metadata

In this example, you can see that my team is called "Global Greetings," and I have a single repository for my service. I also have a single document, and a single link.

My slack support channel is listed by URL, and the email address is present. At the bottom you can also see the OpsGenie integration details.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: arcxp/datadog-service-catalog-metadata-provider@v1
        with:
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
```

### Example with multiple repositories

This example is the same as above, except that I have a multiple repositories involved.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: arcxp/datadog-service-catalog-metadata-provider@v1
        with:
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
```

### The whole enchilada

This is the maximal configuration you could use, in a complete workflow that you could copy-and-paste. It's a bit verbose, but it shows you all the options you have complete with "why."

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
      - uses: arcxp/datadog-service-catalog-metadata-provider@v1
        with:
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
```

## Quick note on triggers

While there are a number of triggers you can use for this workflow, I recommend that you limit the triggers here to `workflow_dispatch` and `push` for your primary branch. Keep in mind that Datadog is going to always overwrite the Service Catalog definition whenever you run this action.

## Organizational Controls

One of the challenges of running a large set of services is keeping track of what belongs to who, and enforcing all of the rules associated with that. With this GitHub Action you can use your organization's `.github` repository to configure controls that this Action will enforce for you. Combine that with branch rules, and you can prevent merges which would break the rules.

### The organization rules YAML file

The place where you will configure your organization's rules is `.github/service-catalog-rules.yml` in your organization's `.github` repository. This file will be a YAML file which contains a list of rules. The syntax of this file is simple YAML, and the rules are simple as well. Here's an example:

```yaml
---

org: arcxp

rules:
  # This should require all service catalog definitions to
  # contain an `isprod` tag.
  - name: Simple Requirements
    selection: all
    requirements:
      - tags:
        - isprod

  # Everything that runs in production must have a runbook
  - name: Prod needs a runbook
    selection:
      tags:
        isprod: "true"
    requirements:
      - links:
        - type: "runbook"
```

It should be noted that _all_ of the key-value pairs for rules and selection criteria in an Org Rules File are case-insensitive for the values. All values will be converted to locale-sensitive lowercase before being evaluated. Keys are still case-sensitive though.

For tags, all things are lower-case.

#### The `org` key

This is the key of your org. There are two reasons why we have this key:

- It helps to have a key in here to remember which org the Org Rules File applies to.
- It's a sanity check to make sure that you're not accidentally running this Action against the wrong org. More of a misunderstanding mitigation device than anything else. If the `org` value doesn't match the org that the Action is running in, the Action will fail.

#### The `rules` fields

The Org Rules File is pretty light-weight, here's a breakdown of the fields:

| Field | Description | Required? | Default Value |
| --- | --- | --- | --- |
| `name` | The name of the rule. This is just for your own reference, it's not used by the Action. | `false` | `undefined` |
| `selection` | The selection criteria for the rule. This is a list of criteria which will be used to select the services which the rule applies to. The word `all` for the value of this field indicates that it is applicable to all definitions for the whole org. This field must be a list, except for the case of `all`. | `true` | No default |
| `selection[].tags` | These are the tags which you can use as selection criteria for this rule. These key-value pairs allow the Metadata Provider to choose which rules will apply. | `false` | `{}` |
| `selection[].service-name` | This is the name of the service which you can use as selection criteria for this rule. | `false` | `undefined` |
| `selection[].team` | This is the name of the team which you can use as selection criteria for this rule. | `false` | `undefined` |
| `requirements` | These are the requirements which must be met for the rule to pass. More details for this field are below in "On Requirements." | `true` | No default |
| `requirements[].tags` | These are the tags which you can require for this rule. | `false` | `undefined` |
| `requirements[].tags.<tag-name>` | These are the tag values which you can require for this rule. If you only wish to validate the presence of the tag, use the value `ANY` to indicate that any value is valid. | `false` | `undefined` |
| `requirements[].tags.<tag-name>.[]` | You may supply a list of acceptable values as a sequence. Keep in mind that outside of special values (such as `ANY`), all value checks are forced to locale-sensitive lower case. | `false` | `undefined` |
| `requirements[].links` | This structure allows you to have requirements surrounding the `links` section. | `false` | `undefined` |
| `requirements[].links.count` | Require at least this many `links` entries. If you require at least 1 link, you'd put a value here. | `false` | `undefined` |
| `requirements[].links.type` | Require at least one of the `links` entry to have a specific type. If you need more than one, please use two rules, one for each type. | `false` | `undefined` |
| `requirements[].docs` | This structure allows you to have requirements surrounding the `docs` section. | `false` | `undefined` |
| `requirements[].docs.count` | Require at least this many `docs` entries. If you require at least 1 doc, you'd put a value here. | `false` | `undefined` |
| `requirements[].contacts` | This structure allows you to have requirements surrounding the `contacts` section. | `false` | `undefined` |
| `requirements[].contacts.count` | Require at least this many `contacts` entries. If you require at least 1 link, you'd put a value here. | `false` | `undefined` |
| `requirements[].contacts.type` | Require at least one of the `contacts` entry to have a specific type. If you need more than one, please use two rules, one for each type. | `false` | `undefined` |
| `requirements[].repos` | This structure allows you to have requirements surrounding the `repos` section. | `false` | `undefined` |
| `requirements[].repos.count` | Require at least this many `repos` entries. If you require at least 1 repo, you'd put a value here. | `false` | `undefined` |
| `requirements[].integrations` | This structure allows you to have requirements surrounding the `integrations` section. | `false` | `undefined` |
| `requirements[].integrations[(opsgenie|pagerduty)]` | With this requirement you can require either an OpsGenie or a PagerDuty integration. | `false` | `[]` |

##### On Selection

The `selection` structure allows the Metadata Provider to choose which rules will apply to which services. The `selection` field is a list of criteria which will be used to select the services which the rule applies to. The word `all` for the value of this field indicates that it is applicable to all definitions for the whole org. This field must be a list, except for the case of `all`.

You can select on a small handful of fields on the greater service definition. These fields are:

- Tags
- Service Name
- Team Name

Wildcards are _not_ supported, so all values must be exact matches. Wildcards may be supported in the future.

##### On Requirements

The `requirements` section of the Org Rules file is where you will define the requirements which must be met for the rule to pass. The requirements are a list of requirements, and each requirement is a list of fields which must be present in the service definition. The fields which you can require are:

- `tags`
  - You can require that a service have a specific tag, and you can further constrain that to a list of values.
- `links`
  - You can require that a service have a minimum count of links, and you can further constrain that to a type.
- `docs`
  - You can require that a service have a at least a certain number of docs.
- `contacts`
  - You can require that a service have a minimum count of contacts, and you can further constrain that to a type.
- `repos`
  - You can require that a service have a minimum count of repos.
- `integrations(.opsgenie|.pagerduty)`
  - You can require that a service have an integration for a specific provider. No further constraints are supported for integrations.

The syntax for these requirements is as follows:

```yaml
rules:
  - name: "This is a test."
    selection:
      - tags:
        - isprod: "true"
    requirements:
      - tags:
        - data-sensitivity:
          - critical
          - high
          - medium
          - low
          - public
        - isprod: ANY
      - links:
          type: "runbook"
      - docs:
          count: 1
      - contacts:
          type: "email"
          count: 2
      - repos:
          count: 1
      - integrations:
          - pagerduty
```

This is a maximal set of requirements, but here's what it means:

- The rule applies only to services which have the `isprod` tag, and the value of that tag is `true`.
- The service is required to have a tag named `data-sensitivity`, and the value of that tag must be one of `critical`, `high`, `medium`, `low`, or `public`.
- The rule requires that the service have at least one `links` entry with the type `runbook`.
- The rule requires that the service have at least one `docs` entry with the name `design` and the provider `confluence`.
- The rule requires that the service have at least one `contacts` entry with the name `oncall` and the type `email`.
- The rule requires that the service also have a second `contacts` entry with the type `slack`.
- The rule requires that the service have at least one `repos` entry with the name `primary`.
- The rule requires that the service have at least one `integrations` entry called `pagerduty`.

It's encouraged to be judicious in how these are required. Restrictions are inherently, well, restrictive. If you're not careful, you can end up with a situation where you're not able to add new services to your org because they don't meet the requirements of a rule. It's a good idea to start with a minimal set of requirements, and then add more as you go.

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

## References

- [Datadog Service Definition API](https://docs.datadoghq.com/tracing/service_catalog/service_definition_api/)
- [JSON Schema for the Datadog Service Definition](https://github.com/Datadog/schema/blob/main/service-catalog/v2/schema.json)
- [Working example for the Org Rules File](https://github.com/arcxp/.github/blob/main/service-catalog-rules.yml)

## Thanks

- GitHub Copilot was exceptionally helpful in the writing of tests and documentation for this program.
- Datadog personnel have been instrumental in helping me understand the API and the schema, and have been very helpful in getting this Action to a place where it's ready for public consumption.
- My own leadership, especially Jason Taylor and Jason Bartz, have been highly supportive of this project, and have provided invaluable peer review.
- Anybody who has contributed to this project, either through code, documentation, creating issues, or testing.

Thanks everybody!
