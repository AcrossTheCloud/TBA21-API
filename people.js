/* eslint-disable no-prototype-builtins */
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const docClient = new AWS.DynamoDB.DocumentClient();
const Joi = require('joi');
const uuid = require('uuid/v1');

const headers = {
  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
};

module.exports.get = async (event, context, callback) => {
  console.log(event.queryStringParameters);

  try {
    if (event.queryStringParameters === null) {
      let params = {
        TableName : process.env.PEOPLE_TABLE
      };

      let data = await docClient.scan(params).promise();
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(data),
      };
      callback(null, response);
    } else if (event.queryStringParameters.hasOwnProperty('name')){
      let params = {
        TableName: process.env.PEOPLE_TABLE,
        FilterExpression: "begins_with(#nm,:nm)",
        ExpressionAttributeNames:{
          "#nm": "name"
        },
        ExpressionAttributeValues: {
          ":nm": event.queryStringParameters.name
        }
      };

      let data = await docClient.scan(params).promise();
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(data),
      };
      callback(null, response);
    } else if (event.queryStringParameters.hasOwnProperty('personId')) {
      let params = {
        TableName: process.env.PEOPLE_TABLE,
        KeyConditionExpression: "personId = :personId",
        ExpressionAttributeValues: {
          ":personId": event.queryStringParameters.personId
        }
      };
      let data = await docClient.query(params).promise();

      console.log("Query succeeded.");
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(data),
      };
      callback(null, response);
    } else {
      const response = {
        statusCode: 422,
        headers: headers,
        body: JSON.stringify({ "message": "Bad request, invalid query parameter." })
      };
      callback(null, response);
    }
  } catch (error) {
    console.log(error);
    const response = {
      statusCode: 503,
      headers: headers,
      body: JSON.stringify({ "message": "Server error " + error.toString() })
    };
    callback(null, response);
  }
};

module.exports.post = async (event, context, callback) => {
  try {
    let body = JSON.parse(event.body);
    if (!body.hasOwnProperty('works')) {
      body.works = [];
    }

    const schema = Joi.object().keys({
      name: Joi.string().required(),
      works: Joi.array().items(Joi.string()).required(),
      biography: Joi.string()
    });

    if (!Joi.validate(body, schema).error) {
      body.personId = uuid();
      let putParams = {
        TableName: process.env.PEOPLE_TABLE,
        Item: body
      };
      let data = await docClient.put(putParams).promise();
      console.log(data);
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ "message": "Item stored"})
      };
      callback(null, response);
    } else {
      const response = {
        statusCode: 422,
        headers: headers,
        body: JSON.stringify({ "message": "Bad request, error validating body" })
      };
      callback(null, response);
    }
  } catch (error) {
    console.log(error);
    const response = {
      statusCode: 503,
      headers: headers,
      body: JSON.stringify({ "message": "Server error " + error.toString() })
    };
    callback(null, response);
  }
};

module.exports.patch = async (event, context, callback) => {
  try {
    let data = JSON.parse(event.body);
    data.id = event.queryStringParameters.id;
    console.log(data);

    const schema = Joi.object().keys({
      id: Joi.string().guid().required(),
      works: Joi.array().items(Joi.string().guid()).required(),
    });

    if (!Joi.validate(data, schema).error) {
      var params = {
        TableName: 'tba21-people',
        Key: {
          "personId": data.id,
        },
        UpdateExpression: 'SET works = list_append(works, :works)',
        ExpressionAttributeValues: {
          ':works': data.works
        }
      };

      let data = await docClient.update(params).promise();
      const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ "message": "Item stored"})
      };
      callback(null, response);
    } else {
      const response = {
        statusCode: 422,
        headers: headers,
        body: JSON.stringify({ "message": "Bad request, error validating request." })
      };
      callback(null, response);
    }
  } catch (error) {
    console.log(error);
    const response = {
      statusCode: 503,
      headers: headers,
      body: JSON.stringify({ "message": "Server error " + error.toString() })
    };
    callback(null, response);
  }
};

module.exports.roles = async (event, context, callback) => {
  try {
    let params = {
      TableName : process.env.ITEMS_TABLE,
      ProjectionExpression:"people"
    };
    let data = await docClient.scan(params).promise();
    data = Array.from(new Set(flattenDeep(data.Items // remove unique elements from and flatten
      .map((item) => item.people).map((person) => person.role) // now just get the roles
    )));
    const response = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(data),
    };
    callback(null, response);
  } catch (error) {
    console.log(error);
    const response = {
      statusCode: 503,
      headers: headers,
      body: JSON.stringify({ "message": "Server error " + error.toString() })
    };
    callback(null, response);
  }
};
