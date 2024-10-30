const maxRepositoriesCount = 5;
const responsePeriod = 6_000;

const input = document.querySelector(".input");
const loadingImage = document.querySelector(".loading__image");
const foundRepositoriesButtons = document.querySelectorAll(
  ".found-repositories__add-button"
);
const savedRepositoriesDiv = document.querySelector(".saved-repositories");

const repositoriesInfo = [];

const debounce = (callback, debounceTime) => {
  let timeout;

  return function () {
    const callbackCall = () => {
      callback.apply(this, arguments);
      clearTimeout(timeout);
      timeout = null;
      loadingImage.classList.add("hidden");
    };

    if (!timeout) {
      timeout = setTimeout(callbackCall, debounceTime);
      loadingImage.classList.remove("hidden");
    }
  };
};

const debouncedResponse = debounce(() => {
  const queryString = "q=" + encodeURIComponent(input.value);
  const answer = fetch(
    `https://api.github.com/search/repositories?${queryString}`
  ).then((response) => response.json());

  answer
    .then((post) => {
      for (let i = 0; i < maxRepositoriesCount; i++) {
        foundRepositoriesButtons[i].classList.add("hidden");
        foundRepositoriesButtons[i].textContent = "";
      }

      let count = 0;
      post.items.forEach((item, index) => {
        if (count < maxRepositoriesCount) {
          foundRepositoriesButtons[index].classList.remove("hidden");
          foundRepositoriesButtons[index].textContent = item.name;
          repositoriesInfo[index] = {
            name: item.name,
            owner: item.owner.login,
            stars: item.stargazers_count,
          };
        }
        count++;
      });
    })
    .catch((err) => console.log(err));
}, responsePeriod);

//autocomplete
input.addEventListener("input", () => {
  if (input.value.length === 0) {
    for (let i = 0; i < maxRepositoriesCount; i++) {
      foundRepositoriesButtons[i].classList.add("hidden");
      foundRepositoriesButtons[i].textContent = "";
    }
    return;
  }

  debouncedResponse();
});

//add repository

foundRepositoriesButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const savedRepository = document.createElement("div");
    const repositoryText = document.createElement("p");

    savedRepository.classList.add("saved-repositories__repository");
    repositoryText.classList.add("saved-repositories__text");

    repositoryText.innerHTML += `
      Name: ${repositoriesInfo[index].name}<br>
      Owner: ${repositoriesInfo[index].owner}<br>
      Stars: ${repositoriesInfo[index].stars}
    `;

    savedRepository.appendChild(repositoryText);
    createCloseButton(savedRepository);
    savedRepositoriesDiv.appendChild(savedRepository);

    button.classList.add("hidden");
    button.textContent = "";
  });
});

const createCloseButton = (parentDiv) => {
    const removeButton = document.createElement('button');
    const removeButtonImage = document.createElement('img');

    removeButton.classList.add('saved-repositories__remove-button');
    removeButtonImage.classList.add('remove-button__image');

    removeButtonImage.src = "src/close.svg";
    removeButtonImage.alt = "close";

    removeButton.appendChild(removeButtonImage);

    removeButton.addEventListener('click', () => {
        parentDiv.remove();
    });

    parentDiv.appendChild(removeButton);

    return removeButton;
}
