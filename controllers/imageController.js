const path = require('path');
const { StatusCodes } = require('http-status-codes');
const fs = require('fs/promises');
const { transporter } = require('../utils/transporter');

const imageUpload = async (req, res) => {
  const { htmlBody, email } = req.body;
  console.log({ email });

  const uploadedFiles = [];
  const sampleFileKeys = req?.files ? Object.keys(req.files) : [];

  if (sampleFileKeys.length > 0) {
    for (const iterator of sampleFileKeys) {
      const sampleFile = req.files[iterator];
      console.log(
        '🚀 ~ file: imageController.js:7 ~ imageUpload ~ sampleFile:',
        req.files[iterator]
      );
      const uploadPath = path.join(__dirname, '../uploads', sampleFile.name);
      uploadedFiles.push(uploadPath);
      await sampleFile.mv(uploadPath);
    }
  }

  let mailOptions = {
    from: {
      name: 'Chenna Sreenu',
      address: 'csrinu236@gmail.com',
    },
    to: email,
    subject: 'Request for Credit Limit Enhacement',
    html: htmlBody,
    attachments: uploadedFiles.map((fileName) => {
      return { path: fileName };
    }),
  };

  let result = await transporter.sendMail(mailOptions);

  for (const uploadPath of uploadedFiles) {
    await fs.unlink(uploadPath);
  }

  res.status(StatusCodes.OK).send('Image Uploaded');
};

module.exports = {
  imageUpload,
};
