# Trying to recreate Jenkins in Node.js

Jenkins runs on JVM, and it comsumes a lot of memory!
There is a need of having automated pipelines in the environments where memory resources are scarce.

## Features
* Receive push events from GitHub Webhook
* Run 'pipeline.sh' located in the source code (like Jenkinsfile)
