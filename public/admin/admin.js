document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/albums")
    .then((response) => response.json())
    .then((data) => {
      createOptions(data.albums);
      createAlbums(data.albums);
    })
    .catch((error) => console.error("Error:", error));
});

async function createOptions(albums) {
  const albumSelect = document.getElementById("albumSelect");
  albums.forEach((album) => {
    const option = document.createElement("option");
    option.setAttribute("value", album._id);
    option.textContent = album.name;
    albumSelect.appendChild(option);
  });
}

async function createAlbums(albums) {
  console.log(albums);
  const albumsContainer = document.getElementById("albums");

  for (const album of albums) {
    const albumList = document.createElement("ul");
    albumList.setAttribute("class", "album");
    albumList.setAttribute("data-album-id", album._id);

    const albumNameItem = document.createElement("li");
    albumNameItem.textContent = album.name;
    albumList.appendChild(albumNameItem);

    const images = await getImages(album._id);
    if (images) {
      images.forEach((image) => {
        const cleanedImagePath = "../" + image.imagePath;
        const imageElement = document.createElement("li");
        imageElement.innerHTML = `Filename: ${image.imageName}, Filepath: ${image.imagePath}`;
        albumList.appendChild(imageElement);
        const imageDiv = document.createElement("div");
        imageDiv.className = "rounded overflow-hidden shadow-lg";

        const imgElement = document.createElement("img");
        imgElement.src = cleanedImagePath;
        imgElement.alt = image.imageName;
        imgElement.className = "max-w-16";

        imageDiv.appendChild(imgElement);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className =
          "mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded";
        deleteButton.onclick = function () {
          fetch(`http://localhost:3000/images/${image._id}`, {
            method: "DELETE",
          }).then(() => {
            imageDiv.remove();
          });
        };

        imageDiv.appendChild(deleteButton);
        albumList.appendChild(imageDiv);
      });
    }
    albumsContainer.appendChild(albumList);
  }
}

function getImages(albumId) {
  return fetch(`http://localhost:3000/images/album/${albumId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.count > 0) {
        console.log(data);
        return data.images;
      } else {
        console.error("Error fetching images:", data.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      return [];
    });
}

let filesToUpload = [];

function dropHandler(ev) {
  console.log("File(s) dropped");

  ev.preventDefault();

  if (ev.dataTransfer.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file.type.startsWith("image/")) {
          console.log(`… file[${i}].name = ${file.name}`);
          filesToUpload.push(file);
        } else {
          console.log(`… file[${i}] is not an image`);
        }
      }
    });
  } else {
    [...ev.dataTransfer.files].forEach((file, i) => {
      if (file.type.startsWith("image/")) {
        console.log(`… file[${i}].name = ${file.name}`);
        filesToUpload.push(file);
      } else {
        console.log(`… file[${i}] is not an image`);
      }
    });
  }
}

document.getElementById("uploadButton").addEventListener("click", function () {
  const albumId = document.getElementById("albumSelect").value;
  imageUpload(filesToUpload, albumId);
  filesToUpload = [];
});

function dragOverHandler(ev) {
  console.log("File(s) in drop zone");

  ev.preventDefault();
}
function imageUpload(files, albumId) {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append("images", file);
  });
  formData.append("albumId", albumId);

  fetch("http://localhost:3000/images/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Images uploaded successfully") {
        console.log(data);
      } else {
        console.error("Error uploading images:", data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

async function createAlbum() {
  var albumNameValue = document.getElementById("albumName").value;
  var albumDescValue = document.getElementById("albumDesc").value;
  var coverImageFile = document.getElementById("coverImage").files[0];

  if (
    albumNameValue.trim() === "" ||
    albumDescValue.trim() === "" ||
    !coverImageFile
  ) {
    console.log("Please fill in all the fields and select a cover image.");
    return;
  }

  var formData = new FormData();
  formData.append("name", albumNameValue);
  formData.append("description", albumDescValue);
  formData.append("coverImage", coverImageFile);
  formData.append("creationDate", new Date().toISOString()); // assuming you want to set the creationDate to the current date/time

  try {
    const response = await fetch("/albums", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    console.log(responseData);
  } catch (error) {
    console.error("Error:", error);
  }
}
