///<reference path="jira.ts" />
import jira = module('jira');

var clientOptions = {
    baseUrl:'https://jira.ydp.eu/',
    login:'bds',
    password: 'password'
};
var jiraClient: jira.JiraRestClient = new jira.JiraRestClient(clientOptions);

var dateFrom: Date = new Date(2013,4,1),
    dateTo: Date = new Date(2013,5,1);

jiraClient
    .listWorklogs(dateFrom, dateTo)
    .then(function(issues: jira.Issue[]) {

        issues.forEach(function(issue: jira.Issue) {
            issue.fields.worklog.worklogs.forEach(function(worklog: jira.Worklog){
                console.log(issue.key+","+worklog.author.name+","+worklog.started+","+worklog.timeSpentSeconds);
            });
        });

    })
    .done();
