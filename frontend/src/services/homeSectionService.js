import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/home-sections`;

const homeSectionService = {
    getPublicSections: async () => {
        const res = await axios.get(`${API_URL}/public`);
        return res.data;
    },
    getAllSections: async () => {
        const res = await axios.get(API_URL, { withCredentials: true });
        return res.data;
    },
    upsertSection: async (formData) => {
        const res = await axios.post(API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        });
        return res.data;
    }
};

export default homeSectionService;
