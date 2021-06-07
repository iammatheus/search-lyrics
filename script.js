const form = document.querySelector("#form");
const sectionContainer = document.querySelector("section");
const prevAndNextContainer = document.querySelector(".prevAndNextContainer");
const searchInput = document.querySelector("#typeHere")

const apiUrl = "https://api.lyrics.ovh";
const corsUrl = "https://api.codetabs.com/v1/proxy?quest=";

const clearPrevAndNextContainer = () => {
  prevAndNextContainer.innerHTML = "";
};

const clearSearchInput = () => {
  searchInput.value = "";
  searchInput.focus();
};

const warningMessage = (message) => {
  sectionContainer.innerHTML = `<li class="warning-message">${message}</li>`;
};

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

const verifyPrevAndNextButtons = (prev, next) => {
  prevAndNextContainer.innerHTML = `
    ${prev ? `<p class="btnPrevNext" onClick="getMoreMusic('${prev}')">Anteriores</p>` : ""}
    ${next ? `<p class="btnPrevNext" onClick="getMoreMusic('${next}')">Próximas</p>` : ""}
  `;
};

const insertMusicIntoPage = async ({ data, prev, next }) => {
  clearSearchInput();

  sectionContainer.style.display = "flex";
  sectionContainer.innerHTML = await data.map((
    { artist:{ name }, album:{ cover_medium:img_album }, album:{title:title_album}, 
    title, preview }) => 
  `<div class="artist-container">  
    <aside>

      <header>
        <div class="album-container">
          <img src="${img_album}" alt="" class="album">
          <p>${title_album}</p>
        </div>
          <h1>${title}</h1>
          <p>${name}</p>  
      </header>

      <div class="previews-music" id="previews-music">
          <div class="bg-time">
            <div class="fill-time"></div>
          </div>
          <div class="play-pause">
            <i class="fas fa-play play" id="fas" data-audio="${preview}"></i>
          </div> 
          <p>Preview</p>
      </div>

      <audio id="audio"></audio>

      </aside>

      <button
        href="#top"
        class="btn view-lyrics" 
        data-artist="${name.replaceAll("/"," ")}" 
        data-title-music="${title.replaceAll(".","")}">
           Ver letra
      </button>

    </div>`).join("");
  if (prev || next) {
    verifyPrevAndNextButtons(prev, next);
    return;
  }
  clearPrevAndNextContainer();
};

const searchMusic = async (music) => {
  const data = await fetchData(`${apiUrl}/suggest/${music}`);
  insertMusicIntoPage(data);
};

const getMoreMusic = async (music) => {
  const data = await fetchData(`${corsUrl}${music}`);

  insertMusicIntoPage(data);
};

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = searchInput.value.trim().replaceAll("/"," ")

  if (!searchTerm) {
    warningMessage(
      "Por favor, preencha o campo acima ou insira um termo válido!"
    );
    clearPrevAndNextContainer();
    return;
  }
  searchMusic(searchTerm);
});

const searchLyrics = async (artist, titleMusic) => {
  const data = await fetchData(`${apiUrl}/v1/${artist}/${titleMusic}`);
  const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
  const artista = artist.replace("'", "");

  sectionContainer.innerHTML = `
    <div class="lyrics-container">
       <h2>
          ${titleMusic} - ${artist}
       </h2>
       <p class="lyrics">${lyrics}</p>
       <button class="btn btn-back" onClick="searchMusic('${artista}')">Voltar</button>
    </div>
  `;
};

function scrollTop(e){
  const id = e.getAttribute('href')
  const to = document.querySelector(id).offsetTop

  window.scroll({
     top: to,
     behavior: "smooth"
  })
}

sectionContainer.addEventListener("click", async e => {
  const clickedElement = e.target;

  if (clickedElement.tagName === "BUTTON" && clickedElement.classList.contains("view-lyrics")) {
    const artist = clickedElement.getAttribute("data-artist");
    const titleMusic = clickedElement.getAttribute("data-title-music");

    
    await searchLyrics(artist, titleMusic);
    scrollTop(clickedElement)
    clearPrevAndNextContainer();
  }
});

const playPauseMusic = async e => {
  const clickedElement = e.target;
  let audio = document.getElementById("audio")
  let music = clickedElement.getAttribute("data-audio")
  let fas = document.querySelectorAll("#fas")

  if(clickedElement.classList.contains("fas")) {
    audio.src = music
    
    for(let o = 0; o < fas.length; o++) {
      if(clickedElement.classList.contains("fa-pause")){
        for(let i = 0; i < fas.length; i++){
          fas[i].classList.add('fa-play')
          fas[i].classList.remove('fa-pause')
        }
        await audio.pause()
      }else if(clickedElement.classList.contains("fa-play")){
        clickedElement.classList.add('fa-pause')
        clickedElement.classList.remove('fa-play')
        await audio.play()
      }
    }
  }
}

sectionContainer.addEventListener("click", playPauseMusic);