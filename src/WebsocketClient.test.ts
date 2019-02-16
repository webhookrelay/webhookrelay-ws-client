import WebhookRelayClient from './WebsocketClient';
import axios from 'axios';

import * as mocha from 'mocha';
import * as chai from 'chai';

const expect = chai.expect;
describe('Connect to WHR', () => {
  const key = process.env.RELAY_KEY;
  const secret = process.env.RELAY_SECRET;
  const testBucket = process.env.RELAY_BUCKET;  

  it('should be able to subscribe correctly' , (done) => {
    var handler = function (data: string) {
      console.log(data)
      var msg = JSON.parse(data);
      if (msg.type === 'status' && msg.status == 'subscribed') {
        expect(msg.message).to.have.string(testBucket);
        done();
        client.disconnect();
      }
    }
  
    var client = new WebhookRelayClient(key, secret, [testBucket], handler)
    client.connect();    
  });

  it('should be able to forward the webhook', (done) => {
    var payload = "payload-" + Math.floor((Math.random() * 100000) + 1);
    // creating a handler
    var handler = function (data: string) {
      var msg = JSON.parse(data);
      if (msg.type === 'status' && msg.status == 'subscribed') {        
        var dispatchWebhook = function() {
          axios.post('https://my.webhookrelay.com/v1/webhooks/9c1f0997-1a34-4357-8a88-87f604daeca9', payload)
          .then(function (response) {          
            expect(response.status).to.equal(200)
          })
        }
        setTimeout(dispatchWebhook, 1000)
                
      }
      if (msg.type === 'webhook' && msg.body === payload) {
        expect(msg.method).to.equal('POST');
        done();
        client.disconnect();
      }
    }
  
    var client = new WebhookRelayClient(key, secret, [testBucket], handler)
    client.connect();
  });
});
