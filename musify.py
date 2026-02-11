#!/usr/bin/env python3
"""
Musify - A simple music library manager
"""
import json
import os
from pathlib import Path


class MusicLibrary:
    """A simple music library manager."""
    
    def __init__(self, library_file='music_library.json'):
        self.library_file = library_file
        self.songs = self.load_library()
    
    def load_library(self):
        """Load music library from file."""
        if os.path.exists(self.library_file):
            with open(self.library_file, 'r') as f:
                return json.load(f)
        return []
    
    def save_library(self):
        """Save music library to file."""
        with open(self.library_file, 'w') as f:
            json.dump(self.songs, f, indent=2)
    
    def add_song(self, title, artist, album='', duration=''):
        """Add a song to the library."""
        song = {
            'title': title,
            'artist': artist,
            'album': album,
            'duration': duration
        }
        self.songs.append(song)
        self.save_library()
        return song
    
    def list_songs(self):
        """List all songs in the library."""
        return self.songs
    
    def search_songs(self, query):
        """Search for songs by title or artist."""
        query_lower = query.lower()
        return [
            song for song in self.songs
            if query_lower in song['title'].lower() or query_lower in song['artist'].lower()
        ]
    
    def remove_song(self, index):
        """Remove a song from the library by index."""
        if 0 <= index < len(self.songs):
            removed = self.songs.pop(index)
            self.save_library()
            return removed
        return None


def main():
    """Main function to run the music player."""
    library = MusicLibrary()
    
    print("🎵 Welcome to Musify - Free Music Library Manager 🎵")
    print("\nCommands:")
    print("  add - Add a new song")
    print("  list - List all songs")
    print("  search - Search for songs")
    print("  remove - Remove a song")
    print("  quit - Exit the program")
    
    while True:
        print("\n" + "="*50)
        command = input("\nEnter command: ").strip().lower()
        
        if command == 'quit':
            print("Goodbye! 🎵")
            break
        
        elif command == 'add':
            title = input("Song title: ").strip()
            artist = input("Artist: ").strip()
            album = input("Album (optional): ").strip()
            duration = input("Duration (optional): ").strip()
            
            song = library.add_song(title, artist, album, duration)
            print(f"\n✓ Added: {song['title']} by {song['artist']}")
        
        elif command == 'list':
            songs = library.list_songs()
            if not songs:
                print("\nNo songs in library yet.")
            else:
                print(f"\n📚 Your Music Library ({len(songs)} songs):")
                for i, song in enumerate(songs):
                    album_info = f" - {song['album']}" if song['album'] else ""
                    duration_info = f" [{song['duration']}]" if song['duration'] else ""
                    print(f"  {i+1}. {song['title']} by {song['artist']}{album_info}{duration_info}")
        
        elif command == 'search':
            query = input("Search query: ").strip()
            results = library.search_songs(query)
            
            if not results:
                print(f"\nNo songs found matching '{query}'")
            else:
                print(f"\n🔍 Search results for '{query}' ({len(results)} found):")
                for i, song in enumerate(results):
                    album_info = f" - {song['album']}" if song['album'] else ""
                    print(f"  {i+1}. {song['title']} by {song['artist']}{album_info}")
        
        elif command == 'remove':
            songs = library.list_songs()
            if not songs:
                print("\nNo songs in library to remove.")
            else:
                library.list_songs()
                for i, song in enumerate(songs):
                    print(f"  {i+1}. {song['title']} by {song['artist']}")
                
                try:
                    index = int(input("\nEnter song number to remove: ")) - 1
                    removed = library.remove_song(index)
                    if removed:
                        print(f"\n✓ Removed: {removed['title']} by {removed['artist']}")
                    else:
                        print("\n✗ Invalid song number")
                except (ValueError, IndexError):
                    print("\n✗ Invalid input")
        
        else:
            print(f"\n✗ Unknown command: {command}")


if __name__ == '__main__':
    main()
