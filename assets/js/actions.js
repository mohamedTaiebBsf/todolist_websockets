let host = "http://localhost:8080";

let socket = io.connect(host);

let form = document.getElementById("form");
let lists = document.getElementById("lists");
let newtodo = document.getElementById("newtodo");

socket.on("update_lists", items => {
  lists.innerHTML = "";
  items.forEach(({ id, msg }) => {
    createListItem(lists, msg, id);
  });
});

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!newtodo.value) return;
  socket.emit("envoi_item", newtodo.value);
  newtodo.value = "";
  newtodo.focus();
});

socket.on("receive_item", ({ msg, index }) => {
  createListItem(lists, msg, index);
});

function createListItem(parent, msg, index) {
  let liElt = document.createElement("li");
  let divElt = document.createElement("div");
  let deleteIcon = createIcon("fas fa-trash-alt");
  let editIcon = createIcon("fas fa-edit");
  let msgElt = document.createTextNode(msg);
  deleteIcon.setAttribute("title", "supprimer");
  deleteItem(deleteIcon, index);
  editIcon.setAttribute("title", "mettre à jour");
  updateItem(editIcon, index);
  divElt.append(deleteIcon);
  divElt.append(editIcon);
  liElt.append(msgElt);
  liElt.append(divElt);
  parent.append(liElt);
}

function deleteItem(elt, index) {
  elt.addEventListener("click", function() {
    this.parentNode.parentNode.parentNode.removeChild(
      this.parentNode.parentNode
    );
    socket.emit("delete_item", index);
  });
}

function updateItem(elt, index) {
  elt.addEventListener("click", () => {
    let modal = document.querySelector(".modal");
    let closeModal = document.querySelector(".closeBtn");
    let updateItem = document.querySelector(".update-item-input");
    let formUpdate = document.querySelector(".formUpdate");
    let liParent = elt.parentNode.parentNode;
    modal.style.display = "block";

    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });

    updateItem.value = liParent.firstChild.textContent;

    formUpdate.addEventListener("submit", e => {
      e.preventDefault();
      socket.emit("update_item", { text: updateItem.value, index });
      modal.style.display = "none";
    });
  });
}

function createIcon(iconClass) {
  let icon = document.createElement("i");
  icon.className = iconClass;
  return icon;
}
