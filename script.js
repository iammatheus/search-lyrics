const form = document.querySelector("#form");
const sectionContainer = document.querySelector("section");
const prevAndNextContainer = document.querySelector(".prevAndNextContainer");
const searchInput = document.querySelector("#typeHere")
const duration = 30

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

  sectionContainer.innerHTML = await data.map((
    { artist:{ name }, album:{ cover_medium:img_album }, album:{title:title_album}, title, preview }) => 
  `<div class="artist-container">  
    <aside>

      <header>
        <div class="album-container">
          <img src="${img_album}" alt="${title_album}" class="album">
          <p>${title_album}</p>
        </div>
          <h1>${title}</h1>
          <p>${name}</p>  
      </header>

      <div class="previews-music" id="previews-music">
          <div class="bg-time" id="bg-time">
            <div class="fill-time" id="fill-time"></div>
          </div>
          <div class="play-pause">
            <i class="fas fa-play" id="fas" data-audio="${corsUrl}${preview}"></i>
          </div> 
          <p>Preview</p>
      </div>

      <audio id="audio" src="${corsUrl}${preview}"></audio>
        
      </aside>

      <button
        href="#top"
        class="btn view-lyrics" 
        data-artist="${name.replaceAll("/"," ")}" 
        data-title-music="${title.replaceAll(".","")}">
           Ver letra
      </button>

    </div>`).join("");

  /* Código "for" necessário para que ao setar o tempo da música o 
     progresso da barra e a música não voltem para o início */
  var fasClass = document.querySelectorAll('#fas')
  var progress = document.querySelectorAll("#fill-time")

  for(let i = 0; i < 15; i++){
    fasClass[i].classList.add(i)
    progress[i].classList.add(i)
  }

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

  if(!searchTerm) {
    warningMessage(
      "Por favor, preencha o campo acima ou insira um termo válido!"
    );
    clearPrevAndNextContainer();
    clearSearchInput()
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

async function getAndShowLyrics(e){
  const clickedElement = e.target;

  if (clickedElement.tagName === "BUTTON") {
    const artist = clickedElement.getAttribute("data-artist");
    const titleMusic = clickedElement.getAttribute("data-title-music");

    await searchLyrics(artist, titleMusic);
    scrollTop(clickedElement)
    clearPrevAndNextContainer();
  }
}
sectionContainer.addEventListener("click", getAndShowLyrics);

function updateProgress(e){
  const {currentTime} = e.srcElement
  const fas = document.querySelectorAll("#fas")
  const audio = document.querySelectorAll("#audio")
  const fillProgress = document.querySelectorAll("#fill-time")

  const progressPercent = (currentTime / duration) * 100

  for(let i = 0; i < audio.length; i++) {
    audio[i].classList.add(i)
    if(e.target.classList.contains(i)){
      fillProgress[i].style.width = `${progressPercent}%`
    }
    if(audio[i].ended && progressPercent >= 99.5){
      fas[i].classList.add('fa-play')
      fas[i].classList.remove('fa-pause')
    }
  }
}

function setProgress(e) {
  const audio = document.querySelectorAll("#audio")
  const progressContainer = document.querySelectorAll('#bg-time')
  
  const width = this.clientWidth
  const clickX = e.offsetX
  const currentTime = (clickX / width) * duration

  for(let i = 0; i < 15; i++){
    progressContainer[i].classList.add(i)
    if(e.target.classList.contains(i)){
      audio[i].currentTime = currentTime
    }
  }
}

const playPauseMusic = async e => {
  const clickedElement = e.target;
  const music = clickedElement.getAttribute("data-audio")
  const fas = document.querySelectorAll("#fas")
  const audio = document.querySelectorAll("#audio")
  const progressContainer = document.querySelectorAll('#bg-time')
  
  if(clickedElement.classList.contains("fas")) {
    for(let o = 0; o < fas.length; o++) {
      audio[o].pause()

      if(clickedElement.classList.contains("fa-pause") && audio[o].src == music){
        for(let i = 0; i < fas.length; i++){
          fas[i].classList.add('fa-play')
          fas[i].classList.remove('fa-pause')
        }
        audio[o].src = audio[o].src 

        await audio[o].pause()
        
      }else if(clickedElement.classList.contains("fa-play") && audio[o].src == music){
        for(let i = 0; i < fas.length; i++){
          fas[i].classList.add('fa-play')
          fas[i].classList.remove('fa-pause')
        }
        audio[o].src = audio[o].src 

        clickedElement.classList.add('fa-pause')
        clickedElement.classList.remove('fa-play')

        audio[o].addEventListener('play', e => {
          audioPlay = e.target
          audioPlay.addEventListener('timeupdate', updateProgress)
        })
        progressContainer[o].addEventListener('click', setProgress)
        await audio[o].play()
      }
    }
  }
}
sectionContainer.addEventListener("click", playPauseMusic);

function scrollTop(e){
  const id = e.getAttribute('href')
  const to = document.querySelector(id).offsetTop

  window.scroll({
     top: to,
     behavior: "smooth"
  })
}