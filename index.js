const BASE_URL = 'https://user-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector("#data_panel")
const AllUsers = []
let filterUsers = []
const addFavorite = document.querySelector('#add-favorite')
const Per_Page_Users = 12
const searchForm = document.querySelector('#searchForm')
const searchInut = document.querySelector('#searchInput')
const searchBtn = document.querySelector('#searchBtn')
const paginator = document.querySelector('#pagination')

const list = JSON.parse(localStorage.getItem('favorite')) || []


//=======render所有users在頁面上的函式=======
function renderAllUsers(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="card col-2 m-2 p-0" style="width: 300px">
        <img src="${item.avatar}" class="userImg"
         data-id=${item.id} data-bs-toggle="modal" data-bs-target="#user-modal">
          <div class="card-body">
            <h5 class="card-title">${item.name} ${item.surname}</h5>
          </div>
          <div class="card-footer">
          <div class="btn-heart text-end" > 
            <i class="${list.some((user) => user.id === item.id) ? "fa-solid text-danger" : "fa-solid"}
             fa-heart fa-2x" 
            id="add-favorite" data-id=${item.id}></i>  
          </div>
        </div>
         
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//======API串接資料，執行renderAllUsers函式render所有使用者======
axios.get(Index_URL).then((response) => {
  for (let user of response.data.results) { AllUsers.push(user) }
  renderPaginator(AllUsers.length)
  renderAllUsers(getUsersByPage(1))
})

//=======秀出使用者詳細資料，抓取user id，並動態更新到Modal的函式=======
function showUser(id) {
  const modalName = document.querySelector('#user-modal-name')
  const modalImg = document.querySelector('#user-modal-img')
  const modalDescription = document.querySelector('#user-modal-description')

  modalName.innerHTML = null
  modalImg.innerHTML = null
  modalDescription.innerHTML = null

  axios.get(Index_URL + id).then((response) => {
    const userData = response.data

    modalName.innerHTML = (userData.name)
    modalImg.innerHTML = `<img src='${userData.avatar}'>`
    modalDescription.innerHTML = `
      <p> email: ${userData.email} </p>
      <p> genger: ${userData.gender} </p>
      <p> age: ${userData.age} </p>
      <p> region: ${userData.region} </p>
      <p> birthday: ${userData.birthday} </p>
    `
  })
}

//=======把使用者存到localStorage、增加到收藏清單的函式=======
function addFavoriteList(id) {

  let favoriteUser = AllUsers.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    let index = list.findIndex((user) => user.id === id)
    list.splice(index, 1)
    localStorage.setItem("favorite", JSON.stringify(list))
    return
  }
  list.push(favoriteUser)
  localStorage.setItem('favorite', JSON.stringify(list))

}

//=======點擊dataPanel子層的按鈕，監聽器綁定=======
dataPanel.addEventListener('click', function clickOneUser(event) {
  if (event.target.matches('.userImg')) {
    showUser(Number(event.target.dataset.id))
  } else if (event.target.matches('#add-favorite')) {
    event.target.classList.toggle('text-danger')
    addFavoriteList(Number(event.target.dataset.id))
  }
})

//=======點擊搜尋篩選使用者，並render篩選後的使用者=======
searchForm.addEventListener('submit', function clickSearchBtn(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filterUsers = AllUsers.filter((user) =>
    user.name.trim().toLowerCase().includes(keyword) ||
    user.surname.trim().toLowerCase().includes(keyword)
  )

  if (filterUsers.length === 0) { return alert(`沒有符合${keyword}的使用者`) }

  renderPaginator(filterUsers.length)
  renderAllUsers(getUsersByPage(1))
})

//=======JS動態render出有幾個分頁=======
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / Per_Page_Users)

  let rawHTML = ''
  for (page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page=${page} href="#">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//=======render該頁的使用者的函式=======
function getUsersByPage(page) {
  const UsersData = filterUsers.length ? filterUsers : AllUsers
  const startPage = (page - 1) * Per_Page_Users
  return UsersData.slice(startPage, startPage + Per_Page_Users)
}

//=======點擊分頁器，render該頁使用者的監聽器=======
paginator.addEventListener('click', function clickPageBtn(event) {
  if (event.target.tagName !== 'A') { return }
  renderAllUsers(getUsersByPage(event.target.dataset.page))
})