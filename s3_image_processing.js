var AWS = require('aws-sdk');

var rekognition = new AWS.Rekognition({region: 'us-east-1'});

// If the request times out, it's because photos must be less than 5 MB!
// But usually that's fine, because deeplens has low quality images...

exports.handler = (event, context, callback) => {
    console.log("new photo added: ", event);
    
    var params = {
      CollectionId: 'family', /* required */
      Image: { /* required */
        S3Object: {
          Bucket: 'deeplens-fd-family',
          Name: process.env.image
        }
      },
      Attributes: [ "ALL" ], // have to specify ALL to get emotions
      FaceMatchThreshold: 95,
      MaxFaces: 5
    };
    
    var msg;
    
    rekognition.detectFaces(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        callback(null, 'An error occured.');
      } else {
        console.log("Response from Rekognition: \n", data);
        // if (data.FaceMatches.length <= 0) {
        //   msg = 'No face found.'
        //   console.log(msg)
        //   callback(null, msg);
        // } else {
        //   for (var i = 0; i < data.FaceMatches.length; i++) {
        //     var face = data.FaceMatches[i]['Face']['ExternalImageId'];
        //     var formatted_name = face.charAt(0).toUpperCase() + face.substring(1);
        //     msg = 'Face found: '+ formatted_name;
        //     console.log(msg)
        //     callback(null, msg);
        //   }
        // }
      }
    });
};