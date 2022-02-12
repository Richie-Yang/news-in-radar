const filterOptions = document.querySelector('#filter')
const countryTabs = document.querySelector('#country-tabs')
const searchFormButton = document.querySelector('#search-form button')


filterOptions.addEventListener('change', function onFilterOptionsClicked(event) {
  searchFormButton.click()
})

countryTabs.addEventListener('change', function onCountryTabsClicked(event) {
  searchFormButton.click()
})