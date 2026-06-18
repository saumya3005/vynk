const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'vynk/general';
    let resource_type = 'auto'; // automatically detects image, video, or raw
    
    // Determine folder from route path or body
    if (req.baseUrl.includes('users') || req.path.includes('avatar') || req.path.includes('profile')) folder = 'vynk/profiles';
    else if (req.baseUrl.includes('stories')) folder = 'vynk/stories';
    else if (req.baseUrl.includes('posts')) folder = 'vynk/posts';
    else if (req.baseUrl.includes('reels')) folder = 'vynk/reels';
    else if (req.baseUrl.includes('projects')) folder = 'vynk/projects';
    else if (req.baseUrl.includes('notes')) {
      folder = 'vynk/notes';
      // For notes, if it's pdf/doc etc, it needs to be raw
      if (file.mimetype === 'application/pdf' || file.mimetype.includes('document')) {
        resource_type = 'raw';
      }
    }
    else if (req.baseUrl.includes('communities')) folder = 'vynk/communities';
    else if (req.baseUrl.includes('messages') || req.baseUrl.includes('chats')) folder = 'vynk/chats';

    // Optimization transformations for images
    let transformation = [];
    if (file.mimetype.startsWith('image')) {
      transformation.push({ fetch_format: 'auto', quality: 'auto' });
      if (folder === 'vynk/profiles') transformation.push({ width: 300, height: 300, crop: 'fill' });
      else if (folder === 'vynk/stories') transformation.push({ width: 1080, height: 1920, crop: 'fill' });
      else if (folder === 'vynk/posts') transformation.push({ width: 1200 });
      else if (folder === 'vynk/reels') transformation.push({ width: 720 });
    }

    return {
      folder: folder,
      resource_type: resource_type,
      transformation: transformation,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']
    };
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
