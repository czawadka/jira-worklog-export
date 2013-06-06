///<reference path="jira.ts" />
import jira = module('jira');

var clientOptions = {
    baseUrl:'https://jira.ydp.eu/',
    login:'bds',
    password: 'password'
};
var jiraClient: jira.JiraRestClient = new jira.JiraRestClient(clientOptions);

jiraClient.search("project = PSS AND resolution = Unresolved", 0, 3, "*all")
    .then(function(searchResult) {
        console.log("success");
    }, null, function(event) {
        console.log("notify: "+event.event);
    })
    .done();
