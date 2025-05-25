const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/render', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
const image = req.files.image[0];
const audio = req.files.audio[0];

const imagePath = `${image.path}.jpg`;
const audioPath = `${audio.path}.mp3`;

fs.renameSync(image.path, imagePath);
fs.renameSync(audio.path, audioPath);

const output = `uploads/${Date.now()}.mp4`;
const command = `ffmpeg -loop 1 -framerate 1 -i ${imagePath} -i ${audioPath} -t 60 -vf scale=1280:720 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest -pix_fmt yuv420p ${output}`;

  exec(command, (error) => {
    if (error) {
      console.error('ffmpeg full error:', error);
      return res.status(500).send('Render failed');
    }

    res.json({ url: `http://localhost:3000/${output}` });
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
