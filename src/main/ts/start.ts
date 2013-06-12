///<reference path="../../lib/ts/node.d.ts" />
import path = module('path');
///<reference path="http_client.ts" />
import http_client = module('http_client');
///<reference path="jira.ts" />
import jira = module('jira');

interface WorklogConfig {
    dateFrom?: Date;
    dateTo?: Date;
    projects: any; // key:jql
}

interface Config {
    jira: http_client.HttpClientOptions;
    worklog: WorklogConfig;
}

var configFile = path.resolve(process.argv[2] || './config');
console.log('loading ' + configFile);
var config: Config = require(configFile);

var jiraClient: jira.JiraRestClient = new jira.JiraRestClient(config.jira);

for(var projectKey in config.worklog.projects) {
    var jql = config.worklog.projects[projectKey];

    jiraClient
        .listWorklogs(jql, config.worklog.dateFrom, config.worklog.dateTo)
        .then(function(issues: jira.Issue[]) {

            issues.forEach(function(issue: jira.Issue) {
                issue.fields.worklog.worklogs.forEach(function(worklog: jira.Worklog){
                    console.log(projectKey + "," + issue.key + "," + worklog.author.name + ","
                        + worklog.started + "," + worklog.timeSpentSeconds);
                });
            });

        })
        .done();

};

