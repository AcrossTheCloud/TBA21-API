const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const docClient = new AWS.DynamoDB.DocumentClient();


module.exports.get = function(event, context, callback) {
    console.log(event.queryStringParameters);

    if (event.queryStringParameters === null) {
        const response = {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin" : "*",
            },
            body: 'missing query parameter, try ?ocean=Pacific'
        }
        callback(null,response);
    } else if (typeof(event.queryStringParameters.ocean) === 'undefined') {
        const response = {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin" : "*",
            },
            body: 'invalid query parameter, try ?ocean=Pacific'
        }
        callback(null,response);
    } else {
        let params = {
            TableName : "tba21",
            ProjectionExpression:"ocean, #tm, itemId, #p, description, #u",
            KeyConditionExpression: "ocean = :o and #tm > :one_day_ago",
            ExpressionAttributeNames:{
                "#p": "position",
                "#u": "url",
                "#tm": "timestamp"
            },
            ExpressionAttributeValues: {
                ":o": event.queryStringParameters.ocean,
                ":one_day_ago": Math.floor(Date.now() / 1000)-86400,
            }
        };

        docClient.query(params, function(err, data) {
            if (err) {
                const response = {
                    statusCode: 503,
                    body: JSON.stringify(err)
                }
                callback(null,response);
            } else {
                console.log("Query succeeded.");
                const response = {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin" : "*",
                    },
                    body: JSON.stringify(data),
                };
                callback(null, response);
            }
        });
    }

};
