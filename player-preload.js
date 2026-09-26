const playerCss = `
  html, body, ytd-app, ytd-watch-flexy,
  #columns, #primary, #player-container-outer,
  #player-container-inner, #player, #movie_player,
  .html5-video-container {
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  html, body, ytd-app, ytd-watch-flexy {
    overflow: hidden !important;
    background: #000 !important;
  }
  #masthead-container, #secondary, #below,
  #comments, ytd-mini-guide-renderer, ytd-watch-metadata {
    display: none !important;
  }
  #player-container-outer, #player-container-inner,
  #player, #movie_player {
    position: fixed !important;
    inset: 0 !important;
    z-index: 999999 !important;
  }
  .html5-video-container video {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
  }
`;

if (window.location.pathname === "/watch") {
  const style = document.createElement("style");
  style.id = "fullscreen-youtube-player-styles";
  style.textContent = playerCss;
  const addStyles = () => {
    const target = document.head || document.documentElement;
    if (!target) return false;
    target.prepend(style);
    return true;
  };

  if (!addStyles()) {
    const observer = new MutationObserver(() => {
      if (addStyles()) observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  }
}
