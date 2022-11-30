# DataDog Service Catalog Metadata Provider

Welcome to the Datadog Service Catalog Metadata Provider!

## Supported Metadata Fields

Here's the list of supported metadata fields:

| Field | Description | Required | Default |
| --- | --- | --- | --- |
| `service-name` | The name of the service. | Yes | |
| `team` | The team that owns the service. | Yes | |
| `email` | The email address of the team that owns the service. | Yes | |
| `slack-support-channel` | The Slack channel where folks can get support for the service. | Yes | |
| `contacts` | The list of contacts for the service. Each of these contacts is an object. Keep in mind that `email` and `slack-support-channel` are already included as contacts. This list should be in addition to that. | No | |
| `contacts[].name` | The name of the contact. | Yes | |
| `contacts[].type` | The type of the contact. Acceptable values are: `email`, `slack`, and `microsoft-teams` | Yes | |
| `contacts[].value` | The value of the contact. For example, if the type is `email`, this would be the email address. | Yes | |
| `repos` | The list of GitHub repositories that are part of the service. You must supply at least one repository. The repositories are supplied as objects. | Yes | |
| `repos[].name` | The name of the repository. | Yes | |
| `repos[].url` | The URL of the repository. | Yes | |
| `repos[].provider` | The provider of the repository. Acceptable values are: `Github`. | No | `Github` |
| `tags` | The list of tags that are associated with the service. This should be a list of key-value pairs separated by colons. | No | |
| `links` | A list of links associated with the service. These links are objects with a variety of properties. | No | |
| `links[].name` | The name of the link. | Yes | |
| `links[].url` | The URL of the link. | Yes | |
| `links[].type` | The type for the link. Acceptable values are: `doc`, `wiki`, `runbook`, `url`, `repo`, `dashboard`, `oncall`, `code`, and `link` | Yes | |
| `docs` | A list of documentation links associated with the service. These links are objects with a variety of properties. | No | |
| `docs[].name` | The name of the document. | Yes | |
| `docs[].url` | The URL of the document. | Yes | |
| `docs[].provider` | The provider for where the documentation lives. Acceptable values are: `Confluence`, `GoogleDocs`, `Github`, `Jira`, `OneNote`, `SharePoint`, and `Dropbox` | No | |

## References

- [DataDog Service Definition API](https://docs.datadoghq.com/tracing/service_catalog/service_definition_api/)
- [JSON Schema for the DataDog Service Definition](https://github.com/DataDog/schema/blob/main/service-catalog/v2/schema.json)
