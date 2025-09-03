import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetches the list of all blog posts, with all their translations nested.
export const getBlogs = async () => {
    const response = await axios.get(`${API_URL}/api/blog/`);
    return response.data;
};

// Fetches a single blog post, for a specific language.
export const getBlogBySlug = async (slug: string, language: string) => {
    const response = await axios.get(`${API_URL}/api/blog/${slug}/?lang=${language}`);
    return response.data;
};

// Fetches all blog post slugs for building static paths.
export const getAllBlogSlugs = async () => {
    const response = await axios.get(`${API_URL}/api/blog/`); 
    return response.data.map((blog: any) => ({
        params: { slug: blog.slug },
    }));
};