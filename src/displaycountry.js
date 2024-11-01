function handleExplore() {
    const searchType = document.getElementById("search_type").value;
    const searchInputDiv = document.getElementById("search_input");
    searchInputDiv.innerHTML = ''; // Clear previous inputs

    let inputHtml = '';

    if (searchType === "country") {
        inputHtml = '<label for="country_input">Enter Country Name:</label><input type="text" id="country_input" placeholder="e.g., Malaysia">';
    } else if (searchType === "continent") {
        inputHtml = '<label for="continent_input">Enter Continent:</label><input type="text" id="continent_input" placeholder="e.g., Asia">';
    } else if (searchType === "region") {
        inputHtml = '<label for="region_input">Enter Region:</label><input type="text" id="region_input" placeholder="e.g., South America">';
    } else if (searchType === "subregion") {
        inputHtml = '<label for="subregion_input">Enter Subregion:</label><input type="text" id="subregion_input" placeholder="e.g., Southeast Asia">';
    }

    searchInputDiv.innerHTML = inputHtml;
}

function buttonClicked() {
    const currentLocation = document.getElementById("current_location").value;
    const searchType = document.getElementById("search_type").value;
    let searchValue = "";

    // Clear previous results
    const countryResultsDiv = document.getElementById("country_results");
    countryResultsDiv.innerHTML = '';

    if (searchType === "country") {
        searchValue = document.getElementById("country_input").value;
        fetch(`https://restcountries.com/v3.1/name/${searchValue}`)
            .then(response => {
                if (!response.ok) throw new Error('Country not found');
                return response.json();
            })
            .then(data => displayData(data[0], currentLocation))
            .catch(err => displayError(err.message));
    } else if (searchType === "continent") {
        searchValue = document.getElementById("continent_input").value;
        fetch(`https://restcountries.com/v3.1/region/${searchValue}`)
            .then(response => {
                if (!response.ok) throw new Error('No countries found in this continent');
                return response.json();
            })
            .then(data => {
                displayCountries(data, searchValue);
            })
            .catch(err => displayError(err.message));
    } else if (searchType === "region") {
        searchValue = document.getElementById("region_input").value;
        fetch(`https://restcountries.com/v3.1/region/${searchValue}`)
            .then(response => {
                if (!response.ok) throw new Error('No countries found in this region');
                return response.json();
            })
            .then(data => {
                displayCountries(data, searchValue);
            })
            .catch(err => displayError(err.message));
    } else if (searchType === "subregion") {
        searchValue = document.getElementById("subregion_input").value;
        fetch(`https://restcountries.com/v3.1/subregion/${searchValue}`)
            .then(response => {
                if (!response.ok) throw new Error('No countries found in this subregion');
                return response.json();
            })
            .then(data => {
                displayCountries(data, searchValue);
            })
            .catch(err => displayError(err.message));
    }
}

function displayData(data, currentLocation) {
    const countryResultsDiv = document.getElementById("country_results");
    countryResultsDiv.innerHTML = `
        <h3>Country Details:</h3>
        <p><strong>Name:</strong> ${data.name.common}</p>
        <p><strong>Capital:</strong> ${data.capital ? data.capital[0] : 'N/A'}</p>
        <p><strong>Region:</strong> ${data.region}</p>
        <p><strong>Subregion:</strong> ${data.subregion}</p>
        <p><strong>Area:</strong> ${data.area} km²</p>
        <p><strong>Population:</strong> ${data.population}</p>
        <p><strong>Languages:</strong> ${Object.values(data.languages).join(", ")}</p>
        <p><strong>Timezones:</strong> ${data.timezones.join(", ")}</p>
        <img src="${data.flags.png}" alt="Flag of ${data.name.common}" style="width: 100px;">
        <p><strong>Current Location:</strong> ${currentLocation}</p>
    `;
}

function displayCountries(countries, searchValue) {
    const countryResultsDiv = document.getElementById("country_results");
    const heading = document.createElement("h3");
    heading.textContent = `Countries in ${searchValue}:`;
    countryResultsDiv.appendChild(heading);

    // Limit to the first 5 countries
    const limitedCountries = countries.slice(0, 30);

    limitedCountries.forEach(country => {
        const countryCard = document.createElement("div");
        countryCard.className = "country-card";

        countryCard.innerHTML = `
            <h4>${country.name.common}</h4>
            <img src="${country.flags.png}" alt="Flag of ${country.name.common}" style="width: 100px;">
            <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
            <p><strong>Area:</strong> ${country.area} km²</p>
            <p><strong>Population:</strong> ${country.population}</p>
            <p><strong>Languages:</strong> ${Object.values(country.languages).join(", ")}</p>
        `;

        countryResultsDiv.appendChild(countryCard);
    });
}

function explorePhrases() {
    var language = document.getElementById("languageInput").value.trim().toLowerCase();
    if (language) {
        var url = "https://www.omniglot.com/language/phrases/" + language + ".php";
        window.open(url, "_blank"); // Open the URL in a new tab
    } else {
        alert("Please enter a language.");
    }
}

function displayError(message) {
    const countryResultsDiv = document.getElementById("country_results");
    countryResultsDiv.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
}



