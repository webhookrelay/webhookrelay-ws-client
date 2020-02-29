// {
//     "type": "webhook",             // event type
//     "meta": {                      // bucket, input and output information 
//       "bucked_id": "1593fe5f-45f9-45cc-ba23-675fdc7c1638", 
//       "bucket_name": "my-1-bucket-name",                                
//       "input_id": "b90f2fe9-621d-4290-9e74-edd5b61325dd",
//       "input_name": "Default public endpoint",
//       "output_name": "111",
//       "output_destination": "http://localhost:8080"
//     },
//     "headers": {                   // request headers
//       "Content-Type": [
//         "application/json"
//       ]
//     },
//     "query": "foo=bar",            // query (ie: /some-path?foo=bar)
//     "body": "{\"hi\": \"there\"}", // request body
//     "method": "PUT"                // request method
//   }

export interface Metadata {
    id: string; // log ID
    bucket_id: string;
    bucket_name: string;
    input_id: string;
    input_name: string;
    output_name: string;
    output_destination: string;
}

export interface Headers {
    headers: any;
}

export interface Event {
    type: string;
    status: string;
    message: string;
    meta: Metadata;
    headers: Headers;
    query: string;
    body: string;
    method: string;
}

export default class SubscriptionMessage {

    private created: Date;

    /** @private */
    // constructor(readonly _data: Event) {}
    constructor(
        private type: string,
        private status: string,
        private message: string,
        private meta: Metadata,
        private headers: Headers,
        private query: string,
        private body: string,
        private method: string
    ) {}
    
    /**
     * Name of the bucket that received the webhook
     */
    getBucketName(): string {
        return this.meta.bucket_id;
    }

    getType(): string {
        return this.type;
    }

    getStatus() {
        return this.status;
    }

    getMessage() {
        return this.message;
    }

    static fromJSON(json: any): SubscriptionMessage {
        let msg = Object.create(SubscriptionMessage.prototype);
        return Object.assign(msg, json, {
          created: new Date(json.created)
        });        
    }
}

export class ResponseMessage {
    /** @private */
    // constructor(readonly _data: ResponseMessage) {}
    constructor(
        private meta: Metadata,
        private status: Number,
        private headers: Headers,
        private body: string
    ) {}

    getMeta(): Metadata {
        return this.meta;
    }

    getStatus(): Number {
        return this.status
    }

    getHeaders(): Headers {
        return this.headers
    }

    getBody(): string {
        return this.body
    }

    static fromJSON(json: any): ResponseMessage {
        let msg = Object.create(ResponseMessage.prototype);
        return Object.assign(msg, json, {
          created: new Date(json.created)
        });        
    }
}

// type SubscriptionEvent = SubscriptionMessage
export { SubscriptionMessage }
