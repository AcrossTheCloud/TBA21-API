const AWS = require('aws-sdk');

// use separate region for rekognition due to limited region availability
const rekognition = new AWS.Rekognition();
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {

    let s3Record = event.Records[0].s3;
    let srcBucket = s3Record.bucket.name;
    let srcKey = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

    let params = {
        Image: {
            S3Object: {
                Bucket: srcBucket,
                Name: srcKey
            }
        },
        MaxLabels: 10,
        MinConfidence: 60
    };

    let rekognitionData = await rekognition.detectLabels(params).promise();
    let requestData = {"key": srcKey, "labels": rekognitionData.labels };

    let putParams = {
      TableName: process.env.IMAGE_TAG_TABLE,
      Item: requestData
    };

    let dynamoDBdata = await docClient.put(putParams).promise();
    console.log(dynamoDBdata);
}
