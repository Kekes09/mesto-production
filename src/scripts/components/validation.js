const getErrorElement = (formElement, inputElement, config) =>
  formElement.querySelector(`.${inputElement.id}${config.errorSelector}`);

const getSubmitButton = (formElement, config) =>
  formElement.querySelector(config.submitButtonSelector);

const getInputList = (formElement, config) =>
  Array.from(formElement.querySelectorAll(config.inputSelector));

const showInputError = (formElement, inputElement, errorMessage, config) => {
  const errorElement = getErrorElement(formElement, inputElement, config);

  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
};

const hideInputError = (formElement, inputElement, config) => {
  const errorElement = getErrorElement(formElement, inputElement, config);

  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(config.errorClass);
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, config);
    return;
  }

  hideInputError(formElement, inputElement, config);
};

const hasInvalidInput = (inputList) =>
  inputList.some((inputElement) => !inputElement.validity.valid);

const disableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.add(config.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, config) => {
  buttonElement.classList.remove(config.inactiveButtonClass);
  buttonElement.disabled = false;
};

const toggleButtonState = (inputList, buttonElement, config) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, config);
    return;
  }

  enableSubmitButton(buttonElement, config);
};

const setEventListeners = (formElement, config) => {
  const inputList = getInputList(formElement, config);
  const buttonElement = getSubmitButton(formElement, config);

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

export const clearValidation = (formElement, config) => {
  const inputList = getInputList(formElement, config);
  const buttonElement = getSubmitButton(formElement, config);

  inputList.forEach((inputElement) => {
    inputElement.setCustomValidity("");
    hideInputError(formElement, inputElement, config);
  });

  disableSubmitButton(buttonElement, config);
};

export const enableValidation = (config) => {
  const formList = Array.from(document.querySelectorAll(config.formSelector));

  formList.forEach((formElement) => {
    setEventListeners(formElement, config);
  });
};
