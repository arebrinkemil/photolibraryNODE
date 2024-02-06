document.addEventListener("DOMContentLoaded", function () {
  fetch("/albums")
    .then((response) => response.json())
    .then((data) => {
      createAlbums(data.albums);
    })
    .catch((error) => console.error("Error:", error));
});

function createAlbums(albums) {
  console.log(albums);
  const albumsContainer = document.getElementById("albums");
  const albumButton = document.createElement("button");
  albumButton.innerHTML = "HOME";
  albumButton.setAttribute("class", "album text-black text-4xl");
  albumButton.setAttribute("data-album-id", "none");
  albumsContainer.appendChild(albumButton);
  albumButton.addEventListener("click", function (event) {
    var albumId = event.target.getAttribute("data-album-id");
    getImages(albumId);
  });
  albums.forEach((album) => {
    const albumButton = document.createElement("button");
    albumButton.innerHTML = album.name;
    albumButton.setAttribute("class", "album text-black text-4xl");
    albumButton.setAttribute("data-album-id", album._id);
    albumsContainer.appendChild(albumButton);

    albumButton.addEventListener("click", function (event) {
      var albumId = event.target.getAttribute("data-album-id");
      getImages(albumId);
    });
  });
}

function getImages(albumId) {
  fetch(`/images/album/${albumId}`)
    .then((response) => response.json())
    .then((data) => {
      createImages(data.images);
    })
    .catch((error) => console.error("Error:", error));
}

function createImages(images) {
  const imagesContainer = document.getElementById("images");
  imagesContainer.innerHTML = "";
  images.forEach((image) => {
    const imageElement = document.createElement("img");
    imageElement.setAttribute("src", image.imagePath);
    imageElement.setAttribute("class", "image drop-in");
    imageElement.setAttribute("loading", "lazy");
    imagesContainer.appendChild(imageElement);
  });
}
