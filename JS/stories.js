"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function isFavoriteStory(storyId) {
  let isFavorite = false;
  let i = 0;
  while (i < currentUser.favorites.length && !isFavorite) {
    console.log(storyId === currentUser.favorites[0].storyId);
    if (currentUser.favorites[i].storyId === storyId) {
      isFavorite = true;
    }
    i++;
  }
  return isFavorite;
}

function toggleFavorite(e, storyId) {
  let isFavorite = e.target.classList.contains("bi-star-fill");
  if (!isFavorite) {
    e.target.classList.remove("bi-star");
    e.target.classList.add("bi-star-fill");
    handleAddFavorite(e, storyId);
  } else {
    e.target.classList.remove("bi-star-fill");
    e.target.classList.add("bi-star");
    handleRemoveFavorite(e, storyId);
  }
}

async function handleAddFavorite(e, storyId) {
  e.preventDefault();
  let token = localStorage.getItem("token");
  await User.addFavorite(token, currentUser.username, storyId);
  currentUser = await User.getUser(token, currentUser.username);
  console.log(currentUser);
  /*e.target.onclick = async (event) => {
    
  };*/
}

async function handleRemoveFavorite(e, storyId) {
  e.preventDefault();
  let token = localStorage.getItem("token");
  await User.removeFavorite(token, currentUser.username, storyId);
  currentUser = await User.getUser(token, currentUser.username);
}

async function handleDeleteStory(e, storyId) {
  e.preventDefault();
  let token = localStorage.getItem("token");
  await User.deleteStory(token, storyId);
  currentUser = await User.getUser(token, currentUser.username);
  e.target.parentNode.parentNode.remove();
}

function generateStoryMarkup(story) {
  let isFavorite = isFavoriteStory(story.storyId);

  const hostName = story.getHostName();

  var storyElement = document.createElement("li");
  storyElement.setAttribute("id", story.storyId);
  storyElement.insertAdjacentHTML(
    "afterbegin",
    `<a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>`
  );

  let starElement = document.createElement("div");
  let starIconElement = isFavorite
    ? `<i class="bi bi-star-fill"></i>`
    : `<i class="bi bi-star">`;
  starElement.insertAdjacentHTML("afterbegin", starIconElement);

  //console.log(currentUser)
  starElement.onclick = (e) => toggleFavorite(e, story.storyId);

  storyElement.appendChild(starElement);
  let trashCanElement = document.createElement("div");
  let trashCanIcon = `<i class="bi bi-trash3"></i>`;
  trashCanElement.insertAdjacentHTML("afterbegin", trashCanIcon);
  storyElement.appendChild(trashCanElement);
  trashCanElement.onclick = (e) => {
    handleDeleteStory(e, story.storyId);
  };

  return storyElement;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function updateLists() {
  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $createdStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  for (let favoriteStory of currentUser.favorites) {
    const $favoriteStory = generateStoryMarkup(favoriteStory);
    $favoriteStoriesList.append($favoriteStory);
  }

  for (let createdStory of currentUser.ownStories) {
    const $createdStory = generateStoryMarkup(createdStory);
    $createdStoriesList.append($createdStory);
  }
}

document.getElementById("user-lists").onclick = (e) => {
  updateLists();
};

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $createdStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  updateLists();
  $allStoriesList.show();
  $favoriteStoriesList.hide();
  $createdStoriesList.hide();

  let selectedList = document.getElementById("user-lists");
  selectedList.onchange = (e) => {
    if (e.target.value === "All") {
      $allStoriesList.show();
      $favoriteStoriesList.hide();
      $createdStoriesList.hide();
    } else if (e.target.value === "Favorites") {
      $favoriteStoriesList.show();
      $allStoriesList.hide();
      $createdStoriesList.hide();
    } else {
      $createdStoriesList.show();
      $allStoriesList.hide();
      $favoriteStoriesList.hide();
    }
  };
}

async function newStorySubmit(evt) {
  console.debug("newStorySubmit");
  evt.preventDefault();
  const title = $("#newStoryTitle").val();
  const author = $("#newStoryAuthor").val();
  const url = $("#newStoryURL").val();
  const userName = currentUser.username;

  let newStoryInfo = { title, author, url, userName };

  const addedStory = await storyList.addStory(currentUser, newStoryInfo);

  const addedStoryDisplay = generateStoryMarkup(addedStory);
  $allStoriesList.prepend(addedStoryDisplay);

  $navSubmitNewStoryForm.hide();
  $navSubmitNewStoryForm.trigger("reset");
  putStoriesOnPage();
}

$navSubmitNewStoryForm.on("submit", newStorySubmit);
