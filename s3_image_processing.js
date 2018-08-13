var AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition({region: 'us-east-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// If the request times out, it's because photos must be less than 5 MB!
// But usually that's fine, because deeplens has low quality images...

exports.handler = (event, context, callback) => {
    console.log("new photo added: ", event);
    
    var detectFacesParams = {
      Image: { /* required */
        S3Object: {
          Bucket: 'deeplens-fd-family',
          Name: process.env.image
        }
      },
      Attributes: [ "ALL" ], // have to specify ALL to get emotions
    };

    rekognition.detectFaces(detectFacesParams, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        callback(null, 'An error occured.');
      } else {
        var emotions = data['FaceDetails'][0]['Emotions']
        console.log(emotions)
        
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessage-property
        var messageParams = {
          MessageBody: emotions.toString(), /* required */
          QueueUrl: 'https://sqs.us-east-1.amazonaws.com/231566317544/S3ImageProcessing-Emotion', /* required */
          DelaySeconds: 0,
        };
        sqs.sendMessage(messageParams, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
      }
    });

    var searchFacesParams = {
      CollectionId: 'family',
      Image: {
        S3Object: {
          Bucket: 'deeplens-fd-family',
          Name: process.env.image
        }
      },
      FaceMatchThreshold: 95,
      MaxFaces: 5
    };

    // is that even right name?
    rekognition.searchFacesByImage(searchFacesParams, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        callback(null, 'An error occured.');
      } else {
        if (data.FaceMatches.length <= 0) {
          console.log('No face found.')
        } else {
          var faces = []
          for (var i = 0; i < data.FaceMatches.length; i++) {
            var face = data.FaceMatches[i]['Face']['ExternalImageId'];
            var formatted_name = face.charAt(0).toUpperCase() + face.substring(1);
            console.log('Face found: '+ formatted_name);
            faces.push({
              face: formatted_name,
              // maybe add confidence also
            })
          }

          var messageParams = {
            MessageBody: faces.toString(), /* required */
            QueueUrl: 'https://sqs.us-east-1.amazonaws.com/231566317544/S3ImageProcessing-Faces', /* required */
            DelaySeconds: 0,
          };
          sqs.sendMessage(messageParams, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
          });
        }
      }
    });

    callback(null, "Hello from Lambda");
};