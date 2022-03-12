const adminTable = document.querySelector('#admin-table')

adminTable.addEventListener('submit', function onAdminTableSubmit(event) {
  if (event.target.classList.contains('delete-form')) {
    event.stopPropagation()
    event.preventDefault()

    const { name, id } = event.target.dataset

    if (confirm(`你確定要刪除 ${name}-${id} ?`)) {
      axios.post(event.target.action)
        .finally(() => window.location.reload(true))
    }
  }
})