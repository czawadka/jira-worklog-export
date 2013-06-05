///<reference path="http_client.ts" />
require('http_client');
import http = module("http");

export class Jira extends HttpClient {
    opts: HttpClientOptions;

    constructor(opts: HttpClientOptions) {
        super(opts);
    }

    search(jql:string, startAt?: number, maxResults?: number, fields?: string, expand?: string): http.ClientRequest {
        return this.request("GET", "find", {
            "jql": jql,
            "startAt": startAt,
            "maxResults": maxResults,
            "fields": fields,
            "expand": expand
        });
    }
}
