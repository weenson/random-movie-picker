async function getMovieData(){
    const randomPage = Math.floor(Math.random() * 500) + 1; 
    const url = `https://api.themoviedb.org/3/discover/movie?page=${randomPage}&with_original_language=en`;
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`  
        }
    };
     
    try {
        const request = await fetch(url, options);
        const data = await request.json();
        const movies = data.results;
        const randomMovie = movies[Math.floor(Math.random() * movies.length)];
        const movieDetails = await getMovieDetails(randomMovie.id);
        const trailerKey = await getTrailerVideo(randomMovie.id);
        const reviews = await getReviews(randomMovie.id);
        const genres = await getMovieGenres();

        displayMovie(movieDetails, trailerKey, genres); 
        displayTrailer(trailerKey, reviews);
    } catch(err) {
        console.error('Error fetching data', err);
    }
}

async function getMovieDetails(movie_id){
    const url = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch(err) {
        console.error('Error fetching details', err);
    }
}

async function getMovieGenres(){
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${key}`
    
    try {
        const request = await fetch(url);
        const data = await request.json();
        return data.genres;
    } catch{
        console.error('Error fetching genres', err);
    }
}

async function getTrailerVideo(movie_id){
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/videos?api_key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        return trailer ? trailer.key : null;
    } catch(err) {
        console.error('Error fetching trailer', err);
    }
}

async function getReviews(movie_id){
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch(err) {
        console.error('Error fetching trailer', err);
    }
}

function displayMovie(movie, trailerKey) {
    const bodyMovie = document.getElementById('body-movie');
    const footerClass = document.querySelector('footer');
    bodyMovie.classList.add('visible');
    document.body.classList.remove('full-height');
    footerClass.classList.remove('remove-class');
    
    bodyMovie.innerHTML = '';
      if (movie.backdrop_path) {
        bodyMovie.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`;
        bodyMovie.style.backgroundSize = 'cover';
        bodyMovie.style.backgroundPosition = 'center';
    }

    // MAKES CONTAINER VISIBLE
    bodyMovie.classList.add('visible');
    
    const genreNames = movie.genres.map(genre => genre.name).join(', ');

    const movieHTML = `
    <div class="image">
        <img class="movie-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
    </div>
    <div class="movie-details-wrapper">
        <div class="movie-details">
            <h1 id="movie-title">${movie.title}</h1>
            <div class="movie-info">
                <p id="movie-release-date"><i class="fa-solid fa-calendar-days"></i> ${movie.release_date}</p>
                <p id="movie-runtime"><i class="fa-solid fa-clock"></i> ${movie.runtime} Minutes</p>
                <p id="movie-average-score"><i class="fa-solid fa-star"></i> ${movie.vote_average.toFixed(2)}</p>
                <p id="movie-genres"><i class="fa-solid fa-tags"></i> ${genreNames}</p>
            </div>
        </div>
    <div class="movie-overview">
        <p id="movie-overview">${movie.overview}</p>
        </div>
        <div class="user-interaction">
            <a href="https://www.themoviedb.org/movie/${movie.id}" target="_blank"> <i class="fa-solid fa-circle-info"></i> More Info</a>
            ${trailerKey ? `<a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank"> <i class="fa-solid fa-play"></i> Play Trailer</a>` : ''}
        </div>
    </div>
    `;
    
    bodyMovie.innerHTML = movieHTML;
}

function parseMarkdown(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    return text;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}



function displayTrailer(trailerKey, reviews){
    const trailerBody = document.getElementById("trailer-show");
    trailerBody.innerHTML="";
    const firstReview = reviews.length > 0 ? reviews[0] : null;

    const trailerHTML = `
    <div>
    ${trailerKey ? 
        `<iframe width="640" height="360" src="https://www.youtube.com/embed/${trailerKey}"></iframe>` : '' }
    </div>
      <div class="review-box">
        ${firstReview ? `
            <div class="review-item">
                <div class="review-item-head">
                   <img class="profile-icon" src="${firstReview.author_details.avatar_path ? `https://image.tmdb.org/t/p/w45${firstReview.author_details.avatar_path}` : 'defaultprofile.webp'}" alt="${firstReview.author_details.avatar_path ? firstReview.author : 'defaultprofile.webp'}">
                     <div class="profile-info">
                        <p><strong> A Review by ${firstReview.author}</strong></p>
                            <div class="profile-info-details">
                              <p><i class="fa-solid fa-star"></i> <strong>${firstReview.author_details.rating ? firstReview.author_details.rating.toFixed(1) : 'N/A'}</strong></p>
                                <p>${formatDate(firstReview.created_at)}</p>
                            </div>
                    </div>
                </div>
                    <p>${parseMarkdown(firstReview.content)}</p>
            </div>
        ` : '<p>No reviews available.</p>'}
    </div>
    
    `;
    trailerBody.innerHTML = trailerHTML;
}

document.querySelector(".submitBtn").addEventListener('click', getMovieData);