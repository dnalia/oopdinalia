//input current country
function findBorderingCountries() {
    const currentCountry = document.getElementById("current_location").value.trim()
    if (!currentCountry) {
        displayError("Please enter a country name to find nearby countries.")
        return;
    }
    const countryResultsDiv = document.getElementById("country_results")
    countryResultsDiv.innerHTML = ''

    //fetch the country data by name
    fetch(`https://restcountries.com/v3.1/name/${currentCountry}`)
        .then(response => {
            if (!response.ok) throw new Error('Country not found')
            return response.json()
        })
        .then(data => {
            const country = data[0]
            const borderingCodes = country.borders
            if (!borderingCodes || borderingCodes.length == 0) {
                displayError("No neighboring countries found for this country.")
                return
            }
            fetch(`https://restcountries.com/v3.1/alpha?codes=${borderingCodes.join(",")}`)
                .then(response => response.json())
                .then(borderingCountries => {
                    displayBorderingCountries(borderingCountries.slice(0,20))
                })
                .catch(err => displayError("Could not fetch neighboring country data."))
        })
        .catch(err => displayError(err.message))
}

//display nearby country (border)
function displayBorderingCountries(countries) {
    const countryResultsDiv = document.getElementById("country_results")
    
    countries.forEach(country => {
        const countryCard = document.createElement("div")
        countryCard.className = "country-card"
        countryCard.innerHTML = `
            <h4>${country.name.common}</h4>
            <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : ''}</p>
            <p><strong>Language(s) Spoken:</strong> ${country.languages ? Object.values(country.languages).join(", ") : ''}</p>
            <p><strong>Currency:</strong> ${country.currencies ? Object.values(country.currencies)[0].name : ''}</p><br>
            <a href="itinerary.html?country=${encodeURIComponent(country.name.common)}" class="explore-btn">Explore Now!</a><br>
        `
        countryResultsDiv.appendChild(countryCard);
    })
}

//error message
function displayError(message) {
    const countryResultsDiv = document.getElementById("country_results");
    countryResultsDiv.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
}

//fetch country data if specified
document.addEventListener("DOMContentLoaded", function() {
    getCountryData()
})

//country to explore
function getCountryData() {
    const urlParams = new URLSearchParams(window.location.search)
    const countryName = urlParams.get('country')

    if (countryName) {
        fetch(`https://restcountries.com/v3.1/name/${countryName}`)
            .then(response => {
                if (!response.ok) throw new Error('Country not found')
                return response.json()
            })
            .then(data => {
                const country = data[0]
                console.log(data)

                //display country information
                document.getElementById("country-name").innerText = country.name.common
                document.getElementById("flag").src = country.flags.png
                document.getElementById("coatOfArms").src = country.coatOfArms.png || ""
                document.getElementById("area").innerText = country.area || ''
                document.getElementById("continent").innerText = country.region || ''
                document.getElementById("region").innerText = country.subregion || ''
                document.getElementById("capital").innerText = country.capital ? country.capital[0] : ''
                document.getElementById("languages").innerText = country.languages ? Object.values(country.languages).join(", ") : ''
                document.getElementById("timeZone").innerText = country.timezones ? country.timezones[0] : ''
                document.getElementById("latitude").innerText = country.latlng ? country.latlng[0] : ''
                document.getElementById("longitude").innerText = country.latlng ? country.latlng[1] : ''
                document.getElementById("population").innerText = country.population || ''
                
                const currencyInfo = country.currencies ? Object.values(country.currencies) : []
                document.getElementById("currencies").textContent = currencyInfo.length > 0 ? `${currencyInfo[0].symbol}, ${currencyInfo[0].name}` : ''
                //map source
                if (country.latlng && country.latlng.length >= 2) {
                    const lat = country.latlng[0]
                    const lng = country.latlng[1]
                    document.getElementById("map").src = `https://maps.google.com/maps?q=${lat},${lng}&hl=es;z=14&output=embed`
                } else {
                    console.error("Latitude and Longitude are not available.")
                }
            })
            .catch(err => console.error("Could not fetch country data:", err))
    } else {
        console.error("No country name specified in the URL.")
    }
}

//itineraries from localStorage when the page loads
window.onload = function () {
    //clear the fields and buttons initially
    document.getElementById('readFileContents').value = ''
    document.getElementById('currentFileName').textContent = ''
    document.getElementById('currentFileName').style.display = 'none'
    document.getElementById('btnUpdate').style.display = 'none'
    document.getElementById('btnEdit').style.display = 'none'

    //itineraries from localStorage and populate the list
    const storedFiles = JSON.parse(localStorage.getItem('itineraries')) || []
    storedFiles.forEach(itinerary => addFileToList(itinerary.name, itinerary.contents, itinerary.date))
}

