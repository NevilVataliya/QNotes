import conf from '../conf/conf.js';

const API_BASE_URL = `${conf.backendUrl}/api/v1/playlist`;

class PlaylistService {
    async createPlaylist(playlistData) {
        try {
            const response = await fetch(`${API_BASE_URL}/create-playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Use httpOnly cookies
                body: JSON.stringify(playlistData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create playlist');
            }

            return result;
        } catch (error) {
            console.error('Create playlist error:', error);
            throw error;
        }
    }

    async getPlaylistsByUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/get-playlist-by-user`, {
                method: 'GET',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch playlists');
            }

            return result;
        } catch (error) {
            console.error('Get playlists error:', error);
            throw error;
        }
    }

    async getPlaylistByUsername(username) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-playlist-by-username/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch public playlists');
            }

            return result;
        } catch (error) {
            console.error('Get public playlists error:', error);
            throw error;
        }
    }

    async getNotesByPlaylistId(playlistId) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-playlist/${playlistId}`, {
                method: 'GET',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch playlist notes');
            }

            return result;
        } catch (error) {
            console.error('Get playlist notes error:', error);
            throw error;
        }
    }

    async addNote(playlistId, noteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/add-note/${playlistId}/${noteId}`, {
                method: 'PUT',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to add note to playlist');
            }

            return result;
        } catch (error) {
            console.error('Add note to playlist error:', error);
            throw error;
        }
    }

    async getPlaylist(playlistId) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-playlist/${playlistId}`, {
                method: 'GET',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to get playlist');
            }

            return result.data;
        } catch (error) {
            console.error('Get playlist error:', error);
            throw error;
        }
    }

    async removeNote(playlistId, noteId) {
        try {
            const response = await fetch(`${API_BASE_URL}/remove-note/${playlistId}/${noteId}`, {
                method: 'DELETE',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to remove note from playlist');
            }

            return result;
        } catch (error) {
            console.error('Remove note from playlist error:', error);
            throw error;
        }
    }

    async updatePlaylistInfo(playlistId, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/update-playlist/${playlistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Use httpOnly cookies
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update playlist');
            }

            return result;
        } catch (error) {
            console.error('Update playlist error:', error);
            throw error;
        }
    }

    async deletePlaylist(playlistId) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete-playlist/${playlistId}`, {
                method: 'DELETE',
                credentials: 'include' // Use httpOnly cookies
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete playlist');
            }

            return result;
        } catch (error) {
            console.error('Delete playlist error:', error);
            throw error;
        }
    }
}

const playlistService = new PlaylistService();
export default playlistService;
