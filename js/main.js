import deviceInfo from './deviceInfo.js'
import {GalaxyDB} from './database.js'
import shaderLoader from './shaderLoader.js'
import setupUI from './controllers/setupControlls.js'
import initAtlas from './visualization/initAtlas.js'

const display = document.getElementById('WebGL-Output')
const loadingScreen = document.getElementById('loading-screen')
const status = document.getElementById('loading-screen__status')
const galaxyDB = new GalaxyDB()

export default async function init() {
  //check device compatibility
  status.innerHTML = 'Checking device compatibility'
  deviceInfo()
  //load data
  status.innerHTML = 'Loading stellar data'
  await galaxyDB.parseData()
  //database = parseData(database)
  status.innerHTML = 'Igniting star cores'
  //shaderLoader().then(shaders => console.log(shaders))
  status.innerHTML = 'Forging galaxies'
  new initAtlas()

  setupUI()

  // render()
  status.innerHTML = 'Welcome to skyAtlas'
  loadingScreen.classList.toggle('loading-screen--hidden')
}

document.addEventListener('DOMContentLoaded', init())