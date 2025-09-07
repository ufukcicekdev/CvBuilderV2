import React from 'react';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

// MUI Imports
import { Container, Grid, Typography, Box } from '@mui/material';

import SEO from '@/components/SEO';
import { getBlogs } from '../../services/blogService';
import BlogCard from '../../components/BlogCard';


// Interfaces based on the new serializers
interface Translation {
    language: string;
    title: string;
    content: string;
}

interface BlogPost {
    id: number;
    slug: string;
    translations: Translation[];
    created_at: string;
    view_count: number;
}

interface BlogPageProps {
    posts: BlogPost[];
}


const BlogPage: React.FC<BlogPageProps> = ({ posts }) => {
    const { t } = useTranslation('common');

    return (
        <Layout>
            <SEO 
                title={t('blog.title')}
                description={t('blog.pageDescription')}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Container maxWidth="lg" sx={{ my: { xs: 10, md: 15 } }}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
                        {t('blog.title')}
                    </Typography>
                    {posts.length > 0 ? (
                        <Grid container spacing={4}>
                            {posts.map(post => (
                                <Grid item key={post.id} xs={12} sm={6} md={4}>
                                    <BlogCard post={post} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box textAlign="center" mt={5}>
                            <Typography>{t('blog.no_posts')}</Typography>
                        </Box>
                    )}
                </Container>
            </motion.div>
        </Layout>
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
