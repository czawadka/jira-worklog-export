///<reference path="../../lib/ts/node-0.8.d.ts" />
import url = module('url');
import http = module('http');
import https = module('https');
import qs = module('querystring');
///<reference path="../../lib/ts/Q.d.ts" />
///<reference path="misc.ts" />

export interface HttpClientOptions {
    baseUrl: string;
    login?: string;
    password?: string;
}

export interface HttpRequestOptions {
    uri: string;
    method: string;
    params?: any;
}

export class HttpClientException {
    msg: string;
    reason: any;

    constructor(msg: string, reason?: any) {
        this.msg = msg;
        this.reason = reason;
    }

    toString(): string {
        return this.msg;
    }
}

function requestUrlFromOptions(requestOptions: any): string {
    var requestOptions: any = extend(requestOptions);
    return url.format(requestOptions);
}

export class RequestException extends HttpClientException {
    requestOptions: any;

    constructor(requestOptions: any, msg: string, reason?: any) {
        super("Request '"+requestUrlFromOptions(requestOptions)+"': "+msg);
        this.requestOptions = requestOptions;
    }
}

export class HttpClient {
    opts: HttpClientOptions;

    constructor(opts: HttpClientOptions) {
        this.opts = opts;
    }

    public request(requestOptions: HttpRequestOptions): Qpromise {
        var libOptions: any = this.prepareLibOptions(requestOptions);
        var lib: any = this.getProtocolLibrary(libOptions.protocol);
        var body: string = this.prepareRequestBody(requestOptions);

        var requestDeferred = Q.defer();
        var responseDeferred = Q.defer();

        requestDeferred.resolve(Q.fcall(function() {
            var request: http.ClientRequest = lib.request(libOptions);
            var responseData: string = '';

            request.on('response', function(response) {
                responseDeferred.notify({event: 'request.response', request: request, response: response});

                if (response.statusCode!=200) {
                    throw new RequestException(libOptions, "Status code "+response.statusCode, response);
                }

                response.on('data', function(chunk) {
                    responseDeferred.notify({event: 'response.data', request: request, response: response, chunk: chunk});
                    responseData += chunk;
                });
                response.on('end', function() {
                    responseDeferred.notify({event: 'response.end', request: request, response: response});
                    responseDeferred.resolve(responseData);
                });
                response.on('error', responseDeferred.reject);
            });
            request.on('error', requestDeferred.reject);

            requestDeferred.notify({event: 'request.created', request: request});

            request.end(body); // start & end request

            return responseDeferred.promise; // output is responseData
        }));

        return requestDeferred.promise; // output is responseDeferred.promise
    }

    private normalizeRequestOptions(requestOptions: HttpRequestOptions): HttpRequestOptions {
        requestOptions.method = (requestOptions.method || "GET").toUpperCase();
        requestOptions.params = this.removeUndefinedParams(requestOptions.params)

        return requestOptions;
    }

    private prepareRequestUrl(requestOptions: HttpRequestOptions): string {
        var requestUrl = (url.parse(requestOptions.uri).protocol ? requestOptions.uri : this.opts.baseUrl + requestOptions.uri);

        if (requestOptions.method=='GET' && requestOptions.params) {
            var queryStartIdx: number = requestUrl.indexOf('?');
            if (queryStartIdx==-1) {
                requestUrl += '?';
            } else if (queryStartIdx<requestUrl.length) {
                requestUrl += '&';
            }
            requestUrl += qs.stringify(requestOptions.params);
        }

        return requestUrl;
    }

    private prepareRequestBody(requestOptions: HttpRequestOptions): string {
        var body = '';
        if (requestOptions.method=='POST') {
            body = qs.stringify(requestOptions.params);
        }
        return body;
    }

    private prepareLibOptions(requestOptions: HttpRequestOptions): any {
        requestOptions = this.normalizeRequestOptions(requestOptions);

        var requestUrl: string = this.prepareRequestUrl(requestOptions),
            body: string = this.prepareRequestBody(requestOptions);

        var libOptions: any = url.parse(requestUrl);
        libOptions.method = requestOptions.method;
        if (this.opts.login) {
            libOptions.auth = this.opts.login+':'+this.opts.password;
        }

        return libOptions;
    }

    private getProtocolLibrary(protocol: string): any {
        var lib: any;
        switch(protocol) {
            case 'http':
            case 'http:':
                lib = http;
                break;
            case 'https':
            case 'https:':
                lib = https;
                break;
            default:
                throw new Error('Protocol:' + protocol + ' not supported.');
        }
        return lib;
    }

    private removeUndefinedParams(params:any): http.ClientRequest {
        if (params) {
            // remove undefined params
            for(var param in params) {
                if (typeof(param)=="undefined") {
                    delete params[param];
                }
            }
        }
        return params;
    }
}
