# Datadog Service Catalog v3 Examples

The v3 schema is a big change from how prior schema have been arranged.
This document is intended to capture some examples for how this could work
inside of the Custom Action.

## A simple PHP website with a MySQL Database

Let's consider a simple website powered by PHP using MySQL as its only
data store. The site has a single PagerDuty site set up, and its code
is version-controlled in GitHub. There is a single runbook for restarting
the server, which is also stored in GitHub as a Wiki page.

**Assets**

- GitHub repository for the deployment and IaC code
- PHP Web Application
- MySQL database
- PagerDuty integration
- The single runbook

```yaml
---
name: My PHP Website
on:
  push:
  workflow_dispatch:

jobs:
  automated-testing:
    runs-on: ubuntu-latest
    steps:
      - name: Update Datadog Service Catalog Entry
        uses: ./
        with:
          # No overrides
          schema-version: v3
          github-token: ${{ secrets.GITHUB_TOKEN }}
          datadog-hostname: api.us5.datadoghq.com
          datadog-key: ${{ secrets.DATADOG_API_KEY }}
          datadog-app-key: ${{ secrets.DATADOG_APPLICATION_KEY }}
          system: My PHP Application
          # </No Overrides>
          team: Team Sonic
          email: team.sonic@fakehostnamehere.com
          slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000000'
          repo: https://github.com/fake+org/app-deployment-repo
          contacts: |
            - name: Testy McTester
              type: email
              contact: testy@mctester.com
          tags: |
            - internet_accessible:true
          components: |
            - name: PHP Web App
              kind: application
              repo: https://github.com/fake+org/php-web-app
              languages: |
                - php
                - sql
                - javascript
              tags: |
                - internet_accessible:true
            - name: MySQL Database
              kind: datastore
              repo: https://github.com/fake+org/database-ddl
              slack-support-channel: 'https://fakeorg.slack.com/archives/A0000000008'
              languages: sql
          links: |
            - name: Some Runbook
              url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/runbook
              type: runbook
              provider: Confluence
            - name: Some Docs
              url: https://thisisanentirelyfakeurl.seriouslythisisafakehostname.com/docs
              type: doc
              provider: Confluence
          integrations: |
            opsgenie:
              service-url: https://yourorghere.app.opsgenie.com/service/00000000-0000-0000-0000-000000000000
              region: US
```

This schema produces and links together a number of different entities:

- One application, with all of the metadata
- One service, which is linked to the application and its metadata
- One MySQL database, which is linked to the application and its metadata
