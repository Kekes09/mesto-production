const apiConfig = {
  baseUrl: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "2989b5ef-1ce0-4465-ac5f-ad85ddbd6a8b",
    "Content-Type": "application/json",
  },
};

const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }

  return Promise.reject(`Ошибка: ${res.status}`);
};

const request = (endpoint, options = {}) =>
  fetch(`${apiConfig.baseUrl}${endpoint}`, {
    headers: apiConfig.headers,
    ...options,
  }).then(checkResponse);

export const getUserInfo = () => request("/users/me");

export const getCardList = () => request("/cards");

export const updateUserInfo = ({ name, about }) =>
  request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const updateUserAvatar = (avatar) =>
  request("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const addCard = ({ name, link }) =>
  request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const deleteCardFromServer = (cardId) =>
  request(`/cards/${cardId}`, {
    method: "DELETE",
  });

export const addCardLike = (cardId) =>
  request(`/cards/likes/${cardId}`, {
    method: "PUT",
  });

export const deleteCardLike = (cardId) =>
  request(`/cards/likes/${cardId}`, {
    method: "DELETE",
  });
