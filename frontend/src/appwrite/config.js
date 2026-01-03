import conf from '../conf/conf.js';
import cookieService from '../utils/cookieService.js';
import { debugLog } from '../utils/logger.js';

export class Service {

    async createNote(audioFile) {
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);

            const response = await fetch(`${conf.backendUrl}/api/v1/note/create-note`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                return data.data.note;
            } else {
                throw new Error(data.message || 'Create note failed');
            }
        } catch (error) {
            console.error('Service :: createNote :: error', error);
            throw error;
        }
    }

    async createNoteFromText(textContent, title = '') {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/create-note-by-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: textContent,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                return data.data.note;
            } else {
                throw new Error(data.message || 'Create note from text failed');
            }
        } catch (error) {
            console.error('Service :: createNoteFromText :: error', error);
            throw error;
        }
    }

    async createNoteFromFile(textFile) {
        try {
            const formData = new FormData();
            formData.append('file', textFile);

            const response = await fetch(`${conf.backendUrl}/api/v1/note/create-note-by-file`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                return data.data.note;
            } else {
                throw new Error(data.message || 'Create note from file failed');
            }
        } catch (error) {
            console.error('Service :: createNoteFromFile :: error', error);
            throw error;
        }
    }

    async updateNote(noteId, {title, description, isPublic, content}) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/update-noteinfo/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    description,
                    isPublic,
                    content,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Update note failed');
            }
        } catch (error) {
            console.error('Service :: updateNote :: error', error);
            throw error;
        }
    }

    async deleteNote(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/delete-note/${noteId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Delete note failed');
            }
        } catch (error) {
            console.error('Service :: deleteNote :: error', error);
            return false;
        }
    }

    async getNote(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/n/${noteId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                let payload = data.data;
                return Array.isArray(payload) ? (payload[0] || null) : payload;
            } else {
                throw new Error(data.message || `Get note failed (${response.status})`);
            }
        } catch (error) {
            console.error('Service :: getNote :: error', error);
            throw error;
        }
    }

    async getNotes() {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/get-notes`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                if (data.data && data.data.notes) {
                    return { documents: data.data.notes, total: data.data.notesCount || data.data.notes.length };
                } else if (data.data && Array.isArray(data.data)) {
                    return { documents: data.data, total: data.data.length };
                } else if (Array.isArray(data.data)) {
                    return { documents: data.data, total: data.data.length };
                } else {
                    console.warn('Unexpected getNotes response format:', data);
                    return { documents: [], total: 0 };
                }
            } else {
                console.error('Failed to fetch notes:', data?.message, data)
                throw new Error(data.message || 'Get notes failed');
            }
        } catch (error) {
            console.error('Service :: getNotes :: error', error);
            return { documents: [], total: 0 };
        }
    }
    async createNoteVersion(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/create-new-version-note/${noteId}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Create note version failed');
            }
        } catch (error) {
            console.error('Service :: createNoteVersion :: error', error);
            throw error;
        }
    }

    async starNoteVersion(noteId, noteVersionId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/star-note/${noteId}/${noteVersionId}`, {
                method: 'PATCH',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Star note version failed');
            }
        } catch (error) {
            console.error('Service :: starNoteVersion :: error', error);
            throw error;
        }
    }

    async deleteNoteVersion(noteId, noteVersionId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/delete-note-version/${noteId}/${noteVersionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Delete note version failed');
            }
        } catch (error) {
            console.error('Service :: deleteNoteVersion :: error', error);
            return false;
        }
    }

    async getNoteVersions(noteId) {
        try {
            let response = await fetch(`${conf.backendUrl}/api/v1/note/get-note-versions/${noteId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.data;
            }

            response = await fetch(`${conf.backendUrl}/api/v1/note/n/${noteId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                let payload = data.data;
                if (Array.isArray(payload)) payload = payload[0] || null;
                if (!payload) return null;

                if (payload.noteVersions) {
                    return { versions: payload.noteVersions };
                }
                return { versions: [] };
            } else {
                throw new Error(data.message || `Get note versions failed (${response.status})`);
            }
        } catch (error) {
            console.error('Service :: getNoteVersions :: error', error);
            throw error;
        }
    }
    async getUserPublicNotes(username) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/u/${username}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get user public notes failed');
            }
        } catch (error) {
            console.error('Service :: getUserPublicNotes :: error', error);
            return false;
        }
    }

    async getPublicNotesFeed(page = 1, limit = 20, sortBy = 'newest', filterBy = 'all', search = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                filterBy,
                ...(search && { search })
            });
            
            const response = await fetch(`${conf.backendUrl}/api/v1/note/public-notes?${params}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get public notes feed failed');
            }
        } catch (error) {
            console.error('Service :: getPublicNotesFeed :: error', error);
            return false;
        }
    }
    async uploadFile(file) {
        try {
            const accessToken = cookieService.getAccessToken();
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch(`${conf.backendUrl}/api/v1/file/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Upload file failed');
            }
        } catch (error) {
            console.error('Service :: uploadFile :: error', error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/file/delete/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Delete file failed');
            }
        } catch (error) {
            console.error('Service :: deleteFile :: error', error);
            return false;
        }
    }

    getFilePreview(fileId) {
        return `${conf.backendUrl}/api/v1/file/preview/${fileId}`;
    }
    async createPlaylist({name, description, isPublic, tags}) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/create-playlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({name, description, isPublic, tags}),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Create playlist failed');
            }
        } catch (error) {
            console.error('Service :: createPlaylist :: error', error);
            throw error;
        }
    }

    async updatePlaylist(playlistId, {name, description, isPublic, tags}) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/update-playlist/${playlistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({name, description, isPublic, tags}),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Update playlist failed');
            }
        } catch (error) {
            console.error('Service :: updatePlaylist :: error', error);
            throw error;
        }
    }

    async deletePlaylist(playlistId) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/delete-playlist/${playlistId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Delete playlist failed');
            }
        } catch (error) {
            console.error('Service :: deletePlaylist :: error', error);
            return false;
        }
    }

    async getPlaylists() {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/get-playlist-by-user`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return { documents: data.data };
            } else {
                throw new Error(data.message || 'Get playlists failed');
            }
        } catch (error) {
            console.error('Service :: getPlaylists :: error', error);
            return false;
        }
    }

    async getPlaylist(playlistId) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/get-playlist/${playlistId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get playlist failed');
            }
        } catch (error) {
            console.error('Service :: getPlaylist :: error', error);
            return false;
        }
    }

    async getUserPublicPlaylists(username) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/user/${username}/public`, {
                method: 'GET',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get user public playlists failed');
            }
        } catch (error) {
            console.error('Service :: getUserPublicPlaylists :: error', error);
            return false;
        }
    }

    async addNoteToPlaylist(playlistId, noteId) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/add-note/${playlistId}/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Add note to playlist failed');
            }
        } catch (error) {
            console.error('Service :: addNoteToPlaylist :: error', error);
            throw error;
        }
    }

    async removeNoteFromPlaylist(playlistId, noteId) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/playlist/remove-note/${playlistId}/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Remove note from playlist failed');
            }
        } catch (error) {
            console.error('Service :: removeNoteFromPlaylist :: error', error);
            throw error;
        }
    }
    async increaseClap(noteId, amount = 1) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/clap/increment/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount }),
            });
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Increase clap failed');
            }
        } catch (error) {
            console.error('Service :: increaseClap :: error', error);
            throw error;
        }
    }

    async decreaseClap(noteId, amount = 1) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/clap/decrement/${noteId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ amount }),
            });
            const data = await response.json();
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Decrease clap failed');
            }
        } catch (error) {
            console.error('Service :: decreaseClap :: error', error);
            throw error;
        }
    }

    async getClaps(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/clap/get-claps/${noteId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || `Get claps failed (${response.status})`);
            }
        } catch (error) {
            console.error('Service :: getClaps :: error', error);
            throw error;
        }
    }

    async getWatchHistory() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/watch-history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get watch history failed');
            }
        } catch (error) {
            console.error('Service :: getWatchHistory :: error', error);
            throw error;
        }
    }

    async getUserNotes() {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/user-notes`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                if (data.data && data.data.notes) {
                    return { documents: data.data.notes, total: data.data.notesCount || data.data.notes.length };
                } else if (data.data && Array.isArray(data.data)) {
                    return { documents: data.data, total: data.data.length };
                } else {
                    return { documents: [], total: 0 };
                }
            } else {
                throw new Error(data.message || 'Get user notes failed');
            }
        } catch (error) {
            console.error('Service :: getUserNotes :: error', error);
            return { documents: [], total: 0 };
        }
    }
    async getTotalClapsForUser(userId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/clap/total-claps/${userId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get user total claps failed');
            }
        } catch (error) {
            console.error('Service :: getTotalClapsForUser :: error', error);
            return { totalClaps: 0 };
        }
    }
    async getUserProfile(username) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/note/u/${username}`, {
                method: 'GET',
            });
            const data = await response.json();
            debugLog('Service :: getUserProfile :: response', data);
            if (response.ok) {
                return data.data[0];
            } else {
                throw new Error(data.message || 'Get user profile failed');
            }
        } catch (error) {
            console.error('Service :: getUserProfile :: error', error);
            return false;
        }
    }

    async followUser(username) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/follow/${username}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Follow user failed');
            }
        } catch (error) {
            console.error('Service :: followUser :: error', error);
            throw error;
        }
    }

    async unfollowUser(username) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/unfollow/${username}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Unfollow user failed');
            }
        } catch (error) {
            console.error('Service :: unfollowUser :: error', error);
            throw error;
        }
    }

    async getUserSettings() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get user settings failed');
            }
        } catch (error) {
            console.error('Service :: getUserSettings :: error', error);
            return false;
        }
    }

    async updateUserSettings(settings) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Update user settings failed');
            }
        } catch (error) {
            console.error('Service :: updateUserSettings :: error', error);
            throw error;
        }
    }

    async exportUserData() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/export-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                return response.blob(); // Return blob for file download
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Export user data failed');
            }
        } catch (error) {
            console.error('Service :: exportUserData :: error', error);
            throw error;
        }
    }

    async deleteUserAccount() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Delete account failed');
            }
        } catch (error) {
            console.error('Service :: deleteUserAccount :: error', error);
            return false;
        }
    }

    async enableTwoFactorAuth() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/enable-2fa`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Enable 2FA failed');
            }
        } catch (error) {
            console.error('Service :: enableTwoFactorAuth :: error', error);
            throw error;
        }
    }

    async disableTwoFactorAuth() {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/disable-2fa`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                return true;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Disable 2FA failed');
            }
        } catch (error) {
            console.error('Service :: disableTwoFactorAuth :: error', error);
            return false;
        }
    }

    async updateNotificationSettings(notificationSettings) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/notification-settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(notificationSettings),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Update notification settings failed');
            }
        } catch (error) {
            console.error('Service :: updateNotificationSettings :: error', error);
            throw error;
        }
    }

    async updatePrivacySettings(privacySettings) {
        try {
            const accessToken = cookieService.getAccessToken();
            const response = await fetch(`${conf.backendUrl}/api/v1/user/privacy-settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(privacySettings),
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Update privacy settings failed');
            }
        } catch (error) {
            console.error('Service :: updatePrivacySettings :: error', error);
            throw error;
        }
    }
    async getQuiz(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/quiz/get-quiz/${noteId}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Get quiz failed');
            }
        } catch (error) {
            console.error('Service :: getQuiz :: error', error);
            throw error;
        }
    }

    async createQuiz(noteId, quantity = 10) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/quiz/create-quiz/${noteId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    quantity: quantity
                })
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Create quiz failed');
            }
        } catch (error) {
            console.error('Service :: createQuiz :: error', error);
            throw error;
        }
    }

    async deleteQuiz(noteId) {
        try {
            const response = await fetch(`${conf.backendUrl}/api/v1/quiz/delete-quiz/${noteId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();
            if (response.ok) {
                return data.data;
            } else {
                throw new Error(data.message || 'Delete quiz failed');
            }
        } catch (error) {
            console.error('Service :: deleteQuiz :: error', error);
            throw error;
        }
    }
}

const service = new Service();
export default service
