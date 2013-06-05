///<reference path="../../lib/ts/node-0.8.d.ts" />
import url = module('url');
import http = module('http');
import https = module('https');
import qs = module('querystring');

export interface HttpClientOptions {
    baseUrl: string;
    login?: string;
    password?: string;
}

export class HttpClient {
    opts: HttpClientOptions;

    constructor(opts: HttpClientOptions) {
        this.opts = opts;
    }

    request(method:string, uri:string, params?:any): http.ClientRequest {
        var requestUrl = (url.parse(uri).protocol ? uri : this.opts.baseUrl + uri),
            body = false;

        params = this.removeUndefinedParams(params);
        method = (method || "GET").toUpperCase();

        if (params) {
            switch(method) {
                case 'POST':
                    body = qs.stringify(params);
                    break;
                case 'GET':
                    if (requestUrl.indexOf('?')==-1) {
                        requestUrl += '?';
                    }
                    requestUrl += qs.stringify(params);
                    break;
            }
        }

        var requestOptions: any = url.parse(requestUrl);
        requestOptions.method = method;
        if (this.opts.login) {
            requestOptions.auth = this.opts.login+':'+this.opts.password;
        }

        var request: http.ClientRequest = this.createClientRequest(requestOptions);

        if (body) {
            request.write(body);
        }

        return request;
    }

    get(uri:string, params?:any): http.ClientRequest {
        var request: http.ClientRequest = this.request("GET", uri, params);
        request.end();
        return request;
    }

    private createClientRequest(options: any): http.ClientRequest {
        var request: http.ClientRequest;
        switch(options.protocol) {
            case 'http':
                request = http.request(options);
                break;
            case 'https':
                request = https.request(options);
                break;
            default:
                throw new Error('Protocol:' + options.protocol + ' not supported.');
        }
        return request;
    }

    private removeUndefinedParams(params:any): http.ClientRequest {
        if (params) {
            // remove undefined params
            for(param in params) {
                if (typeof(param)=="undefined") {
                    delete params[param];
                }
            }
        }
        return params;
    }
}
