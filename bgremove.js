
let cropper;

function previewImage() {
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  const file = fileInput.files[0];
  const imageWrapper = document.getElementById("imageWrapper");

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      imageWrapper.classList.remove("hidden");

      if (cropper) {
        cropper.destroy(); // Destroy previous cropper instance if any
      }
      cropper = new Cropper(preview, {
        aspectRatio: NaN, // Set to NaN for free cropping
        viewMode: 1, // Allows only in-bound cropping
        scalable: true, // Enable scaling
        movable: true, // Enable moving the image
        zoomable: true, // Enable zooming
        rotatable: true, // Enable rotating the image
        ready() {
          // Automatically set the crop box size to the full image
          const cropBoxData = cropper.getCropBoxData();
          cropBoxData.width = cropper.getCanvasData().width;  // Set width of crop box to full image width
          cropBoxData.height = cropper.getCanvasData().height;  // Set height of crop box to full image height
          cropper.setCropBoxData(cropBoxData);  // Update crop box size
        }
      });
    };
    reader.readAsDataURL(file);
  }
}

function resetAll() {
  document.getElementById("fileInput").value = "";
  document.getElementById("preview").classList.add("hidden");
  document.getElementById("imageContainer").classList.add("hidden");
  document.getElementById("useTransparent").checked = false;
  const imageWrapper = document.getElementById("imageWrapper");
  imageWrapper.classList.add("hidden");

  if (cropper) {
    cropper.destroy(); // Destroy cropper instance
  }
}

async function removeBackground() {
  const useTransparent = document.getElementById("useTransparent").checked;
  const bgColor = document.getElementById("bgColor").value;

  // Get the cropped image
  const croppedCanvas = cropper.getCroppedCanvas(); // This captures the cropped area

  croppedCanvas.toBlob((blob) => {
    const loader = document.getElementById("loader");
    const imageContainer = document.getElementById("imageContainer");
    const canvas = document.getElementById("resultCanvas");
    const ctx = canvas.getContext("2d");

    loader.classList.remove("hidden");
    imageContainer.classList.add("hidden");

    const formData = new FormData();
    formData.append("image_file", blob);

    axios.post("https://api.remove.bg/v1.0/removebg", formData, {
      headers: {
        "X-Api-Key": "XueyuRunb75UkNvsA3mJ2DBg", // Replace with your API key
      },
      responseType: "arraybuffer"
    })
    .then(response => {
      const imageUrl = URL.createObjectURL(new Blob([response.data], { type: "image/png" }));
      const img = new Image();
      img.onload = () => {
        const scale = img.width > 600 ? 600 / img.width : 1;
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;

        if (!useTransparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL("image/png");
        document.getElementById('downloadBtn').download = "ReSnap.jpg";
        document.getElementById("downloadBtn").href = dataURL;

        loader.classList.add("hidden");
        imageContainer.classList.remove("hidden");
      };
      img.src = imageUrl;
    })
    .catch(error => {
      console.error("Error removing background:", error);
      loader.classList.add("hidden");
      alert("Failed to remove background. Please try again.");
    });
  });
}
