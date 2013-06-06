///<reference path="../../lib/ts/node.d.ts" />
///<reference path="http_client.ts" />
import http_client = module('http_client');
///<reference path="misc.ts" />
import misc = module('misc');

export class JiraRestClient {
    client: http_client.HttpClient;

    constructor(opts: http_client.HttpClientOptions) {
        opts = this.appendApiPathToBaseUrl(opts);

        this.client = new http_client.HttpClient(opts);
    }

    private appendApiPathToBaseUrl(opts: http_client.HttpClientOptions): http_client.HttpClientOptions {
        opts = misc.extend(opts);
        if (opts.baseUrl[opts.baseUrl.length-1]!='/') {
            opts.baseUrl += '/';
        }
        opts.baseUrl += 'rest/api/latest/';

        return opts;
    }

    search(jql:string, startAt?: number, maxResults?: number, fields?: string, expand?: string): any {
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
}
