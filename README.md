# Spotify Music Visualization

https://geanum.github.io/SpotifyMusicVisualization/

This is a javascript application that is used to help visualize a user's Spotify songs and playlists.
This was developed by the four of us over a period of a about a week for our Information Interfaces course.
The application uses Spotify's development API and D3.js to power all of its visualization tools. 

## Features

**Scatterplot:** The scatterplot gives a overview of the entire selected playlist. Users are able to select which attributes
each axis represents, allowing them to explore and discover trends within the playlist or their own musical taste.

**RadialChart:** This chart gives a basic picture of what type of attributes reside within each playlist. 

**SongVisualization:** This is a novel visualization that uses Spotify's track analysis to create a more abstract representation
of a song. The more 'outward' a line appears corresponds to the dominance of that particular pitch during that segment of the song.

Attributes from Spotify are used throughout the visualization. Here's a basic explanation of each of them:
- *Danceability:* Describes how suitable a track is for dancing
- *Valence:* Measure of how 'Happy' a song feels
- *Tempo:* Overall estimated tempo of a track in beats per minute
- *Energy:* Represents a perceptual measure of intensity and activity
- *Popularity:* Measure of a song's popularity

## Current Issues

- ``` 504 Gateway Error ``` : Usually caused by Spotify's servers take too long to respond and/or a shoddy internet connection
- Things stop working and/or constant 504 error: Authentication token expired. Fix by just going back to home page and relogging
- Currently, the Song Visualization incorporates song segment data that is above a certain confidence threshold (95%).
This causes some portions of songs to look misrepresentative of how they actually sound. 
- Additionally, the Song Visualization looks very busy for some songs making it difficult to follow. Refining how we represent 
and display the music data (incorporating the use of beats/timbre/etc) may help to alleviate this.
- Only first 100 songs of playlist are currently available
- Cannot analyze playlists that user did not create

## Potential Improvements / Things to do

- Make an expired authentication state for client
- Move Scatterplot's Y-Axis selector next to the y-axis for better user interface
- Paginate the playlist songs to allow for more than only 100 songs from a playlist
- Feature to search for specific songs
- Feature to analyze non-user playlists
- Feature to analyze last 50 songs user played
- Make song visualization more robust
- Modularize and clean up all code

## Some Credits/References

- Spotify Developer API: https://developer.spotify.com/web-api/
- Spotify JS Wrappers: https://github.com/jmperez/spotify-web-api-js
