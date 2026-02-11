# Musify 🎵

A simple, free music library manager built with Python.

## Features

- 📚 Manage your music library
- ➕ Add songs with title, artist, album, and duration
- 🔍 Search for songs by title or artist
- 📋 List all songs in your library
- 🗑️ Remove songs from your library
- 💾 Persistent storage using JSON

## Installation

1. Clone the repository:
```bash
git clone https://github.com/athul-athu/musify.git
cd musify
```

2. Ensure you have Python 3.6 or higher installed:
```bash
python3 --version
```

## Usage

Run the music library manager:
```bash
python3 musify.py
```

### Available Commands

- `add` - Add a new song to your library
- `list` - Display all songs in your library
- `search` - Search for songs by title or artist
- `remove` - Remove a song from your library
- `quit` - Exit the program

## Example

```bash
$ python3 musify.py

🎵 Welcome to Musify - Free Music Library Manager 🎵

Commands:
  add - Add a new song
  list - List all songs
  search - Search for songs
  remove - Remove a song
  quit - Exit the program

Enter command: add
Song title: Bohemian Rhapsody
Artist: Queen
Album (optional): A Night at the Opera
Duration (optional): 5:55

✓ Added: Bohemian Rhapsody by Queen

Enter command: list

📚 Your Music Library (1 songs):
  1. Bohemian Rhapsody by Queen - A Night at the Opera [5:55]
```

## License

Free and open source - enjoy your music! 🎵