//create a new itinerary
document.getElementById('btnCreate').addEventListener('click', function() {
    const fileName = document.getElementById('fileName').value.trim()
    let fileContents = document.getElementById('fileContents').value.trim()
    const itineraryDate = document.getElementById('itineraryDate').value

    if (!fileName) {
        alert('Please enter a valid itinerary name.')
        return;
    }
    const urlParams = new URLSearchParams(window.location.search)
    const countryName = urlParams.get('country')

    if (!countryName) {
        alert("No country specified. Please go back and select a country.")
        return
    }
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => {
            if (!response.ok) throw new Error('Country not found')
            return response.json()
        })
        .then(data => {
            const country = data[0]
            const currency = country.currencies ? Object.values(country.currencies)[0].name : ''
            const language = country.languages ? Object.values(country.languages).join(", ") : ''
            const drivingSide = country.car ? country.car.side : ''

            //prepare default contents
            let defaultContents = `Country-specific info:\n` +
                `- Do remember to change your money to ${currency}.\n` +
                `- Do remember to learn new phrases in ${language}.\n` +
                `- Be prepared to drive on the ${drivingSide} side.\n\n` +
                `Itinerary:\n${fileContents || 'No additional input provided by user.'}\n`

            //save to localStorage
            const itineraries = JSON.parse(localStorage.getItem('itineraries')) || []
            itineraries.push({ name: fileName, contents: defaultContents, date: itineraryDate })
            localStorage.setItem('itineraries', JSON.stringify(itineraries))
            alert('Itinerary successfully created with default country information and date!')
            addFileToList(fileName, defaultContents, itineraryDate)

            //clear inputs
            document.getElementById('fileName').value = ''
            document.getElementById('fileContents').value = ''
            document.getElementById('itineraryDate').value = ''
        })
        .catch(error => alert(`Error fetching country data: ${error.message}`))
})

//add a file to the list
function addFileToList(fileName, fileContents, fileDate) {
    const li = document.createElement('li')
    li.textContent = `${fileName} (${fileDate || 'No date provided'})`

    const readBtn = document.createElement('button')
    readBtn.textContent = 'Read'
    readBtn.className = 'btn'
    readBtn.onclick = function () {
        document.getElementById('currentFileName').textContent = fileName;
        document.getElementById('currentFileName').style.display = 'block'
        document.getElementById('readFileName').value = fileName
        document.getElementById('readFileContents').value = fileContents;
        document.getElementById('readFileContents').style.display = 'block'
        document.getElementById('btnUpdate').style.display = 'inline'
        document.getElementById('btnEdit').style.display = 'inline'
        document.getElementById('readFileContents').readOnly = true

        document.getElementById('itineraryDate').value = fileDate || ''
    };

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.className = 'btn'
    deleteBtn.onclick = function () {
        if (confirm('Are you sure you want to delete this itinerary?')) {
            const itineraries = JSON.parse(localStorage.getItem('itineraries')) || []
            const updatedItineraries = itineraries.filter(itinerary => itinerary.name !== fileName)
            localStorage.setItem('itineraries', JSON.stringify(updatedItineraries))
            li.remove()
        }
    }
    li.appendChild(readBtn);
    li.appendChild(deleteBtn);
    document.getElementById('fileList').appendChild(li)
}

//update itinerary button
document.getElementById('btnUpdate').addEventListener('click', function () {
    const updatedContents = document.getElementById('readFileContents').value
    const fileName = document.getElementById('readFileName').value
    const updatedDate = document.getElementById('itineraryDate').value

    const itineraries = JSON.parse(localStorage.getItem('itineraries')) || []
    const updatedItineraries = itineraries.map(itinerary => {
        if (itinerary.name === fileName) {
            itinerary.contents = updatedContents
            itinerary.date = updatedDate
            alert(`File "${fileName}" has been updated successfully!`)
        }
        return itinerary
    })
    localStorage.setItem('itineraries', JSON.stringify(updatedItineraries))
    document.getElementById('readFileContents').readOnly = true
})

//edit itinerary button
document.getElementById('btnEdit').addEventListener('click', function () {
    document.getElementById('readFileContents').readOnly = false
    document.getElementById('itineraryDate').removeAttribute('disabled') 
})

//open new tab to explore phrases
function explorePhrases() {
    var language = document.getElementById("languageInput").value.trim().toLowerCase()
    if (language) {
        var url = "https://www.omniglot.com/language/phrases/" + language + ".php"
        window.open(url, "_blank"); // Open the URL in a new tab
    } else {
        alert("Please enter a language.")
    }
}

//open new tab to explore food
function exploreFood() {
    var countryFood = document.getElementById("countryInput").value.trim().toLowerCase()
    if (countryFood) {
        var url = "https://www.tasteatlas.com/best-rated-dishes-in-" + countryFood
        window.open(url, "_blank")
    } else {
        alert("Please enter a country name.")
    }
}