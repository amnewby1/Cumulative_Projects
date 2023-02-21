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

function test(e) {
  console.log(e.target);
}

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  console.log(currentUser);
  let i = 0;
  let isFavorite = false;
  while (i < currentUser.favorites && !isFavorite) {
    if (currentUser.favorites[i].storyId === story.storyId) {
      isFavorite = true;
    }
    i++;
  }

  const hostName = story.getHostName();
  console.log(story.storyId);
  if (!isFavorite) {
    return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <div onclick="test(this)")><i class="bi bi-star"></i></div>
      </li>
    `);
  }
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        //add full star
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
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
