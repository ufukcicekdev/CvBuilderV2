import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { getBlogs } from '../../services/blogService';
import BlogCard from '../../components/BlogCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar'; // Assuming Navbar is the correct header

// Interfaces based on the new serializers
interface Translation {
    language: string;
    title: string;
}

interface BlogPost {
    id: number;
    slug: string;
    translations: Translation[];
    created_at: string;
}

interface BlogPageProps {
    posts: BlogPost[];
}

const BlogPage: React.FC<BlogPageProps> = ({ posts }) => {
    const { t } = useTranslation('common');

    return (
        <>
            <Navbar />
            <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '100px auto' }}>
                <h1>{t('blog.title', 'Blog')}</h1>
                <div>
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <BlogCard 
                                key={post.id} 
                                post={post} 
                            />
                        ))
                    ) : (
                        <p>{t('blog.no_posts', 'No blog posts found.')}</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    try {
        const posts = await getBlogs();
        return {
            props: {
                posts,
                ...(await serverSideTranslations(locale || 'tr', ['common'])),
            },
            revalidate: 60, // Re-generate the page every 60 seconds
        };
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return {
            props: {
                posts: [],
                ...(await serverSideTranslations(locale || 'tr', ['common'])),
            },
        };
    }
};

export default BlogPage;