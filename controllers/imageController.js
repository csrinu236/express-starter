const path = require('path');
const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');
const fs = require('fs/promises');

const imageUpload = async (req, res) => {
  const sampleFile = req.files.image;
  console.log(
    '🚀 ~ file: imageController.js:7 ~ imageUpload ~ sampleFile:',
    sampleFile
  );

  const uploadPath = path.join(__dirname, '../uploads', sampleFile.name);

  const uploadedPath = await sampleFile.mv(uploadPath);

  // https://api.cloudinary.com/v1_1/:cloud_name<process.env.CLOUD_NAME>/:action<image/upload>
  // POST https://api.cloudinary.com/v1_1/demo/image/upload

  // we can also use streams of data
  //
  const info = await cloudinary.uploader.upload(uploadPath, {
    folder: 'testing-express',
    // filename_override: 'something',
    use_filename: true,
    public_id: sampleFile.name, // preffered name
    // chunk_size: 10,
  });

  await fs.unlink(uploadPath);

  res.status(StatusCodes.OK).send({ info });
};

module.exports = {
  imageUpload,
};
