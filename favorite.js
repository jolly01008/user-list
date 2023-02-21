const BASE_URL = 'https://user-list.alphacamp.io'
const Index_URL = BASE_URL + '/api/v1/users/'

const dataPanel = document.querySelector("#data_panel")
const AllUsers = JSON.parse(localStorage.getItem('favorite'))
const addFavorite = document.querySelector('#add-favorite')

const searchForm = document.querySelector('#searchForm')
const searchInut = document.querySelector('#searchInput')
const searchBtn = document.querySelector('#searchBtn')

let filterUsers = []

const UsersData = filterUsers.length ? filterUsers : AllUsers

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
          <div class="card-footer text-end">
          <button class="btn btn-danger" id="remove-favorite" data-id=${item.id}> X </button>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}


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



function removeFromFavorite(id) {
  const userIndex = UsersData.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  UsersData.splice(Number(userIndex), 1)
  localStorage.setItem('favorite', JSON.stringify(AllUsers))
  alert('已從最愛清單中刪除該位使用者')
  renderAllUsers(getUsersByPage(1))
  renderPaginator(UsersData.length)
}


//=======點擊dataPanel子層的按鈕，監聽器綁定=======
dataPanel.addEventListener('click', function clickOneUser(event) {
  if (event.target.matches('.userImg')) {
    showUser(Number(event.target.dataset.id))
  } else if (event.target.matches('#remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))

  }
})

//=======點擊搜尋篩選使用者，並render篩選後的陣列使用者=======
searchForm.addEventListener('submit', function clickSearchBtn(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filterUsers = AllUsers.filter((user) =>
    user.name.trim().toLowerCase().includes(keyword) ||
    user.surname.trim().toLowerCase().includes(keyword)
  )

  if (filterUsers.length === 0) { return alert(`沒有符合${keyword}的使用者`) }

  renderAllUsers(getUsersByPage(1))
  renderPaginator(filterUsers.length)
})


const paginator = document.querySelector('#pagination')
const Per_Page_Users = 12

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

renderAllUsers(getUsersByPage(1))
renderPaginator(AllUsers.length)


