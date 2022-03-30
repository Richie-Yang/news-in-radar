const sentButton = document.querySelector('#sent-button')

sentButton.addEventListener('click', function onSentButtonClicked (event) {
  event.preventDefault()
  event.stopPropagation()
  axios.get('/verify?status=email_sent')
    .finally(res => {
      window.location.reload()
    })
})