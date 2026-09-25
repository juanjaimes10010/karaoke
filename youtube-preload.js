const { ipcRenderer } = require("electron");

function getVideoLink(event) {
  const path = event.composedPath();
  const anchor = path.find((node) => node?.tagName === "A" && node.href);

  if (!anchor) {
    return null;
  }

  try {
    const url = new URL(anchor.href);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId = null;

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      videoId = url.searchParams.get("v");

      if (!videoId) {
        videoId = url.pathname.match(/^\/(?:shorts|live|embed)\/([^/?#]+)/)?.[1];
      }
    } else if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0];
    }

    if (!videoId) {
      return null;
    }

    const titleNode = path.find(
      (node) =>
        node?.nodeType === 1 &&
        (node.id === "video-title" || node.id === "video-title-link")
    );
    const title =
      titleNode?.getAttribute("title")?.trim() ||
      titleNode?.textContent?.trim() ||
      anchor.getAttribute("title")?.trim() ||
      anchor.getAttribute("aria-label")?.trim() ||
      "";

    return {
      url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      title,
    };
  } catch {
    return null;
  }
}

function addVideoFromLink(event) {
  const video = getVideoLink(event);

  if (!video) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  ipcRenderer.send("youtube-video-add-request", video);
}

document.addEventListener(
  "click",
  (event) => {
    if (event.button === 0) {
      addVideoFromLink(event);
    }
  },
  true
);

document.addEventListener("contextmenu", addVideoFromLink, true);
