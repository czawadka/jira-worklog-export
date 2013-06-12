///<reference path="../../lib/ts/node.d.ts" />
import http = module('http');
import util = module('util');
///<reference path="http_client.ts" />
import http_client = module('http_client');
///<reference path="misc.ts" />
import misc = module('misc');

export interface Issue {
    key: string;
    fields: Fields;
}

export interface Fields {
    summary?: string;
    worklog?: Worklogs;
}

export interface Worklogs {
    total: number;
    worklogs: Worklog[];
}

export interface Worklog {
    author: User;
    started: string;
    timeSpentSeconds: number;
}

export interface User {
    name: string;
    emailAddress: string;
    displayName: string;
}

export interface SearchResults {
    startAt: number;
    maxResults: number;
    total: number;
    issues: Issue[];
}

export function padString(s: string, width?: number, widthChar?: string) {
    if (width && s.length < width) {
        widthChar = widthChar || ' ';
        for(var i = width - s.length; i>0; i--) {
            s = widthChar + s;
        }
    }
    return s;
}
export function fmtNumber(n: number, width?: number, widthChar?: string) {
    var s: string = n.toString(10);
    return padString(s, width, widthChar || '0');
}

export function jqlDate(date: Date): string {
    return fmtNumber(date.getFullYear(), 4)
        + "-"
        + fmtNumber(date.getMonth()+1, 2)
        + "-"
        + fmtNumber(date.getDate(), 2)
        + " "
        + fmtNumber(date.getHours(), 2)
        + ":"
        + fmtNumber(date.getMinutes(), 2)
        ;
}

export class JiraRestClient {
    client: http_client.HttpClient;

    constructor(opts: http_client.HttpClientOptions) {
        opts = JiraRestClient.appendApiPathToBaseUrl(opts);
        this.client = new http_client.HttpClient(opts);
    }

    private static appendApiPathToBaseUrl(opts: http_client.HttpClientOptions): http_client.HttpClientOptions {
        opts = misc.extend(opts);
        if (opts.baseUrl[opts.baseUrl.length-1]!='/') {
            opts.baseUrl += '/';
        }
        opts.baseUrl += 'rest/api/latest/';

        return opts;
    }

    search(jql:string, startAt?: number, maxResults?: number, fields?: string, expand?: string): Qpromise/* SearchResults */ {
        var requestOpts: http_client.HttpRequestOptions = {
            method: "GET",
            uri: "search",
            params: {
                jql: jql,
                startAt: startAt,
                maxResults: maxResults,
                fields: fields,
                expand: expand
            }
        };

        var responsePromise: Qpromise = this.client.request(requestOpts);

        return responsePromise.then(
            function(data) {
                return JSON.parse(data);
            }
        );
    }

    whereWorklogBetween(jql: string, dateFrom: Date, dateTo?: Date): string {
        // FIXME: Field 'updated' shows only *last* modification date, we need all modification dates.
        // We should use rather workLoggedBetween() from JQL Tricks (license required) or something similar.
        // As workaround we are fetching all issues no matter if they were modified in given period of time.
        // should be something like: return jql + " AND workLoggedBetween('"+ jqlDate(dateFrom) + "', '" + jqlDate(dateTo) + "')";
        // but is as follows... :(
        return jql;
    }

    listWorklogs(jql: string, dateFrom: Date, dateTo?: Date): Qpromise /* filteredIssues: Issue[] */ {

        dateTo = dateTo || new Date();

        var self: JiraRestClient = this,
            isoDateFrom: string = dateFrom.toISOString(),
            isoDateTo: string = dateTo.toISOString();

        jql = this.whereWorklogBetween(jql, dateFrom, dateTo);
        console.error(jql);

        function filterIssues(issues: Issue[]): Issue[] {
            return issues.filter(function(issue: Issue) {
                issue.fields.worklog.worklogs = issue.fields.worklog.worklogs.filter(function(worklog: Worklog){
                    return (worklog.started >= isoDateFrom && worklog.started <= isoDateTo);
                });
                return issue.fields.worklog.worklogs.length > 0;
            });
        }

        function processWorklogChunk(searchResults: SearchResults): any /* Qpromise || filteredIssues: Issue[] */ {
            console.error('Processing issues ' + (searchResults.startAt+1)
                + '-' + (searchResults.startAt + searchResults.issues.length)
                + '/' + searchResults.total);
            var filteredIssues: Issue[] = filterIssues(searchResults.issues);

            var nextStartAt: number = searchResults.startAt + searchResults.maxResults;
            if (nextStartAt < searchResults.total) {
                return nextWorklogChunk(nextStartAt, searchResults.maxResults)
                    .then(function(nextFilteredIssues) {
                        return filteredIssues.concat(nextFilteredIssues);
                    })
            } else {
                return filteredIssues;
            }
        }

        var initialBulkSize = 100,
            initialStartAt = 0;

        function nextWorklogChunk(startAt: number, bulkSize: number): Qpromise /* filteredIssues: Issue[] */ {
            console.error("Request issues "+(startAt+1)+"-"+(startAt+bulkSize));
            return self.search(jql, startAt, bulkSize, "summary,worklog,-attachment", "")
                .then(
                    processWorklogChunk,
                    function(response: http.ClientResponse) {
                        if (response.statusCode == 500) {
                            // assume Jira crashed due to some problem with particular issue
                            // try to find that issue and skip it
                            if (bulkSize == 1) {
                                console.error("FOUND culpring at "+(startAt+1)+". Skipping it.");
                                return nextWorklogChunk(startAt + 1, initialBulkSize);
                            } else {
                                console.error("Detected issue in "+(startAt+1)+"-"+(startAt+bulkSize)+". Narrowing the problem.");
                                var newBulkSize = Math.ceil(bulkSize/3);
                                return nextWorklogChunk(startAt, newBulkSize);
                            }
                        } else {
                            throw response;
                        }
                    });
        }

        return nextWorklogChunk(initialStartAt, initialBulkSize);

    }
}
