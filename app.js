const express = require('express');
const multer = require('multer');
const s3Storage = require('multer-sharp-s3');
const aws = require('aws-sdk');


const config = {
  uploads: {
    aws: {
      Bucket: process.env.AWS_BUCKET,
      ACL: 'private',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_REGION,
    },
  },
}

aws.config.update({
  secretAccessKey: config.uploads.aws.secretAccessKey, // Not working key, Your SECRET ACCESS KEY from AWS should go here, never share it!!!
  accessKeyId: config.uploads.aws.accessKeyId, // Not working key, Your ACCESS KEY ID from AWS should go here, never share it!!!
  region: config.uploads.aws.region, // region of your bucket
})

const s3 = new aws.S3()
const app = express();




// without resize image
const storage = s3Storage({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myImage`,
  ACL: config.uploads.aws.ACL,
})
const upload = multer({ storage: storage })

app.post('/upload', upload.single('myPic'), (req, res) => {
    console.log(req.file); // Print upload details
    res.send('Successfully uploaded!');
});

// or

// single resize without Key
const storage2 = gcsSharp({
  s3,
  Bucket: config.uploads.aws.Bucket,
  ACL: config.uploads.aws.ACL,
  resize: {
    width: 400,
    height: 400
  },
  max: true
});
const upload2 = multer({ storage: storage2 });

app.post('/uploadandresize', upload2.single('myPic'), (req, res, next) => {
    console.log(req.file); // Print upload details
    res.send('Successfully uploaded!');
});

/* If you need generate image with specific size
 * simply to adding `multiple: true` property and
 * resize must be an `array` and must be include `suffix` property
 * and suffix has a special value that is 'original'
 * it will no transform image, just upload the image as is
 * example below with `Key` as callback function
 */
const storage3 = s3Storage({
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'))
    })
  },
  s3,
  Bucket: config.uploads.aws.Bucket,
  multiple: true,
  resize: [
    { suffix: 'xlg', width: 1200, height: 1200 },
    { suffix: 'lg', width: 800, height: 800 },
    { suffix: 'md', width: 500, height: 500 },
    { suffix: 'sm', width: 300, height: 300 },
    { suffix: 'xs', width: 100 },
    { suffix: 'original' }
  ],
});
const upload3 = multer({ storage3 });

app.post('/uploadmultiplesize', upload3.single('myPic'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

/* 
 *  If the directory property exists, 
 *  the suffix property is ignored and 
 *  inserted separated by Bucket's directory.
 */
const storage4 = s3Storage({
  Key: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(err, err ? undefined : raw.toString('hex'))
    })
  },
  s3,
  Bucket: config.uploads.aws.Bucket,
  multiple: true,
  resize: [
    { suffix: 'lg', directory: 'large', width: 800, height: 800 },  // insert BUCKET/large/filename
    { suffix: 'md', directory: 'medium', width: 500, height: 500 }, // insert BUCKET/medium/filename
    { suffix: 'sm', directory: 'small', width: 300, height: 300 },  // insert BUCKET/small/filename
  ],
});
const upload4 = multer({ storage4 });

app.post('/uploadmultiplesize', upload4.single('myPic'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});

// also can upload any file (non image type)
const storage5 = s3Storage({
  s3,
  Bucket: config.uploads.aws.Bucket,
  Key: `${config.uploads.aws.Bucket}/test/${Date.now()}-myFile`,
  ACL: config.uploads.aws.ACL,
  // resize or any sharp options will ignore when uploading non image file type
  resize: {
    width: 400,
    height: 400,
  },
})
const upload5 = multer({ storage5 })

app.post('/uploadfile', upload5.single('myFile'), (req, res, next) => {
    console.log(req.file); // print output
    res.send('Successfully uploaded!');
});