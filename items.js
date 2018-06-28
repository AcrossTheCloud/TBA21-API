const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const docClient = new AWS.DynamoDB.DocumentClient();
const Joi = require('joi');
const uuid = require('uuid/v1');

const ocean = ['Pacific','Atlantic','Indian','Southern','Arctic'];

const headers = {
    "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
};

const addArtistNames = function(data, callback) {
  data.Items = data.Items.map((item) => {
    let params = {
      TableName: "tba21-artists",
      KeyConditionExpression: "artistId = :artistId",
      ExpressionAttributeValues: {
        ":artistId": item.artistId
      }
    };
    docClient.query(params, function(err, data) {
      if (err) {
        const response = {
          headers: headers,
          statusCode: 503,
          body: JSON.stringify(err)
        };
        callback(null,response);
      } else {
        console.log("Query succeeded.");
        item['artistName']=response.Items[0].name;
      }
    });
    return item;
  });
  return data;
};

module.exports.get = function(event, context, callback) {
    console.log(event.queryStringParameters);

    if (event.queryStringParameters === null) {
      let params = {
          TableName : "tba21",
          ProjectionExpression:"ocean, #tm, itemId, #p, description, #u, artist",
          ExpressionAttributeNames:{
              "#p": "position",
              "#u": "url",
              "#tm": "timestamp"
          }
      };

      docClient.scan(params, function(err, data) {
          if (err) {
              const response = {
                  statusCode: 503,
                  body: JSON.stringify(err)
              };
              callback(null,response);
          } else {
              console.log("Scan succeeded.");
              const response = {
                  statusCode: 200,
                  headers: headers,
                  body: JSON.stringify(addArtistNames(data, callback)),
              };
              callback(null, response);
          }
      });

    } else if (typeof (event.queryStringParameters.ocean) === 'undefined') {
        const response = {
            statusCode: 400,
            headers: headers,
            body: 'invalid query parameter, try ?ocean=Pacific'
        };
        callback(null,response);
    } else {
        let params = {
            TableName : "tba21",
            ProjectionExpression:"ocean, #tm, itemId, #p, description, #u, artist",
            KeyConditionExpression: "ocean = :o",
            ExpressionAttributeNames:{
                "#p": "position",
                "#u": "url",
                "#tm": "timestamp"
            },
            ExpressionAttributeValues: {
                ":o": event.queryStringParameters.ocean
            }
        };

        docClient.query(params, function(err, data) {
            if (err) {
                const response = {
                    statusCode: 503,
                    body: JSON.stringify(err)
                };
                callback(null,response);
            } else {
                console.log("Query succeeded.");
                const response = {
                    statusCode: 200,
                    headers: headers,
                    body: JSON.stringify(addArtistNames(data, callback)),
                };
                callback(null, response);
            }
        });
    }

};

module.exports.post = function(event, context, callback) {
    let body = JSON.parse(event.body);

    const schema = Joi.object().keys({
    ocean: Joi.any().valid(ocean).required(),
    description: Joi.string().required(),
    url: Joi.string().uri().required(),
    position: Joi.array().ordered([
          Joi.number().min(-180).max(180).required(),
          Joi.number().min(-90).max(90).required()
      ]),
    artist: Joi.string()
    });

    if (!Joi.validate(body, schema).error) {
        body.itemId = uuid();
        body.timestamp = new Date() / 1000;
        let putParams = {
          TableName: "tba21",
          Item: body
        };
        docClient.put(putParams, (error) => {
            if (error) {
                    const response = {
                        statusCode: 503,
                        headers: headers,
                        body: JSON.stringify({ "message": "Server error " + error.toString() })
                    };
                    callback(null, response);
                } else {
                    console.log(event);
                    const response = {
                        statusCode: 200,
                        headers: headers,
                        body: JSON.stringify({ "message": "Item stored"})
                    };
                    callback(null, response);
                }
            });
    } else {
        const response = {
            statusCode: 422,
            headers: headers,
            body: JSON.stringify({ "message": "Bad request, error validating body" })
        };
        callback(null, response);
    }

};
