const GITHUB_USERNAME = 'ramacoded'

const passwordSection = document.getElementById('password-section')
const mainSection = document.getElementById('main-section')
const sidebar = document.getElementById('sidebar')
const burgerMenu = document.getElementById('burger-menu')
const sidebarOverlay = document.getElementById('sidebar-overlay')
const userAvatar = document.getElementById('user-avatar')
const userModal = document.getElementById('user-modal')
const modalOverlay = document.getElementById('modal-overlay')
const closeModalButton = document.getElementById('close-modal-button')
const modalTogglePasswordBtn = document.getElementById('modal-toggle-password-btn')
const appLoader = document.getElementById('app-loader')

let numbersData = []
let appPassword = '' 

function showLoader(message = 'Loading...') { appLoader.querySelector('p').textContent = message; appLoader.style.display = 'flex' }
function hideLoader() { appLoader.style.display = 'none' }
function closeAllDropdowns(exceptThisOne = null) { document.querySelectorAll('.dropdown-content').forEach(d => { if (d !== exceptThisOne) d.style.display = 'none' }) }

function renderNumbers(data) {
  const numberList = document.getElementById('number-list')
  numberList.innerHTML = ''
  data.forEach((number, index) => {
    const li = document.createElement('li')
    const span = document.createElement('span'); span.className = 'number-text'; span.textContent = number
    const menuDiv = document.createElement('div'); menuDiv.className = 'actions-menu'
    const dotsButton = document.createElement('button'); dotsButton.className = 'dots-button'; dotsButton.innerHTML = '&#8942;'
    const dropdown = document.createElement('div'); dropdown.className = 'dropdown-content'
    const editButton = document.createElement('button'); editButton.textContent = 'Edit'; editButton.onclick = () => handleEdit(index)
    const deleteButton = document.createElement('button'); deleteButton.textContent = 'Delete'; deleteButton.onclick = () => handleDelete(index)
    dropdown.append(editButton, deleteButton); menuDiv.append(dotsButton, dropdown); li.append(span, menuDiv); numberList.append(li)
    dotsButton.addEventListener('click', (event) => {
      event.stopPropagation(); closeAllDropdowns(dropdown)
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'
    })
  })
}

async function fetchUserData() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
    if (response.ok) {
      const data = await response.json()
      userAvatar.src = data.avatar_url
    } else { console.error("Failed to fetch GitHub user data.") }
  } catch (error) { console.error("Error fetching user data:", error) }
}

async function loadNumbers() {
  showLoader('Fetching data...')
  try {
    const response = await fetch('/api/numbers')
    if (!response.ok) throw new Error('Failed to load database')
    const data = await response.json()
    numbersData = data
    renderNumbers(numbersData)
  } catch (error) {
    alert(error.message)
  } finally {
    hideLoader()
  }
}

async function saveNumbers() {
  showLoader('Saving data...')
  try {
    const response = await fetch('/api/numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numbersData)
    })
    if (!response.ok) throw new Error('Failed to save to database')
    renderNumbers(numbersData) 
  } catch (error) {
    alert(error.message)
    await loadNumbers()
  } finally {
    hideLoader()
  }
}

async function handleAdd() {
  const numberInput = document.getElementById('number-input')
  const rawValue = numberInput.value
  const cleanedNumber = rawValue.replace(/[\s+-]/g, '')

  if (!cleanedNumber) return
  if (!/^\d+$/.test(cleanedNumber)) {
    alert('Input must be numbers only. Symbols and letters are not allowed.')
    return
  }
  if (numbersData.includes(cleanedNumber)) {
    alert('Number already exists.')
    return
  }
  numbersData.push(cleanedNumber)
  numbersData.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  numberInput.value = ''
  await saveNumbers()
}

async function handleEdit(index) {
  const currentNumber = numbersData[index]
  const newNumberRaw = prompt('Enter the new value:', currentNumber)
  if (!newNumberRaw) return

  const newNumberClean = newNumberRaw.replace(/[\s+-]/g, '')
  if (!/^\d+$/.test(newNumberClean)) {
    alert('Input must be numbers only.')
    return
  }
  if (newNumberClean !== currentNumber) {
    numbersData[index] = newNumberClean
    numbersData.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    await saveNumbers()
  }
}

async function handleDelete(index) {
  if (confirm(`Are you sure you want to delete "${numbersData[index]}"?`)) {
    numbersData.splice(index, 1)
    await saveNumbers()
  }
}

function handleSearch() {
  const searchInput = document.getElementById('search-input')
  const query = searchInput.value.toLowerCase()
  renderNumbers(numbersData.filter(n => n.toLowerCase().includes(query)))
}

async function checkPassword(event) {
  event.preventDefault()
  const passwordInput = document.getElementById('password-input')
  const password = passwordInput.value

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (response.ok) {
      appPassword = password
      passwordSection.classList.remove('active')
      mainSection.classList.add('active')
      document.body.style.backgroundColor = 'var(--background-color)'
      await fetchUserData()
      await loadNumbers()
    } else {
      alert('Incorrect password.')
    }
  } catch (error) {
    alert('Failed to connect to server.')
  }
}

function toggleSidebar() {
  sidebar.classList.toggle('open')
  burgerMenu.classList.toggle('open')
  sidebarOverlay.classList.toggle('active')
}

function openUserModal() {
  document.getElementById('modal-username').textContent = GITHUB_USERNAME
  const passMask = document.getElementById('modal-password-mask')
  const passActual = document.getElementById('modal-password-actual')
  passActual.textContent = appPassword 
  passMask.style.display = 'block'
  passActual.style.display = 'none'
  modalTogglePasswordBtn.textContent = 'Tampilkan'
  modalOverlay.classList.add('active')
  userModal.classList.add('active')
  document.body.classList.add('modal-open')
}

function closeUserModal() {
  modalOverlay.classList.remove('active')
  userModal.classList.remove('active')
  document.body.classList.remove('modal-open')
}

function togglePassword() {
  const passMask = document.getElementById('modal-password-mask')
  const passActual = document.getElementById('modal-password-actual')
  const isMasked = passMask.style.display === 'block'

  passMask.style.display = isMasked ? 'none' : 'block'
  passActual.style.display = isMasked ? 'block' : 'none'
  modalTogglePasswordBtn.textContent = isMasked ? 'Sembunyikan' : 'Tampilkan'
}

document.getElementById('password-submit').addEventListener('click', checkPassword)
document.getElementById('password-input').addEventListener('keypress', (e) => e.key === 'Enter' && checkPassword(e))
document.getElementById('add-button').addEventListener('click', handleAdd)
document.getElementById('number-input').addEventListener('keypress', (e) => e.key === 'Enter' && handleAdd())
document.getElementById('search-input').addEventListener('input', handleSearch)
burgerMenu.addEventListener('click', toggleSidebar)
sidebarOverlay.addEventListener('click', toggleSidebar)
userAvatar.addEventListener('click', openUserModal)
modalOverlay.addEventListener('click', closeUserModal)
closeModalButton.addEventListener('click', closeUserModal)
modalTogglePasswordBtn.addEventListener('click', togglePassword)
document.addEventListener('click', () => closeAllDropdowns())