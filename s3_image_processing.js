var AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition({region: 'us-east-1'});

// If the request times out, it's because photos must be less than 5 MB!
// But usually that's fine, because deeplens has low quality images...

exports.handler = (event, context, callback) => {
    console.log("new photo added: ", event);
    
    var params = {
      // CollectionId: 'family', /* required for search faces by image */
      Image: { /* required */
        S3Object: {
          Bucket: 'deeplens-fd-family',
          Name: process.env.image
        }
      },
      Attributes: [ "ALL" ], // have to specify ALL to get emotions
      // FaceMatchThreshold: 95,
      // MaxFaces: 5
    };
    
    var msg;
    
    rekognition.detectFaces(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        callback(null, 'An error occured.');
      } else {
        var emotions = data['FaceDetails'][0]['Emotions']
        
        // for (var i = 0; i < emotions.length; i++) {
        //   var type = emotions[i]['Type']
        //   var confidence = emotions[i]['Confidence'];
        //   var formatted_emotion = type.charAt(0).toUpperCase() + type.substring(1).toLowerCase();
        //   var msg = "emotion: " + formatted_emotion + ", confidence: " + confidence
        //   console.log(msg)
        //   callback(null, msg);
        // }

        console.log(emotions)
        callback(null, emotions);
      }
    });
};