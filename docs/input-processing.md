# Input Processing

In this doc, I'm gonna try to outline how the inputs come to be a JSON document that we post to the Datadog APIs.

1. First we get the inputs from `core.getInput()` for all of the supported Actions fields.
2. From those inputs, the first one we need is the `schema-version`, as this input tells us which parser to use.
