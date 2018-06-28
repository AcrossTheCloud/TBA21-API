const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const docClient = new AWS.DynamoDB.DocumentClient();
const Joi = require('joi');
const uuid = require('uuid/v1');

const headers = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
};

module.exports.get = function(event, context, callback) {
  console.log(event.queryStringParameters);

  if (event.queryStringParameters === null) {
    let params = {
      TableName : "tba21-artists"
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
          body: JSON.stringify(data),
        };
        callback(null, response);
      }
    });
  } else {
    let params = {
      TableName: "tba21-artists",
      IndexName: "name-index",
      KeyConditionExpression: "begins_with(#nm,:nm)",
      ExpressionAttributeNames:{
        "#nm": "name"
      },
      ExpressionAttributeValues: {
        ":nm": event.queryStringParameters.name
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
        const response = {
          statusCode: 200,
          headers: headers,
          body: JSON.stringify(data),
        };
        callback(null, response);
      }
    });
  }

};

module.exports.post = function(event, context, callback) {
  let body = JSON.parse(event.body);
  if (!body.hasOwnProperty('works')) {
    body['works'] = [];
  }

  const schema = Joi.object().keys({
    name: Joi.string().required(),
    works: Joi.array().items(Joi.string()).required(),
    biography: Joi.string()
  });

  if (!Joi.validate(body, schema).error) {
    body.artistId = uuid();
    let putParams = {
      TableName: "tba21-artists",
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

module.exports.patch = function(event, context, callback) {
  let data = JSON.parse(event.body);
  data.id = event.queryStringParameters.id;
  console.log(data);

  const schema = Joi.object().keys({
    id: Joi.string().guid().required(),
    works: Joi.array().items(Joi.string().guid()).required(),
  });

  if (!Joi.validate(data, schema).error) {
    var params = {
      TableName: 'tba21-artists',
      Key: {
        "artistId": data.id,
      },
      UpdateExpression: 'SET works = list_append(works, :works)',
      ExpressionAttributeValues: {
        ':works': data.works
      }
    };

    var documentClient = new AWS.DynamoDB.DocumentClient();

    documentClient.update(params, (error) => {
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
      body: JSON.stringify({ "message": "Bad request, error validating request." })
    };
    callback(null, response);
  }
};
