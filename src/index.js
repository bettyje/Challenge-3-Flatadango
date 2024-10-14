// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    fetchAllMovies(); // Fetch all movies when the page loads
    fetchMovieDetails(1); // Fetch details for the first movie
});

// Fetch all movies and populate the list
function fetchAllMovies() {
    fetch("http://localhost:3000/films")
        .then(response => response.json())
        .then(movies => {
            const filmsList = document.getElementById("films");
            filmsList.innerHTML = ""; // Clear existing items
            movies.forEach(movie => {
                const li = document.createElement("li");
                li.className = "film item";
                li.innerText = movie.title;
                li.dataset.id = movie.id; // Store the movie ID
                filmsList.appendChild(li);

                // Add click event to fetch movie details when a movie is clicked
                li.addEventListener("click", () => fetchMovieDetails(movie.id));
            });
        });
}

// Fetch and display movie details
function fetchMovieDetails(id) {
    fetch(`http://localhost:3000/films/${id}`)
        .then(response => response.json())
        .then(movie => {
            const availableTickets = movie.capacity - movie.tickets_sold;
            document.getElementById("title").innerText = movie.title;
            document.getElementById("runtime").innerText = `${movie.runtime} minutes`;
            document.getElementById("poster").src = movie.poster;
            document.getElementById("film-info").innerText = movie.description;
            document.getElementById("showtime").innerText = movie.showtime;
            document.getElementById("ticket-num").innerText = `${availableTickets} remaining tickets`;

            const buyTicketButton = document.getElementById("buy-ticket");
            buyTicketButton.disabled = availableTickets === 0; // Disable button if sold out
            buyTicketButton.innerText = availableTickets === 0 ? "Sold Out" : "Buy Ticket";

            // Add click event for buying tickets
            buyTicketButton.onclick = () => {
                if (availableTickets > 0) {
                    buyTicket(movie);
                }
            };
        });
}

// Function to buy a ticket
function buyTicket(movie) {
    const newTicketsSold = movie.tickets_sold + 1;

    // Update the number of tickets sold on the server
    fetch(`http://localhost:3000/films/${movie.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: newTicketsSold }),
    })
    .then(response => response.json())
    .then(updatedMovie => {
        const availableTickets = updatedMovie.capacity - updatedMovie.tickets_sold;
        document.getElementById("ticket-num").innerText = `${availableTickets} remaining tickets`;
        document.getElementById("buy-ticket").innerText = availableTickets === 0 ? "Sold Out" : "Buy Ticket";

        // Check if sold out
        if (availableTickets === 0) {
            document.querySelector(`li[data-id="${updatedMovie.id}"]`).classList.add("sold-out");
        }
    });

    // Optionally, you can add a POST request here to log the ticket purchase
}

// Function to delete a film
function deleteFilm(id) {
    fetch(`http://localhost:3000/films/${id}`, {
        method: 'DELETE',
    })
    .then(() => {
        fetchAllMovies(); // Refresh the list of movies
    });
}

