///<reference path="jira.ts" />
require('jira');

var clientOptions:HttpClientOptions = {
    baseUrl:'https://jira.ydp.eu/',
    login:'bds',
    password: 'password'
};
var jira:Jira = new Jira(clientOptions);

var req = jira.search("project = PSS AND resolution = Unresolved");
