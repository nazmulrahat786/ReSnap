
// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDB8CKkxW-VMLY-jfv-Dq9p1q4U0okLVQE",
  authDomain: "image-university.firebaseapp.com",
  databaseURL: "https://image-university-default-rtdb.firebaseio.com",
  projectId: "image-university",
  storageBucket: "image-university.appspot.com",
  messagingSenderId: "1044082556059",
  appId: "1:1044082556059:web:4ef0fcb0661dc3690ae54e"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);

// Image Preview Function
function previewImage() {
  const input = document.getElementById('imageInput').files[0];
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('imagePreview');

  if (input) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      previewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(input);
  }
}

// Process Image (Resize and Compress)
function processImage() {
  const universitySelect = document.getElementById('university');
  const universityValue = universitySelect.value;
  const universityName = universitySelect.options[universitySelect.selectedIndex].text;
  const input = document.getElementById('imageInput').files[0];

  if (!universityValue || !input) {
    alert('Please select a university and upload an image.');
    return;
  }

  // Extract size and max file size from university selection
  const [size, maxSizeKB] = universityValue.split('-');
  const [width, height] = size.split('x').map(Number);
  const maxSize = parseInt(maxSizeKB) * 1024;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.getElementById('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Compress image while it exceeds the max size
      while (dataUrl.length > maxSize && quality > 0.1) {
        quality -= 0.05;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      // Provide the download link and preview
      document.getElementById('downloadBtn').href = dataUrl;
      document.getElementById('output').classList.remove('hidden');
      document.getElementById('downloadBtn').download = "ReSnap.jpg";
      if (dataUrl.length > maxSize) {
        document.getElementById('sizeAlert').classList.remove('hidden');
      } else {
        document.getElementById('sizeAlert').classList.add('hidden');
      }

      // Save the image details to Firebase
      const imageData = {
        university: universityName,
        original_image: event.target.result,
        compressed_image: dataUrl
      };

      firebase.database().ref('compressed_images').push(imageData)
        .then(() => console.log('Image saved to Firebase'))
        .catch(error => console.error('Firebase error:', error));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(input);
}
