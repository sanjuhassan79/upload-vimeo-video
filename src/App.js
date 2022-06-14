import React, { useState } from 'react';

import axios from 'axios';
// import { LinearProgress } from '@mui/material';
var tus = require('tus-js-client');
const accessToken = '0b7192ae5bc1e196c78019825b90133f';

const headerDelete = {
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
  Authorization: `bearer ${accessToken}`,
  'Content-Type': 'application/x-www-form-urlencode',
};

const headerPatch = {
  'Tus-Resumable': '1.0.0',
  'Upload-Offset': 0,
  'Content-Type': 'application/offset+octet-stream',
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
};

const headerPost = {
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
  Authorization: `bearer ${accessToken}`,
  'Content-Type': 'application/json',
};

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [percentage, setPercentage] = useState(0);
  console.log(videoUrl);
  const handleChange = async (eventObject) => {
    // Get the selected file from the input element
    const file = eventObject.target.files[0];
    const fileName = file.name;
    const fileSize = file.size.toString();
    console.log(file, fileName, fileSize);

    const response = await axios({
      method: 'post',
      url: `https://api.vimeo.com/me/videos`,
      headers: headerPost,
      data: {
        upload: {
          approach: 'tus',
          size: fileSize,
          fileName: fileName,
        },
      },
    });

    console.log(response);

    // Create a new tus upload
    const upload = new tus.Upload(file, {
      endPoint: 'https://api.vimeo.com/me/videos',
      uploadUrl: response.data.upload.upload_link,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      headers: {},
      onError: function (error) {
        console.log('Failed because: ' + error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + '%');
        setPercentage(percentage);
      },
      onSuccess: function () {
        console.log('Download %s from %s', upload.file.name, upload.url);
        setVideoUrl(upload.url);
      },
    });

    // Start the upload
    upload.start();
  };

  return (
    <>
      <div> Vimeo upload test</div>
      <input onChange={handleChange} type="file" />
      <a href={videoUrl}>Video link</a>
      {/* <LinearProgress variant="determinate" value={percentage} /> */}
    </>
  );
}

export default App;
