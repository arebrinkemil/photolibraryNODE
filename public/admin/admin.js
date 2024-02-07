document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/images")
    .then((response) => response.json())
    .then((data) => {
      const imageList = document.getElementById("image-list");
      data.images.forEach((image) => {
        const cleanedImagePath = "../" + image.imagePath;

        const imageDiv = document.createElement("div");
        imageDiv.className = "rounded overflow-hidden shadow-lg";

        const imgElement = document.createElement("img");
        imgElement.src = cleanedImagePath;
        imgElement.alt = image.imageName;
        imgElement.className = "w-full h-auto";

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

        imageList.appendChild(imageDiv);
      });
    })
    .catch((error) => console.error("Error:", error));
});
