import { createCardElement, deleteCard, updateCardLike, isCardLiked } from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";
import {
  addCard,
  addCardLike,
  deleteCardFromServer,
  deleteCardLike,
  getCardList,
  getUserInfo,
  updateUserAvatar,
  updateUserInfo,
} from "./components/api.js";

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
  errorSelector: "-error",
};

let currentUserId = "";

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoTitle = infoModalWindow.querySelector(".popup__title");
const infoList = infoModalWindow.querySelector(".popup__info");
const infoSubtitle = infoModalWindow.querySelector(".popup__text");
const infoPopularCards = infoModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const infoUserPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const deleteCardModalWindow = document.querySelector(".popup_type_delete-card");
const deleteCardConfirmButton = deleteCardModalWindow.querySelector(".popup__button_delete-card");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logoElement = document.querySelector(".header__logo");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const allPopups = document.querySelectorAll(".popup");

let cardToDelete = {
  id: null,
  element: null,
};

const setSubmitButtonText = (buttonElement, text) => {
  buttonElement.textContent = text;
};

const renderProfile = ({ name, about, avatar, _id }) => {
  currentUserId = _id;
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardId, cardElement) => {
  cardToDelete.id = cardId;
  cardToDelete.element = cardElement;
  openModalWindow(deleteCardModalWindow);
};

const handleLikeCard = (cardData, likeButton, likeCountElement) => {
  const likeRequest = isCardLiked(likeButton)
    ? deleteCardLike
    : addCardLike;

  likeRequest(cardData._id)
    .then((updatedCard) => {
      updateCardLike(likeButton, likeCountElement, updatedCard, currentUserId);
    })
    .catch((err) => {
      console.error(err);
    });
};

const renderCard = (cardData, renderMethod = "append") => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeCard,
    onDeleteCard: handleDeleteCard,
  });

  placesWrap[renderMethod](cardElement);
};

const getUniqueUsersCount = (cards) => {
  const userIds = new Set();

  cards.forEach((card) => {
    userIds.add(card.owner._id);
    card.likes.forEach((user) => {
      userIds.add(user._id);
    });
  });

  return userIds.size;
};

const getTotalLikes = (cards) =>
  cards.reduce((likesCount, card) => likesCount + card.likes.length, 0);

const getMostLikedCard = (cards) =>
  cards.reduce((mostLikedCard, card) => {
    if (!mostLikedCard || card.likes.length > mostLikedCard.likes.length) {
      return card;
    }

    return mostLikedCard;
  }, null);

const createInfoItem = (name, value) => {
  const itemElement = infoDefinitionTemplate
    .querySelector(".popup__info-item")
    .cloneNode(true);

  itemElement.querySelector(".popup__info-term").textContent = name;
  itemElement.querySelector(".popup__info-description").textContent = value;

  return itemElement;
};

const createPopularCardItem = (cardName) => {
  const itemElement = infoUserPreviewTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);

  itemElement.textContent = cardName;

  return itemElement;
};

const renderCardsInfo = (cards) => {
  const mostLikedCard = getMostLikedCard(cards);
  const maxLikesCount = mostLikedCard ? mostLikedCard.likes.length : 0;
  const championName = mostLikedCard && maxLikesCount > 0 ? mostLikedCard.owner.name : "Пока нет";
  const popularCards = cards
    .filter((card) => card.likes.length > 0)
    .sort((firstCard, secondCard) => secondCard.likes.length - firstCard.likes.length)
    .slice(0, 3);

  infoTitle.textContent = "Статистика карточек";
  infoSubtitle.textContent = "Популярные карточки:";
  infoList.replaceChildren(
    createInfoItem("Всего пользователей:", getUniqueUsersCount(cards)),
    createInfoItem("Всего лайков:", getTotalLikes(cards)),
    createInfoItem("Максимально лайков от одного:", maxLikesCount),
    createInfoItem("Чемпион лайков:", championName)
  );
  infoPopularCards.replaceChildren();

  if (popularCards.length === 0) {
    infoPopularCards.append(createPopularCardItem("Пока нет"));
    return;
  }

  popularCards.forEach((card) => {
    infoPopularCards.append(createPopularCardItem(card.name));
  });
};

const handleInfoModalOpen = () => {
  getCardList()
    .then((cards) => {
      renderCardsInfo(cards);
      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.error(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmitButtonText(profileSubmitButton, "Сохранение...");

  updateUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      renderProfile(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(profileSubmitButton, "Сохранить");
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  setSubmitButtonText(avatarSubmitButton, "Сохранение...");

  updateUserAvatar(avatarInput.value)
    .then((userData) => {
      renderProfile(userData);
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(avatarSubmitButton, "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  setSubmitButtonText(cardSubmitButton, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(cardSubmitButton, "Создать");
    });
};

const handleDeleteCardConfirm = () => {
  setSubmitButtonText(deleteCardConfirmButton, "Удаление...");
  deleteCardConfirmButton.disabled = true;

  deleteCardFromServer(cardToDelete.id)
    .then(() => {
      deleteCard(cardToDelete.element);
      closeModalWindow(deleteCardModalWindow);
      cardToDelete = { id: null, element: null };
    })
    .catch((err) => {
      console.error(err);
      setSubmitButtonText(deleteCardConfirmButton, "Да");
      deleteCardConfirmButton.disabled = false;
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleInfoModalOpen);

deleteCardConfirmButton.addEventListener("click", handleDeleteCardConfirm);

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    renderProfile(userData);
    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.error(err);
  });
