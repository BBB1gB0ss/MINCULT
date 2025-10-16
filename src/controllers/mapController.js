document.addEventListener("DOMContentLoaded", () => {
  const updateBtn = document.getElementById("updateBtn");
  const mapcontainer = document.getElementById("mapcontainer");
  const InfoUpdate = document.getElementById("InfoUpdate");

  updateBtn.addEventListener("click", () => {
    InfoUpdate.style.display = "flex";
    mapcontainer.style.display = "none";
  });
});
