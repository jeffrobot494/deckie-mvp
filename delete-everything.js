// delete-everything.js
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dmfjx6e7z',
  api_key: '298828572186194', 
  api_secret: 'j5JrldVYYWtEIzHK7awsy0KOmdg'
});

async function nukeEverything() {
  try {
    const result = await cloudinary.api.delete_all_resources();
    console.log('💀 EVERYTHING DELETED:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

nukeEverything();
