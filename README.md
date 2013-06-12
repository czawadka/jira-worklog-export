# Start
- Install node.js
- Change directory to project folder
- run `npm install`
- prepare config.js based on config-example.js
- run `grunt run`

stdout should be filled with csv fields:
project(from config),issueKey,worklog.author,worklog.started,worklog.timeSpentSeconds

# FIXME
## Jira.whereWorklogBetween()

Field 'updated' shows only *last* modification date, we need all modification dates.
We should use rather workLoggedBetween() from JQL Tricks (license required) or something similar.
As workaround we are fetching all issues no matter if they were modified in given period of time.
