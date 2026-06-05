export const deleteCard = (cardElement) => {
  cardElement.remove();
};

export const isCardLiked = (likeButton) => {
  return likeButton.classList.contains("card__like-button_is-active");
};

export const updateCardLike = (likeButton, likeCountElement, cardData, userId) => {
  const isLiked = cardData.likes.some((user) => user._id === userId);

  likeButton.classList.toggle("card__like-button_is-active", isLiked);
  likeCountElement.textContent = cardData.likes.length;
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  updateCardLike(likeButton, likeCountElement, data, userId);

  if (data.owner._id !== userId) {
    deleteButton.remove();
  } else if (onDeleteCard) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(data, likeButton, likeCountElement));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};
