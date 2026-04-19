// Profile API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ProfileService {
    getAuthHeader() {
        const token = localStorage.getItem('factsscan_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async getProfile() {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    ...this.getAuthHeader()
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load profile');

            // Also cache locally
            if (data.profile) {
                localStorage.setItem('factsscan_profile', JSON.stringify(data.profile));
                // Import dynamically to avoid circular dependency
                import('./historyService').then(mod => {
                    mod.default.syncDataFromServer(data.profile);
                });
            }
            return { success: true, profile: data.profile };
        } catch (error) {
            // Fallback to local cache
            const cached = this.getCachedProfile();
            if (cached) {
                return { success: true, profile: cached, fromCache: true };
            }
            return { success: false, error: error.message };
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');

            // Update local cache
            if (data.profile) {
                localStorage.setItem('factsscan_profile', JSON.stringify(data.profile));
                // Also update user display name in auth storage
                const user = JSON.parse(localStorage.getItem('factsscan_user') || '{}');
                if (profileData.firstName) user.firstName = profileData.firstName;
                if (profileData.lastName) user.lastName = profileData.lastName;
                localStorage.setItem('factsscan_user', JSON.stringify(user));
            }
            return { success: true, profile: data.profile };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async removeTemporaryIssue(issue) {
        try {
            const response = await fetch(`${API_URL}/profile/temporary-issue`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeader()
                },
                body: JSON.stringify({ issue })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed');

            if (data.profile) {
                localStorage.setItem('factsscan_profile', JSON.stringify(data.profile));
            }
            return { success: true, profile: data.profile };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getCachedProfile() {
        try {
            const str = localStorage.getItem('factsscan_profile');
            return str ? JSON.parse(str) : null;
        } catch {
            return null;
        }
    }

    clearProfile() {
        localStorage.removeItem('factsscan_profile');
    }
}

const profileService = new ProfileService();
export default profileService;
