///<reference path="http_client.ts" />

export class JiraRestClient {
    client: HttpClient;

    constructor(opts: HttpClientOptions) {
        this.client = new HttpClient(opts);
    }

    search(jql:string, startAt?: number, maxResults?: number, fields?: string, expand?: string): any {
        var requestOpts: HttpRequestOptions = {
            method: "GET",
            uri: "search"
            ,
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
